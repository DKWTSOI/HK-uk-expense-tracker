'use client'
import { useState } from 'react'
import CategoryPills from './CategoryPills'
import CardPills from './CardPills'
import { CATEGORIES, CARDS } from '@/lib/constants'

export default function LogForm() {
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'GBP' | 'HKD'>('GBP')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [card, setCard] = useState<string>(CARDS[0])
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), currency, category, card, date }),
    })

    setLoading(false)
    if (res.ok) {
      setSuccess(true)
      setAmount('')
      setTimeout(() => setSuccess(false), 2000)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }

  const gbpPreview = currency === 'HKD' && amount
    ? `≈ £${(parseFloat(amount) * 0.1).toFixed(2)}`
    : null

  return (
    <form onSubmit={handleSubmit}>
      {/* Amount */}
      <div className="py-5 border-b border-gray-100">
        <div className="relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-5xl font-thin text-gray-200 pointer-events-none select-none">
            {currency === 'GBP' ? '£' : 'HK$'}
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-transparent pl-10 text-6xl font-thin text-gray-900 placeholder-gray-200 focus:outline-none"
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
          {gbpPreview && (
            <span className="text-gray-400 text-xs ml-1">{gbpPreview}</span>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="py-5 border-b border-gray-100">
        <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Category</p>
        <CategoryPills value={category} onChange={setCategory} />
      </div>

      {/* Card */}
      <div className="py-5 border-b border-gray-100">
        <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Card</p>
        <CardPills value={card} onChange={setCard} />
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

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading || !amount}
          className={`w-full rounded-2xl py-4 text-base font-medium transition-all ${
            success
              ? 'bg-green-500 text-white'
              : 'bg-stone-900 text-white disabled:opacity-25 hover:bg-stone-800'
          }`}
        >
          {success ? '✓ Logged' : loading ? 'Logging…' : 'Log it'}
        </button>
      </div>
    </form>
  )
}
