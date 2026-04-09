import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Get all bookings where user is a party, with last message + read tracking
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ hirerId: user.id }, { listerId: user.id }],
        messages: { some: {} }, // only bookings that have at least one message
      },
      include: {
        product: { select: { id: true, title: true } },
        hirer: { select: { id: true, name: true, avatarUrl: true } },
        lister: { select: { id: true, name: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, text: true, createdAt: true, senderId: true, type: true },
        },
        conversationReads: {
          where: { userId: user.id },
          select: { readAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // For each booking compute unread count (user messages since last read)
    const withUnread = await Promise.all(
      bookings.map(async (b) => {
        const readAt = b.conversationReads[0]?.readAt ?? new Date(0);
        const unreadCount = await prisma.message.count({
          where: {
            bookingId: b.id,
            senderId: { not: user.id },
            createdAt: { gt: readAt },
            type: 'USER',
          },
        });

        const otherParty = b.hirerId === user.id ? b.lister : b.hirer;
        const lastMessage = b.messages[0] ?? null;

        return {
          bookingId: b.id,
          productTitle: b.product.title,
          otherParty,
          lastMessage: lastMessage
            ? {
                text: lastMessage.type === 'SYSTEM' ? '— system update —' : lastMessage.text,
                createdAt: lastMessage.createdAt,
                isOwn: lastMessage.senderId === user.id,
              }
            : null,
          unreadCount,
        };
      })
    );

    const totalUnread = withUnread.reduce((sum, c) => sum + c.unreadCount, 0);

    return successResponse({ conversations: withUnread, totalUnread });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') return errorResponse(message, 401);
    return errorResponse(message, 500);
  }
}
