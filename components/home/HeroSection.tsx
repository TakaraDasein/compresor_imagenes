"use client"

import { motion } from "framer-motion"
import Logo from "@/components/Logo"

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-between py-8 md:py-12 lg:py-16 relative z-10">
      {/* Top spacer */}
      <div className="flex-1" />

      {/* Main content - centered */}
      <div className="flex-shrink-0 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo />
        </motion.div>

        <motion.h1
          className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-mono font-thin mt-6 md:mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          V1TR0 Tools
        </motion.h1>
      </div>

      {/* Bottom info bar */}
      <motion.div
        className="flex-shrink-0 w-full pt-8 md:pt-12 border-t border-slate-700/30 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Description text */}
          <p className="text-slate-500 font-mono text-xs sm:text-sm mb-3 md:mb-4 leading-relaxed text-center">
            Sistema completo de herramientas 100% privadas para procesar imágenes.
            <br className="hidden sm:block" />
            <span className="sm:ml-2">Todo en tu navegador. Sin servidores. Sin límites.</span>
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#36e2d8]/50" />
              <span>100% Privado</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#36e2d8]/50" />
              <span>Procesamiento Local</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#36e2d8]/50" />
              <span>Sin Registro</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
