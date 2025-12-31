'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

// Mock 价格数据
const initialPrices = {
    levels: { 1: 19.99, 2: 24.99, 3: 29.99, 4: 34.99, 5: 39.99, 6: 44.99 },
    bundles: { beginner: 39.99, intermediate: 59.99, advanced: 79.99, all: 149.99 },
};

export function AdminDashboard() {
    const [mounted, setMounted] = useState(false);
    const [prices, setPrices] = useState(initialPrices);


    // 确保只在客户端渲染
    useEffect(() => {
        setMounted(true);
    }, []);

    const updateLevelPrice = (level: number, price: number) => {
        setPrices((prev) => ({
            ...prev,
            levels: { ...prev.levels, [level]: price },
        }));
    };

    const handleSave = () => {
        console.log('Saving prices:', prices);

        alert('设置已保存！Settings saved!');
    };

    // 在客户端挂载前显示加载状态
    if (!mounted) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-3xl font-bold">🎛️ Admin Panel</div>
                    <div className="mt-8 text-text-muted">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold"
                >
                    🎛️ Admin Panel
                </motion.h1>

                {/* 价格设置 */}
                <GlassCard className="p-6" heavy hover={false}>
                    <h2 className="text-xl font-bold mb-6">💰 价格设置 / Price Settings</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-medium mb-4">等级价格 / Level Prices</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(prices.levels).map(([level, price]) => (
                                    <div key={level} className="space-y-2">
                                        <label className={`block text-sm font-medium hsk-gradient-${level} bg-clip-text text-transparent`}>
                                            HSK {level}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-text-muted">$</span>
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={(e) => updateLevelPrice(Number(level), Number(e.target.value))}
                                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-coral focus:outline-none"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium mb-4">组合价格 / Bundle Prices</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(prices.bundles).map(([bundle, price]) => (
                                    <div key={bundle} className="space-y-2">
                                        <label className="block text-sm font-medium capitalize">
                                            {bundle === 'all' ? '全部等级' : bundle === 'beginner' ? '入门包' : bundle === 'intermediate' ? '进阶包' : '高级包'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-text-muted">$</span>
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={(e) =>
                                                    setPrices((prev) => ({
                                                        ...prev,
                                                        bundles: { ...prev.bundles, [bundle]: Number(e.target.value) },
                                                    }))
                                                }
                                                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-coral focus:outline-none"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassCard>



                {/* 保存按钮 */}
                <motion.button
                    onClick={handleSave}
                    className="w-full btn-primary text-lg py-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    保存设置 / Save Settings
                </motion.button>
            </div>
        </div>
    );
}
