import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PublicFormClient from '@/components/PublicFormClient'

interface Props {
  params: { slug: string }
}

export default async function PublicFormPage({ params }: Props) {
  const supabase = createClient()
  const { data: form } = await supabase
    .from('forms')
    .select('id, title, schema, theme, slug, is_published')
    .eq('slug', params.slug)
    .single()

  if (!form || !form.is_published) notFound()

  return <PublicFormClient form={form} />
}
