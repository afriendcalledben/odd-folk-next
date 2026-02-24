import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            products: { where: { status: 'ACTIVE' } },
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const avgRatingResult = await prisma.review.aggregate({
      where: { revieweeId: id },
      _avg: { rating: true },
    });

    return successResponse({
      ...user,
      avgRating: avgRatingResult._avg.rating,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
