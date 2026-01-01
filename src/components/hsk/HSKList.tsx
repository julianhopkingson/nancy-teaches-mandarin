'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HSKCard } from '@/components/hsk/HSKCard';
import type { Locale } from '@/lib/i18n/request';

interface HSKLevelData {
    level: number;
    titleEn: string;
    titleSc: string;
    titleTc: string;
    descriptionEn: string;
    descriptionSc: string;
    descriptionTc: string;
    wordCount: number;
    lessonCount: number;
}

interface HSKListProps {
    locale: Locale;
    initialLevels: HSKLevelData[];
    isAdmin?: boolean;
}

export function HSKList({ locale, initialLevels, isAdmin }: HSKListProps) {
    const t = useTranslations('hsk');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isEditing = searchParams.get('edit') === 'true';

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 relative">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
                    <p className="text-text-secondary text-lg">{t('subtitle')}</p>

                    {/* Admin Toggle Button (Point ①) */}
                    {isAdmin && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                            <motion.button
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (isEditing) {
                                        params.delete('edit');
                                    } else {
                                        params.set('edit', 'true');
                                    }
                                    router.push(`${pathname}?${params.toString()}`);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all bg-white border-2 ${isEditing ? 'border-green-500 text-green-500' : 'border-coral/20 text-coral hover:border-coral'
                                    }`}
                                title={isEditing ? t('button.finish') : t('button.editResults')}
                            >
                                {isEditing ? (
                                    <span className="text-2xl font-bold">S</span>
                                ) : (
                                    <span className="text-2xl">✏️</span>
                                )}
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* HSK Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {initialLevels.map((hsk) => (
                        <HSKCard
                            key={hsk.level}
                            level={hsk.level as any}
                            locale={locale}
                            isPurchased={false}
                            isEditing={isEditing}
                            hskData={hsk}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
