import HeroSection from "@/components/home/HeroSection"
import FeaturedToolsGrid from "@/components/home/FeaturedToolsGrid"
import Footer from "@/components/Footer"
import { FEATURED_TOOLS } from "@/lib/constants/tools"

export const metadata = {
  title: "V1TR0 Tools - Herramientas de Procesamiento de Imágenes",
  description: "Suite completa de herramientas para procesar imágenes 100% en tu navegador. Sin servidores, sin registro, sin límites.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Hero Section - Full viewport */}
      <HeroSection />

      {/* Tools Grid Section */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <FeaturedToolsGrid tools={FEATURED_TOOLS} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 md:px-8 py-12 md:py-16 text-center font-mono">
        <Footer />
      </div>
    </main>
  )
}
