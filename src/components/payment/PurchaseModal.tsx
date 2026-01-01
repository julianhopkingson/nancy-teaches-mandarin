'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { PayPalProvider, PayPalButton } from '@/components/providers/PayPalProvider';
import { verifyPurchase, getPricing } from '@/actions/payment';
import { useRouter } from 'next/navigation';

interface BundleWithLevels {
    id: string;
    code: string;
    nameEn: string;
    nameSc: string;
    nameTc: string;
    descriptionEn: string | null;
    descriptionSc: string | null;
    descriptionTc: string | null;
    price: number;
    icon: string | null;
    levels: { level: number }[];
}

interface PurchaseModalProps {
    isOpen: boolean;
    level: number;
    levelTitle?: string;
    onClose: () => void;
    userEmail?: string;
}

export function PurchaseModal({ isOpen, level, onClose }: PurchaseModalProps) {
    const t = useTranslations('payment');
    const locale = useLocale();
    const router = useRouter();
    const [prices, setPrices] = useState<{ levelPrice: number; bundles: BundleWithLevels[]; allLevelPrices: { level: number; price: number }[] } | null>(null);
    const [selectedOption, setSelectedOption] = useState<{ type: 'level' | 'bundle'; id: string; price: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Disable background scroll & Fetch Data
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            getPricing(level).then((data) => {
                setPrices(data);
                // Default to the first bundle if available (often "Best Value"), else level
                // Or default to Level to be less aggressive. Let's default to Level.
                setSelectedOption({ type: 'level', id: level.toString(), price: data.levelPrice });
            });
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, level]);

    const handleSuccess = async (orderId: string) => {
        if (!selectedOption) return;
        setLoading(true);
        setError(null);
        try {
            const result = await verifyPurchase(
                orderId,
                selectedOption.type,
                selectedOption.type === 'bundle' ? selectedOption.id : level.toString(),
                // Note: verifyPurchase expects 'bundle' productId to be 'all' or 'beginner' code usually?
                // Let's check verifyPurchase implementation. It likely stores whatever we pass.
                // Re-reading confirm: verifyPurchase(orderId, productType, productId, amount)
                // We should pass the bundle ID or Code. Ideally bundle CODE is better for readability if used in seed, but ID is unique.
                // Let's check if the previous implementation used 'all' code. Yes.
                // Let's look at the fetch logic... The fetched bundles have `code`. Let's use `code` as productId for bundles.
                selectedOption.price
            );

            if (result.success) {
                onClose();
                router.refresh();
            } else {
                setError(result.message || 'Verification failed');
            }
        } catch (err) {
            setError('An error occurred during verification');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get features from description
    const getFeatures = (bundle: BundleWithLevels) => {
        const desc = locale === 'en' ? bundle.descriptionEn : locale === 'tc' ? bundle.descriptionTc : bundle.descriptionSc;
        if (desc && desc.trim().length > 0) {
            return desc.split('\n').filter(line => line.trim().length > 0);
        }
        // Fallbacks if description is empty
        if (bundle.code === 'all') {
            return [
                t('feature.allLevels'),
                t('feature.lifetimeAccess'),
                t('feature.support')
            ];
        }
        return [
            t('feature.levelRange', { min: bundle.levels[0].level, max: bundle.levels[bundle.levels.length - 1].level }),
            t('feature.saveMoney')
        ];
    };

    const calculateSavings = (bundle: BundleWithLevels) => {
        if (!prices?.allLevelPrices) return 0;

        let totalLevelPrice = 0;
        if (bundle.code === 'all') {
            // For 'all' bundle, sum everything
            totalLevelPrice = prices.allLevelPrices.reduce((sum, lp) => sum + lp.price, 0);
        } else {
            // For others, sum included levels
            totalLevelPrice = bundle.levels.reduce((sum, lvl) => {
                const lp = prices.allLevelPrices.find(p => p.level === lvl.level);
                return sum + (lp?.price || 0);
            }, 0);
        }
        return Math.max(0, totalLevelPrice - bundle.price);
    };

    const bestValueBundleCode = useMemo(() => {
        if (!prices || !prices.bundles) return null;
        let maxSavings = -1;
        let bestCode = null;

        prices.bundles.forEach(b => {
            const savings = calculateSavings(b);
            if (savings > maxSavings) {
                maxSavings = savings;
                bestCode = b.code;
            }
        });
        return bestCode;
    }, [prices]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <PayPalProvider>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 dark:bg-gray-900"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="fixed top-6 right-6 z-50 p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 rounded-full transition-colors backdrop-blur-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-500 dark:text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="min-h-screen flex flex-col items-center justify-center p-4">

                            {/* Header Section */}
                            <div className="text-center max-w-2xl mx-auto mb-4 md:mb-12 pt-4 md:pt-10">
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h1 className="text-3xl md:text-5xl font-extrabold mb-2 md:mb-6 bg-gradient-to-r from-coral to-orange-600 bg-clip-text text-transparent whitespace-pre-line leading-tight">
                                        {t('unlockMessage', { level })}
                                    </h1>
                                </motion.div>
                            </div>

                            {/* Cards Grid */}
                            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-12">
                                {(() => {
                                    if (!prices) return null;

                                    const options = [
                                        // Bundles
                                        ...prices.bundles.map(b => ({
                                            id: b.code,
                                            type: 'bundle' as const,
                                            title: locale === 'en' ? b.nameEn : locale === 'tc' ? b.nameTc : b.nameSc,
                                            subtitle: t('bundleLevels', { min: b.levels[0]?.level || 0, max: b.levels[b.levels.length - 1]?.level || 0 }),
                                            price: b.price,
                                            features: getFeatures(b),
                                            savedAmount: calculateSavings(b),
                                            savedText: t('label.savedMoney', { amount: calculateSavings(b).toFixed(0) }),
                                            bestValue: b.code === bestValueBundleCode
                                        })),
                                        // Single Level
                                        {
                                            id: level.toString(),
                                            type: 'level' as const,
                                            title: `HSK ${level}`,
                                            subtitle: t('singleLevel'),
                                            price: prices.levelPrice,
                                            features: [],
                                            savedAmount: 0,
                                            savedText: '',
                                            bestValue: false
                                        }
                                    ].sort((a, b) => a.price - b.price);

                                    return options.map((option) => (
                                        <ProductCard
                                            key={`${option.type}-${option.id}`}
                                            id={option.id}
                                            type={option.type}
                                            title={option.title}
                                            subtitle={option.subtitle}
                                            price={option.price}
                                            priceLabel={t('label.price')}
                                            selected={selectedOption?.type === option.type && selectedOption?.id === option.id}
                                            onSelect={() => setSelectedOption({ type: option.type, id: option.id, price: option.price })}
                                            bestValue={option.bestValue}
                                            features={option.features}
                                            savedAmount={option.savedAmount}
                                            savedText={option.savedText}
                                        />
                                    ));
                                })()}
                            </div>
                            {/* Payment Section */}
                            <div className="w-full max-w-md mx-auto relative z-20 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-3xl shadow-xl border-2 border-coral/10">
                                {/* Total Price Row - Only visible on Mobile if cards don't show price clearly, but our cards do. 
                                    Actually, let's keep it as the "Checkout" area. */}
                                <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    <span className="text-gray-500">{t('total')}</span>
                                    <span className="text-3xl font-bold text-coral">
                                        ${selectedOption?.price.toFixed(2) || '0.00'}
                                    </span>
                                </div>

                                {loading && <div className="text-center py-2 text-coral">Processing...</div>}
                                {error && <div className="text-center py-2 text-red-500">{error}</div>}

                                <div className="relative min-h-[50px]">
                                    {selectedOption && (
                                        <PayPalButton
                                            amount={selectedOption.price.toFixed(2)}
                                            description={`Purchase: ${selectedOption.type === 'bundle' ? selectedOption.id : `HSK ${selectedOption.id}`}`}
                                            onSuccess={handleSuccess}
                                            onError={(err) => setError('Payment failed')}
                                        />
                                    )}
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-gray-400">
                                    <span className="italic">Powered by</span>
                                    <span className="font-bold italic text-[#003087]">Pay</span>
                                    <span className="font-bold italic text-[#009cde] -ml-0.5">Pal</span>
                                </div>
                            </div>

                            <p className="mt-4 md:mt-8 text-xs md:text-sm text-gray-400 text-center max-w-lg pb-10 md:pb-0">
                                {t('securePaymentNote')}
                            </p>
                        </div>
                    </motion.div>
                </PayPalProvider>
            )}
        </AnimatePresence>
    );
}

