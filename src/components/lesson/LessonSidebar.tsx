'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { CircleIconButton } from '@/components/ui/CircleIconButton';
import { AlertModal } from '@/components/ui/AlertModal';
import type { Lesson } from '@prisma/client';
import { useTranslations } from 'next-intl';

interface LessonSidebarProps {
    lessons: (Lesson & { _count: { contents: number } })[];
    currentLessonId?: string;
    level: number;
    locale: string;
    isAdmin?: boolean;
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

export function LessonSidebar({ lessons, currentLessonId, level, locale, isAdmin = false, hskData }: LessonSidebarProps) {
    const t = useTranslations('hsk');
    const tContent = useTranslations('content');
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showPurchaseAlert, setShowPurchaseAlert] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // Initial check
        checkMobile();
        setIsInitialized(true);

        // Listener
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentLessonIndex = lessons.findIndex(l => l.id === currentLessonId);
    const currentLesson = lessons[currentLessonIndex];
    const showSidebar = isInitialized && (!isMobile || isOpen);

    return (
        <>
            <div className="w-full lg:w-80 flex-shrink-0 bg-white/5 border-r border-white/10 p-4 lg:min-h-screen">
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
                    <div className="lg:hidden mt-4">
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

                <AnimatePresence initial={false}>
                    {showSidebar && (
                        <motion.div
                            initial={isMobile ? { height: 0, opacity: 0 } : false}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden lg:block lg:p-2 lg:rounded-xl lg:bg-white/5 lg:border lg:border-white/10 lg:shadow-lg lg:backdrop-blur-sm"
                        >
                            <div className="space-y-4 px-2 lg:px-0">
                                {lessons.map((lesson, index) => {
                                    const isActive = lesson.id === currentLessonId;
                                    // In mobile expanded view, hide the active lesson because it's already in the header
                                    if (isActive && isMobile) return null;

                                    const isLocked = !lesson.isFree && !isAdmin;

                                    const handleClick = (e: React.MouseEvent) => {
                                        if (isLocked) {
                                            e.preventDefault();
                                            setShowPurchaseAlert(true);
                                            return;
                                        }
                                        setIsOpen(false);
                                    };

                                    const LessonCard = (
                                        <motion.div
                                            className={`p-3 mb-2 rounded-lg transition-colors cursor-pointer flex items-center gap-3 shadow-md ${isActive
                                                ? 'bg-coral/10 text-coral border border-coral/30'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-text-secondary'
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
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium ${isAdmin ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                            {isAdmin ? (
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.5 1A4.5 4.5 0 0010 5.5V9H3a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1.5V5.5a3 3 0 116 0v2.75a.75.75 0 001.5 0V5.5A4.5 4.5 0 0014.5 1z" clipRule="evenodd" /></svg>
                                                            ) : (
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                                            )}
                                                            {isAdmin ? 'Unlocked' : 'Locked'}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-text-muted">
                                                        {lesson._count.contents} items
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );

                                    if (isLocked) {
                                        return (
                                            <div key={lesson.id} onClick={handleClick}>
                                                {LessonCard}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link key={lesson.id} href={`/${locale}/hsk/${level}/lesson/${lesson.id}`} onClick={handleClick}>
                                            {LessonCard}
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AlertModal
                isOpen={showPurchaseAlert}
                onClose={() => setShowPurchaseAlert(false)}
                type="warning"
                title={tContent('message.purchaseRequired')}
                message={tContent('message.purchaseRequired')}
            />
        </>
    );
}
