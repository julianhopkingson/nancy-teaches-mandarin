'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

interface ProtectedVideoProps {
    youtubeId: string;
    title: string;
}

export function ProtectedVideo({ youtubeId, title }: ProtectedVideoProps) {
    const [mounted, setMounted] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    // 确保客户端挂载后再渲染交互内容
    useEffect(() => {
        setMounted(true);
    }, []);

    const handlePlay = () => {
        setShowVideo(true);
    };

    // YouTube 缩略图 URL（优先使用高清，失败降级）
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    const fallbackThumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

    // 缩略图预览组件
    const ThumbnailPreview = ({ showButton = true }: { showButton?: boolean }) => (
        <div className="w-full h-full relative">
            {/* YouTube 官方缩略图 */}
            <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    // 降级到标准质量缩略图
                    e.currentTarget.src = fallbackThumbnailUrl;
                }}
            />
            {/* 播放按钮叠加层 */}
            {showButton && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-20 h-20 rounded-full bg-coral/80 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );

    // 服务端和客户端初始渲染保持一致
    if (!mounted) {
        return (
            <GlassCard className="p-1" hover={false}>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20">
                    <ThumbnailPreview showButton={true} />
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-1" hover={false}>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20">
                {showVideo ? (
                    <>
                        {/* YouTube iframe - 禁用全屏 (fs=0) */}
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title={title}
                        />

                        {/* 透明遮罩 - 顶部：阻止点击视频标题栏链接 */}
                        <div
                            className="absolute top-0 left-0 right-0 h-16 pointer-events-auto cursor-default"
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        />

                        {/* 透明遮罩 - 右下角：阻止点击 YouTube logo */}
                        <div
                            className="absolute bottom-0 right-0 w-48 h-14 pointer-events-auto cursor-default"
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        />


                    </>
                ) : (
                    <div className="w-full h-full relative cursor-pointer" onClick={handlePlay}>
                        {/* 缩略图预览 */}
                        <ThumbnailPreview showButton={false} />
                        {/* 可点击的播放按钮 */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <motion.button
                                className="w-20 h-20 rounded-full bg-coral flex items-center justify-center shadow-2xl"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </motion.button>
                        </div>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
