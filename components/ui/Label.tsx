import { ReactNode } from 'react'

export default function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[10.5px] text-ink-40 uppercase tracking-[0.14em] font-semibold ${className}`}>
      {children}
    </p>
  )
}
