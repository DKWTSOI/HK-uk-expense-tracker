'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Expense } from '@/lib/types'
import MonthPicker from '@/components/MonthPicker'
import SpendingChart from '@/components/SpendingChart'
import AnalysisCard from '@/components/AnalysisCard'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export default function OverviewPage() {
  const [month, setMonth] = useState(currentMonth())
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState('')
  const [analysing, setAnalysing] = useState(false)
  const supabase = createClient()

  const fetchExpenses = useCallback(async (m: string) => {
    setLoading(true)
    setAnalysis('')
    const start = `${m}-01`
    const [year, mon] = m.split('-').map(Number)
    const end = new Date(year, mon, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })

    setExpenses(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchExpenses(month) }, [month, fetchExpenses])

  const total = expenses.reduce((s, e) => s + e.amount_gbp, 0)

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount_gbp
    return acc
  }, {})
  const categoryData = Object.entries(byCategory)
    .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => b.amount - a.amount)

  const byCard = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.card] = (acc[e.card] || 0) + e.amount_gbp
    return acc
  }, {})

  async function analyse() {
    setAnalysing(true)
    const res = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month }),
    })
    const data = await res.json()
    setAnalysis(data.analysis || data.error || 'Error')
    setAnalysing(false)
  }

  const monthLabel = new Date(`${month}-15`).toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-zinc-950 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-6">
        <Link href="/" className="text-zinc-400 text-sm hover:text-white transition-colors">
          ← Log
        </Link>
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 space-y-6">
        <MonthPicker value={month} onChange={setMonth} />

        {loading ? (
          <p className="text-zinc-500 text-sm">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="text-zinc-500 text-sm">No expenses for {monthLabel}.</p>
        ) : (
          <>
            {/* Total */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                Total spent
              </p>
              <p className="text-4xl font-light text-white">£{total.toFixed(2)}</p>
              <p className="text-zinc-500 text-sm mt-1">{expenses.length} transactions</p>
            </div>

            {/* By category */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
                By Category
              </p>
              <SpendingChart data={categoryData} />
              <div className="mt-3 space-y-2">
                {categoryData.map(({ name, amount }) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{name}</span>
                    <span className="text-white font-medium">£{amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                By Card
              </p>
              <div className="space-y-2">
                {Object.entries(byCard)
                  .sort((a, b) => b[1] - a[1])
                  .map(([card, amount]) => (
                    <div key={card} className="flex justify-between text-sm">
                      <span className="text-zinc-400">{card}</span>
                      <span className="text-white font-medium">£{amount.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Analyse button */}
            {!analysis && (
              <button
                onClick={analyse}
                disabled={analysing}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl py-4 font-medium text-base transition-colors disabled:opacity-50"
              >
                {analysing ? 'Analysing…' : 'Analyse this month'}
              </button>
            )}
            {analysis && <AnalysisCard text={analysis} />}
          </>
        )}
      </div>
    </div>
  )
}
