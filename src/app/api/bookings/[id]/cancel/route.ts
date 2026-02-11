import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id: bookingId } = await params;
    const { reason } = await req.json();

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return errorResponse('Booking not found', 404);
    if (booking.hirerId !== user.id && booking.listerId !== user.id) {
      return errorResponse('Not authorized', 403);
    }
    if (!['PENDING', 'APPROVED'].includes(booking.status)) {
      return errorResponse('Cannot cancel this booking', 400);
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancelReason: reason },
    });

    await prisma.message.create({
      data: {
        bookingId,
        senderId: user.id,
        text: `Booking cancelled${reason ? `: ${reason}` : ''}`,
        type: 'SYSTEM',
      },
    });

    return successResponse(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
