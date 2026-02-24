import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const products = await prisma.product.findMany({
      where: { ownerId: id, status: 'ACTIVE' },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        location: true,
      },
    });

    const parsed = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
    }));

    return successResponse(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
