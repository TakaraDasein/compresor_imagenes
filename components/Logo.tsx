"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface LogoProps {
  compact?: boolean
}

export default function Logo({ compact = false }: LogoProps) {
  const [isGlowing, setIsGlowing] = useState(false)

  // Animación de levitación constante
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  }

  // Efecto de brillo al hacer clic
  const handleClick = () => {
    setIsGlowing(true)
    setTimeout(() => setIsGlowing(false), 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`flex ${compact ? 'justify-start' : 'justify-center'} ${compact ? 'mb-0' : 'mb-6'}`}
    >
      <motion.div
        className={`relative cursor-pointer ${
          compact 
            ? 'w-12 h-12 md:w-16 md:h-16' 
            : 'w-32 h-32 md:w-56 md:h-52 mx-0 border-transparent text-center my-3 px-1.5 py-10'
        } ${isGlowing ? "animate-pulse" : ""}`}
        animate={!compact ? floatingAnimation : {}}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className={`absolute inset-0 rounded-full ${isGlowing ? "bg-cyan-500/30 blur-xl" : ""} transition-all duration-300`}
        ></div>
        <Image 
          src="/Isotipo_Frame.png" 
          alt="V1TR0 Logo" 
          fill 
          className={`object-contain ${compact ? 'p-1' : 'p-2'}`} 
          priority 
        />
      </motion.div>
    </motion.div>
  )
}
