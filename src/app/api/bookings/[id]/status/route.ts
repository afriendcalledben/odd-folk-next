import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import {
  sendBookingApprovedEmail,
  sendBookingDeclinedEmail,
  sendPaymentReceivedEmail,
  sendBookingCompletedEmail,
  type BookingEmailData,
} from '@/lib/email';
import {
  notifyBookingApproved,
  notifyBookingDeclined,
  notifyPaymentReceived,
  notifyBookingCompleted,
} from '@/lib/notifications';
import { postSystemMessage } from '@/lib/threads';

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

    const { status: newStatus, reason } = await req.json();

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
      data: {
        status: newStatus,
        ...(newStatus === 'DECLINED' && reason ? { cancelReason: reason } : {}),
      },
      include: {
        product: {
          select: { id: true, title: true, images: true },
        },
        hirer: {
          select: { id: true, name: true, avatarUrl: true, email: true },
        },
        lister: {
          select: { id: true, name: true, avatarUrl: true, email: true },
        },
      },
    });

    // Post system message to thread
    if (updatedBooking.threadId) {
      let systemText = `Booking status updated to ${newStatus}.`;
      if (newStatus === 'APPROVED') {
        systemText = 'Your booking request has been approved.';
      } else if (newStatus === 'DECLINED') {
        systemText = reason
          ? `Your booking request has been declined. Reason: ${reason}`
          : 'Your booking request has been declined.';
      } else if (newStatus === 'PAID') {
        systemText = 'Payment confirmed — booking is secured.';
      } else if (newStatus === 'COLLECTED') {
        systemText = 'Items collected — enjoy your event!';
      } else if (newStatus === 'RETURNED') {
        systemText = 'Items returned — awaiting confirmation.';
      } else if (newStatus === 'COMPLETED') {
        systemText = 'Rental complete. Thanks for using Odd Folk!';
      }
      await postSystemMessage(updatedBooking.threadId, user.id, systemText);
      // Update thread updatedAt
      await prisma.thread.update({ where: { id: updatedBooking.threadId }, data: { updatedAt: new Date() } });
    }

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

    // Send email notifications
    const emailData: BookingEmailData = {
      id: updatedBooking.id,
      productTitle: updatedBooking.product.title,
      startDate: updatedBooking.startDate,
      endDate: updatedBooking.endDate,
      listerPayout: updatedBooking.listerPayout,
      totalHirerCost: updatedBooking.totalHirerCost,
      hirer: { name: updatedBooking.hirer.name, email: updatedBooking.hirer.email },
      lister: { name: updatedBooking.lister.name, email: updatedBooking.lister.email },
      threadId: updatedBooking.threadId,
    };
    const productTitle = updatedBooking.product.title;
    if (newStatus === 'APPROVED') {
      sendBookingApprovedEmail(emailData);
      notifyBookingApproved(updatedBooking.hirerId, updatedBooking.lister.name, productTitle, updatedBooking.threadId ?? undefined);
    }
    if (newStatus === 'DECLINED') {
      sendBookingDeclinedEmail(emailData);
      notifyBookingDeclined(updatedBooking.hirerId, updatedBooking.lister.name, productTitle, updatedBooking.threadId ?? undefined);
    }
    if (newStatus === 'PAID') {
      sendPaymentReceivedEmail(emailData);
      notifyPaymentReceived(updatedBooking.listerId, updatedBooking.hirer.name, productTitle, updatedBooking.threadId ?? undefined);
    }
    if (newStatus === 'COMPLETED') {
      sendBookingCompletedEmail(emailData);
      notifyBookingCompleted(updatedBooking.hirerId, productTitle, updatedBooking.threadId ?? undefined);
      notifyBookingCompleted(updatedBooking.listerId, productTitle, updatedBooking.threadId ?? undefined);
    }

    return successResponse(updatedBooking);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
