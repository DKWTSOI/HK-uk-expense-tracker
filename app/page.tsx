export const dynamic = 'force-dynamic'
import LogForm from '@/components/LogForm'
import Link from 'next/link'

export default function LogPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-12">
      <div className="flex items-center justify-between px-4 pt-14 pb-6">
        <h1 className="text-xl font-semibold text-white">Log Expense</h1>
        <Link
          href="/overview"
          className="text-zinc-400 text-sm hover:text-white transition-colors"
        >
          Overview →
        </Link>
      </div>
      <div className="px-4">
        <LogForm />
      </div>
    </div>
  )
}
