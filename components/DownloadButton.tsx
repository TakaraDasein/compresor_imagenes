"use client"

import { motion } from "framer-motion"
import { Download } from "lucide-react"

interface DownloadButtonProps {
  imageUrl: string
  fileName: string
  outputFormat: "auto" | "png" | "jpeg" | "webp" | "avif"
}

export default function DownloadButton({ imageUrl, fileName, outputFormat }: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      // Obtener el blob de la imagen
      const response = await fetch(imageUrl)
      let blob = await response.blob() // Cambiado de const a let para poder reasignarlo

      // Determinar la extensión correcta basada en el formato seleccionado
      let extension = "jpg" // Por defecto
      let mimeType = blob.type // Mantener el tipo MIME original por defecto

      if (outputFormat !== "auto") {
        // Si se seleccionó un formato específico, usarlo
        extension = outputFormat === "jpeg" ? "jpg" : outputFormat
        mimeType = `image/${outputFormat}`

        // Convertir la imagen al formato seleccionado si es diferente
        if (!blob.type.includes(outputFormat)) {
          // Crear un canvas para la conversión
          const img = new Image()
          img.src = imageUrl
          await new Promise((resolve) => {
            img.onload = resolve
          })

          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height

          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0)

            // Convertir a nuevo formato
            const quality = 0.9 // Alta calidad por defecto
            const newBlob = await new Promise<Blob>((resolve) => {
              canvas.toBlob(
                (newBlob) => {
                  if (newBlob) resolve(newBlob)
                  else resolve(blob) // Fallback al blob original
                },
                mimeType,
                quality,
              )
            })

            // Asignar el nuevo blob
            blob = newBlob
          }
        }
      } else {
        // Si es "auto", determinar la extensión basada en el tipo MIME
        if (blob.type.includes("png")) extension = "png"
        else if (blob.type.includes("webp")) extension = "webp"
        else if (blob.type.includes("avif")) extension = "avif"
        else extension = "jpg"
      }

      // Generar nombre de archivo con la extensión correcta
      // Usar el nombre original sin el prefijo "optimized-"
      const baseFileName = fileName.replace(/^optimized-/, "").replace(/\.[^/.]+$/, "") // Quitar prefijo y extensión
      const finalFileName = `${baseFileName}.${extension}`

      // Crear URL y descargar
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = finalFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Liberar recursos
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (error) {
      console.error("Error al descargar la imagen:", error)
      alert("Hubo un error al descargar la imagen. Por favor, intente nuevamente.")
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-medium transition-colors flex items-center justify-center gap-2 min-w-[180px]"
      onClick={handleDownload}
    >
      <Download className="w-5 h-5" />
      <span>Descargar</span>
    </motion.button>
  )
}
