import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    // Fetch full user data
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        phone: true,
        bio: true,
        vacationMode: true,
        idVerified: true,
        addressVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message.includes('already') ? 400 : 500;
    return errorResponse(message, status);
  }
}
