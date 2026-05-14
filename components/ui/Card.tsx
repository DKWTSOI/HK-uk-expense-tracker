import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  pad?: string
}

export default function Card({ children, className = '', pad = 'p-[18px]' }: CardProps) {
  return (
    <div className={`bg-paper rounded-squircle card-shadow ${pad} ${className}`}>
      {children}
    </div>
  )
}
