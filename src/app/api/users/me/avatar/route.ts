import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { uploadFile, deleteFile, getKeyFromUrl, isMinIOUrl, BUCKET_AVATARS } from '@/lib/storage';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function getClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll() {} } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getClient(req);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return errorResponse('Unauthorized', 401);

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) return errorResponse('No file provided', 400);
    if (!ALLOWED_TYPES.includes(file.type)) return errorResponse('File must be an image (JPEG, PNG, WebP, GIF)', 400);
    if (file.size > MAX_SIZE) return errorResponse('File must be under 5MB', 400);

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const key = `${authUser.id}/${Date.now()}.${ext}`;

    // Delete old avatar from MinIO if it exists there
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { avatarUrl: true },
    });
    if (currentUser?.avatarUrl && isMinIOUrl(currentUser.avatarUrl)) {
      const oldKey = getKeyFromUrl(currentUser.avatarUrl, BUCKET_AVATARS);
      if (oldKey) await deleteFile(BUCKET_AVATARS, oldKey).catch(() => {});
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadFile(BUCKET_AVATARS, key, buffer, file.type);

    await prisma.user.update({
      where: { id: authUser.id },
      data: { avatarUrl: publicUrl },
    });

    return successResponse({ avatarUrl: publicUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getClient(req);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return errorResponse('Unauthorized', 401);

    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { avatarUrl: true },
    });

    if (currentUser?.avatarUrl && isMinIOUrl(currentUser.avatarUrl)) {
      const key = getKeyFromUrl(currentUser.avatarUrl, BUCKET_AVATARS);
      if (key) await deleteFile(BUCKET_AVATARS, key).catch(() => {});
    }

    await prisma.user.update({
      where: { id: authUser.id },
      data: { avatarUrl: null },
    });

    return successResponse({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}
