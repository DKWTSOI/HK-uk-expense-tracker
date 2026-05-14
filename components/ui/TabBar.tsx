'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { id: 'log',      href: '/',           label: 'Log',      icon: '＋' },
  { id: 'overview', href: '/overview',   label: 'Overview', icon: '◐' },
  { id: 'budgets',  href: '/budgets',    label: 'Budgets',  icon: '◳' },
  { id: 'insights', href: '/insights',   label: 'Insights', icon: '✦' },
]

export default function TabBar() {
  const pathname = usePathname()
  const active =
    pathname === '/' ? 'log' :
    pathname.startsWith('/overview') ? 'overview' :
    pathname.startsWith('/budgets') ? 'budgets' :
    pathname.startsWith('/insights') ? 'insights' :
    pathname.startsWith('/recurring') ? 'overview' : 'log'

  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[440px] z-50
                    bg-paper-bg/[0.92] backdrop-blur-xl
                    border-t border-cream-2
                    grid grid-cols-4
                    pb-6 pt-2.5">
      {TABS.map(t => {
        const on = t.id === active
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wide transition-colors
              ${on ? 'text-accent' : 'text-ink-40'}`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
