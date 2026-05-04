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
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === card
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {card}
        </button>
      ))}
    </div>
  )
}
