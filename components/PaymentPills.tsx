'use client'
import { PAYMENT_METHOD_GROUPS, PAYMENT_METHOD_EMOJI } from '@/lib/constants'

interface Props {
  value: string[]
  onChange: (v: string[]) => void
}

export default function PaymentPills({ value, onChange }: Props) {
  function toggle(method: string) {
    if (value.includes(method)) {
      onChange(value.filter(m => m !== method))
    } else {
      onChange([...value, method])
    }
  }

  return (
    <div className="space-y-4">
      {PAYMENT_METHOD_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-xs text-gray-300 uppercase tracking-widest mb-2">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.methods.map(method => (
              <button
                key={method}
                type="button"
                onClick={() => toggle(method)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all ${
                  value.includes(method)
                    ? 'bg-stone-800 text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span>{PAYMENT_METHOD_EMOJI[method]}</span>
                <span>{method}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
