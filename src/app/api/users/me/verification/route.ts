import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        idVerified: true,
        addressVerified: true,
        phoneVerified: true,
        phone: true,
        verificationDocs: true,
        verifiedAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const documents = JSON.parse(user.verificationDocs || '[]');
    const isFullyVerified = user.idVerified && user.addressVerified && user.phoneVerified;

    return successResponse({
      idVerified: user.idVerified,
      addressVerified: user.addressVerified,
      phoneVerified: user.phoneVerified,
      hasPhone: !!user.phone,
      documents,
      verifiedAt: user.verifiedAt,
      isFullyVerified,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
