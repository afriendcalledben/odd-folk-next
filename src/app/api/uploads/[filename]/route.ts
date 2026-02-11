import { NextRequest } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// DELETE /api/uploads/[filename] - Delete an uploaded file
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    await requireAuth(req);
    const { filename } = await params;

    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return successResponse({ message: 'File deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
