import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// PUT: Update level prices and descriptions
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prices, levelData } = await request.json();

        // Validate prices
        if (!prices || typeof prices !== 'object') {
            return NextResponse.json({ error: 'Invalid prices data' }, { status: 400 });
        }

        const updates: any[] = [];

        // Upsert each level price
        Object.entries(prices).forEach(([level, price]) => {
            updates.push(
                prisma.levelPrice.upsert({
                    where: { level: parseInt(level) },
                    update: { price: Number(price) },
                    create: { level: parseInt(level), price: Number(price) }
                })
            );
        });

        // Update HSK level descriptions if provided
        if (levelData && typeof levelData === 'object') {
            Object.entries(levelData).forEach(([level, data]: [string, any]) => {
                if (data && typeof data === 'object') {
                    updates.push(
                        prisma.hSKLevel.upsert({
                            where: { level: parseInt(level) },
                            update: {
                                descriptionEn: data.descriptionEn || '',
                                descriptionSc: data.descriptionSc || '',
                                descriptionTc: data.descriptionTc || '',
                            },
                            create: {
                                level: parseInt(level),
                                titleEn: `HSK ${level}`,
                                titleSc: `HSK ${level}`,
                                titleTc: `HSK ${level}`,
                                descriptionEn: data.descriptionEn || '',
                                descriptionSc: data.descriptionSc || '',
                                descriptionTc: data.descriptionTc || '',
                                wordCount: 0,
                            }
                        })
                    );
                }
            });
        }

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating level prices:', error);
        return NextResponse.json({ error: 'Failed to update prices' }, { status: 500 });
    }
}

