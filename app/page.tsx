export const dynamic = 'force-dynamic'
import LogForm from '@/components/LogForm'
import TabBar from '@/components/ui/TabBar'

export default function LogPage() {
  return (
    <div className="min-h-screen pb-24 bg-paper-bg">
      {/* Chrome */}
      <div className="flex items-center justify-between px-[22px] pt-14 pb-2 min-h-11">
        <span className="min-w-14 text-sm text-ink-50 font-medium">Today</span>
        <h1 className="text-[15px] font-semibold text-ink tracking-[-0.01em]">Log</h1>
        <span className="min-w-14 text-sm text-ink-50 font-medium text-right">GBP · HKD</span>
      </div>
      <LogForm />
      <TabBar />
    </div>
  )
}
