import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { sendContactConfirmationEmail, sendNewsletterWelcomeEmail } from '@/lib/email';

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip in dev if not configured

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }),
  });

  const data = await res.json();
  return data.success === true;
}

// POST /api/contact - Submit a contact form
export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, captchaToken, subscribeToNewsletter } = await req.json();

    if (!name || !email || !subject || !message) {
      return errorResponse('All fields are required');
    }

    if (message.length < 10) {
      return errorResponse('Message must be at least 10 characters');
    }

    // Verify CAPTCHA
    if (!captchaToken) {
      return errorResponse('CAPTCHA verification required', 400);
    }

    const ip = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For');
    const captchaValid = await verifyTurnstile(captchaToken, ip);
    if (!captchaValid) {
      return errorResponse('CAPTCHA verification failed. Please try again.', 400);
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        subject,
        message,
        subscribedToNewsletter: subscribeToNewsletter === true,
      },
    });

    // Newsletter opt-in
    if (subscribeToNewsletter === true) {
      const normalised = email.toLowerCase().trim();
      const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalised } });
      if (!existing) {
        const subscriber = await prisma.newsletterSubscriber.create({ data: { email: normalised } });
        sendNewsletterWelcomeEmail(normalised, subscriber.token).catch(console.error);
      }
    }

    // Confirmation email to sender
    sendContactConfirmationEmail(name, email, subject).catch(console.error);

    return successResponse(
      { message: 'Contact inquiry submitted successfully', id: inquiry.id },
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}
