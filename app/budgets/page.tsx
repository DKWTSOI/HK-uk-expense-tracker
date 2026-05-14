'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import TabBar from '@/components/ui/TabBar'
import Card from '@/components/ui/Card'
import Label from '@/components/ui/Label'
import Amount from '@/components/ui/Amount'
import { useBudgets } from '@/lib/hooks/useBudgets'
import { CATEGORY_EMOJI } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

function currentMonth() { return new Date().toISOString().slice(0, 7) }

function Ring({ pct }: { pct: number }) {
  const r = 32, c = 2 * Math.PI * r
  const off = c * (1 - Math.min(pct, 100) / 100)
  return (
    <div className="relative w-20 h-20">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#efe7d8" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="#3f6b54" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-display text-xl text-ink">
        {pct}%
      </div>
    </div>
  )
}

export default function BudgetsPage() {
  const [month] = useState(currentMonth())
  const { budgets, loading, refresh } = useBudgets(month)
  const supabase = createClient()

  const totalCap = budgets.reduce((s, b) => s + b.cap_gbp, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent_gbp, 0)
  const overallPct = totalCap > 0 ? Math.round(totalSpent / totalCap * 100) : 0
  const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate()
  const today = new Date().getDate()
  const daysLeft = daysInMonth - today

  async function addBudget() {
    const category = prompt('Category name?')
    if (!category) return
    const capStr = prompt('Monthly cap in £?')
    if (!capStr) return
    const cap = parseFloat(capStr)
    if (isNaN(cap) || cap <= 0) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('budgets').insert({ user_id: user.id, category, cap_gbp: cap, period: 'monthly' })
    refresh()
  }

  const monthLabel = new Date(`${month}-15`).toLocaleString('en-GB', { month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen pb-24 bg-paper-bg">
      <div className="flex items-center justify-between px-[22px] pt-14 pb-2 min-h-11">
        <span className="min-w-14" />
        <h1 className="text-[15px] font-semibold text-ink tracking-[-0.01em]">Budgets</h1>
        <span className="min-w-14 text-sm text-ink-50 text-right">{monthLabel}</span>
      </div>

      {loading ? (
        <p className="text-ink-30 text-sm text-center py-12">Loading…</p>
      ) : (
        <>
          {/* Overall ring */}
          <div className="px-[22px] pt-[14px] pb-[22px]">
            <Card>
              <div className="flex items-center gap-[18px]">
                <Ring pct={overallPct} />
                <div className="flex-1">
                  <Label>Overall</Label>
                  <div className="mt-1.5">
                    <Amount value={totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} sign="£" size={36} />
                  </div>
                  <p className="text-[12px] text-ink-40 mt-1">
                    of £{totalCap.toFixed(0)} ·{' '}
                    <span className="text-sage font-semibold">£{Math.max(0, totalCap - totalSpent).toFixed(0)} left</span>
                    {' '}· {daysLeft} days to go
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Budget rows */}
          {budgets.length > 0 && (
            <div className="px-[22px] pb-4">
              <Label className="mb-2.5">By category</Label>
              <div className="flex flex-col gap-2">
                {budgets.map(b => {
                  const pct = b.cap_gbp > 0 ? Math.min(b.spent_gbp / b.cap_gbp * 100, 100) : 0
                  const over = b.spent_gbp > b.cap_gbp
                  return (
                    <Card key={b.id} pad="p-[14px]">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="flex items-center gap-2.5 text-[14px] text-ink">
                          <span className="text-base">{CATEGORY_EMOJI[b.category] || '📦'}</span>
                          {b.category}
                        </span>
                        <span className="text-[13px] tabular-nums font-semibold">
                          <span className={over ? 'text-rose' : 'text-ink-50'}>£{b.spent_gbp.toFixed(0)}</span>
                          <span className="text-ink-40 font-normal"> / £{b.cap_gbp.toFixed(0)}</span>
                        </span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-cream-2 overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full ${over ? 'bg-rose' : 'bg-accent'}`}
                          style={{ width: `${pct}%` }}
                        />
                        {over && (
                          <div
                            className="absolute top-0 bottom-0 w-[1.5px] bg-ink"
                            style={{ left: `${b.cap_gbp / b.spent_gbp * 100}%` }}
                          />
                        )}
                      </div>
                      {over && (
                        <p className="text-[11px] text-rose mt-2 font-medium">
                          Over by £{(b.spent_gbp - b.cap_gbp).toFixed(0)} · {today} days in
                        </p>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add budget */}
          <div className="px-[22px] pb-4">
            <button
              onClick={addBudget}
              className="w-full py-[14px] rounded-[18px] border-[1.5px] border-dashed border-ink-30 text-ink-50 text-[13px] font-medium bg-transparent"
            >
              ＋ Add a budget
            </button>
          </div>
        </>
      )}
      <TabBar />
    </div>
  )
}
