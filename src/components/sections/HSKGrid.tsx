'use client';

import { useTranslations } from 'next-intl';
import { HSKCard } from '@/components/hsk/HSKCard';
import type { Locale } from '@/lib/i18n/request';

interface HSKGridProps {
    locale: Locale;
}

const hskLevels = [1, 2, 3, 4, 5, 6] as const;

export function HSKGrid({ locale }: HSKGridProps) {
    const t = useTranslations('hsk');

    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('title')}
                    </h2>
                    <p className="text-text-secondary text-lg">
                        {t('subtitle')}
                    </p>
                </div>

                {/* HSK Cards Grid */}
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
        </section>
    );
}
