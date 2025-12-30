'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { updateHSKLevel } from '@/lib/actions/hsk';
import type { Locale } from '@/lib/i18n/request';

interface HSKLevelData {
    level: number;
    titleEn: string;
    titleSc: string;
    titleTc: string;
    descriptionEn: string;
    descriptionSc: string;
    descriptionTc: string;
    wordCount: number;
}

interface HSKLevelEditClientProps {
    locale: Locale;
    hskLevel: HSKLevelData;
}

const UI_TEXT = {
    sc: {
        editTitle: '编辑 HSK',
        wordCount: '目标词量',
        levelTitle: '等级标题',
        description: '课程描述',
        cancel: '取消',
        save: '保存设置',
        subtitle: '管理该等级在不同语言下的显示内容'
    },
    tc: {
        editTitle: '編輯 HSK',
        wordCount: '目標詞量',
        levelTitle: '等級標題',
        description: '課程描述',
        cancel: '取消',
        save: '保存設置',
        subtitle: '管理該等級在不同語言下的顯示內容'
    },
    en: {
        editTitle: 'Edit HSK',
        wordCount: 'Word Count Target',
        levelTitle: 'Level Title',
        description: 'Description',
        cancel: 'Cancel',
        save: 'Save Settings',
        subtitle: 'Manage level metadata across multiple languages'
    }
};

export function HSKLevelEditClient({ locale, hskLevel }: HSKLevelEditClientProps) {
    const t = useTranslations('hsk');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(hskLevel);

    // Persist form data to sessionStorage to prevent loss on locale switch
    useEffect(() => {
        const saved = sessionStorage.getItem(`hsk-edit-state-${hskLevel.level}`);
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved state', e);
            }
        }
    }, [hskLevel.level]);

    useEffect(() => {
        sessionStorage.setItem(`hsk-edit-state-${hskLevel.level}`, JSON.stringify(formData));
    }, [formData, hskLevel.level]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const result = await updateHSKLevel(hskLevel.level, {
            titleEn: formData.titleEn,
            titleSc: formData.titleSc,
            titleTc: formData.titleTc,
            descriptionEn: formData.descriptionEn,
            descriptionSc: formData.descriptionSc,
            descriptionTc: formData.descriptionTc,
            wordCount: parseInt(formData.wordCount as any),
        });

        if (result.success) {
            sessionStorage.removeItem(`hsk-edit-state-${hskLevel.level}`);
            router.push(`/${locale}/hsk?${searchParams.toString()}`);
        } else {
            alert('Failed to save changes');
        }
        setIsSaving(false);
    };

    const categories = [
        { id: 'sc', name: '简体中文 (SC)' },
        { id: 'tc', name: '繁體中文 (TC)' },
        { id: 'en', name: 'English (EN)' },
    ];

    const currentUI = UI_TEXT[locale as keyof typeof UI_TEXT] || UI_TEXT.en;

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b border-gray-100 pb-6">
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                {currentUI.editTitle} {hskLevel.level}
                            </h1>
                            <p className="text-base text-text-secondary mt-1">
                                {currentUI.subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Word Count */}
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                {currentUI.wordCount}
                            </label>
                            <input
                                type="number"
                                value={formData.wordCount}
                                onChange={(e) => setFormData({ ...formData, wordCount: parseInt(e.target.value) })}
                                className="w-full sm:w-64 px-6 py-4 rounded-2xl border-2 border-coral/10 focus:border-coral bg-white text-xl font-bold outline-none transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Language Sections */}
                        <div className="grid grid-cols-1 gap-6">
                            {categories.map((cat) => (
                                <div key={cat.id} className="p-6 bg-white rounded-3xl border-2 border-gray-50 shadow-sm">
                                    <h2 className="text-xl font-black text-coral mb-4 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse" />
                                        {cat.name}
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                                                {currentUI.levelTitle}
                                            </label>
                                            <input
                                                type="text"
                                                value={(formData as any)[`title${cat.id.charAt(0).toUpperCase()}${cat.id.slice(1)}`]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    [`title${cat.id.charAt(0).toUpperCase()}${cat.id.slice(1)}`]: e.target.value
                                                })}
                                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-coral outline-none transition-all bg-gray-50/50 text-base font-medium"
                                                placeholder={`e.g. HSK ${hskLevel.level}`}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                                                {currentUI.description}
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={(formData as any)[`description${cat.id.charAt(0).toUpperCase()}${cat.id.slice(1)}`]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    [`description${cat.id.charAt(0).toUpperCase()}${cat.id.slice(1)}`]: e.target.value
                                                })}
                                                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-coral outline-none transition-all bg-gray-50/50 resize-none text-base leading-relaxed"
                                                placeholder="..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 sticky bottom-8 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-xl">
                        <button
                            type="button"
                            onClick={() => {
                                sessionStorage.removeItem(`hsk-edit-state-${hskLevel.level}`);
                                router.back();
                            }}
                            className="flex-1 py-4 px-8 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest text-sm"
                        >
                            {currentUI.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`flex-[2] py-4 px-8 rounded-2xl font-black text-white transition-all shadow-coral/20 shadow-2xl uppercase tracking-[0.2em] text-sm ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-coral hover:bg-coral-dark hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isSaving ? '...' : currentUI.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
