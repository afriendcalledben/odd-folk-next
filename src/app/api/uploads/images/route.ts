import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

const MAX_IMAGES = 8;

// POST /api/uploads/images - Upload multiple images (max 8)
export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);

    const formData = await req.formData();
    const files = formData.getAll('images');

    if (!files || files.length === 0) {
      return errorResponse('No image files provided');
    }

    if (files.length > MAX_IMAGES) {
      return errorResponse(`Maximum ${MAX_IMAGES} images allowed`);
    }

    // Validate all files before writing any
    for (const file of files) {
      if (!(file instanceof File)) {
        return errorResponse('Invalid file in upload');
      }
      if (!file.type.startsWith('image/')) {
        return errorResponse('All files must be images');
      }
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const urls: string[] = [];

    for (const file of files) {
      const f = file as File;
      const ext = path.extname(f.name) || '.jpg';
      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      const buffer = Buffer.from(await f.arrayBuffer());
      await writeFile(filePath, buffer);

      urls.push(`/uploads/${filename}`);
    }

    return successResponse({ urls }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
