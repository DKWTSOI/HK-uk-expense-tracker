'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TabBar from '@/components/ui/TabBar'
import Card from '@/components/ui/Card'
import Label from '@/components/ui/Label'
import { Expense } from '@/lib/types'
import { CATEGORY_EMOJI, PAYMENT_METHOD_EMOJI } from '@/lib/constants'

export default function HistoryPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchExpenses() {
      const supabase = createClient()
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(150)
      setExpenses(data ?? [])
      setLoading(false)
    }
    fetchExpenses()
  }, [])

  async function deleteExpense(id: string) {
    setDeletedIds(prev => { const n = new Set(prev); n.add(id); return n })
    await fetch('/api/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  const displayed = expenses.filter(e => !deletedIds.has(e.id))

  const today = new Date().toISOString().split('T')[0]
  const yd = new Date(); yd.setDate(yd.getDate() - 1)
  const yesterday = yd.toISOString().split('T')[0]

  const sign = (e: Expense) => (e.type === 'refund' || e.type === 'cashback') ? -1 : 1
  const todayTotal = displayed.filter(e => e.date === today).reduce((s, e) => s + e.amount_gbp * sign(e), 0)
  const yTotal = displayed.filter(e => e.date === yesterday).reduce((s, e) => s + e.amount_gbp * sign(e), 0)
  const diff = todayTotal - yTotal

  return (
    <div className="min-h-screen pb-24 bg-paper-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-[22px] pt-14 pb-2 min-h-11">
        <span className="min-w-14" />
        <h1 className="text-[15px] font-semibold text-ink tracking-[-0.01em]">History</h1>
        <span className="min-w-14" />
      </div>

      {loading ? <p className="text-ink-30 text-sm text-center py-12">Loading…</p> : (
        <>
          {/* Today vs Yesterday card — only show if there's data for at least one of them */}
          {(todayTotal > 0 || yTotal > 0) && (
            <div className="px-[22px] pt-[14px] pb-4">
              <Card>
                <Label className="mb-3">Today vs yesterday</Label>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[11px] text-ink-40 tracking-[0.06em] mb-0.5">TODAY</p>
                    <p className="text-[22px] font-display font-semibold text-ink tabular-nums">£{todayTotal.toFixed(2)}</p>
                  </div>
                  {/* Diff chip */}
                  {yTotal > 0 && (
                    <div className={`px-3 py-1.5 rounded-full text-[12px] font-semibold ${diff > 0 ? 'bg-rose-bg text-rose' : 'bg-sage-bg text-sage'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(2)} vs yday
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-[11px] text-ink-40 tracking-[0.06em] mb-0.5">YESTERDAY</p>
                    <p className="text-[22px] font-display font-semibold text-ink-50 tabular-nums">£{yTotal.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Expense list */}
          {displayed.length === 0 ? (
            <p className="text-ink-30 text-sm text-center py-12">No expenses yet.</p>
          ) : (
            <div className="px-[22px] pb-4">
              <Label className="mb-2.5">All expenses</Label>
              <Card pad="p-1">
                {displayed.map((e, i) => {
                  const cats = e.categories ?? []
                  const methods = e.payment_methods ?? []
                  const emoji = CATEGORY_EMOJI[cats[0]] || '📦'
                  const methodEmoji = PAYMENT_METHOD_EMOJI[methods[0]] || '💳'
                  const isHKD = e.currency === 'HKD'
                  const displayAmt = isHKD ? `HK$${Math.round(e.amount)}` : `£${e.amount_gbp.toFixed(2)}`
                  const isCredit = e.type === 'refund' || e.type === 'cashback'
                  const dateLabel = new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  return (
                    <div key={e.id} className={`flex items-center gap-3 px-[14px] py-3 ${i < displayed.length - 1 ? 'border-b border-cream-2' : ''}`}>
                      <span className="w-8 h-8 rounded-[10px] bg-cream-2 grid place-items-center text-base flex-shrink-0">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] text-ink truncate">{e.notes || cats.join(', ')}</p>
                        <p className="text-[11px] text-ink-40 mt-0.5">{dateLabel} · {methodEmoji} {methods[0]}</p>
                        {e.type !== 'expense' && <p className="text-[10px] text-ink-30 mt-0.5 capitalize">{e.type}</p>}
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="text-right">
                          <p className={`text-[14px] font-semibold tabular-nums ${isCredit ? 'text-sage' : 'text-ink'}`}>
                            {isCredit ? '+' : ''}{displayAmt}
                          </p>
                          {isHKD && <p className="text-[10.5px] text-ink-40">≈ £{e.amount_gbp.toFixed(2)}</p>}
                        </div>
                        <button onClick={() => deleteExpense(e.id)} className="text-ink-30 hover:text-rose transition-colors text-lg leading-none">×</button>
                      </div>
                    </div>
                  )
                })}
              </Card>
            </div>
          )}
        </>
      )}
      <TabBar />
    </div>
  )
}
