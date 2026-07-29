'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'

export default function DeleteEventButton({
  eventId,
  eventName
}: {
  eventId: string
  eventName: string
}) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete event')
      }

      router.refresh()
      router.push('/admin/events')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event')
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="inline-flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-red-900 font-medium">Delete "{eventName}"?</span>
        </div>
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
          <button
            onClick={() => {
              setShowConfirm(false)
              setError('')
            }}
            disabled={isDeleting}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      aria-label={`Delete ${eventName}`}
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete</span>
    </button>
  )
}
