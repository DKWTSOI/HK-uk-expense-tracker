'use client'

import { useState, useEffect } from 'react'

type Phase = 'hidden' | 'shown' | 'out'

const COLORS = ['#3f6b54', '#b25467', '#c9853a', '#5e8a6a', '#a39782', '#7c715f']

const DOT_COUNT = 14
const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
  const angle = (i / DOT_COUNT) * 2 * Math.PI
  const dist = i % 2 === 0 ? 70 : 110
  const color = COLORS[i % COLORS.length]
  const size = 8 + (i % 3) * 2
  const round = i % 3 !== 1
  return { id: i, color, angle, dist, size, round }
})

export default function SuccessOverlay({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('hidden')

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setPhase('shown'))
    const t1 = setTimeout(() => setPhase('out'), 1500)
    const t2 = setTimeout(onDone, 1900)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(250,246,239,0.92)',
        opacity: phase === 'shown' ? 1 : 0,
        transition: 'opacity 0.35s ease',
        pointerEvents: phase === 'out' ? 'none' : 'auto',
      }}
    >
      {/* Confetti dots */}
      {dots.map((dot) => {
        const tx = phase === 'shown' ? Math.cos(dot.angle) * dot.dist : 0
        const ty = phase === 'shown' ? Math.sin(dot.angle) * dot.dist : 0
        return (
          <div
            key={dot.id}
            style={{
              position: 'absolute',
              width: dot.size,
              height: dot.size,
              borderRadius: dot.round ? '50%' : '2px',
              backgroundColor: dot.color,
              transform: `translate(${tx}px, ${ty}px)`,
              transition: 'transform 0.5s cubic-bezier(0.2,0.8,0.3,1)',
            }}
          />
        )
      })}

      {/* Center checkmark circle */}
      <div
        style={{
          position: 'relative',
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: '#3f6b54',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: phase === 'shown' ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          opacity: phase === 'shown' ? 1 : 0,
        }}
      >
        <svg
          viewBox="0 0 36 36"
          width={44}
          height={44}
          fill="none"
          style={{ display: 'block' }}
        >
          <path
            d="M8 18l7 7 13-13"
            stroke="white"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={30}
            strokeDashoffset={phase === 'shown' ? 0 : 30}
            style={{
              transition: 'stroke-dashoffset 0.35s ease 0.1s',
            }}
          />
        </svg>
      </div>
    </div>
  )
}
