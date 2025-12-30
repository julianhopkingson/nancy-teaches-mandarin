'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
}

interface HSKGridProps {
    locale: Locale;
    initialLevels: HSKLevelData[];
    isAdmin?: boolean;
}

export function HSKGrid({ locale, initialLevels, isAdmin }: HSKGridProps) {
    const t = useTranslations('hsk');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isEditing = searchParams.get('edit') === 'true';

    return (
        <section className="py-20 px-4 relative">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12 relative">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('title')}
                    </h2>
                    <p className="text-text-secondary text-lg">
                        {t('subtitle')}
                    </p>

                    {/* Admin Toggle Button */}
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
                                    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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

                {/* HSK Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </section>
    );
}
