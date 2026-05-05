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
