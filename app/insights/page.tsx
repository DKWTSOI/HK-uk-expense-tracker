'use client'
export const dynamic = 'force-dynamic'
import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TabBar from '@/components/ui/TabBar'
import Card from '@/components/ui/Card'
import Label from '@/components/ui/Label'

function currentMonth() { return new Date().toISOString().slice(0, 7) }

interface Pattern {
  tone: 'warn' | 'info' | 'good'
  title: string
  body: string
  chip: string
}

interface InsightsData {
  summary: string
  patterns: Pattern[]
  suggestion: { body: string; action: { label: string } } | null
}

function parseEmphasis(text: string): React.ReactNode[] {
  const parts = text.split(/(<em>.*?<\/em>)/g)
  return parts.map((part, i) => {
    const match = part.match(/^<em>(.*?)<\/em>$/)
    if (match) return <em key={i}>{match[1]}</em>
    return part
  })
}

const DOT_COLOR: Record<string, string> = {
  warn: '#b25467',
  info: '#7c715f',
  good: '#5e8a6a',
}
const CHIP_COLOR: Record<string, { bg: string; fg: string }> = {
  warn: { bg: '#f3e1e3', fg: '#b25467' },
  info: { bg: '#efe7d8', fg: '#2a2218' },
  good: { bg: '#e8efe5', fg: '#5e8a6a' },
}

export default function InsightsPage() {
  const router = useRouter()
  const [month] = useState(currentMonth())
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  const monthLabel = new Date(`${month}-15`).toLocaleString('en-GB', { month: 'short' })

  useEffect(() => {
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month }),
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [month])

  return (
    <div className="min-h-screen pb-24 bg-paper-bg">
      <div className="flex items-center justify-between px-[22px] pt-14 pb-2 min-h-11">
        <span className="min-w-14" />
        <h1 className="text-[15px] font-semibold text-ink tracking-[-0.01em]">Insights</h1>
        <span className="min-w-14 text-sm text-ink-50 text-right">{monthLabel}</span>
      </div>

      {loading ? (
        <p className="text-ink-30 text-sm text-center py-12">Analysing…</p>
      ) : !data ? (
        <p className="text-ink-30 text-sm text-center py-12">Could not load insights.</p>
      ) : (
        <>
          {/* Hero AI card */}
          <div className="px-[22px] pt-[14px] pb-[18px]">
            <div
              className="text-white rounded-[26px] p-5 pb-[22px]"
              style={{
                background: 'linear-gradient(160deg, #3f6b54 0%, #2a4a3a 100%)',
                boxShadow: '0 14px 30px -16px rgba(63,107,84,0.5)',
              }}
            >
              <div className="flex items-center gap-2 opacity-85 mb-3">
                <span className="text-sm">✦</span>
                <span className="text-[11px] tracking-[0.16em] uppercase font-semibold">This month, in a sentence</span>
              </div>
              <p className="font-display text-[22px] leading-[1.3] tracking-[-0.015em] m-0">
                {parseEmphasis(data.summary)}
              </p>
            </div>
          </div>

          {/* Patterns */}
          {data.patterns.length > 0 && (
            <>
              <div className="px-[22px] pb-3">
                <Label>Patterns to watch</Label>
              </div>
              <div className="px-[22px] pb-4 flex flex-col gap-2.5">
                {data.patterns.map((p, i) => (
                  <Card key={i}>
                    <div className="flex justify-between items-start gap-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: DOT_COLOR[p.tone] }} />
                          <span className="text-[14px] font-semibold text-ink">{p.title}</span>
                        </div>
                        <p className="text-[12.5px] leading-[1.55] text-ink-60 m-0">{p.body}</p>
                      </div>
                      <span
                        className="text-[11px] font-bold whitespace-nowrap px-[9px] py-1 rounded-full"
                        style={{ background: CHIP_COLOR[p.tone].bg, color: CHIP_COLOR[p.tone].fg }}
                      >
                        {p.chip}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Suggestion */}
          {data.suggestion && (
            <div className="px-[22px] pb-4">
              <Card className="bg-cream-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs">💡</span>
                  <Label>One thing to try</Label>
                </div>
                <p className="text-[14px] leading-[1.55] text-ink m-0">{data.suggestion.body}</p>
                <div className="flex gap-2 mt-[14px]">
                  <button
                    onClick={() => router.push('/budgets')}
                    className="flex-1 py-[11px] rounded-[14px] border-none bg-ink text-paper text-[13px] font-semibold"
                  >
                    {data.suggestion.action.label}
                  </button>
                  <button className="px-4 py-[11px] rounded-[14px] border-none bg-transparent text-ink-50 text-[13px] font-medium">
                    Not now
                  </button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
      <TabBar />
    </div>
  )
}
