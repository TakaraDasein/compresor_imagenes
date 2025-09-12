"use client"

import { useState } from "react"
import ImageCompressorLocal from "@/components/ImageCompressorLocal"
import Logo from "@/components/Logo"
import Footer from "@/components/Footer"

export default function Home() {
  const [hasImages, setHasImages] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8 relative overflow-hidden flex flex-col">
      <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col h-full flex-grow">
        <div className="flex-shrink-0">
          <Logo />
        </div>

        <div className="flex-grow min-h-0">
          <ImageCompressorLocal onImagesCountChange={(count) => setHasImages(count > 0)} />
        </div>

        {!hasImages && (
          <>
            <h1 className="text-white text-center mt-8 mb-2 text-4xl md:text-5xl font-mono font-thin">
              Compresión de Imágenes
            </h1>
            <p className="text-center mb-4 max-w-2xl mx-auto text-teal-500 font-mono font-thin text-sm md:text-base">
              Optimiza tus imágenes directamente en tu navegador sin enviar datos a ningún servidor. Toda la compresión
              se realiza localmente en tu dispositivo.
            </p>
          </>
        )}

        <div className="flex-shrink-0 text-center font-mono">
          <Footer />
        </div>
      </div>
    </main>
  )
}
