import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SwRegister from './sw-register'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#faf9f7',
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
      <body className={`${inter.className} text-gray-900 min-h-screen`} style={{ backgroundColor: '#faf9f7' }}>
        <SwRegister />
        {children}
      </body>
    </html>
  )
}
