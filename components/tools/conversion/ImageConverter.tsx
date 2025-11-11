"use client"

import { useCallback, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ImageUpIcon,
  Download,
  FileImage,
  ArrowRightLeft,
  Trash2,
  FolderDown,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import DragDropZone from "@/components/shared/DragDropZone"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import NotificationBell from "@/components/NotificationBell"
import { ProcessingProgress } from "@/components/shared/ProcessingProgress"
import { useNotifications } from "@/components/NotificationProvider"
import { useImageWorker } from "@/hooks/use-image-worker"
import {
  convertImage,
  getConvertedFileName,
  formatFileSize,
  downloadConvertedImage,
  downloadConvertedImagesAsZip,
} from "@/lib/image-converter"
import {
  slideDownVariants,
  slideUpVariants,
  scaleVariants,
  buttonHoverVariants,
  staggerContainerVariants,
  staggerItemVariants,
  fadeVariants,
} from "@/lib/animation-variants"
import type { ImageFormat, ConversionResult } from "@/lib/types"

interface ConvertedImage {
  id: string
  originalFile: File
  result?: ConversionResult
  isConverting: boolean
  error?: string
}

const FORMATS: Array<{ value: ImageFormat; label: string; description: string }> = [
  { value: "png", label: "PNG", description: "Alta calidad, soporta transparencia" },
  { value: "jpg", label: "JPG", description: "Buena compresión, ideal para fotos" },
  { value: "webp", label: "WebP", description: "Moderno, excelente compresión" },
  { value: "avif", label: "AVIF", description: "Última generación, mejor compresión" },
  { value: "bmp", label: "BMP", description: "Sin compresión, máxima calidad" },
  { value: "ico", label: "ICO", description: "Iconos de Windows" },
]

export default function ImageConverter() {
  const [images, setImages] = useState<ConvertedImage[]>([])
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("png")
  const [quality, setQuality] = useState(92)
  const [isConverting, setIsConverting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: "danger" | "warning" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })
  const { addNotification } = useNotifications()
  const { processImages, isProcessing, progress } = useImageWorker()
  
  // Stats para el progreso
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
  })

  const sendNotification = useCallback(
    (title: string, message: string, type: "success" | "error" | "info" = "success") => {
      addNotification({
        title,
        message,
        type,
      })
    },
    [addNotification],
  )

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newImages: ConvertedImage[] = files.map((file) => ({
        id: crypto.randomUUID(),
        originalFile: file,
        isConverting: false,
      }))
      setImages((prev) => [...prev, ...newImages])
      sendNotification(
        "Imágenes Agregadas",
        `${files.length} ${files.length === 1 ? "imagen lista" : "imágenes listas"} para convertir`,
        "success",
      )
    },
    [sendNotification],
  )

  const convertSingleImage = useCallback(
    async (imageId: string) => {
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, isConverting: true, error: undefined } : img)),
      )

      const image = images.find((img) => img.id === imageId)
      if (!image) return

      try {
        const result = await convertImage(image.originalFile, targetFormat, { quality: quality / 100 })

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  result,
                  isConverting: false,
                }
              : img,
          ),
        )
        sendNotification(
          "Conversión Exitosa",
          `${image.originalFile.name} convertido a ${targetFormat.toUpperCase()}`,
          "success",
        )
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Error desconocido"
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  isConverting: false,
                  error: errorMsg,
                }
              : img,
          ),
        )
        sendNotification(
          "Error de Conversión",
          `No se pudo convertir ${image.originalFile.name}: ${errorMsg}`,
          "error",
        )
      }
    },
    [images, targetFormat, quality, sendNotification],
  )

  const convertAllImages = useCallback(async () => {
    setIsConverting(true)

    const unconvertedImages = images.filter((img) => !img.result && !img.error)
    
    // Inicializar stats
    setProcessingStats({
      total: unconvertedImages.length,
      completed: 0,
      failed: 0,
    })
    
    sendNotification(
      "Iniciando Conversión",
      `Convirtiendo ${unconvertedImages.length} imágenes a ${targetFormat.toUpperCase()}...`,
      "info",
    )

    // Marcar imágenes como en conversión
    setImages((prev) =>
      prev.map((img) =>
        unconvertedImages.some((ui) => ui.id === img.id)
          ? { ...img, isConverting: true }
          : img,
      ),
    )

    try {
      // Procesar todas las imágenes en paralelo usando el worker
      const files = unconvertedImages.map((img) => img.originalFile)
      const results = await processImages(
        files,
        {
          targetFormat,
          quality,
        },
        'convert'
      )

      // Actualizar resultados
      let successCount = 0
      let failureCount = 0

      results.forEach((result, index) => {
        const image = unconvertedImages[index]
        
        if (result) {
          successCount++
          
          // Crear URL para la imagen convertida
          const url = URL.createObjectURL(result.blob)
          const originalFormat = image.originalFile.type.split("/")[1] as ImageFormat
          const compressionRatio = ((1 - result.size / image.originalFile.size) * 100).toFixed(1)
          
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    result: {
                      blob: result.blob,
                      url,
                      originalSize: image.originalFile.size,
                      convertedSize: result.size,
                      originalFormat,
                      targetFormat,
                      width: result.width,
                      height: result.height,
                      processingTime: 0, // El worker no reporta tiempo
                      compressionRatio: `${compressionRatio}%`,
                    },
                    isConverting: false,
                  }
                : img,
            ),
          )
          
          setProcessingStats((prev) => ({
            ...prev,
            completed: prev.completed + 1,
          }))
        } else {
          failureCount++
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? {
                    ...img,
                    isConverting: false,
                    error: 'Error en la conversión',
                  }
                : img,
            ),
          )
          
          setProcessingStats((prev) => ({
            ...prev,
            failed: prev.failed + 1,
          }))
        }
      })

      sendNotification(
        "Conversión Completada",
        `${successCount} imágenes convertidas exitosamente${failureCount > 0 ? ` (${failureCount} fallidas)` : ''}`,
        failureCount > 0 ? "info" : "success",
      )
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido"
      
      // Marcar todas como fallidas
      setImages((prev) =>
        prev.map((img) =>
          unconvertedImages.some((ui) => ui.id === img.id)
            ? { ...img, isConverting: false, error: errorMsg }
            : img,
        ),
      )
      
      sendNotification(
        "Error de Conversión",
        `Error al convertir las imágenes: ${errorMsg}`,
        "error",
      )
    }

    setIsConverting(false)
    
    const successCount = images.filter((img) => img.result).length
    sendNotification(
      "Conversión Completa",
      `${successCount} imágenes convertidas exitosamente`,
      "success",
    )
  }, [images, convertSingleImage, targetFormat, sendNotification])

  const downloadSingle = useCallback(
    (image: ConvertedImage) => {
      if (!image.result) return

      const fileName = getConvertedFileName(image.originalFile.name, targetFormat)
      downloadConvertedImage(image.result, fileName)
      sendNotification(
        "Descarga Iniciada",
        `Descargando ${fileName}`,
        "success",
      )
    },
    [targetFormat, sendNotification],
  )

  const downloadAll = useCallback(
    async () => {
      const convertedImages = images.filter((img) => img.result)
      if (convertedImages.length === 0) return

      const results = convertedImages.map((img) => img.result!)
      const fileNames = convertedImages.map((img) => getConvertedFileName(img.originalFile.name, targetFormat))

      try {
        await downloadConvertedImagesAsZip(results, fileNames, `converted-images-${targetFormat}.zip`)
        sendNotification(
          "Descarga Completa",
          `${convertedImages.length} imágenes descargadas en ZIP`,
          "success",
        )
      } catch (error) {
        sendNotification(
          "Error de Descarga",
          "No se pudo crear el archivo ZIP",
          "error",
        )
      }
    },
    [images, targetFormat, sendNotification],
  )

  const removeImage = useCallback(
    (imageId: string) => {
      const image = images.find((img) => img.id === imageId)
      if (!image) return

      setConfirmDialog({
        isOpen: true,
        title: "Eliminar Imagen",
        message: `¿Estás seguro de eliminar "${image.originalFile.name}"?`,
        type: "warning",
        onConfirm: () => {
          setImages((prev) => prev.filter((img) => img.id !== imageId))
          sendNotification(
            "Imagen Eliminada",
            "La imagen ha sido removida de la lista",
            "info",
          )
        },
      })
    },
    [images, sendNotification],
  )

  const clearAll = useCallback(() => {
    const count = images.length
    
    setConfirmDialog({
      isOpen: true,
      title: "Limpiar Todo",
      message: `¿Estás seguro de eliminar todas las ${count} imágenes? Esta acción no se puede deshacer.`,
      type: "danger",
      onConfirm: () => {
        images.forEach((img) => {
          if (img.result?.url) {
            URL.revokeObjectURL(img.result.url)
          }
        })
        setImages([])
        sendNotification(
          "Lista Limpiada",
          `${count} ${count === 1 ? "imagen eliminada" : "imágenes eliminadas"}`,
          "info",
        )
      },
    })
  }, [images, sendNotification])

  // Cleanup: Liberar URLs de objeto cuando el componente se desmonte
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.result?.url) {
          URL.revokeObjectURL(img.result.url)
        }
      })
    }
  }, [images])

  const convertedCount = images.filter((img) => img.result).length
  const totalOriginalSize = images.reduce((acc, img) => acc + img.originalFile.size, 0)
  const totalConvertedSize = images.reduce((acc, img) => acc + (img.result?.convertedSize || 0), 0)
  const totalSavings = totalOriginalSize > 0 ? ((1 - totalConvertedSize / totalOriginalSize) * 100).toFixed(1) : "0"

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-4 md:p-6 relative">
      {/* Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell />
      </div>

      {/* Header */}
      <motion.div
        variants={slideDownVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white md:text-5xl">
          Convertidor de <span className="text-[#36e2d8]">Formatos</span>
        </h1>
        <p className="mt-2 text-lg text-slate-300">
          Convierte tus imágenes entre PNG, JPG, WebP, AVIF, BMP e ICO
        </p>
      </motion.div>

      {/* Format Selector */}
      <motion.div
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-slate-800/50 p-6 backdrop-blur-sm"
        role="region"
        aria-label="Selector de formato de salida"
      >
        <div className="flex items-center gap-3 mb-4">
          <ArrowRightLeft className="h-6 w-6 text-[#36e2d8]" aria-hidden="true" />
          <h2 id="format-selector-heading" className="text-xl font-semibold text-white">Formato de Salida</h2>
        </div>

        <div 
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
          role="group"
          aria-labelledby="format-selector-heading"
        >
          {FORMATS.map((format) => (
            <motion.button
              key={format.value}
              onClick={() => setTargetFormat(format.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setTargetFormat(format.value)
                }
              }}
              variants={buttonHoverVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className={`
                rounded-xl p-4 text-center transition-all focus:outline-none focus:ring-2 focus:ring-[#36e2d8] focus:ring-offset-2 focus:ring-offset-slate-900
                ${
                  targetFormat === format.value
                    ? "bg-[#36e2d8] text-slate-900 shadow-lg shadow-[#36e2d8]/20"
                    : "bg-slate-700/50 text-slate-200 hover:bg-slate-700"
                }
              `}
              aria-pressed={targetFormat === format.value}
              aria-label={`Convertir a formato ${format.label}. ${format.description}`}
              type="button"
            >
              <div className="text-2xl font-bold" aria-hidden="true">{format.label}</div>
              <div className="mt-1 text-xs opacity-80" aria-hidden="true">{format.description}</div>
            </motion.button>
          ))}
        </div>

        {/* Quality Slider */}
        {!["png", "bmp", "ico"].includes(targetFormat) && (
          <div className="mt-6" role="region" aria-label="Control de calidad de conversión">
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="quality-slider" 
                className="text-sm font-medium text-slate-300"
              >
                Calidad: {quality}%
              </label>
            </div>
            <input
              id="quality-slider"
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault()
                  setQuality(Math.max(1, quality - 5))
                } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault()
                  setQuality(Math.min(100, quality + 5))
                }
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#36e2d8] focus:outline-none focus:ring-2 focus:ring-[#36e2d8] focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-valuemin={1}
              aria-valuemax={100}
              aria-valuenow={quality}
              aria-label={`Calidad de conversión: ${quality}%. Use las flechas para ajustar de 5 en 5.`}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Más compresión</span>
              <span>Mayor calidad</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upload Zone or Images Grid */}
      <AnimatePresence mode="wait">
        {images.length === 0 ? (
          <motion.div
            key="upload"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DragDropZone
              onFilesSelected={handleFilesSelected}
              accept="image/*"
              multiple={true}
              title="Arrastra tus imágenes aquí"
              description="Soportamos PNG, JPG, WebP, AVIF, BMP. Convierte a cualquier formato."
              icon={<ImageUpIcon className="w-16 h-16" />}
            />
          </motion.div>
        ) : (
          <motion.div
            key="images"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3" role="toolbar" aria-label="Acciones de conversión">
              <motion.button
                onClick={convertAllImages}
                disabled={isConverting || images.every((img) => img.result)}
                variants={buttonHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="flex items-center gap-2 rounded-xl bg-[#36e2d8] px-6 py-3 font-semibold text-slate-900 shadow-lg shadow-[#36e2d8]/20 transition-all hover:bg-[#2dd3c9] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#36e2d8] focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label={`Convertir todas las ${images.length} imágenes a formato ${targetFormat.toUpperCase()}`}
                aria-busy={isConverting}
                type="button"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Convirtiendo...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-5 w-5" aria-hidden="true" />
                    <span>Convertir Todo a {targetFormat.toUpperCase()}</span>
                  </>
                )}
              </motion.button>

              {convertedCount > 0 && (
                <>
                  <motion.button
                    onClick={downloadAll}
                    variants={buttonHoverVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="flex items-center gap-2 rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-label={`Descargar ${convertedCount} ${convertedCount === 1 ? "imagen convertida" : "imágenes convertidas"} en archivo ZIP`}
                    type="button"
                  >
                    <FolderDown className="h-5 w-5" aria-hidden="true" />
                    <span>Descargar Todo ZIP</span>
                  </motion.button>

                  <motion.button
                    onClick={clearAll}
                    variants={buttonHoverVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="flex items-center gap-2 rounded-xl bg-red-600/20 px-6 py-3 font-semibold text-red-400 transition-all hover:bg-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-label={`Eliminar todas las ${images.length} imágenes de la lista`}
                    type="button"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                    <span>Limpiar Todo</span>
                  </motion.button>
                </>
              )}
            </div>

            {/* Stats */}
            {convertedCount > 0 && (
              <motion.div
                variants={slideUpVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-4 md:grid-cols-4"
                role="region"
                aria-label="Estadísticas de conversión"
              >
                <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm" role="status">
                  <div className="text-sm text-slate-400">Convertidas</div>
                  <div className="text-2xl font-bold text-white" aria-label={`${convertedCount} de ${images.length} imágenes convertidas`}>
                    {convertedCount}/{images.length}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm" role="status">
                  <div className="text-sm text-slate-400">Tamaño Original</div>
                  <div className="text-2xl font-bold text-white" aria-label={`Tamaño original total: ${formatFileSize(totalOriginalSize)}`}>
                    {formatFileSize(totalOriginalSize)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm" role="status">
                  <div className="text-sm text-slate-400">Tamaño Final</div>
                  <div className="text-2xl font-bold text-white" aria-label={`Tamaño final total: ${formatFileSize(totalConvertedSize)}`}>
                    {formatFileSize(totalConvertedSize)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm" role="status">
                  <div className="text-sm text-slate-400">Ahorro</div>
                  <div className="text-2xl font-bold text-[#36e2d8]" aria-label={`Ahorro total: ${totalSavings} por ciento`}>
                    {totalSavings}%
                  </div>
                </div>
              </motion.div>
            )}

            {/* Images Grid */}
            <motion.div 
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              role="list"
              aria-label="Lista de imágenes para convertir"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  variants={staggerItemVariants}
                  layout
                  className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm"
                  role="listitem"
                >
                  {/* Image Preview */}
                  <div className="aspect-video relative overflow-hidden bg-slate-900">
                    <img
                      src={image.result?.url || URL.createObjectURL(image.originalFile)}
                      alt={`Imagen: ${image.originalFile.name}${image.result ? " (convertida)" : ""}`}
                      className="h-full w-full object-contain"
                    />
                    
                    {/* Status Overlay */}
                    {image.isConverting && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-slate-900/80"
                        role="status"
                        aria-live="polite"
                        aria-label="Convirtiendo imagen"
                      >
                        <Loader2 className="h-12 w-12 animate-spin text-[#36e2d8]" aria-hidden="true" />
                      </div>
                    )}

                    {image.result && (
                      <div className="absolute top-2 right-2" role="status" aria-label="Conversión completada">
                        <CheckCircle2 className="h-6 w-6 text-green-400" aria-hidden="true" />
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          removeImage(image.id)
                        }
                      }}
                      className="absolute top-2 left-2 rounded-lg bg-red-600/80 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                      aria-label={`Eliminar imagen ${image.originalFile.name}`}
                      type="button"
                    >
                      <X className="h-4 w-4 text-white" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-sm font-medium text-white truncate" title={image.originalFile.name}>
                        {image.originalFile.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        <span aria-label={`Tamaño original: ${formatFileSize(image.originalFile.size)}`}>
                          {formatFileSize(image.originalFile.size)}
                        </span>
                        {image.result && (
                          <>
                            {" → "}
                            <span 
                              className="text-[#36e2d8]"
                              aria-label={`Tamaño convertido: ${formatFileSize(image.result.convertedSize)}`}
                            >
                              {formatFileSize(image.result.convertedSize)}
                            </span>
                            {" "}
                            <span 
                              className="text-green-400"
                              aria-label={`Reducción: ${image.result.compressionRatio}`}
                            >
                              ({image.result.compressionRatio})
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {image.error && (
                      <div 
                        className="text-xs text-red-400 bg-red-600/10 rounded px-2 py-1"
                        role="alert"
                        aria-live="assertive"
                      >
                        {image.error}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2" role="group" aria-label="Acciones de imagen">
                      {!image.result && !image.isConverting && (
                        <button
                          onClick={() => convertSingleImage(image.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              convertSingleImage(image.id)
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#36e2d8] px-3 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-[#2dd3c9] focus:outline-none focus:ring-2 focus:ring-[#36e2d8] focus:ring-offset-2 focus:ring-offset-slate-800"
                          aria-label={`Convertir ${image.originalFile.name} a formato ${targetFormat.toUpperCase()}`}
                          type="button"
                        >
                          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
                          <span>Convertir</span>
                        </button>
                      )}

                      {image.result && (
                        <button
                          onClick={() => downloadSingle(image)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              downloadSingle(image)
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                          aria-label={`Descargar ${getConvertedFileName(image.originalFile.name, targetFormat)}`}
                          type="button"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          <span>Descargar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Add More Button */}
            <motion.button
              onClick={() => {
                const input = document.createElement("input")
                input.type = "file"
                input.accept = "image/*"
                input.multiple = true
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || [])
                  handleFilesSelected(files)
                }
                input.click()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/*"
                  input.multiple = true
                  input.onchange = (ev) => {
                    const files = Array.from((ev.target as HTMLInputElement).files || [])
                    handleFilesSelected(files)
                  }
                  input.click()
                }
              }}
              variants={buttonHoverVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="w-full rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/30 p-6 text-slate-300 transition-all hover:border-[#36e2d8] hover:bg-slate-800/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#36e2d8] focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Añadir más imágenes para convertir. Abre el selector de archivos."
              type="button"
            >
              <FileImage className="mx-auto h-8 w-8 mb-2" aria-hidden="true" />
              <span className="font-semibold">Añadir más imágenes</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />

      {/* Processing Progress */}
      <ProcessingProgress
        isProcessing={isProcessing}
        progress={progress}
        total={processingStats.total}
        completed={processingStats.completed}
        failed={processingStats.failed}
      />
    </div>
  )
}
