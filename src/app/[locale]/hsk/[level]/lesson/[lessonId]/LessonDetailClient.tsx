'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LessonContentItem } from '@/components/lesson/LessonContentItem';

import { createLessonContent, deleteLessonContent, reorderLessonContent } from '@/lib/actions/lesson';

// --- Types ---
interface ContentItem {
    id: string;
    type: string;
    title: string;
    url: string | null;
    youtubeId: string | null;
    order: number;
}

interface LessonDetailClientProps {
    lessonId: string;
    initialContents: ContentItem[];
    isAdmin: boolean;
    isLocked: boolean;
    userEmail?: string;
    title: string;
    description: string | null;
}

// --- Sortable Item Wrapper ---
function SortableItem({ id, children, isEditing }: { id: string; children: React.ReactNode; isEditing: boolean }) {
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
        <div ref={setNodeRef} style={style} className="relative group">
            {isEditing && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute left-[-40px] top-1/2 -translate-y-1/2 p-2 cursor-grab text-gray-400 hover:text-coral active:cursor-grabbing"
                    title="Drag to reorder"
                >
                    ⋮⋮
                </div>
            )}
            {children}
        </div>
    );
}

export function LessonDetailClient({
    lessonId,
    initialContents,
    isAdmin,
    isLocked,
    userEmail,
    title,
    description,
}: LessonDetailClientProps) {
    const tContent = useTranslations('content'); // Ensure 'content' namespace has needed keys
    const tHsk = useTranslations('hsk');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isEditing = searchParams.get('edit') === 'true';

    const [contents, setContents] = useState<ContentItem[]>(initialContents);
    const [isSaving, setIsSaving] = useState(false);

    // Add Content Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState<'video' | 'audio' | 'doc'>('video');

    useEffect(() => {
        setContents(initialContents);
    }, [initialContents]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = contents.findIndex((item) => item.id === active.id);
            const newIndex = contents.findIndex((item) => item.id === over?.id);
            const newItems = arrayMove(contents, oldIndex, newIndex);

            // Optimistic UI update
            setContents(newItems);

            // Sync with server
            const reorderData = newItems.map((item, index) => ({
                id: item.id,
                order: index + 1,
            }));

            await reorderLessonContent(reorderData);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(tContent('confirmDelete'))) return;

        const result = await deleteLessonContent(id);
        if (result.success) {
            setContents(prev => prev.filter(item => item.id !== id));
            router.refresh();
        } else {
            alert('Failed to delete content');
        }
    };

    const handleAddContent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const url = formData.get('url') as string;
        const youtubeId = formData.get('youtubeId') as string;

        const result = await createLessonContent({
            lessonId,
            type: addType,
            title,
            url: addType !== 'video' ? url : undefined,
            youtubeId: addType === 'video' ? youtubeId : undefined,
            order: contents.length + 1,
        });

        if (result.success) {
            setShowAddModal(false);
            router.refresh(); // Refresh to get new data
        } else {
            alert('Failed to create content');
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-text-secondary">{description}</p>
                    )}
                </div>

                {isAdmin && (
                    <motion.button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            if (isEditing) {
                                params.delete('edit');
                            } else {
                                params.set('edit', 'true');
                            }
                            router.push(`${pathname}?${params.toString()}`);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center transition-colors active:bg-green-50 ${isEditing ? 'text-green-500' : 'text-text-secondary hover:text-coral'
                            }`}
                        title={isEditing ? tHsk('button.finish') : tHsk('button.editLesson')}
                    >
                        {isEditing ? (
                            <span className="text-xl font-bold">S</span>
                        ) : (
                            <span className="text-xl">✏️</span>
                        )}
                    </motion.button>
                )}
            </div>

            {/* Admin Add Buttons */}
            {isAdmin && isEditing && (
                <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-sm font-medium text-text-muted self-center mr-2">
                        {tHsk('button.addContent')}:
                    </span>
                    <button onClick={() => { setAddType('video'); setShowAddModal(true); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-colors">
                        📺 {tHsk('button.video')}
                    </button>
                    <button onClick={() => { setAddType('audio'); setShowAddModal(true); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-colors">
                        🎧 {tHsk('button.audio')}
                    </button>
                    <button onClick={() => { setAddType('doc'); setShowAddModal(true); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-colors">
                        📄 {tHsk('button.document')}
                    </button>
                </div>
            )}

            {/* Content Stream with DnD */}
            <div className="space-y-8">
                {contents.length === 0 ? (
                    <div className="text-center py-12 text-text-muted bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                        {tHsk('message.noLessons') || "Lesson has no content."}
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={contents.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {contents.map((content) => (
                                <SortableItem key={content.id} id={content.id} isEditing={isEditing}>
                                    <div className="relative group">
                                        {isAdmin && isEditing && (
                                            <button
                                                onClick={() => handleDelete(content.id)}
                                                className="absolute top-2 right-2 p-2 text-red-400 hover:bg-red-500/10 rounded-full z-10"
                                                title={tHsk('button.delete')}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                        <LessonContentItem
                                            content={content}
                                            userEmail={userEmail}
                                            isLocked={isLocked}
                                        />
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Add Content Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 capitalize">{tHsk('button.addContent')} - {addType}</h2>
                        <form onSubmit={handleAddContent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                <input name="title" required className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-transparent" placeholder="Content Title" />
                            </div>

                            {addType === 'video' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">YouTube ID</label>
                                    <input name="youtubeId" required className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-transparent" placeholder="e.g. dQw4w9WgXcQ" />
                                </div>
                            )}

                            {(addType === 'audio' || addType === 'doc') && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">URL</label>
                                    <input name="url" required className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-transparent" placeholder="https://..." />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">{tHsk('button.cancel')}</button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-coral text-white hover:bg-coral/90">
                                    {isSaving ? tHsk('button.save') : tHsk('button.addContent')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
