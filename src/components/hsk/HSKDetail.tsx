'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CircleIconButton } from '@/components/ui/CircleIconButton';
import { createLesson, reorderLessons, deleteLesson, updateLessonStatus } from '@/lib/actions/lesson';
import type { Locale } from '@/lib/i18n/request';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Lesson {
    id: string;
    title: string;
    description: string | null;
    isFree: boolean;
    _count: {
        contents: number;
    };
}

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

interface HSKDetailProps {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    locale: Locale;
    lessons: Lesson[];
    isAdmin?: boolean;
    hskData?: HSKLevelData | null;
}

const levelEmojis = ['🍀', '🌊', '🌀', '💜', '🌸', '🔮'];

function SortableLessonItem({ id, children, isEditing }: { id: string; children: React.ReactNode; isEditing: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative h-full">
            {isEditing && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute z-10 -left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab text-gray-400 hover:text-coral active:cursor-grabbing"
                    title="Drag to reorder"
                >
                    ⋮⋮
                </div>
            )}
            {children}
        </div>
    );
}

export function HSKDetail({ level, locale, lessons = [], isAdmin = false, hskData }: HSKDetailProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localLessons, setLocalLessons] = useState<Lesson[]>(lessons);

    // URL-based edit state
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isEditing = searchParams.get('edit') === 'true';

    const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);

    const t = useTranslations('hsk');
    const tCommon = useTranslations('common');
    const tContent = useTranslations('content');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setLocalLessons(lessons);
    }, [lessons]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = localLessons.findIndex((item) => item.id === active.id);
            const newIndex = localLessons.findIndex((item) => item.id === over?.id);
            const newItems = arrayMove(localLessons, oldIndex, newIndex);

            // Optimistic UI update
            setLocalLessons(newItems);

            // Sync with server
            const reorderData = newItems.map((item, index) => ({
                id: item.id,
                order: index + 1,
            }));

            await reorderLessons(reorderData);
        }
    };

    const handleCreateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const isFree = formData.get('isFree') === 'on';

        try {
            const result = await createLesson({
                title,
                description,
                level,
                order: localLessons.length + 1,
                isFree,
            });

            if (result.success) {
                setShowAddModal(false);
                router.refresh();
            } else {
                alert('Failed to create lesson: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
        setIsSubmitting(false);
    };

    const handleToggleFree = async (lessonId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        // Optimistic update
        setLocalLessons(prev => prev.map(l => l.id === lessonId ? { ...l, isFree: newStatus } : l));

        try {
            const result = await updateLessonStatus(lessonId, newStatus);
            if (!result.success) {
                // Rollback
                setLocalLessons(prev => prev.map(l => l.id === lessonId ? { ...l, isFree: currentStatus } : l));
                alert('Failed to update status');
            }
        } catch (error) {
            setLocalLessons(prev => prev.map(l => l.id === lessonId ? { ...l, isFree: currentStatus } : l));
            alert('An error occurred');
        }
    };

    const handleDeleteLesson = async () => {
        if (!lessonToDelete) return;
        setIsSubmitting(true);
        try {
            const result = await deleteLesson(lessonToDelete);
            if (result.success) {
                setLessonToDelete(null);
                setLocalLessons(prev => prev.filter(l => l.id !== lessonToDelete));
                router.refresh();
            } else {
                alert('Failed to delete lesson');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
        setIsSubmitting(false);
    };

    // ... render ...

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 hsk-detail-container">

            <div className="max-w-6xl mx-auto">
                {/* Header Section with Back Link */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link
                        href={`/${locale}/hsk`}
                        className="group inline-flex items-center gap-3 mb-6"
                    >
                        <CircleIconButton
                            as={motion.div}
                            className="bg-white text-text-secondary group-hover:text-coral"
                            whileTap={{ scale: 0.9, backgroundColor: '#dcfce7' }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </CircleIconButton>
                        <span className="text-text-muted group-hover:text-coral transition-colors font-medium">
                            {t('button.backToCourseList')}
                        </span>
                    </Link>
                </motion.div>

                {/* HSK Title Card & Admin Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`flex items-center justify-between p-6 rounded-2xl hsk-gradient-${level} text-white mb-8 shadow-lg`}
                >
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">
                                    {hskData ? (
                                        locale === 'en' ? hskData.titleEn :
                                            locale === 'tc' ? hskData.titleTc :
                                                hskData.titleSc
                                    ) : `HSK ${level}`}
                                </h1>
                                {hskData && (
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30 whitespace-nowrap">
                                        {hskData.wordCount} {t('words')}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30 whitespace-nowrap">
                                    {localLessons.length} {t('lessons')}
                                </span>
                            </div>
                            <p className="text-white/80">
                                {hskData ? (
                                    locale === 'en' ? hskData.descriptionEn :
                                        locale === 'tc' ? hskData.descriptionTc :
                                            hskData.descriptionSc
                                ) : t('description.' + level)}
                            </p>
                        </div>
                    </div>

                    {isAdmin && (
                        <CircleIconButton
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                if (isEditing) {
                                    params.delete('edit');
                                } else {
                                    params.set('edit', 'true');
                                }
                                router.push(`${pathname}?${params.toString()}`);
                            }}
                            isActive={isEditing}
                            title={isEditing ? t('button.finish') : t('button.editResults')}
                        >
                            {isEditing ? (
                                <span className="text-xl font-bold">S</span>
                            ) : (
                                <span className="text-xl">✏️</span>
                            )}
                        </CircleIconButton>
                    )}
                </motion.div>

                {/* Lesson List */}
                <div className="space-y-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={localLessons.map(l => l.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {localLessons.length > 0 ? (
                                    localLessons.map((lesson, index) => (
                                        <SortableLessonItem key={lesson.id} id={lesson.id} isEditing={isEditing}>
                                            <div className="relative h-full">
                                                <Link
                                                    href={`/${locale}/hsk/${level}/lesson/${lesson.id}`}
                                                    className={isEditing ? 'pointer-events-none' : ''}
                                                    onClick={(e) => {
                                                        if (!lesson.isFree && !isAdmin) {
                                                            e.preventDefault();
                                                            alert(t('message.purchaseRequired'));
                                                        }
                                                    }}
                                                >
                                                    <motion.div
                                                        className={`p-6 rounded-2xl transition-all h-full flex flex-col group relative overflow-hidden bg-white dark:bg-gray-800 border-2 shadow-lg hover:shadow-xl backdrop-blur-sm ${isEditing ? 'border-dashed border-coral/30' : 'border-gray-100 dark:border-gray-700 cursor-pointer'
                                                            }`}
                                                        whileHover={!isEditing ? { scale: 1.02 } : {}}
                                                        whileTap={!isEditing ? { scale: 0.98 } : {}}
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <span className={`text-sm font-bold bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full ${lesson.isFree ? 'text-green-500' : 'text-coral'}`}>
                                                                Lesson {index + 1}
                                                            </span>
                                                            <div className="flex items-center gap-2 pointer-events-auto">
                                                                {/* Edit Mode: Show Free Toggle & Delete Button */}
                                                                {isAdmin && isEditing ? (
                                                                    <div className="flex items-center gap-4">
                                                                        <label className="flex items-center gap-2 cursor-pointer group/toggle">
                                                                            <span className="text-xs font-medium text-text-muted group-hover/toggle:text-coral transition-colors">
                                                                                {t('label.isFreeShort')}
                                                                            </span>
                                                                            <div
                                                                                onClick={(e) => {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    handleToggleFree(lesson.id, lesson.isFree);
                                                                                }}
                                                                                className={`w-10 h-5 rounded-full relative transition-colors ${lesson.isFree ? 'bg-green-500' : 'bg-gray-200'}`}
                                                                            >
                                                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${lesson.isFree ? 'right-1' : 'left-1'}`} />
                                                                            </div>
                                                                        </label>
                                                                        <CircleIconButton
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setLessonToDelete(lesson.id);
                                                                            }}
                                                                            className="z-10 text-red-400 hover:text-red-500 hover:shadow-md"
                                                                            title={t('button.delete')}
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                            </svg>
                                                                        </CircleIconButton>
                                                                    </div>
                                                                ) : (
                                                                    /* Standard Mode: Show Lock Icon only for non-free lessons */
                                                                    !lesson.isFree && (
                                                                        isAdmin ? (
                                                                            <div title="Unlocked">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-500">
                                                                                    <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z" />
                                                                                </svg>
                                                                            </div>
                                                                        ) : (
                                                                            <div title="Locked">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500">
                                                                                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        )
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{lesson.title}</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                                                            {lesson.description || t('message.noLessons')}
                                                        </p>
                                                    </motion.div>
                                                </Link>
                                            </div>
                                        </SortableLessonItem>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12 text-text-muted bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                                        {t('message.noLessons')}
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {isAdmin && isEditing && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setShowAddModal(true)}
                            className="w-full py-4 border-2 border-dashed border-coral/30 hover:border-coral/60 rounded-2xl text-coral hover:bg-coral/5 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {t('button.addLesson')}
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {lessonToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center"
                    >
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                            {t('button.deleteLesson')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {t('message.deleteLessonConfirm')}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setLessonToDelete(null)}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                            >
                                {t('button.cancel')}
                            </button>
                            <button
                                onClick={handleDeleteLesson}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-lg shadow-red-500/30"
                            >
                                {isSubmitting ? '...' : t('button.delete')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Lesson Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            {t('button.addLesson')}
                        </h2>
                        <form onSubmit={handleCreateLesson} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    {t('label.lessonTitle')}
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-coral bg-transparent dark:text-white focus:ring-2 focus:ring-coral/50 outline-none"
                                    placeholder="e.g. Lesson 1: Greetings"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    {t('label.lessonDescription')}
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-coral bg-transparent dark:text-white focus:ring-2 focus:ring-coral/50 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    name="isFree"
                                    id="isFree"
                                    className="w-5 h-5 rounded border-coral text-coral focus:ring-coral/50 cursor-pointer"
                                />
                                <label htmlFor="isFree" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    {t('label.isFree')}
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                    {t('button.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-coral text-white font-medium hover:bg-coral-dark transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? t('button.save') : t('button.addLesson')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
