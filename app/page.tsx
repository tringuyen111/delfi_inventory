"use client"

import App from "../src/App"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "../src/contexts/LanguageContext"
import { Toaster } from "../src/components/ui/sonner"
import "../src/index.css"

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
      <LanguageProvider>
        <App />
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  )
}
