'use client'
import { useState, useRef, useEffect } from 'react'
import CategoryPills from './CategoryPills'
import PaymentPills from './PaymentPills'
import RecentExpenses from './RecentExpenses'
import Card from './ui/Card'
import Label from './ui/Label'
import Pill from './ui/Pill'
import { ExpenseType, Expense } from '@/lib/types'
import { HKD_TO_GBP } from '@/lib/constants'

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

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  if (d.getTime() === today.getTime()) return 'Today'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function LogForm() {
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'GBP' | 'HKD'>('GBP')
  const [type, setType] = useState<ExpenseType>('expense')
  const [categories, setCategories] = useState<string[]>(lastCategories)
  const [paymentMethods, setPaymentMethods] = useState<string[]>(lastPaymentMethods)
  const [notes, setNotes] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  // AI quick-add
  const [aiText, setAiText] = useState('')
  const [aiParsing, setAiParsing] = useState(false)
  const [aiResult, setAiResult] = useState<{amount?: number; currency?: 'GBP'|'HKD'; categories?: string[]; payment_methods?: string[]; notes?: string} | null>(null)
  const [padVisible, setPadVisible] = useState(true)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => { amountRef.current?.focus() }, [])

  function padPress(key: string) {
    if (key === '⌫') {
      setAmount(a => a.slice(0, -1))
    } else if (key === 'C') {
      setAmount('')
    } else {
      setAmount(a => a + key)
    }
  }

  // Debounce AI parse
  useEffect(() => {
    if (!aiText.trim()) { setAiResult(null); return }
    const controller = new AbortController()
    const t = setTimeout(async () => {
      setAiParsing(true)
      try {
        const res = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiText }),
          signal: controller.signal,
        })
        if (res.ok) setAiResult(await res.json())
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error('parse error', err)
      } finally {
        setAiParsing(false)
      }
    }, 400)
    return () => { clearTimeout(t); controller.abort() }
  }, [aiText])

  function applyAiResult() {
    if (!aiResult) return
    if (aiResult.amount != null) setAmount(String(aiResult.amount))
    if (aiResult.currency) setCurrency(aiResult.currency)
    if (aiResult.categories?.length) setCategories(aiResult.categories)
    if (aiResult.payment_methods?.length) setPaymentMethods(aiResult.payment_methods)
    if (aiResult.notes) setNotes(aiResult.notes)
    setAiText('')
    setAiResult(null)
  }

  function prefill(e: Expense) {
    setAmount(String(e.amount))
    setCurrency(e.currency)
    setType(e.type)
    setCategories(e.categories)
    setPaymentMethods(e.payment_methods)
    setNotes(e.notes || '')
    setRecurring(false)
    amountRef.current?.focus()
  }

  const evalResult = evalAmount(amount)
  const isValid = evalResult !== null && categories.length > 0 && paymentMethods.length > 0

  const gbpPreview = (() => {
    if (!evalResult) return ''
    if (currency === 'HKD') return `≈ £${(evalResult * HKD_TO_GBP).toFixed(2)}`
    return `≈ HK$${(evalResult / HKD_TO_GBP).toFixed(0)}`
  })()

  const displaySign = currency === 'GBP' ? '£' : 'HK$'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || evalResult === null) return
    setLoading(true); setError('')
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: evalResult, currency, type, categories, payment_methods: paymentMethods, notes, recurring, date }),
    })
    setLoading(false)
    if (res.ok) {
      lastCategories = categories; lastPaymentMethods = paymentMethods
      setSuccess(true); setRefreshKey(k => k + 1)
      setTimeout(() => {
        setSuccess(false); setAmount(''); setNotes(''); setRecurring(false)
        setCategories(lastCategories); setPaymentMethods(lastPaymentMethods)
        amountRef.current?.focus()
      }, 1500)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Hero amount */}
      <div className="px-[22px] pt-[14px] pb-[22px]">
        <Label>Amount</Label>
        <div className="flex items-baseline gap-3 mt-2.5">
          <div className="flex items-baseline">
            <span className="font-display font-light opacity-50 mr-1" style={{ fontSize: 37 }}>{displaySign}</span>
            <input
              ref={amountRef}
              type="text"
              inputMode="none"
              readOnly
              placeholder="0"
              value={amount}
              onFocus={() => setPadVisible(true)}
              className="bg-transparent font-display placeholder-ink-30 focus:outline-none text-ink caret-accent"
              style={{ fontSize: 68, lineHeight: 1, width: `${Math.max(1, amount.length || 1)}ch` }}
            />
          </div>
          {gbpPreview && (
            <span className="text-[13px] text-ink-40 tabular-nums">{gbpPreview}</span>
          )}
        </div>
        {/* Currency + type pills */}
        <div className="flex items-center gap-2 mt-[14px]">
          <Pill on={currency === 'GBP'} tone="accent" size="sm" onClick={() => setCurrency('GBP')}>£ GBP</Pill>
          <Pill on={currency === 'HKD'} tone="accent" size="sm" onClick={() => setCurrency('HKD')}>HK$ HKD</Pill>
          <span className="flex-1" />
          <Pill on={type === 'expense'} size="sm" onClick={() => setType('expense')}>Expense</Pill>
          <Pill on={type === 'refund' || type === 'cashback'} size="sm" onClick={() => setType(type === 'refund' ? 'cashback' : 'refund')}>Refund</Pill>
        </div>
      </div>

      {/* Calculator pad */}
      {padVisible && (
        <div className="px-[22px] pb-4">
          {(() => {
            const keys = [
              '7', '8', '9', '⌫',
              '4', '5', '6', '+',
              '1', '2', '3', '-',
              'C', '0', '.', '',
            ]
            return (
              <div className="grid grid-cols-4 gap-2">
                {keys.map((k, i) => {
                  if (k === '') return <div key={i} />
                  const isOp = k === '+' || k === '-'
                  const isDel = k === '⌫' || k === 'C'
                  return (
                    <button
                      key={k + i}
                      type="button"
                      onClick={() => padPress(k)}
                      className={`h-12 rounded-[14px] text-[18px] font-medium transition-colors active:scale-95
                        ${isOp ? 'bg-accent/10 text-accent font-semibold' : ''}
                        ${isDel ? 'bg-cream-2 text-ink-50 text-[16px]' : ''}
                        ${!isOp && !isDel ? 'bg-paper text-ink card-shadow' : ''}`}
                    >
                      {k}
                    </button>
                  )
                })}
              </div>
            )
          })()}
          {evalResult && /[+\-]/.test(amount) && (
            <p className="text-center text-[13px] text-ink-40 tabular-nums mt-2">= {displaySign}{evalResult.toFixed(2)}</p>
          )}
        </div>
      )}

      {/* AI quick-add */}
      <div className="px-[22px] pb-[18px]">
        <Card pad="p-[14px]" className={aiResult ? 'bg-cream-2' : ''}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-accent text-white grid place-items-center text-sm font-semibold shadow-sm flex-shrink-0">
              ✦
            </div>
            <input
              type="text"
              placeholder={'Type or speak — "11.50 oat latte hsbc"'}
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-ink placeholder-ink-40"
            />
            <span className="text-ink-40 text-base">{aiParsing ? '…' : '🎙'}</span>
          </div>
          {aiResult && (
            <div className="mt-3 pt-3 border-t border-dashed border-cream-3">
              <p className="text-[11px] text-ink-40 mb-2">Detected — tap to confirm</p>
              <div className="flex flex-wrap gap-1.5">
                {aiResult.amount && (
                  <Pill on size="sm" tone="accent" onClick={applyAiResult}>
                    {aiResult.currency === 'HKD' ? 'HK$' : '£'}{aiResult.amount}
                  </Pill>
                )}
                {aiResult.categories?.map(c => (
                  <Pill key={c} on size="sm" onClick={applyAiResult}>{c}</Pill>
                ))}
                {aiResult.payment_methods?.map(p => (
                  <Pill key={p} on size="sm" onClick={applyAiResult}>{p}</Pill>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Category */}
      <div className="px-[22px] pb-[18px]">
        <Label className="mb-2.5">Category</Label>
        <CategoryPills value={categories} onChange={setCategories} />
      </div>

      {/* Payment */}
      <div className="px-[22px] pb-[18px]">
        <Label className="mb-2.5">Payment</Label>
        <PaymentPills value={paymentMethods} onChange={setPaymentMethods} />
      </div>

      {/* Settings card */}
      <div className="px-[22px] pb-[18px]">
        <Card pad="p-1" className="overflow-hidden">
          {/* Date row */}
          <label className="flex items-center justify-between px-[14px] py-[14px] border-b border-cream-2 cursor-pointer">
            <span className="text-[13px] text-ink-50">Date</span>
            <span className="text-[13.5px] text-ink font-medium">
              {formatDate(date)}
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="sr-only" />
            </span>
          </label>
          {/* Notes row */}
          <div className="flex items-center justify-between px-[14px] py-[14px] border-b border-cream-2">
            <span className="text-[13px] text-ink-50">Notes</span>
            <input
              type="text"
              placeholder="Add a note"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="bg-transparent text-[13.5px] text-ink text-right focus:outline-none placeholder-ink-30 max-w-[200px]"
            />
          </div>
          {/* Recurring row */}
          <div className="flex items-center justify-between px-[14px] py-[14px] border-b border-cream-2">
            <span className="text-[13px] text-ink-50">Save as recurring</span>
            <button
              type="button"
              onClick={() => setRecurring(r => !r)}
              className={`w-[38px] h-[22px] rounded-full transition-colors relative ${recurring ? 'bg-accent' : 'bg-cream-2'}`}
            >
              <span className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${recurring ? 'left-[18px]' : 'left-[2px]'}`} />
            </button>
          </div>
        </Card>
      </div>

      {error && <p className="text-rose text-sm px-[22px] mb-4">{error}</p>}

      <RecentExpenses refreshKey={refreshKey} onPrefill={prefill} />

      {/* Sticky CTA */}
      <div className="fixed bottom-[78px] left-0 right-0 max-w-[440px] mx-auto px-[22px] pt-[14px] pb-3"
           style={{ background: 'linear-gradient(to top, #faf6ef 60%, rgba(250,246,239,0))' }}>
        <button
          type="submit"
          disabled={loading || !isValid}
          className={`w-full rounded-squircle py-[17px] text-base font-semibold tracking-[-0.01em] transition-all
            ${success ? 'bg-sage text-white' : 'bg-ink text-paper disabled:opacity-25'}`}
          style={{ boxShadow: isValid ? '0 8px 22px -10px rgba(60,40,20,0.45)' : undefined }}
        >
          {success ? '✓ Logged' : loading ? 'Logging…' : 'Log it'}
        </button>
      </div>
    </form>
  )
}
