import type { ToolConfig } from '@/lib/types'

/**
 * Configuración de todas las herramientas disponibles
 * Cada herramienta debe tener:
 * - id: identificador único
 * - slug: URL slug para routing (ej: /tools/compressor)
 * - name: nombre mostrado
 * - description: descripción breve
 * - longDescription: descripción extendida para la landing
 * - icon: nombre del icono de lucide-react
 * - component: nombre del componente a renderizar
 * - enabled: si está disponible para usar
 * - category: categoría de la herramienta
 * - featured: si aparece destacada en la landing
 * - tags: etiquetas para búsqueda/filtrado
 */
export const TOOLS: Record<string, ToolConfig> = {
  compressor: {
    id: 'compressor',
    slug: 'compressor',
    name: 'Compresor de Imágenes',
    description: 'Reduce el tamaño de tus imágenes manteniendo la calidad',
    longDescription: 'Optimiza tus imágenes directamente en tu navegador sin enviar datos a ningún servidor. Toda la compresión se realiza localmente en tu dispositivo con algoritmos de última generación.',
    icon: 'ImageDown',
    component: 'ImageCompressorLocal',
    enabled: true,
    category: 'image',
    featured: true,
    tags: ['compresión', 'optimización', 'reducir tamaño', 'png', 'jpeg', 'webp'],
  },
  converter: {
    id: 'converter',
    slug: 'converter',
    name: 'Conversor de Formatos',
    description: 'Convierte entre diferentes formatos de imagen',
    longDescription: 'Convierte tus imágenes entre PNG, JPG, WebP, AVIF, ICO y más formatos. Procesado 100% en tu navegador, sin subir archivos a ningún servidor.',
    icon: 'RefreshCw',
    component: 'ImageConverter',
    enabled: true,
    category: 'image',
    featured: true,
    tags: ['conversión', 'formato', 'png', 'jpg', 'webp', 'avif', 'ico'],
  },
}

/**
 * Lista ordenada de herramientas disponibles
 */
export const AVAILABLE_TOOLS = Object.values(TOOLS).filter((tool) => tool.enabled)

/**
 * Herramientas destacadas para mostrar en landing
 */
export const FEATURED_TOOLS = AVAILABLE_TOOLS.filter((tool) => tool.featured)

/**
 * Obtener configuración de herramienta por slug
 */
export const getToolBySlug = (slug: string): ToolConfig | undefined => {
  return AVAILABLE_TOOLS.find((tool) => tool.slug === slug)
}
