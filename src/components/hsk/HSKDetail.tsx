'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProtectedVideo } from '@/components/content/ProtectedVideo';
import type { Locale } from '@/lib/i18n/request';

interface HSKDetailProps {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    locale: Locale;
}

const levelEmojis = ['🍀', '🌊', '🌀', '💜', '🌸', '🔮'];

// Mock 数据 - 实际由 Admin 管理
const mockResources = {
    videos: [
        { id: '1', youtubeId: 'dQw4w9WgXcQ', title: '第一课：问候语' },
        { id: '2', youtubeId: 'dQw4w9WgXcQ', title: '第二课：数字' },
    ],
    docs: [
        { id: '1', url: '/sample.pdf', title: '词汇表' },
        { id: '2', url: '/sample.pdf', title: '语法笔记' },
    ],
    audio: [
        { id: '1', url: '/sample.mp3', title: '听力练习 1' },
        { id: '2', url: '/sample.mp3', title: '听力练习 2' },
    ],
};

export function HSKDetail({ level, locale }: HSKDetailProps) {
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('hsk');
    const tContent = useTranslations('content');

    useEffect(() => {
        setMounted(true);
    }, []);

    // 服务端渲染静态内容
    if (!mounted) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* 返回链接 */}
                    <Link
                        href={`/${locale}/hsk`}
                        className="inline-flex items-center gap-2 text-text-muted hover:text-coral transition-colors mb-6"
                    >
                        ← 返回课程列表
                    </Link>

                    {/* HSK 标题卡片 - 单独一行 */}
                    <div className={`flex items-center gap-4 p-6 rounded-2xl hsk-gradient-${level} text-white mb-8`}>
                        <span className="text-5xl">{levelEmojis[level - 1]}</span>
                        <div>
                            <h1 className="text-3xl font-bold">HSK {level}</h1>
                            <p className="text-white/80">{t('description.' + level)}</p>
                        </div>
                    </div>

                    <div className="text-text-muted">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* 返回链接 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link
                        href={`/${locale}/hsk`}
                        className="inline-flex items-center gap-2 text-text-muted hover:text-coral transition-colors mb-6"
                    >
                        ← 返回课程列表
                    </Link>
                </motion.div>

                {/* HSK 标题卡片 - 单独一行，全宽 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`flex items-center gap-4 p-6 rounded-2xl hsk-gradient-${level} text-white mb-8`}
                >
                    <span className="text-5xl">{levelEmojis[level - 1]}</span>
                    <div>
                        <h1 className="text-3xl font-bold">HSK {level}</h1>
                        <p className="text-white/80">{t('description.' + level)}</p>
                    </div>
                </motion.div>

                {/* 内容区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 视频课程 */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold">{tContent('video')}</h2>
                        {mockResources.videos.map((video) => (
                            <ProtectedVideo
                                key={video.id}
                                youtubeId={video.youtubeId}
                                title={video.title}
                                userEmail="user@example.com"
                            />
                        ))}
                    </div>

                    {/* 侧边栏资料 */}
                    <div className="space-y-6">
                        {/* 文档 */}
                        <GlassCard className="p-4" hover={false}>
                            <h3 className="font-bold mb-4">{tContent('docs')}</h3>
                            <div className="space-y-2">
                                {mockResources.docs.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <span className="text-2xl">📄</span>
                                        <span>{doc.title}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* 音频 */}
                        <GlassCard className="p-4" hover={false}>
                            <h3 className="font-bold mb-4">{tContent('audio')}</h3>
                            <div className="space-y-2">
                                {mockResources.audio.map((audio) => (
                                    <div
                                        key={audio.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <span className="text-2xl">🎧</span>
                                        <span>{audio.title}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* 购买按钮 */}
                        <Link href={`/${locale}/payment`}>
                            <motion.button
                                className="w-full btn-primary text-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                解锁完整内容
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
