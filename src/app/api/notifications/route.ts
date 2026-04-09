import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return successResponse({ notifications, unreadCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
