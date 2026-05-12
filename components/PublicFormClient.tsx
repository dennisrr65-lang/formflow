'use client'

import FormPreview from './FormPreview'
import { FormTheme } from '@/lib/types'
import Link from 'next/link'

interface Props {
  form: {
    id: string
    title: string
    schema: { fields: any[] }
    theme: string
    slug: string
  }
}

export default function PublicFormClient({ form }: Props) {
  async function handleSubmit(data: Record<string, unknown>) {
    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_id: form.id, data }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Failed to submit')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <FormPreview
          title={form.title}
          fields={form.schema?.fields ?? []}
          theme={(form.theme as FormTheme) ?? 'default'}
          interactive
          onSubmit={handleSubmit}
        />
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Powered by FormFlow
          </Link>
        </div>
      </div>
    </div>
  )
}
