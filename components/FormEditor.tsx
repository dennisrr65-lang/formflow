'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Form, FormField, FormTheme, THEMES } from '@/lib/types'
import SortableField from './SortableField'
import FieldEditor from './FieldEditor'
import FormPreview from './FormPreview'

interface Props {
  form: Form
  plan: string
}

type EditorTab = 'editor' | 'preview'

export default function FormEditor({ form, plan }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(form.title)
  const [fields, setFields] = useState<FormField[]>(form.schema?.fields ?? [])
  const [theme, setTheme] = useState<FormTheme>(form.theme as FormTheme)
  const [isPublished, setIsPublished] = useState(form.is_published)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tab, setTab] = useState<EditorTab>('editor')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [copying, setCopying] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((f) => f.id === active.id)
        const newIndex = items.findIndex((f) => f.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  function addField() {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New field',
      placeholder: '',
      required: false,
    }
    setFields((f) => [...f, newField])
    setEditingField(newField.id)
  }

  function updateField(updated: FormField) {
    setFields((f) => f.map((field) => (field.id === updated.id ? updated : field)))
  }

  function deleteField(id: string) {
    setFields((f) => f.filter((field) => field.id !== id))
    if (editingField === id) setEditingField(null)
  }

  const handleSave = useCallback(async (publish?: boolean) => {
    setSaving(true)
    setSaveError('')
    setSaved(false)

    const nextPublished = publish !== undefined ? publish : isPublished

    const res = await fetch(`/api/forms/${form.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, schema: { fields }, theme, is_published: nextPublished }),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json()
      setSaveError(data.error ?? 'Failed to save. Please try again.')
      return
    }

    if (publish !== undefined) setIsPublished(publish)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }, [form.id, title, fields, theme, isPublished, router])

  async function copyPublicLink() {
    const url = `${window.location.origin}/f/${form.slug}`
    await navigator.clipboard.writeText(url)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  async function handleDelete() {
    if (!confirm('Delete this form? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/forms/${form.id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  const editingFieldData = fields.find((f) => f.id === editingField) ?? null

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors mr-1">
          ←
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-lg font-semibold text-gray-900 outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors py-0.5 min-w-0"
          placeholder="Form title"
        />

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['editor', 'preview'] as EditorTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/forms/${form.id}/responses`}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
          >
            Responses
          </Link>

          {isPublished && (
            <button
              onClick={copyPublicLink}
              className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
            >
              {copying ? 'Copied!' : '🔗 Copy link'}
            </button>
          )}

          {saveError && <span className="text-xs text-red-500">{saveError}</span>}
          {saved && <span className="text-xs text-green-600">Saved!</span>}

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          <button
            onClick={() => handleSave(!isPublished)}
            disabled={saving}
            className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
              isPublished
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {tab === 'editor' ? (
          <>
            {/* Field list */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Theme</div>
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.entries(THEMES) as [FormTheme, typeof THEMES[FormTheme]][]).map(([key, t]) => (
                    <button
                      key={key}
                      title={t.label}
                      onClick={() => setTheme(key)}
                      className={`w-8 h-8 rounded-lg ${t.primary} transition-all ${
                        theme === key ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Fields ({fields.length})
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                      {fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          isEditing={editingField === field.id}
                          onSelect={() => setEditingField(editingField === field.id ? null : field.id)}
                          onDelete={() => deleteField(field.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <button
                  onClick={addField}
                  className="w-full mt-3 border border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  + Add field
                </button>
              </div>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete form'}
                </button>
              </div>
            </div>

            {/* Field editor panel */}
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
              {editingFieldData ? (
                <FieldEditor
                  field={editingFieldData}
                  onChange={updateField}
                  onDelete={() => deleteField(editingFieldData.id)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
                  <div className="text-4xl mb-3">👈</div>
                  <p className="text-sm">Select a field to edit its properties</p>
                </div>
              )}
            </div>

            {/* Form preview */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
              <div className="max-w-xl mx-auto">
                <FormPreview title={title} fields={fields} theme={theme} interactive={false} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
            <div className="max-w-xl mx-auto">
              <FormPreview title={title} fields={fields} theme={theme} interactive />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
