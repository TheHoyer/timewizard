'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { ThemeProvider } from '@/components/ui/ThemeProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
