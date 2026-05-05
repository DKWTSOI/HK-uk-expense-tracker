'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Expense } from '@/lib/types'
import { CATEGORY_EMOJI, PAYMENT_METHOD_EMOJI } from '@/lib/constants'
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

  const sign = (e: { type?: string }) => (e.type === 'refund' || e.type === 'cashback') ? -1 : 1
  const total = expenses.reduce((s, e) => s + e.amount_gbp * sign(e), 0)

  // Flatten categories array, split amount_gbp equally
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    const cats = e.categories ?? []
    const share = (cats.length > 0 ? e.amount_gbp / cats.length : e.amount_gbp) * sign(e)
    cats.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + share
    })
    return acc
  }, {})
  const categoryData = Object.entries(byCategory)
    .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => b.amount - a.amount)

  // Flatten payment_methods array, split equally
  const byPayment = expenses.reduce<Record<string, number>>((acc, e) => {
    const methods = e.payment_methods ?? []
    const share = (methods.length > 0 ? e.amount_gbp / methods.length : e.amount_gbp) * sign(e)
    methods.forEach(m => {
      acc[m] = (acc[m] || 0) + share
    })
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

  return (
    <div className="min-h-screen pb-16 px-5">
      <div className="flex items-center justify-between pt-14 pb-2">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Log
        </Link>
        <h1 className="text-base font-medium text-gray-900">Overview</h1>
        <div className="w-10" />
      </div>

      <MonthPicker value={month} onChange={setMonth} />

      {loading ? (
        <p className="text-gray-300 text-sm text-center py-12">Loading…</p>
      ) : expenses.length === 0 ? (
        <p className="text-gray-300 text-sm text-center py-12">No expenses this month.</p>
      ) : (
        <>
          {/* Total */}
          <div className="py-8 border-b border-gray-100">
            <p className="text-5xl font-thin text-gray-900">£{total.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-2">{expenses.length} transactions</p>
          </div>

          {/* Chart */}
          {categoryData.length > 1 && (
            <div className="py-6 border-b border-gray-100">
              <SpendingChart data={categoryData} />
            </div>
          )}

          {/* By category */}
          <div className="py-5 border-b border-gray-100">
            <p className="text-xs text-gray-300 uppercase tracking-widest mb-4">By Category</p>
            {categoryData.map(({ name, amount }, i) => (
              <div
                key={name}
                className={`flex items-center justify-between py-3 ${
                  i < categoryData.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <span className="text-sm text-gray-600">
                  {CATEGORY_EMOJI[name] || '📦'} {name}
                </span>
                <span className="text-sm text-gray-900 font-medium">£{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* By payment method */}
          <div className="py-5 border-b border-gray-100">
            <p className="text-xs text-gray-300 uppercase tracking-widest mb-4">By Payment Method</p>
            {Object.entries(byPayment)
              .sort((a, b) => b[1] - a[1])
              .map(([method, amount], i, arr) => (
                <div
                  key={method}
                  className={`flex items-center justify-between py-3 ${
                    i < arr.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <span className="text-sm text-gray-600">
                    {PAYMENT_METHOD_EMOJI[method] || '💳'} {method}
                  </span>
                  <span className="text-sm text-gray-900 font-medium">£{amount.toFixed(2)}</span>
                </div>
              ))}
          </div>

          {/* Analyse */}
          {!analysis ? (
            <div className="py-5">
              <button
                onClick={analyse}
                disabled={analysing}
                className="w-full border border-gray-200 text-gray-400 rounded-2xl py-4 text-sm transition-all hover:border-gray-300 hover:text-gray-500 disabled:opacity-50"
              >
                {analysing ? 'Analysing…' : '✦ Analyse this month'}
              </button>
            </div>
          ) : (
            <div className="py-5">
              <AnalysisCard text={analysis} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
