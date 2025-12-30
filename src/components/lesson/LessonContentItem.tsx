'use client';

import { useTranslations } from 'next-intl';
import { ProtectedVideo } from '@/components/content/ProtectedVideo';

interface LessonContentItemProps {
    content: {
        id: string;
        type: string;
        title: string;
        url: string | null;
        youtubeId: string | null;
    };
    userEmail?: string;
    isLocked?: boolean;
}

export function LessonContentItem({ content, userEmail, isLocked = false }: LessonContentItemProps) {
    const t = useTranslations('content');

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
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="text-coral">📺</span> {content.title}
                </h3>
                <ProtectedVideo
                    youtubeId={content.youtubeId}
                    title={content.title}
                    userEmail={userEmail || 'Guest'}
                />
            </div>
        );
    }

    if (content.type === 'audio' && content.url) {
        return (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center text-coral text-xl">
                        🎧
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-text-primary">{content.title}</h3>
                        <audio controls className="w-full mt-2 h-8">
                            <source src={content.url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
            </div>
        );
    }

    if (content.type === 'doc' && content.url) {
        return (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 hover:bg-white/10 transition-colors cursor-pointer group">
                <a href={content.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform">
                        📄
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-text-primary group-hover:text-coral transition-colors">
                            {content.title}
                        </h3>
                        <p className="text-text-muted text-sm">Click to view document</p>
                    </div>
                    <div className="text-text-muted">
                        →
                    </div>
                </a>
            </div>
        );
    }

    return null;
}
