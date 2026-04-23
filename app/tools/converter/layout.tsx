import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conversor de Formatos - V1TR0 Tools",
  description: "Convierte imágenes entre diferentes formatos. Procesamiento local sin servidores.",
}

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
