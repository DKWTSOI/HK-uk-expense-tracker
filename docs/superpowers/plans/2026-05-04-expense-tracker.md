# Expense Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first personal expense tracker with Next.js 14, Supabase auth, a log page, a monthly overview with Claude Haiku analysis.

**Architecture:** Next.js App Router with server components for data fetching and client components for interactive UI. Supabase handles Postgres storage and email auth with middleware-based route protection. Claude Haiku is called server-side from an API route to avoid exposing keys.

**Tech Stack:** Next.js 14, Supabase (postgres + auth), Tailwind CSS, Recharts (bar chart), Anthropic SDK, Vercel deployment.

---

## File Map

```
expense-tracker/
├── .env.local                          # secrets (gitignored)
├── .env.example                        # template
├── next.config.js
├── tailwind.config.ts
├── middleware.ts                        # Supabase auth middleware
├── app/
│   ├── layout.tsx                      # root layout, dark mode
│   ├── globals.css
│   ├── auth/
│   │   └── page.tsx                    # sign-in page
│   ├── page.tsx                        # / log page (client component)
│   └── overview/
│       └── page.tsx                    # /overview (server + client)
├── components/
│   ├── LogForm.tsx                     # full log form (client)
│   ├── CategoryPills.tsx               # reusable pill selector
│   ├── CardPills.tsx                   # reusable pill selector
│   ├── MonthPicker.tsx                 # month selector
│   ├── SpendingChart.tsx               # Recharts bar chart (client)
│   └── AnalysisCard.tsx               # AI response display
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # browser Supabase client
│   │   └── server.ts                   # server Supabase client
│   ├── constants.ts                    # categories, cards, HKD rate
│   └── types.ts                        # Expense type
└── app/api/
    ├── expenses/
    │   └── route.ts                    # POST /api/expenses
    └── analyse/
        └── route.ts                    # POST /api/analyse
```

---

## Supabase SQL (run in Supabase dashboard → SQL Editor)

```sql
CREATE TABLE expenses (
  id uuid default gen_random_uuid() primary key,
  amount float not null,
  currency text not null default 'GBP',
  amount_gbp float not null,
  category text not null,
  card text not null,
  date date not null default current_date,
  created_at timestamp default now()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (single-user app)
CREATE POLICY "auth users can do everything" ON expenses
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via npx)
- Create: `.env.example`
- Create: `tailwind.config.ts`
- Create: `next.config.js`

- [ ] **Step 1: Create Next.js app**

```bash
cd /Users/debtsoi/expense-tracker
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Expected: scaffold created, `package.json` present.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk recharts
npm install -D @types/node
```

- [ ] **Step 3: Create `.env.example`**

```bash
cat > .env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
EOF
```

- [ ] **Step 4: Create `.env.local`** (fill in real values from Supabase dashboard)

```bash
cp .env.example .env.local
# Then edit .env.local with real keys
```

- [ ] **Step 5: Update `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
}
export default config
```

- [ ] **Step 6: Update `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
```

- [ ] **Step 7: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold Next.js 14 app"
```

---

## Task 2: Types, Constants, Supabase Clients

**Files:**
- Create: `lib/types.ts`
- Create: `lib/constants.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```ts
export interface Expense {
  id: string
  amount: number
  currency: 'GBP' | 'HKD'
  amount_gbp: number
  category: string
  card: string
  date: string
  created_at: string
}
```

- [ ] **Step 2: Create `lib/constants.ts`**

```ts
export const HKD_TO_GBP = 0.1 // hardcoded, 10 HKD = 1 GBP

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

export const CARDS = [
  'HK Card (HSBC HK)',
  'Barclaycard Avios',
  'Amex',
  'Chase',
  'Klarna',
  'Cash',
] as const
```

- [ ] **Step 3: Create `lib/supabase/client.ts`**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Create `lib/supabase/server.ts`**

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/ && git commit -m "feat: add types, constants, supabase clients"
```

---

## Task 3: Auth Middleware + Sign-in Page

**Files:**
- Create: `middleware.ts`
- Create: `app/auth/page.tsx`

