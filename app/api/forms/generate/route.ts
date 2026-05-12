import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'
import { FREE_FORM_LIMIT } from '@/lib/types'
import type { FormSchema } from '@/lib/types'

const SYSTEM_PROMPT = `You are a form builder AI. Given a plain-English description, generate a JSON form schema.

Return ONLY valid JSON in this exact shape (no markdown, no explanation):
{
  "title": "Form Title",
  "fields": [
    {
      "id": "field_1",
      "type": "text|textarea|email|number|tel|url|select|radio|checkbox|date|file",
      "label": "Field Label",
      "placeholder": "Optional placeholder text",
      "required": true,
      "options": ["Option 1", "Option 2"],
      "helpText": "Optional help text"
    }
  ]
}

Rules:
- Use "options" only for select, radio, and checkbox types.
- "placeholder" and "helpText" are optional for all types.
- Generate 4–12 fields appropriate for the form description.
- Field ids must be unique strings like "field_1", "field_2", etc.
- Make the title concise and professional.
- Order fields logically (name/contact info first, then specific details, then open-ended fields last).`

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check plan limits
  const [{ data: sub }, { count: formCount }] = await Promise.all([
    supabase.from('subscriptions').select('plan').eq('user_id', user.id).single(),
    supabase.from('forms').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  if (sub?.plan === 'free' && (formCount ?? 0) >= FREE_FORM_LIMIT) {
    return NextResponse.json(
      { error: 'Free plan limit reached. Upgrade to Pro to create more forms.' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const prompt = body?.prompt?.trim()

  if (!prompt || prompt.length < 5) {
    return NextResponse.json({ error: 'Please provide a form description.' }, { status: 400 })
  }

  if (prompt.length > 1000) {
    return NextResponse.json({ error: 'Prompt too long. Keep it under 1000 characters.' }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let formData: { title: string; fields: FormSchema['fields'] }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Create a form for: ${prompt}` }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    // Strip any accidental markdown fences
    const raw = content.text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    formData = JSON.parse(raw)

    if (!formData.title || !Array.isArray(formData.fields)) {
      throw new Error('Invalid schema structure')
    }
  } catch (err) {
    console.error('AI generation error:', err)
    return NextResponse.json({ error: 'Failed to generate form. Please try again.' }, { status: 500 })
  }

  const slug = generateSlug()
  const { data: form, error: insertError } = await supabase
    .from('forms')
    .insert({
      user_id: user.id,
      title: formData.title,
      schema: { fields: formData.fields },
      theme: 'default',
      slug,
      is_published: false,
    })
    .select('id')
    .single()

  if (insertError || !form) {
    console.error('DB insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save form.' }, { status: 500 })
  }

  return NextResponse.json({ formId: form.id })
}
