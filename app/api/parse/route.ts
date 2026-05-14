import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await request.json()
  if (!text?.trim()) return NextResponse.json({})

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Extract expense details from this text and return ONLY valid JSON with these optional fields:
{"amount": number, "currency": "GBP"|"HKD", "categories": string[], "payment_methods": string[], "notes": string}

Available categories: ${CATEGORIES.join(', ')}
Available payment methods: ${PAYMENT_METHODS.join(', ')}

Text: "${text}"

Return only JSON, no explanation.`,
    }],
  })

  try {
    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({})
  }
}
