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
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === cat
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
