import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id: threadId } = await params;

    const thread = await prisma.thread.findUnique({ where: { id: threadId } });
    if (!thread) return errorResponse('Thread not found', 404);
    if (thread.hirerId !== user.id && thread.listerId !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    await prisma.conversationRead.upsert({
      where: { userId_threadId: { userId: user.id, threadId } },
      create: { userId: user.id, threadId, readAt: new Date() },
      update: { readAt: new Date() },
    });

    return successResponse({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
