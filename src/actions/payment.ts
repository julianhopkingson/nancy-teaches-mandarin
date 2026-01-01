'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

export type PurchaseResult = {
    success: boolean;
    message?: string;
};

// Simplified verification for now - directly trusts the client-side orderID if valid
// In production, you MUST verify with PayPal API server-side using the orderID
export async function verifyPurchase(
    orderId: string,
    productType: 'bundle' | 'level',
    productId: string, // e.g., 'all', '1' (for level 1)
    amount: number
): Promise<PurchaseResult> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: 'User not authenticated' };
        }

        const userId = session.user.id;

        // 1. Check if already purchased
        const existingPurchase = await prisma.purchase.findFirst({
            where: {
                userId,
                productType,
                productId,
            }
        });

        if (existingPurchase) {
            return { success: true, message: 'Already purchased' };
        }

        // 2. Mock Validation of Order (In prod: fetch PayPal API /v2/checkout/orders/orderId)
        if (!orderId) {
            return { success: false, message: 'Invalid Order ID' };
        }

        // 3. Record Purchase
        await prisma.purchase.create({
            data: {
                userId,
                productType,
                productId,
                amount,
                paypalOrderId: orderId,
            },
        });

        // 4. Revalidate paths to update UI
        revalidatePath('/[locale]/hsk/[level]/lesson/[lessonId]', 'page');
        revalidatePath('/[locale]/dashboard', 'page');

        return { success: true };
    } catch (error) {
        console.error('Purchase verification failed:', error);
        return { success: false, message: 'Internal Server Error' };
    }
}

export async function getPricing(level: number) {
    const levelPrice = await prisma.levelPrice.findUnique({
        where: { level },
    });

    const bundles = await prisma.bundle.findMany({
        where: {
            isActive: true,
            levels: {
                some: {
                    level: level,
                },
            },
        },
        orderBy: {
            sortOrder: 'asc',
        },
        include: {
            levels: {
                orderBy: {
                    level: 'asc',
                },
            },
        },
    });

    const allLevelPrices = await prisma.levelPrice.findMany({
        orderBy: { level: 'asc' }
    });

    // If no bundles found, we might want to minimally return the "all" bundle as fallback, 
    // but the query above significantly covers "relevant" bundles. 
    // If specific "all" is needed even if not containing level (unlikely), we can fetch it separately.

    return {
        levelPrice: levelPrice?.price || 29.99,
        bundles: bundles,
        allLevelPrices: allLevelPrices,
    };
}
