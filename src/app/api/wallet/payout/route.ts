import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// POST /api/wallet/payout - Request a payout
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return errorResponse('Invalid payout amount');
    }

    // Calculate available balance: ESCROW_RELEASE completed minus PAYOUT pending
    const [releasedResult, payoutPendingResult] = await Promise.all([
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
          type: 'PAYOUT',
          status: 'PENDING',
        },
        _sum: { amount: true },
      }),
    ]);

    const available =
      Number(releasedResult._sum.amount || 0) -
      Number(payoutPendingResult._sum.amount || 0);

    if (amount > available) {
      return errorResponse('Insufficient available balance');
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'PAYOUT',
        status: 'PENDING',
      },
    });

    return successResponse(transaction, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
