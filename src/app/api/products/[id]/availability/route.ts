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

    // Add product-level blocked dates
    const productBlockedDates = parseJsonField(product.blockedDates);
    productBlockedDates.forEach((entry: unknown) => {
      if (entry && typeof entry === 'object' && 'start' in entry && 'end' in entry) {
        const range = entry as { start: string; end: string };
        const cur = new Date(range.start);
        const end = new Date(range.end);
        while (cur <= end) {
          unavailableDates.push(cur.toISOString().split('T')[0]);
          cur.setDate(cur.getDate() + 1);
        }
      }
    });

    // Add owner's blocked dates — supports both range format [{start,end}] and legacy flat string[]
    const ownerBlockedDates = parseJsonField(product.owner.blockedDates);
    ownerBlockedDates.forEach((entry: unknown) => {
      if (entry && typeof entry === 'object' && 'start' in entry && 'end' in entry) {
        // Range format { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
        const range = entry as { start: string; end: string };
        const cur = new Date(range.start);
        const end = new Date(range.end);
        while (cur <= end) {
          unavailableDates.push(cur.toISOString().split('T')[0]);
          cur.setDate(cur.getDate() + 1);
        }
      } else {
        // Legacy: plain date string
        const date = new Date(entry as string);
        unavailableDates.push(date.toISOString().split('T')[0]);
      }
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
