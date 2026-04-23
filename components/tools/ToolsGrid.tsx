'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AVAILABLE_TOOLS } from '@/lib/constants/tools'
import { CompressorIcon, ConverterIcon } from '@/components/icons/ToolIcons'
import { Badge } from '@/components/ui/badge'

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'compressor': CompressorIcon,
  'converter': ConverterIcon,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function ToolsGrid() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-thin text-slate-100 font-mono mb-3 sm:mb-4">
            Herramientas
          </h1>
          <p className="text-slate-400 font-mono text-sm sm:text-base md:text-lg">
            Selecciona una herramienta para comenzar
          </p>
        </motion.div>

        {/* Grid of Tools */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
        >
          {AVAILABLE_TOOLS.map((tool) => {
            const IconComponent = toolIcons[tool.slug]
            
            return (
              <motion.div key={tool.id} variants={itemVariants}>
                <Link href={`/tools/${tool.slug}`}>
                  <div className="group relative bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-700/50 hover:border-[#36e2d8]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#36e2d8]/10 cursor-pointer h-full">
                    {/* Featured Badge */}
                    {tool.featured && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <Badge className="bg-[#36e2d8]/20 text-[#36e2d8] border-[#36e2d8]/30 text-xs font-mono">
                          Destacado
                        </Badge>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="mb-4 sm:mb-5 md:mb-6 flex items-center justify-center">
                      <div className="relative">
                        {IconComponent && (
                          <IconComponent className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#36e2d8] group-hover:scale-110 transition-transform duration-300" />
                        )}
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-[#36e2d8]/0 group-hover:bg-[#36e2d8]/10 blur-xl rounded-full transition-all duration-300" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-thin text-slate-100 mb-2 sm:mb-3 text-center font-mono">
                      {tool.name}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 mb-4 sm:mb-5 md:mb-6 text-center font-mono text-xs sm:text-sm">
                      {tool.description}
                    </p>

                    {/* Tags */}
                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                        {tool.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-slate-900/50 text-slate-400 border-slate-700/50 text-xs font-mono"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#36e2d8]/0 to-[#36e2d8]/0 group-hover:from-[#36e2d8]/5 group-hover:to-[#36e2d8]/10 rounded-xl sm:rounded-2xl transition-all duration-300 pointer-events-none" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Future tools placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 sm:mt-10 md:mt-12 text-center"
        >
          <div className="inline-block bg-slate-800/30 backdrop-blur-sm rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 border border-slate-700/30">
            <p className="text-slate-500 font-mono text-xs sm:text-sm">
              Más herramientas próximamente...
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
