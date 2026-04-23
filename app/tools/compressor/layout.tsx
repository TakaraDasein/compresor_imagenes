import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compresor de Imágenes - V1TR0 Tools",
  description: "Optimiza tus imágenes directamente en tu navegador. Compresión local sin servidores.",
}

export default function CompressorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
