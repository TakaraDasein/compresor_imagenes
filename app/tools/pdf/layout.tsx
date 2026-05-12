import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PDF Tools - V1TR0 Tools",
  description: "Comprime y convierte archivos PDF sin perder calidad. Todo en tu navegador, sin límites.",
}

export default function PDFToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
