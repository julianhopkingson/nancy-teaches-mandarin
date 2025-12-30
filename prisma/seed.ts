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
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
