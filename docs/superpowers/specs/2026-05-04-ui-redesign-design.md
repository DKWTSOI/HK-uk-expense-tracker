# UI Redesign — Japanese Minimalist Design

## Goal
Redesign both pages of the expense tracker to feel like a premium, restrained Japanese-style app — warm off-white background, lots of whitespace, thin typography, emoji accents, no heavy card borders.

## Design Language

- **Background:** `#faf9f7` (warm off-white, like paper)
- **Surface:** `#ffffff` (pure white, used sparingly)
- **Text primary:** `gray-900`
- **Text secondary:** `gray-400`
- **Selected accent:** `stone-800` (warm dark, not pure black)
- **Dividers:** `gray-100` (extremely subtle)
- **Button:** `stone-900` background, white text
- No heavy card shadows — whitespace does the separation work

## Emoji / Icon Map

### Categories
| Category | Emoji |
|----------|-------|
| Food & Drink | 🍜 |
| Groceries | 🛒 |
| Transport | 🚇 |
| Bills & Utilities | 💡 |
| Shopping | 🛍️ |
| Health & Beauty | 🌿 |
| Entertainment | 🎬 |
| Investment / ISA | 📈 |
| Travel | ✈️ |
| Other | 📦 |

### Cards
| Card | Emoji |
|------|-------|
| HK Card (HSBC HK) | 🏦 |
| Barclaycard Avios | ✈️ |
| Amex | 💳 |
| Chase | 🐇 |
| Klarna | 🛍️ |
| Cash | 💵 |

## Log Page (/)

### Amount Section
- Full-width input, no border, no background
- Currency symbol extremely faint (`gray-200`), large, left-aligned
- Amount text: `text-6xl font-thin text-gray-900`
- Currency toggle: sits below the amount as small text links ("GBP · HKD"), selected is `stone-800`, unselected is `gray-300`
- HKD preview: tiny `gray-400` text below toggle
- Thin `gray-100` divider separates this from next section

### Category Section
- Label: `text-xs text-gray-300 uppercase tracking-widest` — very faint
- Pills: emoji + label, `rounded-full`, `text-sm`
- Unselected: no background, just text in `gray-400`
- Selected: `bg-stone-800 text-white`, subtle
- Large tap target: `py-2 px-3`

### Card Section
- Same pill treatment as Category
- Emoji prefix for each card

### Date Section
- Single line: label left, date input right (inline, no box)
- Date text right-aligned, `gray-600`

### Submit Button
- Full width, `rounded-2xl`, `bg-stone-900 text-white`
- `py-4`, `text-base font-medium`
- Success state: `bg-green-500`

### Layout
- No white card wrappers — sections separated by `border-b border-gray-100` dividers and `py-5` padding
- Overall `px-5` horizontal padding

## Overview Page (/overview)

### Month Selector
- Left arrow `‹` — month label — right arrow `›`
- Centered, `text-sm text-gray-500`
- Arrows are tappable, `px-4 py-2`

### Total Section
- `£{total}` in `text-5xl font-thin text-gray-900`
- `{n} transactions` in `text-xs text-gray-400` below

### Category Breakdown
- Section label: `text-xs text-gray-300 uppercase tracking-widest`
- Each row: emoji + name left, `£amount` right
- Thin `border-b border-gray-50` between rows
- No surrounding card border

### Card Breakdown
- Same treatment as category breakdown

### Bar Chart
- Keep Recharts but: no axis lines, no grid, bars in `stone-200` with top bar in `stone-800`
- Minimal, sits between sections

### Analyse Button
- Outlined style: `border border-gray-200 text-gray-400 rounded-2xl`
- "✦ Analyse this month" — the ✦ gives personality without heaviness

### Analysis Card
- No border, just `bg-white rounded-2xl p-5` with `text-sm text-gray-600 leading-relaxed`
