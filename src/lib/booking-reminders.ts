import prisma from '@/lib/prisma';
import {
  sendBookingReminderEmail,
  sendBookingAutoDeclinedEmail,
  BookingEmailData,
} from '@/lib/email';
import {
  notifyBookingReminder,
  notifyBookingAutoDeclined,
} from '@/lib/notifications';
import { postSystemMessage } from '@/lib/threads';

export async function runBookingReminders() {
  const now = new Date();

  const pendingBookings = await prisma.booking.findMany({
    where: {
      status: 'PENDING',
      responseDeadlineAt: { not: null },
    },
    include: {
      product: { select: { title: true } },
      hirer: { select: { id: true, name: true, email: true } },
      lister: { select: { id: true, name: true, email: true } },
    },
  });

  let autoDeclined = 0;
  let reminders3h = 0;
  let reminders12h = 0;
  let reminders24h = 0;

  for (const booking of pendingBookings) {
    const deadline = booking.responseDeadlineAt!;
    const msRemaining = deadline.getTime() - now.getTime();
    const hoursRemaining = msRemaining / (1000 * 60 * 60);

    const emailData: BookingEmailData = {
      id: booking.id,
      productTitle: booking.product.title,
      startDate: booking.startDate,
      endDate: booking.endDate,
      listerPayout: booking.listerPayout,
      totalHirerCost: booking.totalHirerCost,
      hirer: { name: booking.hirer.name, email: booking.hirer.email },
      lister: { name: booking.lister.name, email: booking.lister.email },
      threadId: booking.threadId,
    };

    if (msRemaining <= 0) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'AUTO_DECLINED' },
      });
      if (booking.threadId) {
        await postSystemMessage(
          booking.threadId,
          booking.listerId,
          'This booking request was not responded to within 48 hours and has been automatically declined.'
        );
        await prisma.thread.update({ where: { id: booking.threadId }, data: { updatedAt: now } });
      }
      notifyBookingAutoDeclined(booking.listerId, booking.product.title, true, booking.threadId ?? undefined);
      notifyBookingAutoDeclined(booking.hirerId, booking.product.title, false, booking.threadId ?? undefined);
      sendBookingAutoDeclinedEmail(emailData);
      autoDeclined++;
    } else if (hoursRemaining <= 3 && !booking.reminder3Sent) {
      await prisma.booking.update({ where: { id: booking.id }, data: { reminder3Sent: true } });
      notifyBookingReminder(booking.listerId, booking.hirer.name, booking.product.title, 3, booking.threadId ?? undefined);
      sendBookingReminderEmail(emailData, 3);
      reminders3h++;
    } else if (hoursRemaining <= 12 && !booking.reminder12Sent) {
      await prisma.booking.update({ where: { id: booking.id }, data: { reminder12Sent: true } });
      notifyBookingReminder(booking.listerId, booking.hirer.name, booking.product.title, 12, booking.threadId ?? undefined);
      sendBookingReminderEmail(emailData, 12);
      reminders12h++;
    } else if (hoursRemaining <= 24 && !booking.reminder24Sent) {
      await prisma.booking.update({ where: { id: booking.id }, data: { reminder24Sent: true } });
      notifyBookingReminder(booking.listerId, booking.hirer.name, booking.product.title, 24, booking.threadId ?? undefined);
      sendBookingReminderEmail(emailData, 24);
      reminders24h++;
    }
  }

  return {
    processed: pendingBookings.length,
    autoDeclined,
    reminders: { '24h': reminders24h, '12h': reminders12h, '3h': reminders3h },
  };
}
