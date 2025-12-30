'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/lib/i18n/request';

interface SidebarProps {
    locale: Locale;
    isOpen: boolean;
    onClose: () => void;
}

const hskLevels = [1, 2, 3, 4, 5, 6] as const;
const levelEmojis = ['🍀', '🌊', '🌀', '💜', '🌸', '🔮'];

export function Sidebar({ locale, isOpen, onClose }: SidebarProps) {
    const t = useTranslations('hsk');

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: isOpen ? 0 : -300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed left-0 top-0 bottom-0 w-72 glass-heavy z-50 pt-24 px-4 pb-6 lg:translate-x-0"
            >
                <div className="flex flex-col h-full">
                    <h2 className="text-lg font-bold mb-4 px-2">{t('title')}</h2>

                    <nav className="flex-1 space-y-2">
                        {hskLevels.map((level) => (
                            <Link
                                key={level}
                                href={`/${locale}/hsk/${level}`}
                                onClick={onClose}
                            >
                                <motion.div
                                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 transition-colors hsk-gradient-${level} bg-opacity-10`}
                                    whileHover={{ x: 4 }}
                                >
                                    <span className="text-2xl">{levelEmojis[level - 1]}</span>
                                    <div>
                                        <div className="font-semibold text-white">HSK {level}</div>
                                        <div className="text-xs text-white/70">{t('wordCount.' + level)} {t('words')}</div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <Link href={`/${locale}/payment`}>
                            <motion.button
                                className="w-full btn-primary text-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                购买课程
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
