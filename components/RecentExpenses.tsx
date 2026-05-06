'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Expense } from '@/lib/types'
import { CATEGORY_EMOJI } from '@/lib/constants'

interface Props {
  refreshKey: number
  onPrefill: (e: Expense) => void
}

export default function RecentExpenses({ refreshKey, onPrefill }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    setExpenses(data || [])
  }

  useEffect(() => { load() }, [refreshKey])

  async function deleteExpense(id: string) {
    await fetch('/api/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const recurring = expenses.filter(e => e.recurring)
  const recent = expenses.filter(e => !e.recurring)

  if (expenses.length === 0) return null

  function renderRow(e: Expense, i: number, arr: Expense[], showRelog = false) {
    const isCredit = e.type === 'refund' || e.type === 'cashback'
    return (
      <div
        key={e.id}
        className={`flex items-center justify-between py-3 ${
          i < arr.length - 1 ? 'border-b border-gray-50' : ''
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 truncate">
            {e.categories.map(c => CATEGORY_EMOJI[c] || '📦').join(' ')} {e.categories.join(', ')}
          </p>
          {e.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{e.notes}</p>}
          <p className="text-xs text-gray-300 mt-0.5">
            {e.date}{e.type !== 'expense' && <span className="ml-1.5 capitalize">{e.type}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-3 shrink-0">
          <div className="text-right">
            <p className={`text-sm font-medium ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>
              {isCredit ? '+' : ''}£{e.amount_gbp.toFixed(2)}
            </p>
            {e.currency === 'HKD' && (
              <p className="text-xs text-gray-300">HK${e.amount.toFixed(0)}</p>
            )}
          </div>
          {showRelog && (
            <button
              onClick={() => onPrefill(e)}
              className="text-gray-300 hover:text-stone-700 transition-colors text-sm"
              title="Re-log"
            >
              ↺
            </button>
          )}
          <button
            onClick={() => deleteExpense(e.id)}
            className="text-gray-200 hover:text-red-400 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2">
      {recurring.length > 0 && (
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Recurring</p>
          {recurring.map((e, i) => renderRow(e, i, recurring, true))}
        </div>
      )}
      {recent.length > 0 && (
        <div className="border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Recent</p>
          {recent.map((e, i) => renderRow(e, i, recent))}
        </div>
      )}
    </div>
  )
}
