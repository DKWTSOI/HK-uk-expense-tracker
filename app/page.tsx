export const dynamic = 'force-dynamic'
import LogForm from '@/components/LogForm'
import Link from 'next/link'

export default function LogPage() {
  return (
    <div className="min-h-screen pb-16">
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <h1 className="text-base font-medium text-gray-900">Expenses</h1>
        <Link
          href="/overview"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Overview →
        </Link>
      </div>
      <div className="px-5">
        <LogForm />
      </div>
    </div>
  )
}
