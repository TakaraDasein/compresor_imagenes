"use client"

import { motion } from "framer-motion"
import { Wand2 } from "lucide-react"

interface OptimizeButtonProps {
  onClick: () => void
  disabled: boolean
  isOptimizing: boolean
}

export default function OptimizeButton({ onClick, disabled, isOptimizing }: OptimizeButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 min-w-[180px] ${
        disabled
          ? "bg-white/10 text-white/50 cursor-not-allowed"
          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {isOptimizing ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Optimizando...</span>
        </>
      ) : (
        <>
          <Wand2 className="w-5 h-5" />
          <span>Optimizar</span>
        </>
      )}
    </motion.button>
  )
}
