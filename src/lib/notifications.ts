import prisma from '@/lib/prisma';

export const NotificationType = {
  BOOKING_REQUEST: 'BOOKING_REQUEST',
  BOOKING_APPROVED: 'BOOKING_APPROVED',
  BOOKING_DECLINED: 'BOOKING_DECLINED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',
} as const;

const DASHBOARD_BOOKINGS = '/dashboard?tab=bookings';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  linkUrl: string = DASHBOARD_BOOKINGS
) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, linkUrl },
    });
  } catch (err) {
    console.error('[notification] Failed to create:', type, err);
  }
}

// Convenience helpers — mirror the email.ts pattern

export function notifyBookingRequest(listerId: string, hirerName: string, productTitle: string) {
  return createNotification(
    listerId,
    NotificationType.BOOKING_REQUEST,
    'New booking request',
    `${hirerName} has requested ${productTitle}`
  );
}

export function notifyBookingApproved(hirerId: string, listerName: string, productTitle: string) {
  return createNotification(
    hirerId,
    NotificationType.BOOKING_APPROVED,
    'Booking approved',
    `${listerName} approved your request for ${productTitle}`
  );
}

export function notifyBookingDeclined(hirerId: string, listerName: string, productTitle: string) {
  return createNotification(
    hirerId,
    NotificationType.BOOKING_DECLINED,
    'Booking declined',
    `${listerName} declined your request for ${productTitle}`
  );
}

export function notifyBookingCancelled(recipientId: string, cancellerName: string, productTitle: string) {
  return createNotification(
    recipientId,
    NotificationType.BOOKING_CANCELLED,
    'Booking cancelled',
    `${cancellerName} cancelled the booking for ${productTitle}`
  );
}

export function notifyPaymentReceived(listerId: string, hirerName: string, productTitle: string) {
  return createNotification(
    listerId,
    NotificationType.PAYMENT_RECEIVED,
    'Payment received',
    `${hirerName} has paid for ${productTitle}`
  );
}

export function notifyBookingCompleted(userId: string, productTitle: string) {
  return createNotification(
    userId,
    NotificationType.BOOKING_COMPLETED,
    'Rental complete',
    `Your rental of ${productTitle} is complete — leave a review!`
  );
}

export function notifyReviewReceived(revieweeId: string, reviewerName: string, rating: number, productTitle: string) {
  return createNotification(
    revieweeId,
    NotificationType.REVIEW_RECEIVED,
    'New review',
    `${reviewerName} left you a ${rating}-star review for ${productTitle}`
  );
}
