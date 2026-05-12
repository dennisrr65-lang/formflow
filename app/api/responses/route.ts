import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const body = await request.json()
  const { form_id, data } = body

  if (!form_id || !data || typeof data !== 'object') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // Use service role — public submissions don't have a session cookie
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify form exists and is published
  const { data: form } = await supabase
    .from('forms')
    .select('id')
    .eq('id', form_id)
    .eq('is_published', true)
    .single()

  if (!form) {
    return NextResponse.json({ error: 'Form not found or not published.' }, { status: 404 })
  }

  const { error } = await supabase.from('responses').insert({ form_id, data })

  if (error) {
    console.error('Response insert error:', error)
    return NextResponse.json({ error: 'Failed to save response.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
