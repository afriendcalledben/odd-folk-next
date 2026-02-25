import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function getAuthClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll() {} } }
  );
}

function getAdminStorageClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function isSupabaseStorageUrl(url: string) {
  return url.includes('supabase.co/storage');
}

function getStoragePath(url: string) {
  // Extract path after /object/public/avatars/
  const match = url.match(/\/object\/public\/avatars\/(.+)$/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getAuthClient(req);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return errorResponse('Unauthorized', 401);

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) return errorResponse('No file provided', 400);
    if (!ALLOWED_TYPES.includes(file.type)) return errorResponse('File must be an image (JPEG, PNG, WebP, GIF)', 400);
    if (file.size > MAX_SIZE) return errorResponse('File must be under 5MB', 400);

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `${authUser.id}/${Date.now()}.${ext}`;

    // Delete old avatar from storage if it was uploaded there
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { avatarUrl: true },
    });
    const admin = getAdminStorageClient();
    if (currentUser?.avatarUrl && isSupabaseStorageUrl(currentUser.avatarUrl)) {
      const oldPath = getStoragePath(currentUser.avatarUrl);
      if (oldPath) await admin.storage.from('avatars').remove([oldPath]);
    }

    // Upload new file
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from('avatars')
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) return errorResponse('Failed to upload image', 500);

    const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path);

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
    const supabase = getAuthClient(req);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return errorResponse('Unauthorized', 401);

    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { avatarUrl: true },
    });

    // Delete from storage if it's a Supabase-hosted file
    if (currentUser?.avatarUrl && isSupabaseStorageUrl(currentUser.avatarUrl)) {
      const path = getStoragePath(currentUser.avatarUrl);
      if (path) {
        const admin = getAdminStorageClient();
        await admin.storage.from('avatars').remove([path]);
      }
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
