import { format, parseISO } from 'date-fns'
import { EventCard } from './event-card'
import type { EventResponse } from '@/lib/validations/event'

async function fetchEvents(params: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams()

  // Add filters to search params
  if (params.year) searchParams.set('year', params.year as string)
  if (params.region) searchParams.set('region', params.region as string)
  if (params.eventType) searchParams.set('eventType', params.eventType as string)
  if (params.search) searchParams.set('search', params.search as string)

  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/events?${searchParams.toString()}`

  const res = await fetch(url, {
    cache: 'no-store', // Always get fresh data
  })

  if (!res.ok) {
    throw new Error('Failed to fetch events')
  }

  const data = await res.json()
  return data.events as EventResponse[]
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
