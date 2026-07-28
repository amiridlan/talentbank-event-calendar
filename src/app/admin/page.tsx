import { auth } from '@/lib/auth'
import { db, events } from '@/db'
import { count, eq, gte } from 'drizzle-orm'
import { Calendar, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import DashboardCalendar from '@/components/admin/dashboard-calendar'

export default async function AdminDashboard() {
  const session = await auth()

  // Get statistics
  const [totalEvents] = await db.select({ count: count() }).from(events)
  const [scheduledEvents] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, 'scheduled'))
  const [draftEvents] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, 'draft'))

  // Get all events for calendar
  const upcomingEvents = await db.query.events.findMany()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-base text-gray-700">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{totalEvents.count}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Scheduled</p>
              <p className="text-3xl font-bold text-gray-900">{scheduledEvents.count}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-3">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Drafts</p>
              <p className="text-3xl font-bold text-gray-900">{draftEvents.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/events/new"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Create New Event
          </Link>
          <Link
            href="/admin/events"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Manage Events
          </Link>
          <Link
            href="/calendar"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            View Public Calendar
          </Link>
        </div>
      </div>

      {/* Interactive Calendar */}
      <DashboardCalendar events={upcomingEvents} />
    </div>
  )
}
