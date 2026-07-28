import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ArchiveView } from '@/components/calendar/archive-view'
import { CalendarFilters } from '@/components/calendar/calendar-filters'
import { SkipLink } from '@/components/ui/skip-link'

export const metadata = {
  title: 'Past Events Archive | Talentbank',
  description:
    'Browse past career fairs and events. View attendance statistics and event history.',
}

export default async function ArchivePage({
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
          <Link
            href="/calendar"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to upcoming events
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Past Events Archive</h1>
          <p className="mt-2 text-gray-600">
            Browse completed career fairs and view attendance statistics
          </p>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Suspense fallback={<div>Loading filters...</div>}>
            <CalendarFilters />
          </Suspense>
        </div>

        <Suspense fallback={<div>Loading archived events...</div>}>
          <ArchiveView searchParams={params} />
        </Suspense>
      </main>
    </div>
  )
}
