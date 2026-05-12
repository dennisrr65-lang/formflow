'use client'

import { useState } from 'react'

interface Subscription {
  plan: string
  status: string
  current_period_end: string | null
  stripe_customer_id: string | null
}

interface Props {
  subscription: Subscription | null
  justUpgraded: boolean
}

export default function BillingClient({ subscription, justUpgraded }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plan = subscription?.plan ?? 'free'
  const isPro = plan === 'pro'

  async function handleCheckout() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/billing/checkout', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
    window.location.href = data.url
  }

  async function handlePortal() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
    window.location.href = data.url
  }

  return (
    <div className="space-y-6">
      {justUpgraded && (
        <div className="bg-green-50 border border-green-100 text-green-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          🎉 <strong>Welcome to Pro!</strong> You now have access to all Pro features.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Current plan</h2>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isPro ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {isPro ? 'Pro' : 'Free'}
          </span>
        </div>

        {isPro ? (
          <>
            <p className="text-sm text-gray-500 mb-1">
              Status: <span className={`font-medium ${subscription?.status === 'active' ? 'text-green-600' : 'text-orange-500'}`}>
                {subscription?.status}
              </span>
            </p>
            {subscription?.current_period_end && (
              <p className="text-sm text-gray-500 mb-4">
                Renews: {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            <button
              onClick={handlePortal}
              disabled={loading}
              className="text-sm border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Manage subscription'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              You&apos;re on the free plan. Upgrade to Pro to unlock unlimited forms, responses, AI summaries, and CSV export.
            </p>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirecting…' : 'Upgrade to Pro — $15/month'}
            </button>
          </>
        )}
      </div>

      {/* Plan comparison */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Plan features</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-2">Free</p>
            <ul className="space-y-1.5 text-gray-500">
              {['3 forms', '50 responses/month', 'AI form generation', 'Shareable public links'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-violet-700 mb-2">Pro — $15/mo</p>
            <ul className="space-y-1.5 text-gray-500">
              {['Unlimited forms', 'Unlimited responses', 'AI response summaries', 'CSV export', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-violet-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
