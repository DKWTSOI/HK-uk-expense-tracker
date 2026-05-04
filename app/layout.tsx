import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Expenses',
  description: 'Personal expense tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-gray-900 min-h-screen`} style={{ backgroundColor: '#faf9f7' }}>
        {children}
      </body>
    </html>
  )
}
