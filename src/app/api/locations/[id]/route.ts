import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// PUT /api/locations/[id] - Update a location
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    const location = await prisma.location.findUnique({ where: { id } });

    if (!location) {
      return errorResponse('Location not found', 404);
    }

    if (location.userId !== user.id) {
      return errorResponse('Not authorized to update this location', 403);
    }

    const body = await req.json();

    const updated = await prisma.location.update({
      where: { id },
      data: {
        name: body.name,
        address: body.address,
        postcode: body.postcode,
        city: body.city,
        type: body.type,
        lat: body.lat,
        lng: body.lng,
      },
    });

    return successResponse(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

// DELETE /api/locations/[id] - Delete a location
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    const location = await prisma.location.findUnique({ where: { id } });

    if (!location) {
      return errorResponse('Location not found', 404);
    }

    if (location.userId !== user.id) {
      return errorResponse('Not authorized to delete this location', 403);
    }

    await prisma.location.delete({ where: { id } });

    return successResponse({ message: 'Location deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
