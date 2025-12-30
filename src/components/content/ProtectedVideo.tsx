'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

interface ProtectedVideoProps {
    youtubeId: string;
    title: string;
    userEmail?: string;
}

export function ProtectedVideo({ youtubeId, title, userEmail }: ProtectedVideoProps) {
    const [mounted, setMounted] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    // 确保客户端挂载后再渲染交互内容
    useEffect(() => {
        setMounted(true);
    }, []);

    const handlePlay = () => {
        setShowVideo(true);
    };

    // 服务端和客户端初始渲染保持一致
    if (!mounted) {
        return (
            <GlassCard className="p-4" hover={false}>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20">
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-coral/50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-4" hover={false}>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20">
                {showVideo ? (
                    <>
                        {/* YouTube iframe */}
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={title}
                        />

                        {/* 动态水印 */}
                        {userEmail && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <motion.div
                                    className="text-white/20 text-lg font-mono transform rotate-[-15deg] select-none"
                                    animate={{
                                        x: [0, 50, -50, 0],
                                        y: [0, -30, 30, 0],
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                >
                                    {userEmail}
                                </motion.div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <motion.button
                            onClick={handlePlay}
                            className="w-20 h-20 rounded-full bg-coral flex items-center justify-center shadow-2xl"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </motion.button>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
