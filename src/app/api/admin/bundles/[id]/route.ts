import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// PUT: Update bundle
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();
        const { code, nameEn, nameSc, nameTc, descriptionEn, descriptionSc, descriptionTc, icon, price, levels, isActive } = data;

        // Delete existing levels and create new ones
        await prisma.bundleLevel.deleteMany({
            where: { bundleId: id }
        });

        // Update bundle
        const bundle = await prisma.bundle.update({
            where: { id },
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
                isActive: isActive ?? true,
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
        console.error('Error updating bundle:', error);
        return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 });
    }
}

// DELETE: Delete bundle
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.bundle.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting bundle:', error);
        return NextResponse.json({ error: 'Failed to delete bundle' }, { status: 500 });
    }
}
