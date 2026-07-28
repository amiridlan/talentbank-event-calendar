import { db, events } from '@/db'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import { Calendar, Plus, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import DeleteEventButton from '@/components/admin/delete-event-button'

export default async function AdminEventsPage() {
  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.startDate)],
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <p className="mt-2 text-base text-gray-700">Create, edit, and manage career fair events</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Event
        </Link>
      </div>

      {/* Events table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Registrations
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {allEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-3 text-base font-medium text-gray-900">No events yet</p>
                  <p className="mt-1 text-sm text-gray-600">Get started by creating your first event</p>
                  <Link
                    href="/admin/events/new"
                    className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Create your first event →
                  </Link>
                </td>
              </tr>
            ) : (
              allEvents.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{event.name}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{event.eventType}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {format(new Date(event.startDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{event.venueName}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{event.region}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        event.status === 'scheduled'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{event.candidateRegistered ?? 0}</span>
                        <span className="text-sm text-gray-500">/</span>
                        <span className="text-sm font-medium text-gray-700">{event.candidateCapacity ?? 0}</span>
                        <span className="text-xs text-gray-600 ml-1">candidates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{event.employerRegistered ?? 0}</span>
                        <span className="text-sm text-gray-500">/</span>
                        <span className="text-sm font-medium text-gray-700">{event.employerCapacity ?? 0}</span>
                        <span className="text-xs text-gray-600 ml-1">employers</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        aria-label={`Edit ${event.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                      <DeleteEventButton eventId={event.id} eventName={event.name} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
