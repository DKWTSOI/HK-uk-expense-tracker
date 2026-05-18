import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'AI parsing temporarily disabled.' }, { status: 503 })
}
