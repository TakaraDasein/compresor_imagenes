import type { CompressionOptions } from "./types"

// Función para optimizar una imagen usando Canvas API con compresión equilibrada
export async function optimizeImage(
  file: File | null,
  options: CompressionOptions,
  initOnly = false,
): Promise<{ optimizedBlob: Blob; originalSize: number; optimizedSize: number } | null> {
  // Si solo queremos inicializar o no hay archivo, retornamos
  if (initOnly || !file) return null

  try {
    // Obtener el tamaño original
    const originalSize = file.size

    // Crear un objeto URL para la imagen
    const url = URL.createObjectURL(file)

    try {
      // Cargar la imagen en un elemento Image
      const img = await loadImage(url)

      // Liberar el objeto URL
      URL.revokeObjectURL(url)

      // Determinar el formato de salida
      let outputFormat = options.outputFormat
      if (outputFormat === "auto") {
        // Mantener el formato original cuando sea posible
        const fileType = file.type.split("/")[1]?.toLowerCase() || ""
        const fileExt = file.name.split(".").pop()?.toLowerCase() || ""

        // Usar el tipo MIME primero, luego la extensión
        outputFormat = ["png", "jpeg", "jpg", "webp", "avif"].includes(fileType)
          ? fileType === "jpg"
            ? "jpeg"
            : fileType
          : ["png", "jpeg", "jpg", "webp", "avif"].includes(fileExt)
            ? fileExt === "jpg"
              ? "jpeg"
              : fileExt
            : "webp"
      }

      // Calcular dimensiones óptimas (preservando mejor la calidad)
      const dimensions = calculateOptimalDimensions(img.width, img.height, originalSize, options.resizeMode)

      // Crear un canvas para procesar la imagen
      const canvas = document.createElement("canvas")
      canvas.width = dimensions.width
      canvas.height = dimensions.height

      const ctx = canvas.getContext("2d", { alpha: true })
      if (!ctx) {
        throw new Error("No se pudo crear el contexto del canvas")
      }

      // Dibujar la imagen en el canvas con suavizado
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)

      // Configurar calidad y formato
      let mimeType: string
      let quality: number

      switch (outputFormat) {
        case "png":
          mimeType = "image/png"
          quality = options.png.quality / 100
          break

        case "jpeg":
          mimeType = "image/jpeg"
          quality = options.jpeg.quality / 100
          break

        case "webp":
          mimeType = "image/webp"
          quality = options.webp.quality / 100
          break

        case "avif":
          // Verificar soporte para AVIF
          if (supportsAvif()) {
            mimeType = "image/avif"
            quality = options.avif.quality / 100
          } else {
            console.warn("AVIF no es soportado por este navegador, usando WebP como alternativa")
            mimeType = "image/webp"
            quality = options.webp.quality / 100
          }
          break

        default:
          // Por defecto, usar WebP
          mimeType = "image/webp"
          quality = options.webp.quality / 100
      }

      // Convertir canvas a blob con la calidad configurada
      const optimizedBlob = await canvasToBlob(canvas, mimeType, quality)
      const optimizedSize = optimizedBlob.size

      // Si la optimización no logró reducir el tamaño, intentar con un enfoque ligeramente más agresivo
      if (optimizedSize >= originalSize && options.autoAdjust) {
        console.log("La optimización no redujo el tamaño, intentando ajustes automáticos")

        // Reducir calidad ligeramente
        const adjustedQuality = Math.max(0.6, quality - 0.1)

        // Intentar con WebP si no estamos usando ya WebP y el navegador lo soporta
        const adjustedMimeType = mimeType !== "image/webp" && supportsWebp() ? "image/webp" : mimeType

        // Intentar nuevamente
        const adjustedBlob = await canvasToBlob(canvas, adjustedMimeType, adjustedQuality)

        // Si el ajuste automático logró reducir el tamaño, usarlo
        if (adjustedBlob.size < originalSize) {
          return {
            optimizedBlob: adjustedBlob,
            originalSize,
            optimizedSize: adjustedBlob.size,
          }
        }
      }

      return {
        optimizedBlob,
        originalSize,
        optimizedSize,
      }
    } catch (error) {
      // Liberar el objeto URL en caso de error
      URL.revokeObjectURL(url)
      throw error
    }
  } catch (error) {
    console.error("Error optimizing image:", error)
    throw new Error(`Error al optimizar la imagen: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Función para cargar una imagen
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous" // Evitar problemas CORS
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Error al cargar la imagen"))
    img.src = src
  })
}

// Función para convertir canvas a blob
function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("No se pudo convertir el canvas a blob"))
          }
        },
        mimeType,
        quality,
      )
    } catch (error) {
      // Si falla, intentar con un formato más compatible
      console.warn(`Error al convertir a ${mimeType}, intentando con image/png`)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("No se pudo convertir el canvas a blob"))
          }
        },
        "image/png",
        0.8, // Calidad moderada para PNG
      )
    }
  })
}

// Función para verificar soporte de AVIF
function supportsAvif(): boolean {
  const canvas = document.createElement("canvas")
  return canvas.toDataURL("image/avif").startsWith("data:image/avif")
}

// Función para verificar soporte de WebP
function supportsWebp(): boolean {
  const canvas = document.createElement("canvas")
  return canvas.toDataURL("image/webp").startsWith("data:image/webp")
}

// Función para calcular dimensiones óptimas
function calculateOptimalDimensions(
  width: number,
  height: number,
  fileSize: number,
  resizeMode: "none" | "conservative" | "moderate" | "aggressive" = "conservative",
): { width: number; height: number } {
  const aspectRatio = width / height

  // Si el modo es "none", no redimensionar
  if (resizeMode === "none") {
    return { width, height }
  }

  // Definir factores de reducción según el modo
  let maxDimension = 0
  let sizeFactor = 1

  switch (resizeMode) {
    case "conservative":
      // Solo reducir imágenes muy grandes
      maxDimension = 2500
      // Reducir tamaño solo para archivos muy grandes
      if (fileSize > 3 * 1024 * 1024) {
        // > 3MB
        sizeFactor = 0.9
      }
      break

    case "moderate":
      // Reducir imágenes grandes
      maxDimension = 2000
      // Reducir tamaño para archivos grandes
      if (fileSize > 1 * 1024 * 1024) {
        // > 1MB
        sizeFactor = 0.85
      }
      break

    case "aggressive":
      // Reducir todas las imágenes grandes
      maxDimension = 1600
      // Reducir tamaño para la mayoría de archivos
      if (fileSize > 500 * 1024) {
        // > 500KB
        sizeFactor = 0.8
      }
      break
  }

  // Aplicar límite de dimensión máxima
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      width = maxDimension
      height = Math.round(width / aspectRatio)
    } else {
      height = maxDimension
      width = Math.round(height * aspectRatio)
    }
  }

  // Aplicar factor de tamaño
  width = Math.round(width * sizeFactor)
  height = Math.round(height * sizeFactor)

  // Asegurar que las dimensiones sean pares (mejor para compresión)
  width = Math.floor(width / 2) * 2
  height = Math.floor(height / 2) * 2

  return { width, height }
}
