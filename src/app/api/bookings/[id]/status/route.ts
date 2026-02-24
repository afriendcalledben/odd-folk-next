import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// Valid status transitions: { from: { to: allowedRole } }
const STATUS_TRANSITIONS: Record<string, Record<string, 'hirer' | 'lister' | 'both'>> = {
  PENDING: {
    APPROVED: 'lister',
    DECLINED: 'lister',
  },
  APPROVED: {
    PAID: 'hirer',
    CANCELLED: 'hirer',
  },
  PAID: {
    COLLECTED: 'both',
  },
  COLLECTED: {
    RETURNED: 'both',
  },
  RETURNED: {
    COMPLETED: 'lister',
  },
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    const { status: newStatus } = await req.json();

    if (!newStatus) {
      return errorResponse('status is required', 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        product: { select: { title: true } },
      },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Determine user's role in this booking
    const isHirer = booking.hirerId === user.id;
    const isLister = booking.listerId === user.id;

    if (!isHirer && !isLister) {
      return errorResponse('Forbidden', 403);
    }

    // Validate status transition
    const allowedTransitions = STATUS_TRANSITIONS[booking.status];
    if (!allowedTransitions || !allowedTransitions[newStatus]) {
      return errorResponse(
        `Cannot transition from ${booking.status} to ${newStatus}`,
        400
      );
    }

    const allowedRole = allowedTransitions[newStatus];
    if (allowedRole === 'hirer' && !isHirer) {
      return errorResponse('Only the hirer can perform this action', 403);
    }
    if (allowedRole === 'lister' && !isLister) {
      return errorResponse('Only the lister can perform this action', 403);
    }
    if (allowedRole === 'both' && !isHirer && !isLister) {
      return errorResponse('Forbidden', 403);
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: {
        product: {
          select: { id: true, title: true, images: true },
        },
        hirer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        lister: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Create system message about the status change
    await prisma.message.create({
      data: {
        bookingId: id,
        senderId: user.id,
        text: `Booking status updated to ${newStatus}.`,
        type: 'SYSTEM',
      },
    });

    // Create ESCROW transaction when booking is PAID
    if (newStatus === 'PAID') {
      await prisma.transaction.create({
        data: {
          userId: booking.hirerId,
          bookingId: id,
          amount: booking.totalHirerCost,
          type: 'ESCROW',
          status: 'COMPLETED',
        },
      });
    }

    // Release escrow when booking is COMPLETED
    if (newStatus === 'COMPLETED') {
      await prisma.transaction.create({
        data: {
          userId: booking.listerId,
          bookingId: id,
          amount: booking.listerPayout,
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
        },
      });
    }

    return successResponse(updatedBooking);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
