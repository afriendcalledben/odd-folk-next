import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE!,
      { cookies: { getAll: () => req.cookies.getAll(), setAll() {} } }
    );
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return errorResponse('Unauthorized', 401);

    const isGoogleUser = authUser.identities?.some(i => i.provider === 'google') ?? false;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        phone: true,
        bio: true,
        vacationMode: true,
        idVerified: true,
        addressVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ user: { ...user, isGoogleUser } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}
