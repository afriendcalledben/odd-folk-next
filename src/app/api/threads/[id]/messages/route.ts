import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { sendNewMessageEmail } from '@/lib/email';
import { notifyNewMessage } from '@/lib/notifications';

export async function GET(
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

    const DELETED_SENDER = { id: null as string | null, name: 'Deleted User', avatarUrl: null as string | null };

    const rawMessages = await prisma.message.findMany({
      where: { threadId },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const messages = rawMessages.map((msg) => ({ ...msg, sender: msg.sender ?? DELETED_SENDER }));

    return successResponse(messages);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id: threadId } = await params;
    const { text } = await req.json();

    if (!text?.trim()) return errorResponse('text is required', 400);

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        product: { select: { title: true } },
        hirer: { select: { id: true, name: true, email: true } },
        lister: { select: { id: true, name: true, email: true } },
      },
    });
    if (!thread) return errorResponse('Thread not found', 404);
    if (thread.hirerId !== user.id && thread.listerId !== user.id) {
      return errorResponse('Forbidden', 403);
    }

    const message = await prisma.message.create({
      data: { threadId, senderId: user.id, text: text.trim(), type: 'USER' },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    // Update thread updatedAt so it sorts to top of inbox
    await prisma.thread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

    // Notify the other party (skip if they've deleted their account)
    const recipientId = thread.hirerId === user.id ? thread.listerId : thread.hirerId;
    if (recipientId) {
      const senderName = (thread.hirerId === user.id ? thread.hirer?.name : thread.lister?.name) ?? 'Someone';
      const recipient = thread.hirerId === user.id ? thread.lister : thread.hirer;

      notifyNewMessage(recipientId, senderName, thread.product.title, threadId);
      if (recipient?.email) {
        sendNewMessageEmail(thread, senderName, text.trim(), recipient.email, recipientId);
      }
    }

    return successResponse(message, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
