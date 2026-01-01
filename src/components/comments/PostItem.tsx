'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostWithUser } from './types';
import { CommentItem } from './CommentItem';
import { LikeButton } from './LikeButton';
import { togglePostLike, deletePost, createComment } from '@/actions/comments';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { CircleIconButton } from '@/components/ui/CircleIconButton';

interface PostItemProps {
    post: PostWithUser;
    currentUser: any;
    isAdmin: boolean;
    isEditing: boolean;
}

export function PostItem({ post, currentUser, isAdmin, isEditing }: PostItemProps) {
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [commentContent, setCommentContent] = useState('');
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const handleLike = () => {
        if (!currentUser) {
            alert('Please sign in to like posts');
            return;
        }
        startTransition(async () => {
            await togglePostLike(post.id, pathname);
        });
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        startTransition(async () => {
            await deletePost(post.id, pathname);
        });
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        // Guest check handled by not rendering form or disabling, but for safety:
        if (!currentUser) {
            alert('Please sign in to comment');
            return;
        }

        setIsSubmittingComment(true);
        try {
            await createComment(post.id, commentContent, pathname);
            setCommentContent('');
            setShowCommentForm(false);
        } catch (error) {
            console.error(error);
            alert('Failed to post comment');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const isAuthor = currentUser?.id === post.user.id;
    const canDelete = isAuthor || (isAdmin && isEditing);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all shadow-lg backdrop-blur-sm"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                            {post.user.avatar ? (
                                <img src={post.user.avatar} alt={post.user.displayName || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-white">{(post.user.displayName?.[0] || post.user.username?.[0] || 'U').toUpperCase()}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-text-primary">
                            {post.user.displayName || post.user.username}
                            {post.user.role === 'admin' && <span className="ml-2 text-xs bg-coral text-white px-2 py-0.5 rounded-full">ADMIN</span>}
                        </h3>
                        <p className="text-xs text-text-muted">{new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString()}</p>
                    </div>
                </div>

                {isAdmin && isEditing && (
                    <CircleIconButton
                        onClick={handleDelete}
                        className="text-red-400 hover:text-red-500"
                        title="Delete Post"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </CircleIconButton>
                )}
            </div>

            {/* Content */}
            <div className="mb-4 pl-13">
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-3 border-t border-white/5 mx-1">
                <LikeButton
                    isLiked={post.isLikedByCurrentUser}
                    count={post.likeCount}
                    onClick={handleLike}
                />

                <button
                    onClick={() => {
                        if (!currentUser) {
                            alert('Please sign in to comment');
                        } else {
                            setShowCommentForm(!showCommentForm);
                        }
                    }}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                    <span className="text-lg">💬</span>
                    <span>{post.comments.length} Comments</span>
                </button>
            </div>

            {/* Comment Form */}
            <AnimatePresence>
                {showCommentForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-3">
                            <textarea
                                value={commentContent}
                                onChange={e => setCommentContent(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-coral focus:outline-none text-sm resize-none h-12 min-h-[48px]"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!commentContent.trim() || isSubmittingComment}
                                className="px-4 rounded-xl bg-coral text-white font-medium text-sm hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed h-12"
                            >
                                Send
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comments List */}
            {post.comments.length > 0 && (
                <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/5">
                    {post.comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            isEditing={isEditing}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
