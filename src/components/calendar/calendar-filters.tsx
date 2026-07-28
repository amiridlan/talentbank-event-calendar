'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

const malaysianStates = [
  { value: 'johor', label: 'Johor' },
  { value: 'kedah', label: 'Kedah' },
  { value: 'kelantan', label: 'Kelantan' },
  { value: 'kuala_lumpur', label: 'Kuala Lumpur' },
  { value: 'melaka', label: 'Melaka' },
  { value: 'negeri_sembilan', label: 'Negeri Sembilan' },
  { value: 'pahang', label: 'Pahang' },
  { value: 'penang', label: 'Penang' },
  { value: 'perak', label: 'Perak' },
  { value: 'sabah', label: 'Sabah' },
  { value: 'sarawak', label: 'Sarawak' },
  { value: 'selangor', label: 'Selangor' },
  { value: 'terengganu', label: 'Terengganu' },
  { value: 'klang_valley', label: 'Klang Valley' },
]

const eventTypes = [
  { value: 'campus', label: 'Campus' },
  { value: 'sector', label: 'Sector' },
  { value: 'public', label: 'Public' },
  { value: 'awards', label: 'Awards' },
]

const years = [
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
]

export function CalendarFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/calendar?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push('/calendar', { scroll: false })
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label
            htmlFor="search"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="search"
              type="text"
              placeholder="Search events..."
              defaultValue={searchParams.get('search') || ''}
              onChange={(e) => {
                const value = e.target.value
                // Debounce search
                setTimeout(() => updateFilter('search', value), 300)
              }}
              className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Year */}
        <div>
          <label
            htmlFor="year"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            Year
          </label>
          <select
            id="year"
            value={searchParams.get('year') || ''}
            onChange={(e) => updateFilter('year', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All years</option>
            {years.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label
            htmlFor="region"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            State
          </label>
          <select
            id="region"
            value={searchParams.get('region') || ''}
            onChange={(e) => updateFilter('region', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All states</option>
            {malaysianStates.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label
            htmlFor="eventType"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            Type
          </label>
          <select
            id="eventType"
            value={searchParams.get('eventType') || ''}
            onChange={(e) => updateFilter('eventType', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
