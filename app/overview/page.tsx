'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import TabBar from '@/components/ui/TabBar'
import Card from '@/components/ui/Card'
import Label from '@/components/ui/Label'
import Amount from '@/components/ui/Amount'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { CATEGORY_EMOJI, PAYMENT_METHOD_EMOJI, HKD_TO_GBP } from '@/lib/constants'

function currentMonth() { return new Date().toISOString().slice(0, 7) }

function monthLabel(m: string) {
  return new Date(`${m}-15`).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

function prevMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo - 2, 1)
  return d.toISOString().slice(0, 7)
}
function nextMonth(m: string) {
  const [y, mo] = m.split('-').map(Number)
  const d = new Date(y, mo, 1)
  return d.toISOString().slice(0, 7)
}

export default function OverviewPage() {
  const [month, setMonth] = useState(currentMonth())
  const { expenses, loading } = useExpenses(month)

  const sign = (e: { type?: string }) => (e.type === 'refund' || e.type === 'cashback') ? -1 : 1
  const total = expenses.reduce((s, e) => s + e.amount_gbp * sign(e), 0)

  const gbpExpenses = expenses.filter(e => e.currency === 'GBP')
  const hkdExpenses = expenses.filter(e => e.currency === 'HKD')
  const gbpTotal = gbpExpenses.reduce((s, e) => s + e.amount_gbp * sign(e), 0)
  const hkdTotal = hkdExpenses.reduce((s, e) => s + e.amount_gbp * sign(e), 0)
  const hkdRaw = hkdExpenses.reduce((s, e) => s + e.amount * sign(e), 0)
  const gbpPct = total > 0 ? Math.round(gbpTotal / total * 100) : 50

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    const cats = e.categories ?? []
    const share = (cats.length > 0 ? e.amount_gbp / cats.length : e.amount_gbp) * sign(e)
    cats.forEach(cat => { acc[cat] = (acc[cat] || 0) + share })
    return acc
  }, {})
  const categoryData = Object.entries(byCategory)
    .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)

  const maxAmt = categoryData[0]?.amount || 1
  const recent = expenses.slice(0, 5)

  return (
    <div className="min-h-screen pb-24 bg-paper-bg">
      {/* Chrome — month nav */}
      <div className="flex items-center justify-between px-[22px] pt-14 pb-2 min-h-11">
        <button onClick={() => setMonth(prevMonth(month))} className="min-w-14 text-sm text-ink-50 font-medium text-left">
          ‹ {new Date(`${prevMonth(month)}-15`).toLocaleString('en-GB', { month: 'short' })}
        </button>
        <h1 className="text-[15px] font-semibold text-ink tracking-[-0.01em]">{monthLabel(month)}</h1>
        <button onClick={() => setMonth(nextMonth(month))} className="min-w-14 text-sm text-ink-50 font-medium text-right">
          {new Date(`${nextMonth(month)}-15`).toLocaleString('en-GB', { month: 'short' })} ›
        </button>
      </div>

      {loading ? (
        <p className="text-ink-30 text-sm text-center py-12">Loading…</p>
      ) : expenses.length === 0 ? (
        <p className="text-ink-30 text-sm text-center py-12">No expenses this month.</p>
      ) : (
        <>
          {/* Hero total */}
          <div className="px-[22px] pt-[14px] pb-[18px]">
            <Label>Spent this month</Label>
            <div className="mt-2.5">
              <Amount
                value={total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                sign="£"
                sub={`≈ HK$${Math.round(total / HKD_TO_GBP).toLocaleString()} · ${expenses.length} transactions`}
                size={62}
              />
            </div>
          </div>

          {/* Currency split */}
          {(gbpTotal > 0 || hkdTotal > 0) && (
            <div className="px-[22px] pb-4">
              <Card>
                <Label className="mb-3">Currency split</Label>
                <div className="flex h-2 rounded-full overflow-hidden bg-cream-2">
                  <div className="bg-accent transition-all" style={{ width: `${gbpPct}%` }} />
                  <div className="bg-ink-70 flex-1" />
                </div>
                <div className="flex justify-between mt-2.5">
                  <div>
                    <p className="text-[11px] text-ink-40 tracking-[0.06em]">UK · GBP</p>
                    <p className="text-base font-semibold text-ink tabular-nums">£{gbpTotal.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-ink-40 tracking-[0.06em]">HK · HKD</p>
                    <p className="text-base font-semibold text-ink tabular-nums">HK${Math.round(hkdRaw).toLocaleString()}</p>
                    <p className="text-[11px] text-ink-40">= £{hkdTotal.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Bar chart */}
          {categoryData.length > 1 && (
            <div className="px-[22px] pb-4">
              <Card>
                <div className="flex justify-between items-baseline mb-[18px]">
                  <Label>By category</Label>
                  <span className="text-[11px] text-ink-40">top {categoryData.length}</span>
                </div>
                <div className="flex items-end gap-1.5 h-[90px]">
                  {categoryData.map((c, i) => {
                    const h = Math.max(8, Math.round(c.amount / maxAmt * 80))
                    return (
                      <div key={c.name} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className={`w-full rounded-t-[6px] rounded-b-[2px] ${i === 0 ? 'bg-accent' : 'bg-cream-3'}`}
                          style={{ height: h }}
                        />
                        <span className="text-[13px]">{CATEGORY_EMOJI[c.name] || '📦'}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* Category list */}
          <div className="px-[22px] pb-4">
            <Card pad="p-1">
              {categoryData.map((c, i) => (
                <div key={c.name} className={`flex items-center justify-between px-[14px] py-[13px] ${i < categoryData.length - 1 ? 'border-b border-cream-2' : ''}`}>
                  <span className="flex items-center gap-2.5 text-[13.5px] text-ink">
                    <span className="text-base">{CATEGORY_EMOJI[c.name] || '📦'}</span>
                    {c.name}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-[11px] text-ink-40">{total > 0 ? Math.round(c.amount / total * 100) : 0}%</span>
                    <span className="text-[14px] font-semibold text-ink tabular-nums">£{c.amount.toFixed(2)}</span>
                  </span>
                </div>
              ))}
            </Card>
          </div>

          {/* Recent transactions */}
          <div className="px-[22px] pb-4">
            <Label className="mb-2.5">Recent</Label>
            <Card pad="p-1">
              {recent.map((e, i) => {
                const cats = e.categories ?? []
                const emoji = CATEGORY_EMOJI[cats[0]] || '📦'
                const methods = e.payment_methods ?? []
                const methodEmoji = PAYMENT_METHOD_EMOJI[methods[0]] || '💳'
                const isHKD = e.currency === 'HKD'
                const displayAmt = isHKD ? `HK$${Math.round(e.amount)}` : `£${e.amount_gbp.toFixed(2)}`
                const dateLabel = new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                return (
                  <div key={e.id} className={`flex items-center justify-between px-[14px] py-3 ${i < recent.length - 1 ? 'border-b border-cream-2' : ''}`}>
                    <div className="flex gap-2.5 items-start min-w-0">
                      <span className="text-base mt-0.5">{emoji}</span>
                      <div className="min-w-0">
                        <p className="text-[13.5px] text-ink truncate">{e.notes || cats.join(', ')}</p>
                        <p className="text-[11px] text-ink-40 mt-0.5">{dateLabel} · {methodEmoji} {methods[0]}</p>
                      </div>
                    </div>
                    <span className="text-[14px] font-semibold text-ink tabular-nums whitespace-nowrap ml-2">{displayAmt}</span>
                  </div>
                )
              })}
            </Card>
          </div>
        </>
      )}
      <TabBar />
    </div>
  )
}
