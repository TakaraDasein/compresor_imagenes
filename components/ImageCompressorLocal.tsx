"use client"

import type React from "react"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FolderTreeIcon,
  PlayIcon,
  Zap,
  BarChart4,
  FileDownIcon,
  Download,
  Grid3x3,
  List,
  Plus,
  X,
  ImageUpIcon,
} from "lucide-react"
import JSZip from "jszip"
import VerticalCarousel from "./VerticalCarousel"
import CompareSlider from "./CompareSlider"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { optimizeImage } from "@/lib/image-optimizer"
import type { CompressionOptions } from "@/lib/types"
import type { ImageItem, OptimizationStats } from "@/lib/types"
import NotificationBell from "./NotificationBell"

// Tipos de formato de salida disponibles
type OutputFormat = "auto" | "png" | "jpeg" | "webp" | "avif"

// Paleta de colores derivada del logo
const colors = {
  primary: "#36e2d8",
  primaryDark: "#209d96",
  primaryLight: "#7eeae3",
  secondary: "#2d3748",
  secondaryLight: "#4a5568",
  accent: "#805ad5",
  accentDark: "#6b46c1",
  danger: "#e53e3e",
  success: "#38a169",
  background: "rgba(15, 23, 42, 0.8)",
}

const iconContainerVariants = {
  rest: {
    scale: 1,
    boxShadow: `0 0 0px 0px ${colors.primary}1A`,
  },
  hover: {
    scale: 1.1,
    boxShadow: `0 0 30px 10px ${colors.primary}66`,
    transition: { type: "spring", stiffness: 250, damping: 15 },
  },
}

const uploadIconItselfVariants = {
  rest: {
    opacity: 0.6,
    scale: 0.75,
    rotate: -20,
  },
  hover: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 12, delay: 0.05 },
  },
}

const sendNotification = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info") => {
  if (typeof window !== "undefined" && (window as any).notificationSystem) {
    ;(window as any).notificationSystem.addNotification({
      title,
      message,
      type,
    })
  }
}

interface ImageCompressorLocalProps {
  onImagesCountChange?: (count: number) => void
}

