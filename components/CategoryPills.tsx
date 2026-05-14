'use client'
import Pill from './ui/Pill'
import { CATEGORIES, CATEGORY_EMOJI } from '@/lib/constants'

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export default function CategoryPills({ value, onChange }: Props) {
  function toggle(cat: string) {
    onChange(value.includes(cat) ? value.filter(c => c !== cat) : [...value, cat])
  }
  return (
    <div className="flex flex-wrap gap-[7px]">
      {CATEGORIES.map(cat => (
        <Pill key={cat} on={value.includes(cat)} size="sm" onClick={() => toggle(cat)}>
          <span>{CATEGORY_EMOJI[cat] || '📦'}</span>
          <span>{cat}</span>
        </Pill>
      ))}
    </div>
  )
}
