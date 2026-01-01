'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface LevelEditModalProps {
    level: number;
    initialPrice: number;
    onClose: () => void;
    onSave: (level: number, price: number) => void;
}

export function LevelEditModal({ level, initialPrice, onClose, onSave }: LevelEditModalProps) {
    const t = useTranslations('admin');
    const [price, setPrice] = useState(initialPrice.toString());
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate a small delay or just call onSave directly if the parent handles async
        // Here we assume parent handles the async save call.
        await onSave(level, parseFloat(price));
        setIsSaving(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-24 h-16 mx-auto bg-coral/10 text-coral rounded-2xl flex items-center justify-center text-xl font-bold mb-4">
                            HSK {level}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Edit Price
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Set the individual purchase price for Level {level}.
                        </p>
                    </div>

                    <div className="mb-8 flex justify-center">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider text-center">
                                Price (USD)
                            </label>
                            <div className="group relative inline-flex items-baseline cursor-text justify-center">
                                <span className="text-2xl font-bold text-coral mr-1">$</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-24 text-center bg-transparent border-b-2 border-gray-100 dark:border-gray-700 group-hover:border-coral/30 focus:border-coral outline-none text-4xl font-black text-gray-900 dark:text-white placeholder-gray-200 transition-colors p-0 leading-none"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3.5 rounded-xl font-bold text-white bg-black dark:bg-white dark:text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
