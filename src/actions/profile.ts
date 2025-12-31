'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export async function uploadAvatar(formData: FormData) {
    const session = await auth();
    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided');
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
    }

    // Validate size (2MB strict)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size too large. Max 2MB.');
    }

    let filepath: string | undefined;

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate filename: {uuid}-{original_name_sanitized}
        // Sanitize: remove non-alphanumeric chars (except .-_) to avoid path issues
        const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${uuidv4()}-${sanitizedOriginalName}`;
        filepath = path.join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Update User
        const avatarUrl = `/uploads/avatars/${filename}`;

        // Get old avatar to delete
        const oldUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { avatar: true },
        });

        await prisma.user.update({
            where: { id: session.user.id },
            data: { avatar: avatarUrl },
        });

        revalidatePath('/profile');
        revalidatePath('/', 'layout'); // Update header avatar everywhere

        // Non-blocking cleanup of old avatar
        if (oldUser?.avatar) {
            // Remove leading slash if present to ensure path.join works correctly relative to cwd
            const relativePath = oldUser.avatar.startsWith('/') ? oldUser.avatar.slice(1) : oldUser.avatar;
            const oldAvatarPath = path.join(process.cwd(), 'public', relativePath);

            console.log(`[Avatar Cleanup] Attempting to delete: ${oldAvatarPath}`);

            // Check if it's a local file (in uploads/avatars)
            if (oldUser.avatar.startsWith('/uploads/avatars/') && existsSync(oldAvatarPath)) {
                // Safety check: ensure we are not deleting the file we just uploaded
                if (path.resolve(oldAvatarPath) !== path.resolve(filepath)) {
                    try {
                        const { unlink } = require('fs/promises');
                        await unlink(oldAvatarPath);
                        console.log(`[Avatar Cleanup] Deleted: ${oldAvatarPath}`);
                    } catch (e) {
                        console.error('[Avatar Cleanup] Failed to delete old avatar:', e);
                    }
                } else {
                    console.log('[Avatar Cleanup] Skipped: Old file is same as new file.');
                }
            } else {
                console.log('[Avatar Cleanup] Skipped: File not found or not local.');
            }
        }

        return { success: true, url: avatarUrl };
    } catch (error) {
        console.error('Avatar upload error:', error);

        // Cleanup: delete file if it was written but DB update failed
        if (filepath && existsSync(filepath)) {
            try {
                // We need to import unlink from fs/promises
                const { unlink } = require('fs/promises');
                await unlink(filepath);
            } catch (cleanupError) {
                console.error('Failed to cleanup file:', cleanupError);
            }
        }

        throw new Error('Failed to upload avatar'); // Don't expose internal errors
    }
}
