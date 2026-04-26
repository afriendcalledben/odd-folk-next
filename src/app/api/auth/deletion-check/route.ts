import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { requireAuth } from '@/lib/auth'

const ACTIVE_STATUSES = ['PENDING', 'APPROVED', 'PAID', 'COLLECTED', 'RETURNED']

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)

    const [listingsCount, totalBookingsCount, activeBookingsCount, favoritesCount] =
      await Promise.all([
        prisma.product.count({ where: { ownerId: user.id } }),
        prisma.booking.count({
          where: { OR: [{ hirerId: user.id }, { listerId: user.id }] },
        }),
        prisma.booking.count({
          where: {
            OR: [{ hirerId: user.id }, { listerId: user.id }],
            status: { in: ACTIVE_STATUSES },
          },
        }),
        prisma.favorite.count({ where: { userId: user.id } }),
      ])

    return successResponse({
      canDelete: activeBookingsCount === 0,
      activeBookings: activeBookingsCount,
      listings: listingsCount,
      bookings: totalBookingsCount,
      favorites: favoritesCount,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    if (message === 'Unauthorized') return errorResponse(message, 401)
    return errorResponse(message, 500)
  }
}
