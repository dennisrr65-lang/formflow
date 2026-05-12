import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ResponseDashboard from '@/components/ResponseDashboard'

interface Props {
  params: { id: string }
}

export default async function ResponsesPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: form }, { data: responses }, { data: sub }] = await Promise.all([
    supabase.from('forms').select('id, title, schema').eq('id', params.id).eq('user_id', user.id).single(),
    supabase.from('responses').select('*').eq('form_id', params.id).order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('plan').eq('user_id', user.id).single(),
  ])

  if (!form) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/forms/${params.id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{form.title}</h1>
          <p className="text-sm text-gray-500">{responses?.length ?? 0} responses</p>
        </div>
      </div>
      <ResponseDashboard
        form={form}
        responses={responses ?? []}
        plan={sub?.plan ?? 'free'}
      />
    </div>
  )
}
