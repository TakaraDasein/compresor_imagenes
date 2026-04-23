"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logo from "@/components/Logo"

interface ToolsNavbarProps {
  toolName?: string
}

export default function ToolsNavbar({ toolName }: ToolsNavbarProps) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <motion.nav
      className="w-full max-w-7xl mx-auto mb-8 relative z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo compact />
        </Link>

        {/* Navegación */}
        <div className="flex items-center gap-4">
          {!isHome && (
            <>
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-[#36e2d8] hover:bg-slate-800/50 font-mono transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Inicio
                </Button>
              </Link>

              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:border-[#36e2d8] text-slate-300 hover:text-[#36e2d8] font-mono transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Todas las herramientas
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Título de la herramienta actual */}
      {toolName && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-white text-4xl md:text-5xl font-mono font-thin mb-2">
            {toolName}
          </h1>
        </motion.div>
      )}
    </motion.nav>
  )
}
