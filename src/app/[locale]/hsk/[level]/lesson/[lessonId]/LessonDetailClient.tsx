'use client';

import { useState, useEffect, useId } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { CircleIconButton } from '@/components/ui/CircleIconButton';
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
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { AlertModal } from '@/components/ui/AlertModal';
import { CommentSection } from '@/components/comments/CommentSection';
import { PostWithUser } from '@/components/comments/types';

import { createLessonContent, deleteLessonContent, reorderLessonContent, updateLesson, updateLessonContent, updateLessonContentFile } from '@/lib/actions/lesson';

// --- Types ---
interface ContentItem {
    id: string;
    type: string;
    title: string;
    description?: string;
    url: string | null;
    originalName?: string | null;
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
    initialPosts: PostWithUser[];
    currentUser: any;
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
        <div ref={setNodeRef} style={style} className={`relative transition-all ${isEditing ? 'border-2 border-dashed border-coral/30 rounded-2xl p-4 my-2' : 'mb-4'}`}>
            {isEditing && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab text-gray-400 hover:text-coral active:cursor-grabbing z-20"
                    title="Drag to reorder"
                >
                    ⋮⋮
                </div>
            )}
            <div className={isEditing ? 'pl-6' : ''}>
                {children}
            </div>
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
    initialPosts,
    currentUser,
}: LessonDetailClientProps) {
    const tContent = useTranslations('content'); // Ensure 'content' namespace has needed keys
    const tHsk = useTranslations('hsk');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isEditing = searchParams.get('edit') === 'true';

    const [contents, setContents] = useState<ContentItem[]>(initialContents);
    const [isSaving, setIsSaving] = useState(false);
    const dndContextId = useId();

    // Add Content Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [addType, setAddType] = useState<'video' | 'audio' | 'doc'>('video');
    const [autoTitle, setAutoTitle] = useState('');  // Auto-filled title from file/YouTube
    const [autoDescription, setAutoDescription] = useState(''); // Auto-filled description for overwrite

    // File Overwrite Mode State
    const [isOverwriteMode, setIsOverwriteMode] = useState(false);
    const [overwriteContentId, setOverwriteContentId] = useState<string | null>(null);
    const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingFileName, setPendingFileName] = useState('');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // Alert Modal State
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'error', title: '', message: '' });

    const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setAlertModal({ isOpen: true, type, title, message });
    };

    // Extract filename and check for duplicates
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

            // Check if file with same name already exists in this lesson
            const existingContent = contents.find(c => {
                if (c.type !== 'audio' && c.type !== 'doc') return false;

                // 1. Check originalName (new data)
                if (c.originalName === file.name) return true;

                // 2. Fallback: Check derived name from URL (legacy data)
                // URL format: /uploads/folder/uuid-originalName.ext
                if (!c.originalName && c.url) {
                    try {
                        const urlFileName = c.url.split('/').pop(); // uuid-originalName.ext
                        if (urlFileName) {
                            // Try to extract original name by removing UUID prefix (36 chars + 1 hyphen)
                            // UUID is 36 chars long. 
                            const parts = urlFileName.split('-');
                            if (parts.length >= 6) { // uuid has 5 parts + at least 1 part for filename
                                // Reconstruct possible original name
                                // This is tricky because filenames can have hyphens. 
                                // Let's simplify: check if URL *ends* with the new filename
                                // But URL has UUID prefix. 
                                // Better approach: Remove the first 37 chars (uuid + hyphen)
                                const potentialName = urlFileName.substring(37);
                                // Decode URI component just in case
                                return decodeURIComponent(potentialName) === file.name;
                            }
                        }
                    } catch (e) {
                        return false;
                    }
                }
                return false;
            });

            if (existingContent) {
                // Found duplicate - show confirmation dialog
                setPendingFile(file);
                setPendingFileName(file.name);
                setShowOverwriteConfirm(true);
            } else {
                // No duplicate - normal flow
                setAutoTitle(nameWithoutExt);
                setIsOverwriteMode(false);
                setOverwriteContentId(null);
            }
        }
    };

    // Handle overwrite confirmation
    const handleOverwriteConfirm = () => {
        const existingContent = contents.find(c => {
            if (c.type !== 'audio' && c.type !== 'doc') return false;

            if (c.originalName === pendingFileName) return true;

            // Fallback for legacy data
            if (!c.originalName && c.url) {
                try {
                    const urlFileName = c.url.split('/').pop();
                    if (urlFileName) {
                        const potentialName = urlFileName.substring(37);
                        return decodeURIComponent(potentialName) === pendingFileName;
                    }
                } catch (e) {
                    return false;
                }
            }
            return false;
        });
        if (existingContent && pendingFile) {
            // Fill form with existing data
            setAutoTitle(existingContent.title);
            setAutoDescription(existingContent.description || '');
            setIsOverwriteMode(true);
            setOverwriteContentId(existingContent.id);
        }
        setShowOverwriteConfirm(false);
    };

    // Handle overwrite cancel
    const handleOverwriteCancel = () => {
        setShowOverwriteConfirm(false);
        setPendingFile(null);
        setPendingFileName('');
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    // Fetch YouTube title using oEmbed API
    const handleYoutubeIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const videoId = e.target.value.trim();
        if (!videoId) return;

        try {
            const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (res.ok) {
                const data = await res.json();
                if (data.title) {
                    setAutoTitle(data.title);
                }
            }
        } catch (error) {
            // Silently fail - user can still manually enter title
            console.log('Could not fetch YouTube title');
        }
    };

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

    const handleDeleteClick = (id: string) => {
        setDeleteTargetId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTargetId) return;

        const result = await deleteLessonContent(deleteTargetId);
        if (result.success) {
            setContents(prev => prev.filter(item => item.id !== deleteTargetId));
            router.refresh();
        } else {
            showAlert('error', '删除失败', '内容删除失败，请重试');
        }

        setShowDeleteModal(false);
        setDeleteTargetId(null);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeleteTargetId(null);
    };

    const handleAddContent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const youtubeId = formData.get('youtubeId') as string;

        let url: string | undefined;
        let originalName: string | undefined;

        // Handle file upload for audio/doc
        if (addType === 'audio' || addType === 'doc') {
            // Use pendingFile if in overwrite mode, otherwise get from form
            const file = isOverwriteMode && pendingFile ? pendingFile : formData.get('file') as File;
            if (!file || file.size === 0) {
                showAlert('warning', '请选择文件', '请先选择一个文件再提交');
                setIsSaving(false);
                return;
            }

            originalName = file.name;

            // Upload file
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('type', addType);

            try {
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData,
                });
                const uploadResult = await uploadRes.json();

                if (!uploadResult.success) {
                    showAlert('error', '上传失败', uploadResult.error || '文件上传失败，请重试');
                    setIsSaving(false);
                    return;
                }

                url = uploadResult.url;
            } catch (error) {
                showAlert('error', '上传失败', '网络错误，请检查网络连接后重试');
                setIsSaving(false);
                return;
            }
        }

        // Handle overwrite mode
        if (isOverwriteMode && overwriteContentId && url && originalName) {
            const result = await updateLessonContentFile(overwriteContentId, {
                url,
                originalName,
                title,
                description,
            });

            if (result.success) {
                // Reset overwrite mode
                setIsOverwriteMode(false);
                setOverwriteContentId(null);
                setPendingFile(null);
                setPendingFileName('');
                setAutoTitle('');
                setAutoDescription('');
                setShowAddModal(false);
                router.refresh();
            } else {
                showAlert('error', '更新失败', '文件更新失败，请重试');
            }
            setIsSaving(false);
            return;
        }

        // Normal create mode
        const result = await createLessonContent({
            lessonId,
            type: addType,
            title,
            description,
            url,
            youtubeId: addType === 'video' ? youtubeId : undefined,
            order: contents.length + 1,
        });

        if (result.success) {
            setShowAddModal(false);
            setAutoTitle('');
            setAutoDescription('');
            router.refresh();
        } else {
            showAlert('error', '创建失败', '内容创建失败，请重试');
        }
        setIsSaving(false);
    };

    const handleContentUpdate = async (id: string, data: { title?: string; description?: string }) => {
        // Optimistic update
        setContents(prev => prev.map(c =>
            c.id === id ? { ...c, ...data } : c
        ));

        // Note: passing partial update to server
        const result = await updateLessonContent(id, data);
        if (!result.success) {
            // Revert on failure (could improve by keeping prev state, but simple re-fetch or error toast is tricky here without toast lib)
            console.error('Failed to update content:', result.error);
        }
    };

    const handleLessonUpdate = async (field: 'title' | 'description', value: string) => {
        // We don't have local state for lesson title/desc prop, so we rely on server revalidation or router refresh.
        // However, for smooth UX, we might want local state or just trust the blur update.
        await updateLesson(lessonId, { [field]: value });
        router.refresh();
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1 mr-4">
                    {isAdmin && isEditing ? (
                        <div className="space-y-2 mb-4">
                            <input
                                key={title} // Reset on title change
                                defaultValue={title}
                                onBlur={(e) => handleLessonUpdate('title', e.target.value)}
                                className="text-2xl font-bold text-text-primary bg-transparent border-2 border-dashed border-coral/30 rounded-lg px-2 py-1 w-full focus:outline-none focus:border-coral"
                            />
                            <textarea
                                key={description}
                                defaultValue={description || ''}
                                onBlur={(e) => handleLessonUpdate('description', e.target.value)}
                                placeholder={tHsk('label.lessonDescription')}
                                className="w-full text-text-secondary bg-transparent border-2 border-dashed border-coral/30 rounded-lg px-2 py-1 focus:outline-none focus:border-coral resize-none"
                            />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-text-primary mb-2">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-text-secondary max-w-2xl">
                                    {description}
                                </p>
                            )}
                        </>
                    )}
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
                        title={isEditing ? tHsk('button.finish') : tHsk('button.editLesson')}
                    >
                        {isEditing ? (
                            <span className="text-xl font-bold">S</span>
                        ) : (
                            <span className="text-xl">✏️</span>
                        )}
                    </CircleIconButton>
                )}
            </div>

            {/* Admin Add Buttons */}
            {isAdmin && isEditing && (
                <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-sm font-medium text-text-muted self-center mr-2">
                        {tHsk('button.addContent')}:
                    </span>
                    <button onClick={() => { setAddType('video'); setAutoTitle(''); setShowAddModal(true); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-colors">
                        📺 {tHsk('button.video')}
                    </button>
                    <button onClick={() => { setAddType('audio'); setAutoTitle(''); setShowAddModal(true); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-colors">
                        🎧 {tHsk('button.audio')}
                    </button>
                    <button onClick={() => { setAddType('doc'); setAutoTitle(''); setShowAddModal(true); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-colors">
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
                        id={dndContextId}
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
                                            <CircleIconButton
                                                onClick={() => handleDeleteClick(content.id)}
                                                className="absolute top-2 right-2 z-10 text-red-400 hover:text-red-500 hover:shadow-md"
                                                title={tHsk('button.delete')}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </CircleIconButton>
                                        )}
                                        <LessonContentItem
                                            content={content}
                                            userEmail={userEmail}
                                            isLocked={isLocked}
                                            isEditing={isEditing}
                                            onUpdate={handleContentUpdate}
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
                        <h2 className="text-xl font-bold mb-4 capitalize">{tHsk('button.addContent')} - {addType === 'doc' ? tHsk('button.document') : tHsk(`button.${addType}`)}</h2>
                        <form onSubmit={handleAddContent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{tHsk('label.contentTitle')}</label>
                                <input
                                    name="title"
                                    required
                                    value={autoTitle}
                                    onChange={(e) => setAutoTitle(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-transparent"
                                    placeholder={tHsk('label.contentTitle')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{tHsk('label.contentDescription')}</label>
                                <textarea
                                    name="description"
                                    value={autoDescription}
                                    onChange={(e) => setAutoDescription(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-transparent resize-none h-20"
                                    placeholder={tContent('label.descriptionPlaceholder')}
                                />
                            </div>

                            {addType === 'video' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{tHsk('label.youtubeId')}</label>
                                    <input
                                        name="youtubeId"
                                        required
                                        onBlur={handleYoutubeIdBlur}
                                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-transparent"
                                        placeholder="e.g. dQw4w9WgXcQ"
                                    />
                                </div>
                            )}

                            {addType === 'audio' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{tHsk('label.selectAudioFile')}</label>
                                    <input
                                        name="file"
                                        type="file"
                                        accept=".mp3,.m4a,audio/mpeg,audio/mp4"
                                        required
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-coral/10 file:text-coral hover:file:bg-coral/20"
                                    />
                                    <p className="text-xs text-text-muted mt-1">{tHsk('label.audioFormats')}</p>
                                </div>
                            )}

                            {addType === 'doc' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">{tHsk('label.selectPdfFile')}</label>
                                    <input
                                        name="file"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        required
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-coral/10 file:text-coral hover:file:bg-coral/20"
                                    />
                                    <p className="text-xs text-text-muted mt-1">仅支持 PDF 格式</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => {
                                    setShowAddModal(false);
                                    setIsOverwriteMode(false);
                                    setOverwriteContentId(null);
                                    setPendingFile(null);
                                    setPendingFileName('');
                                    setAutoTitle('');
                                    setAutoDescription('');
                                }} className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">{tHsk('button.cancel')}</button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-coral text-white hover:bg-coral/90">
                                    {isSaving ? tHsk('button.save') : (isOverwriteMode ? tHsk('label.updateFile') : tHsk('button.addContent'))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                title={tHsk('button.delete')}
                message={tHsk('button.confirmDelete')}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                confirmText={tHsk('button.delete')}
                cancelText={tHsk('button.cancel')}
            />

            {/* Alert Modal */}
            <AlertModal
                isOpen={alertModal.isOpen}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* File Overwrite Confirm Modal */}
            <DeleteConfirmModal
                isOpen={showOverwriteConfirm}
                title={tHsk('label.fileExists')}
                message={tHsk('label.fileExistsMessage')}
                onConfirm={handleOverwriteConfirm}
                onCancel={handleOverwriteCancel}
                confirmText={tHsk('label.confirmOverwrite')}
                cancelText={tHsk('button.cancel')}
            />

            {/* Comment Section */}
            {!isLocked && (
                <CommentSection
                    lessonId={lessonId}
                    currentUser={currentUser}
                    posts={initialPosts}
                    isEditing={isEditing}
                />
            )}
        </div>
    );
}
