import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { sendReviewReceivedEmail } from '@/lib/email';
import { notifyReviewReceived } from '@/lib/notifications';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id: bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { reviews: { select: { reviewerId: true } } },
    });
    if (!booking) return errorResponse('Booking not found', 404);
    if (booking.hirerId !== user.id && booking.listerId !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    return successResponse({
      hirerReviewed: booking.reviews.some(r => r.reviewerId === booking.hirerId),
      listerReviewed: booking.reviews.some(r => r.reviewerId === booking.listerId),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id: bookingId } = await params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        hirer: { select: { id: true, name: true, username: true, email: true } },
        lister: { select: { id: true, name: true, username: true, email: true } },
        product: { select: { id: true, title: true } },
      },
    });
    if (!booking) return errorResponse('Booking not found', 404);
    if (booking.status !== 'COMPLETED') {
      return errorResponse('Can only review completed bookings', 400);
    }

    const isHirer = booking.hirerId === user.id;
    const isLister = booking.listerId === user.id;
    if (!isHirer && !isLister) {
      return errorResponse('You are not part of this booking', 403);
    }

    const revieweeId = isHirer ? booking.listerId : booking.hirerId;
    const reviewee = isHirer ? booking.lister : booking.hirer;
    const reviewer = isHirer ? booking.hirer : booking.lister;

    const review = await prisma.review.create({
      data: {
        bookingId,
        productId: booking.productId,
        reviewerId: user.id,
        revieweeId,
        rating,
        comment: comment || null,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    notifyReviewReceived(revieweeId, reviewer.username ?? reviewer.name, rating, booking.product.title);
    sendReviewReceivedEmail({
      reviewee: { name: reviewee.name, email: reviewee.email },
      reviewer: { name: reviewer.name, username: reviewer.username },
      rating,
      comment: comment || null,
      productTitle: booking.product.title,
    });

    return successResponse(review, 201);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
      // Prisma unique constraint violation
      if ('code' in error && (error as { code: string }).code === 'P2002') {
        return errorResponse('You have already reviewed this booking', 409);
      }
    }
    return errorResponse('Internal server error', 500);
  }
}
