import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  datasource: {
    // Use direct connection for migrations (bypasses pgbouncer)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
})
