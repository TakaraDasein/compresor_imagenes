/**
 * Variantes de animación optimizadas y reutilizables
 * Incluye soporte para prefers-reduced-motion
 */

import type { Variants, Transition } from "framer-motion"

// Detectar preferencia de movimiento reducido
export const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Transiciones optimizadas predefinidas
 */
export const transitions = {
  // Transición rápida y suave (botones, hover)
  fast: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.5,
  },
  // Transición normal (elementos generales)
  normal: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
    mass: 0.8,
  },
  // Transición suave (contenedores grandes)
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 1,
  },
  // Transición sin spring (alternativa más simple)
  easeOut: {
    type: "tween" as const,
    ease: "easeOut" as const,
    duration: 0.3,
  },
  // Transición instantánea (reduced motion)
  instant: {
    duration: 0,
  },
} as const

/**
 * Función helper para obtener la transición apropiada según preferencias del usuario
 */
export function getTransition(transition: keyof typeof transitions): Transition {
  return prefersReducedMotion ? transitions.instant : transitions[transition]
}

/**
 * FADE VARIANTS - Aparecer/Desaparecer
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: getTransition("normal"),
  },
  exit: {
    opacity: 0,
    transition: getTransition("fast"),
  },
}

/**
 * SLIDE UP VARIANTS - Deslizar desde abajo
 */
export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition("normal"),
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20,
    transition: getTransition("fast"),
  },
}

/**
 * SLIDE DOWN VARIANTS - Deslizar desde arriba
 */
export const slideDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition("normal"),
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -20,
    transition: getTransition("fast"),
  },
}

/**
 * SCALE VARIANTS - Escalar entrada/salida
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: getTransition("normal"),
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.95,
    transition: getTransition("fast"),
  },
}

/**
 * SCALE + FADE VARIANTS - Combina escala y fade
 */
export const scaleFadeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: getTransition("smooth"),
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.9,
    transition: getTransition("fast"),
  },
}

/**
 * SLIDE LEFT VARIANTS - Deslizar desde la derecha
 */
export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: getTransition("normal"),
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : -50,
    transition: getTransition("fast"),
  },
}

/**
 * SLIDE RIGHT VARIANTS - Deslizar desde la izquierda
 */
export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: getTransition("normal"),
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : 50,
    transition: getTransition("fast"),
  },
}

/**
 * STAGGER CONTAINER - Para animar hijos secuencialmente
 */
export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      ...getTransition("normal"),
      staggerChildren: prefersReducedMotion ? 0 : 0.1,
      delayChildren: prefersReducedMotion ? 0 : 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0,
    },
  },
}

/**
 * STAGGER ITEM - Item hijo de stagger container
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition("fast"),
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 10,
    transition: getTransition("fast"),
  },
}

/**
 * BUTTON HOVER - Efecto hover para botones
 */
export const buttonHoverVariants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: prefersReducedMotion ? 1 : 1.05,
    transition: getTransition("fast"),
  },
  tap: {
    scale: prefersReducedMotion ? 1 : 0.95,
    transition: getTransition("fast"),
  },
}

/**
 * BUTTON SUBTLE HOVER - Efecto hover sutil para botones
 */
export const buttonSubtleHoverVariants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: prefersReducedMotion ? 1 : 1.02,
    transition: getTransition("fast"),
  },
  tap: {
    scale: prefersReducedMotion ? 1 : 0.98,
    transition: getTransition("fast"),
  },
}

/**
 * CARD HOVER - Efecto hover para cards
 */
export const cardHoverVariants = {
  initial: {
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  hover: {
    y: prefersReducedMotion ? 0 : -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: getTransition("fast"),
  },
}

/**
 * PULSE VARIANTS - Animación de pulso (para loaders)
 */
export const pulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  pulse: {
    scale: prefersReducedMotion ? 1 : [1, 1.05, 1],
    opacity: prefersReducedMotion ? 1 : [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

/**
 * ROTATE VARIANTS - Rotación (para spinners)
 */
export const rotateVariants: Variants = {
  initial: {
    rotate: 0,
  },
  spin: {
    rotate: prefersReducedMotion ? 0 : 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

/**
 * BACKDROP VARIANTS - Para fondos de modales/diálogos
 */
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)",
  },
  visible: {
    opacity: 1,
    backdropFilter: prefersReducedMotion ? "blur(0px)" : "blur(4px)",
    transition: getTransition("fast"),
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: getTransition("fast"),
  },
}

/**
 * MODAL VARIANTS - Para contenido de modales
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.95,
    y: prefersReducedMotion ? 0 : 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: getTransition("smooth"),
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.95,
    y: prefersReducedMotion ? 0 : 20,
    transition: getTransition("fast"),
  },
}

/**
 * LIST ITEM VARIANTS - Para items de lista con entrada animada
 */
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : -20,
  },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...getTransition("normal"),
      delay: prefersReducedMotion ? 0 : index * 0.05,
    },
  }),
  exit: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : -20,
    transition: getTransition("fast"),
  },
}

/**
 * NOTIFICATION VARIANTS - Para notificaciones/toasts
 */
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -50,
    scale: prefersReducedMotion ? 1 : 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: getTransition("smooth"),
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion ? 0 : 100,
    transition: getTransition("fast"),
  },
}

/**
 * PROGRESS BAR VARIANTS - Para barras de progreso
 */
export const progressBarVariants: Variants = {
  initial: {
    width: "0%",
  },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: prefersReducedMotion ? 0 : 0.5,
      ease: "easeOut",
    },
  }),
}

/**
 * Helper para aplicar variantes con delay
 */
export function withDelay(variants: Variants, delay: number): Variants {
  if (prefersReducedMotion) {
    return variants
  }

  return {
    ...variants,
    visible: {
      ...variants.visible,
      transition: {
        ...(variants.visible as any).transition,
        delay,
      },
    },
  }
}

/**
 * Helper para crear animación de entrada con custom delay
 */
export function createEnterAnimation(delay: number = 0) {
  return {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { ...getTransition("normal"), delay: prefersReducedMotion ? 0 : delay },
  }
}
