import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 创建 Admin 用户
    const adminPasswordHash = await bcrypt.hash('aaaaa', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'zzt294' },
        update: {
            email: 'terrysemon@outlook.com',
        },
        create: {
            username: 'zzt294',
            email: 'terrysemon@outlook.com',
            passwordHash: adminPasswordHash,
            role: 'admin',
            displayName: 'Nancy Admin',
        },
    });

    console.log('Created/Updated admin user:', admin);

    // Seed HSK 1 Lessons
    console.log('Seeding HSK 1 lessons...');

    // Lesson 1
    const lesson1 = await prisma.lesson.create({
        data: {
            title: '第一课：问候语',
            description: 'Basic Greetings',
            level: 1,
            order: 1,
            isFree: true,
            contents: {
                create: [
                    {
                        type: 'video',
                        title: 'Video Lesson',
                        youtubeId: 'dQw4w9WgXcQ',
                        order: 1,
                    },
                    {
                        type: 'doc',
                        title: '词汇表 (Vocabulary)',
                        url: '/sample.pdf',
                        order: 2,
                    },
                    {
                        type: 'audio',
                        title: '听力练习 1',
                        url: '/sample.mp3',
                        order: 3,
                    },
                ],
            },
        },
    });

    // Lesson 2
    const lesson2 = await prisma.lesson.create({
        data: {
            title: '第二课：数字',
            description: 'Numbers 0-100',
            level: 1,
            order: 2,
            isFree: false, // Locked
            contents: {
                create: [
                    {
                        type: 'video',
                        title: 'Video Lesson',
                        youtubeId: 'dQw4w9WgXcQ',
                        order: 1,
                    },
                    {
                        type: 'doc',
                        title: '语法笔记 (Grammar Notes)',
                        url: '/sample.pdf',
                        order: 2,
                    },
                ],
            },
        },
    });

    console.log('Seeded lessons:', { lesson1, lesson2 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
