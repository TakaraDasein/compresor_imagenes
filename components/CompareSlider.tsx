"use client"
import { useState, useEffect, useRef, memo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileDown, FileUp, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

// Paleta de colores derivada del logo
const colors = {
  primary: "#36e2d8", // Color cian principal del logo
  primaryDark: "#209d96", // Versión más oscura del cian
  primaryLight: "#7eeae3", // Versión más clara del cian
  secondary: "#2d3748", // Color oscuro para contraste
  secondaryLight: "#4a5568", // Versión más clara del color oscuro
  accent: "#805ad5", // Color púrpura para acentos
  accentDark: "#6b46c1", // Versión más oscura del púrpura
  danger: "#e53e3e", // Color rojo para acciones destructivas
  success: "#38a169", // Color verde para acciones exitosas
  background: "rgba(15, 23, 42, 0.8)", // Fondo oscuro semitransparente
}

// Hook personalizado para manejar dimensiones de imagen
function useImageDimensions(src: string | undefined, maxWidth = 800, maxHeight = 500) {
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Asegurar que las dimensiones sean números enteros
      setSize({
        width: Math.floor(width),
        height: Math.floor(height),
      })
      setError(false)
    }

    img.onerror = () => {
      console.error("Error loading image:", src)
      setError(true)
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, maxWidth, maxHeight])

  return { size, error }
}

interface CompareSliderProps {
  original: string
  optimized?: string
  isOptimizing?: boolean
  error?: string
  originalSize?: number
  optimizedSize?: number
}

