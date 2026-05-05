# Expense Tracker Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-select categories + payment methods, schema migration, validation, overview updates, PWA support, and mobile UX improvements to the expense tracker.

**Architecture:** The DB schema migrates `category`/`card` text columns to `categories`/`payment_methods` text[] arrays. All components switch from single-string state to string-array state. The PWA is implemented via Next.js App Router metadata + a static service worker. Mobile UX improvements (auto-focus, sticky button, memory) are client-side only.

**Tech Stack:** Next.js 14 App Router, Supabase postgres, Tailwind CSS, TypeScript.

---

## Files Map

```
lib/constants.ts              — add PAYMENT_METHODS, PAYMENT_METHOD_GROUPS, PAYMENT_METHOD_EMOJI
lib/types.ts                  — update Expense: categories string[], payment_methods string[]
components/CategoryPills.tsx  — multi-select (string[] value/onChange)
components/PaymentPills.tsx   — NEW: replaces CardPills, grouped layout, multi-select
components/LogForm.tsx        — arrays state, sticky button, auto-focus, memory, success anim
app/api/expenses/route.ts     — accept categories[], payment_methods[], validate arrays
app/overview/page.tsx         — flatten arrays for breakdown aggregation
app/layout.tsx                — PWA meta tags
app/page.tsx                  — no change needed
public/manifest.json          — NEW: PWA manifest
public/sw.js                  — NEW: service worker
public/icons/icon-192.png     — NOTE: placeholder, user must supply real icons
public/icons/icon-512.png     — NOTE: placeholder, user must supply real icons
```

---

## Supabase SQL Migration

Run this in Supabase SQL Editor **before** deploying the new code:

```sql
-- Add new array columns
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_methods text[] NOT NULL DEFAULT '{}';

-- Migrate existing data from old single-value columns
UPDATE expenses SET categories = ARRAY[category] WHERE category IS NOT NULL AND categories = '{}';
UPDATE expenses SET payment_methods = ARRAY[card] WHERE card IS NOT NULL AND payment_methods = '{}';

-- Drop old columns (only after confirming data migrated)
-- Run this separately after verifying the UPDATE above worked:
-- ALTER TABLE expenses DROP COLUMN IF EXISTS category;
-- ALTER TABLE expenses DROP COLUMN IF EXISTS card;
```

> **Important:** Drop the old columns only after the new code is deployed and verified.

---

## Task 1: Update Constants

**Files:**
- Modify: `lib/constants.ts`

- [ ] **Step 1: Replace `lib/constants.ts`**

```ts
export const HKD_TO_GBP = 0.1

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

export const PAYMENT_METHOD_GROUPS: { label: string; methods: string[] }[] = [
  {
    label: 'HK Cards',
    methods: [
      'HSBC HK Red Card',
      'HSBC HK Signature Card',
      'Mox',
    ],
  },
  {
    label: 'UK Cards',
    methods: [
      'Barclaycard Avios',
      'Amex',
      'Chase',
    ],
  },
  {
    label: 'Other',
    methods: [
      'Klarna',
      'Cash',
      'Direct Debit',
      'PayPal',
    ],
  },
]

export const PAYMENT_METHODS: string[] = PAYMENT_METHOD_GROUPS.flatMap(g => g.methods)

export const PAYMENT_METHOD_EMOJI: Record<string, string> = {
  'HSBC HK Red Card': '🏦',
  'HSBC HK Signature Card': '🏦',
  'Mox': '🟣',
  'Barclaycard Avios': '✈️',
  'Amex': '💳',
  'Chase': '🐇',
  'Klarna': '🛍️',
  'Cash': '💵',
  'Direct Debit': '🏛️',
  'PayPal': '🅿️',
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: update constants for payment method groups and multi-select"
```

---

## Task 2: Update Types

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Replace `lib/types.ts`**

```ts
export interface Expense {
  id: string
  amount: number
  currency: 'GBP' | 'HKD'
  amount_gbp: number
  categories: string[]
  payment_methods: string[]
  date: string
  created_at: string
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: update Expense type to use categories[] and payment_methods[]"
```

---

## Task 3: Update CategoryPills for Multi-Select

**Files:**
- Modify: `components/CategoryPills.tsx`

- [ ] **Step 1: Replace `components/CategoryPills.tsx`**

```tsx
'use client'
import { CATEGORIES, CATEGORY_EMOJI } from '@/lib/constants'

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export default function CategoryPills({ value, onChange }: Props) {
  function toggle(cat: string) {
    if (value.includes(cat)) {
      onChange(value.filter(c => c !== cat))
    } else {
      onChange([...value, cat])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          type="button"
          onClick={() => toggle(cat)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ${
            value.includes(cat)
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
git commit -m "feat: multi-select category pills"
```

