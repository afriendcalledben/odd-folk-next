import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// POST /api/products/[id]/favorite - Toggle favorite
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const user = await requireAuth(req);
    const userId = user.id;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return successResponse({ isFavorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId, productId },
      });
      return successResponse({ isFavorited: true });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
