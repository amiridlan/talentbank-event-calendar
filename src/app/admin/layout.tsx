import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  // Check if user has at least editor role
  if (session.user.role === 'viewer') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You need editor or admin privileges to access this area.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userEmail={session.user.email!} userRole={session.user.role} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
