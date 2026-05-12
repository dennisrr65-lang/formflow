'use client'

import { FormField, FieldType } from '@/lib/types'

interface Props {
  field: FormField
  onChange: (field: FormField) => void
  onDelete: () => void
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'tel', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File upload' },
]

const HAS_OPTIONS: FieldType[] = ['select', 'radio', 'checkbox']

export default function FieldEditor({ field, onChange, onDelete }: Props) {
  function update(partial: Partial<FormField>) {
    onChange({ ...field, ...partial })
  }

  function updateOption(index: number, value: string) {
    const opts = [...(field.options ?? [])]
    opts[index] = value
    update({ options: opts })
  }

  function addOption() {
    update({ options: [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`] })
  }

  function removeOption(index: number) {
    const opts = [...(field.options ?? [])]
    opts.splice(index, 1)
    update({ options: opts })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">Edit field</h3>
        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
        <select
          value={field.type}
          onChange={(e) => {
            const newType = e.target.value as FieldType
            const needsOptions = HAS_OPTIONS.includes(newType)
            update({
              type: newType,
              options: needsOptions ? (field.options?.length ? field.options : ['Option 1', 'Option 2']) : undefined,
            })
          }}
          className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Label */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Label</label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
          className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Field label"
        />
      </div>

      {/* Placeholder (not for checkbox/radio/date/file) */}
      {!['checkbox', 'radio', 'date', 'file'].includes(field.type) && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Placeholder</label>
          <input
            type="text"
            value={field.placeholder ?? ''}
            onChange={(e) => update({ placeholder: e.target.value })}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional placeholder…"
          />
        </div>
      )}

      {/* Help text */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Help text</label>
        <input
          type="text"
          value={field.helpText ?? ''}
          onChange={(e) => update({ helpText: e.target.value })}
          className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Optional hint for respondents"
        />
      </div>

      {/* Options for select/radio/checkbox */}
      {HAS_OPTIONS.includes(field.type) && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Options</label>
          <div className="space-y-1.5">
            {(field.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeOption(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addOption}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            + Add option
          </button>
        </div>
      )}

      {/* Required toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-700">Required</span>
        <button
          onClick={() => update({ required: !field.required })}
          className={`relative w-10 h-5 rounded-full transition-colors ${field.required ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              field.required ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
