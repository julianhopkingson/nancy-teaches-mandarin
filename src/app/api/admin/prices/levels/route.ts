import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// PUT: Update level prices
export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prices } = await request.json();

        // Validate prices
        if (!prices || typeof prices !== 'object') {
            return NextResponse.json({ error: 'Invalid prices data' }, { status: 400 });
        }

        // Upsert each level price
        const updates = Object.entries(prices).map(([level, price]) =>
            prisma.levelPrice.upsert({
                where: { level: parseInt(level) },
                update: { price: Number(price) },
                create: { level: parseInt(level), price: Number(price) }
            })
        );

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating level prices:', error);
        return NextResponse.json({ error: 'Failed to update prices' }, { status: 500 });
    }
}
