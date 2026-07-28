import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Calendar, MapPin, Building2, ExternalLink } from 'lucide-react'
import type { EventResponse } from '@/lib/validations/event'
import { cn } from '@/lib/utils'

const eventTypeColors = {
  campus: 'bg-blue-100 text-blue-800',
  sector: 'bg-purple-100 text-purple-800',
  public: 'bg-green-100 text-green-800',
  awards: 'bg-amber-100 text-amber-800',
}

const eventTypeLabels = {
  campus: 'Campus',
  sector: 'Sector',
  public: 'Public',
  awards: 'Awards',
}

export function EventCard({ event }: { event: EventResponse }) {
  const startDate = parseISO(event.startDate)
  const endDate = parseISO(event.endDate)

  const dateDisplay = event.isMultiDay
    ? `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`
    : format(startDate, 'MMMM d, yyyy')

  const isCancelled = event.status === 'cancelled'
  const isPostponed = event.status === 'postponed'

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        'group block rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-lg',
        isCancelled && 'opacity-60'
      )}
    >
      {/* Event type badge */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            'inline-flex rounded-full px-3 py-1 text-sm font-semibold',
            eventTypeColors[event.eventType]
          )}
        >
          {eventTypeLabels[event.eventType]}
        </span>
        {event.externalUrl && (
          <ExternalLink className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Event name */}
      <h3
        className={cn(
          'mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-600',
          isCancelled && 'line-through'
        )}
      >
        {event.name}
      </h3>

      {/* Status badges */}
      {isCancelled && (
        <div className="mb-3">
          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
            Cancelled
          </span>
        </div>
      )}
      {isPostponed && event.postponedFromDate && (
        <div className="mb-3">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            Moved from {format(parseISO(event.postponedFromDate), 'MMM d')}
          </span>
        </div>
      )}

      {/* Date */}
      <div className="mb-2 flex items-center gap-2 text-base font-medium text-gray-900">
        <Calendar className="h-5 w-5" />
        <span>{dateDisplay}</span>
        {event.isMultiDay && (
          <span className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-700">
            {event.durationDays} days
          </span>
        )}
      </div>

      {/* Venue */}
      {event.venueName ? (
        <div className="mb-2 flex items-center gap-2 text-base text-gray-700">
          <MapPin className="h-5 w-5" />
          <span>{event.venueName}</span>
        </div>
      ) : (
        <div className="mb-2 flex items-center gap-2 text-base text-gray-600 italic">
          <MapPin className="h-5 w-5" />
          <span>Venue TBA</span>
        </div>
      )}

      {/* Fields/Industries */}
      {event.fields.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {event.fields.slice(0, 3).map((field) => (
            <span
              key={field.id}
              className="inline-flex items-center gap-1 rounded bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-800"
            >
              <Building2 className="h-4 w-4" />
              {field.name}
            </span>
          ))}
          {event.fields.length > 3 && (
            <span className="inline-flex items-center rounded bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-800">
              +{event.fields.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
