import { Suspense } from 'react'
import Link from 'next/link'
import { Archive } from 'lucide-react'
import { CalendarView } from '@/components/calendar/calendar-view'
import { CalendarFilters } from '@/components/calendar/calendar-filters'
import { SkipLink } from '@/components/ui/skip-link'

export const metadata = {
  title: 'Career Fair Calendar | Talentbank',
  description:
    'Browse upcoming career fairs across Malaysia. Find campus fairs, sector-specific events, and public career fairs.',
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink />
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Career Fair Calendar</h1>
              <p className="mt-2 text-base text-gray-700">
                Find and register for career fairs across Malaysia
              </p>
            </div>
            <Link
              href="/calendar/archive"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Archive className="h-4 w-4" />
              View Past Events
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 text-gray-700 py-4">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-base font-medium">Loading filters...</span>
              </div>
            }
          >
            <CalendarFilters />
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-2 text-gray-700 py-12">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-base font-medium">Loading events...</span>
            </div>
          }
        >
          <CalendarView searchParams={params} />
        </Suspense>
      </main>
    </div>
  )
}
