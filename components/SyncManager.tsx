'use client'
import { useEffect, useState } from 'react'
import { getPending, removePending } from '@/lib/offlineQueue'

export default function SyncManager() {
  const [toast, setToast] = useState<string | null>(null)

  async function syncPending() {
    let pending
    try {
      pending = await getPending()
    } catch {
      return
    }
    if (pending.length === 0) return

    let synced = 0
    for (const item of pending) {
      try {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        })
        if (res.ok) {
          await removePending(item.id)
          synced++
        }
        // On non-ok response: leave in queue, will retry next time
      } catch {
        // Network error: leave in queue
      }
    }

    if (synced > 0) {
      setToast(`${synced} expense${synced > 1 ? 's' : ''} synced`)
      setTimeout(() => setToast(null), 3000)
    }
  }

  useEffect(() => {
    if (navigator.onLine) syncPending()
    window.addEventListener('online', syncPending)
    return () => window.removeEventListener('online', syncPending)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!toast) return null

  return (
    <div className="fixed top-safe-top left-0 right-0 flex justify-center z-[60] px-4 pt-4 pointer-events-none">
      <div
        className="bg-sage text-white text-[13px] font-semibold px-5 py-2.5 rounded-full shadow-lg pointer-events-auto"
        style={{ boxShadow: '0 4px 20px -4px rgba(63,107,84,0.5)' }}
      >
        ✓ {toast}
      </div>
    </div>
  )
}
