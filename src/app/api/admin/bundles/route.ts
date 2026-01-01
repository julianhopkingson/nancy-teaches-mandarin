import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: List all bundles
export async function GET() {
    try {
        const bundles = await prisma.bundle.findMany({
            include: { levels: true },
            orderBy: { sortOrder: 'asc' }
        });

        return NextResponse.json(bundles.map(b => ({
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
        })));
    } catch (error) {
        console.error('Error fetching bundles:', error);
        return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
    }
}

// POST: Create new bundle
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { code, nameEn, nameSc, nameTc, descriptionEn, descriptionSc, descriptionTc, icon, price, levels } = data;

        // Validate required fields
        if (!code || !nameEn || !nameSc || !nameTc) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get max sort order
        const maxSort = await prisma.bundle.findFirst({
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true }
        });

        // Create bundle with levels
        const bundle = await prisma.bundle.create({
            data: {
                code,
                nameEn,
                nameSc,
                nameTc,
                descriptionEn: descriptionEn || null,
                descriptionSc: descriptionSc || null,
                descriptionTc: descriptionTc || null,
                icon: icon || null,
                price: Number(price) || 0,
                sortOrder: (maxSort?.sortOrder || 0) + 1,
                levels: {
                    create: (levels || []).map((level: number) => ({ level }))
                }
            },
            include: { levels: true }
        });

        return NextResponse.json({
            id: bundle.id,
            code: bundle.code,
            nameEn: bundle.nameEn,
            nameSc: bundle.nameSc,
            nameTc: bundle.nameTc,
            descriptionEn: bundle.descriptionEn,
            descriptionSc: bundle.descriptionSc,
            descriptionTc: bundle.descriptionTc,
            icon: bundle.icon,
            price: bundle.price,
            isActive: bundle.isActive,
            sortOrder: bundle.sortOrder,
            levels: bundle.levels.map(l => l.level)
        });
    } catch (error) {
        console.error('Error creating bundle:', error);
        return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 });
    }
}
