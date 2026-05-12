"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Zap, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import DragDropZone from "@/components/shared/DragDropZone"

export default function PDFCompressPage() {
  const [files, setFiles] = useState<File[]>([])

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/tools/pdf" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#36e2d8] transition-colors duration-300 mb-6 font-mono text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver a PDF Tools
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-thin font-mono text-white mb-4">
            Comprimir <span className="text-[#36e2d8]">PDF</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm md:text-base">
            Reduce el tamaño de tus archivos PDF sin perder calidad
          </p>
        </motion.div>

        {/* Development Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-yellow-400 font-mono font-semibold mb-2">
                  Herramienta en Desarrollo
                </h3>
                <p className="text-yellow-200/80 font-mono text-sm leading-relaxed">
                  Estamos trabajando en esta funcionalidad. Pronto podrás comprimir tus PDFs directamente en tu navegador, 
                  sin necesidad de subirlos a ningún servidor. Todo el procesamiento será local y privado.
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-yellow-200/60 font-mono text-xs">
                    <strong>Próximas características:</strong>
                  </p>
                  <ul className="list-disc list-inside text-yellow-200/60 font-mono text-xs space-y-1">
                    <li>Compresión inteligente sin pérdida de calidad</li>
                    <li>Optimización de imágenes dentro del PDF</li>
                    <li>Eliminación de metadatos innecesarios</li>
                    <li>Procesamiento por lotes (múltiples PDFs)</li>
                    <li>100% privado - todo en tu navegador</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upload Zone (Disabled) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="opacity-50 pointer-events-none">
            <DragDropZone
              onFilesSelected={handleFilesSelected}
              accept="application/pdf"
              multiple={true}
              title="Arrastra tus archivos PDF aquí"
              description="O haz clic para seleccionar archivos"
              icon={<Upload className="w-16 h-16" />}
            />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-500 font-mono text-xs">
            Esta herramienta estará disponible próximamente. 
            Mientras tanto, puedes usar nuestras herramientas de{" "}
            <Link href="/tools/compressor" className="text-[#36e2d8] hover:underline">
              compresión de imágenes
            </Link>
            {" "}o{" "}
            <Link href="/tools/converter" className="text-[#36e2d8] hover:underline">
              conversión de formatos
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  )
}
