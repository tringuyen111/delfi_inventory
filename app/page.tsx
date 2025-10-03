"use client"

import App from "../src/App"
import { ThemeProvider } from "../src/contexts/ThemeContext"
import { LanguageProvider } from "../src/contexts/LanguageContext"
import { Toaster } from "../src/components/ui/sonner"
import "../src/index.css"

export default function Page() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <App />
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  )
}
