'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getHSKLevels() {
    try {
        const [levels, lessonCounts] = await Promise.all([
            prisma.hSKLevel.findMany({
                orderBy: { level: 'asc' },
            }),
            prisma.lesson.groupBy({
                by: ['level'],
                _count: { id: true }
            })
        ]);

        // Merge lesson counts into levels
        const levelsWithCounts = levels.map(level => ({
            ...level,
            lessonCount: lessonCounts.find(lc => lc.level === level.level)?._count.id || 0
        }));

        return { success: true, data: levelsWithCounts };
    } catch (error) {
        console.error('Failed to fetch HSK levels:', error);
        return { success: false, error: 'Failed to fetch HSK levels' };
    }
}

export async function getHSKLevel(level: number) {
    try {
        const hskLevel = await prisma.hSKLevel.findUnique({
            where: { level },
        });
        return { success: true, data: hskLevel };
    } catch (error) {
        console.error(`Failed to fetch HSK level ${level}:`, error);
        return { success: false, error: `Failed to fetch HSK level ${level}` };
    }
}

export async function updateHSKLevel(level: number, data: {
    titleEn?: string;
    titleSc?: string;
    titleTc?: string;
    descriptionEn?: string;
    descriptionSc?: string;
    descriptionTc?: string;
    wordCount?: number;
}) {
    try {
        const updated = await prisma.hSKLevel.update({
            where: { level },
            data,
        });
        revalidatePath('/hsk');
        revalidatePath(`/[locale]/hsk`, 'layout');
        return { success: true, data: updated };
    } catch (error) {
        console.error('Failed to update HSK level:', error);
        return { success: false, error: 'Failed to update HSK level' };
    }
}
