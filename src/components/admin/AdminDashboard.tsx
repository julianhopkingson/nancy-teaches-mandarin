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
    const [youtubeLink, setYoutubeLink] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(1);

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
        console.log('YouTube link:', youtubeLink);
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

                {/* 资源管理 */}
                <GlassCard className="p-6" heavy hover={false}>
                    <h2 className="text-xl font-bold mb-6">📁 资源管理 / Resource Management</h2>

                    <div className="space-y-6">
                        {/* 等级选择 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">选择等级 / Select Level</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                    <motion.button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${selectedLevel === level
                                                ? `hsk-gradient-${level} text-white`
                                                : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        HSK {level}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* YouTube 链接输入 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                YouTube 视频链接 (仅输入 Video ID)
                            </label>
                            <input
                                type="text"
                                value={youtubeLink}
                                onChange={(e) => setYoutubeLink(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none"
                                placeholder="例如: dQw4w9WgXcQ"
                            />
                            <p className="text-text-muted text-sm mt-1">
                                从 YouTube 链接中提取 ID，例如 https://youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>
                            </p>
                        </div>

                        {/* 文件上传区域 */}
                        <div>
                            <label className="block text-sm font-medium mb-2">上传文件 / Upload Files</label>
                            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-coral transition-colors cursor-pointer">
                                <div className="text-4xl mb-2">📤</div>
                                <p className="text-text-muted">
                                    拖拽文件到此处或点击上传
                                    <br />
                                    <span className="text-sm">支持 PDF, Word, MP3, WAV</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* 评论审核 */}
                <GlassCard className="p-6" heavy hover={false}>
                    <h2 className="text-xl font-bold mb-6">💬 评论审核 / Comment Moderation</h2>

                    <div className="text-text-muted text-center py-8">
                        暂无待审核评论 / No comments pending review
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
