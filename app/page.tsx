import HeroSection from "@/components/home/HeroSection"

export const metadata = {
  title: "V1TR0 Tools - Herramientas de Procesamiento de Imágenes",
  description: "Suite completa de herramientas para procesar imágenes 100% en tu navegador. Sin servidores, sin registro, sin límites.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Hero Section - Full viewport with interactive logo */}
      <HeroSection />
    </main>
  )
}
