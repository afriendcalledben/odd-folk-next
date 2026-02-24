import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

// POST /api/contact - Submit a contact form
export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return errorResponse('All fields are required');
    }

    if (message.length < 10) {
      return errorResponse('Message must be at least 10 characters');
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    return successResponse(
      { message: 'Contact inquiry submitted successfully', id: inquiry.id },
      201
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}
