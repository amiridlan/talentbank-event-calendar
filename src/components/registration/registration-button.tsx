'use client'

import { useState } from 'react'
import { Users, Building2 } from 'lucide-react'

interface RegistrationButtonProps {
  eventId: string
  eventName: string
  candidateCapacity: number | null
  candidateRegistered: number
  employerCapacity: number | null
  employerRegistered: number
}

export function RegistrationButton({
  eventId,
  eventName,
  candidateCapacity,
  candidateRegistered,
  employerCapacity,
  employerRegistered,
}: RegistrationButtonProps) {
  const [showForm, setShowForm] = useState(false)
  const [registrationType, setRegistrationType] = useState<'candidate' | 'employer' | null>(null)

  const candidateFull = candidateCapacity ? candidateRegistered >= candidateCapacity : false
  const employerFull = employerCapacity ? employerRegistered >= employerCapacity : false

  const candidateAvailable = candidateCapacity ? candidateCapacity - candidateRegistered : null
  const employerAvailable = employerCapacity ? employerCapacity - employerRegistered : null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold">Register for This Event</h2>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {/* Candidate Registration */}
        <button
          onClick={() => {
            setRegistrationType('candidate')
            setShowForm(true)
          }}
          disabled={candidateFull}
          className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5" />
            <span className="font-semibold">As Candidate</span>
          </div>
          {candidateCapacity ? (
            <p className="mt-2 text-sm text-blue-700">
              {candidateFull
                ? 'Full - Waitlist available'
                : `${candidateAvailable} spots available`}
            </p>
          ) : (
            <p className="mt-2 text-sm text-blue-700">Open registration</p>
          )}
        </button>

        {/* Employer Registration */}
        <button
          onClick={() => {
            setRegistrationType('employer')
            setShowForm(true)
          }}
          disabled={employerFull}
          className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 text-left transition-all hover:border-purple-300 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2 text-purple-900">
            <Building2 className="h-5 w-5" />
            <span className="font-semibold">As Employer</span>
          </div>
          {employerCapacity ? (
            <p className="mt-2 text-sm text-purple-700">
              {employerFull
                ? 'Full - Waitlist available'
                : `${employerAvailable} booths available`}
            </p>
          ) : (
            <p className="mt-2 text-sm text-purple-700">Open registration</p>
          )}
        </button>
      </div>

      {showForm && registrationType && (
        <div className="rounded-lg bg-gray-50 p-6">
          <p className="text-center text-gray-600">
            Registration form component would go here
            <br />
            <span className="text-sm">
              (Candidate or Employer form based on selection)
            </span>
          </p>
          <button
            onClick={() => {
              setShowForm(false)
              setRegistrationType(null)
            }}
            className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        By registering, you consent to data processing as per PDPA 2010.
      </p>
    </div>
  )
}
