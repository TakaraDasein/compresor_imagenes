/**
 * Componente para mostrar el progreso de procesamiento de imágenes
 * Muestra una barra de progreso con animaciones suaves
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { fadeVariants, progressBarVariants } from '@/lib/animation-variants'

interface ProcessingProgressProps {
  isProcessing: boolean
  progress: Record<string, number>
  total?: number
  completed?: number
  failed?: number
}

export function ProcessingProgress({
  isProcessing,
  progress,
  total = 0,
  completed = 0,
  failed = 0,
}: ProcessingProgressProps) {
  // Calcular progreso promedio
  const progressValues = Object.values(progress)
  const averageProgress = progressValues.length > 0
    ? progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length
    : 0

  // Calcular progreso total
  const totalProgress = total > 0 ? ((completed + failed) / total) * 100 : averageProgress

  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed bottom-8 right-8 z-50 w-80 rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-lg"
          role="status"
          aria-live="polite"
          aria-label="Progreso de procesamiento"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border p-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-5 w-5 text-primary" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Procesando imágenes</h3>
              <p className="text-xs text-muted-foreground">
                {completed > 0 || failed > 0
                  ? `${completed + failed} de ${total} procesadas`
                  : 'Preparando...'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-4 space-y-3">
            <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                variants={progressBarVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-y-0 left-0 bg-primary"
                style={{ width: `${totalProgress}%` }}
              />
            </div>

            {/* Stats */}
            {total > 0 && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  {completed > 0 && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{completed} completadas</span>
                    </div>
                  )}
                  {failed > 0 && (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>{failed} fallidas</span>
                    </div>
                  )}
                </div>
                <span className="font-semibold text-foreground">
                  {Math.round(totalProgress)}%
                </span>
              </div>
            )}

            {/* Individual Progress (si hay múltiples tareas) */}
            {Object.keys(progress).length > 1 && (
              <div className="space-y-1 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Tareas en progreso: {Object.keys(progress).length}
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {Object.entries(progress).slice(0, 3).map(([id, value]) => (
                    <div key={id} className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          className="h-full bg-primary/70"
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round(value)}%
                      </span>
                    </div>
                  ))}
                  {Object.keys(progress).length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{Object.keys(progress).length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
