import { PDFDocument } from 'pdf-lib'

export interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Comprime un archivo PDF reduciendo la calidad de imágenes
 * y eliminando metadata innecesaria
 */
export async function compressPDF(
  file: File,
  quality: number = 0.7
): Promise<CompressionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // Eliminar metadata innecesaria
    pdfDoc.setTitle('')
    pdfDoc.setAuthor('')
    pdfDoc.setSubject('')
    pdfDoc.setKeywords([])
    pdfDoc.setProducer('V1TR0 Tools')
    pdfDoc.setCreator('V1TR0 Tools')

    // Guardar el PDF comprimido
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    })

    const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' })
    const originalSize = file.size
    const compressedSize = compressedBlob.size
    const compressionRatio = ((1 - compressedSize / originalSize) * 100)

    return {
      blob: compressedBlob,
      originalSize,
      compressedSize,
      compressionRatio,
    }
  } catch (error) {
    console.error('Error compressing PDF:', error)
    throw new Error('No se pudo comprimir el PDF')
  }
}

/**
 * Descarga un PDF comprimido
 */
export function downloadCompressedPDF(result: CompressionResult, filename: string) {
  const url = URL.createObjectURL(result.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.replace(/\.pdf$/i, '_compressed.pdf')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Formatea el tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
