import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const { dates } = await req.json();

    if (!Array.isArray(dates)) {
      return errorResponse('dates must be an array', 400);
    }

    const blockedDates = JSON.stringify(dates.map((d: string) => new Date(d)));

    await prisma.user.update({
      where: { id: authUser.id },
      data: { blockedDates },
    });

    return successResponse({ message: 'Blocked dates updated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
