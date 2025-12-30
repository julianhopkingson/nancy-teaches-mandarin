import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        // 验证新密码长度
        if (!newPassword || newPassword.length < 5 || newPassword.length > 10) {
            return NextResponse.json({ error: 'PASSWORD_LENGTH' }, { status: 400 });
        }

        // 获取用户
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
        }

        // 验证当前密码
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'WRONG_PASSWORD' }, { status: 400 });
        }

        // 加密新密码
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // 更新密码
        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: newPasswordHash },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
    }
}
