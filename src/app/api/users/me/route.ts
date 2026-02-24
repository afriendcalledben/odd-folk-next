import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const { name, username, phone, bio } = await req.json();

    if (username) {
      const existing = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: authUser.id },
        },
      });

      if (existing) {
        return errorResponse('Username already taken', 400);
      }
    }

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
      },
    });

    return successResponse(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    await prisma.user.delete({
      where: { id: authUser.id },
    });

    return successResponse({ message: 'Account deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
