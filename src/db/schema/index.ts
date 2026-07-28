// Export all enums
export * from './enums'

// Export all tables and types
export * from './events'
export * from './fields'
export * from './eventFields'
export * from './eventChanges'
export * from './registrations'
export * from './auth'

// Re-export commonly used relations for convenience
import { events } from './events'
import { fields } from './fields'
import { eventFields } from './eventFields'
import { eventChanges } from './eventChanges'
import { registrations } from './registrations'
import { users, accounts, sessions, verificationTokens } from './auth'

export const schema = {
  events,
  fields,
  eventFields,
  eventChanges,
  registrations,
  users,
  accounts,
  sessions,
  verificationTokens,
}
