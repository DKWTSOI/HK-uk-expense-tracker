'use client'

import { useEffect, useState } from 'react'

export function useStreak(): number {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const today = new Date()
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

        const { data, error } = await supabase
          .from('expenses')
          .select('date')
          .gte('date', thirtyDaysAgoStr)

        if (error) return

        const dateSet = new Set(
          (data ?? []).map((row: { date: string }) => row.date.split('T')[0])
        )

        let count = 0
        const cursor = new Date(today)

        while (true) {
          const dateStr = cursor.toISOString().split('T')[0]
          if (dateSet.has(dateStr)) {
            count++
            cursor.setDate(cursor.getDate() - 1)
          } else {
            break
          }
        }

        setStreak(count)
      } catch {
        // silently handle errors; streak stays 0
      }
    }

    fetchStreak()
  }, [])

  return streak
}
