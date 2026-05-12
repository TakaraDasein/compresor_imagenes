import * as pdfjsLib from 'pdfjs-dist'

// Configurar el worker de PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export interface PDFToImagesResult {
  images: Blob[]
  format: string
}

/**
 * Convierte un PDF a imágenes
 */
export async function pdfToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.92
): Promise<PDFToImagesResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const images: Blob[] = []

    // Renderizar cada página
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 }) // 2x para mejor calidad

      // Crear canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('No se pudo crear el contexto del canvas')

      canvas.width = viewport.width
      canvas.height = viewport.height

      // Renderizar la página en el canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise

      // Convertir canvas a blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('No se pudo convertir el canvas a blob'))
          },
          `image/${format}`,
          quality
        )
      })

      images.push(blob)
    }

    return {
      images,
      format,
    }
  } catch (error) {
    console.error('Error converting PDF to images:', error)
    throw new Error('No se pudo convertir el PDF a imágenes')
  }
}

/**
 * Descarga las imágenes como ZIP
 */
export async function downloadImagesAsZip(
  images: Blob[],
  baseName: string,
  format: string
) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  images.forEach((blob, index) => {
    const fileName = `${baseName}_page_${index + 1}.${format}`
    zip.file(fileName, blob)
  })

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${baseName}_images.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Descarga una sola imagen
 */
export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
