/**
 * Utilidad para convertir imágenes entre diferentes formatos
 * Soporta: PNG, JPG/JPEG, WebP, ICO, AVIF, BMP
 */

import type { ImageFormat, ConversionOptions, ConversionResult } from "./types"

/**
 * Configuración de calidad por formato
 */
const FORMAT_QUALITY: Record<ImageFormat, number> = {
  png: 1.0, // PNG es sin pérdida
  jpg: 0.92,
  jpeg: 0.92,
  webp: 0.9,
  ico: 1.0,
  avif: 0.85,
  bmp: 1.0,
}

/**
 * MIME types por formato
 */
const FORMAT_MIME_TYPES: Record<ImageFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  ico: "image/x-icon",
  avif: "image/avif",
  bmp: "image/bmp",
}

/**
 * Convierte una imagen a un formato específico
 */
export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  options: ConversionOptions = {},
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now()
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string

      img.onload = async () => {
        try {
          // Crear canvas para la conversión
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            throw new Error("No se pudo crear el contexto del canvas")
          }

          // Establecer dimensiones (mantener original o redimensionar)
          const width = options.width || img.width
          const height = options.height || img.height
          canvas.width = width
          canvas.height = height

          // Dibujar imagen en el canvas
          ctx.drawImage(img, 0, 0, width, height)

          // Obtener calidad de conversión
          const quality = options.quality ?? FORMAT_QUALITY[targetFormat]

          // Convertir a blob del formato objetivo
          const mimeType = FORMAT_MIME_TYPES[targetFormat]

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Error al convertir la imagen"))
                return
              }

              const endTime = performance.now()
              const processingTime = endTime - startTime

              // Crear resultado
              const result: ConversionResult = {
                blob,
                url: URL.createObjectURL(blob),
                originalSize: file.size,
                convertedSize: blob.size,
                originalFormat: getFileExtension(file.name) as ImageFormat,
                targetFormat,
                width: canvas.width,
                height: canvas.height,
                processingTime,
                compressionRatio: ((1 - blob.size / file.size) * 100).toFixed(2) + "%",
              }

              resolve(result)
            },
            mimeType,
            quality,
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Error al cargar la imagen"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Convierte múltiples imágenes en lote
 */
export async function convertImagesBatch(
  files: File[],
  targetFormat: ImageFormat,
  options: ConversionOptions = {},
): Promise<ConversionResult[]> {
  const promises = files.map((file) => convertImage(file, targetFormat, options))
  return Promise.all(promises)
}

/**
 * Obtiene la extensión de un archivo
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".")
  return parts[parts.length - 1].toLowerCase()
}

/**
 * Valida si un formato es soportado
 */
export function isSupportedFormat(format: string): format is ImageFormat {
  const supportedFormats: ImageFormat[] = ["png", "jpg", "jpeg", "webp", "ico", "avif", "bmp"]
  return supportedFormats.includes(format as ImageFormat)
}

/**
 * Obtiene el nombre de archivo con nuevo formato
 */
export function getConvertedFileName(originalName: string, targetFormat: ImageFormat): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "")
  return `${nameWithoutExt}.${targetFormat}`
}

/**
 * Formatea el tamaño de archivo a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Descarga una imagen convertida
 */
export function downloadConvertedImage(result: ConversionResult, fileName: string): void {
  const link = document.createElement("a")
  link.href = result.url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Descarga múltiples imágenes como ZIP
 */
export async function downloadConvertedImagesAsZip(
  results: ConversionResult[],
  fileNames: string[],
  zipName: string = "converted-images.zip",
): Promise<void> {
  try {
    const JSZip = (await import("jszip")).default
    const zip = new JSZip()

    // Agregar cada imagen al ZIP
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const fileName = fileNames[i]
      zip.file(fileName, result.blob)
    }

    // Generar ZIP y descargar
    const zipBlob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = zipName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error al crear ZIP:", error)
    throw error
  }
}
