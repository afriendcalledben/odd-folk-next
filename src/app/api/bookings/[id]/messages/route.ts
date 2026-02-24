import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id: bookingId } = await params;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return errorResponse('Booking not found', 404);
    if (booking.hirerId !== user.id && booking.listerId !== user.id) {
      return errorResponse('Not authorized', 403);
    }

    const messages = await prisma.message.findMany({
      where: { bookingId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return successResponse(messages);
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
    const { text } = await req.json();

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return errorResponse('Booking not found', 404);
    if (booking.hirerId !== user.id && booking.listerId !== user.id) {
      return errorResponse('Not authorized', 403);
    }

    const message = await prisma.message.create({
      data: { bookingId, senderId: user.id, text, type: 'USER' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return successResponse(message, 201);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 401);
    }
    return errorResponse('Internal server error', 500);
  }
}
