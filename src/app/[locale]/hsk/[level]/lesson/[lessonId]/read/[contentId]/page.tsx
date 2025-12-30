import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';

interface ReadPageProps {
    params: Promise<{
        locale: string;
        level: string;
        lessonId: string;
        contentId: string;
    }>;
}

export default async function ReadPage({ params }: ReadPageProps) {
    const { locale, level, lessonId, contentId } = await params;
    const t = await getTranslations('content');

    const content = await prisma.lessonContent.findUnique({
        where: { id: contentId },
    });

    if (!content || content.lessonId !== lessonId || content.type !== 'doc') {
        notFound();
    }

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
    });

    if (!lesson) {
        notFound();
    }

    // Access Control
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!lesson.isFree && !userEmail) {
        redirect(`/${locale}/auth/login`);
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href={`/${locale}/hsk/${level}/lesson/${lessonId}`}
                        className="flex items-center gap-2 text-text-secondary hover:text-coral transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                            <span className="text-xl">←</span>
                        </div>
                        <span className="font-medium hidden md:inline">{t('button.back')}</span>
                    </Link>

                    <h1 className="text-lg md:text-xl font-bold truncate flex-1 text-center">
                        {content.title}
                    </h1>

                    <div className="w-10 md:w-24" />
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="max-w-5xl mx-auto p-4">
                <div
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <iframe
                        src={`${content.url}#toolbar=0&navpanes=0`}
                        className="w-full h-[80vh] border-0"
                        title={content.title}
                    />
                </div>

                <p className="text-center text-text-muted text-sm mt-4">
                    📖 在线阅读模式 | Online Reading Mode
                </p>

                {content.description && (
                    <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                        <h3 className="font-bold mb-2 text-text-primary">{t('label.contentDescription')}</h3>
                        <p className="text-text-secondary whitespace-pre-wrap">{content.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
