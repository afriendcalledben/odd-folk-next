/**
 * Migration script: introduce the Thread model and migrate all existing data.
 *
 * Run this BEFORE `npx prisma db push` (it creates the tables and migrates data,
 * then prisma db push will see the schema already matches and be a no-op).
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-to-threads.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Step 1: Create threads table...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS threads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id),
      hirer_id TEXT NOT NULL REFERENCES users(id),
      lister_id TEXT NOT NULL REFERENCES users(id),
      hirer_last_msg_email_at TIMESTAMPTZ,
      lister_last_msg_email_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT threads_product_hirer_unique UNIQUE (product_id, hirer_id)
    )
  `);

  console.log('Step 2: Add thread_id to bookings...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id)
  `);

  console.log('Step 3: Add thread_id to messages (nullable for now)...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id)
  `);

  console.log('Step 4: Add thread_id to conversation_reads (nullable for now)...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE conversation_reads ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id)
  `);

  console.log('Step 5: Create threads from bookings...');
  // Use raw SQL to bulk-insert unique threads from bookings
  await prisma.$executeRawUnsafe(`
    INSERT INTO threads (product_id, hirer_id, lister_id, created_at, updated_at)
    SELECT DISTINCT ON (product_id, hirer_id)
      product_id, hirer_id, lister_id, MIN(created_at) OVER (PARTITION BY product_id, hirer_id), now()
    FROM bookings
    ON CONFLICT (product_id, hirer_id) DO NOTHING
  `);

  console.log('Step 6: Link bookings to their threads...');
  await prisma.$executeRawUnsafe(`
    UPDATE bookings b
    SET thread_id = t.id
    FROM threads t
    WHERE t.product_id = b.product_id
      AND t.hirer_id = b.hirer_id
      AND b.thread_id IS NULL
  `);

  console.log('Step 7: Migrate messages.thread_id from booking_id...');
  await prisma.$executeRawUnsafe(`
    UPDATE messages m
    SET thread_id = b.thread_id
    FROM bookings b
    WHERE m.booking_id = b.id
      AND m.thread_id IS NULL
      AND b.thread_id IS NOT NULL
  `);

  console.log('Step 8: Migrate conversation_reads.thread_id from booking_id...');
  await prisma.$executeRawUnsafe(`
    UPDATE conversation_reads cr
    SET thread_id = b.thread_id
    FROM bookings b
    WHERE cr.booking_id = b.id
      AND cr.thread_id IS NULL
      AND b.thread_id IS NOT NULL
  `);

  console.log('Step 9: Drop booking_id from messages...');
  // First check if booking_id still has data
  const [{ count: unmigratedMsgs }] = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM messages WHERE thread_id IS NULL
  `;
  if (Number(unmigratedMsgs) > 0) {
    console.warn(`WARNING: ${unmigratedMsgs} messages have no thread_id — deleting orphaned rows.`);
    await prisma.$executeRawUnsafe(`DELETE FROM messages WHERE thread_id IS NULL`);
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE messages DROP COLUMN IF EXISTS booking_id`);
  await prisma.$executeRawUnsafe(`ALTER TABLE messages ALTER COLUMN thread_id SET NOT NULL`);

  console.log('Step 10: Drop booking_id from conversation_reads + update unique constraint...');
  const [{ count: unmigratedReads }] = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count FROM conversation_reads WHERE thread_id IS NULL
  `;
  if (Number(unmigratedReads) > 0) {
    console.warn(`WARNING: ${unmigratedReads} conversation_reads have no thread_id — deleting.`);
    await prisma.$executeRawUnsafe(`DELETE FROM conversation_reads WHERE thread_id IS NULL`);
  }
  // Drop old unique constraint and booking_id column
  await prisma.$executeRawUnsafe(`
    ALTER TABLE conversation_reads DROP CONSTRAINT IF EXISTS conversation_reads_user_id_booking_id_key
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE conversation_reads DROP COLUMN IF EXISTS booking_id`);
  await prisma.$executeRawUnsafe(`ALTER TABLE conversation_reads ALTER COLUMN thread_id SET NOT NULL`);
  // Add new unique constraint
  await prisma.$executeRawUnsafe(`
    ALTER TABLE conversation_reads
    ADD CONSTRAINT conversation_reads_user_id_thread_id_key UNIQUE (user_id, thread_id)
  `);

  console.log('\n✓ Migration complete. Run `npx prisma generate` to update the Prisma client.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
