import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Convertir a PDF - V1TR0 Tools",
  description: "Convierte imágenes, documentos y más a PDF. Procesamiento local y privado.",
}

export default function ConvertToPDFLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
