'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { Lesson } from '@prisma/client';
import { useTranslations } from 'next-intl';

interface LessonSidebarProps {
    lessons: (Lesson & { _count: { contents: number } })[];
    currentLessonId?: string;
    level: number;
    locale: string;
}

export function LessonSidebar({ lessons, currentLessonId, level, locale }: LessonSidebarProps) {
    const t = useTranslations('hsk');

    return (
        <div className="w-full md:w-80 flex-shrink-0 bg-white/5 border-r border-white/10 p-4 md:min-h-screen">
            <div className="mb-6">
                <Link
                    href={`/${locale}/hsk`}
                    className="group inline-flex items-center gap-3 mb-6"
                >
                    <motion.div
                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-text-secondary group-hover:text-coral transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9, backgroundColor: '#dcfce7' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </motion.div>
                    <span className="text-text-muted group-hover:text-coral transition-colors font-medium">
                        {t('button.backToCourseList')}
                    </span>
                </Link>
                <div className={`p-4 rounded-xl hsk-gradient-${level} text-white shadow-lg`}>
                    <h2 className="text-xl font-bold">HSK {level}</h2>
                    <p className="text-sm opacity-90">{t('title')} Curriculum</p>
                </div>
            </div>

            <div className="space-y-2">
                {lessons.map((lesson, index) => {
                    const isActive = lesson.id === currentLessonId;
                    return (
                        <Link key={lesson.id} href={`/${locale}/hsk/${level}/lesson/${lesson.id}`}>
                            <motion.div
                                className={`p-3 rounded-lg transition-colors cursor-pointer flex items-center gap-3 ${isActive
                                    ? 'bg-coral/20 text-coral border border-coral/30'
                                    : 'hover:bg-white/5 text-text-secondary'
                                    }`}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-coral text-white' : 'bg-white/10 text-text-muted'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium line-clamp-1">{lesson.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {!lesson.isFree && (
                                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-text-muted flex items-center gap-1">
                                                🔒 Locked
                                            </span>
                                        )}
                                        <span className="text-[10px] text-text-muted">
                                            {lesson._count.contents} items
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
