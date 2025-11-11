'use client'

import type React from 'react'
import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { ImageUp } from 'lucide-react'

interface DragDropZoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
  title?: string
  description?: string
}

/**
 * Componente DragDropZone
 * Componente reutilizable para cargar archivos mediante drag & drop o clic
 * 
 * @param onFilesSelected - Callback que se ejecuta cuando se seleccionan archivos
 * @param accept - Tipos de archivo aceptados (ej: "image/*")
 * @param multiple - Si permite múltiples archivos
 * @param maxFiles - Número máximo de archivos permitidos
 * @param className - Clases CSS adicionales
 * @param disabled - Si el componente está deshabilitado
 * @param icon - Icono personalizado a mostrar
 * @param title - Título personalizado
 * @param description - Descripción personalizada
 */
export default function DragDropZone({
  onFilesSelected,
  accept = 'image/*',
  multiple = true,
  maxFiles,
  className = '',
  disabled = false,
  icon,
  title = 'Arrastra y suelta tus imágenes',
  description = 'O haz clic para seleccionar. Soportamos PNG, JPG, WebP.',
}: DragDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        let files = Array.from(e.target.files)
        
        // Limitar número de archivos si maxFiles está definido
        if (maxFiles && files.length > maxFiles) {
          files = files.slice(0, maxFiles)
        }
        
        onFilesSelected(files)
        
        // Resetear input para permitir seleccionar los mismos archivos
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [onFilesSelected, maxFiles]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      
      if (disabled) return
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        let files = Array.from(e.dataTransfer.files)
        
        // Limitar número de archivos si maxFiles está definido
        if (maxFiles && files.length > maxFiles) {
          files = files.slice(0, maxFiles)
        }
        
        onFilesSelected(files)
      }
    },
    [onFilesSelected, maxFiles, disabled]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  return (
    <motion.div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`
        m-auto flex max-w-2xl flex-col items-center justify-center 
        rounded-2xl border-2 border-dashed border-white/20 
        bg-white/5 p-10 cursor-pointer font-mono gap-4
        transition-all duration-300
        hover:border-[#36e2d8]/30 hover:bg-white/10
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      role="button"
      tabIndex={disabled ? -1 : 0}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Icono */}
      <motion.div
        className="bg-[#36e2d8]/20 rounded-full flex items-center justify-center w-60 mb-0 h-40"
        style={{ boxShadow: 'rgba(54, 226, 216, 0.1) 0px 0px 0px 0px' }}
        whileHover={{ boxShadow: 'rgba(54, 226, 216, 0.2) 0px 0px 20px 0px' }}
        tabIndex={0}
      >
        <motion.div
          style={{ opacity: 0.6 }}
          whileHover={{ opacity: 1, scale: 1.1, rotate: 0 }}
          initial={{ scale: 0.75, rotate: -20 }}
          transition={{ duration: 0.3 }}
        >
          {icon || (
            <ImageUp className="w-16 h-16 text-[#36e2d8]" />
          )}
        </motion.div>
      </motion.div>

      {/* Título */}
      <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>

      {/* Descripción */}
      <p className="text-sm text-white/70 mb-6 text-center max-w-sm">{description}</p>

      {/* Info adicional */}
      {maxFiles && (
        <p className="text-xs text-[#36e2d8]/70">
          Máximo {maxFiles} {maxFiles === 1 ? 'archivo' : 'archivos'}
        </p>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
      />
    </motion.div>
  )
}
