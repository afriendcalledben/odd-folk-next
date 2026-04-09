import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return successResponse({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
