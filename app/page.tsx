export const dynamic = 'force-dynamic'
import LogWizard from '@/components/LogWizard'
import TabBar from '@/components/ui/TabBar'

export default function LogPage() {
  return (
    <div className="min-h-screen bg-paper-bg">
      <LogWizard />
      <TabBar />
    </div>
  )
}
