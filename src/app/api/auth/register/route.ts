import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        // 验证
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: 'MISSING_FIELDS' },
                { status: 400 }
            );
        }

        // 用户名长度检查
        if (username.length < 5 || username.length > 10) {
            return NextResponse.json(
                { error: 'USERNAME_LENGTH' },
                { status: 400 }
            );
        }

        // 密码长度检查
        if (password.length < 5 || password.length > 10) {
            return NextResponse.json(
                { error: 'PASSWORD_LENGTH' },
                { status: 400 }
            );
        }

        // 邮箱格式检查
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'EMAIL_INVALID' },
                { status: 400 }
            );
        }

        // 检查用户名是否已存在
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUsername) {
            return NextResponse.json(
                { error: 'USERNAME_TAKEN' },
                { status: 400 }
            );
        }

        // 检查邮箱是否已存在
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });
        if (existingEmail) {
            return NextResponse.json(
                { error: 'EMAIL_TAKEN' },
                { status: 400 }
            );
        }

        // 加密密码
        const passwordHash = await bcrypt.hash(password, 10);

        // 创建用户
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role: 'student',
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'SERVER_ERROR' },
            { status: 500 }
        );
    }
}
