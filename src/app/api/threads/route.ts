import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth';
import { findOrCreateThread } from '@/lib/threads';

/** POST /api/threads — find-or-create thread for { productId } */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { productId } = await req.json();

    if (!productId) return errorResponse('productId is required', 400);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, ownerId: true, status: true },
    });
    if (!product) return errorResponse('Product not found', 404);
    if (product.ownerId === user.id) return errorResponse('Cannot message yourself', 400);

    const thread = await findOrCreateThread(productId, user.id, product.ownerId);
    return successResponse({ threadId: thread.id }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}

/** GET /api/threads — list all threads for current user */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const threads = await prisma.thread.findMany({
      where: {
        OR: [{ hirerId: user.id }, { listerId: user.id }],
      },
      include: {
        product: { select: { id: true, title: true, images: true } },
        hirer: { select: { id: true, name: true, username: true, avatarUrl: true } },
        lister: { select: { id: true, name: true, username: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            totalHirerCost: true,
          },
        },
        conversationReads: {
          where: { userId: user.id },
          select: { readAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const DELETED_USER = { id: null as string | null, name: 'Deleted User', username: null as string | null, avatarUrl: null as string | null };

    // Calculate unread counts
    const result = await Promise.all(threads.map(async (thread) => {
      const readAt = thread.conversationReads[0]?.readAt ?? new Date(0);
      const otherPartyRaw = thread.hirerId === user.id ? thread.lister : thread.hirer;
      const otherParty = otherPartyRaw ?? DELETED_USER;

      const unreadCount = await prisma.message.count({
        where: {
          threadId: thread.id,
          senderId: { not: user.id },
          createdAt: { gt: readAt },
          type: 'USER',
        },
      });

      const lastMsg = thread.messages[0] ?? null;
      const activeBooking = thread.bookings[0] ?? null;

      return {
        threadId: thread.id,
        productId: thread.product.id,
        productTitle: thread.product.title,
        productImage: (() => {
          try { return (JSON.parse(thread.product.images) as string[])[0] ?? null; } catch { return null; }
        })(),
        otherParty,
        lastMessage: lastMsg
          ? { text: lastMsg.text, type: lastMsg.type, createdAt: lastMsg.createdAt, isOwn: lastMsg.senderId === user.id }
          : null,
        unreadCount,
        activeBooking,
      };
    }));

    const totalUnread = result.reduce((s, c) => s + c.unreadCount, 0);

    return successResponse({ threads: result, totalUnread });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
