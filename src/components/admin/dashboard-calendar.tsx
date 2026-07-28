'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/db/schema'

export default function DashboardCalendar({ events }: { events: Event[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate)
      return isSameDay(eventStart, day)
    })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Event Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            Today
          </button>
          <button
            onClick={goToPreviousMonth}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[140px] text-center text-base font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={goToNextMonth}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg bg-gray-200 overflow-hidden">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 px-2 py-2.5 text-center text-sm font-bold text-gray-900"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={day.toString()}
              className={`min-h-[100px] bg-white p-2 ${
                !isCurrentMonth ? 'bg-gray-50' : ''
              }`}
            >
              <div
                className={`mb-1 text-sm font-semibold ${
                  !isCurrentMonth
                    ? 'text-gray-400'
                    : isToday
                      ? 'flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white'
                      : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className={`group block truncate rounded px-1.5 py-1 text-xs leading-tight hover:opacity-90 transition-opacity ${
                      event.status === 'scheduled'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : event.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    title={`${event.name} – Click to edit`}
                  >
                    <span className="block truncate font-medium">{event.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm font-medium text-gray-700">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-green-100 border border-green-200"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-gray-100 border border-gray-200"></div>
          <span>Draft</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-100 border border-red-200"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  )
}
