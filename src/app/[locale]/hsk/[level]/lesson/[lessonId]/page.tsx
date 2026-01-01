import { notFound } from 'next/navigation';
import { getLesson, getLessons } from '@/lib/actions/lesson';
import { LessonSidebar } from '@/components/lesson/LessonSidebar';
import { LessonContentItem } from '@/components/lesson/LessonContentItem';
import { auth } from '@/lib/auth';
import { getHSKLevel } from '@/lib/actions/hsk';
import { getPosts } from '@/actions/comments';
import { useTranslations } from 'next-intl';
import { LessonDetailClient } from './LessonDetailClient';

interface LessonPageProps {
    params: Promise<{
        locale: string;
        level: string;
        lessonId: string;
    }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
    const { locale, level, lessonId } = await params;
    const levelNum = parseInt(level);

    const [lesson, allLessons, session, hskResult, posts] = await Promise.all([
        getLesson(lessonId),
        getLessons(levelNum),
        auth(),
        getHSKLevel(levelNum),
        getPosts(lessonId),
    ]);

    if (!lesson) notFound();

    const isAdmin = session?.user?.role === 'admin';
    // const isPurchased = session?.user?.purchases?.some(...) // TODO: Check purchase status

    // For now, assume unlocked if free or admin
    // TODO: integrated with real purchase check
    const isLocked = !lesson.isFree && !isAdmin;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen pt-20">
            {/* Sidebar */}
            <LessonSidebar
                lessons={allLessons}
                level={levelNum}
                currentLessonId={lessonId}
                locale={locale}
                isAdmin={isAdmin}
                hskData={hskResult.data}
            />

            {/* Main Content */}
            <div className="flex-1 p-4 pt-4 lg:p-8 dark:bg-[#1a1a2e] bg-fixed">
                {/* Client Component for Content & Edit */}
                <LessonDetailClient
                    lessonId={lesson.id}
                    initialContents={lesson.contents}
                    isAdmin={isAdmin}
                    isLocked={isLocked}
                    userEmail={session?.user?.email || undefined}
                    title={lesson.title}
                    description={lesson.description}
                    initialPosts={posts}
                    currentUser={session?.user}
                />
            </div>
        </div>
    );
}
