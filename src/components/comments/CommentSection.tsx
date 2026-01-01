'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PostWithUser } from './types';
import { PostItem } from './PostItem';
import { createPost } from '@/actions/comments';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTranslations } from 'next-intl';

interface CommentSectionProps {
    lessonId: string;
    currentUser: any; // User session object
    posts: PostWithUser[];
    isEditing?: boolean;
}

export function CommentSection({ lessonId, currentUser, posts, isEditing = false }: CommentSectionProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const t = useTranslations('comments');

    // Safety check for isEditing if not passed explicitly (though props are better)
    const isEditMode = isEditing || searchParams.get('edit') === 'true';
    const isAdmin = currentUser?.role === 'admin';

    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            if (confirm(t('message.loginToPost'))) {
                router.push('/auth/login');
            }
            return;
        }

        if (!newPostContent.trim()) return;

        setIsSubmitting(true);
        try {
            await createPost(lessonId, newPostContent, pathname);
            setNewPostContent('');
        } catch (error) {
            console.error('Failed to create post:', error);
            alert(t('message.postFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-coral to-orange-400 bg-clip-text text-transparent">
                    {t('title')}
                </h2>
                <div className="h-px flex-1 bg-white/10"></div>
            </div>

            {/* New Post Input */}
            <GlassCard className="p-6 mb-8" hover={false}>
                <form onSubmit={handlePostSubmit}>
                    <div>
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            onClick={() => {
                                if (!currentUser) {
                                    if (confirm(t('message.loginToPost'))) {
                                        router.push('/auth/login');
                                    }
                                    // Blur to prevent typing
                                    (document.activeElement as HTMLElement)?.blur();
                                }
                            }}
                            placeholder={currentUser ? t('placeholder') : t('signInPrompt')}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-coral focus:outline-none resize-none h-24 mb-3 transition-colors"
                        />
                        <div className="flex justify-end">
                            <motion.button
                                type="submit"
                                disabled={isSubmitting || !newPostContent.trim() || !currentUser}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-2 rounded-xl bg-coral text-white font-medium hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-coral/20"
                            >
                                {isSubmitting ? t('button.posting') : t('button.submit')}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </GlassCard>

            {/* Posts Feed */}
            <div className="space-y-6">
                {posts.length === 0 ? (
                    <div className="text-center py-12 text-text-muted bg-white/5 rounded-2xl border border-white/5">
                        <p>{t('empty')}</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <PostItem
                            key={post.id}
                            post={post}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            isEditing={isEditMode}
                        />
                    ))
                )}
            </div>
        </div >
    );
}
