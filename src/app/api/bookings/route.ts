import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { sendBookingRequestEmail } from '@/lib/email';
import { notifyBookingRequest } from '@/lib/notifications';
import { findOrCreateThread, postSystemMessage } from '@/lib/threads';

const PLATFORM_FEE_PERCENT = 0.15;

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'hirer';

    const where =
      type === 'lister' ? { listerId: user.id } : { hirerId: user.id };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        product: {
          select: { id: true, title: true, images: true },
        },
        hirer: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        lister: {
          select: { id: true, name: true, username: true, avatarUrl: true },
        },
        reviews: {
          select: { reviewerId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = bookings.map(b => ({
      ...b,
      hasReviewed: b.reviews.some(r => r.reviewerId === user.id),
    }));

    return successResponse(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const { productId, startDate, endDate, message } = await req.json();

    if (!productId || !startDate || !endDate) {
      return errorResponse(
        'productId, startDate, and endDate are required',
        400
      );
    }

    // Validate product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (product.status !== 'ACTIVE') {
      return errorResponse('Product is not available for booking', 400);
    }

    // Prevent booking own product
    if (product.ownerId === user.id) {
      return errorResponse('You cannot book your own product', 400);
    }

    // Calculate rental days and pricing
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (days < 1) {
      return errorResponse('End date must be after start date', 400);
    }

    // Determine price per day based on tier
    let pricePerDay = product.price1Day;
    if (days >= 7 && product.price7Day) {
      pricePerDay = product.price7Day;
    } else if (days >= 3 && product.price3Day) {
      pricePerDay = product.price3Day;
    }

    const baseRental = pricePerDay * days;
    const platformFee = Math.round(baseRental * PLATFORM_FEE_PERCENT * 100) / 100;
    const totalHirerCost = Math.round((baseRental + platformFee) * 100) / 100;
    const listerPayout = Math.round(baseRental * 100) / 100;

    // Find or create thread for this product+hirer pair
    const thread = await findOrCreateThread(productId, user.id, product.ownerId);

    // Create booking linked to thread
    const responseDeadlineAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const booking = await prisma.booking.create({
      data: {
        productId,
        hirerId: user.id,
        listerId: product.ownerId,
        startDate: start,
        endDate: end,
        totalHirerCost,
        listerPayout,
        platformFee,
        status: 'PENDING',
        responseDeadlineAt,
        threadId: thread.id,
      },
      include: {
        product: {
          select: { id: true, title: true, images: true },
        },
        hirer: {
          select: { id: true, name: true, username: true, avatarUrl: true, email: true },
        },
        lister: {
          select: { id: true, name: true, username: true, avatarUrl: true, email: true },
        },
      },
    });

    // Format dates for system message
    const fmtDate = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Create system message marking the booking in the thread
    await postSystemMessage(
      thread.id,
      user.id,
      `--- Booking request: ${fmtDate(start)} – ${fmtDate(end)} (${days} day${days > 1 ? 's' : ''}) ---`
    );

    // Create initial user message if provided
    if (message && message.trim()) {
      await prisma.message.create({
        data: { threadId: thread.id, senderId: user.id, text: message.trim(), type: 'USER' },
      });
    }

    // Update thread updatedAt
    await prisma.thread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });

    // Notify lister of new booking request (email + in-app)
    notifyBookingRequest(booking.listerId, booking.hirer.username ?? booking.hirer.name, booking.product.title, thread.id);
    sendBookingRequestEmail({
      id: booking.id,
      productTitle: booking.product.title,
      startDate: booking.startDate,
      endDate: booking.endDate,
      listerPayout: booking.listerPayout,
      totalHirerCost: booking.totalHirerCost,
      hirer: { name: booking.hirer.name, username: booking.hirer.username, email: booking.hirer.email },
      lister: { name: booking.lister.name, username: booking.lister.username, email: booking.lister.email },
      threadId: thread.id,
    });

    return successResponse(booking, 201);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
