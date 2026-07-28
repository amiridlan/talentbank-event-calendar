'use client'

import { useState } from 'react'
import { Calendar, X, Copy, Check } from 'lucide-react'
import type { EventFilters } from '@/lib/validations/event'

interface CalendarSubscribeProps {
  filters: Partial<EventFilters>
}

export function CalendarSubscribe({ filters }: CalendarSubscribeProps) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Build webcal URL from filters
  const buildWebcalUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()

    if (filters.region) params.set('region', filters.region)
    if (filters.eventType) params.set('eventType', filters.eventType)
    if (filters.fieldId) params.set('fieldId', filters.fieldId.toString())

    const httpUrl = `${baseUrl}/api/calendar/feed.ics${params.toString() ? `?${params.toString()}` : ''}`
    return httpUrl.replace(/^https?:\/\//, 'webcal://')
  }

  const webcalUrl = buildWebcalUrl()
  const httpUrl = webcalUrl.replace('webcal://', 'https://')

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(httpUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getFilterDescription = () => {
    const parts = []
    if (filters.region) {
      parts.push(filters.region.replace('_', ' '))
    }
    if (filters.eventType) {
      parts.push(filters.eventType)
    }
    if (filters.fieldId) {
      parts.push('selected field')
    }

    return parts.length > 0
      ? `Filtered by: ${parts.join(', ')}`
      : 'All upcoming events'
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <Calendar className="h-4 w-4" />
        Subscribe to Calendar
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Subscribe to Calendar
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {getFilterDescription()}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Subscription methods */}
            <div className="space-y-6">
              {/* One-click subscription */}
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  One-Click Subscribe
                </h3>
                <div className="space-y-2">
                  <a
                    href={webcalUrl}
                    className="block rounded-lg border-2 border-blue-600 bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Subscribe in Default Calendar App
                  </a>
                  <p className="text-xs text-gray-500">
                    Opens in Apple Calendar, Outlook, or your default calendar app
                  </p>
                </div>
              </div>

              {/* Manual subscription */}
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Manual Subscription URL
                </h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <code className="flex-1 break-all text-sm text-gray-700">
                      {httpUrl}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="ml-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Subscription Instructions
                </h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Google Calendar
                    </h4>
                    <ol className="mt-1 list-inside list-decimal space-y-1">
                      <li>Copy the URL above</li>
                      <li>
                        Open Google Calendar and click the + next to "Other
                        calendars"
                      </li>
                      <li>Select "From URL"</li>
                      <li>Paste the URL and click "Add calendar"</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">
                      Apple Calendar (iCal)
                    </h4>
                    <ol className="mt-1 list-inside list-decimal space-y-1">
                      <li>Click "Subscribe in Default Calendar App" above</li>
                      <li>Or: File → New Calendar Subscription</li>
                      <li>Paste the URL and click Subscribe</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">
                      Microsoft Outlook
                    </h4>
                    <ol className="mt-1 list-inside list-decimal space-y-1">
                      <li>Click "Subscribe in Default Calendar App" above</li>
                      <li>
                        Or: Right-click "My Calendars" → Add calendar → From
                        internet
                      </li>
                      <li>Paste the URL and click OK</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-medium">Note:</p>
                <p className="mt-1">
                  Your calendar app will automatically sync updates to events.
                  Refresh frequency depends on your calendar app settings
                  (typically every few hours to daily).
                </p>
              </div>
            </div>

            {/* Close button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
