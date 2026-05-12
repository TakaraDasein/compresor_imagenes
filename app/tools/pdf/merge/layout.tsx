import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Unir PDFs - V1TR0 Tools",
  description: "Combina múltiples archivos PDF en uno solo. Procesamiento local y privado.",
}

export default function MergePDFLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
