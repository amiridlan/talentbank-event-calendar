import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Placeholder schema - actual event schema will be defined in Sprint 1
// This is just a hello-world table to verify the database connection works

export const healthCheck = pgTable('health_check', {
  id: text('id').primaryKey().default('sprint0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
