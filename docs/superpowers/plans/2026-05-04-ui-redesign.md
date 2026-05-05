# UI Redesign — Japanese Minimalist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the expense tracker UI to a warm, Japanese-minimalist aesthetic — off-white background, thin typography, emoji category/card icons, divider-based layout with no heavy card borders.

**Architecture:** Pure visual changes across existing components. No new files needed except updating `constants.ts` to add emoji maps, and updating all component/page files to apply the new design language.

**Tech Stack:** Next.js 14, Tailwind CSS, existing Recharts.

---

## Files Modified

- `lib/constants.ts` — add `CATEGORY_EMOJI` and `CARD_EMOJI` maps
- `app/layout.tsx` — update background to `#faf9f7`
- `app/globals.css` — add custom bg colour
- `components/CategoryPills.tsx` — emoji pills, new selected style
- `components/CardPills.tsx` — emoji pills, new selected style
- `components/LogForm.tsx` — full layout redesign (dividers, thin amount, inline date, currency toggle)
- `components/MonthPicker.tsx` — replace with arrow-based month navigator
- `components/SpendingChart.tsx` — stone palette, remove axis lines
- `components/AnalysisCard.tsx` — no border, white bg only
- `app/page.tsx` — updated header styling
- `app/overview/page.tsx` — full layout redesign (no card wrappers, divider rows)

---

## Task 1: Add Emoji Maps to Constants

**Files:**
- Modify: `lib/constants.ts`

- [ ] **Step 1: Replace `lib/constants.ts`**

```ts
export const HKD_TO_GBP = 0.1 // hardcoded: 10 HKD = 1 GBP

export const CATEGORIES = [
  'Food & Drink',
  'Groceries',
  'Transport',
  'Bills & Utilities',
  'Shopping',
  'Health & Beauty',
  'Entertainment',
  'Investment / ISA',
  'Travel',
  'Other',
] as const

export const CATEGORY_EMOJI: Record<string, string> = {
  'Food & Drink': '🍜',
  'Groceries': '🛒',
  'Transport': '🚇',
  'Bills & Utilities': '💡',
  'Shopping': '🛍️',
  'Health & Beauty': '🌿',
  'Entertainment': '🎬',
  'Investment / ISA': '📈',
  'Travel': '✈️',
  'Other': '📦',
}

export const CARDS = [
  'HK Card (HSBC HK)',
  'Barclaycard Avios',
  'Amex',
  'Chase',
  'Klarna',
  'Cash',
] as const

export const CARD_EMOJI: Record<string, string> = {
  'HK Card (HSBC HK)': '🏦',
  'Barclaycard Avios': '✈️',
  'Amex': '💳',
  'Chase': '🐇',
  'Klarna': '🛍️',
  'Cash': '💵',
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: add emoji maps for categories and cards"
```

---

## Task 2: Update Background Colour

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  -webkit-tap-highlight-color: transparent;
  background-color: #faf9f7;
}

