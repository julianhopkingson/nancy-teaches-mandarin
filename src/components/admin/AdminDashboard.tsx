'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import { AlertModal } from '@/components/ui/AlertModal';
import { BundleEditModal } from './BundleEditModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// HSK 等级渐变色
const levelGradients: Record<number, string> = {
    1: 'from-green-400 to-emerald-500',
    2: 'from-blue-400 to-cyan-500',
    3: 'from-purple-400 to-violet-500',
    4: 'from-pink-400 to-rose-500',
    5: 'from-orange-400 to-amber-500',
    6: 'from-red-400 to-pink-500',
};

// 组合包颜色
const bundleColors: Record<string, { bg: string; border: string }> = {
    beginner: { bg: 'from-green-500/20 to-blue-500/20', border: 'border-green-400/30' },
    intermediate: { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-400/30' },
    advanced: { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-400/30' },
    all: { bg: 'from-coral/20 to-orange-500/20', border: 'border-coral/30' },
};

interface Bundle {
    id: string;
    code: string;
    nameEn: string;
    nameSc: string;
    nameTc: string;
    descriptionEn: string | null;
    descriptionSc: string | null;
    descriptionTc: string | null;
    icon: string | null;
    price: number;
    isActive: boolean;
    sortOrder: number;
    levels: number[];
}

interface PricesData {
    levelPrices: Record<number, number>;
    bundles: Bundle[];
}

export function AdminDashboard() {
    const t = useTranslations('admin');
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [levelPrices, setLevelPrices] = useState<Record<number, number>>({});
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    // Bundle edit modal
    const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
    const [isCreatingBundle, setIsCreatingBundle] = useState(false);

    // Delete confirm modal
    const [deletingBundle, setDeletingBundle] = useState<Bundle | null>(null);

    useEffect(() => {
        setMounted(true);
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            const response = await fetch('/api/admin/prices');
            if (response.ok) {
                const data: PricesData = await response.json();
                setLevelPrices(data.levelPrices);
                setBundles(data.bundles);
            }
        } catch (error) {
            console.error('Error fetching prices:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateLevelPrice = (level: number, price: number) => {
        setLevelPrices(prev => ({ ...prev, [level]: price }));
    };

    const handleSaveLevelPrices = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/prices/levels', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prices: levelPrices })
            });

            if (response.ok) {
                setAlertModal({
                    isOpen: true,
                    type: 'success',
                    title: t('saved'),
                    message: '',
                });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to save level prices',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBundle = async (bundle: Bundle) => {
        try {
            const isNew = !bundle.id;
            const url = isNew ? '/api/admin/bundles' : `/api/admin/bundles/${bundle.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bundle)
            });

            if (response.ok) {
                const savedBundle = await response.json();
                if (isNew) {
                    setBundles(prev => [...prev, savedBundle]);
                } else {
                    setBundles(prev => prev.map(b => b.id === savedBundle.id ? savedBundle : b));
                }
                setEditingBundle(null);
                setIsCreatingBundle(false);
                setAlertModal({
                    isOpen: true,
                    type: 'success',
                    title: t('saved'),
                    message: '',
                });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to save bundle',
            });
        }
    };

    const handleDeleteBundle = async () => {
        if (!deletingBundle) return;

        try {
            const response = await fetch(`/api/admin/bundles/${deletingBundle.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setBundles(prev => prev.filter(b => b.id !== deletingBundle.id));
                setDeletingBundle(null);
                setAlertModal({
                    isOpen: true,
                    type: 'success',
                    title: 'Deleted',
                    message: '',
                });
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to delete bundle',
            });
        }
    };

    const getBundleColor = (code: string) => {
        return bundleColors[code] || { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-400/30' };
    };

    if (!mounted || loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-3xl font-bold">{t('loading')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-coral to-orange-400 bg-clip-text text-transparent">
                        {t('title')}
                    </h1>
                </motion.div>

                {/* Level Prices Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <GlassCard className="p-6" heavy hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📚</span>
                                <h2 className="text-xl font-bold">{t('levelPrices')}</h2>
                            </div>
                            <motion.button
                                onClick={handleSaveLevelPrices}
                                disabled={isSaving}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSaving ? (
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {t('saveSettings')}
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((level) => (
                                <motion.div
                                    key={level}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative overflow-hidden rounded-2xl p-4 bg-white/5 border border-white/10 shadow-lg"
                                >
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${levelGradients[level]}`} />

                                    <div className="text-center mb-3">
                                        <span className={`text-lg font-bold bg-gradient-to-r ${levelGradients[level]} bg-clip-text text-transparent`}>
                                            HSK {level}
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">$</span>
                                        <input
                                            type="number"
                                            value={levelPrices[level] || 0}
                                            onChange={(e) => updateLevelPrice(level, Number(e.target.value))}
                                            className="w-full px-3 pl-7 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none text-center text-xl font-bold"
                                            step="0.01"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Bundle Prices Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <GlassCard className="p-6" heavy hover={false}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🎁</span>
                                <h2 className="text-xl font-bold">{t('bundlePrices')}</h2>
                            </div>
                            <motion.button
                                onClick={() => setIsCreatingBundle(true)}
                                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Bundle
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bundles.map((bundle) => {
                                const colors = getBundleColor(bundle.code);
                                return (
                                    <motion.div
                                        key={bundle.id}
                                        whileHover={{ scale: 1.01 }}
                                        className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-lg`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-2xl">{bundle.icon || '📦'}</span>
                                                    <h3 className="text-lg font-bold">{bundle.nameSc}</h3>
                                                </div>
                                                <p className="text-sm text-text-muted mb-2">
                                                    HSK {bundle.levels.sort((a, b) => a - b).join(', ')}
                                                </p>
                                                <p className="text-sm text-text-muted">
                                                    {bundle.descriptionSc}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingBundle(bundle)}
                                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeletingBundle(bundle)}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-3xl font-bold text-coral">
                                            ${bundle.price.toFixed(2)}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {bundles.length === 0 && (
                            <div className="text-center py-12 text-text-muted">
                                No bundles yet. Click &quot;Add Bundle&quot; to create one.
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Bundle Edit Modal */}
            <AnimatePresence>
                {(editingBundle || isCreatingBundle) && (
                    <BundleEditModal
                        bundle={editingBundle || undefined}
                        onClose={() => {
                            setEditingBundle(null);
                            setIsCreatingBundle(false);
                        }}
                        onSave={handleSaveBundle}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!deletingBundle}
                title="Delete Bundle"
                message={`Are you sure you want to delete "${deletingBundle?.nameSc}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteBundle}
                onCancel={() => setDeletingBundle(null)}
                danger
            />
        </div>
    );
}
