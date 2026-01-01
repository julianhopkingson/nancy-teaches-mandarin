'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedVideo } from '@/components/content/ProtectedVideo';
import { AudioPlayer } from '@/components/ui/AudioPlayer';

interface LessonContentItemProps {
    content: {
        id: string;
        type: string;
        title: string;
        description?: string;
        url: string | null;
        youtubeId: string | null;
    };
    userEmail?: string;
    isLocked?: boolean;
    isEditing?: boolean;
    onUpdate?: (id: string, data: { title?: string; description?: string }) => void;
}

export function LessonContentItem({ content, userEmail, isLocked = false, isEditing = false, onUpdate }: LessonContentItemProps) {
    const t = useTranslations('content');
    const params = useParams();
    const locale = params.locale as string;
    const level = params.level as string;
    const lessonId = params.lessonId as string;

    const handleUpdate = (field: 'title' | 'description', value: string) => {
        if (value !== content[field]) {
            onUpdate?.(content.id, { [field]: value });
        }
    };

    const renderEditableDescription = () => (
        <div className="mt-3 ml-8">
            {isEditing ? (
                <textarea
                    defaultValue={content.description || ''}
                    onBlur={(e) => handleUpdate('description', e.target.value)}
                    placeholder={t('label.descriptionPlaceholder') || 'Add a description...'}
                    className="w-full p-2 text-sm border-2 border-dashed border-coral/30 rounded-lg focus:outline-none focus:border-coral bg-transparent resize-none h-20"
                />
            ) : content.description && (
                <p className="text-text-muted text-sm">{content.description}</p>
            )}
        </div>
    );

    const renderEditableTitle = (className: string) => (
        isEditing ? (
            <input
                defaultValue={content.title}
                onBlur={(e) => handleUpdate('title', e.target.value)}
                className={`bg-transparent border-2 border-dashed border-coral/30 rounded-lg px-2 py-1 focus:outline-none focus:border-coral w-full ${className}`}
            />
        ) : (
            <h3 className={className}>
                {content.title}
            </h3>
        )
    );

    if (isLocked) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center py-12">
                <span className="text-4xl mb-4">🔒</span>
                <h3 className="text-lg font-bold text-text-secondary">{content.title}</h3>
                <p className="text-text-muted text-sm mt-2">{t('message.purchaseRequired')}</p>
            </div>
        );
    }

    if (content.type === 'video' && content.youtubeId) {
        return (
            <div className="mb-8 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral/20 to-orange-400/20 flex items-center justify-center">
                        <svg className="w-7 h-7 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        {renderEditableTitle("text-lg font-bold text-text-primary")}
                    </div>
                </div>
                <ProtectedVideo
                    youtubeId={content.youtubeId}
                    title={content.title}
                    userEmail={userEmail || 'Guest'}
                />
                <div>
                    {renderEditableDescription()}
                </div>
            </div>
        );
    }

    if (content.type === 'audio' && content.url) {
        return (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral/20 to-orange-400/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        {renderEditableTitle("font-bold text-text-primary")}
                        <div className="mt-2">
                            <AudioPlayer src={content.url} />
                        </div>
                    </div>
                </div>
                {renderEditableDescription()}
            </div>
        );
    }

    if (content.type === 'doc' && content.url) {
        const readUrl = `/${locale}/hsk/${level}/lesson/${lessonId}/read/${content.id}`;

        return (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <Link href={readUrl} className="contents">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral/20 to-orange-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </Link>
                    <div className="flex-1">
                        {renderEditableTitle("font-bold text-text-primary group-hover:text-coral transition-colors")}
                    </div>
                    {!isEditing && (
                        <Link href={readUrl}>
                            <div className="px-3 py-1.5 rounded-lg bg-coral/10 text-coral text-sm font-medium group-hover:bg-coral group-hover:text-white transition-colors">
                                {t('button.read')}
                            </div>
                        </Link>
                    )}
                </div>
                {renderEditableDescription()}
            </div>
        );
    }

    return null;
}
