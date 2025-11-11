export interface CompressionOptions {
  png: {
    quality: number
    dithering: boolean
  }
  jpeg: {
    quality: number
    progressive: boolean
  }
  webp: {
    quality: number
    lossless: boolean
  }
  avif: {
    quality: number
    lossless: boolean
  }
  outputFormat: "auto" | "png" | "jpeg" | "webp" | "avif"
  resizeMode: "none" | "conservative" | "moderate" | "aggressive"
  autoAdjust: boolean
}

export type ImageItem = {
  id: string
  file: File
  preview: string
  optimized?: string
  isOptimizing?: boolean
  error?: string
  originalSize: number
  optimizedSize?: number
}

export type OptimizationStats = {
  totalOriginalSize: number
  totalOptimizedSize: number
  averageReduction: number
  imagesOptimized: number
  successRate: number
}

// ============================================
// NUEVOS TIPOS - ARQUITECTURA DE HERRAMIENTAS
// ============================================

export type Tool = 'compression' | 'conversion'

export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp' | 'ico' | 'avif' | 'bmp'

export interface FormatConfig {
  id: ImageFormat
  name: string
  extension: string
  mimeType: string
  description: string
  supportsTransparency: boolean
}

export interface ToolConfig {
  id: Tool
  name: string
  description: string
  icon: string // Nombre del icono de lucide-react
  component: string // Nombre del componente
  enabled: boolean
}

export interface ConversionOptions {
  quality?: number
  width?: number
  height?: number
  preserveMetadata?: boolean
}

export interface ConversionResult {
  blob: Blob
  url: string
  originalSize: number
  convertedSize: number
  originalFormat: ImageFormat
  targetFormat: ImageFormat
  width: number
  height: number
  processingTime: number
  compressionRatio: string
}
