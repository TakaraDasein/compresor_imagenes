"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Zap, Layers, Sparkles } from "lucide-react"

type AnimationMode = 'idle' | 'compress' | 'convert' | 'sparkle'

// Generar posiciones consistentes para las partículas
const generateParticles = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: (i * 37 + 23) % 100, // Genera números pseudo-aleatorios pero consistentes
    top: (i * 53 + 17) % 100,
    duration: 3 + (i % 5),
    delay: i % 5,
    yOffset: -50 - (i % 3) * 25,
    xOffset: -10 + (i % 3) * 10,
  }))
}

const PARTICLES = generateParticles()

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [animationMode, setAnimationMode] = useState<AnimationMode>('idle')
  const [isMounted, setIsMounted] = useState(false)
  const logoRef = useRef<HTMLDivElement>(null)

  // Detectar cuando el componente está montado en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Motion values para animación suave
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Configuración de spring para movimiento suave y fluido
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // Transformar posición del mouse a rotación 3D
  const rotateX = useTransform(y, [-0.5, 0.5], [25, -25])
  const rotateY = useTransform(x, [-0.5, 0.5], [-25, 25])
  const scale = useTransform(mouseX, [-0.5, 0.5], [0.95, 1.05])

  // Trackear posición del mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return

      const rect = logoRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Normalizar posición del mouse relativa al logo (-0.5 a 0.5)
      const normalizedX = (e.clientX - centerX) / rect.width
      const normalizedY = (e.clientY - centerY) / rect.height

      mouseX.set(normalizedX)
      mouseY.set(normalizedY)

      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseX, mouseY])

  // Animaciones específicas según el modo
  const getLogoAnimation = () => {
    switch (animationMode) {
      case 'compress':
        // Animación de compresión: se achica y expande
        return {
          scale: [1, 0.7, 1.1, 1],
          rotateZ: [0, -10, 10, 0],
          transition: { duration: 0.8, ease: "easeInOut" }
        }
      case 'convert':
        // Animación de conversión: gira y cambia forma
        return {
          rotateY: [0, 180, 360],
          scale: [1, 1.2, 1],
          transition: { duration: 1.2, ease: "easeInOut" }
        }
      case 'sparkle':
        // Animación de brillo: pulsa y brilla
        return {
          scale: [1, 1.3, 1],
          rotateZ: [0, 360],
          filter: [
            "brightness(1) saturate(1)",
            "brightness(1.5) saturate(1.5)",
            "brightness(1) saturate(1)"
          ],
          transition: { duration: 1, ease: "easeOut" }
        }
      default:
        // Animación idle suave
        return {
          rotateZ: [0, 2, -2, 0],
          transition: {
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }
        }
    }
  }

  const buttons = [
    {
      icon: Zap,
      label: "Comprimir",
      href: "/tools/compressor",
      color: "#36e2d8",
      mode: 'compress' as AnimationMode,
    },
    {
      icon: Layers,
      label: "Convertir",
      href: "/tools/converter",
      color: "#36e2d8",
      mode: 'convert' as AnimationMode,
    },
    {
      icon: Sparkles,
      label: "Efectos",
      href: "/tools",
      color: "#36e2d8",
      mode: 'sparkle' as AnimationMode,
    },
  ]

  const handleButtonClick = (mode: AnimationMode) => {
    setAnimationMode(mode)
    // Volver a idle después de la animación
    setTimeout(() => {
      setAnimationMode('idle')
    }, 1500)
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative z-10 overflow-hidden">
      {/* Contenedor 3D - Más pequeño */}
      <div 
        ref={logoRef}
        className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"
        style={{ perspective: "1200px" }}
      >
        {/* Logo con efecto 3D */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateX: -30 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            rotateX: 0,
          }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
          }}
          className="relative w-full h-full"
          style={{
            rotateX,
            rotateY,
            scale,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Capas de profundidad para efecto 2.5D */}
          
          {/* Capa de sombra profunda */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#36e2d8]/5 blur-3xl"
            style={{
              translateZ: -100,
              scale: 1.3,
            }}
          />

          {/* Capa de glow medio pulsante suave */}
          <motion.div
            className="absolute inset-0 rounded-full bg-[#36e2d8]/15 blur-2xl"
            style={{
              translateZ: -50,
              scale: 1.2,
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1.2, 1.3, 1.2],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Capa de fondo cercana */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#36e2d8]/20 to-transparent blur-xl"
            style={{
              translateZ: -25,
              scale: 1.1,
            }}
          />

          {/* Logo principal - capa frontal con animación viva y dinámica */}
          <motion.div
            className="absolute inset-0"
            style={{
              translateZ: 50,
            }}
            animate={getLogoAnimation()}
            key={animationMode} // Re-trigger animation on mode change
          >
            <motion.div 
              className="relative w-full h-full"
              animate={animationMode === 'idle' ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                duration: 3,
                repeat: animationMode === 'idle' ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/Isotipo_Frame.png"
                alt="V1TR0 Logo"
                fill
                className="object-contain"
                priority
                style={{
                  filter: animationMode === 'sparkle' 
                    ? "drop-shadow(0 0 80px rgba(54, 226, 216, 0.8)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))"
                    : "drop-shadow(0 0 60px rgba(54, 226, 216, 0.4)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))",
                }}
              />
            </motion.div>
          </motion.div>

          {/* Efectos especiales según el modo de animación */}
          <AnimatePresence>
            {animationMode === 'compress' && (
              <motion.div
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: [0, 1, 0], scale: [1.5, 0.5, 0.3] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
                style={{ translateZ: 100 }}
              >
                <div className="absolute inset-0 border-4 border-[#36e2d8] rounded-lg" />
              </motion.div>
            )}
            
            {animationMode === 'convert' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: i * 45 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1.5, 2],
                      rotate: i * 45 + 180
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, delay: i * 0.1 }}
                    className="absolute inset-0"
                    style={{ translateZ: 80 + i * 5 }}
                  >
                    <div 
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#36e2d8] rounded-full blur-sm"
                      style={{
                        transform: `translate(-50%, -50%) translateY(-${50 + i * 10}px)`
                      }}
                    />
                  </motion.div>
                ))}
              </>
            )}

            {animationMode === 'sparkle' && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 1, 0], 
                      scale: [0, 1, 1.5, 0],
                      rotate: [0, 180, 360],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: 1, 
                      delay: i * 0.05,
                      ease: "easeOut"
                    }}
                    className="absolute"
                    style={{ 
                      translateZ: 90,
                      left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 40}%`,
                      top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 40}%`,
                    }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full blur-sm" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Highlights brillantes - capa más frontal con animación fluida */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              translateZ: 75,
            }}
          >
            <motion.div
              className="absolute top-1/4 left-1/4 w-16 h-16 md:w-20 md:h-20 bg-white/30 rounded-full blur-2xl"
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.3, 1],
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/3 w-12 h-12 md:w-16 md:h-16 bg-[#36e2d8]/40 rounded-full blur-xl"
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.4, 1],
                x: [0, -10, 0],
                y: [0, 10, 0],
              }}
              transition={{
                duration: 3.5,
                delay: 0.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute top-1/2 right-1/4 w-10 h-10 md:w-14 md:h-14 bg-[#36e2d8]/30 rounded-full blur-lg"
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
                x: [0, 5, 0],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2.5,
                delay: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Floating animation suave - aplicado a todo el conjunto */}
          <motion.div
            className="absolute inset-0"
            animate={{
              y: [0, -12, 0],
              x: [0, 3, 0],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Reflejo en el "suelo" */}
        <motion.div
          className="absolute top-full left-0 right-0 h-1/2 overflow-hidden opacity-20"
          style={{
            transform: "scaleY(-1)",
            transformOrigin: "top",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src="/Isotipo_Frame.png"
              alt=""
              fill
              className="object-contain blur-sm"
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </div>

      {/* Botones tecnológicos en la derecha */}
      <div className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
        {buttons.map((button, index) => (
          <motion.div
            key={button.label}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
          >
            <Link href={button.href} onClick={(e) => {
              e.preventDefault()
              handleButtonClick(button.mode)
              // Navegar después de la animación
              setTimeout(() => {
                window.location.href = button.href
              }, 1500)
            }}>
              <motion.button
                className="group relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Double Stroke - Exterior */}
                <motion.div 
                  className="absolute inset-0 border-2 border-[#36e2d8]/30 rounded-lg transition-all duration-300 group-hover:border-[#36e2d8]/60"
                  animate={animationMode === button.mode ? {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Double Stroke - Interior */}
                <motion.div 
                  className="absolute inset-1 border border-[#36e2d8]/50 rounded-lg transition-all duration-300 group-hover:border-[#36e2d8]/80"
                  animate={animationMode === button.mode ? {
                    rotate: [0, -10, 10, 0],
                    scale: [1, 0.95, 1],
                  } : {}}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-[#36e2d8]/0 rounded-lg blur-md transition-all duration-300 group-hover:bg-[#36e2d8]/20"
                  animate={animationMode === button.mode ? {
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.3, 1],
                  } : {
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: animationMode === button.mode ? 0.8 : 2,
                    repeat: animationMode === button.mode ? 0 : Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                />

                {/* Background */}
                <motion.div 
                  className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg transition-all duration-300 group-hover:bg-slate-800/90"
                  animate={animationMode === button.mode ? {
                    backgroundColor: ["rgba(15, 23, 42, 0.8)", "rgba(54, 226, 216, 0.2)", "rgba(15, 23, 42, 0.8)"],
                  } : {}}
                  transition={{ duration: 0.8 }}
                />

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={animationMode === button.mode ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, 360],
                    } : {}}
                    transition={{ duration: 0.8 }}
                  >
                    <button.icon 
                      className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-[#36e2d8] transition-all duration-300 group-hover:text-white group-hover:scale-110"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                </div>

                {/* Corner accents */}
                <motion.div 
                  className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[#36e2d8] rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={animationMode === button.mode ? {
                    opacity: [0, 1, 1, 0],
                  } : {}}
                  transition={{ duration: 0.8 }}
                />
                <motion.div 
                  className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[#36e2d8] rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={animationMode === button.mode ? {
                    opacity: [0, 1, 1, 0],
                  } : {}}
                  transition={{ duration: 0.8 }}
                />

                {/* Scan line effect */}
                <motion.div
                  className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
                  initial={false}
                >
                  <motion.div
                    className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#36e2d8]/50 to-transparent"
                    animate={animationMode === button.mode ? {
                      y: [-20, 100, -20],
                    } : {
                      y: [-20, 100],
                    }}
                    transition={{
                      duration: animationMode === button.mode ? 0.8 : 2,
                      repeat: animationMode === button.mode ? 0 : Number.POSITIVE_INFINITY,
                      ease: "linear",
                      delay: index * 0.4,
                    }}
                  />
                </motion.div>

                {/* Tooltip */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-slate-900/95 backdrop-blur-sm border border-[#36e2d8]/30 rounded-lg px-4 py-2 whitespace-nowrap">
                    <span className="text-sm font-mono text-[#36e2d8]">{button.label}</span>
                  </div>
                  {/* Arrow */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-l-4 border-l-[#36e2d8]/30 border-y-4 border-y-transparent" />
                </div>
              </motion.button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Partículas flotantes de fondo - Solo renderizar en cliente */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none">
          {PARTICLES.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-[#36e2d8]/30 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, particle.yOffset, 0],
                x: [0, particle.xOffset, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Number.POSITIVE_INFINITY,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
