'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { HSKCard } from '@/components/hsk/HSKCard';
import type { Locale } from '@/lib/i18n/request';

interface HSKListProps {
    locale: Locale;
}

const hskLevels = [1, 2, 3, 4, 5, 6] as const;

export function HSKList({ locale }: HSKListProps) {
    const t = useTranslations('hsk');

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
                    <p className="text-text-secondary text-lg">{t('subtitle')}</p>
                </div>

                {/* HSK Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hskLevels.map((level) => (
                        <HSKCard
                            key={level}
                            level={level}
                            locale={locale}
                            isPurchased={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
