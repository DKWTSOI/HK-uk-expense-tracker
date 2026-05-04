import { createClient } from '@/lib/supabase/server'
import { HKD_TO_GBP } from '@/lib/constants'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { amount, currency, category, card, date } = body

  if (!amount || !currency || !category || !card || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const amount_gbp = currency === 'HKD' ? amount * HKD_TO_GBP : amount

  const { data, error } = await supabase.from('expenses').insert({
    amount: parseFloat(amount),
    currency,
    amount_gbp,
    category,
    card,
    date,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
