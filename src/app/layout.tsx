import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/sonner'
import { RouteGuard } from '@/components/auth/RouteGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { OrderProviderWrapper } from '@/components/OrderProviderWrapper'

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
        <ThemeProvider>
          <AuthProvider>
            <OrderProviderWrapper>
              <SidebarProvider>
                <RouteGuard>
                  <AppLayout>
                    {children}
                  </AppLayout>
                </RouteGuard>
                <Toaster />
              </SidebarProvider>
            </OrderProviderWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
