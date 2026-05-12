import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FormEditor from '@/components/FormEditor'

interface Props {
  params: { id: string }
}

export default async function FormEditorPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!form) notFound()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  return <FormEditor form={form} plan={sub?.plan ?? 'free'} />
}
