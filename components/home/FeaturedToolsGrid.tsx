"use client"

import ToolCard from "./ToolCard"
import type { ToolConfig } from "@/lib/types"

interface FeaturedToolsGridProps {
  tools: ToolConfig[]
}

export default function FeaturedToolsGrid({ tools }: FeaturedToolsGridProps) {
  return (
    <section className="relative z-10">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-thin text-white mb-6 sm:mb-8 md:mb-12 text-center px-4">
        Herramientas Destacadas
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        {tools.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>

      {/* Mensaje cuando habrá más herramientas */}
      <div className="mt-8 sm:mt-10 md:mt-12 text-center">
        <p className="text-slate-500 font-mono text-xs sm:text-sm">
          Más herramientas próximamente...
        </p>
      </div>
    </section>
  )
}
