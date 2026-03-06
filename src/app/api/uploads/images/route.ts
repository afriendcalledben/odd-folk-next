import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { uploadFile, BUCKET_UPLOADS } from '@/lib/storage';

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

    // Validate all files before uploading any
    for (const file of files) {
      if (!(file instanceof File)) return errorResponse('Invalid file in upload');
      if (!file.type.startsWith('image/')) return errorResponse('All files must be images');
    }

    const urls: string[] = [];

    for (const file of files) {
      const f = file as File;
      const ext = path.extname(f.name) || '.jpg';
      const key = `${uuidv4()}${ext}`;
      const buffer = Buffer.from(await f.arrayBuffer());
      const url = await uploadFile(BUCKET_UPLOADS, key, buffer, f.type);
      urls.push(url);
    }

    return successResponse({ urls }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
