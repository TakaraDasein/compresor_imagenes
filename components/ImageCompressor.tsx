"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"
import VerticalCarousel from "./VerticalCarousel"
import CompareSlider from "./CompareSlider"
import OptimizeButton from "./OptimizeButton"
import DownloadButton from "./DownloadButton"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

type ImageItem = {
  id: string
  file: File
  preview: string
  optimized?: string
  isOptimizing?: boolean
  error?: string
}

export default function ImageCompressor() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview: URL.createObjectURL(file),
      }))

      setImages((prev) => [...prev, ...newImages])
      if (!selectedImage && newImages.length > 0) {
        setSelectedImage(newImages[0])
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview: URL.createObjectURL(file),
      }))

      setImages((prev) => [...prev, ...newImages])
      if (!selectedImage && newImages.length > 0) {
        setSelectedImage(newImages[0])
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const useOriginalAsFallback = useCallback(async (image: ImageItem) => {
    if (!image) return null

    console.log("Using original image as fallback")
    const originalBlob = await fetch(image.preview).then((r) => r.blob())
    return originalBlob
  }, [])

  const handleOptimize = async () => {
    if (!selectedImage) return

    // Update state to show loading
    setImages((prev) =>
      prev.map((img) => (img.id === selectedImage.id ? { ...img, isOptimizing: true, error: undefined } : img)),
    )
    setSelectedImage((prev) => (prev ? { ...prev, isOptimizing: true, error: undefined } : null))

    try {
      // Intentar optimizar con la API
      let optimizedBlob: Blob | null = null
      try {
        const formData = new FormData()
        formData.append("file", selectedImage.file)

        // Añadir un timeout para evitar que la solicitud se quede colgada
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos de timeout

        const response = await fetch("/api/optimize", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId))

        // Verificar si la respuesta es JSON (error) o un blob (imagen)
        const contentType = response.headers.get("content-type") || ""

        if (contentType.includes("application/json")) {
          // Es un error en formato JSON
          const errorData = await response.json()
          throw new Error(errorData.error || "Error desconocido en la optimización")
        }

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }

        // Es una imagen
        optimizedBlob = await response.blob()

        // Verify that we got a valid image back
        if (optimizedBlob.size === 0) {
          throw new Error("Respuesta vacía del servidor")
        }
      } catch (apiError) {
        console.error("API optimization failed, using original as fallback:", apiError)
        // Si la API falla, usar la imagen original como fallback
        optimizedBlob = await useOriginalAsFallback(selectedImage)

        // Mostrar toast de advertencia pero continuar con el flujo
        toast({
          title: "Advertencia",
          description: "No se pudo optimizar la imagen. Se está usando la imagen original.",
          variant: "destructive",
        })
      }

      if (!optimizedBlob) {
        throw new Error("No se pudo obtener la imagen optimizada ni la original como fallback.")
      }

      const optimizedUrl = URL.createObjectURL(optimizedBlob)

      // Update state with optimized image
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id ? { ...img, optimized: optimizedUrl, isOptimizing: false } : img,
        ),
      )
      setSelectedImage((prev) => (prev ? { ...prev, optimized: optimizedUrl, isOptimizing: false } : null))

      toast({
        title: "Imagen procesada",
        description: `La imagen ha sido procesada. Tamaño: ${(optimizedBlob.size / 1024).toFixed(2)} KB`,
      })
    } catch (error) {
      console.error("Error in optimization flow:", error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : error instanceof DOMException && error.name === "AbortError"
            ? "La solicitud ha excedido el tiempo de espera"
            : "Error desconocido"

      toast({
        title: "Error",
        description: `Error al procesar la imagen: ${errorMessage}`,
        variant: "destructive",
      })

      // Reset loading state and set error
      setImages((prev) =>
        prev.map((img) => (img.id === selectedImage.id ? { ...img, isOptimizing: false, error: errorMessage } : img)),
      )
      setSelectedImage((prev) => (prev ? { ...prev, isOptimizing: false, error: errorMessage } : null))
    }
  }

  const handleSelectImage = (image: ImageItem) => {
    setSelectedImage(image)
  }

  return (
    <div className="relative">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl border border-white/20"
      >
        {images.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center p-12 min-h-[500px] cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6"
            >
              <Upload className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-xl font-semibold text-white mb-2">Arrastra y suelta tus imágenes aquí</h2>
            <p className="text-white/70 mb-6 text-center max-w-md">
              O haz clic para seleccionar archivos. Soportamos PNG, JPG, WebP y otros formatos.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-medium transition-colors"
            >
              Seleccionar Archivos
            </motion.button>
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
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
            {/* Panel izquierdo: Carrusel vertical */}
            <div className="md:col-span-3 border-r border-white/20 bg-white/5">
              <VerticalCarousel images={images} selectedImage={selectedImage} onSelectImage={handleSelectImage} />
              <div className="p-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Añadir más imágenes
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  accept="image/*"
                />
              </div>
            </div>

            {/* Panel derecho: Visor y controles */}
            <div className="md:col-span-9 p-6 flex flex-col">
              <div className="flex-1 flex items-center justify-center mb-6">
                {selectedImage && (
                  <CompareSlider
                    original={selectedImage.preview}
                    optimized={selectedImage.optimized}
                    isOptimizing={selectedImage.isOptimizing}
                    error={selectedImage.error}
                  />
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <OptimizeButton
                  onClick={handleOptimize}
                  disabled={!selectedImage || selectedImage.isOptimizing}
                  isOptimizing={selectedImage?.isOptimizing || false}
                />
                {selectedImage?.optimized && (
                  <DownloadButton
                    imageUrl={selectedImage.optimized}
                    fileName={`optimized-${selectedImage.file.name}`}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
