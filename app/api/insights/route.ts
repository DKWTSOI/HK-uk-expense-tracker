import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { month } = await request.json()
  const start = `${month}-01`
  const [year, mon] = month.split('-').map(Number)
  const end = new Date(year, mon, 0).toISOString().split('T')[0]

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date')

  if (!expenses?.length) {
    return NextResponse.json({
      summary: 'No expenses recorded this month yet.',
      patterns: [],
      suggestion: null,
    })
  }

  const monthLabel = new Date(`${month}-15`).toLocaleString('en-GB', { month: 'long', year: 'numeric' })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Analyse this expense data for ${monthLabel} and return ONLY valid JSON:
{
  "summary": "one sentence summary, key phrases in <em> tags",
  "patterns": [
    {"tone": "warn"|"info"|"good", "title": "short title", "body": "2 sentence detail", "chip": "short label like ↑47%"},
    {"tone": "warn"|"info"|"good", "title": "...", "body": "...", "chip": "..."},
    {"tone": "warn"|"info"|"good", "title": "...", "body": "...", "chip": "..."}
  ],
  "suggestion": {"body": "one actionable suggestion paragraph", "action": {"label": "button label"}}
}

Expenses: ${JSON.stringify(expenses)}

Return only valid JSON.`,
    }],
  })

  try {
    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ summary: 'Could not analyse this month.', patterns: [], suggestion: null })
  }
}
