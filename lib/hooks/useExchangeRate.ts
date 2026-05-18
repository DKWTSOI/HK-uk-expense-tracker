'use client'
import { useEffect, useState } from 'react'
import { HKD_TO_GBP } from '@/lib/constants'

interface RateState {
  rate: number
  updatedAt: number | null
}

export function useExchangeRate(): RateState {
  const [state, setState] = useState<RateState>({ rate: HKD_TO_GBP, updatedAt: null })

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(data => setState({ rate: data.rate, updatedAt: data.updatedAt }))
      .catch(() => {})
  }, [])

  return state
}
