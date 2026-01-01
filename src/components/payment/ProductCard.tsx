'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export interface ProductCardProps {
    id: string;
    type: 'level' | 'bundle';
    title: string;
    subtitle: string;
    price: number;
    priceLabel: string;
    selected: boolean;
    onSelect: () => void;
    bestValue?: boolean;
    features?: string[];
    savedAmount?: number;
    savedText?: string;
    disabled?: boolean;
    hideSelection?: boolean;
    hideFeatures?: boolean;
    variant?: 'default' | 'admin';
}

export function ProductCard({
    id,
    type,
    title,
    subtitle,
    price,
    priceLabel,
    selected,
    onSelect,
    bestValue = false,
    features = [],
    savedAmount = 0,
    savedText = '',
    disabled = false,
    hideSelection = false,
    hideFeatures = false,
    variant = 'default'
}: ProductCardProps) {
    const t = useTranslations('payment');
    const isBundle = type === 'bundle';
    const typeLabel = isBundle ? t('product.bundle') : t('product.level');

    // Admin Variant Styles
    const isAdmin = variant === 'admin';
    const tagClass = isBundle
        ? 'bg-coral/10 text-coral dark:bg-coral/20 dark:text-coral'
        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300';

    const titleClass = isAdmin
        ? 'text-black dark:text-white'
        : 'text-gray-900 dark:text-gray-100';

    const subtitleClass = isAdmin
        ? 'text-black dark:text-gray-300'
        : 'text-gray-500 dark:text-gray-400';

    const featureTextClass = isAdmin
        ? 'text-gray-900 dark:text-gray-100'
        : 'text-gray-600 dark:text-gray-300';

    return (
        <motion.div
            layout
            whileHover={!disabled ? { y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={!disabled ? onSelect : undefined}
            className={`
                relative flex flex-row items-stretch p-4 md:p-6 rounded-3xl bg-white dark:bg-gray-800 border-2 transition-all cursor-pointer shadow-sm min-h-[120px]
                ${selected
                    ? 'border-coral shadow-lg shadow-coral/10'
                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `}
        >
            {/* Best Value Badge */}
            {bestValue && (
                <div className="absolute -top-3 right-4 bg-coral text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-lg shadow-coral/30 tracking-wide z-10">
                    BEST VALUE
                </div>
            )}

            {/* 1. Left Section: Title & Subtitle - Fixed width, allows wrap */}
            <div className="flex-shrink-0 w-[120px] md:w-[150px] pr-2">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ${tagClass}`}>
                        {typeLabel}
                    </span>
                </div>
                <h3 className={`text-base md:text-lg font-bold leading-tight mb-0.5 break-words ${titleClass}`}>
                    {title}
                </h3>
                <p className={`text-xs md:text-sm font-medium ${subtitleClass}`}>
                    {subtitle}
                </p>
            </div>

            {/* Features Section - Expanded width */}
            {!hideFeatures && features.length > 0 ? (
                <div className="flex flex-col gap-1 pl-[30px] pr-3 flex-1">
                    {features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className={`text-xs md:text-sm flex items-start gap-1.5 ${featureTextClass}`}>
                            <span className="text-green-500 flex-shrink-0 text-xs md:text-sm">✔</span>
                            <span className="line-clamp-2">{feature}</span>
                        </span>
                    ))}
                </div>
            ) : (
                <div className="flex-1" />
            )}



            {/* 3. Right Section: Price & Selection - Increased font size */}
            <div className="flex flex-col items-end justify-between flex-shrink-0 min-w-[90px] md:w-[120px] pl-2 md:pl-0 md:justify-center">
                <div className="flex flex-col items-end gap-0 md:gap-1 text-right">
                    <span className="text-2xl md:text-3xl font-bold text-coral leading-none">${Math.floor(price)}<span className="text-sm md:text-lg">.{price.toFixed(2).split('.')[1]}</span></span>
                </div>

                {/* Saved Amount Badge */}
                {savedAmount > 0 && (
                    <div className="mt-1 md:mt-2 bg-red-50 text-red-500 text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded border border-red-100">
                        {savedText}
                    </div>
                )}

                {/* Mobile Selection Circle */}
                {!hideSelection && (
                    <div className={`mt-3 w-6 h-6 rounded-full border-2 flex items-center justify-center md:hidden ${selected ? 'border-coral' : 'border-gray-300'
                        }`}>
                        {selected && <div className="w-3 h-3 bg-coral rounded-full" />}
                    </div>
                )}
            </div>

            {/* Desktop Selection Checkmark styling override */}
            {!hideSelection && (
                <div className={`hidden md:flex absolute top-6 right-6 w-6 h-6 rounded-full border-2 items-center justify-center transition-colors ${selected ? 'border-coral' : 'border-gray-300'
                    }`}>
                    {selected && <div className="w-3 h-3 bg-coral rounded-full" />}
                </div>
            )}
        </motion.div>
    );
}
