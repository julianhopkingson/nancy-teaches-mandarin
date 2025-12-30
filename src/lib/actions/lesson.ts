'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Fetch all lessons for a specific level
export async function getLessons(level: number) {
    try {
        const lessons = await prisma.lesson.findMany({
            where: {
                level,
                published: true,
            },
            orderBy: {
                order: 'asc',
            },
            include: {
                _count: {
                    select: { contents: true },
                },
            },
        });
        return lessons;
    } catch (error) {
        console.error('Failed to fetch lessons:', error);
        return [];
    }
}

// Fetch a single lesson with its contents
export async function getLesson(id: string) {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                contents: {
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
        return lesson;
    } catch (error) {
        console.error('Failed to fetch lesson:', error);
        return null;
    }
}

// ADMIN ACTIONS

export async function createLesson(data: {
    title: string;
    description?: string;
    level: number;
    order: number;
    isFree?: boolean;
}) {
    try {
        const lesson = await prisma.lesson.create({
            data,
        });
        revalidatePath(`/hsk/${lesson.level}`);
        return { success: true, data: lesson };
    } catch (error) {
        return { success: false, error: 'Failed to create lesson' };
    }
}

export async function updateLessonStatus(id: string, isFree: boolean) {
    try {
        await prisma.lesson.update({
            where: { id },
            data: { isFree },
        });
        revalidatePath('/hsk');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update lesson status' };
    }
}

// CONTENT ACTIONS

export async function createLessonContent(data: {
    lessonId: string;
    type: string;
    title: string;
    url?: string | null;
    youtubeId?: string | null;
    order: number;
}) {
    try {
        const content = await prisma.lessonContent.create({
            data,
        });
        revalidatePath(`/hsk/${data.lessonId}`); // Revalidate specifically the lesson page
        return { success: true, data: content };
    } catch (error) {
        return { success: false, error: 'Failed to create content' };
    }
}

export async function updateLessonContent(
    id: string,
    data: {
        title?: string;
        url?: string | null;
        youtubeId?: string | null;
    }
) {
    try {
        const content = await prisma.lessonContent.update({
            where: { id },
            data,
        });
        revalidatePath(`/hsk`); // Revalidate broadly to ensure updates propagate
        return { success: true, data: content };
    } catch (error) {
        return { success: false, error: 'Failed to update content' };
    }
}

export async function deleteLessonContent(id: string) {
    try {
        await prisma.lessonContent.delete({
            where: { id },
        });
        revalidatePath(`/hsk`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete content' };
    }
}


export async function reorderLessonContent(items: { id: string; order: number }[]) {
    try {
        const transaction = items.map((item) =>
            prisma.lessonContent.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );

        await prisma.$transaction(transaction);
        revalidatePath('/hsk');
        return { success: true };
    } catch (error) {
        console.error('Reorder error:', error);
        return { success: false, error: 'Failed to reorder content' };
    }
}

export async function reorderLessons(items: { id: string; order: number }[]) {
    try {
        const transaction = items.map((item) =>
            prisma.lesson.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );

        await prisma.$transaction(transaction);
        revalidatePath('/hsk');
        return { success: true };
    } catch (error) {
        console.error('Reorder lessons error:', error);
        return { success: false, error: 'Failed to reorder lessons' };
    }
}

export async function deleteLesson(id: string) {
    try {
        await prisma.lesson.delete({
            where: { id },
        });
        revalidatePath('/hsk');
        return { success: true };
    } catch (error) {
        console.error('Delete lesson error:', error);
        return { success: false, error: 'Failed to delete lesson' };
    }
}
