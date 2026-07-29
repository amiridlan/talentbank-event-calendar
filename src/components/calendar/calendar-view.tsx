import { format, parseISO } from 'date-fns'
import { EventCard } from './event-card'
import type { EventResponse } from '@/lib/validations/event'
import { db, events, fields, eventFields } from '@/db'
import { eq, and, like, sql, desc } from 'drizzle-orm'

async function fetchEvents(params: Record<string, string | string[] | undefined>) {
  // Build where conditions
  const conditions = []

  if (params.year) {
    const year = params.year as string
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`
    conditions.push(
      sql`${events.startDate} <= ${yearEnd} AND ${events.endDate} >= ${yearStart}`
    )
  }

  if (params.region) {
    conditions.push(eq(events.region, params.region as string))
  }

  if (params.eventType) {
    conditions.push(eq(events.eventType, params.eventType as string))
  }

  // Only show scheduled events (not drafts or archived)
  conditions.push(eq(events.status, 'scheduled'))

  if (params.search) {
    conditions.push(like(events.name, `%${params.search}%`))
  }

  // Query events
  const eventsData = await db
    .select()
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(events.startDate))

  // Get related fields for each event
  const eventsWithFields = await Promise.all(
    eventsData.map(async (event) => {
      const eventFieldsData = await db
        .select({
          id: fields.id,
          name: fields.name,
          slug: fields.slug,
          category: fields.category,
        })
        .from(eventFields)
        .innerJoin(fields, eq(eventFields.fieldId, fields.id))
        .where(eq(eventFields.eventId, event.id))

      // Calculate multi-day info
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      const durationDays =
        Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      const isMultiDay = durationDays > 1

      return {
        ...event,
        startDate: event.startDate,
        endDate: event.endDate,
        postponedFromDate: event.postponedFromDate || null,
        registrationOpenDate: event.registrationOpenDate || null,
        registrationCloseDate: event.registrationCloseDate || null,
        startTime: event.startTime || null,
        endTime: event.endTime || null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        publishedAt: event.publishedAt?.toISOString() || null,
        archivedAt: event.archivedAt?.toISOString() || null,
        cancelledAt: event.cancelledAt?.toISOString() || null,
        externalUrl: event.externalUrl || null,
        fields: eventFieldsData,
        isMultiDay,
        durationDays,
      } as EventResponse
    })
  )

  return eventsWithFields
}

// Group events by month
function groupEventsByMonth(events: EventResponse[]) {
  const grouped = new Map<string, EventResponse[]>()

  events.forEach((event) => {
    const month = format(parseISO(event.startDate), 'MMMM yyyy')
    if (!grouped.has(month)) {
      grouped.set(month, [])
    }
    grouped.get(month)!.push(event)
  })

  return Array.from(grouped.entries()).sort((a, b) => {
    const dateA = parseISO(a[1][0].startDate)
    const dateB = parseISO(b[1][0].startDate)
    return dateA.getTime() - dateB.getTime()
  })
}

export async function CalendarView({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const events = await fetchEvents(searchParams)
  const groupedEvents = groupEventsByMonth(events)

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-xl font-bold text-gray-900">
          No events found matching your filters.
        </p>
        <p className="mt-2 text-base text-gray-700">
          Try adjusting your search criteria or clearing filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {groupedEvents.map(([month, monthEvents]) => (
        <section key={month}>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">{month}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {monthEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}

      {/* Results summary */}
      <div className="text-center text-sm text-gray-500">
        Showing {events.length} {events.length === 1 ? 'event' : 'events'}
      </div>
    </div>
  )
}
