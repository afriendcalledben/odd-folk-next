/**
 * Shared helpers for Thread operations used across API routes.
 */

import prisma from '@/lib/prisma';

/** Find an existing thread or create one for a (product, hirer) pair. */
export async function findOrCreateThread(productId: string, hirerId: string, listerId: string) {
  return prisma.thread.upsert({
    where: { productId_hirerId: { productId, hirerId } },
    create: { productId, hirerId, listerId },
    update: {},
  });
}

/** Post a SYSTEM message to a thread. senderId is the user triggering the event. */
export async function postSystemMessage(threadId: string, senderId: string, text: string) {
  return prisma.message.create({
    data: { threadId, senderId, text, type: 'SYSTEM' },
  });
}
