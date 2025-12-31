import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }

        const { displayName, avatar } = await request.json();

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                displayName: displayName || null,
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                displayName: updatedUser.displayName,
                avatar: updatedUser.avatar,
            },
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
    }
}
