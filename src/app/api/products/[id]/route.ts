import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth, getAuthUser } from '@/lib/auth';
import { parseJsonField, serializeArray } from '@/lib/json-fields';

// GET /api/products/[id] - Get single product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
            reviewsReceived: { select: { rating: true } },
            _count: { select: { reviewsReceived: true } },
          },
        },
        location: {
          select: {
            id: true,
            city: true,
            postcode: true,
            lat: true,
            lng: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!product || product.status === 'DELETED') {
      return errorResponse('Product not found', 404);
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
    });

    // Check if favorited by current user
    let isFavorited = false;
    if (user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId: user.id,
            productId: product.id,
          },
        },
      });
      isFavorited = !!favorite;
    }

    const ownerRatings = product.owner.reviewsReceived.map(r => r.rating);
    const ownerAvgRating = ownerRatings.length > 0
      ? ownerRatings.reduce((a, b) => a + b, 0) / ownerRatings.length
      : null;

    return successResponse({
      ...product,
      tags: parseJsonField(product.tags),
      images: parseJsonField(product.images),
      colors: parseJsonField(product.colors),
      materials: parseJsonField(product.materials),
      blockedDates: parseJsonField(product.blockedDates),
      avgRating: avgRating._avg.rating,
      reviewCount: product._count.reviews,
      isFavorited,
      owner: {
        id: product.owner.id,
        name: product.owner.name,
        username: product.owner.username,
        avatarUrl: product.owner.avatarUrl,
        bio: product.owner.bio,
        createdAt: product.owner.createdAt,
        avgRating: ownerAvgRating,
        reviewCount: product.owner._count.reviewsReceived,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(req);

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (product.ownerId !== user.id) {
      return errorResponse('Not authorized', 403);
    }

    const body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...body };

    // Protect location changes when active bookings exist
    if ('locationId' in updateData && updateData.locationId !== product.locationId) {
      const activeBookings = await prisma.booking.count({
        where: {
          productId: id,
          status: { in: ['PENDING', 'APPROVED', 'PAID', 'COLLECTED'] },
        },
      });
      if (activeBookings > 0) {
        return errorResponse('Location cannot be changed while active bookings are in place', 400);
      }
      // Auto-update status based on whether a location is now set
      updateData.status = updateData.locationId ? 'ACTIVE' : 'DRAFT';
    }

    // Handle array fields serialization
    if (updateData.tags) {
      updateData.tags = serializeArray(
        Array.isArray(updateData.tags) ? updateData.tags : JSON.parse(updateData.tags)
      );
    }
    if (updateData.images) {
      updateData.images = serializeArray(
        Array.isArray(updateData.images) ? updateData.images : JSON.parse(updateData.images)
      );
    }
    if (updateData.colors !== undefined) {
      updateData.colors = serializeArray(
        (Array.isArray(updateData.colors) ? updateData.colors : JSON.parse(updateData.colors || '[]')).slice(0, 3)
      );
    }
    if (updateData.materials !== undefined) {
      updateData.materials = serializeArray(
        (Array.isArray(updateData.materials) ? updateData.materials : JSON.parse(updateData.materials || '[]')).slice(0, 3)
      );
    }
    if (updateData.blockedDates !== undefined) {
      updateData.blockedDates = Array.isArray(updateData.blockedDates)
        ? JSON.stringify(updateData.blockedDates)
        : updateData.blockedDates;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        location: true,
      },
    });

    return successResponse({
      ...updated,
      tags: parseJsonField(updated.tags),
      images: parseJsonField(updated.images),
      colors: parseJsonField(updated.colors),
      materials: parseJsonField(updated.materials),
      blockedDates: parseJsonField(updated.blockedDates),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

// DELETE /api/products/[id] - Soft delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth(req);

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (product.ownerId !== user.id) {
      return errorResponse('Not authorized', 403);
    }

    await prisma.product.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return successResponse({ message: 'Product deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
