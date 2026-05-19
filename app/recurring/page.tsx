'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TabBar from '@/components/ui/TabBar'
import Card from '@/components/ui/Card'
import Label from '@/components/ui/Label'
import Amount from '@/components/ui/Amount'
import { Expense } from '@/lib/types'
import { CATEGORY_EMOJI, PAYMENT_METHOD_EMOJI, HKD_TO_GBP } from '@/lib/constants'

function currentMonth() { return new Date().toISOString().slice(0, 7) }

function getUpcoming(recurring: Expense[]) {
  const today = new Date().toISOString().split('T')[0]
  const month = currentMonth()
  const start = `${month}-01`
  const [year, mon] = month.split('-').map(Number)
  const end = new Date(year, mon, 0).toISOString().split('T')[0]
  return recurring
    .filter(e => e.date >= start && e.date <= end && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
}

function useAllRecurring() {
  const [recurring, setRecurring] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('expenses')
      .select('*')
      .eq('recurring', true)
      .order('date', { ascending: false })
      .then(({ data }) => { setRecurring(data || []); setLoading(false) }, () => setLoading(false))
  }, [])

  return { recurring, loading }
}

export default function RecurringPage() {
  const { recurring, loading } = useAllRecurring()

  const totalGBP = recurring.reduce((s, e) => {
    const isRefund = e.type === 'refund' || e.type === 'cashback'
    return s + e.amount_gbp * (isRefund ? -1 : 1)
  }, 0)

  const upcoming = getUpcoming(recurring)

  return (
    <div className="min-h-screen pb-24 bg-paper-bg">
      <div className="flex items-center justify-between px-[22px] pt-14 pb-2 min-h-11">
        <span className="min-w-14" />
        <h1 className="text-[15px] font-semibold text-ink tracking-[-0.01em]">Recurring</h1>
        <span className="min-w-14" />
      </div>

      {loading ? (
        <p className="text-ink-30 text-sm text-center py-12">Loading…</p>
      ) : (
        <>
          {/* Header total */}
          <div className="px-[22px] pt-[14px] pb-[18px]">
            <Label>Locked in each month</Label>
            <div className="mt-2">
              <Amount
                value={totalGBP.toFixed(2)}
                sign="£"
                sub={`across ${recurring.length} recurring · ≈ HK$${Math.round(totalGBP / HKD_TO_GBP).toLocaleString()}`}
                size={56}
              />
            </div>
          </div>

          {/* Coming up */}
          {upcoming.length > 0 && (
            <div className="px-[22px] pb-4">
              <Card>
                <div className="flex justify-between items-baseline mb-3">
                  <Label>Coming up</Label>
                  <span className="text-[11px] text-ink-40">this month</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {upcoming.map((e) => {
                    const d = new Date(e.date + 'T00:00:00')
                    const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' })
                    const dayNum = d.getDate()
                    const isHKD = e.currency === 'HKD'
                    const displayAmt = isHKD ? `HK$${Math.round(e.amount)}` : `£${e.amount_gbp.toFixed(2)}`
                    const cats = e.categories ?? []
                    const methods = e.payment_methods ?? []
                    return (
                      <div key={e.id} className="flex items-center gap-3">
                        <div className="min-w-[52px] px-2 py-1.5 rounded-[10px] bg-cream-2 text-center">
                          <div className="text-[9px] text-ink-40 uppercase tracking-[0.08em]">{dayName}</div>
                          <div className="font-display text-[15px] font-semibold text-ink">{dayNum}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] text-ink truncate">{e.notes || cats.join(', ')}</p>
                          <p className="text-[11px] text-ink-40 mt-0.5">{PAYMENT_METHOD_EMOJI[methods[0]] || '💳'} {methods[0]}</p>
                        </div>
                        <span className="text-[14px] font-semibold text-ink tabular-nums">{displayAmt}</span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* All recurring */}
          {recurring.length > 0 ? (
            <div className="px-[22px] pb-4">
              <Label className="mb-2.5">All recurring</Label>
              <Card pad="p-1">
                {recurring.map((e, i) => {
                  const cats = e.categories ?? []
                  const methods = e.payment_methods ?? []
                  const emoji = CATEGORY_EMOJI[cats[0]] || '📦'
                  const isHKD = e.currency === 'HKD'
                  const displayAmt = isHKD ? `HK$${Math.round(e.amount)}` : `£${e.amount_gbp.toFixed(2)}`
                  return (
                    <div key={e.id} className={`flex items-center gap-3 px-[14px] py-[13px] ${i < recurring.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      <span className="w-8 h-8 rounded-[10px] bg-cream-2 grid place-items-center text-base flex-shrink-0">
                        {emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] text-ink truncate">{e.notes || cats.join(', ')}</p>
                        <p className="text-[11px] text-ink-40 mt-0.5">
                          {PAYMENT_METHOD_EMOJI[methods[0]] || '💳'} {methods[0]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-semibold text-ink tabular-nums">{displayAmt}</p>
                        {isHKD && (
                          <p className="text-[10.5px] text-ink-40">≈ £{e.amount_gbp.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </Card>
            </div>
          ) : (
            <p className="text-ink-30 text-sm text-center py-12">No recurring expenses yet.</p>
          )}
        </>
      )}
      <TabBar />
    </div>
  )
}
