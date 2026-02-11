import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            location: true,
          },
        },
        hirer: {
          select: { id: true, name: true, avatarUrl: true },
        },
        lister: {
          select: { id: true, name: true, avatarUrl: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Check user is hirer or lister
    if (booking.hirerId !== user.id && booking.listerId !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    return successResponse(booking);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