- [ ] **Step 1: Create `middleware.ts`**

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Create `app/auth/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-white mb-8 text-center">Expenses</h1>
        <form onSubmit={signIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder-zinc-500 text-base focus:outline-none focus:border-zinc-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder-zinc-500 text-base focus:outline-none focus:border-zinc-600"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-zinc-950 rounded-xl py-4 font-semibold text-base disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts app/auth/ && git commit -m "feat: add auth middleware and sign-in page"
```

---

## Task 4: Root Layout + Global Styles

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  -webkit-tap-highlight-color: transparent;
}
```

- [ ] **Step 2: Replace `app/layout.tsx`**

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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/globals.css && git commit -m "feat: dark layout and global styles"
```

---

## Task 5: Reusable Pill Components

**Files:**
- Create: `components/CategoryPills.tsx`
- Create: `components/CardPills.tsx`

- [ ] **Step 1: Create `components/CategoryPills.tsx`**

```tsx
'use client'
import { CATEGORIES } from '@/lib/constants'

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
          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
            value === cat
              ? 'bg-white text-zinc-950'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/CardPills.tsx`**

```tsx
'use client'
import { CARDS } from '@/lib/constants'

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
          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
            value === card
              ? 'bg-white text-zinc-950'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {card}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ && git commit -m "feat: category and card pill components"
```

---

## Task 6: POST /api/expenses Route

**Files:**
- Create: `app/api/expenses/route.ts`

- [ ] **Step 1: Create `app/api/expenses/route.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import { HKD_TO_GBP } from '@/lib/constants'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { amount, currency, category, card, date } = body

  if (!amount || !currency || !category || !card || !date) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const amount_gbp = currency === 'HKD' ? amount * HKD_TO_GBP : amount

  const { data, error } = await supabase.from('expenses').insert({
    amount: parseFloat(amount),
    currency,
    amount_gbp,
    category,
    card,
    date,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/ && git commit -m "feat: POST /api/expenses route"
```

---

## Task 7: Log Form Component

**Files:**
- Create: `components/LogForm.tsx`

- [ ] **Step 1: Create `components/LogForm.tsx`**

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
  const [category, setCategory] = useState(CATEGORIES[0])
  const [card, setCard] = useState(CARDS[0])
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

  const gbpPreview = currency === 'HKD'
    ? `≈ £${(parseFloat(amount || '0') * 0.1).toFixed(2)}`
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount */}
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
          {/* Currency toggle */}
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
        {gbpPreview && amount && (
          <p className="text-zinc-500 text-sm pl-1">{gbpPreview} GBP</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Category</label>
        <CategoryPills value={category} onChange={setCategory} />
      </div>

      {/* Card */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Card</label>
        <CardPills value={card} onChange={setCard} />
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base focus:outline-none focus:border-zinc-600 [color-scheme:dark]"
        />
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Submit */}
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
```

- [ ] **Step 2: Commit**

```bash
git add components/LogForm.tsx && git commit -m "feat: LogForm component with currency toggle and success flash"
```

---

## Task 8: Log Page (/)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import LogForm from '@/components/LogForm'
import Link from 'next/link'

export default function LogPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-6">
        <h1 className="text-xl font-semibold text-white">Log Expense</h1>
        <Link
          href="/overview"
          className="text-zinc-400 text-sm hover:text-white transition-colors"
        >
          Overview →
        </Link>
      </div>

      <div className="px-4">
        <LogForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx && git commit -m "feat: log page"
```

---

## Task 9: POST /api/analyse Route

**Files:**
- Create: `app/api/analyse/route.ts`

- [ ] **Step 1: Create `app/api/analyse/route.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { month } = await request.json() // e.g. "2026-05"

  const start = `${month}-01`
  const end = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0)
    .toISOString().split('T')[0]

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!expenses || expenses.length === 0) {
    return NextResponse.json({ analysis: 'No expenses found for this month.' })
  }

  const monthLabel = new Date(start).toLocaleString('en-GB', { month: 'long', year: 'numeric' })

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are a smart personal finance assistant. Here is my expense data for ${monthLabel}: ${JSON.stringify(expenses)}. Give me: 1) a 2-sentence summary of my spending, 2) the top 2 patterns or things to watch, 3) one actionable suggestion. Be direct and concise, no fluff.`,
    }],
  })

  const analysis = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ analysis })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/analyse/ && git commit -m "feat: POST /api/analyse with Claude Haiku"
