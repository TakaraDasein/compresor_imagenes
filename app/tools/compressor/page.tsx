"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import ImageCompressorLocal from "@/components/tools/compression/ImageCompressorLocal"
import { Loader2 } from "lucide-react"

export default function CompressorPage() {
  return (
    <div className="relative z-10 py-8">
      {/* Título y descripción */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-white text-4xl md:text-5xl font-mono font-thin mb-4">
          Compresor de Imágenes
        </h1>
        <p className="text-slate-400 font-mono text-sm md:text-base max-w-3xl mx-auto">
          Optimiza tus imágenes directamente en tu navegador sin enviar datos a ningún servidor.
          <br />
          Toda la compresión se realiza localmente en tu dispositivo.
        </p>
      </motion.div>

      {/* Herramienta */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#36e2d8] animate-spin" />
            <span className="ml-3 text-white/50 font-mono">Cargando herramienta...</span>
          </div>
        }
      >
        <ImageCompressorLocal />
      </Suspense>
    </div>
  )
}
