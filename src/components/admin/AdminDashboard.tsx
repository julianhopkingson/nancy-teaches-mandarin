import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import { AlertModal } from '@/components/ui/AlertModal';
import { BundleEditModal } from './BundleEditModal';
import { LevelEditModal } from './LevelEditModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ProductCard } from '../payment/ProductCard';

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

// Helper to get localized bundle name
function getBundleName(bundle: Bundle, locale: string): string {
    if (locale === 'sc') return bundle.nameSc || bundle.nameEn;
    if (locale === 'tc') return bundle.nameTc || bundle.nameEn;
    return bundle.nameEn;
}

// Helper to get localized bundle description
function getBundleDescription(bundle: Bundle, locale: string): string | null {
    if (locale === 'sc') return bundle.descriptionSc || bundle.descriptionEn;
    if (locale === 'tc') return bundle.descriptionTc || bundle.descriptionEn;
    return bundle.descriptionEn;
}

export function AdminDashboard() {
    const t = useTranslations('admin');
    const locale = useLocale();
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

    // Level edit modal
    const [editingLevel, setEditingLevel] = useState<{ level: number; price: number } | null>(null);

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

    const handleSaveLevelPrice = async (level: number, newPrice: number) => {
        try {
            // Optimistic update
            const updatedPrices = { ...levelPrices, [level]: newPrice };
            setLevelPrices(updatedPrices);
            setEditingLevel(null);

            const response = await fetch('/api/admin/prices/levels', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prices: updatedPrices })
            });

            if (response.ok) {
                setAlertModal({
                    isOpen: true,
                    type: 'success',
                    title: t('saved'),
                    message: `HSK ${level} price updated`,
                });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            setAlertModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to save level price',
            });
            fetchPrices(); // Revert
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

    if (!mounted || loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-3xl font-bold text-gray-400">{t('loading')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-background dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <div className="mt-6 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('productConsole')}
                    </h1>
                </div>

                <section>
                    <h2 className="text-lg font-bold uppercase text-gray-900 dark:text-gray-100 tracking-wider mb-4">{t('levelPricing')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <div key={level} className="group relative transition-transform duration-200 hover:scale-[1.02]">
                                <ProductCard
                                    id={`level-${level}`}
                                    type="level"
                                    title={`HSK ${level}`}
                                    subtitle=""
                                    price={levelPrices[level] || 0}
                                    priceLabel="Price"
                                    selected={false}
                                    onSelect={() => { }}
                                    features={[]}
                                    hideSelection={true}
                                    hideFeatures={true}
                                    variant="admin"
                                />
                                {/* Edit Overlay */}
                                <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-4 rounded-3xl z-10 scale-[0.98]">
                                    <button
                                        onClick={() => setEditingLevel({ level, price: levelPrices[level] || 0 })}
                                        className="bg-gradient-to-r from-coral to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-coral/30 hover:shadow-xl hover:shadow-coral/40 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        {t('edit')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold uppercase text-gray-900 dark:text-gray-100 tracking-wider">{t('bundleInventory')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                        {bundles.map((bundle) => (
                            <div key={bundle.id} className="group relative transition-transform duration-200 hover:scale-[1.02]">
                                <ProductCard
                                    id={bundle.code}
                                    type="bundle"
                                    title={getBundleName(bundle, locale)}
                                    subtitle={`HSK ${bundle.levels[0] || '?'} - ${bundle.levels[bundle.levels.length - 1] || '?'}`}
                                    price={bundle.price}
                                    priceLabel="Price"
                                    selected={false}
                                    onSelect={() => { }}
                                    features={getBundleDescription(bundle, locale)?.split('\n') || []}
                                    savedAmount={0}
                                    savedText=""
                                    hideSelection={true}
                                    variant="admin"
                                />
                                {/* Admin Overlay */}
                                <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-4 rounded-3xl z-10 scale-[0.98]">
                                    <button
                                        onClick={() => setEditingBundle(bundle)}
                                        className="bg-gradient-to-r from-coral to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-coral/30 hover:shadow-xl hover:shadow-coral/40 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        {t('edit')}
                                    </button>
                                    <button
                                        onClick={() => setDeletingBundle(bundle)}
                                        className="bg-white text-red-500 border border-red-100 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        {t('delete')}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Bundle Card */}
                        <motion.button
                            onClick={() => setIsCreatingBundle(true)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:text-coral hover:border-coral/50 hover:bg-coral/5 transition-all"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="font-bold text-lg">{t('createNewBundle')}</span>
                        </motion.button>
                    </div>
                </section>
            </div>

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Level Edit Modal */}
            <AnimatePresence>
                {editingLevel && (
                    <LevelEditModal
                        level={editingLevel.level}
                        initialPrice={editingLevel.price}
                        onClose={() => setEditingLevel(null)}
                        onSave={handleSaveLevelPrice}
                    />
                )}
            </AnimatePresence>

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
                title={t('deleteBundle')}
                message={t('deleteBundleConfirm', { name: deletingBundle?.nameSc || '' })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                onConfirm={handleDeleteBundle}
                onCancel={() => setDeletingBundle(null)}
                danger
            />
        </div>
    );
}
