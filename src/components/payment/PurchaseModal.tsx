'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { PayPalProvider, PayPalButton } from '@/components/providers/PayPalProvider';
import { ProductCard } from './ProductCard';
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
    const [prices, setPrices] = useState<{ levelPrice: number; hskLevel: { descriptionEn: string; descriptionSc: string; descriptionTc: string } | null; bundles: BundleWithLevels[]; allLevelPrices: { level: number; price: number }[] } | null>(null);
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
                            <div className="w-full max-w-lg md:max-w-[562px] mx-auto flex flex-col gap-3 md:gap-4 mb-4 md:mb-12">
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
                                            features: (() => {
                                                if (!prices.hskLevel) return [];
                                                const desc = locale === 'en' ? prices.hskLevel.descriptionEn : locale === 'tc' ? prices.hskLevel.descriptionTc : prices.hskLevel.descriptionSc;
                                                return desc ? desc.split('\n').filter(line => line.trim().length > 0) : [];
                                            })(),
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
                                <div className="flex justify-between items-center mb-2 md:mb-3">
                                    <span className="text-gray-500">{t('total')}</span>
                                    <span className="text-3xl font-bold text-coral">
                                        ${selectedOption?.price.toFixed(2) || '0.00'}
                                    </span>
                                </div>

                                {loading && <div className="text-center py-2 text-coral">Processing...</div>}
                                {error && <div className="text-center py-2 text-red-500">{error}</div>}

                                <div className="relative rounded-2xl transition-transform duration-200 hover:scale-[1.02] [&>div]:rounded-2xl [&_iframe]:rounded-2xl">
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