const CompareSlider = memo(function CompareSlider({
  original,
  optimized,
  isOptimizing = false,
  error,
  originalSize,
  optimizedSize,
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { size: imageSize, error: imageError } = useImageDimensions(original)

  // Gestionar URLs de objetos para evitar fugas de memoria
  const optimizedUrlRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    return () => {
      // Limpiar URL al desmontar
      if (optimizedUrlRef.current) {
        URL.revokeObjectURL(optimizedUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (optimized && optimized !== optimizedUrlRef.current) {
      // Limpiar URL anterior si existe
      if (optimizedUrlRef.current) {
        URL.revokeObjectURL(optimizedUrlRef.current)
      }
      optimizedUrlRef.current = optimized
    }
  }, [optimized])

  // Formatear tamaño en KB o MB
  const formatSize = useCallback((bytes?: number) => {
    if (bytes === undefined) return "Desconocido"
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }, [])

  // Calcular porcentaje de reducción
  const getReductionPercent = useCallback(() => {
    if (!originalSize || !optimizedSize) return null
    const reduction = ((originalSize - optimizedSize) / originalSize) * 100
    return reduction > 0 ? reduction.toFixed(1) : "0"
  }, [originalSize, optimizedSize])

  // Si hay un error de optimización
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-900/20 backdrop-blur-md rounded-lg overflow-hidden flex items-center justify-center"
        style={{ width: imageSize.width || 400, height: imageSize.height || 300 }}
      >
        <div className="text-white text-center p-4 flex flex-col items-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" aria-hidden="true" />
          <p className="text-lg font-bold mb-2">Error de optimización</p>
          <p className="text-sm">{error}</p>
        </div>
      </motion.div>
    )
  }

  // Si hay un error de carga de imagen
  if (imageError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-900/20 backdrop-blur-md rounded-lg overflow-hidden flex items-center justify-center"
        style={{ width: 400, height: 300 }}
      >
        <div className="text-white text-center p-4">
          <p className="text-lg font-bold mb-2">Error al cargar la imagen</p>
          <p className="text-sm">No se pudo cargar la imagen. Intente con otra imagen.</p>
        </div>
      </motion.div>
    )
  }

  // Si está optimizando
  if (isOptimizing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-black/20 backdrop-blur-md rounded-lg overflow-hidden flex items-center justify-center"
        style={{ width: imageSize.width || 400, height: imageSize.height || 300 }}
      >
        <img
          src={original || "/placeholder.svg"}
          alt="Original"
          className="max-w-full max-h-full object-contain opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className={`w-12 h-12 border-4 border-[${colors.primary}] border-t-transparent rounded-full animate-spin mb-4`}
            style={{ borderColor: colors.primary, borderTopColor: "transparent" }}
            aria-hidden="true"
          ></div>
          <p className="text-white font-medium">Optimizando imagen...</p>
        </div>
      </motion.div>
    )
  }

  // Si no hay imagen optimizada
  if (!optimized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black/20 backdrop-blur-md rounded-lg overflow-hidden relative"
        style={{ width: imageSize.width || 400, height: imageSize.height || 300 }}
      >
        <div className="absolute inset-0 z-10">
          <img src={original || "/placeholder.svg"} alt="Original" className="w-full h-full object-contain font-mono" />
        </div>

        {/* Indicador visual de que no hay comparación disponible */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div
            className={`bg-[${colors.background}] backdrop-blur-md text-white text-sm px-4 py-2 rounded-full`}
            style={{ backgroundColor: colors.background }}
          >
            Optimiza la imagen para comparar
          </div>
        </div>

        {originalSize && (
          <div
            className={`absolute bottom-2 left-2 bg-[ font-mono${colors.background}] backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center z-40`}
            style={{ backgroundColor: colors.background }}
          >
            <FileUp className="w-3 h-3 mr-1" aria-hidden="true" />
            {formatSize(originalSize)}
          </div>
        )}
      </motion.div>
    )
  }

  // Mostrar comparador
  return (
    <div
      className="bg-black/20 backdrop-blur-md rounded-lg overflow-hidden relative select-none"
      style={{ width: imageSize.width || 400, height: imageSize.height || 300 }}
      ref={containerRef}
      onMouseDown={(e) => {
        // Calcular la posición del clic relativa al ancho del contenedor
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          const containerWidth = rect.width
          const clickX = e.clientX - rect.left
          const newPosition = (clickX / containerWidth) * 100
          setSliderPosition(Math.min(Math.max(newPosition, 0), 100))
          setIsDragging(true)
        }
      }}
      onMouseMove={(e) => {
        if (isDragging && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          const containerWidth = rect.width
          const moveX = e.clientX - rect.left
          const newPosition = (moveX / containerWidth) * 100
          setSliderPosition(Math.min(Math.max(newPosition, 0), 100))
        }
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={(e) => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          const containerWidth = rect.width
          const touchX = e.touches[0].clientX - rect.left
          const newPosition = (touchX / containerWidth) * 100
          setSliderPosition(Math.min(Math.max(newPosition, 0), 100))
          setIsDragging(true)
        }
      }}
      onTouchMove={(e) => {
        if (isDragging && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          const containerWidth = rect.width
          const touchX = e.touches[0].clientX - rect.left
          const newPosition = (touchX / containerWidth) * 100
          setSliderPosition(Math.min(Math.max(newPosition, 0), 100))
        }
      }}
      onTouchEnd={() => setIsDragging(false)}
      onTouchCancel={() => setIsDragging(false)}
    >
      {/* Imagen original (fondo) */}
      <div className="absolute inset-0 z-10">
        <img src={original || "/placeholder.svg"} alt="Original" className="w-full h-full object-contain" />
      </div>

      {/* Imagen optimizada (capa superior con clip) */}
      <div className="absolute inset-0 overflow-hidden z-20" style={{ width: `${sliderPosition}%` }}>
        <img
          src={optimized || "/placeholder.svg"}
          alt="Optimizada"
          className="w-full h-full object-contain"
          style={{
            width: imageSize.width || 400,
            height: imageSize.height || 300,
            maxWidth: "none",
          }}
        />
      </div>

      {/* Línea divisoria del slider con animación */}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-4 bg-gradient-to-r from-transparent via-white/90 to-transparent cursor-ew-resize z-50 flex items-center justify-center image-slider-line transition-all duration-200 hover:w-3",
          "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50",
          isDragging
            ? `shadow-[0_0_20px_rgba(54,226,216,0.9),_0_0_30px_rgba(54,226,216,0.6)] scale-110`
            : `shadow-[0_0_15px_rgba(54,226,216,0.8)]`,
        )}
        style={{
          left: `calc(${sliderPosition}% - 2px)`,
          transition: isDragging ? "none" : "all 0.2s ease",
          background: `linear-gradient(to right, transparent, ${colors.primary}E6, transparent)`,
        }}
        tabIndex={0}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPosition)}
        aria-label="Deslizador para comparar imágenes"
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 1
          switch (e.key) {
            case "ArrowLeft":
              e.preventDefault()
              setSliderPosition((prev) => Math.max(0, prev - step))
              break
            case "ArrowRight":
              e.preventDefault()
              setSliderPosition((prev) => Math.min(100, prev + step))
              break
            case "Home":
              e.preventDefault()
              setSliderPosition(0)
              break
            case "End":
              e.preventDefault()
              setSliderPosition(100)
              break
          }
        }}
      >
        {/* Indicadores de arrastre */}
        <div className="h-12 flex flex-col justify-between items-center pointer-events-none">
          <div
            className={`w-1.5 h-1.5 rounded-full bg-[${colors.primary}] shadow-[0_0_5px_#fff,_0_0_10px_${colors.primary}]`}
            style={{ backgroundColor: colors.primary }}
          ></div>
          <div
            className={`w-1.5 h-1.5 rounded-full bg-[${colors.primary}] shadow-[0_0_5px_#fff,_0_0_10px_${colors.primary}]`}
            style={{ backgroundColor: colors.primary }}
          ></div>
          <div
            className={`w-1.5 h-1.5 rounded-full bg-[${colors.primary}] shadow-[0_0_5px_#fff,_0_0_10px_${colors.primary}]`}
            style={{ backgroundColor: colors.primary }}
          ></div>
        </div>
      </div>

      {/* Etiquetas de información */}
      <div
        className={`absolute top-2 left-2 bg-[${colors.background}] backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center z-40`}
        style={{ backgroundColor: colors.background }}
      >
        <FileUp className="w-3 h-3 mr-1" aria-hidden="true" />
        {formatSize(originalSize)}
      </div>

      <div
        className={`absolute top-2 right-2 bg-[${colors.background}] backdrop-blur-md text-white text-xs px-2 py-1 rounded-full flex items-center z-40`}
        style={{ backgroundColor: colors.background }}
      >
        <FileDown className="w-3 h-3 mr-1" aria-hidden="true" />
        {formatSize(optimizedSize)}
      </div>

      <AnimatePresence>
        {originalSize && optimizedSize && getReductionPercent() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute bottom-2 left-2 bg-[${colors.success}]/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium z-40`}
            style={{ backgroundColor: `${colors.success}CC` }}
          >
            {getReductionPercent()}% reducción
          </motion.div>
        )}
      </AnimatePresence>

      {/* Etiquetas de Original y Optimizado */}
      <div
        className={`absolute bottom-2 left-1/4 transform -translate-x-1/2 bg-[${colors.background}] backdrop-blur-md text-white text-xs px-2 py-1 rounded-full z-40`}
        style={{ backgroundColor: colors.background }}
      >
        Original
      </div>

      <div
        className={`absolute bottom-2 right-1/4 transform translate-x-1/2 bg-[${colors.background}] backdrop-blur-md text-white text-xs px-2 py-1 rounded-full z-40`}
        style={{ backgroundColor: colors.background }}
      >
        Optimizado
      </div>
    </div>
  )
})

export default CompareSlider
