import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function getClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll() {} } }
  );
}

function isSupabaseStorageUrl(url: string) {
  return url.includes('supabase.co/storage');
}

function getStoragePath(url: string) {
  const match = url.match(/\/object\/public\/avatars\/(.+)$/);
  return match ? match[1] : null;
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
    const path = `${authUser.id}/${Date.now()}.${ext}`;

    // Delete old avatar if stored in Supabase
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { avatarUrl: true },
    });
    if (currentUser?.avatarUrl && isSupabaseStorageUrl(currentUser.avatarUrl)) {
      const oldPath = getStoragePath(currentUser.avatarUrl);
      if (oldPath) await supabase.storage.from('avatars').remove([oldPath]);
    }

    // Upload using the user's own session (bucket RLS policies handle auth)
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('[avatar upload] Supabase storage error:', uploadError);
      return errorResponse(`Failed to upload image: ${uploadError.message}`, 500);
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

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

    if (currentUser?.avatarUrl && isSupabaseStorageUrl(currentUser.avatarUrl)) {
      const path = getStoragePath(currentUser.avatarUrl);
      if (path) await supabase.storage.from('avatars').remove([path]);
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
