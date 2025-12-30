'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import { filterKeywords } from '@/lib/utils/keywordFilter';

interface Comment {
    id: string;
    content: string;
    author: string;
    createdAt: Date;
}

interface CommentSectionProps {
    resourceId: string;
    isLoggedIn?: boolean;
    userEmail?: string;
}

// Mock 评论数据
const mockComments: Comment[] = [
    {
        id: '1',
        content: '这节课太棒了！学到了很多！',
        author: 'user1@example.com',
        createdAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        content: 'Great lesson! Very helpful!',
        author: 'user2@example.com',
        createdAt: new Date('2024-01-16'),
    },
];

export function CommentSection({ resourceId, isLoggedIn = false, userEmail }: CommentSectionProps) {
    const t = useTranslations('comments');
    const [comments, setComments] = useState<Comment[]>(mockComments);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newComment.trim()) return;

        // 关键词过滤
        const filterResult = filterKeywords(newComment);
        if (!filterResult.isClean) {
            setError(`评论包含敏感内容: ${filterResult.flaggedWords.join(', ')} ${filterResult.reason || ''}`);
            return;
        }

        // 添加评论
        const comment: Comment = {
            id: Date.now().toString(),
            content: newComment,
            author: userEmail || 'Anonymous',
            createdAt: new Date(),
        };

        setComments([comment, ...comments]);
        setNewComment('');
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    return (
        <GlassCard className="p-6 mt-8" hover={false}>
            <h2 className="text-xl font-bold mb-6">{t('title')}</h2>

            {/* 评论输入 */}
            {isLoggedIn ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('placeholder')}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none resize-none h-24"
                    />

                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}

                    <motion.button
                        type="submit"
                        className="mt-3 btn-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {t('button.submit')}
                    </motion.button>
                </form>
            ) : (
                <div className="mb-6 p-4 rounded-xl bg-white/5 text-center">
                    <p className="text-text-muted">{t('message.loginToComment')}</p>
                </div>
            )}

            {/* 评论列表 */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-white/5"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                                {comment.author.replace(/(.{3}).*(@.*)/, '$1***$2')}
                            </span>
                            <span className="text-text-muted text-xs">
                                {formatDate(comment.createdAt)}
                            </span>
                        </div>
                        <p className="text-text-secondary">{comment.content}</p>
                    </motion.div>
                ))}

                {comments.length === 0 && (
                    <p className="text-text-muted text-center py-8">
                        暂无评论 / No comments yet
                    </p>
                )}
            </div>
        </GlassCard>
    );
}
