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
