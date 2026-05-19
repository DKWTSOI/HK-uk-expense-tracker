'use client'
import { useState } from 'react'
import { CATEGORIES, CATEGORY_EMOJI, PAYMENT_METHOD_GROUPS, PAYMENT_METHOD_EMOJI } from '@/lib/constants'
import { ExpenseType } from '@/lib/types'
import { useExchangeRate } from '@/lib/hooks/useExchangeRate'
import { useStreak } from '@/lib/hooks/useStreak'
import { addPending } from '@/lib/offlineQueue'
import SuccessOverlay from './SuccessOverlay'
import Card from './ui/Card'
import Pill from './ui/Pill'

const HK_CARD_METHODS = new Set(
  PAYMENT_METHOD_GROUPS.find(g => g.label === 'HK Cards')?.methods ?? []
)

function evalAmount(expr: string): number | null {
  const clean = expr.replace(/[^0-9+\-*.]/g, '')
  if (!clean) return null
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${clean})`)()
    return typeof result === 'number' && isFinite(result) && result > 0 ? result : null
  } catch { return null }
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (d.getTime() === today.getTime()) return 'Today'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function ProgressDots({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
      {[0, 1, 2, 3].map(i => {
        const isActive = i === step
        const isPast = i < step
        return (
          <div
            key={i}
            style={{
              width: isActive ? 20 : 6,
              height: 6,
              borderRadius: 9999,
              backgroundColor: isActive ? '#3f6b54' : isPast ? '#3f6b54' : '#efe7d8',
              opacity: isPast ? 0.35 : 1,
              transition: 'width 0.2s, background-color 0.2s',
            }}
          />
        )
      })}
    </div>
  )
}

const PAD_KEYS = ['7', '8', '9', '⌫', '4', '5', '6', '+', '1', '2', '3', '-', 'C', '0', '.', '']

export default function LogWizard() {
  const today = new Date().toISOString().split('T')[0]
  const { rate: HKD_TO_GBP, updatedAt: rateUpdatedAt } = useExchangeRate()
  const streak = useStreak()
  const [step, setStep] = useState(0)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'GBP' | 'HKD'>('GBP')
  const [type, setType] = useState<ExpenseType>('expense')
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [offlineSaved, setOfflineSaved] = useState(false)
  const [error, setError] = useState('')

  const evalResult = evalAmount(amount)
  const displaySign = currency === 'GBP' ? '£' : 'HK$'
  const gbpPreview = !evalResult ? '' : currency === 'HKD' ? `≈ £${(evalResult * HKD_TO_GBP).toFixed(2)}` : `≈ HK$${Math.round(evalResult / HKD_TO_GBP)}`

  function go(n: number) {
    setStep(s => Math.max(0, Math.min(3, s + n)))
  }

  function padPress(key: string) {
    if (key === '⌫') {
      setAmount(a => a.slice(0, -1))
    } else if (key === 'C') {
      setAmount('')
    } else {
      setAmount(a => a + key)
    }
  }

  function selectCategory(cat: string) {
    setCategory(cat)
    setTimeout(() => setStep(2), 100)
  }

  function selectPayment(method: string) {
    setPaymentMethod(method)
    setCurrency(HK_CARD_METHODS.has(method) ? 'HKD' : 'GBP')
    setTimeout(() => setStep(3), 100)
  }

  function resetWizard() {
    setAmount('')
    setCurrency('GBP')
    setType('expense')
    setCategory('')
    setPaymentMethod('')
    setNotes('')
    setRecurring(false)
    setDate(today)
    setLoading(false)
    setError('')
    setShowSuccess(false)
    setOfflineSaved(false)
    setStep(0)
  }

  async function handleSubmit() {
    if (!evalResult || !category || !paymentMethod) return

    const payload = {
      amount: evalResult, currency, type,
      categories: [category], payment_methods: [paymentMethod],
      notes, recurring, date,
    }

    // Offline path — queue to IndexedDB
    if (!navigator.onLine) {
      try {
        await addPending(payload)
        setOfflineSaved(true)
        setTimeout(resetWizard, 2200)
      } catch {
        setError('Could not save offline. Please try again.')
      }
      return
    }

    // Online path
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || 'Something went wrong. Please try again.')
      } else {
        setShowSuccess(true)
      }
    } catch {
      // Fetch itself threw — likely no connectivity despite navigator.onLine
      try {
        await addPending(payload)
        setOfflineSaved(true)
        setTimeout(resetWizard, 2200)
      } catch {
        setError('Network error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-paper-bg">
      {showSuccess && <SuccessOverlay onDone={resetWizard} />}

      {/* Offline saved overlay */}
      {offlineSaved && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3"
             style={{ background: 'rgba(250,246,239,0.95)' }}>
          <div className="w-[72px] h-[72px] rounded-full bg-ink-50 flex items-center justify-center text-3xl">
            📶
          </div>
          <p className="text-[17px] font-semibold text-ink tracking-[-0.01em]">Saved offline</p>
          <p className="text-[13px] text-ink-40">Will sync automatically when back online</p>
        </div>
      )}

      {/* Chrome header — static, outside sliding track */}
      <div className="flex items-center justify-between px-[22px] pt-14 pb-3" style={{ minHeight: 72 }}>
        <button
          onClick={() => go(-1)}
          className="min-w-14 text-sm text-ink-50 font-medium text-left transition-opacity"
          style={{ opacity: step > 0 ? 1 : 0, pointerEvents: step > 0 ? 'auto' : 'none' }}
        >
          ← Back
        </button>
        <ProgressDots step={step} />
        {/* Right side: show streak badge if streak > 0 AND step === 0 */}
        <div className="min-w-14 flex justify-end">
          {streak > 0 && step === 0 && (
            <span className="text-[11px] text-ink-50 font-medium">🔥 {streak}d</span>
          )}
        </div>
      </div>

      {/* Sliding track */}
      <div className="overflow-x-hidden">
        <div style={{
          display: 'flex',
          width: '400%',
          transform: `translateX(${-step * 25}%)`,
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
          alignItems: 'flex-start',
        }}>

          {/* STEP 0: Amount */}
          <div style={{ width: '25%' }} className="px-[22px] pt-2 pb-32">
            <p className="text-[12px] text-ink-40 uppercase tracking-[0.1em] font-semibold mb-3">How much?</p>
            {/* Amount display */}
            <div className="flex items-baseline gap-3 mb-5">
              <div className="flex items-baseline">
                <span className="font-display font-light opacity-50 mr-1" style={{ fontSize: 37 }}>{displaySign}</span>
                <span className="font-display text-ink" style={{ fontSize: 68, lineHeight: 1, minWidth: '1ch' }}>
                  {amount || <span className="opacity-25">0</span>}
                </span>
              </div>
              {gbpPreview && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-ink-40 tabular-nums">{gbpPreview}</span>
                  {rateUpdatedAt && (
                    <span className="text-[10px] text-ink-30">rate {new Date(rateUpdatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              )}
            </div>
            {/* Currency + type pills */}
            <div className="flex items-center gap-2 mb-5">
              <Pill on={currency === 'GBP'} tone="accent" size="sm" onClick={() => setCurrency('GBP')}>£ GBP</Pill>
              <Pill on={currency === 'HKD'} tone="accent" size="sm" onClick={() => setCurrency('HKD')}>HK$ HKD</Pill>
              <span className="flex-1" />
              <Pill on={type === 'expense'} size="sm" onClick={() => setType('expense')}>Expense</Pill>
              <Pill on={type !== 'expense'} size="sm" onClick={() => setType(type === 'refund' ? 'cashback' : 'refund')}>Refund</Pill>
            </div>
            {/* Calculator pad */}
            <div className="grid grid-cols-4 gap-2">
              {PAD_KEYS.map((k, i) => {
                if (k === '') return <div key={i} />
                const isOp = k === '+' || k === '-'
                const isDel = k === '⌫' || k === 'C'
                return (
                  <button key={k + i} type="button" onClick={() => padPress(k)}
                    className={`h-14 rounded-[14px] text-[20px] font-medium transition-all active:scale-95
                      ${isOp ? 'bg-accent/10 text-accent font-semibold' : ''}
                      ${isDel ? 'bg-cream-2 text-ink-50 text-[16px]' : ''}
                      ${!isOp && !isDel ? 'bg-paper text-ink card-shadow' : ''}`}
                  >{k}</button>
                )
              })}
            </div>
            {evalResult && /[+\-]/.test(amount) && (
              <p className="text-center text-[13px] text-ink-40 tabular-nums mt-2">= {displaySign}{evalResult.toFixed(2)}</p>
            )}
          </div>

          {/* STEP 1: Category */}
          <div style={{ width: '25%' }} className="px-[22px] pt-2 pb-24">
            <p className="text-[12px] text-ink-40 uppercase tracking-[0.1em] font-semibold mb-4">What was it for?</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => selectCategory(cat)}
                  className={`flex items-center gap-2.5 px-4 py-[14px] rounded-[18px] text-left text-[14px] font-medium transition-all active:scale-95
                    ${category === cat ? 'bg-accent text-white' : 'bg-paper text-ink card-shadow'}`}
                >
                  <span className="text-lg flex-shrink-0">{CATEGORY_EMOJI[cat] || '📦'}</span>
                  <span className="leading-tight">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Payment */}
          <div style={{ width: '25%' }} className="px-[22px] pt-2 pb-24">
            <p className="text-[12px] text-ink-40 uppercase tracking-[0.1em] font-semibold mb-4">How did you pay?</p>
            <div className="flex flex-col gap-4">
              {PAYMENT_METHOD_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="text-[10.5px] text-ink-30 uppercase tracking-[0.08em] mb-2">{group.label}</p>
                  <div className="flex flex-col gap-1.5">
                    {group.methods.map(method => (
                      <button key={method} type="button" onClick={() => selectPayment(method)}
                        className={`flex items-center gap-3 px-4 py-[13px] rounded-[16px] text-[14px] font-medium transition-all active:scale-95
                          ${paymentMethod === method ? 'bg-accent text-white' : 'bg-paper text-ink card-shadow'}`}
                      >
                        <span className="text-lg">{PAYMENT_METHOD_EMOJI[method] || '💳'}</span>
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Confirm */}
          <div style={{ width: '25%' }} className="px-[22px] pt-2 pb-32">
            <p className="text-[12px] text-ink-40 uppercase tracking-[0.1em] font-semibold mb-4">Confirm</p>
            {/* Summary chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-4 py-2 rounded-full bg-accent text-white text-[14px] font-semibold">
                {displaySign}{evalResult?.toFixed(2)}
              </span>
              {category && (
                <span className="px-4 py-2 rounded-full bg-paper card-shadow text-[14px] text-ink font-medium">
                  {CATEGORY_EMOJI[category] || '📦'} {category}
                </span>
              )}
              {paymentMethod && (
                <span className="px-4 py-2 rounded-full bg-paper card-shadow text-[14px] text-ink font-medium">
                  {PAYMENT_METHOD_EMOJI[paymentMethod] || '💳'} {paymentMethod}
                </span>
              )}
            </div>
            <Card pad="p-1" className="overflow-hidden mb-4">
              <label className="flex items-center justify-between px-[14px] py-[14px] border-b border-cream-2 cursor-pointer">
                <span className="text-[13px] text-ink-50">Date</span>
                <span className="text-[13.5px] text-ink font-medium">
                  {formatDate(date)}
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="sr-only" />
                </span>
              </label>
              <div className="flex items-center justify-between px-[14px] py-[14px] border-b border-cream-2">
                <span className="text-[13px] text-ink-50">Notes</span>
                <input type="text" placeholder="Add a note" value={notes} onChange={e => setNotes(e.target.value)}
                  className="bg-transparent text-[13.5px] text-ink text-right focus:outline-none placeholder-ink-30 max-w-[200px]" />
              </div>
              <div className="flex items-center justify-between px-[14px] py-[14px]">
                <span className="text-[13px] text-ink-50">Save as recurring</span>
                <button type="button" onClick={() => setRecurring(r => !r)}
                  className={`w-[38px] h-[22px] rounded-full transition-colors relative ${recurring ? 'bg-accent' : 'bg-cream-2'}`}>
                  <span className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${recurring ? 'left-[18px]' : 'left-[2px]'}`} />
                </button>
              </div>
            </Card>
            {error && <p className="text-rose text-[13px] mb-4">{error}</p>}
          </div>

        </div>
      </div>

      {/* Fixed bottom button — only on step 0 (Next) and step 3 (Log it) */}
      {(step === 0 || step === 3) && (
        <div className="fixed bottom-[78px] left-0 right-0 max-w-[440px] mx-auto px-[22px] pt-[14px] pb-3 z-10"
             style={{ background: 'linear-gradient(to top, #faf6ef 60%, transparent)' }}>
          {step === 0 && (
            <button type="button" onClick={() => go(1)} disabled={!evalResult}
              className="w-full rounded-squircle py-[17px] text-base font-semibold bg-ink text-paper disabled:opacity-25 transition-all"
              style={{ boxShadow: evalResult ? '0 8px 22px -10px rgba(60,40,20,0.45)' : undefined }}>
              Next →
            </button>
          )}
          {step === 3 && (
            <button type="button" onClick={handleSubmit} disabled={loading || !evalResult || !category || !paymentMethod}
              className="w-full rounded-squircle py-[17px] text-base font-semibold bg-ink text-paper disabled:opacity-25 transition-all"
              style={{ boxShadow: '0 8px 22px -10px rgba(60,40,20,0.45)' }}>
              {loading ? 'Logging…' : 'Log it'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
