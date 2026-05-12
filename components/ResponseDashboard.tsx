'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface FormField {
  id: string
  label: string
  type: string
}

interface Form {
  id: string
  title: string
  schema: { fields: FormField[] }
}

interface Response {
  id: string
  form_id: string
  data: Record<string, unknown>
  created_at: string
}

interface Props {
  form: Form
  responses: Response[]
  plan: string
}

export default function ResponseDashboard({ form, responses, plan }: Props) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  const fields = form.schema?.fields ?? []
  const isPro = plan === 'pro'

  async function generateSummary() {
    if (!isPro) return
    setLoadingSummary(true)
    setSummaryError('')

    const res = await fetch(`/api/forms/${form.id}/summarize`, {
      method: 'POST',
    })

    setLoadingSummary(false)

    if (!res.ok) {
      const data = await res.json()
      setSummaryError(data.error ?? 'Failed to generate summary.')
      return
    }

    const data = await res.json()
    setSummary(data.summary)
  }

  function exportCSV() {
    if (!isPro) return

    const headers = ['Submitted At', ...fields.map((f) => f.label)]
    const rows = responses.map((r) => [
      new Date(r.created_at).toISOString(),
      ...fields.map((f) => {
        const val = r.data[f.id]
        return Array.isArray(val) ? val.join(', ') : String(val ?? '')
      }),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title.replace(/\s+/g, '_')}_responses.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Pro feature bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={generateSummary}
          disabled={!isPro || loadingSummary || responses.length === 0}
          className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
            isPro
              ? 'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={!isPro ? 'Upgrade to Pro to use AI summaries' : undefined}
        >
          {loadingSummary ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Summarizing…
            </span>
          ) : '✨ AI Summary'}
        </button>

        <button
          onClick={exportCSV}
          disabled={!isPro || responses.length === 0}
          className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
            isPro
              ? 'border border-gray-300 text-gray-700 hover:border-gray-400 disabled:opacity-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={!isPro ? 'Upgrade to Pro to export CSV' : undefined}
        >
          ↓ Export CSV
        </button>

        {!isPro && (
          <Link
            href="/dashboard/billing"
            className="text-xs text-violet-600 hover:underline"
          >
            Upgrade to Pro for AI summaries and CSV export →
          </Link>
        )}
      </div>

      {/* AI Summary */}
      {summaryError && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
          {summaryError}
        </div>
      )}

      {summary && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-violet-900">✨ AI Summary</span>
            <button onClick={() => setSummary(null)} className="ml-auto text-xs text-violet-400 hover:text-violet-600">
              Dismiss
            </button>
          </div>
          <p className="text-sm text-violet-800 whitespace-pre-wrap leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Response table */}
      {responses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-20 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No responses yet</h2>
          <p className="text-sm text-gray-500">Share your form link to start collecting responses.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  {fields.map((f) => (
                    <th key={f.id} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[200px]">
                      <span className="truncate block">{f.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(r.created_at)}
                    </td>
                    {fields.map((f) => {
                      const val = r.data[f.id]
                      const display = Array.isArray(val) ? val.join(', ') : String(val ?? '—')
                      return (
                        <td key={f.id} className="px-4 py-3 text-gray-700 max-w-[200px]">
                          <span className="truncate block" title={display}>{display || '—'}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
