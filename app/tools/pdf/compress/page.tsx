"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Zap, Download, ArrowLeft, Trash2, FileDown, Loader2, CheckCircle2, X } from "lucide-react"
import Link from "next/link"
import DragDropZone from "@/components/shared/DragDropZone"
import { compressPDF, downloadCompressedPDF, formatFileSize, type CompressionResult } from "@/lib/pdf/compress"

interface PDFFile {
  id: string
  file: File
  isCompressing: boolean
  result?: CompressionResult
  error?: string
}

export default function PDFCompressPage() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [isCompressing, setIsCompressing] = useState(false)

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newFiles: PDFFile[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      isCompressing: false,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const compressSingle = useCallback(async (fileId: string) => {
    const pdfFile = files.find((f) => f.id === fileId)
    if (!pdfFile) return

    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isCompressing: true, error: undefined } : f))
    )

    try {
      const result = await compressPDF(pdfFile.file)
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, result, isCompressing: false } : f))
      )
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, isCompressing: false, error: error instanceof Error ? error.message : 'Error desconocido' }
            : f
        )
      )
    }
  }, [files])

  const compressAll = useCallback(async () => {
    setIsCompressing(true)
    const uncompressedFiles = files.filter((f) => !f.result && !f.error)

    for (const file of uncompressedFiles) {
      await compressSingle(file.id)
    }

    setIsCompressing(false)
  }, [files, compressSingle])

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const clearAll = useCallback(() => {
    setFiles([])
  }, [])

  const downloadSingle = useCallback((file: PDFFile) => {
    if (!file.result) return
    downloadCompressedPDF(file.result, file.file.name)
  }, [])

  const compressedCount = files.filter((f) => f.result).length
  const totalOriginalSize = files.reduce((acc, f) => acc + f.file.size, 0)
  const totalCompressedSize = files.reduce((acc, f) => acc + (f.result?.compressedSize || 0), 0)
  const totalSavings = totalOriginalSize > 0 ? ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1) : "0"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link href="/tools/pdf" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#36e2d8] transition-colors duration-300 mb-6 font-mono text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver a PDF Tools
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-thin font-mono text-white mb-4">
            Comprimir <span className="text-[#36e2d8]">PDF</span>
          </h1>
          <p className="text-slate-400 font-mono text-sm md:text-base">
            Reduce el tamaño de tus archivos PDF eliminando metadata
          </p>
        </motion.div>

        {/* Upload Zone or Files Grid */}
        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <DragDropZone
                onFilesSelected={handleFilesSelected}
                accept="application/pdf"
                multiple={true}
                title="Arrastra tus archivos PDF aquí"
                description="O haz clic para seleccionar archivos PDF"
                icon={<Upload className="w-16 h-16" />}
              />
            </motion.div>
          ) : (
            <motion.div
              key="files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={compressAll}
                  disabled={isCompressing || files.every((f) => f.result)}
                  className="flex items-center gap-2 rounded-xl bg-[#36e2d8] px-6 py-3 font-semibold font-mono text-slate-900 shadow-lg shadow-[#36e2d8]/20 transition-all hover:bg-[#2dd3c9] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Comprimiendo...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Comprimir Todo</span>
                    </>
                  )}
                </button>

                {compressedCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-2 rounded-xl bg-red-600/20 px-6 py-3 font-semibold font-mono text-red-400 transition-all hover:bg-red-600/30"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Limpiar Todo</span>
                  </button>
                )}
              </div>

              {/* Stats */}
              {compressedCount > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm">
                    <div className="text-sm text-slate-400 font-mono">Comprimidos</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {compressedCount}/{files.length}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm">
                    <div className="text-sm text-slate-400 font-mono">Tamaño Original</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {formatFileSize(totalOriginalSize)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm">
                    <div className="text-sm text-slate-400 font-mono">Tamaño Final</div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {formatFileSize(totalCompressedSize)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-800/50 p-4 backdrop-blur-sm">
                    <div className="text-sm text-slate-400 font-mono">Ahorro</div>
                    <div className="text-2xl font-bold text-[#36e2d8] font-mono">
                      {totalSavings}%
                    </div>
                  </div>
                </div>
              )}

              {/* Files Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="group relative overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-4 right-4 rounded-lg bg-red-600/80 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>

                    {/* Status Icon */}
                    {file.isCompressing && (
                      <div className="absolute top-4 left-4">
                        <Loader2 className="h-5 w-5 animate-spin text-[#36e2d8]" />
                      </div>
                    )}
                    {file.result && (
                      <div className="absolute top-4 left-4">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      </div>
                    )}

                    {/* File Info */}
                    <div className="mt-8">
                      <div className="text-sm font-medium text-white truncate font-mono" title={file.file.name}>
                        {file.file.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-2 font-mono">
                        <span>{formatFileSize(file.file.size)}</span>
                        {file.result && (
                          <>
                            {" → "}
                            <span className="text-[#36e2d8]">
                              {formatFileSize(file.result.compressedSize)}
                            </span>
                            {" "}
                            <span className="text-green-400">
                              ({file.result.compressionRatio.toFixed(1)}% ahorro)
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {file.error && (
                      <div className="mt-3 text-xs text-red-400 bg-red-600/10 rounded px-2 py-1 font-mono">
                        {file.error}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {!file.result && !file.isCompressing && (
                        <button
                          onClick={() => compressSingle(file.id)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#36e2d8] px-3 py-2 text-sm font-semibold font-mono text-slate-900 transition-all hover:bg-[#2dd3c9]"
                        >
                          <Zap className="h-4 w-4" />
                          <span>Comprimir</span>
                        </button>
                      )}

                      {file.result && (
                        <button
                          onClick={() => downloadSingle(file)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold font-mono text-white transition-all hover:bg-slate-600"
                        >
                          <Download className="h-4 w-4" />
                          <span>Descargar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              <button
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "application/pdf"
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || [])
                    handleFilesSelected(files)
                  }
                  input.click()
                }}
                className="w-full rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/30 p-6 text-slate-300 font-mono transition-all hover:border-[#36e2d8] hover:bg-slate-800/50 hover:text-white"
              >
                <FileDown className="mx-auto h-8 w-8 mb-2" />
                <span className="font-semibold">Añadir más archivos PDF</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
