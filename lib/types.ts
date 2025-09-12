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