export default function ImageCompressorLocal({ onImagesCountChange }: ImageCompressorLocalProps) {
  const [showOptimizeOneTooltip, setShowOptimizeOneTooltip] = useState(false)
  const [showOptimizeAllTooltip, setShowOptimizeAllTooltip] = useState(false)
  const [showDownloadOneTooltip, setShowDownloadOneTooltip] = useState(false)
  const [showDownloadAllTooltip, setShowDownloadAllTooltip] = useState(false)
  const [showFormatTooltip, setShowFormatTooltip] = useState<string | null>(null)
  const [showCompressionModeTooltip, setShowCompressionModeTooltip] = useState<string | null>(null)
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [options, setOptions] = useState<CompressionOptions>({
    png: { quality: 85, dithering: false },
    jpeg: { quality: 85, progressive: true },
    webp: { quality: 85, lossless: false },
    avif: { quality: 80, lossless: false },
    outputFormat: "auto",
    resizeMode: "conservative",
    autoAdjust: true,
  })
  const [carouselView, setCarouselView] = useState<"list" | "grid">("list")
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [compressionMode, setCompressionMode] = useState<"balanced" | "enhanced" | "maximum">("balanced")
  const [stats, setStats] = useState<OptimizationStats | null>(null)

  useEffect(() => {
    if (onImagesCountChange) {
      onImagesCountChange(images.length)
    }
  }, [images.length, onImagesCountChange])

  // Cambiar automáticamente a vista de cuadrícula cuando hay múltiples imágenes
  useEffect(() => {
    if (images.length > 1 && carouselView === "list") {
      setCarouselView("grid")
    }
  }, [images.length, carouselView])

  const calculatedStats = useMemo(() => {
    const optimizedImages = images.filter((img) => img.optimized && img.optimizedSize)
    if (optimizedImages.length === 0) {
      setStats(null)
      return null
    }
    const totalOriginalSize = optimizedImages.reduce((sum, img) => sum + img.originalSize, 0)
    const totalOptimizedSize = optimizedImages.reduce((sum, img) => sum + (img.optimizedSize || 0), 0)
    const averageReduction =
      totalOriginalSize > 0 ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100 : 0
    const successRate = images.length > 0 ? (optimizedImages.length / images.length) * 100 : 0
    const newStats = {
      totalOriginalSize,
      totalOptimizedSize,
      averageReduction,
      imagesOptimized: optimizedImages.length,
      successRate,
    }
    setStats(newStats)
    return newStats
  }, [images])

  const optimizedImagesCount = useMemo(() => images.filter((img) => img.optimized).length, [images])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        const newImages = Array.from(e.target.files).map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          originalSize: file.size,
        }))
        setImages((prev) => [...prev, ...newImages])
        if (!selectedImage && newImages.length > 0) {
          setSelectedImage(newImages[0])
        }
        sendNotification(
          "Imágenes añadidas",
          `Se han añadido ${newImages.length} ${newImages.length === 1 ? "imagen" : "imágenes"}.`,
          "info",
        )
      }
    },
    [selectedImage],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (e.dataTransfer.files?.length) {
        const newImages = Array.from(e.dataTransfer.files).map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          originalSize: file.size,
        }))
        setImages((prev) => [...prev, ...newImages])
        if (!selectedImage && newImages.length > 0) {
          setSelectedImage(newImages[0])
        }
        sendNotification(
          "Imágenes añadidas",
          `Se han añadido ${newImages.length} ${newImages.length === 1 ? "imagen" : "imágenes"} por arrastrar y soltar.`,
          "info",
        )
      }
    },
    [selectedImage],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => e.preventDefault(), [])

  const changeOutputFormat = useCallback((format: OutputFormat) => {
    setOptions((prev) => ({ ...prev, outputFormat: format }))
    toast({
      title: `Formato cambiado a ${format === "auto" ? "Automático" : format.toUpperCase()}`,
      description:
        format === "auto"
          ? "Se mantendrá el formato original."
          : `Las imágenes se convertirán a ${format.toUpperCase()}.`,
    })
    sendNotification("Formato cambiado", `Formato de salida: ${format.toUpperCase()}.`, "info")
  }, [])

  const setCompressionSettings = useCallback((mode: "balanced" | "enhanced" | "maximum") => {
    let newOptions: Partial<CompressionOptions> = {}
    let toastTitle = ""
    let toastDescription = ""

    switch (mode) {
      case "enhanced":
        newOptions = {
          png: { quality: 80, dithering: false },
          jpeg: { quality: 75, progressive: true },
          webp: { quality: 75, lossless: false },
          avif: { quality: 70, lossless: false },
          resizeMode: "moderate",
        }
        toastTitle = "Compresión Mejorada"
        toastDescription = "Buen equilibrio entre calidad y tamaño."
        break
      case "maximum":
        newOptions = {
          png: { quality: 70, dithering: true },
          jpeg: { quality: 65, progressive: true },
          webp: { quality: 65, lossless: false },
          avif: { quality: 60, lossless: false },
          outputFormat: "webp",
          resizeMode: "moderate",
        }
        toastTitle = "Compresión Máxima"
        toastDescription = "Máxima reducción de tamaño."
        break
      case "balanced":
      default:
        newOptions = {
          png: { quality: 90, dithering: false },
          jpeg: { quality: 85, progressive: true },
          webp: { quality: 85, lossless: false },
          avif: { quality: 80, lossless: false },
          resizeMode: "conservative",
        }
        toastTitle = "Compresión Equilibrada"
        toastDescription = "Alta calidad visual."
        break
    }

    setOptions((prev) => ({ ...prev, ...newOptions }))
    setCompressionMode(mode)
    toast({ title: toastTitle, description: toastDescription })
    sendNotification("Modo de compresión cambiado", toastTitle, "info")
  }, [])

  const handleOptimize = useCallback(
    async (imageToOptimize: ImageItem) => {
      setImages((prev) =>
        prev.map((img) => (img.id === imageToOptimize.id ? { ...img, isOptimizing: true, error: undefined } : img)),
      )
      if (selectedImage?.id === imageToOptimize.id) {
        setSelectedImage((prev) => (prev ? { ...prev, isOptimizing: true, error: undefined } : null))
      }

      try {
        const result = await optimizeImage(imageToOptimize.file, options)
        if (!result) throw new Error("La optimización falló")

        const { optimizedBlob, originalSize, optimizedSize } = result
        if (optimizedSize >= originalSize) {
          toast({ title: "Imagen ya optimizada", description: "No se realizaron cambios." })
          sendNotification("Imagen ya optimizada", "No se realizaron cambios.", "info")
          setImages((prev) =>
            prev.map((img) =>
              img.id === imageToOptimize.id
                ? { ...img, optimized: img.preview, isOptimizing: false, optimizedSize: originalSize }
                : img,
            ),
          )
          if (selectedImage?.id === imageToOptimize.id) {
            setSelectedImage((prev) =>
              prev ? { ...prev, optimized: prev.preview, isOptimizing: false, optimizedSize: originalSize } : null,
            )
          }
          return
        }

        const optimizedUrl = URL.createObjectURL(optimizedBlob)
        const reductionPercent = ((originalSize - optimizedSize) / originalSize) * 100
        const message = `Reducción del ${reductionPercent.toFixed(1)}% (${formatSize(originalSize)} → ${formatSize(optimizedSize)})`
        toast({ title: "Imagen optimizada", description: message })
        sendNotification("Imagen optimizada", message, "success")

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageToOptimize.id
              ? { ...img, optimized: optimizedUrl, isOptimizing: false, optimizedSize }
              : img,
          ),
        )
        if (selectedImage?.id === imageToOptimize.id) {
          setSelectedImage((prev) =>
            prev ? { ...prev, optimized: optimizedUrl, isOptimizing: false, optimizedSize } : null,
          )
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        toast({ title: "Error", description: `Error al optimizar: ${errorMessage}`, variant: "destructive" })
        sendNotification("Error de optimización", errorMessage, "error")
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageToOptimize.id ? { ...img, isOptimizing: false, error: errorMessage } : img,
          ),
        )
        if (selectedImage?.id === imageToOptimize.id) {
          setSelectedImage((prev) => (prev ? { ...prev, isOptimizing: false, error: errorMessage } : null))
        }
      }
    },
    [options, selectedImage],
  )

  const handleBatchOptimize = useCallback(async () => {
    if (images.length === 0) return
    toast({ title: "Procesamiento por lotes", description: `Optimizando ${images.length} imágenes...` })
    sendNotification("Procesamiento por lotes", `Optimizando ${images.length} imágenes...`, "info")
    for (const image of images) {
      if (!image.optimized) {
        await handleOptimize(image)
      }
    }
  }, [images, handleOptimize])

  const handleSelectImage = useCallback((image: ImageItem) => setSelectedImage(image), [])

  const handleRemoveImage = useCallback(
    (imageId: string) => {
      setImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === imageId)
        if (imageToRemove) {
          if (imageToRemove.preview) URL.revokeObjectURL(imageToRemove.preview)
          if (imageToRemove.optimized) URL.revokeObjectURL(imageToRemove.optimized)
        }
        const remaining = prev.filter((img) => img.id !== imageId)
        if (selectedImage?.id === imageId) {
          setSelectedImage(remaining.length > 0 ? remaining[0] : null)
        }
        return remaining
      })
      toast({ title: "Imagen eliminada" })
      sendNotification("Imagen eliminada", "La imagen ha sido eliminada.", "info")
    },
    [selectedImage],
  )

  const handleClearAllImages = useCallback(() => {
    images.forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview)
      if (img.optimized) URL.revokeObjectURL(img.optimized)
    })
    setImages([])
    setSelectedImage(null)
    toast({ title: "Imágenes eliminadas", description: "Se han eliminado todas las imágenes." })
    sendNotification("Imágenes eliminadas", "Se han eliminado todas las imágenes.", "info")
  }, [images])

  const handleDownloadAllAsZip = useCallback(async () => {
    const optimizedImages = images.filter((img) => img.optimized)
    if (optimizedImages.length === 0) return

    setIsDownloadingZip(true)
    toast({ title: "Preparando descarga", description: `Creando ZIP con ${optimizedImages.length} imágenes...` })
    sendNotification("Preparando descarga", `Creando ZIP...`, "info")

    try {
      const zip = new JSZip()
      for (const image of optimizedImages) {
        if (!image.optimized) {
          console.warn(`Saltando ${image.file.name} ya que no tiene versión optimizada.`)
          continue
        }

        console.log(`Procesando ${image.file.name} para ZIP. URL Optimizada: ${image.optimized}`)

        try {
          const response = await fetch(image.optimized)
          if (!response.ok) {
            const errorText = await response.text().catch(() => "No se pudo leer el texto de la respuesta de error.")
            console.error(
              `Falló el fetch para ${image.file.name} con estado ${response.status}. URL: ${image.optimized}. Texto de respuesta: ${errorText}`,
            )
            throw new Error(
              `Falló al obtener la imagen optimizada ${image.file.name}: ${response.status} ${response.statusText}`,
            )
          }
          const blob = await response.blob()

          const extension =
            options.outputFormat === "auto"
              ? blob.type.split("/")[1] || "jpg" // Fallback a jpg si el tipo falta
              : options.outputFormat === "jpeg"
                ? "jpg"
                : options.outputFormat
          const fileName = `${image.file.name.replace(/\.[^/.]+$/, "")}.${extension}`
          zip.file(fileName, blob)
        } catch (fetchOrProcessError) {
          console.error(
            `Error al obtener o procesar blob para ${image.file.name} (URL: ${image.optimized}):`,
            fetchOrProcessError,
          )
          sendNotification(
            "Error al procesar imagen",
            `No se pudo incluir "${image.file.name}" en el ZIP. Razón: ${fetchOrProcessError instanceof Error ? fetchOrProcessError.message : String(fetchOrProcessError)}`,
            "error",
          )
          // Continuar con otras imágenes
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `imagenes-optimizadas.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)
      toast({ title: "Descarga completada", description: `ZIP con ${optimizedImages.length} imágenes descargado.` })
      sendNotification("Descarga completada", `ZIP descargado.`, "success")
    } catch (error) {
      console.error("Error creating ZIP:", error)
      toast({ title: "Error", description: "No se pudo crear el archivo ZIP.", variant: "destructive" })
      sendNotification("Error de descarga", "No se pudo crear el ZIP.", "error")
    } finally {
      setIsDownloadingZip(false)
    }
  }, [images, options.outputFormat])

  const formatSize = useCallback((bytes?: number) => {
    if (bytes === undefined) return "N/A"
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }, [])

  const availableFormats: OutputFormat[] = ["auto", "png", "jpeg", "webp", "avif"]

  const StyledButton = ({
    onClick,
    disabled = false,
    isLoading = false,
    icon,
    children,
    variant = "default",
    className = "",
    selected = false,
    responsiveText = false,
  }) => {
    const baseStyle = "px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
    let variantStyle = ""
    switch (variant) {
      case "primary":
        variantStyle = `bg-gradient-to-r from-[${colors.primary}] to-[${colors.primaryDark}] hover:from-[${colors.primaryDark}] hover:to-[${colors.primary}] text-slate-900 font-medium shadow-md`
        break
      case "secondary":
        variantStyle = `border border-[${colors.primary}] text-[${colors.primary}] hover:bg-[${colors.primary}]/15 font-medium shadow-sm backdrop-blur-sm`
        break
      case "success":
        variantStyle = `bg-gradient-to-r from-[${colors.primary}] to-[${colors.primaryDark}] hover:from-[${colors.primaryDark}] hover:to-[${colors.primary}] text-slate-900 font-medium shadow-md`
        break
      case "danger":
        variantStyle = `bg-[${colors.danger}]/80 hover:bg-[${colors.danger}] text-white font-medium shadow-md`
        break
      case "format":
        variantStyle = selected
          ? `bg-[${colors.primary}] text-slate-900 font-medium shadow-md`
          : `bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-medium`
        break
      default:
        variantStyle = `bg-white/15 hover:bg-white/25 text-white font-medium backdrop-blur-sm shadow-sm ${selected ? `ring-2 ring-[${colors.primary}] shadow-[0_0_10px_rgba(54,226,216,0.5)]` : ""}`
        break
    }
    return (
      <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variantStyle} ${className}`}>
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>
    )
  }

  const DownloadButton = ({ imageUrl, fileName, outputFormat }) => {
    const handleDownload = useCallback(async () => {
      if (!imageUrl) return
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const extension =
          outputFormat === "auto" ? blob.type.split("/")[1] || "jpg" : outputFormat === "jpeg" ? "jpg" : outputFormat
        const finalFileName = `${fileName.replace(/\.[^/.]+$/, "")}.${extension}`
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = finalFileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(url), 100)
        sendNotification("Imagen descargada", `"${finalFileName}" descargada.`, "success")
      } catch (error) {
        console.error("Error al descargar:", error)
        sendNotification("Error de descarga", "No se pudo descargar la imagen.", "error")
      }
    }, [imageUrl, fileName, outputFormat])

    return (
      <StyledButton
        onClick={handleDownload}
        icon={<Download className="w-4 h-4" />}
        variant="primary"
        aria-label="Descargar imagen"
        className="p-3"
      />
    )
  }

  useEffect(() => {
    setTimeout(() => sendNotification("Bienvenido a V1tr0", "Optimizador de imágenes sin pérdida.", "info"), 1000)
  }, [])

  return (
    <div className="relative h-full">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-[${colors.background}] backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl border border-[${colors.primary}]/20 m-auto max-w-4xl flex flex-col`}
        style={{ background: colors.background, borderColor: `${colors.primary}20` }}
      >
        <div className="absolute top-4 right-4 z-50">
          <NotificationBell />
        </div>
        {images.length === 0 ? (
          <div
            className="m-auto flex max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-10 cursor-pointer font-mono gap-4"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            role="button"
            tabIndex={0}
          >
            <motion.div
              className="bg-[${colors.primary}]/20 rounded-full flex items-center justify-center w-60 mb-0 h-40"
              variants={iconContainerVariants}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <motion.div variants={uploadIconItselfVariants}>
                <ImageUpIcon className="w-16 h-16 text-[${colors.primary}]" style={{ color: colors.primary }} />
              </motion.div>
            </motion.div>
            <h2 className="text-lg font-semibold text-white mb-2">Arrastra y suelta tus imágenes</h2>
            <p className="text-sm text-white/70 mb-6 text-center max-w-sm">
              O haz clic para seleccionar. Soportamos PNG, JPG, WebP.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept="image/*"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full">
            <div className="md:col-span-3 border-r border-white/20 bg-white/5 flex flex-col">
              <div className="relative z-20 flex justify-between items-center p-3 border-b border-white/20 flex-shrink-0">
                <h3 className="text-white text-sm font-medium font-mono">Imágenes ({images.length})</h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCarouselView((prev) => (prev === "list" ? "grid" : "list"))}
                    className="p-2 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 text-cyan-400 hover:text-cyan-300 rounded-md border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200"
                    title={carouselView === "list" ? "Cambiar a vista de cuadrícula" : "Cambiar a vista de lista"}
                  >
                    {carouselView === "list" ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
              <div className="flex-grow min-h-0">
                <VerticalCarousel
                  images={images}
                  selectedImage={selectedImage}
                  onSelectImage={handleSelectImage}
                  onRemoveImage={handleRemoveImage}
                  view={carouselView}
                />
              </div>
              <div className="p-2 flex justify-center gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
                  title="Añadir más imágenes"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept="image/*"
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClearAllImages}
                  className="p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-red-500/25 transition-all duration-200"
                  title="Eliminar todas las imágenes"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              {stats && (
                <div className="p-3 border-t border-white/20 flex-shrink-0">
                  <h3 className="text-white text-xs font-medium mb-1 flex items-center">
                    <BarChart4 className={`w-3 h-3 mr-1 text-[${colors.primary}]`} style={{ color: colors.primary }} />
                    Estadísticas
                  </h3>
                  <div className="text-white/70 text-xs space-y-0.5">
                    <p>Reducción: {stats.averageReduction.toFixed(1)}%</p>
                    <p>
                      Total: {formatSize(stats.totalOriginalSize)} → {formatSize(stats.totalOptimizedSize)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-7 p-2 md:p-4 flex flex-col">
              <div className="flex-1 flex items-center justify-center mb-2 md:mb-4 min-h-0">
                {selectedImage && (
                  <CompareSlider
                    original={selectedImage.preview}
                    optimized={selectedImage.optimized}
                    isOptimizing={selectedImage.isOptimizing}
                    error={selectedImage.error}
                    originalSize={selectedImage.originalSize}
                    optimizedSize={selectedImage.optimizedSize}
                  />
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center flex-wrap">
                <div className="flex gap-2">
                  <motion.div
                    className="relative"
                    onMouseEnter={() => setShowCompressionModeTooltip("balanced")}
                    onMouseLeave={() => setShowCompressionModeTooltip(null)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCompressionSettings("balanced")}
                      className={`px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 text-cyan-400 hover:text-cyan-300 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200 font-mono text-sm ${compressionMode === "balanced" ? "ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20" : ""}`}
                    >
                      <span className="hidden xl:inline">Equilibrado</span>
                      <span className="xl:hidden">E</span>
                    </motion.button>
                    <AnimatePresence>
                      {showCompressionModeTooltip === "balanced" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50`}
                          style={{ backgroundColor: colors.secondary }}
                        >
                          Compresión equilibrada: alta calidad visual
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div
                    className="relative"
                    onMouseEnter={() => setShowCompressionModeTooltip("enhanced")}
                    onMouseLeave={() => setShowCompressionModeTooltip(null)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCompressionSettings("enhanced")}
                      className={`px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 text-cyan-400 hover:text-cyan-300 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200 font-mono text-sm ${compressionMode === "enhanced" ? "ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20" : ""}`}
                    >
                      <span className="hidden xl:inline">Mejorado</span>
                      <span className="xl:hidden">M</span>
                    </motion.button>
                    <AnimatePresence>
                      {showCompressionModeTooltip === "enhanced" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50`}
                          style={{ backgroundColor: colors.secondary }}
                        >
                          Compresión mejorada: buen equilibrio entre calidad y tamaño
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div
                    className="relative"
                    onMouseEnter={() => setShowCompressionModeTooltip("maximum")}
                    onMouseLeave={() => setShowCompressionModeTooltip(null)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCompressionSettings("maximum")}
                      className={`px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 hover:from-cyan-500/30 hover:to-cyan-600/30 text-cyan-400 hover:text-cyan-300 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200 font-mono text-sm flex items-center gap-2 ${compressionMode === "maximum" ? "ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20" : ""}`}
                    >
                      <Zap className="w-4 h-4" />
                      <span className="hidden xl:inline">Máxima</span>
                      <span className="xl:hidden">Max</span>
                    </motion.button>
                    <AnimatePresence>
                      {showCompressionModeTooltip === "maximum" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50`}
                          style={{ backgroundColor: colors.secondary }}
                        >
                          Compresión máxima: reducción máxima de tamaño
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <div className="flex gap-2">
                  <motion.div
                    className="relative"
                    onMouseEnter={() => setShowOptimizeOneTooltip(true)}
                    onMouseLeave={() => setShowOptimizeOneTooltip(false)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectedImage && handleOptimize(selectedImage)}
                      disabled={!selectedImage || selectedImage.isOptimizing}
                      className={`px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 hover:text-green-300 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-200 font-mono text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${selectedImage?.isOptimizing ? "ring-2 ring-green-500/50 shadow-lg shadow-green-500/20" : ""}`}
                    >
                      {selectedImage?.isOptimizing ? (
                        <svg className="animate-spin h-4 w-4 text-green-400" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                      <span className="hidden xl:inline">Optimizar</span>
                      <span className="xl:hidden">Opt</span>
                    </motion.button>
                    <AnimatePresence>
                      {showOptimizeOneTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50`}
                          style={{ backgroundColor: colors.secondary }}
                        >
                          Optimizar actual
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div
                    className="relative"
                    onMouseEnter={() => setShowOptimizeAllTooltip(true)}
                    onMouseLeave={() => setShowOptimizeAllTooltip(false)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBatchOptimize}
                      disabled={images.length === 0 || images.some((img) => img.isOptimizing)}
                      className={`px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 hover:text-green-300 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-200 font-mono text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${images.some((img) => img.isOptimizing) ? "ring-2 ring-green-500/50 shadow-lg shadow-green-500/20" : ""}`}
                    >
                      {images.some((img) => img.isOptimizing) ? (
                        <svg className="animate-spin h-4 w-4 text-green-400" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <FolderTreeIcon className="w-4 h-4" />
                      )}
                      <span className="hidden xl:inline">Todas</span>
                      <span className="xl:hidden">All</span>
                    </motion.button>
                    <AnimatePresence>
                      {showOptimizeAllTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50`}
                          style={{ backgroundColor: colors.secondary }}
                        >
                          Optimizar todas
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                {(selectedImage?.optimized || optimizedImagesCount > 0) && (
                  <div className="flex gap-2">
                    {selectedImage?.optimized && (
                      <motion.div
                        className="relative"
                        onMouseEnter={() => setShowDownloadOneTooltip(true)}
                        onMouseLeave={() => setShowDownloadOneTooltip(false)}
                      >
                        <DownloadButton
                          imageUrl={selectedImage.optimized}
                          fileName={selectedImage.file.name}
                          outputFormat={options.outputFormat}
                        />
                        <AnimatePresence>
                          {showDownloadOneTooltip && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50`}
                              style={{ backgroundColor: colors.secondary }}
                            >
                              Descargar actual
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                    {optimizedImagesCount > 0 && (
                      <motion.div
                        className="relative"
                        onMouseEnter={() => setShowDownloadAllTooltip(true)}
                        onMouseLeave={() => setShowDownloadAllTooltip(false)}
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDownloadAllAsZip}
                          disabled={isDownloadingZip}
                          className={`px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-400 hover:text-green-300 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-200 font-mono text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDownloadingZip ? "ring-2 ring-green-500/50 shadow-lg shadow-green-500/20" : ""}`}
                        >
                          {isDownloadingZip ? (
                            <svg className="animate-spin h-4 w-4 text-green-400" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <FileDownIcon className="w-4 h-4" />
                          )}
                          <span className="hidden xl:inline">ZIP</span>
                          <span className="xl:hidden">ZIP</span>
                        </motion.button>
                        <AnimatePresence>
                          {showDownloadAllTooltip && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50`}
                              style={{ backgroundColor: colors.secondary }}
                            >
                              Descargar todo (ZIP)
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2 bg-white/5 border-l border-white/20 flex flex-col items-center justify-center p-2">
              <div className="hidden xl:inline text-teal-500 font-mono">Formato</div>
              <div className="flex gap-2 font-mono leading-9 tracking-widest flex-col items-center justify-between my-5 mx-9 py-1.5 px-2 gap-x-2.5 gap-y-2.5">
                {availableFormats.map((format) => (
                  <motion.div
                    key={format}
                    className="relative"
                    onMouseEnter={() => setShowFormatTooltip(format)}
                    onMouseLeave={() => setShowFormatTooltip(null)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => changeOutputFormat(format)}
                      className={`px-2 py-3 text-xs min-w-0 font-mono rounded-lg border transition-all duration-200 ${
                        options.outputFormat === format
                          ? "bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-400 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                          : "bg-gradient-to-r from-slate-500/10 to-slate-600/10 text-slate-400 border-slate-500/30 hover:border-slate-500/50 hover:text-slate-300"
                      }`}
                    >
                      {format.toUpperCase()}
                    </motion.button>
                    <AnimatePresence>
                      {showFormatTooltip === format && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50`}
                          style={{ backgroundColor: colors.secondary }}
                        >
                          {format === "auto"
                            ? "Mantener formato original"
                            : `Convertir a ${format.toUpperCase()}`}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
