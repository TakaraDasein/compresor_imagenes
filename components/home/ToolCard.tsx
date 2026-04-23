"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import * as Icons from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ToolConfig } from "@/lib/types"

interface ToolCardProps {
  tool: ToolConfig
  index: number
}

export default function ToolCard({ tool, index }: ToolCardProps) {
  // Obtener el icono dinámicamente
  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Link href={`/tools/${tool.slug}`} className="block h-full">
        <Card className="h-full bg-slate-800/50 border-slate-700 hover:border-[#36e2d8] transition-all duration-300 cursor-pointer group overflow-hidden relative">
          {/* Efecto de brillo al hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#36e2d8]/0 via-[#36e2d8]/0 to-[#36e2d8]/0 group-hover:from-[#36e2d8]/5 group-hover:via-[#36e2d8]/10 group-hover:to-[#36e2d8]/5 transition-all duration-300" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <motion.div
                className="p-3 rounded-lg bg-gradient-to-br from-[#36e2d8]/20 to-[#36e2d8]/5 border border-[#36e2d8]/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {IconComponent && <IconComponent className="w-8 h-8 text-[#36e2d8]" />}
              </motion.div>
              
              {tool.featured && (
                <Badge variant="outline" className="bg-[#36e2d8]/10 text-[#36e2d8] border-[#36e2d8]/30 font-mono text-xs">
                  Popular
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-xl font-mono font-thin text-white group-hover:text-[#36e2d8] transition-colors">
              {tool.name}
            </CardTitle>
            
            <CardDescription className="font-mono text-sm text-slate-400 mt-2">
              {tool.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10">
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-slate-700/50 text-slate-300 hover:bg-slate-700 font-mono text-xs px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
                {tool.tags.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-700/50 text-slate-300 font-mono text-xs px-2 py-0.5"
                  >
                    +{tool.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="mt-4 flex items-center text-[#36e2d8] font-mono text-sm group-hover:translate-x-2 transition-transform">
              <span>Abrir herramienta</span>
              <Icons.ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
