import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Please create .env.local with your Neon connection string.'
  )
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
})
