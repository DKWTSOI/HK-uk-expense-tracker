'use client'
import Pill from './ui/Pill'
import { PAYMENT_METHOD_GROUPS, PAYMENT_METHOD_EMOJI } from '@/lib/constants'

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export default function PaymentPills({ value, onChange }: Props) {
  function toggle(method: string) {
    onChange(value.includes(method) ? value.filter(m => m !== method) : [...value, method])
  }
  return (
    <div className="space-y-3">
      {PAYMENT_METHOD_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-[10.5px] text-ink-30 uppercase tracking-[0.08em] mb-1.5">{group.label}</p>
          <div className="flex flex-wrap gap-[7px]">
            {group.methods.map(method => (
              <Pill key={method} on={value.includes(method)} size="sm" onClick={() => toggle(method)}>
                <span>{PAYMENT_METHOD_EMOJI[method] || '💳'}</span>
                <span>{method}</span>
              </Pill>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
