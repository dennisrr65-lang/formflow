export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  helpText?: string
}

export interface FormSchema {
  fields: FormField[]
}

export type FormTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight'

export interface Form {
  id: string
  user_id: string
  title: string
  schema: FormSchema
  theme: FormTheme
  slug: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Response {
  id: string
  form_id: string
  data: Record<string, unknown>
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: 'free' | 'pro'
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export const THEMES: Record<FormTheme, { label: string; primary: string; bg: string; surface: string; border: string; text: string }> = {
  default: { label: 'Default', primary: 'bg-blue-600', bg: 'bg-slate-50', surface: 'bg-white', border: 'border-gray-200', text: 'text-gray-900' },
  ocean: { label: 'Ocean', primary: 'bg-cyan-600', bg: 'bg-cyan-50', surface: 'bg-white', border: 'border-cyan-100', text: 'text-cyan-900' },
  forest: { label: 'Forest', primary: 'bg-emerald-600', bg: 'bg-emerald-50', surface: 'bg-white', border: 'border-emerald-100', text: 'text-emerald-900' },
  sunset: { label: 'Sunset', primary: 'bg-orange-500', bg: 'bg-orange-50', surface: 'bg-white', border: 'border-orange-100', text: 'text-orange-900' },
  midnight: { label: 'Midnight', primary: 'bg-violet-600', bg: 'bg-gray-950', surface: 'bg-gray-900', border: 'border-gray-700', text: 'text-gray-100' },
}

export const FREE_FORM_LIMIT = 3
export const FREE_RESPONSE_LIMIT = 50
