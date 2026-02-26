import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');

  if (!username || !USERNAME_RE.test(username)) {
    return errorResponse('Invalid username format', 400);
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });

    return successResponse({ available: !existing });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
