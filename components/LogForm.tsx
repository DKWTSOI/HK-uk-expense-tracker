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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount + Currency */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-3xl font-light text-gray-300">
              {currency === 'GBP' ? '£' : 'HK$'}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-transparent pl-10 pr-2 py-3 text-4xl font-light text-gray-900 placeholder-gray-200 focus:outline-none"
            />
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['GBP', 'HKD'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currency === c
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {gbpPreview && (
          <p className="text-gray-400 text-sm mt-1 pl-1">{gbpPreview} GBP</p>
        )}
      </div>

      {/* Category */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Category
        </label>
        <CategoryPills value={category} onChange={setCategory} />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Card
        </label>
        <CardPills value={card} onChange={setCard} />
      </div>

      {/* Date */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-transparent text-gray-900 text-base focus:outline-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm px-1">{error}</p>}

      <button
        type="submit"
        disabled={loading || !amount}
        className={`w-full rounded-2xl py-4 text-base font-semibold transition-all ${
          success
            ? 'bg-green-500 text-white'
            : 'bg-gray-900 text-white disabled:opacity-30 hover:bg-gray-800'
        }`}
      >
        {success ? '✓ Logged!' : loading ? 'Logging…' : 'Log it'}
      </button>
    </form>
  )
}
