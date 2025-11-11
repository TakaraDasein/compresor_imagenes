"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { backdropVariants, modalVariants, buttonHoverVariants } from "@/lib/animation-variants"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
}: ConfirmDialogProps) {
  const colors = {
    danger: {
      bg: "bg-red-600",
      hover: "hover:bg-red-700",
      icon: "text-red-400",
    },
    warning: {
      bg: "bg-yellow-600",
      hover: "hover:bg-yellow-700",
      icon: "text-yellow-400",
    },
    info: {
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
      icon: "text-blue-400",
    },
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl"
            >
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                variants={buttonHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Icon */}
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-full p-3 ${colors[type].icon} bg-slate-700/50`}>
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>

              {/* Message */}
              <p className="mb-6 text-slate-300">{message}</p>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  variants={buttonHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 rounded-xl bg-slate-700 px-4 py-3 font-semibold text-white transition-all hover:bg-slate-600"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  onClick={handleConfirm}
                  variants={buttonHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className={`flex-1 rounded-xl ${colors[type].bg} px-4 py-3 font-semibold text-white transition-all ${colors[type].hover}`}
                >
                  {confirmText}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
