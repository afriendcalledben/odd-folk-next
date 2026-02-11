import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

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

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return successResponse({ url: `/uploads/${filename}` }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
