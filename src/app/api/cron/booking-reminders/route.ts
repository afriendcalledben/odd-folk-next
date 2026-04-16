import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { runBookingReminders } from '@/lib/booking-reminders';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');

  if (!secret || auth !== `Bearer ${secret}`) {
    return errorResponse('Unauthorized', 401);
  }

  const result = await runBookingReminders();
  return successResponse(result);
}
