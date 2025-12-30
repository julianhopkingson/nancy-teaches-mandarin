'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/lib/i18n/request';

interface HeroProps {
    locale: Locale;
}

export function Hero({ locale }: HeroProps) {
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('hero');

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12 px-4">
            {/* 背景装饰 - 仅在客户端动画 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-coral/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-hsk-3/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hsk-6/10 rounded-full blur-3xl" />
            </div>

            {/* 内容 */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
                {/* Logo */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-coral to-coral-dark text-white text-5xl font-bold shadow-2xl mb-6">
                        N
                    </div>
                </div>

                {/* Slogan */}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-coral">
                    {t('slogan')}
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
                    {t('subtitle')}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href={`/${locale}/hsk/1`}>
                        <button className="btn-primary text-lg px-8 py-4 hover:scale-105 transition-transform">
                            {t('cta')} →
                        </button>
                    </Link>

                    <Link href={`/${locale}/hsk`}>
                        <button className="px-8 py-4 rounded-xl font-semibold text-text-secondary hover:text-coral transition-colors glass hover:scale-105">
                            {t('exploreLevels')}
                        </button>
                    </Link>
                </div>

                {/* HSK 等级预览 */}
                <div className="mt-16 flex justify-center gap-4 flex-wrap">
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                        <Link key={level} href={`/${locale}/hsk/${level}`}>
                            <div
                                className={`w-14 h-14 rounded-2xl hsk-gradient-${level} flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer hover:scale-110 hover:rotate-6 transition-transform`}
                            >
                                {level}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
