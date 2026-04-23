'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid3x3, Settings } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function FloatingLeftNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/tools', icon: Grid3x3, label: 'Herramientas' },
    { href: '/settings', icon: Settings, label: 'Configuración' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="fixed left-3 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-50">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full p-2 sm:p-2.5 md:p-3 shadow-2xl">
          <ul className="flex flex-col gap-2.5 sm:gap-3 md:gap-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <li key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                            active
                              ? 'bg-[#36e2d8] text-slate-900 shadow-lg shadow-[#36e2d8]/50'
                              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-[#36e2d8]'
                          }`}
                        >
                          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-slate-100 font-mono text-xs sm:text-sm">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </TooltipProvider>
  )
}
