"use client"

import { Suspense } from "react"
import ImageConverter from "@/components/tools/conversion/ImageConverter"
import { Loader2 } from "lucide-react"

export default function ConverterPage() {
  return (
    <div className="relative z-10 py-8">
      {/* Herramienta */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#36e2d8] animate-spin" />
            <span className="ml-3 text-white/50 font-mono">Cargando herramienta...</span>
          </div>
        }
      >
        <ImageConverter />
      </Suspense>
    </div>
  )
}
