import { pgTable, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core'
import { events } from './events'
import { changeTypeEnum } from './enums'

/**
 * Public-facing audit trail for event changes
 * Provides transparency when events are moved, cancelled, or updated
 */
export const eventChanges = pgTable(
  'event_changes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),

    changeType: changeTypeEnum('change_type').notNull(),

    fieldChanged: varchar('field_changed', { length: 100 }), // e.g., "start_date", "status"
    oldValue: text('old_value'),
    newValue: text('new_value'),

    reason: text('reason'), // User-provided explanation

    changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
    changedBy: varchar('changed_by', { length: 255 }), // User ID

    // Control public visibility
    isPublic: boolean('is_public').default(true).notNull(),
  },
  (table) => ({
    eventIdx: index('idx_event_changes_event').on(table.eventId),
    dateIdx: index('idx_event_changes_date').on(table.changedAt),
  })
)

export type EventChange = typeof eventChanges.$inferSelect
export type NewEventChange = typeof eventChanges.$inferInsert
