"use client"

import { useEffect, useRef } from "react"

// Definir tipos de partículas relacionadas con la compresión
type ParticleType = "pixel" | "circle" | "arrow"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  type: ParticleType
  rotation: number
  opacity: number
  color: string
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)

  // Inicializar partículas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ajustar tamaño del canvas al tamaño de la ventana
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        initParticles()
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // Inicializar partículas
    function initParticles() {
      particles.current = []
      const colors = ["#36e2d8", "#2bc4bb", "#209d96"]

      // Crear 30 partículas con diferentes tipos
      for (let i = 0; i < 30; i++) {
        const type: ParticleType = i % 3 === 0 ? "pixel" : i % 3 === 1 ? "circle" : "arrow"
        particles.current.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size:
            type === "pixel"
              ? 5 + Math.random() * 10
              : type === "circle"
                ? 3 + Math.random() * 8
                : 8 + Math.random() * 12,
          speed: 0.2 + Math.random() * 0.5,
          type,
          rotation: Math.random() * 360,
          opacity: 0.1 + Math.random() * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    // Función para dibujar partículas
    function drawParticles() {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)

        // Dibujar diferentes formas según el tipo
        if (particle.type === "pixel") {
          // Cuadrado para representar píxeles
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
        } else if (particle.type === "circle") {
          // Círculo
          ctx.beginPath()
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (particle.type === "arrow") {
          // Flecha de compresión (dos triángulos apuntando uno hacia el otro)
          const arrowSize = particle.size
          ctx.beginPath()
          ctx.moveTo(-arrowSize / 2, -arrowSize / 4)
          ctx.lineTo(0, arrowSize / 4)
          ctx.lineTo(-arrowSize / 2, arrowSize / 4)
          ctx.closePath()
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(arrowSize / 2, -arrowSize / 4)
          ctx.lineTo(0, arrowSize / 4)
          ctx.lineTo(arrowSize / 2, arrowSize / 4)
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      })
    }

    // Función para animar partículas
    function animateParticles() {
      particles.current.forEach((particle) => {
        // Mover partículas
        particle.y += particle.speed
        particle.rotation += 0.1

        // Reiniciar posición cuando salen de la pantalla
        if (particle.y > canvas.height + particle.size) {
          particle.y = -particle.size
          particle.x = Math.random() * canvas.width
        }
      })

      drawParticles()
      animationRef.current = requestAnimationFrame(animateParticles)
    }

    // Iniciar animación
    animateParticles()

    // Limpiar al desmontar
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
