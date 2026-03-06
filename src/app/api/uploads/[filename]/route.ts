import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { deleteFile, BUCKET_UPLOADS } from '@/lib/storage';

// DELETE /api/uploads/[filename] - Delete an uploaded file
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    await requireAuth(req);
    const { filename } = await params;
    await deleteFile(BUCKET_UPLOADS, filename);
    return successResponse({ message: 'File deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
