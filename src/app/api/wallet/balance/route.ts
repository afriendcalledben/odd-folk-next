import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// GET /api/wallet/balance - Get wallet balance
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const [availableResult, escrowResult, pendingResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'ESCROW',
          status: 'PENDING',
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: 'PAYOUT',
          status: 'PENDING',
        },
        _sum: { amount: true },
      }),
    ]);

    return successResponse({
      available: Number(availableResult._sum.amount || 0),
      escrow: Number(escrowResult._sum.amount || 0),
      pending: Number(pendingResult._sum.amount || 0),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
