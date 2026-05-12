'use client'

import { useState } from 'react'
import { FormField, FormTheme, THEMES } from '@/lib/types'

interface Props {
  title: string
  fields: FormField[]
  theme: FormTheme
  interactive: boolean
  onSubmit?: (data: Record<string, unknown>) => Promise<void>
}

export default function FormPreview({ title, fields, theme, interactive, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const t = THEMES[theme] ?? THEMES.default

  function setValue(id: string, value: unknown) {
    setValues((v) => ({ ...v, [id]: value }))
    if (errors[id]) setErrors((e) => { const n = { ...e }; delete n[id]; return n })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!interactive || !onSubmit) return

    const newErrors: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.required) {
        const val = values[f.id]
        if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[f.id] = 'This field is required.'
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    await onSubmit(values)
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={`rounded-2xl ${t.surface} border ${t.border} p-8 text-center shadow-sm`}>
        <div className="text-4xl mb-3">🎉</div>
        <h2 className={`text-xl font-semibold ${t.text} mb-2`}>Thank you!</h2>
        <p className={`text-sm ${t.text} opacity-60`}>Your response has been submitted successfully.</p>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl ${t.surface} border ${t.border} shadow-sm overflow-hidden`}>
      <div className={`${t.primary} px-6 py-5`}>
        <h1 className="text-xl font-bold text-white">{title || 'Untitled Form'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {fields.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No fields yet. Add some from the editor.</p>
        )}
        {fields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(v) => setValue(field.id, v)}
            error={errors[field.id]}
            disabled={!interactive}
            theme={t}
          />
        ))}
        {interactive && fields.length > 0 && (
          <button
            type="submit"
            disabled={submitting}
            className={`w-full ${t.primary} text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50`}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        )}
      </form>
    </div>
  )
}

interface FieldRendererProps {
  field: FormField
  value: unknown
  onChange: (v: unknown) => void
  error?: string
  disabled: boolean
  theme: typeof THEMES[FormTheme]
}

function FieldRenderer({ field, value, onChange, error, disabled, theme }: FieldRendererProps) {
  const inputClass = `w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:cursor-default ${
    error ? 'border-red-400' : 'border-gray-300'
  }`

  return (
    <div>
      <label className={`block text-sm font-medium ${theme.text} mb-1.5`}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.helpText && (
        <p className="text-xs text-gray-400 mb-1.5">{field.helpText}</p>
      )}

      {field.type === 'textarea' && (
        <textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      )}

      {['text', 'email', 'number', 'tel', 'url', 'date'].includes(field.type) && (
        <input
          type={field.type}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className={inputClass}
        />
      )}

      {field.type === 'file' && (
        <input
          type="file"
          disabled={disabled}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-sm file:cursor-pointer"
        />
      )}

      {field.type === 'select' && (
        <select
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClass}
        >
          <option value="">Select an option…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => {
            const checked = Array.isArray(value) && (value as string[]).includes(opt)
            return (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const prev = Array.isArray(value) ? (value as string[]) : []
                    onChange(checked ? prev.filter((v) => v !== opt) : [...prev, opt])
                  }}
                  disabled={disabled}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            )
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
