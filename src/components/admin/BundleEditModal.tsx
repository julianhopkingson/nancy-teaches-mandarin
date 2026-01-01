'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

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

interface BundleEditModalProps {
    bundle?: Bundle;
    onClose: () => void;
    onSave: (bundle: Bundle) => void;
}

const defaultBundle: Bundle = {
    id: '',
    code: '',
    nameEn: '',
    nameSc: '',
    nameTc: '',
    descriptionEn: '',
    descriptionSc: '',
    descriptionTc: '',
    icon: '📦',
    price: 0,
    isActive: true,
    sortOrder: 0,
    levels: []
};

const iconOptions = ['🌱', '🚀', '🏆', '✨', '📦', '🎁', '💎', '🌟', '🎯', '📚'];

export function BundleEditModal({ bundle, onClose, onSave }: BundleEditModalProps) {
    const t = useTranslations('admin');
    const [form, setForm] = useState<Bundle>(bundle || defaultBundle);
    const [saving, setSaving] = useState(false);

    const isNew = !bundle?.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Generate code for new bundles
            const finalCode = isNew
                ? form.nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                : form.code;

            await onSave({
                ...form,
                code: finalCode
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleLevel = (level: number) => {
        setForm(prev => ({
            ...prev,
            levels: prev.levels.includes(level)
                ? prev.levels.filter(l => l !== level)
                : [...prev.levels, level].sort((a, b) => a - b)
        }));
    };

    // 禁止背景滚动
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
                className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
            >
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-5xl shadow-2xl pointer-events-auto max-h-[95vh] overflow-y-auto border border-gray-100 dark:border-gray-700">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {isNew ? t('newBundle') : t('editBundle')}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Top Section: Included Levels & Price */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-center">

                            {/* Left: Included Levels (6 cols) */}
                            <div className="lg:col-span-6">
                                <label className="block text-lg font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-2">
                                    {t('includedLevels')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => toggleLevel(level)}
                                            className={`w-10 h-10 rounded-full font-bold text-sm transition-all border-2 ${form.levels.includes(level)
                                                ? 'bg-coral border-coral text-white shadow-lg shadow-coral/30 scale-105'
                                                : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-400 hover:border-coral/50'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Price (6 cols) - Reduced Input Size */}
                            <div className="lg:col-span-6 flex justify-end">
                                <div className="text-right">
                                    <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                        {t('priceUsd')}
                                    </label>
                                    <div className="group relative inline-flex items-baseline cursor-text">
                                        <span className="text-2xl font-bold text-coral mr-1">$</span>
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                            className="!w-[225px] text-right bg-transparent border-b-2 border-gray-100 dark:border-gray-700 group-hover:border-coral/30 focus:border-coral outline-none text-4xl font-black text-gray-900 dark:text-white placeholder-gray-200 transition-colors p-0 leading-none"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 dark:bg-gray-700 mb-8" />

                        {/* Localization Section: 3 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                            {/* English Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">English</h3>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={form.nameEn}
                                        onChange={(e) => setForm(prev => ({ ...prev, nameEn: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-coral/20 outline-none font-medium transition-all"
                                        placeholder="Bundle Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <textarea
                                        value={form.descriptionEn || ''}
                                        onChange={(e) => setForm(prev => ({ ...prev, descriptionEn: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-coral/20 outline-none text-sm min-h-[120px] transition-all"
                                        placeholder="Description (one feature per line)"
                                    />
                                </div>
                            </div>

                            {/* Simplified Chinese Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">简体中文</h3>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={form.nameSc}
                                        onChange={(e) => setForm(prev => ({ ...prev, nameSc: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-coral/20 outline-none font-medium transition-all"
                                        placeholder="套餐名称"
                                        required
                                    />
                                </div>
                                <div>
                                    <textarea
                                        value={form.descriptionSc || ''}
                                        onChange={(e) => setForm(prev => ({ ...prev, descriptionSc: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-coral/20 outline-none text-sm min-h-[120px] transition-all"
                                        placeholder="套餐说明（每行一点）"
                                    />
                                </div>
                            </div>

                            {/* Traditional Chinese Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">繁體中文</h3>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={form.nameTc}
                                        onChange={(e) => setForm(prev => ({ ...prev, nameTc: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-coral/20 outline-none font-medium transition-all"
                                        placeholder="套餐名稱"
                                        required
                                    />
                                </div>
                                <div>
                                    <textarea
                                        value={form.descriptionTc || ''}
                                        onChange={(e) => setForm(prev => ({ ...prev, descriptionTc: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-coral/20 outline-none text-sm min-h-[120px] transition-all"
                                        placeholder="套餐說明（每行一點）"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !form.nameEn || form.levels.length === 0}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-coral to-orange-600 text-white font-bold shadow-lg shadow-coral/30 hover:shadow-xl hover:shadow-coral/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? t('saving') : t('saveBundle')}
                            </button>
                        </div>

                    </form>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

