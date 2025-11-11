'use client'

import type React from 'react'
import { motion } from 'framer-motion'
import { FileImage, X } from 'lucide-react'

interface ImagePreviewProps {
  image: string
  fileName?: string
  fileSize?: number
  format?: string
  dimensions?: { width: number; height: number }
  onRemove?: () => void
  className?: string
  showInfo?: boolean
}

/**
 * Componente ImagePreview
 * Muestra una previsualización de imagen con información adicional
 * 
 * @param image - URL de la imagen a mostrar
 * @param fileName - Nombre del archivo
 * @param fileSize - Tamaño del archivo en bytes
 * @param format - Formato de la imagen (PNG, JPG, etc.)
 * @param dimensions - Dimensiones de la imagen {width, height}
 * @param onRemove - Callback para eliminar la imagen
 * @param className - Clases CSS adicionales
 * @param showInfo - Si debe mostrar información adicional
 */
export default function ImagePreview({
  image,
  fileName,
  fileSize,
  format,
  dimensions,
  onRemove,
  className = '',
  showInfo = true,
}: ImagePreviewProps) {
  
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <motion.div
      className={`relative rounded-xl overflow-hidden bg-white/5 border border-white/10 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* Imagen */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900/50">
        <img
          src={image}
          alt={fileName || 'Preview'}
          className="w-full h-full object-contain"
        />
        
        {/* Botón eliminar */}
        {onRemove && (
          <motion.button
            onClick={onRemove}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 hover:bg-red-600 text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Eliminar imagen"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Información de la imagen */}
      {showInfo && (
        <div className="p-4 space-y-2">
          {/* Nombre del archivo */}
          {fileName && (
            <div className="flex items-center gap-2 text-white/90">
              <FileImage className="w-4 h-4 text-[#36e2d8]" />
              <span className="text-sm font-medium truncate" title={fileName}>
                {fileName}
              </span>
            </div>
          )}

          {/* Información adicional */}
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            {format && (
              <span className="px-2 py-1 rounded bg-[#36e2d8]/20 text-[#36e2d8] font-mono uppercase">
                {format}
              </span>
            )}
            
            {fileSize !== undefined && (
              <span className="px-2 py-1 rounded bg-white/5">
                {formatSize(fileSize)}
              </span>
            )}
            
            {dimensions && (
              <span className="px-2 py-1 rounded bg-white/5">
                {dimensions.width} × {dimensions.height}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
