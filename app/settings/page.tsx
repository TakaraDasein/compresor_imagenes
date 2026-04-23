import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <SettingsIcon className="w-8 h-8 text-[#36e2d8]" />
            <h1 className="text-4xl font-thin text-slate-100 font-mono">
              Configuración
            </h1>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* General Settings */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-2xl font-thin text-slate-100 font-mono mb-4">
                General
              </h2>
              <p className="text-slate-400 font-mono">
                La configuración estará disponible próximamente. Aquí podrás personalizar:
              </p>
              <ul className="mt-4 space-y-2 text-slate-400 font-mono list-disc list-inside">
                <li>Preferencias de compresión predeterminadas</li>
                <li>Formatos de salida favoritos</li>
                <li>Tema y apariencia</li>
                <li>Atajos de teclado</li>
              </ul>
            </section>

            {/* Privacy Settings */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-2xl font-thin text-slate-100 font-mono mb-4">
                Privacidad
              </h2>
              <div className="flex items-start gap-3 text-slate-300 font-mono">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#36e2d8]/20 flex items-center justify-center text-[#36e2d8] text-sm">
                  ✓
                </div>
                <div>
                  <p className="font-medium mb-1">100% Privado</p>
                  <p className="text-sm text-slate-400">
                    Todas las herramientas procesan tus archivos completamente en tu navegador. 
                    Nada se envía a servidores externos.
                  </p>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-2xl font-thin text-slate-100 font-mono mb-4">
                Acerca de
              </h2>
              <p className="text-slate-400 font-mono">
                V1TR0 Tools - Suite de herramientas de procesamiento de imágenes
              </p>
              <p className="text-slate-400 font-mono mt-2 text-sm">
                Versión 1.0.0
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
