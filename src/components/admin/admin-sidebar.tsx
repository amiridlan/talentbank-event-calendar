'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, LogOut } from 'lucide-react'

export default function AdminSidebar({
  userEmail,
  userRole,
}: {
  userEmail: string
  userRole: string
}) {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen sticky top-0 border-r bg-white flex flex-col overflow-hidden">
      {/* Header section */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-700 mt-1">{userEmail}</p>
        <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
          {userRole}
        </span>
      </div>

      {/* Navigation - grows to fill space */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <Link
          href="/admin"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname === '/admin'
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-gray-900 hover:bg-gray-100 font-medium'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
        <Link
          href="/admin/events"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname.startsWith('/admin/events')
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-gray-900 hover:bg-gray-100 font-medium'
          }`}
        >
          <Calendar className="h-5 w-5" />
          Events
        </Link>
      </nav>

      {/* Sign out - pinned to bottom */}
      <div className="border-t p-4 mt-auto">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
