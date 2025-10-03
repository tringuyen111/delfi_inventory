import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { ThemeProvider } from "../components/theme-provider"
import { LanguageProvider } from "./contexts/LanguageContext"
import { Toaster } from "./components/ui/sonner"

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
    <LanguageProvider>
      <App />
      <Toaster />
    </LanguageProvider>
  </ThemeProvider>,
)