---

## Task 4: Create PaymentPills (replaces CardPills)

**Files:**
- Create: `components/PaymentPills.tsx`

- [ ] **Step 1: Create `components/PaymentPills.tsx`**

```tsx
'use client'
import { PAYMENT_METHOD_GROUPS, PAYMENT_METHOD_EMOJI } from '@/lib/constants'

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export default function PaymentPills({ value, onChange }: Props) {
  function toggle(method: string) {
    if (value.includes(method)) {
      onChange(value.filter(m => m !== method))
    } else {
      onChange([...value, method])
    }
  }

  return (
    <div className="space-y-4">
      {PAYMENT_METHOD_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-xs text-gray-300 uppercase tracking-widest mb-2">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.methods.map(method => (
              <button
                key={method}
                type="button"
                onClick={() => toggle(method)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ${
                  value.includes(method)
                    ? 'bg-stone-800 text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>{PAYMENT_METHOD_EMOJI[method]}</span>
                <span>{method}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PaymentPills.tsx
git commit -m "feat: grouped multi-select payment method pills"
```

---

## Task 5: Update API Route

**Files:**
- Modify: `app/api/expenses/route.ts`

- [ ] **Step 1: Replace `app/api/expenses/route.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import { HKD_TO_GBP } from '@/lib/constants'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { amount, currency, categories, payment_methods, date } = body

  if (!amount || !currency || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json({ error: 'Select at least one category' }, { status: 400 })
  }
  if (!Array.isArray(payment_methods) || payment_methods.length === 0) {
    return NextResponse.json({ error: 'Select at least one payment method' }, { status: 400 })
  }

  const amount_gbp = currency === 'HKD' ? amount * HKD_TO_GBP : amount

  const { data, error } = await supabase.from('expenses').insert({
    amount: parseFloat(amount),
    currency,
    amount_gbp,
    categories,
    payment_methods,
    date,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/expenses/route.ts
git commit -m "feat: API accepts categories[] and payment_methods[]"
```

---

## Task 6: Rewrite LogForm

**Files:**
- Modify: `components/LogForm.tsx`

- [ ] **Step 1: Replace `components/LogForm.tsx`**

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import CategoryPills from './CategoryPills'
import PaymentPills from './PaymentPills'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/constants'

// In-memory last-used selections (persists within a browser session)
let lastCategories: string[] = [CATEGORIES[0]]
let lastPaymentMethods: string[] = [PAYMENT_METHODS[0]]

export default function LogForm() {
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'GBP' | 'HKD'>('GBP')
  const [categories, setCategories] = useState<string[]>(lastCategories)
  const [paymentMethods, setPaymentMethods] = useState<string[]>(lastPaymentMethods)
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const amountRef = useRef<HTMLInputElement>(null)

  // Auto-focus amount input on mount
  useEffect(() => {
    amountRef.current?.focus()
  }, [])

  const isValid = amount && parseFloat(amount) > 0 && categories.length > 0 && paymentMethods.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(amount),
        currency,
        categories,
        payment_methods: paymentMethods,
        date,
      }),
    })

    setLoading(false)
    if (res.ok) {
      // Save last-used selections in memory
      lastCategories = categories
      lastPaymentMethods = paymentMethods

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setAmount('')
        // Pre-select last used
        setCategories(lastCategories)
        setPaymentMethods(lastPaymentMethods)
        // Re-focus for next entry
        amountRef.current?.focus()
      }, 1500)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
  }

  const gbpPreview = currency === 'HKD' && amount
    ? `≈ £${(parseFloat(amount) * 0.1).toFixed(2)}`
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/LogForm.tsx
git commit -m "feat: multi-select categories+payment, sticky button, auto-focus, memory"
```

---

## Task 7: Update Overview Page

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

  const total = expenses.reduce((s, e) => s + e.amount_gbp, 0)

  // Flatten categories array per expense, split amount_gbp equally across selected categories
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    const cats = e.categories ?? []
    const share = cats.length > 0 ? e.amount_gbp / cats.length : e.amount_gbp
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
    const share = methods.length > 0 ? e.amount_gbp / methods.length : e.amount_gbp
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/overview/page.tsx
git commit -m "feat: overview reads categories[] and payment_methods[] arrays"
```

---

## Task 8: PWA — Manifest + Meta Tags

**Files:**
- Create: `public/manifest.json`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `public/manifest.json`**

