import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// POST /api/reports - Create a report
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const { type, targetId, reason, details } = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reportData: any = {
      reporterId: user.id,
      type,
      reason,
      details,
    };

    if (type === 'USER') {
      reportData.targetUserId = targetId;
    } else if (type === 'PRODUCT') {
      reportData.targetProductId = targetId;
    }

    const report = await prisma.report.create({
      data: reportData,
    });

    return successResponse(report, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
