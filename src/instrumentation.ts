export async function register() {
  // Only run in the Node.js server runtime, not during build or in edge workers
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { default: cron } = await import('node-cron');
  const { runBookingReminders } = await import('@/lib/booking-reminders');

  // Run every hour to check booking response deadlines
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await runBookingReminders();
      console.log('[booking-reminders]', result);
    } catch (err) {
      console.error('[booking-reminders] Failed:', err);
    }
  });

  console.log('[booking-reminders] Cron scheduled — runs every hour');
}
