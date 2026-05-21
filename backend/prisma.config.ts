import { defineConfig } from '@prisma/internals'

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
})
