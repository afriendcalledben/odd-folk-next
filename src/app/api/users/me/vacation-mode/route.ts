import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const { enabled } = await req.json();

    await prisma.user.update({
      where: { id: authUser.id },
      data: { vacationMode: enabled },
    });

    return successResponse({ message: `Vacation mode ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
