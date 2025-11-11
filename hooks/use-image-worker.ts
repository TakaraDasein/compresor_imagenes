/**
 * Hook para usar el Web Worker de procesamiento de imágenes
 * Proporciona una interfaz simple para procesar imágenes en paralelo
 */

import { useEffect, useRef, useCallback, useState } from 'react'

interface WorkerTask {
  id: string
  resolve: (result: ProcessingResult) => void
  reject: (error: Error) => void
}

interface ProcessingResult {
  blob: Blob
  width: number
  height: number
  size: number
}

interface ProcessingOptions {
  targetFormat?: string
  quality?: number
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
}

export function useImageWorker() {
  const workerRef = useRef<Worker | null>(null)
  const tasksRef = useRef<Map<string, WorkerTask>>(new Map())
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>({})

  // Inicializar worker
  useEffect(() => {
    // Solo crear worker en el cliente
    if (typeof window === 'undefined') return

    try {
      // Intentar crear el worker
      // Nota: En Next.js necesitamos configurar webpack para esto
      workerRef.current = new Worker(
        new URL('../workers/image-processor.worker.ts', import.meta.url),
        { type: 'module' }
      )

      // Manejar mensajes del worker
      workerRef.current.onmessage = (event) => {
        const response = event.data
        const task = tasksRef.current.get(response.id)

        if (!task) return

        switch (response.type) {
          case 'success':
            task.resolve(response.result)
            tasksRef.current.delete(response.id)
            setProgress((prev) => {
              const next = { ...prev }
              delete next[response.id]
              return next
            })
            break

          case 'error':
            task.reject(new Error(response.error))
            tasksRef.current.delete(response.id)
            setProgress((prev) => {
              const next = { ...prev }
              delete next[response.id]
              return next
            })
            break

          case 'progress':
            setProgress((prev) => ({
              ...prev,
              [response.id]: response.progress,
            }))
            break
        }

        // Actualizar estado de procesamiento
        setIsProcessing(tasksRef.current.size > 0)
      }

      // Manejar errores del worker
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error)
        // Rechazar todas las tareas pendientes
        tasksRef.current.forEach((task) => {
          task.reject(new Error('Worker error'))
        })
        tasksRef.current.clear()
        setIsProcessing(false)
      }
    } catch (error) {
      console.warn('Web Worker no disponible, usando procesamiento en main thread')
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  /**
   * Convierte una imagen File a ImageData
   */
  const fileToImageData = useCallback(async (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('No se pudo obtener contexto 2D'))
        return
      }

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        URL.revokeObjectURL(img.src)
        resolve(imageData)
      }

      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        reject(new Error('Error al cargar la imagen'))
      }

      img.src = URL.createObjectURL(file)
    })
  }, [])

  /**
   * Procesa una imagen usando el worker
   */
  const processImage = useCallback(
    async (
      file: File,
      options: ProcessingOptions,
      type: 'convert' | 'compress' = 'convert'
    ): Promise<ProcessingResult> => {
      // Si no hay worker disponible, usar procesamiento en main thread
      if (!workerRef.current) {
        return processImageInMainThread(file, options, type)
      }

      const id = crypto.randomUUID()
      const imageData = await fileToImageData(file)

      return new Promise((resolve, reject) => {
        // Guardar la tarea
        tasksRef.current.set(id, { id, resolve, reject })
        setIsProcessing(true)

        // Enviar al worker
        workerRef.current!.postMessage({
          type,
          id,
          imageData,
          options,
        })
      })
    },
    [fileToImageData]
  )

  /**
   * Procesa múltiples imágenes en paralelo
   */
  const processImages = useCallback(
    async (
      files: File[],
      options: ProcessingOptions,
      type: 'convert' | 'compress' = 'convert'
    ): Promise<ProcessingResult[]> => {
      const promises = files.map((file) => processImage(file, options, type))
      return Promise.all(promises)
    },
    [processImage]
  )

  /**
   * Fallback: procesa imagen en main thread si worker no está disponible
   */
  const processImageInMainThread = async (
    file: File,
    options: ProcessingOptions,
    type: 'convert' | 'compress'
  ): Promise<ProcessingResult> => {
    // Implementación básica sin worker
    const imageData = await fileToImageData(file)
    
    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No se pudo obtener contexto 2D')
    }

    ctx.putImageData(imageData, 0, 0)

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Error al convertir imagen'))
            return
          }

          resolve({
            blob,
            width: canvas.width,
            height: canvas.height,
            size: blob.size,
          })
        },
        `image/${options.targetFormat || 'png'}`,
        (options.quality || 92) / 100
      )
    })
  }

  return {
    processImage,
    processImages,
    isProcessing,
    progress,
  }
}
