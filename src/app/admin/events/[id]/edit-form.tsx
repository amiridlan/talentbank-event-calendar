'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Event } from '@/db/schema'

export default function EditEventForm({ event }: { event: Event }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      eventType: formData.get('eventType'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      region: formData.get('region'),
      venueName: formData.get('venueName'),
      externalUrl: formData.get('externalUrl') || null,
      candidateCapacity: parseInt(formData.get('candidateCapacity') as string),
      employerCapacity: parseInt(formData.get('employerCapacity') as string),
      status: formData.get('status'),
      registrationOpenDate: formData.get('registrationOpenDate'),
      registrationCloseDate: formData.get('registrationCloseDate'),
    }

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update event')
      }

      router.push('/admin/events')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event')
      setIsLoading(false)
    }
  }

  // Format datetime for input (HTML datetime-local requires this format)
  const formatDateTime = (date: Date | string | null) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 16)
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="mt-2 text-base text-gray-700">Update event details</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
          )}

          {/* Event Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">Event Details</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={event.name}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventType" className="block text-sm font-semibold text-gray-900 mb-1">
                  Event Type *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  required
                  defaultValue={event.eventType}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="campus">Campus Fair</option>
                  <option value="public">Public Fair</option>
                  <option value="sector">Sector-Specific</option>
                  <option value="awards">Awards</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue={event.status}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  required
                  defaultValue={formatDateTime(event.startDate)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900 mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  required
                  defaultValue={formatDateTime(event.endDate)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">Location</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="venueName" className="block text-sm font-semibold text-gray-900 mb-1">
                  Venue Name *
                </label>
                <input
                  type="text"
                  id="venueName"
                  name="venueName"
                  required
                  defaultValue={event.venueName}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-semibold text-gray-900 mb-1">
                  Region *
                </label>
                <select
                  id="region"
                  name="region"
                  required
                  defaultValue={event.region}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="klang_valley">Klang Valley (KL + Selangor)</option>
                  <option value="johor">Johor</option>
                  <option value="kedah">Kedah</option>
                  <option value="kelantan">Kelantan</option>
                  <option value="melaka">Melaka</option>
                  <option value="negeri_sembilan">Negeri Sembilan</option>
                  <option value="pahang">Pahang</option>
                  <option value="penang">Penang</option>
                  <option value="perak">Perak</option>
                  <option value="perlis">Perlis</option>
                  <option value="sabah">Sabah</option>
                  <option value="sarawak">Sarawak</option>
                  <option value="terengganu">Terengganu</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="externalUrl" className="block text-sm font-semibold text-gray-900 mb-1">
                Registration Link (Optional)
              </label>
              <input
                type="url"
                id="externalUrl"
                name="externalUrl"
                defaultValue={event.externalUrl || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/register"
              />
              <p className="mt-1 text-sm text-gray-600">External registration or event information URL</p>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">Capacity</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="candidateCapacity"
                  className="block text-sm font-semibold text-gray-900 mb-1"
                >
                  Candidate Capacity *
                </label>
                <input
                  type="number"
                  id="candidateCapacity"
                  name="candidateCapacity"
                  required
                  min="0"
                  defaultValue={event.candidateCapacity ?? 0}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="employerCapacity"
                  className="block text-sm font-semibold text-gray-900 mb-1"
                >
                  Employer Capacity *
                </label>
                <input
                  type="number"
                  id="employerCapacity"
                  name="employerCapacity"
                  required
                  min="0"
                  defaultValue={event.employerCapacity ?? 0}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              Current registrations: {event.candidateRegistered ?? 0} candidates,{' '}
              {event.employerRegistered ?? 0} employers
            </div>
          </div>

          {/* Registration Dates */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 pb-2 border-b">Registration Period</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="registrationOpenDate"
                  className="block text-sm font-semibold text-gray-900 mb-1"
                >
                  Registration Opens *
                </label>
                <input
                  type="datetime-local"
                  id="registrationOpenDate"
                  name="registrationOpenDate"
                  required
                  defaultValue={formatDateTime(event.registrationOpenDate)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="registrationCloseDate"
                  className="block text-sm font-semibold text-gray-900 mb-1"
                >
                  Registration Closes *
                </label>
                <input
                  type="datetime-local"
                  id="registrationCloseDate"
                  name="registrationCloseDate"
                  required
                  defaultValue={formatDateTime(event.registrationCloseDate)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/admin/events"
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
