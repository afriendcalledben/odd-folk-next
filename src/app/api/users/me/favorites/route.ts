import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    const favorites = await prisma.favorite.findMany({
      where: { userId: authUser.id },
      include: {
        product: {
          include: {
            owner: { select: { id: true, name: true, avatarUrl: true } },
            location: true,
          },
        },
      },
    });

    const products = favorites
      .filter((fav) => fav.product.status === 'ACTIVE')
      .map((fav) => ({
        ...fav.product,
        images: JSON.parse(fav.product.images || '[]'),
        tags: JSON.parse(fav.product.tags || '[]'),
      }));

    return successResponse(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
