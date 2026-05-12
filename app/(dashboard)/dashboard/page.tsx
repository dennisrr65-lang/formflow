import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { FREE_FORM_LIMIT } from '@/lib/types'
import CreateFormButton from '@/components/CreateFormButton'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: forms }, { data: sub }] = await Promise.all([
    supabase
      .from('forms')
      .select('id, title, slug, theme, is_published, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user!.id)
      .single(),
  ])

  const formList = forms ?? []
  const plan = sub?.plan ?? 'free'
  const atLimit = plan === 'free' && formList.length >= FREE_FORM_LIMIT

  // Fetch response counts
  const formIds = formList.map((f) => f.id)
  let responseCounts: Record<string, number> = {}
  if (formIds.length > 0) {
    const { data: counts } = await supabase.rpc('get_form_response_counts', { form_ids: formIds })
    if (counts) {
      responseCounts = Object.fromEntries((counts as { form_id: string; count: number }[]).map((r) => [r.form_id, r.count]))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
          {plan === 'free' && (
            <p className="text-sm text-gray-500 mt-1">
              {formList.length} / {FREE_FORM_LIMIT} forms used on free plan
            </p>
          )}
        </div>
        <CreateFormButton disabled={atLimit} plan={plan} />
      </div>

      {formList.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No forms yet</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Create your first form with AI — just describe what you need and it&apos;ll be ready in seconds.
          </p>
          <CreateFormButton disabled={false} plan={plan} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formList.map((form) => (
            <Link
              key={form.id}
              href={`/dashboard/forms/${form.id}`}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                  📋
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  form.is_published
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                {form.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                <span>{responseCounts[form.id] ?? 0} responses</span>
                <span>{formatDate(form.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {atLimit && (
        <div className="mt-6 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            <strong>You&apos;ve reached the free plan limit.</strong> Upgrade to Pro to create unlimited forms.
          </p>
          <Link
            href="/dashboard/billing"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
          >
            Upgrade now
          </Link>
        </div>
      )}
    </div>
  )
}
