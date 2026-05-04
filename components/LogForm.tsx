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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount + Currency */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-light text-zinc-400">
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-5 text-4xl font-light text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <div className="flex bg-zinc-900 rounded-2xl p-1 border border-zinc-800">
            {(['GBP', 'HKD'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  currency === c ? 'bg-white text-zinc-950' : 'text-zinc-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {gbpPreview && (
          <p className="text-zinc-500 text-sm pl-1">{gbpPreview} GBP</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Category
        </label>
        <CategoryPills value={category} onChange={setCategory} />
      </div>

      {/* Card */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Card
        </label>
        <CardPills value={card} onChange={setCard} />
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base focus:outline-none focus:border-zinc-600 [color-scheme:dark]"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !amount}
        className={`w-full rounded-2xl py-5 text-lg font-semibold transition-all ${
          success
            ? 'bg-green-500 text-white'
            : 'bg-white text-zinc-950 disabled:opacity-40'
        }`}
      >
        {success ? '✓ Logged!' : loading ? 'Logging…' : 'Log it'}
      </button>
    </form>
  )
}
