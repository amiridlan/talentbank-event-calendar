import { createEvents, type EventAttributes, type DateArray } from 'ics'
import type { EventResponse } from '@/lib/validations/event'

/**
 * Converts a Date object or ISO string to ICS DateArray format
 * DateArray format: [year, month, day, hour, minute]
 */
function toDateArray(date: Date | string): DateArray {
  const d = typeof date === 'string' ? new Date(date) : date
  return [
    d.getFullYear(),
    d.getMonth() + 1, // ICS months are 1-indexed
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
  ]
}

/**
 * Generates an .ics file content for a single event
 */
export function generateEventICS(event: EventResponse): string {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)

  // For all-day events, set times to start of day
  const start = toDateArray(startDate)
  const end = toDateArray(endDate)

  // Build location string
  const location = [
    event.venueName || 'Venue TBA',
    event.venueAddress,
    event.region.replace('_', ' '),
  ]
    .filter(Boolean)
    .join(', ')

  // Build description with event details
  const descriptionParts = [
    `${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} Career Fair`,
    '',
  ]

  if (event.fields.length > 0) {
    descriptionParts.push('Industries/Fields:')
    descriptionParts.push(event.fields.map((f) => `• ${f.name}`).join('\n'))
    descriptionParts.push('')
  }

  // Add capacity information
  if (event.candidateCapacity || event.employerCapacity) {
    descriptionParts.push('Registration Capacity:')
    if (event.candidateCapacity) {
      descriptionParts.push(
        `• Candidates: ${event.candidateRegistered}/${event.candidateCapacity} registered`
      )
    }
    if (event.employerCapacity) {
      descriptionParts.push(
        `• Employers: ${event.employerRegistered}/${event.employerCapacity} booths`
      )
    }
    descriptionParts.push('')
  }

  if (event.externalUrl) {
    descriptionParts.push(`More info: ${event.externalUrl}`)
  }

  const eventData: EventAttributes = {
    start,
    end,
    title: event.name,
    description: descriptionParts.join('\n'),
    location,
    url: event.externalUrl || (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}` : undefined),
    status: event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: {
      name: 'TalentCorp Malaysia',
      email: 'events@talentcorp.com.my',
    },
    categories: [
      event.eventType,
      ...event.fields.map((f) => f.name),
    ],
  }

  // Add alarm/reminder for 1 day before
  if (event.status === 'scheduled') {
    eventData.alarms = [
      {
        action: 'display',
        description: `Reminder: ${event.name} tomorrow`,
        trigger: { hours: 24, before: true },
      },
    ]
  }

  const { error, value } = createEvents([eventData])

  if (error) {
    throw new Error(`Failed to generate ICS: ${error.message}`)
  }

  return value || ''
}

/**
 * Generates an .ics file for multiple events (for webcal feeds)
 */
export function generateMultipleEventsICS(
  events: EventResponse[],
  calendarName = 'TalentCorp Career Fairs'
): string {
  const eventAttributes: EventAttributes[] = events.map((event) => {
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    const start = toDateArray(startDate)
    const end = toDateArray(endDate)

    const location = [
      event.venueName || 'Venue TBA',
      event.venueAddress,
      event.region.replace('_', ' '),
    ]
      .filter(Boolean)
      .join(', ')

    return {
      start,
      end,
      title: event.name,
      description: `${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} Career Fair`,
      location,
      url: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}` : undefined,
      status: event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: {
        name: 'TalentCorp Malaysia',
        email: 'events@talentcorp.com.my',
      },
      categories: [event.eventType, ...event.fields.map((f) => f.name)],
    }
  })

  const { error, value } = createEvents(eventAttributes)

  if (error) {
    throw new Error(`Failed to generate calendar: ${error.message}`)
  }

  return value || ''
}
