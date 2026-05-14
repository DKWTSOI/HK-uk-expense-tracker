import { ReactNode } from 'react'

type Tone = 'default' | 'accent' | 'ink'
type Size = 'sm' | 'md'

interface PillProps {
  children: ReactNode
  on?: boolean
  tone?: Tone
  size?: Size
  onClick?: () => void
  className?: string
}

export default function Pill({ children, on = false, tone = 'default', size = 'md', onClick, className = '' }: PillProps) {
  const pad = size === 'sm' ? 'py-[6px] px-[11px]' : 'py-[9px] px-[14px]'
  const fs  = size === 'sm' ? 'text-[12px]' : 'text-[13.5px]'

  let colorClass: string
  if (on) {
    colorClass = tone === 'accent'
      ? 'bg-accent text-white'
      : 'bg-ink text-paper'
  } else {
    colorClass = 'bg-paper-2 text-ink-70'
  }

  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium leading-none whitespace-nowrap
        ${pad} ${fs} ${colorClass} ${onClick ? 'transition-colors' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}
