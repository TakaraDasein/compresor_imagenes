"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileDown, ArrowRightLeft, Zap, File } from "lucide-react"
import Link from "next/link"

export default function PDFToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const tools = [
    {
      id: "compress",
      icon: Zap,
      title: "Comprimir PDF",
      description: "Reduce el tamaño de tus PDFs sin perder calidad",
      color: "#36e2d8",
      href: "/tools/pdf/compress",
      status: "Disponible",
    },
    {
      id: "convert-to-pdf",
      icon: ArrowRightLeft,
      title: "Convertir a PDF",
      description: "Convierte imágenes, Word, Excel a PDF",
      color: "#36e2d8",
      href: "/tools/pdf/convert-to",
      status: "En desarrollo",
    },
    {
      id: "convert-from-pdf",
      icon: File,
      title: "Convertir desde PDF",
      description: "Extrae PDF a imágenes, Word, texto",
      color: "#36e2d8",
      href: "/tools/pdf/convert-from",
      status: "En desarrollo",
    },
    {
      id: "merge",
      icon: FileDown,
      title: "Unir PDFs",
      description: "Combina múltiples PDFs en uno solo",
      color: "#36e2d8",
      href: "/tools/pdf/merge",
      status: "En desarrollo",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin font-mono text-white mb-4">
            PDF <span className="text-[#36e2d8]">Tools</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm md:text-base">
            Herramientas profesionales para trabajar con PDFs. Todo en tu navegador.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              onMouseEnter={() => setSelectedTool(tool.id)}
              onMouseLeave={() => setSelectedTool(null)}
              className="group relative"
            >
              <Link href={tool.href}>
                <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border-2 border-slate-700/50 p-8 transition-all duration-300 hover:border-[#36e2d8]/60 hover:shadow-lg hover:shadow-[#36e2d8]/20">
                  {/* Status Badge */}
                  {tool.status && (
                    <div className="absolute top-4 right-4">
                      <span className={`text-xs font-mono px-3 py-1 rounded-full ${
                        tool.status === "Disponible"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : tool.status === "En desarrollo" 
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                      }`}>
                        {tool.status}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <motion.div
                    animate={selectedTool === tool.id ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-[#36e2d8]/20 to-transparent flex items-center justify-center border border-[#36e2d8]/30 group-hover:border-[#36e2d8]/60 transition-all duration-300">
                      <tool.icon 
                        className="w-8 h-8 md:w-10 md:h-10 text-[#36e2d8] group-hover:text-white transition-colors duration-300" 
                        strokeWidth={1.5}
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-mono font-thin text-white mb-3 group-hover:text-[#36e2d8] transition-colors duration-300">
                    {tool.title}
                  </h3>
                  <p className="text-slate-400 font-mono text-sm leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#36e2d8]/0 group-hover:border-[#36e2d8] transition-all duration-300 rounded-tl-xl" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#36e2d8]/0 group-hover:border-[#36e2d8] transition-all duration-300 rounded-br-xl" />

                  {/* Scan Line */}
                  <motion.div
                    className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
                    initial={false}
                  >
                    <motion.div
                      className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#36e2d8]/50 to-transparent"
                      animate={{
                        y: [-20, 400],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                        delay: index * 0.5,
                      }}
                    />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-[#36e2d8] animate-pulse" />
            <span className="text-sm font-mono text-slate-400">
              Todas las herramientas procesan tus archivos 100% en tu navegador
            </span>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <Link href="/">
            <button className="font-mono text-sm text-slate-500 hover:text-[#36e2d8] transition-colors duration-300">
              ← Volver al inicio
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
