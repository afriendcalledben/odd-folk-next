import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const { phone, code } = await req.json();

    if (!phone) {
      return errorResponse('Phone number is required', 400);
    }

    if (code && !/^\d{6}$/.test(code)) {
      return errorResponse('Verification code must be 6 digits', 400);
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        phone,
        phoneVerified: true,
      },
      select: {
        idVerified: true,
        addressVerified: true,
        phoneVerified: true,
        phone: true,
        verifiedAt: true,
      },
    });

    const isFullyVerified = updated.idVerified && updated.addressVerified && updated.phoneVerified;

    if (isFullyVerified && !updated.verifiedAt) {
      await prisma.user.update({
        where: { id: authUser.id },
        data: { verifiedAt: new Date() },
      });
    }

    return successResponse({
      idVerified: updated.idVerified,
      addressVerified: updated.addressVerified,
      phoneVerified: updated.phoneVerified,
      hasPhone: !!updated.phone,
      verifiedAt: isFullyVerified ? updated.verifiedAt || new Date() : updated.verifiedAt,
      isFullyVerified,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
