import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

interface Params { params: { id: string } }

export async function POST(_request: Request, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check pro plan
  const { data: sub } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single()
  if (sub?.plan !== 'pro') {
    return NextResponse.json({ error: 'AI summaries require a Pro plan.' }, { status: 403 })
  }

  const { data: form } = await supabase
    .from('forms')
    .select('title, schema')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!form) return NextResponse.json({ error: 'Form not found.' }, { status: 404 })

  const { data: responses } = await supabase
    .from('responses')
    .select('data, created_at')
    .eq('form_id', params.id)
    .order('created_at', { ascending: false })
    .limit(200)

  if (!responses || responses.length === 0) {
    return NextResponse.json({ error: 'No responses to summarize.' }, { status: 400 })
  }

  const fields = form.schema?.fields ?? []

  const formattedResponses = responses.map((r, i) => {
    const lines = fields.map((f: { id: string; label: string }) => {
      const val = r.data[f.id]
      const display = Array.isArray(val) ? val.join(', ') : String(val ?? '')
      return `  ${f.label}: ${display}`
    })
    return `Response ${i + 1} (${new Date(r.created_at).toLocaleDateString()}):\n${lines.join('\n')}`
  }).join('\n\n')

  const prompt = `You are analyzing form responses for "${form.title}". Here are ${responses.length} responses:

${formattedResponses}

Provide a concise, insightful summary (3-5 paragraphs) covering:
1. Key patterns and themes across responses
2. Notable standout answers or outliers
3. Actionable insights or takeaways

Be specific and reference actual data from the responses.`

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')

    return NextResponse.json({ summary: content.text })
  } catch (err) {
    console.error('Summarize error:', err)
    return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 })
  }
}
