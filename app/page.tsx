export const dynamic = 'force-dynamic'
import LogForm from '@/components/LogForm'
import Link from 'next/link'

export default function LogPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="flex items-center justify-between px-4 pt-14 pb-6">
        <h1 className="text-xl font-semibold text-gray-900">Log Expense</h1>
        <Link
          href="/overview"
          className="text-gray-500 text-sm hover:text-gray-900 transition-colors"
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
