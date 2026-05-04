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
