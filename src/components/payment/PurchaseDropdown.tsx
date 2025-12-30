'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import { PayPalButton } from '@/components/providers/PayPalProvider';

// 价格配置 (后续由 Admin 管理)
const prices = {
    levels: {
        1: 19.99,
        2: 24.99,
        3: 29.99,
        4: 34.99,
        5: 39.99,
        6: 44.99,
    },
    bundles: {
        beginner: 39.99,     // HSK 1-2
        intermediate: 59.99, // HSK 3-4
        advanced: 79.99,     // HSK 5-6
        all: 149.99,         // HSK 1-6
    },
};

type PurchaseType = 'level' | 'bundle';
type LevelKey = 1 | 2 | 3 | 4 | 5 | 6;
type BundleKey = 'beginner' | 'intermediate' | 'advanced' | 'all';

export function PurchaseDropdown() {
    const t = useTranslations('payment');
    const [purchaseType, setPurchaseType] = useState<PurchaseType>('level');
    const [selectedLevel, setSelectedLevel] = useState<LevelKey>(1);
    const [selectedBundle, setSelectedBundle] = useState<BundleKey>('all');
    const [showPayPal, setShowPayPal] = useState(false);

    const getAmount = () => {
        if (purchaseType === 'level') {
            return prices.levels[selectedLevel].toFixed(2);
        }
        return prices.bundles[selectedBundle].toFixed(2);
    };

    const getDescription = () => {
        if (purchaseType === 'level') {
            return `HSK ${selectedLevel} Course`;
        }
        return `HSK Bundle: ${selectedBundle}`;
    };

    const handleSuccess = (orderId: string) => {
        console.log('Payment successful:', orderId);
        // TODO: 调用 API 保存购买记录
        alert('购买成功！Payment successful!');
        setShowPayPal(false);
    };

    const handleError = (error: unknown) => {
        console.error('Payment error:', error);
        alert('支付失败，请重试 / Payment failed, please try again');
    };

    return (
        <GlassCard className="p-6" heavy hover={false}>
            <h2 className="text-2xl font-bold mb-6">{t('title')}</h2>

            {/* 购买类型切换 */}
            <div className="flex gap-2 mb-6">
                <motion.button
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors ${purchaseType === 'level'
                        ? 'bg-coral text-white'
                        : 'bg-white/10 hover:bg-white/20'
                        }`}
                    onClick={() => setPurchaseType('level')}
                    whileTap={{ scale: 0.98 }}
                >
                    {t('label.selectLevel')}
                </motion.button>
                <motion.button
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors ${purchaseType === 'bundle'
                        ? 'bg-coral text-white'
                        : 'bg-white/10 hover:bg-white/20'
                        }`}
                    onClick={() => setPurchaseType('bundle')}
                    whileTap={{ scale: 0.98 }}
                >
                    {t('label.selectBundle')}
                </motion.button>
            </div>

            {/* 等级/组合选择 */}
            {purchaseType === 'level' ? (
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {([1, 2, 3, 4, 5, 6] as LevelKey[]).map((level) => (
                        <motion.button
                            key={level}
                            className={`py-3 rounded-xl font-bold transition-colors hsk-gradient-${level} ${selectedLevel === level ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : 'opacity-70'
                                }`}
                            onClick={() => setSelectedLevel(level)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            HSK {level}
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div className="space-y-2 mb-6">
                    {(['beginner', 'intermediate', 'advanced', 'all'] as BundleKey[]).map((bundle) => (
                        <motion.button
                            key={bundle}
                            className={`w-full py-3 px-4 rounded-xl font-medium text-left transition-colors ${selectedBundle === bundle
                                ? 'bg-coral text-white'
                                : 'bg-white/10 hover:bg-white/20'
                                }`}
                            onClick={() => setSelectedBundle(bundle)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex justify-between items-center">
                                <span>{t(`bundle.${bundle}`)}</span>
                                <span className="font-bold">${prices.bundles[bundle]}</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* 价格显示 */}
            <div className="text-center py-4 mb-4 bg-white/5 rounded-xl">
                <span className="text-text-muted">{t('label.price')}: </span>
                <span className="text-3xl font-bold text-coral">${getAmount()}</span>
            </div>

            {/* PayPal 按钮 */}
            {showPayPal ? (
                <div className="mt-4">
                    <PayPalButton
                        amount={getAmount()}
                        description={getDescription()}
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                    <button
                        onClick={() => setShowPayPal(false)}
                        className="w-full mt-4 text-text-muted hover:text-coral transition-colors text-sm"
                    >
                        取消 / Cancel
                    </button>
                </div>
            ) : (
                <motion.button
                    className="w-full btn-primary text-lg py-4"
                    onClick={() => setShowPayPal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {t('button.payNow')}
                </motion.button>
            )}
        </GlassCard>
    );
}
