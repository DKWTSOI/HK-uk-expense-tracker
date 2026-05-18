import { NextResponse } from 'next/server'

const FALLBACK = 0.1
let cached: { rate: number; updatedAt: number } | null = null

export async function GET() {
  if (cached && Date.now() - cached.updatedAt < 60 * 60 * 1000) {
    return NextResponse.json({ rate: cached.rate, updatedAt: cached.updatedAt, source: 'cache' })
  }

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/GBP', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const rate: number = 1 / data.rates.HKD
    cached = { rate, updatedAt: Date.now() }
    return NextResponse.json({ rate: cached.rate, updatedAt: cached.updatedAt, source: 'live' })
  } catch {
    const updatedAt = cached?.updatedAt ?? null
    return NextResponse.json({ rate: cached?.rate ?? FALLBACK, updatedAt, source: 'fallback' })
  }
}
