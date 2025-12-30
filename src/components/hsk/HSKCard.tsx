'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/lib/i18n/request';

interface HSKCardProps {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    locale: Locale;
    isPurchased?: boolean;
}

const levelEmojis = ['🍀', '🌊', '🌀', '💜', '🌸', '🔮'];

export function HSKCard({ level, locale, isPurchased = false }: HSKCardProps) {
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('hsk');

    useEffect(() => {
        setMounted(true);
    }, []);

    // 服务端和客户端初始渲染保持一致（无动画）
    const cardContent = (
        <>
            {/* 装饰性背景 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{levelEmojis[level - 1]}</span>
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                        {t('wordCount.' + level)} {t('words')}
                    </span>
                </div>

                <h3 className="text-2xl font-bold mb-2">
                    HSK {level}
                </h3>

                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {t('description.' + level)}
                </p>

                <Link href={`/${locale}/hsk/${level}`}>
                    <button
                        className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${isPurchased
                                ? 'bg-white text-gray-800 hover:bg-white/90'
                                : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30'
                            }`}
                    >
                        {isPurchased ? t('continue') : t('startLearning')}
                    </button>
                </Link>
            </div>
        </>
    );

    // 仅在客户端才使用动画
    if (mounted) {
        return (
            <motion.div
                className={`hsk-gradient-${level} rounded-2xl p-6 text-white shadow-xl cursor-pointer overflow-hidden relative`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
            >
                {cardContent}
            </motion.div>
        );
    }

    // 服务端静态渲染
    return (
        <div
            className={`hsk-gradient-${level} rounded-2xl p-6 text-white shadow-xl cursor-pointer overflow-hidden relative`}
        >
            {cardContent}
        </div>
    );
}
