import type { ToolConfig } from '@/lib/types'

/**
 * Configuración de todas las herramientas disponibles
 * Cada herramienta debe tener:
 * - id: identificador único
 * - name: nombre mostrado
 * - description: descripción breve
 * - icon: nombre del icono de lucide-react
 * - component: nombre del componente a renderizar
 * - enabled: si está disponible para usar
 */
export const TOOLS: Record<string, ToolConfig> = {
  compression: {
    id: 'compression',
    name: 'Compresión de Imágenes',
    description: 'Reduce el tamaño de tus imágenes manteniendo la calidad',
    icon: 'Zap',
    component: 'ImageCompressorLocal',
    enabled: true,
  },
  conversion: {
    id: 'conversion',
    name: 'Convertir Formato',
    description: 'Convierte entre diferentes formatos de imagen',
    icon: 'RefreshCw',
    component: 'ImageConverter',
    enabled: true,
  },
}

/**
 * Lista ordenada de herramientas disponibles
 */
export const AVAILABLE_TOOLS = Object.values(TOOLS).filter((tool) => tool.enabled)
