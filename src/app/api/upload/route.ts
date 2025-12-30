import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES: Record<string, { extensions: string[]; folder: string }> = {
    audio: { extensions: ['.mp3'], folder: 'audio' },
    doc: { extensions: ['.pdf'], folder: 'docs' },
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'audio' | 'doc'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!type || !ALLOWED_TYPES[type]) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        const config = ALLOWED_TYPES[type];
        const ext = path.extname(file.name).toLowerCase();

        if (!config.extensions.includes(ext)) {
            return NextResponse.json(
                { error: `Invalid file extension. Allowed: ${config.extensions.join(', ')}` },
                { status: 400 }
            );
        }

        // Generate unique filename
        const filename = `${uuidv4()}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', config.folder);

        // Ensure directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/uploads/${config.folder}/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            originalName: file.name
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