```json
{
  "name": "Expenses",
  "short_name": "Expenses",
  "description": "Personal expense tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#faf9f7",
  "theme_color": "#faf9f7",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: Create placeholder icons directory**

```bash
mkdir -p /Users/debtsoi/expense-tracker/public/icons
```

Generate two simple placeholder PNG icons (192×192 and 512×512) using Node:

```bash
cd /Users/debtsoi/expense-tracker && node -e "
const { createCanvas } = require('canvas');
// install canvas if needed: npm install canvas
" 2>/dev/null || true
```

Since `canvas` may not be installed, create the icons using a simple script that writes minimal valid PNGs:

```bash
cd /Users/debtsoi/expense-tracker && node << 'EOF'
// Minimal 1x1 PNG, we'll use a simple approach
const fs = require('fs');
// Create a simple SVG-based icon as a data placeholder
// Real icons should be replaced before production launch
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#292524"/>
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="white">£</text>
</svg>`;
fs.writeFileSync('public/icons/icon.svg', svgIcon);
console.log('SVG icon created at public/icons/icon.svg');
console.log('NOTE: Convert to 192x192 and 512x512 PNGs before production.');
EOF
```

> **Note for user:** The app will work as a PWA with the SVG, but for proper iOS home screen icons you need PNG files. Use [realfavicongenerator.net](https://realfavicongenerator.net) to generate `icon-192.png` and `icon-512.png` from the SVG, then place them in `public/icons/`.

- [ ] **Step 3: Update `app/layout.tsx` with PWA meta tags**

```tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#faf9f7',
}

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Personal expense tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Expenses',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
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

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add public/ app/layout.tsx
git commit -m "feat: PWA manifest and iOS meta tags"
```

---

## Task 9: Service Worker

**Files:**
- Create: `public/sw.js`
- Create: `app/sw-register.tsx` (client component to register SW)
- Modify: `app/layout.tsx` (import sw-register)

- [ ] **Step 1: Create `public/sw.js`**

```js
const CACHE_NAME = 'expenses-v1';
const STATIC_ASSETS = ['/', '/overview'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only cache GET requests, skip Supabase/API calls
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
```

- [ ] **Step 2: Create `app/sw-register.tsx`**

```tsx
'use client'
import { useEffect } from 'react'

export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
```

- [ ] **Step 3: Update `app/layout.tsx` to include SwRegister**

```tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SwRegister from './sw-register'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#faf9f7',
}

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Personal expense tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Expenses',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-gray-900 min-h-screen`} style={{ backgroundColor: '#faf9f7' }}>
        <SwRegister />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add public/sw.js app/sw-register.tsx app/layout.tsx
git commit -m "feat: service worker for PWA offline caching"
```

---

## Task 10: Final Push + Migration Instructions

- [ ] **Step 1: Push to GitHub**

```bash
git push
```

Expected: Vercel auto-deploys.

- [ ] **Step 2: Run migration in Supabase**

In Supabase dashboard → SQL Editor, run:

```sql
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_methods text[] NOT NULL DEFAULT '{}';

UPDATE expenses SET categories = ARRAY[category] WHERE category IS NOT NULL AND categories = '{}';
UPDATE expenses SET payment_methods = ARRAY[card] WHERE card IS NOT NULL AND payment_methods = '{}';
```

Then verify the data looks correct before optionally dropping old columns:

```sql
SELECT id, category, card, categories, payment_methods FROM expenses LIMIT 5;
```

- [ ] **Step 3: Install on iPhone**

After Vercel deploy is live:
1. Open the app URL in Safari on iPhone
2. Tap the Share button → "Add to Home Screen"
3. Tap Add — the app opens full screen like a native app

---

## Self-Review Notes

- ✅ Multi-select categories (Task 3) — `string[]` value/onChange
- ✅ Payment methods renamed, grouped, multi-select (Task 4)
- ✅ DB schema migration SQL provided (Task 10)
- ✅ Validation: button disabled unless amount + categories.length > 0 + paymentMethods.length > 0 (Task 6)
- ✅ Overview flattens arrays with equal-split attribution (Task 7)
- ✅ PWA manifest + iOS meta tags (Task 8)
- ✅ Service worker (Task 9)
- ✅ Auto-focus amount on mount (Task 6)
- ✅ In-memory last-used selections (Task 6)
- ✅ Success animation + auto-reset + re-focus (Task 6)
- ✅ Sticky Log It button (Task 6)
- ✅ `CARD_EMOJI` removed from constants and replaced with `PAYMENT_METHOD_EMOJI` (Task 1)
- ✅ Old `CardPills` no longer imported anywhere after Task 6 replaces LogForm
