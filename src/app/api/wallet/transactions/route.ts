import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// GET /api/wallet/transactions - Get transaction history
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        booking: {
          include: {
            product: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = transactions.map((t) => ({
      id: t.id,
      bookingId: t.bookingId,
      productName: t.booking?.product?.title || null,
      amount: t.amount,
      type: t.type,
      status: t.status,
      createdAt: t.createdAt,
    }));

    return successResponse(mapped);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
