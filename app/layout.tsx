import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'
import SwRegister from './sw-register'
import SyncManager from '@/components/SyncManager'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['SOFT', 'WONK'],
})

export const viewport: Viewport = {
  themeColor: '#faf6ef',
}

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Personal expense tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Expenses',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} font-sans text-ink bg-paper-bg min-h-screen`}>
        <SwRegister />
        <SyncManager />
        <div className="mx-auto max-w-[440px] min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  )
}
