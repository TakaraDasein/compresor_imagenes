"use client"

import { motion } from "framer-motion"
import { ArrowLeft, File } from "lucide-react"
import Link from "next/link"

export default function ConvertFromPDFPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
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
            Convertir desde <span className="text-[#36e2d8]">PDF</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm md:text-base">
            Extrae PDFs a imágenes, texto y otros formatos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-6 backdrop-blur-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#36e2d8]/20 to-transparent flex items-center justify-center border border-[#36e2d8]/30">
              <File className="w-8 h-8 text-[#36e2d8]" />
            </div>
            <h3 className="text-slate-200 font-mono font-semibold mb-2">
              Próximamente
            </h3>
            <p className="text-slate-400 font-mono text-sm">
              Esta herramienta estará disponible muy pronto.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
