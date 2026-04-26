import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'

const ACTIVE_STATUSES = ['PENDING', 'APPROVED', 'PAID', 'COLLECTED', 'RETURNED']

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req)

    const activeBookingsCount = await prisma.booking.count({
      where: {
        OR: [{ hirerId: user.id }, { listerId: user.id }],
        status: { in: ACTIVE_STATUSES },
      },
    })

    if (activeBookingsCount > 0) {
      return errorResponse(
        `You have ${activeBookingsCount} active booking${activeBookingsCount !== 1 ? 's' : ''}. Resolve them before deleting your account.`,
        409
      )
    }

    const threads = await prisma.thread.findMany({
      where: { OR: [{ hirerId: user.id }, { listerId: user.id }] },
      select: { id: true },
    })

    await prisma.$transaction(
      async (tx) => {
        if (threads.length > 0) {
          await tx.message.createMany({
            data: threads.map((thread) => ({
              threadId: thread.id,
              senderId: null,
              text: 'This user has deleted their account.',
              type: 'SYSTEM',
            })),
          })

          await tx.thread.updateMany({
            where: { id: { in: threads.map((t) => t.id) } },
            data: { updatedAt: new Date() },
          })
        }

        await tx.user.delete({ where: { id: user.id } })
      },
      { timeout: 15000 }
    )

    return successResponse({ deleted: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message === 'Unauthorized') return errorResponse(message, 401)
    return errorResponse(message, 500)
  }
}