function ProductCard({
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
    savedText = ''
}: {
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
}) {
    return (
        <motion.div
            onClick={onSelect}
            whileHover={{ y: -2 }}
            className={`relative rounded-3xl cursor-pointer border-2 transition-all flex 
                ${selected
                    ? 'border-coral bg-white dark:bg-gray-800 shadow-xl ring-1 ring-coral/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-coral/50'
                }
                /* Mobile: 3-Column Row Layout, Increased Height & Padding */
                flex-row items-center justify-between p-4 min-h-[110px] gap-2
                /* Desktop: Stacked Column Layout */
                md:flex-col md:items-start md:justify-start md:p-6 md:h-full md:gap-0
            `}
        >
            {/* Best Value Badge */}
            {bestValue && (
                <div className={`
                    absolute bg-coral text-white font-bold rounded-full shadow-lg z-10
                    /* Mobile: Top Right Corner, slightly overlapping or just inside */
                    -top-2 -right-2 text-[10px] px-2 py-0.5
                    /* Desktop: Centered Pill on top */
                    md:-top-4 md:right-auto md:left-1/2 md:-translate-x-1/2 md:text-xs md:px-3 md:py-1 md:rounded-full
                `}>
                    BEST VALUE
                </div>
            )}

            {/* 1. Left Section: Title & Identity - Increased widths and font sizes */}
            <div className="flex flex-col items-start flex-shrink-0 w-[30%] md:w-full">
                <div className="mb-1 md:mb-4">
                    <span className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wider ${type === 'bundle' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {type === 'bundle' ? 'Bundle' : 'Level'}
                    </span>
                </div>

                <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-tight md:mb-2">{title}</h3>
                <p className="text-gray-400 text-xs md:text-sm md:text-gray-500 mt-1 md:mt-0 md:mb-6 leading-tight">{subtitle}</p>
            </div>

            {/* 2. Middle Section: Features - Increased font size */}
            <div className={`flex-grow md:w-full md:mb-8 px-1 md:px-0 ${features.length === 0 ? 'hidden md:block' : ''}`}>
                <ul className="flex flex-col space-y-1.5 md:space-y-3 justify-center h-full">
                    {features.length > 0 ? features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-tight">
                            <span className="text-green-500 flex-shrink-0 mt-[1px] md:mt-0.5">✔</span>
                            <span className="line-clamp-2 md:line-clamp-none">{feature}</span>
                        </li>
                    )) : (
                        <li className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300">
                            <span className="text-green-500 flex-shrink-0">✔</span>
                            Unlock Full Access
                        </li>
                    )}
                </ul>
            </div>

            {/* 3. Right Section: Price & Selection - Increased font size */}
            <div className="flex flex-col items-end flex-shrink-0 w-[28%] md:w-full md:mt-auto md:pt-6 md:border-t md:border-gray-100 md:dark:border-gray-700">
                <div className="flex flex-col md:flex-row items-end md:items-baseline gap-0 md:gap-1 text-right md:text-left">
                    <span className="text-2xl md:text-3xl font-bold text-coral leading-none">${Math.floor(price)}<span className="text-sm md:text-lg">.{price.toFixed(2).split('.')[1]}</span></span>
                </div>

                {/* Saved Amount Badge */}
                {savedAmount > 0 && (
                    <div className="mt-1 md:mt-2 bg-red-50 text-red-500 text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded border border-red-100">
                        {savedText}
                    </div>
                )}

                {/* Mobile Selection Circle */}
                <div className={`mt-3 w-6 h-6 rounded-full border-2 flex items-center justify-center md:hidden ${selected ? 'border-coral' : 'border-gray-300'
                    }`}>
                    {selected && <div className="w-3 h-3 bg-coral rounded-full" />}
                </div>
            </div>

            {/* Desktop Selection Checkmark styling override */}
            <div className={`hidden md:flex absolute top-6 right-6 w-6 h-6 rounded-full border-2 items-center justify-center transition-colors ${selected ? 'border-coral' : 'border-gray-300'
                }`}>
                {selected && <div className="w-3 h-3 bg-coral rounded-full" />}
            </div>
        </motion.div>
    );
}
