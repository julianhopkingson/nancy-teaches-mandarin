import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: Fetch all prices (level prices + bundles)
export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get level prices
        const levelPrices = await prisma.levelPrice.findMany({
            orderBy: { level: 'asc' }
        });

        // Get bundles with their levels
        const bundles = await prisma.bundle.findMany({
            include: { levels: true },
            orderBy: { sortOrder: 'asc' }
        });

        // Transform level prices to object format
        const levelPricesMap: Record<number, number> = {};
        levelPrices.forEach(lp => {
            levelPricesMap[lp.level] = lp.price;
        });

        // Ensure all levels 1-6 exist
        for (let i = 1; i <= 6; i++) {
            if (!(i in levelPricesMap)) {
                levelPricesMap[i] = 0;
            }
        }

        return NextResponse.json({
            levelPrices: levelPricesMap,
            bundles: bundles.map(b => ({
                id: b.id,
                code: b.code,
                nameEn: b.nameEn,
                nameSc: b.nameSc,
                nameTc: b.nameTc,
                descriptionEn: b.descriptionEn,
                descriptionSc: b.descriptionSc,
                descriptionTc: b.descriptionTc,
                icon: b.icon,
                price: b.price,
                isActive: b.isActive,
                sortOrder: b.sortOrder,
                levels: b.levels.map(l => l.level)
            }))
        });
    } catch (error) {
        console.error('Error fetching prices:', error);
        return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
    }
}
