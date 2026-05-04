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
