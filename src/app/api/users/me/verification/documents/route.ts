import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const { documentType, documentUrl } = await req.json();

    if (!documentType || !documentUrl) {
      return errorResponse('documentType and documentUrl are required', 400);
    }

    if (!['id', 'address'].includes(documentType)) {
      return errorResponse('documentType must be "id" or "address"', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { verificationDocs: true, idVerified: true, addressVerified: true, phoneVerified: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const existingDocs = JSON.parse(user.verificationDocs || '[]');
    existingDocs.push({
      type: documentType,
      url: documentUrl,
      uploadedAt: new Date().toISOString(),
    });

    const idVerified = documentType === 'id' ? true : user.idVerified;
    const addressVerified = documentType === 'address' ? true : user.addressVerified;
    const isFullyVerified = idVerified && addressVerified && user.phoneVerified;

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        verificationDocs: JSON.stringify(existingDocs),
        idVerified,
        addressVerified,
        ...(isFullyVerified && !user.idVerified && !user.addressVerified
          ? {}
          : isFullyVerified
            ? { verifiedAt: new Date() }
            : {}),
      },
      select: {
        idVerified: true,
        addressVerified: true,
        phoneVerified: true,
        verificationDocs: true,
        verifiedAt: true,
      },
    });

    return successResponse({
      idVerified: updated.idVerified,
      addressVerified: updated.addressVerified,
      phoneVerified: updated.phoneVerified,
      documents: JSON.parse(updated.verificationDocs || '[]'),
      verifiedAt: updated.verifiedAt,
      isFullyVerified: updated.idVerified && updated.addressVerified && updated.phoneVerified,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
