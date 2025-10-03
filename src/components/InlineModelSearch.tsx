"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { ChevronDown } from "lucide-react"

interface Model {
  code: string
  name: string
  trackingType: "None" | "Serial" | "Lot"
  unit: string
}

interface InlineModelSearchProps {
  models: Model[]
  onSelect: (model: Model) => void
}

export function InlineModelSearch({ models, onSelect }: InlineModelSearchProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (model: Model) => {
    onSelect(model)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left rounded-md border border-input bg-background hover:bg-accent/50 transition-colors text-sm"
      >
        <span className="text-muted-foreground">{t("select_model_goods")}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[400px] bg-popover rounded-md shadow-lg border border-border">
          <div className="max-h-[280px] overflow-y-auto py-1">
            {models.length > 0 ? (
              models.map((model) => (
                <button
                  key={model.code}
                  type="button"
                  onClick={() => handleSelect(model)}
                  className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{model.code}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{model.name}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-muted/50">{model.trackingType}</span>
                      <span>{model.unit}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">{t("no_models_found")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
