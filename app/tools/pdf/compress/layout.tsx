import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Comprimir PDF - V1TR0 Tools",
  description: "Reduce el tamaño de tus PDFs sin perder calidad. Procesamiento local y privado.",
}

export default function PDFCompressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
