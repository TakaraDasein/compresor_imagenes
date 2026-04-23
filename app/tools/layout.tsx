'use client'

import type React from "react"
import { usePathname } from 'next/navigation'
import Footer from "@/components/Footer"

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // If we're on /tools (main page), just render children
  if (pathname === '/tools') {
    return <>{children}</>
  }
  
  // For individual tool pages, wrap with layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8 relative overflow-hidden">
      <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col min-h-screen">
        {/* Contenido principal */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center font-mono">
          <Footer />
        </div>
      </div>
    </div>
  )
}
