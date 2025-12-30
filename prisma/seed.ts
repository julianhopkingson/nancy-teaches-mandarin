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

    // Seed HSK Levels
    console.log('Seeding HSK levels...');
    const hskLevelsData = [
        {
            level: 1,
            titleEn: 'HSK 1', titleSc: 'HSK 1', titleTc: 'HSK 1',
            descriptionEn: 'Beginner: Greetings, numbers, time',
            descriptionSc: '入门基础：日常问候、数字、时间',
            descriptionTc: '入門基礎：日常問候、數字、時間',
            wordCount: 150
        },
        {
            level: 2,
            titleEn: 'HSK 2', titleSc: 'HSK 2', titleTc: 'HSK 2',
            descriptionEn: 'Elementary: Shopping, transport, simple conversations',
            descriptionSc: '基础交流：购物、交通、简单对话',
            descriptionTc: '基礎交流：購物、交通、簡單對話',
            wordCount: 300
        },
        {
            level: 3,
            titleEn: 'HSK 3', titleSc: 'HSK 3', titleTc: 'HSK 3',
            descriptionEn: 'Intermediate: Work, life, expressing opinions',
            descriptionSc: '日常会话：工作、生活、表达观点',
            descriptionTc: '日常會話：工作、生活、表達觀點',
            wordCount: 600
        },
        {
            level: 4,
            titleEn: 'HSK 4', titleSc: 'HSK 4', titleTc: 'HSK 4',
            descriptionEn: 'Upper-Intermediate: News, culture, in-depth discussions',
            descriptionSc: '流利表达：新闻、文化、深入讨论',
            descriptionTc: '流利表達：新聞、文化、深入討論',
            wordCount: 1200
        },
        {
            level: 5,
            titleEn: 'HSK 5', titleSc: 'HSK 5', titleTc: 'HSK 5',
            descriptionEn: 'Advanced: Literature, professional topics',
            descriptionSc: '高级阅读：文学、专业话题',
            descriptionTc: '高級閱讀：文學、專業話題',
            wordCount: 2500
        },
        {
            level: 6,
            titleEn: 'HSK 6', titleSc: 'HSK 6', titleTc: 'HSK 6',
            descriptionEn: 'Mastery: Idioms, classical texts, advanced writing',
            descriptionSc: '精通掌握：成语、古文、高级写作',
            descriptionTc: '精通掌握：成語、古文、高級寫作',
            wordCount: 5000
        }
    ];

    for (const hsk of hskLevelsData) {
        await prisma.hSKLevel.upsert({
            where: { level: hsk.level },
            update: hsk,
            create: hsk,
        });
    }
    console.log('Seeded HSK levels.');

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
