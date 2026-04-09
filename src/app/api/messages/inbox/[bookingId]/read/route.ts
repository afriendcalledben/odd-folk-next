import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { bookingId } = await params;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return errorResponse('Not found', 404);
    if (booking.hirerId !== user.id && booking.listerId !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    await prisma.conversationRead.upsert({
      where: { userId_bookingId: { userId: user.id, bookingId } },
      create: { userId: user.id, bookingId, readAt: new Date() },
      update: { readAt: new Date() },
    });

    return successResponse({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
