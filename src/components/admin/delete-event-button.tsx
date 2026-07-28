'use client'

import { Trash2 } from 'lucide-react'

export default function DeleteEventButton({
  eventId,
  eventName
}: {
  eventId: string
  eventName: string
}) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      // TODO: Implement delete
      alert('Delete functionality coming soon')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      aria-label={`Delete ${eventName}`}
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete</span>
    </button>
  )
}
