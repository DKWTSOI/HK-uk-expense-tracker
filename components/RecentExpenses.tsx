'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Expense } from '@/lib/types'
import { CATEGORY_EMOJI } from '@/lib/constants'

interface Props {
  refreshKey: number
}

export default function RecentExpenses({ refreshKey }: Props) {
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

  if (expenses.length === 0) return null

  return (
    <div className="mt-2 border-t border-gray-100 pt-5">
      <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Recent</p>
      <div className="space-y-0">
        {expenses.map((e, i) => (
          <div
            key={e.id}
            className={`flex items-center justify-between py-3 ${
              i < expenses.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate">
                {e.categories.map(c => CATEGORY_EMOJI[c] || '📦').join(' ')} {e.categories.join(', ')}
              </p>
              <p className="text-xs text-gray-300 mt-0.5">{e.date}</p>
            </div>
            <div className="flex items-center gap-3 ml-3">
              <span className="text-sm font-medium text-gray-900">£{e.amount_gbp.toFixed(2)}</span>
              <button
                onClick={() => deleteExpense(e.id)}
                className="text-gray-200 hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
