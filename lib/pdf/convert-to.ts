import { jsPDF } from 'jspdf'

export interface ImageToPDFOptions {
  quality?: number
  format?: 'a4' | 'letter' | 'auto'
  orientation?: 'portrait' | 'landscape'
}

export interface ConversionResult {
  blob: Blob
  pageCount: number
}

/**
 * Convierte imágenes a PDF
 */
export async function imagesToPDF(
  files: File[],
  options: ImageToPDFOptions = {}
): Promise<ConversionResult> {
  const {
    quality = 0.92,
    format = 'auto',
    orientation = 'portrait'
  } = options

  try {
    // Crear el documento PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: format === 'auto' ? 'a4' : format,
    })

    let isFirstPage = true

    for (const file of files) {
      // Leer la imagen
      const imageData = await readImageFile(file)
      
      if (!isFirstPage) {
        pdf.addPage()
      }
      isFirstPage = false

      // Obtener dimensiones de la página
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Calcular dimensiones de la imagen para ajustarla a la página
      const img = await loadImage(imageData)
      const imgWidth = img.width
      const imgHeight = img.height

      let finalWidth = pageWidth - 20 // Margen de 10mm a cada lado
      let finalHeight = (imgHeight * finalWidth) / imgWidth

      // Si la altura es mayor que la página, ajustar por altura
      if (finalHeight > pageHeight - 20) {
        finalHeight = pageHeight - 20
        finalWidth = (imgWidth * finalHeight) / imgHeight
      }

      // Centrar la imagen
      const x = (pageWidth - finalWidth) / 2
      const y = (pageHeight - finalHeight) / 2

      // Agregar imagen al PDF
      pdf.addImage(imageData, 'JPEG', x, y, finalWidth, finalHeight)
    }

    // Generar el blob
    const pdfBlob = pdf.output('blob')

    return {
      blob: pdfBlob,
      pageCount: files.length,
    }
  } catch (error) {
    console.error('Error converting images to PDF:', error)
    throw new Error('No se pudieron convertir las imágenes a PDF')
  }
}

/**
 * Lee un archivo de imagen como data URL
 */
function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('No se pudo leer el archivo'))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Carga una imagen desde una data URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = src
  })
}

/**
 * Descarga el PDF generado
 */
export function downloadPDF(result: ConversionResult, filename: string = 'converted.pdf') {
  const url = URL.createObjectURL(result.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
