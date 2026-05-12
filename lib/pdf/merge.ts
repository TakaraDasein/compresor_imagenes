import { PDFDocument } from 'pdf-lib'

export interface MergeResult {
  blob: Blob
  pageCount: number
  totalSize: number
}

/**
 * Une múltiples archivos PDF en uno solo
 */
export async function mergePDFs(files: File[]): Promise<MergeResult> {
  try {
    // Crear un nuevo documento PDF
    const mergedPdf = await PDFDocument.create()
    let totalPages = 0

    // Procesar cada archivo
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      
      // Copiar todas las páginas del PDF actual al PDF combinado
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
        totalPages++
      })
    }

    // Guardar el PDF combinado
    const mergedPdfBytes = await mergedPdf.save()
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })

    return {
      blob,
      pageCount: totalPages,
      totalSize: blob.size,
    }
  } catch (error) {
    console.error('Error merging PDFs:', error)
    throw new Error('No se pudieron unir los archivos PDF')
  }
}

/**
 * Descarga el PDF combinado
 */
export function downloadMergedPDF(result: MergeResult, filename: string = 'merged.pdf') {
  const url = URL.createObjectURL(result.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
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
