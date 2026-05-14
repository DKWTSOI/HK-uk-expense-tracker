interface AmountProps {
  value: string
  sign?: string
  sub?: string
  size?: number
  color?: string
}

export default function Amount({ value, sign = '£', sub, size = 56, color }: AmountProps) {
  const glyphSize = Math.round(size * 0.55)
  return (
    <div>
      <div
        className="font-display leading-none tracking-[-0.02em]"
        style={{ fontSize: size, color: color || 'var(--tw-prose-body, #2a2218)' }}
      >
        <span
          className="font-light opacity-50 mr-1"
          style={{ fontSize: glyphSize }}
        >
          {sign}
        </span>
        {value}
      </div>
      {sub && (
        <p className="text-[12px] text-ink-40 mt-1.5 font-sans tabular-nums">{sub}</p>
      )}
    </div>
  )
}
