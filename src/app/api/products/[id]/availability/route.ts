import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { parseJsonField } from '@/lib/json-fields';

// GET /api/products/[id]/availability - Get unavailable dates for a product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get product with owner's blocked dates
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        owner: {
          select: { blockedDates: true, vacationMode: true },
        },
      },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Get existing bookings for this product
    const bookings = await prisma.booking.findMany({
      where: {
        productId: id,
        status: {
          in: ['PENDING', 'APPROVED', 'PAID', 'COLLECTED'],
        },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    // Combine blocked dates
    const unavailableDates: string[] = [];

    // Add owner's blocked dates (stored as JSON string)
    const ownerBlockedDates = parseJsonField(product.owner.blockedDates);
    ownerBlockedDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      unavailableDates.push(date.toISOString().split('T')[0]);
    });

    // Add booking dates
    bookings.forEach((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        unavailableDates.push(d.toISOString().split('T')[0]);
      }
    });

    // Return unique dates
    return successResponse([...new Set(unavailableDates)]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
