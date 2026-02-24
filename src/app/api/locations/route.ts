import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

// GET /api/locations - List user's locations
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const locations = await prisma.location.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(locations);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

// POST /api/locations - Create a new location
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const { name, address, postcode, city, type, lat, lng } = await req.json();

    const location = await prisma.location.create({
      data: {
        userId: user.id,
        name,
        address,
        postcode,
        city,
        type,
        lat,
        lng,
      },
    });

    return successResponse(location, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
