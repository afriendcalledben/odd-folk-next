/**
 * Data migration: booking-scoped messages → thread-scoped messages.
 * Runs as plain Node.js (no ts-node needed) — safe to run on every deploy.
 * All steps are idempotent (IF NOT EXISTS, ON CONFLICT DO NOTHING, etc.).
 *
 * Order in Dockerfile CMD:
 *   node scripts/migrate-to-threads.js && npx prisma db push && npm start
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('[migrate] Step 1: Create threads table if not exists...');
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

  console.log('[migrate] Step 2: Add thread_id to bookings if not exists...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id)
  `);

  console.log('[migrate] Step 3: Add thread_id to messages if not exists...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id)
  `);

  console.log('[migrate] Step 4: Add thread_id to conversation_reads if not exists...');
  await prisma.$executeRawUnsafe(`
    ALTER TABLE conversation_reads ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id)
  `);

  console.log('[migrate] Step 5: Create threads from bookings...');
  await prisma.$executeRawUnsafe(`
    INSERT INTO threads (product_id, hirer_id, lister_id, created_at, updated_at)
    SELECT DISTINCT ON (product_id, hirer_id)
      product_id, hirer_id, lister_id, MIN(created_at) OVER (PARTITION BY product_id, hirer_id), now()
    FROM bookings
    ON CONFLICT (product_id, hirer_id) DO NOTHING
  `);

  console.log('[migrate] Step 6: Link bookings to threads...');
  await prisma.$executeRawUnsafe(`
    UPDATE bookings b
    SET thread_id = t.id
    FROM threads t
    WHERE t.product_id = b.product_id
      AND t.hirer_id = b.hirer_id
      AND b.thread_id IS NULL
  `);

  console.log('[migrate] Step 7: Migrate messages.thread_id from booking_id...');
  // Only runs if booking_id column still exists
  const msgColExists = await columnExists('messages', 'booking_id');
  if (msgColExists) {
    await prisma.$executeRawUnsafe(`
      UPDATE messages m
      SET thread_id = b.thread_id
      FROM bookings b
      WHERE m.booking_id = b.id
        AND m.thread_id IS NULL
        AND b.thread_id IS NOT NULL
    `);

    // Delete any messages that couldn't be linked (orphans)
    await prisma.$executeRawUnsafe(`DELETE FROM messages WHERE thread_id IS NULL AND booking_id IS NOT NULL`);

    console.log('[migrate] Step 8: Make messages.thread_id NOT NULL, drop booking_id...');
    await prisma.$executeRawUnsafe(`ALTER TABLE messages ALTER COLUMN thread_id SET NOT NULL`);
    await prisma.$executeRawUnsafe(`ALTER TABLE messages DROP COLUMN booking_id`);
  } else {
    console.log('[migrate] Step 7-8: messages.booking_id already gone — skipping.');
  }

  console.log('[migrate] Step 9: Migrate conversation_reads.thread_id from booking_id...');
  const crColExists = await columnExists('conversation_reads', 'booking_id');
  if (crColExists) {
    await prisma.$executeRawUnsafe(`
      UPDATE conversation_reads cr
      SET thread_id = b.thread_id
      FROM bookings b
      WHERE cr.booking_id = b.id
        AND cr.thread_id IS NULL
        AND b.thread_id IS NOT NULL
    `);

    await prisma.$executeRawUnsafe(`DELETE FROM conversation_reads WHERE thread_id IS NULL`);

    console.log('[migrate] Step 10: Update conversation_reads unique constraint...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE conversation_reads DROP CONSTRAINT IF EXISTS conversation_reads_user_id_booking_id_key
    `);
    await prisma.$executeRawUnsafe(`ALTER TABLE conversation_reads DROP COLUMN booking_id`);
    await prisma.$executeRawUnsafe(`ALTER TABLE conversation_reads ALTER COLUMN thread_id SET NOT NULL`);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE conversation_reads
      ADD CONSTRAINT IF NOT EXISTS conversation_reads_user_id_thread_id_key UNIQUE (user_id, thread_id)
    `);
  } else {
    console.log('[migrate] Step 9-10: conversation_reads.booking_id already gone — skipping.');
  }

  console.log('[migrate] Done.');
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '${table}' AND column_name = '${column}'
  `);
  return rows.length > 0;
}

main()
  .catch(e => { console.error('[migrate] FAILED:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
