'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'

interface ProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ProviderProps) {
  return <NextThemeProvider attribute='class'>{children}</NextThemeProvider>
}
