'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CommentWithUser } from './types';
import { LikeButton } from './LikeButton';
import { startTransition } from 'react';
import { toggleCommentLike, deleteComment } from '@/actions/comments';
import { usePathname } from 'next/navigation';

interface CommentItemProps {
    comment: CommentWithUser;
    currentUser: any; // User type from session
    isAdmin: boolean;
    isEditing: boolean;
}

export function CommentItem({ comment, currentUser, isAdmin, isEditing }: CommentItemProps) {
    const pathname = usePathname();
    // Optimistic state could be implemented, but relying on server revalidation for now
    const handleLike = async () => {
        if (!currentUser) return; // Should show login modal? Handled by parent or toast?
        // Parent should handle "guest restriction". Here assuming logged in if user can click?
        // Actually, user said "Visitor... click send... prompt sign in".
        // For Like, usually same, but maybe silent fail or prompt.
        // I'll leave prompt logic to a central handler or just not render button if not logged in?
        // Usually read-only for guests.

        await toggleCommentLike(comment.id, pathname);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        await deleteComment(comment.id, pathname);
    };

    const isAuthor = currentUser?.id === comment.user.id;
    const canDelete = isAuthor || (isAdmin && isEditing);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
        >
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300 overflow-hidden">
                {comment.user.avatar ? (
                    <img src={comment.user.avatar} alt={comment.user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                    (comment.user.displayName?.[0] || comment.user.username?.[0] || 'U').toUpperCase()
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-text-primary">
                        {comment.user.displayName || comment.user.username}
                        {comment.user.role === 'admin' && <span className="ml-1 text-[10px] bg-coral/20 text-coral px-1.5 py-0.5 rounded-full">ADMIN</span>}
                    </span>
                    <span className="text-xs text-text-muted">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed break-words mb-2">
                    {comment.content}
                </p>

                <div className="flex items-center justify-between">
                    <LikeButton
                        isLiked={comment.isLikedByCurrentUser}
                        count={comment.likeCount}
                        onClick={() => {
                            if (!currentUser) {
                                alert('Please sign in to like comments');
                                return;
                            }
                            startTransition(() => {
                                handleLike();
                            });
                        }}
                    />

                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            className="text-xs text-red-400 hover:text-red-300 hover:underline"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
