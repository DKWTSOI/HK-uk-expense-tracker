'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Budget } from '@/lib/types'

export interface BudgetWithSpend extends Budget {
  spent_gbp: number
}

export function useBudgets(month: string) {
  const [budgets, setBudgets] = useState<BudgetWithSpend[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const start = `${month}-01`
    const [year, mon] = month.split('-').map(Number)
    const end = new Date(year, mon, 0).toISOString().split('T')[0]

    const [{ data: caps }, { data: expenses }] = await Promise.all([
      supabase.from('budgets').select('*'),
      supabase.from('expenses').select('*').gte('date', start).lte('date', end),
    ])

    const spendByCategory: Record<string, number> = {}
    for (const e of expenses ?? []) {
      const isRefund = e.type === 'refund' || e.type === 'cashback'
      const cats = e.categories ?? []
      const share = (cats.length > 0 ? e.amount_gbp / cats.length : e.amount_gbp) * (isRefund ? -1 : 1)
      cats.forEach((c: string) => { spendByCategory[c] = (spendByCategory[c] || 0) + share })
    }

    setBudgets((caps ?? []).map((b: Budget) => ({
      ...b,
      spent_gbp: parseFloat((spendByCategory[b.category] || 0).toFixed(2)),
    })))
    setLoading(false)
  }, [month, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  return { budgets, loading, refresh: fetchData }
}
