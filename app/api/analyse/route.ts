import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { month } = await request.json() // "YYYY-MM"

  const start = `${month}-01`
  const [year, mon] = month.split('-').map(Number)
  const end = new Date(year, mon, 0).toISOString().split('T')[0]

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!expenses || expenses.length === 0) {
    return NextResponse.json({ analysis: 'No expenses found for this month.' })
  }

  const monthLabel = new Date(`${month}-15`).toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are a smart personal finance assistant. Here is my expense data for ${monthLabel}: ${JSON.stringify(expenses)}. Give me: 1) a 2-sentence summary of my spending, 2) the top 2 patterns or things to watch, 3) one actionable suggestion. Be direct and concise, no fluff.`,
    }],
  })

  const analysis = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ analysis })
}
