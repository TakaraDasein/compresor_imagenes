import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import CustomCursor from "@/components/CustomCursor"
import { NotificationProvider } from "@/components/NotificationProvider"
import { FloatingLeftNav } from "@/components/layout/FloatingLeftNav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "V1TR0 Tools - Herramientas de Procesamiento de Imágenes",
  description: "Suite completa de herramientas para procesar imágenes 100% en tu navegador. Sin servidores, sin registro, sin límites.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark text-left">
      <body className={inter.className}>
        <NotificationProvider>
          <FloatingLeftNav />
          {children}
          <CustomCursor />
        </NotificationProvider>
      </body>
    </html>
  )
}
