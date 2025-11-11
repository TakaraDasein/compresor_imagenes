"use client"

import { useState, Suspense, lazy } from "react"
import type { Tool } from "@/lib/types"
import Logo from "@/components/Logo"
import Footer from "@/components/Footer"
import ToolSelector from "@/components/common/Navbar/ToolSelector"
import { AVAILABLE_TOOLS } from "@/lib/constants/tools"

// Lazy load de componentes de herramientas
const ImageCompressorLocal = lazy(() => import("@/components/tools/compression/ImageCompressorLocal"))
const ImageConverter = lazy(() => import("@/components/tools/conversion/ImageConverter"))

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>("compression")
  const [hasImages, setHasImages] = useState(false)

  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool)
    setHasImages(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8 relative overflow-hidden flex flex-col">
      <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col h-full flex-grow">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Selector de Herramientas */}
        <ToolSelector
          activeTool={activeTool}
          onToolChange={handleToolChange}
          availableTools={AVAILABLE_TOOLS}
        />

        {/* Contenido de la Herramienta Activa */}
        <div className="flex-grow min-h-0">
          <Suspense fallback={<div className="text-center text-white/50">Cargando herramienta...</div>}>
            {activeTool === "compression" && (
              <ImageCompressorLocal onImagesCountChange={(count: number) => setHasImages(count > 0)} />
            )}
            {activeTool === "conversion" && (
              <ImageConverter />
            )}
          </Suspense>
        </div>

        {/* Descripción */}
        {!hasImages && (
          <>
            <h1 className="text-white text-center mt-8 mb-2 text-4xl md:text-5xl font-mono font-thin">
              {activeTool === "compression" ? "Compresión de Imágenes" : "Convertir Formato"}
            </h1>
            <p className="text-center mb-4 max-w-2xl mx-auto text-teal-500 font-mono font-thin text-sm md:text-base">
              {activeTool === "compression"
                ? "Optimiza tus imágenes directamente en tu navegador sin enviar datos a ningún servidor. Toda la compresión se realiza localmente en tu dispositivo."
                : "Convierte tus imágenes entre diferentes formatos. PNG, JPG, WebP, ICO, AVIF y más. Procesado 100% en tu navegador."}
            </p>
          </>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 text-center font-mono">
          <Footer />
        </div>
      </div>
    </main>
  )
}
