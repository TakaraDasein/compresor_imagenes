import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configuración - V1TR0 Tools',
  description: 'Configura tus preferencias de herramientas',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