```

---

## Task 10: Overview Components

**Files:**
- Create: `components/MonthPicker.tsx`
- Create: `components/SpendingChart.tsx`
- Create: `components/AnalysisCard.tsx`

- [ ] **Step 1: Create `components/MonthPicker.tsx`**

```tsx
'use client'

interface Props {
  value: string // "YYYY-MM"
  onChange: (v: string) => void
}

export default function MonthPicker({ value, onChange }: Props) {
  return (
    <input
      type="month"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-zinc-600 [color-scheme:dark]"
    />
  )
}
```

- [ ] **Step 2: Create `components/SpendingChart.tsx`**

```tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: { name: string; amount: number }[]
}

export default function SpendingChart({ data }: Props) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
          labelStyle={{ color: '#e4e4e7' }}
          itemStyle={{ color: '#a1a1aa' }}
          formatter={(v: number) => [`£${v.toFixed(2)}`, 'Spent']}
        />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#ffffff' : '#3f3f46'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Create `components/AnalysisCard.tsx`**

```tsx
interface Props {
  text: string
}

export default function AnalysisCard({ text }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">AI Analysis</p>
      <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{text}</div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/MonthPicker.tsx components/SpendingChart.tsx components/AnalysisCard.tsx
git commit -m "feat: overview components (month picker, chart, analysis card)"
```

---

## Task 11: Overview Page (/overview)

**Files:**
- Create: `app/overview/page.tsx`

- [ ] **Step 1: Create `app/overview/page.tsx`**

```tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Expense } from '@/lib/types'
import MonthPicker from '@/components/MonthPicker'
import SpendingChart from '@/components/SpendingChart'
import AnalysisCard from '@/components/AnalysisCard'

function currentMonth() {
  return new Date().toISOString().slice(0, 7) // "YYYY-MM"
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
    const end = new Date(parseInt(m.split('-')[0]), parseInt(m.split('-')[1]), 0)
      .toISOString().split('T')[0]

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

  const monthLabel = new Date(`${month}-15`).toLocaleString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-zinc-950 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-6">
        <Link href="/" className="text-zinc-400 text-sm hover:text-white transition-colors">← Log</Link>
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 space-y-6">
        {/* Month picker */}
        <MonthPicker value={month} onChange={setMonth} />

        {loading ? (
          <p className="text-zinc-500 text-sm">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="text-zinc-500 text-sm">No expenses for {monthLabel}.</p>
        ) : (
          <>
            {/* Total */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total spent</p>
              <p className="text-4xl font-light text-white">£{total.toFixed(2)}</p>
              <p className="text-zinc-500 text-sm mt-1">{expenses.length} transactions</p>
            </div>

            {/* By category chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">By Category</p>
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
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">By Card</p>
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

            {/* Analyse */}
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
```

- [ ] **Step 2: Commit**

```bash
git add app/overview/ && git commit -m "feat: overview page with chart, breakdown, and AI analysis"
```

---

## Task 12: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

- [ ] **Step 2: Deploy on Vercel**

Go to vercel.com → New Project → import the repo → set these environment variables:
```
NEXT_PUBLIC_SUPABASE_URL     = (from Supabase project settings)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (from Supabase project settings)
ANTHROPIC_API_KEY             = (from console.anthropic.com)
```
Click Deploy.

- [ ] **Step 3: Set up Supabase Auth user**

In Supabase dashboard → Authentication → Users → Add user → enter your email + password.

- [ ] **Step 4: Run SQL schema**

In Supabase dashboard → SQL Editor → paste the schema from the top of this plan → Run.

- [ ] **Step 5: Test end-to-end**

1. Visit your Vercel URL → redirected to /auth ✓
2. Sign in → redirected to / ✓
3. Log an expense → success flash, amount clears ✓
4. Visit /overview → total and chart appear ✓
5. Click "Analyse this month" → AI card appears ✓

---

## .env.example (final)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```
