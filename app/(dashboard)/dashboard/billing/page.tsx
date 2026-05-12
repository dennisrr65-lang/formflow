import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BillingClient from '@/components/BillingClient'

interface Props {
  searchParams: { success?: string }
}

export default async function BillingPage({ searchParams }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your FormFlow subscription.</p>
      <BillingClient subscription={sub} justUpgraded={searchParams.success === '1'} />
    </div>
  )
}
