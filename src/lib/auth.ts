import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// 扩展 NextAuth 类型
declare module 'next-auth' {
    interface User {
        role?: string;
    }
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            role?: string;
        };
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET || 'nancy-teaches-mandarin-secret-key-2026',
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username as string },
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.displayName || user.username,
                    email: user.email,
                    role: user.role,
                    image: user.avatar,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            if (trigger === 'update' && session) {
                token.name = session.displayName;
                token.picture = session.avatar;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
});
