'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import type { Tool, ToolConfig } from '@/lib/types'

interface ToolSelectorProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  availableTools: ToolConfig[]
}

/**
 * Componente ToolSelector
 * Muestra un menú de herramientas disponibles y permite cambiar entre ellas
 * Mantiene coherencia visual con el diseño actual (colores, animaciones)
 */
export default function ToolSelector({
  activeTool,
  onToolChange,
  availableTools,
}: ToolSelectorProps) {
  // Obtener dinámicamente el icono de lucide-react
  const getIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{
      className?: string
    }>
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null
  }

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col gap-4">
        {/* Header del Selector */}
        <div className="flex items-center gap-3 px-4">
          <div className="h-1 w-1 rounded-full bg-[#36e2d8]" />
          <span className="text-xs font-mono text-[#36e2d8] uppercase tracking-widest">
            Selecciona una herramienta
          </span>
        </div>

        {/* Grid de Herramientas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4">
          {availableTools.map((tool) => (
            <motion.button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`relative group overflow-hidden rounded-lg px-4 py-3 text-left transition-all duration-300 ${
                activeTool === tool.id
                  ? 'bg-gradient-to-r from-[#36e2d8]/20 to-[#36e2d8]/10 border border-[#36e2d8]/50 shadow-lg shadow-[#36e2d8]/20'
                  : 'bg-white/5 border border-white/10 hover:border-[#36e2d8]/30 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Fondo animado para herramienta activa */}
              {activeTool === tool.id && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#36e2d8]/5 to-transparent"
                  layoutId="toolSelector"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Contenido del botón */}
              <div className="relative z-10 flex items-start gap-3">
                <div
                  className={`mt-1 transition-colors duration-300 ${
                    activeTool === tool.id ? 'text-[#36e2d8]' : 'text-white/60 group-hover:text-[#36e2d8]/70'
                  }`}
                >
                  {getIcon(tool.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      activeTool === tool.id ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}
                  >
                    {tool.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 transition-colors duration-300 ${
                      activeTool === tool.id ? 'text-[#36e2d8]/70' : 'text-white/40 group-hover:text-white/50'
                    }`}
                  >
                    {tool.description}
                  </p>
                </div>

                {/* Indicador de selección */}
                {activeTool === tool.id && (
                  <motion.div
                    className="flex-shrink-0 w-2 h-2 rounded-full bg-[#36e2d8] mt-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
              </div>

              {/* Efecto de hover bottom border */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#36e2d8]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          ))}
        </div>

        {/* Divisor visual */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4 mt-2" />
      </div>
    </div>
  )
}
