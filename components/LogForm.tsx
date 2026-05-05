'use client'
import { useState, useRef, useEffect } from 'react'
import CategoryPills from './CategoryPills'
import PaymentPills from './PaymentPills'
import RecentExpenses from './RecentExpenses'
import { ExpenseType } from '@/lib/types'

// In-memory last-used selections (persists within a browser session)
let lastCategories: string[] = []
let lastPaymentMethods: string[] = []

function evalAmount(expr: string): number | null {
  const clean = expr.replace(/[^0-9+\-*.]/g, '')
  if (!clean) return null
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${clean})`)()
    return typeof result === 'number' && isFinite(result) && result > 0 ? result : null
  } catch {
    return null
  }
}

export default function LogForm() {
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'GBP' | 'HKD'>('GBP')
  const [type, setType] = useState<ExpenseType>('expense')
  const [categories, setCategories] = useState<string[]>(lastCategories)
  const [paymentMethods, setPaymentMethods] = useState<string[]>(lastPaymentMethods)
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    amountRef.current?.focus()
  }, [])

  const evalResult = evalAmount(amount)
  const isExpression = amount.includes('+') || amount.includes('-') || amount.includes('*')
  const isValid = evalResult !== null && categories.length > 0 && paymentMethods.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || evalResult === null) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: evalResult,
        currency,
        type,
        categories,
        payment_methods: paymentMethods,
        date,
      }),
    })

    setLoading(false)
    if (res.ok) {
      lastCategories = categories
      lastPaymentMethods = paymentMethods

      setSuccess(true)
      setRefreshKey(k => k + 1)
      setTimeout(() => {
        setSuccess(false)
        setAmount('')
        setCategories(lastCategories)
        setPaymentMethods(lastPaymentMethods)
        amountRef.current?.focus()
      }, 1500)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }

  const gbpPreview = currency === 'HKD' && evalResult
    ? `≈ £${(evalResult * 0.1).toFixed(2)}`
    : null

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      {/* Amount */}
      <div className="py-5 border-b border-gray-100">
        <div className="relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-5xl font-thin text-gray-200 pointer-events-none select-none">
            {currency === 'GBP' ? '£' : 'HK$'}
          </span>
          <input
            ref={amountRef}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={`w-full bg-transparent pl-10 text-6xl font-thin placeholder-gray-200 focus:outline-none ${
              type !== 'expense' ? 'text-green-600' : 'text-gray-900'
            }`}
          />
        </div>
        <div className="flex items-center gap-3 mt-3 pl-1">
          {(['GBP', 'HKD'] as const).map((c, i) => (
            <span key={c} className="flex items-center gap-3">
              {i > 0 && <span className="text-gray-200 text-xs select-none">·</span>}
              <button
                type="button"
                onClick={() => setCurrency(c)}
                className={`text-sm font-medium transition-colors ${
                  currency === c ? 'text-stone-800' : 'text-gray-300'
                }`}
              >
                {c}
              </button>
            </span>
          ))}
          {isExpression && evalResult && (
            <span className="text-gray-500 text-xs ml-1">= {currency === 'GBP' ? '£' : 'HK$'}{evalResult.toFixed(2)}</span>
          )}
          {gbpPreview && (
            <span className="text-gray-400 text-xs ml-1">{gbpPreview}</span>
          )}
        </div>
      </div>

      {/* Type */}
      <div className="py-5 border-b border-gray-100">
        <div className="flex gap-4">
          {([['expense', 'Expense'], ['refund', 'Refund'], ['cashback', 'Cashback']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setType(val)}
              className={`text-sm font-medium transition-colors ${
                type === val ? 'text-stone-800' : 'text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="py-5 border-b border-gray-100">
        <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Category</p>
        <CategoryPills value={categories} onChange={setCategories} />
      </div>

      {/* Payment Method */}
      <div className="py-5 border-b border-gray-100">
        <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Payment Method</p>
        <PaymentPills value={paymentMethods} onChange={setPaymentMethods} />
      </div>

      {/* Date */}
      <div className="py-5 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-300 uppercase tracking-widest">Date</p>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-transparent text-gray-600 text-sm text-right focus:outline-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm mt-4 px-1">{error}</p>}

      <RecentExpenses refreshKey={refreshKey} />

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#faf9f7] via-[#faf9f7] to-transparent">
        <button
          type="submit"
          disabled={loading || !isValid}
          className={`w-full rounded-2xl py-4 text-base font-medium transition-all ${
            success
              ? 'bg-green-500 text-white scale-[0.98]'
              : 'bg-stone-900 text-white disabled:opacity-25 hover:bg-stone-800 active:scale-[0.98]'
          }`}
        >
          {success ? '✓ Logged' : loading ? 'Logging…' : 'Log it'}
        </button>
      </div>
    </form>
  )
}
