import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

const transforms: Array<[RegExp, string]> = [
  [/^(.+?) has requested (.+)$/, '**$1** has requested **$2**'],
  [/^(.+?) approved your request for (.+)$/, '**$1** approved your request for **$2**'],
  [/^(.+?) declined your request for (.+)$/, '**$1** declined your request for **$2**'],
  [/^(.+?) cancelled the booking for (.+)$/, '**$1** cancelled the booking for **$2**'],
  [/^(.+?) has paid for (.+)$/, '**$1** has paid for **$2**'],
  [/^Your rental of (.+) is complete(.*)$/, 'Your rental of **$1** is complete$2'],
  [/^(You have \d+ hours to accept or decline )(.+?)('s request for )(.+?)( before .+)$/, '$1**$2**$3**$4**$5'],
  [/^A booking request for (.+) was not responded to(.*)$/, 'A booking request for **$1** was not responded to$2'],
  [/^Your booking request for (.+) was not responded to(.*)$/, 'Your booking request for **$1** was not responded to$2'],
  [/^(.+?) left you a (.+?-star review for )(.+)$/, '**$1** left you a $2**$3**'],
  [/^(.+?) sent you a message about (.+)$/, '**$1** sent you a message about **$2**'],
];

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse('Unauthorized', 401);
  }

  const notifications = await prisma.notification.findMany({
    where: { body: { not: { contains: '**' } } },
    select: { id: true, body: true },
  });

  let updated = 0;
  for (const n of notifications) {
    for (const [pattern, replacement] of transforms) {
      if (pattern.test(n.body)) {
        await prisma.notification.update({
          where: { id: n.id },
          data: { body: n.body.replace(pattern, replacement) },
        });
        updated++;
        break;
      }
    }
  }

  return successResponse({ total: notifications.length, updated });
}
