'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { CircleIconButton } from '@/components/ui/CircleIconButton';
import type { Lesson } from '@prisma/client';
import { useTranslations } from 'next-intl';

interface LessonSidebarProps {
    lessons: (Lesson & { _count: { contents: number } })[];
    currentLessonId?: string;
    level: number;
    locale: string;
    hskData?: {
        level: number;
        titleEn: string;
        titleSc: string;
        titleTc: string;
        descriptionEn: string;
        descriptionSc: string;
        descriptionTc: string;
        wordCount: number;
    } | null;
}

export function LessonSidebar({ lessons, currentLessonId, level, locale, hskData }: LessonSidebarProps) {
    const t = useTranslations('hsk');
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkMobile();

        // Listener
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentLessonIndex = lessons.findIndex(l => l.id === currentLessonId);
    const currentLesson = lessons[currentLessonIndex];
    const showSidebar = !isMobile || isOpen;

    return (
        <div className="w-full md:w-80 flex-shrink-0 bg-white/5 border-r border-white/10 p-4 md:min-h-screen">
            <div className="mb-3">
                <Link
                    href={`/${locale}/hsk/${level}`}
                    className="group inline-flex items-center gap-3 mb-3"
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
                <div className={`p-4 rounded-xl hsk-gradient-${level} text-white shadow-lg`}>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold">
                            {hskData ? (
                                locale === 'en' ? hskData.titleEn :
                                    locale === 'tc' ? hskData.titleTc :
                                        hskData ? hskData.titleSc : `HSK ${level}`
                            ) : `HSK ${level}`}
                        </h2>
                        {hskData && (
                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/30 whitespace-nowrap">
                                {hskData.wordCount} {t('words')}
                            </span>
                        )}
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/30 whitespace-nowrap">
                            {lessons.length} {t('lessons')}
                        </span>
                    </div>
                    <p className="text-xs opacity-90 line-clamp-2">
                        {hskData ? (
                            locale === 'en' ? hskData.descriptionEn :
                                locale === 'tc' ? hskData.descriptionTc :
                                    hskData.descriptionSc
                        ) : t('description.' + level)}
                    </p>
                </div>

                {/* Mobile Design: Current Lesson Card as Toggle Header */}
                <div className="md:hidden mt-4">
                    {currentLesson && (
                        <div
                            className={`p-4 rounded-xl flex items-center gap-4 transition-all border-2 border-coral/20 bg-coral/5`}
                        >
                            <div className="w-10 h-10 rounded-full bg-coral text-white flex items-center justify-center font-bold">
                                {currentLessonIndex + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-coral leading-tight">{currentLesson.title}</h3>
                                <p className="text-[10px] text-coral/60 mt-0.5">
                                    {currentLesson._count.contents} items
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-10 h-10 rounded-lg bg-coral text-white flex items-center justify-center transition-transform duration-300"
                            >
                                <svg
                                    className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={isMobile ? { height: 0, opacity: 0 } : false}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-2 overflow-hidden md:block"
                    >
                        <div className="pt-2 md:pt-0 space-y-2">
                            {lessons.map((lesson, index) => {
                                const isActive = lesson.id === currentLessonId;
                                // In mobile expanded view, hide the active lesson because it's already in the header
                                if (isActive && isMobile) return null;

                                return (
                                    <Link key={lesson.id} href={`/${locale}/hsk/${level}/lesson/${lesson.id}`} onClick={() => setIsOpen(false)}>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
