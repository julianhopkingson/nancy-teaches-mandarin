'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    const [form, setForm] = useState<Bundle>(bundle || defaultBundle);
    const [saving, setSaving] = useState(false);

    const isNew = !bundle?.id;

    // Auto-generate code from English name for new bundles
    useEffect(() => {
        if (isNew && form.nameEn) {
            const slug = form.nameEn
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setForm(prev => ({ ...prev, code: slug }));
        }
    }, [form.nameEn, isNew]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await onSave(form);
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
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">
                            {isNew ? 'Create Bundle' : 'Edit Bundle'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Code */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Code (Unique ID)
                            </label>
                            <p className="text-xs text-gray-400 mb-2">Used for system logic (e.g. 'all' is best value). Auto-generated for new bundles.</p>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
                                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none"
                                placeholder="e.g. beginner-pack"
                                required
                            />
                        </div>

                        {/* Names */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">English Name</label>
                                <input
                                    type="text"
                                    value={form.nameEn}
                                    onChange={(e) => setForm(prev => ({ ...prev, nameEn: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">简体中文</label>
                                <input
                                    type="text"
                                    value={form.nameSc}
                                    onChange={(e) => setForm(prev => ({ ...prev, nameSc: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">繁體中文</label>
                                <input
                                    type="text"
                                    value={form.nameTc}
                                    onChange={(e) => setForm(prev => ({ ...prev, nameTc: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">EN Description (Split by newline for bullet points)</label>
                                <textarea
                                    value={form.descriptionEn || ''}
                                    onChange={(e) => setForm(prev => ({ ...prev, descriptionEn: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none text-sm min-h-[80px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">简中说明 (换行分隔)</label>
                                <textarea
                                    value={form.descriptionSc || ''}
                                    onChange={(e) => setForm(prev => ({ ...prev, descriptionSc: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none text-sm min-h-[80px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">繁中說明 (換行分隔)</label>
                                <textarea
                                    value={form.descriptionTc || ''}
                                    onChange={(e) => setForm(prev => ({ ...prev, descriptionTc: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:border-coral focus:outline-none text-sm min-h-[80px]"
                                />
                            </div>
                        </div>

                        {/* Price */}
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Price (USD)</label>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-coral">$</span>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    className="w-40 px-1 py-1 bg-transparent border-b-2 border-coral/30 focus:border-coral outline-none text-4xl font-bold text-coral placeholder-coral/50 transition-colors"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Levels */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Included Levels</label>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {[1, 2, 3, 4, 5, 6].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => toggleLevel(level)}
                                        className={`py-3 rounded-xl font-bold transition-all ${form.levels.includes(level)
                                            ? 'bg-coral text-white'
                                            : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        HSK {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 btn-secondary py-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !form.code || !form.nameEn || !form.nameSc || !form.nameTc || form.levels.length === 0}
                                className="flex-1 btn-primary py-3 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </>
    );
}
