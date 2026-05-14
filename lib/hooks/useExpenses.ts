'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Expense } from '@/lib/types'

export function useExpenses(month: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const start = `${month}-01`
      const [year, mon] = month.split('-').map(Number)
      const end = new Date(year, mon, 0).toISOString().split('T')[0]
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false })
      setExpenses(data || [])
    } catch {
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [month, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  return { expenses, loading, refresh: fetchData }
}
