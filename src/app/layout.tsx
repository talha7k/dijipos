import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { RouteGuard } from '@/components/auth/RouteGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { JotaiProvider } from '@/components/JotaiProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DijiPos - Modern POS System',
  description: 'A modern point of sale system for retail businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JotaiProvider>
          <RouteGuard>
            <AppLayout>
              {children}
            </AppLayout>
          </RouteGuard>
          <Toaster />
        </JotaiProvider>
      </body>
    </html>
  )
}
