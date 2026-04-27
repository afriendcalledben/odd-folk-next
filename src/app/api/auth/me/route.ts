import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const googleAccount = await prisma.account.findFirst({
      where: { userId: authUser.id, providerId: 'google' },
    });
    const isGoogleUser = !!googleAccount;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        image: true,
        phone: true,
        bio: true,
        vacationMode: true,
        blockedDates: true,
        idVerified: true,
        addressVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const { image, ...rest } = user;
    return successResponse({ user: { ...rest, avatarUrl: user.avatarUrl || image || null, isGoogleUser } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}
