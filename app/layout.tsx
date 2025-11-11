import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import CustomCursor from "@/components/CustomCursor"
import { NotificationProvider } from "@/components/NotificationProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Compresor de Imágenes Sin Pérdida",
  description: "Sistema de compresión de imágenes sin pérdida con Next.js y Sharp",
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
          {children}
          <CustomCursor />
        </NotificationProvider>
      </body>
    </html>
  )
}
