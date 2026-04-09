import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return errorResponse('Not found', 404);
    if (notification.userId !== user.id) return errorResponse('Forbidden', 403);

    await prisma.notification.update({ where: { id }, data: { isRead: true } });

    return successResponse({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
