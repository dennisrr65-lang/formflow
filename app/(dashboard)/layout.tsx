import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">F</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">FormFlow</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                Forms
              </Link>
              <Link href="/dashboard/billing" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                Billing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {sub?.plan === 'free' && (
              <Link
                href="/dashboard/billing"
                className="text-xs bg-gradient-to-r from-violet-500 to-blue-500 text-white px-3 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro
              </Link>
            )}
            {sub?.plan === 'pro' && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium">Pro</span>
            )}
            <span className="text-xs text-gray-500">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
