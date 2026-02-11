import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Look up user but don't reveal if they exist
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // TODO: Send actual password reset email
      console.log(`Password reset requested for user: ${user.id} (${user.email})`);
    }

    // Always return success to prevent email enumeration
    return successResponse({
      message: 'If an account exists, a reset email has been sent',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message.includes('already') ? 400 : 500;
    return errorResponse(message, status);
  }
}
