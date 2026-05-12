'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FormField } from '@/lib/types'

interface Props {
  field: FormField
  isEditing: boolean
  onSelect: () => void
  onDelete: () => void
}

const TYPE_ICONS: Record<string, string> = {
  text: 'T',
  textarea: '¶',
  email: '@',
  number: '#',
  tel: '📞',
  url: '🔗',
  select: '▼',
  radio: '◉',
  checkbox: '☑',
  date: '📅',
  file: '📎',
}

export default function SortableField({ field, isEditing, onSelect, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-pointer transition-all ${
        isEditing
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        ⋮⋮
      </button>
      <span className="w-6 h-6 rounded bg-gray-100 text-xs flex items-center justify-center font-mono text-gray-500 flex-shrink-0">
        {TYPE_ICONS[field.type] ?? 'T'}
      </span>
      <span className="flex-1 text-sm text-gray-700 truncate">{field.label}</span>
      {field.required && <span className="text-red-400 text-xs flex-shrink-0">*</span>}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="text-gray-300 hover:text-red-400 text-xs flex-shrink-0 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
