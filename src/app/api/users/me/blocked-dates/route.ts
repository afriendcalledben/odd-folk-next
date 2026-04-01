import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { blockedDates: true },
    });
    const ranges = JSON.parse(user?.blockedDates || '[]');
    return successResponse({ ranges });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const { ranges } = await req.json();

    if (!Array.isArray(ranges)) {
      return errorResponse('ranges must be an array', 400);
    }

    await prisma.user.update({
      where: { id: authUser.id },
      data: { blockedDates: JSON.stringify(ranges) },
    });

    return successResponse({ message: 'Blocked dates updated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
