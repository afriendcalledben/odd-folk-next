import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { sendBookingCancelledEmail } from '@/lib/email';
import { notifyBookingCancelled } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id: bookingId } = await params;
    const { reason } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: { select: { title: true } },
        hirer: { select: { name: true, email: true } },
        lister: { select: { name: true, email: true } },
      },
    });
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

    const cancelledByRole = booking.hirerId === user.id ? 'hirer' : 'lister';
    const recipientId = cancelledByRole === 'hirer' ? booking.listerId : booking.hirerId;
    const cancellerName = cancelledByRole === 'hirer' ? booking.hirer.name : booking.lister.name;
    notifyBookingCancelled(recipientId, cancellerName, booking.product.title);
    sendBookingCancelledEmail({
      id: bookingId,
      productTitle: booking.product.title,
      startDate: booking.startDate,
      endDate: booking.endDate,
      listerPayout: booking.listerPayout,
      totalHirerCost: booking.totalHirerCost,
      hirer: { name: booking.hirer.name, email: booking.hirer.email },
      lister: { name: booking.lister.name, email: booking.lister.email },
    }, cancelledByRole);

    return successResponse(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
