/**
 * Web Worker para procesamiento de imágenes en paralelo
 * Permite convertir/comprimir múltiples imágenes sin bloquear el UI thread
 */

// Tipos de mensaje que el worker puede recibir
interface WorkerMessage {
  type: 'convert' | 'compress'
  id: string
  imageData: ImageData
  options: ConversionOptions | CompressionOptions
}

interface ConversionOptions {
  targetFormat: string
  quality: number
  width?: number
  height?: number
}

interface CompressionOptions {
  quality: number
  maxWidth?: number
  maxHeight?: number
  format?: string
}

// Tipos de respuesta que el worker envía
interface WorkerResponse {
  type: 'success' | 'error' | 'progress'
  id: string
  result?: {
    blob: Blob
    width: number
    height: number
    size: number
  }
  error?: string
  progress?: number
}

/**
 * Convierte ImageData a Blob en el formato especificado
 */
async function convertImageData(
  imageData: ImageData,
  format: string,
  quality: number
): Promise<Blob> {
  // Crear un canvas offscreen para el procesamiento
  const canvas = new OffscreenCanvas(imageData.width, imageData.height)
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('No se pudo obtener el contexto 2D')
  }
  
  // Poner los datos de la imagen en el canvas
  ctx.putImageData(imageData, 0, 0)
  
  // Convertir a blob en el formato deseado
  const mimeType = getMimeType(format)
  const blob = await canvas.convertToBlob({
    type: mimeType,
    quality: quality / 100,
  })
  
  return blob
}

/**
 * Redimensiona ImageData si es necesario
 */
function resizeImageData(
  imageData: ImageData,
  maxWidth?: number,
  maxHeight?: number
): ImageData {
  let { width, height } = imageData
  
  // Calcular nuevas dimensiones si se especificaron límites
  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }
  
  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }
  
  // Si no hay cambio de tamaño, retornar original
  if (width === imageData.width && height === imageData.height) {
    return imageData
  }
  
  // Crear canvas para redimensionar
  const canvas = new OffscreenCanvas(imageData.width, imageData.height)
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    return imageData
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  // Crear canvas de salida con nuevo tamaño
  const outputCanvas = new OffscreenCanvas(Math.round(width), Math.round(height))
  const outputCtx = outputCanvas.getContext('2d')
  
  if (!outputCtx) {
    return imageData
  }
  
  // Redimensionar con calidad alta
  outputCtx.imageSmoothingEnabled = true
  outputCtx.imageSmoothingQuality = 'high'
  outputCtx.drawImage(canvas, 0, 0, Math.round(width), Math.round(height))
  
  return outputCtx.getImageData(0, 0, Math.round(width), Math.round(height))
}

/**
 * Obtiene el MIME type para un formato
 */
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    avif: 'image/avif',
    bmp: 'image/bmp',
  }
  
  return mimeTypes[format.toLowerCase()] || 'image/png'
}

/**
 * Procesa un trabajo de conversión
 */
async function processConversion(
  message: WorkerMessage
): Promise<WorkerResponse> {
  try {
    const { id, imageData, options } = message
    const convOptions = options as ConversionOptions
    
    // Redimensionar si es necesario
    let processedData = imageData
    if (convOptions.width || convOptions.height) {
      processedData = resizeImageData(
        imageData,
        convOptions.width,
        convOptions.height
      )
    }
    
    // Enviar progreso
    self.postMessage({
      type: 'progress',
      id,
      progress: 50,
    } as WorkerResponse)
    
    // Convertir a blob
    const blob = await convertImageData(
      processedData,
      convOptions.targetFormat,
      convOptions.quality
    )
    
    // Enviar resultado
    return {
      type: 'success',
      id,
      result: {
        blob,
        width: processedData.width,
        height: processedData.height,
        size: blob.size,
      },
    }
  } catch (error) {
    return {
      type: 'error',
      id: message.id,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Procesa un trabajo de compresión
 */
async function processCompression(
  message: WorkerMessage
): Promise<WorkerResponse> {
  try {
    const { id, imageData, options } = message
    const compOptions = options as CompressionOptions
    
    // Redimensionar si es necesario
    let processedData = imageData
    if (compOptions.maxWidth || compOptions.maxHeight) {
      processedData = resizeImageData(
        imageData,
        compOptions.maxWidth,
        compOptions.maxHeight
      )
    }
    
    // Enviar progreso
    self.postMessage({
      type: 'progress',
      id,
      progress: 50,
    } as WorkerResponse)
    
    // Comprimir
    const format = compOptions.format || 'jpeg'
    const blob = await convertImageData(
      processedData,
      format,
      compOptions.quality
    )
    
    // Enviar resultado
    return {
      type: 'success',
      id,
      result: {
        blob,
        width: processedData.width,
        height: processedData.height,
        size: blob.size,
      },
    }
  } catch (error) {
    return {
      type: 'error',
      id: message.id,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

// Escuchar mensajes del thread principal
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data
  
  let response: WorkerResponse
  
  switch (message.type) {
    case 'convert':
      response = await processConversion(message)
      break
      
    case 'compress':
      response = await processCompression(message)
      break
      
    default:
      response = {
        type: 'error',
        id: message.id,
        error: `Tipo de operación desconocido: ${message.type}`,
      }
  }
  
  self.postMessage(response)
})

// Exportar para TypeScript (no afecta la ejecución)
export {}
