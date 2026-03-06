import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { uploadFile, BUCKET_UPLOADS } from '@/lib/storage';

// POST /api/uploads/image - Upload a single image
export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);

    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return errorResponse('No image file provided');
    }

    if (!file.type.startsWith('image/')) {
      return errorResponse('File must be an image');
    }

    const ext = path.extname(file.name) || '.jpg';
    const key = `${uuidv4()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(BUCKET_UPLOADS, key, buffer, file.type);

    return successResponse({ url }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
