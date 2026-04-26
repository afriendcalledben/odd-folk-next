import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { sendNewsletterWelcomeEmail } from '@/lib/email';

// POST /api/newsletter/subscribe
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return errorResponse('Valid email is required', 400);
    }

    const normalised = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalised },
    });

    if (existing) {
      // Already subscribed — return success silently
      return successResponse({ message: 'Subscribed successfully' });
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email: normalised },
    });

    // Fire-and-forget
    sendNewsletterWelcomeEmail(normalised, subscriber.token).catch(console.error);

    return successResponse({ message: 'Subscribed successfully' }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}
