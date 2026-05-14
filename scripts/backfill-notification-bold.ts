import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import prisma from '../src/lib/prisma';

const transforms: Array<[RegExp, string]> = [
  // {name} has requested {title}
  [/^(.+?) has requested (.+)$/, '**$1** has requested **$2**'],
  // {name} approved your request for {title}
  [/^(.+?) approved your request for (.+)$/, '**$1** approved your request for **$2**'],
  // {name} declined your request for {title}
  [/^(.+?) declined your request for (.+)$/, '**$1** declined your request for **$2**'],
  // {name} cancelled the booking for {title}
  [/^(.+?) cancelled the booking for (.+)$/, '**$1** cancelled the booking for **$2**'],
  // {name} has paid for {title}
  [/^(.+?) has paid for (.+)$/, '**$1** has paid for **$2**'],
  // Your rental of {title} is complete
  [/^Your rental of (.+) is complete(.*)$/, 'Your rental of **$1** is complete$2'],
  // {n} hours to accept or decline {name}'s request for {title}
  [/^(You have \d+ hours to accept or decline )(.+?)('s request for )(.+?)( before .+)$/, '$1**$2**$3**$4**$5'],
  // A booking request for {title} was not responded to
  [/^A booking request for (.+) was not responded to(.*)$/, 'A booking request for **$1** was not responded to$2'],
  // Your booking request for {title} was not responded to
  [/^Your booking request for (.+) was not responded to(.*)$/, 'Your booking request for **$1** was not responded to$2'],
  // {name} left you a {n}-star review for {title}
  [/^(.+?) left you a (.+?-star review for )(.+)$/, '**$1** left you a $2**$3**'],
  // {name} sent you a message about {title}
  [/^(.+?) sent you a message about (.+)$/, '**$1** sent you a message about **$2**'],
];

async function main() {
  const notifications = await prisma.notification.findMany({
    where: { body: { not: { contains: '**' } } },
    select: { id: true, body: true },
  });

  console.log(`Found ${notifications.length} notifications to process`);

  let updated = 0;
  for (const n of notifications) {
    for (const [pattern, replacement] of transforms) {
      if (pattern.test(n.body)) {
        const newBody = n.body.replace(pattern, replacement);
        await prisma.notification.update({
          where: { id: n.id },
          data: { body: newBody },
        });
        updated++;
        break;
      }
    }
  }

  console.log(`Done — updated ${updated} of ${notifications.length} notifications`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
