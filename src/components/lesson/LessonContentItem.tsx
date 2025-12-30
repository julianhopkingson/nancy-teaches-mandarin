'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedVideo } from '@/components/content/ProtectedVideo';

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
        <div className="mt-3">
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
            <div className="mb-8 p-1">
                <div className="flex items-center gap-4 mb-4 px-4">
                    <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center text-coral text-xl">
                        📺
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
                <div className="px-4">
                    {renderEditableDescription()}
                </div>
            </div>
        );
    }

    if (content.type === 'audio' && content.url) {
        return (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center text-coral text-xl flex-shrink-0">
                        🎧
                    </div>
                    <div className="flex-1 min-w-0">
                        {renderEditableTitle("font-bold text-text-primary")}
                        <audio controls className="w-full mt-2 h-8">
                            <source src={content.url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
                {renderEditableDescription()}
            </div>
        );
    }

    if (content.type === 'doc' && content.url) {
        const readUrl = `/${locale}/hsk/${level}/lesson/${lessonId}/read/${content.id}`;

        return (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <Link href={readUrl} className="contents">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform">
                            📄
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
