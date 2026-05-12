'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  disabled: boolean
  plan: string
}

export default function CreateFormButton({ disabled, plan }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/forms/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const { formId } = await res.json()
    router.push(`/dashboard/forms/${formId}`)
  }

  if (disabled) {
    return (
      <button
        disabled
        title="Upgrade to Pro to create more forms"
        className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
      >
        + New form
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        + New form
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Create a new form</h2>
            <p className="text-sm text-gray-500 mb-4">Describe the form you need and AI will generate it instantly.</p>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A job application form for a marketing manager role with fields for experience, portfolio URL, and cover letter"
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
              }}
            />

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setOpen(false); setPrompt(''); setError('') }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Generating…
                  </span>
                ) : 'Generate form'}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">⌘ + Enter to generate</p>
          </div>
        </div>
      )}
    </>
  )
}
