import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core'

/**
 * Normalized taxonomy of industry fields/subjects
 * Maps messy source data to canonical names
 */
export const fields = pgTable('fields', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }), // e.g., "STEM", "Business", "Arts"
  rawAliases: text('raw_aliases').array(), // Typos/variants from source data
})

export type Field = typeof fields.$inferSelect
export type NewField = typeof fields.$inferInsert
