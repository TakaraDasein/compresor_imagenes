import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Convertir desde PDF - V1TR0 Tools",
  description: "Extrae contenido de PDFs a imágenes, texto y más. Procesamiento local y privado.",
}

export default function ConvertFromPDFLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