body {
  background-color: #faf9f7;
}
```

- [ ] **Step 2: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Personal expense tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-gray-900 min-h-screen`} style={{ backgroundColor: '#faf9f7' }}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "design: warm off-white background"
```

---

## Task 3: Redesign CategoryPills

**Files:**
- Modify: `components/CategoryPills.tsx`

- [ ] **Step 1: Replace `components/CategoryPills.tsx`**

```tsx
'use client'
import { CATEGORIES, CATEGORY_EMOJI } from '@/lib/constants'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function CategoryPills({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ${
            value === cat
              ? 'bg-stone-800 text-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span>{CATEGORY_EMOJI[cat]}</span>
          <span>{cat}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CategoryPills.tsx
git commit -m "design: emoji category pills, minimalist style"
```

---

## Task 4: Redesign CardPills

**Files:**
- Modify: `components/CardPills.tsx`

- [ ] **Step 1: Replace `components/CardPills.tsx`**

```tsx
'use client'
import { CARDS, CARD_EMOJI } from '@/lib/constants'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function CardPills({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CARDS.map(card => (
        <button
          key={card}
          type="button"
          onClick={() => onChange(card)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ${
            value === card
              ? 'bg-stone-800 text-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span>{CARD_EMOJI[card]}</span>
          <span>{card}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CardPills.tsx
git commit -m "design: emoji card pills, minimalist style"
```

---

## Task 5: Redesign LogForm

**Files:**
- Modify: `components/LogForm.tsx`

- [ ] **Step 1: Replace `components/LogForm.tsx`**

```tsx
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
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-5xl font-thin text-gray-200 pointer-events-none">
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
        {/* Currency toggle */}
        <div className="flex items-center gap-3 mt-3 pl-1">
          {(['GBP', 'HKD'] as const).map((c, i) => (
            <>
              {i > 0 && <span key={`dot-${c}`} className="text-gray-200 text-xs">·</span>}
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`text-sm font-medium transition-colors ${
                  currency === c ? 'text-stone-800' : 'text-gray-300'
                }`}
              >
                {c}
              </button>
            </>
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/LogForm.tsx
git commit -m "design: minimalist log form with dividers, thin amount, inline date"
```

---

## Task 6: Redesign Log Page Header

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
export const dynamic = 'force-dynamic'
import LogForm from '@/components/LogForm'
import Link from 'next/link'

export default function LogPage() {
  return (
    <div className="min-h-screen pb-16">
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <h1 className="text-base font-medium text-gray-900">Expenses</h1>
        <Link
          href="/overview"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Overview →
        </Link>
      </div>
      <div className="px-5">
        <LogForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "design: minimal log page header"
```

---

## Task 7: Replace MonthPicker with Arrow Navigator

**Files:**
- Modify: `components/MonthPicker.tsx`

- [ ] **Step 1: Replace `components/MonthPicker.tsx`**

```tsx
'use client'

interface Props {
  value: string // "YYYY-MM"
  onChange: (v: string) => void
}

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(ym: string): string {
  return new Date(`${ym}-15`).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

export default function MonthPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <button
        type="button"
        onClick={() => onChange(addMonths(value, -1))}
        className="text-gray-300 hover:text-gray-600 px-3 py-2 text-lg transition-colors"
      >
        ‹
      </button>
      <span className="text-sm text-gray-500 min-w-[140px] text-center">
        {formatMonth(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(addMonths(value, 1))}
        className="text-gray-300 hover:text-gray-600 px-3 py-2 text-lg transition-colors"
      >
        ›
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/MonthPicker.tsx
git commit -m "design: arrow-based month navigator"
```

---

## Task 8: Update SpendingChart to Stone Palette

**Files:**
- Modify: `components/SpendingChart.tsx`

- [ ] **Step 1: Replace `components/SpendingChart.tsx`**

```tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: { name: string; amount: number }[]
}

export default function SpendingChart({ data }: Props) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#d1d5db', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={55}
        />
        <YAxis
          tick={{ fill: '#d1d5db', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 8, boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)' }}
          labelStyle={{ color: '#374151', fontSize: 12 }}
          itemStyle={{ color: '#9ca3af', fontSize: 12 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`£${Number(v).toFixed(2)}`, '']}
        />
        <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#292524' : '#e7e5e4'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SpendingChart.tsx
git commit -m "design: stone palette chart, minimal axes"
```

---

## Task 9: Update AnalysisCard

**Files:**
- Modify: `components/AnalysisCard.tsx`

- [ ] **Step 1: Replace `components/AnalysisCard.tsx`**

```tsx
interface Props {
  text: string
}

export default function AnalysisCard({ text }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 mt-2">
      <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Analysis</p>
      <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{text}</div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AnalysisCard.tsx
git commit -m "design: borderless analysis card"
```

---

## Task 10: Redesign Overview Page

**Files:**
- Modify: `app/overview/page.tsx`

- [ ] **Step 1: Replace `app/overview/page.tsx`**

```tsx
'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Expense } from '@/lib/types'
import { CATEGORY_EMOJI, CARD_EMOJI } from '@/lib/constants'
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

  return (
    <div className="min-h-screen pb-16 px-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-14 pb-2">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Log
        </Link>
        <h1 className="text-base font-medium text-gray-900">Overview</h1>
        <div className="w-10" />
      </div>

      {/* Month selector */}
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
            <div className="space-y-0">
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
          </div>

          {/* By card */}
          <div className="py-5 border-b border-gray-100">
            <p className="text-xs text-gray-300 uppercase tracking-widest mb-4">By Card</p>
            <div className="space-y-0">
              {Object.entries(byCard)
                .sort((a, b) => b[1] - a[1])
                .map(([card, amount], i, arr) => (
                  <div
                    key={card}
                    className={`flex items-center justify-between py-3 ${
                      i < arr.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-600">
                      {CARD_EMOJI[card] || '💳'} {card}
                    </span>
                    <span className="text-sm text-gray-900 font-medium">£{amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Analyse */}
          {!analysis && (
            <div className="py-5">
              <button
                onClick={analyse}
                disabled={analysing}
                className="w-full border border-gray-200 text-gray-400 rounded-2xl py-4 text-sm transition-all hover:border-gray-300 hover:text-gray-500 disabled:opacity-50"
              >
                {analysing ? 'Analysing…' : '✦ Analyse this month'}
              </button>
            </div>
          )}
          {analysis && (
            <div className="py-5">
              <AnalysisCard text={analysis} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/overview/page.tsx
git commit -m "design: minimalist overview page with divider rows and arrow month nav"
```

---

## Task 11: Final Push

- [ ] **Step 1: Push to GitHub**

```bash
git push
```

Expected: `main -> main` pushed to GitHub, Vercel auto-deploys.
