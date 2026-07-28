import { pgTable, uuid, integer, primaryKey, index } from 'drizzle-orm/pg-core'
import { events } from './events'
import { fields } from './fields'

/**
 * Many-to-many relationship: Events can have multiple fields/industries,
 * and fields can be associated with multiple events
 */
export const eventFields = pgTable(
  'event_fields',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    fieldId: integer('field_id')
      .notNull()
      .references(() => fields.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.fieldId] }),
    eventIdx: index('idx_event_fields_event').on(table.eventId),
    fieldIdx: index('idx_event_fields_field').on(table.fieldId),
  })
)

export type EventField = typeof eventFields.$inferSelect
export type NewEventField = typeof eventFields.$inferInsert
