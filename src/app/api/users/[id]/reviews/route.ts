import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: id },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reviews);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
