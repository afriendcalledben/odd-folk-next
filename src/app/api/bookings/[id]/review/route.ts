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
    const { rating, comment } = await req.json();

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return errorResponse('Booking not found', 404);
    if (booking.status !== 'COMPLETED') {
      return errorResponse('Can only review completed bookings', 400);
    }
    if (booking.hirerId !== user.id) {
      return errorResponse('Only the hirer can leave a review', 403);
    }

    const existing = await prisma.review.findUnique({ where: { bookingId } });
    if (existing) return errorResponse('Review already exists', 400);

    const review = await prisma.review.create({
      data: {
        bookingId,
        productId: booking.productId,
        reviewerId: user.id,
        revieweeId: booking.listerId,
        rating,
        comment,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return successResponse(review, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
