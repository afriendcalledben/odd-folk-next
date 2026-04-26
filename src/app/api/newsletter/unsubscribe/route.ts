import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// POST /api/newsletter/unsubscribe
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return errorResponse('Token is required', 400);
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { token },
    });

    if (!subscriber) {
      return errorResponse('Invalid or expired unsubscribe link', 404);
    }

    await prisma.newsletterSubscriber.delete({ where: { token } });

    return successResponse({ message: 'Unsubscribed successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}
