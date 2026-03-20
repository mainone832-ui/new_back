// app/providers.tsx
"use client";

import {HeroUIProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={true}>
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  )
}