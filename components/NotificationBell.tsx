"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ActivityIcon } from "lucide-react" // O Bell si prefieres un ícono de campana más estándar
import { cn } from "@/lib/utils"

// Paleta de colores derivada del logo
const colors = {
  primary: "#36e2d8",
  primaryDark: "#209d96",
  primaryLight: "#7eeae3",
  secondary: "#2d3748",
  secondaryLight: "#4a5568",
  accent: "#805ad5",
  accentDark: "#6b46c1",
  danger: "#e53e3e",
  success: "#38a169",
  background: "rgba(15, 23, 42, 0.8)",
}

export type Notification = {
  id: string
  title: string
  message: string
  type: "success" | "error" | "info" | "warning"
  read: boolean
  timestamp: Date
}

interface NotificationBellProps {
  className?: string
}

export default function NotificationBell({ className }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [isHoveringButton, setIsHoveringButton] = useState(false)

  useEffect(() => {
    setHasUnread(notifications.some((notification) => !notification.read))
  }, [notifications])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (hasUnread && !isOpen) {
      setAnimationKey((prevKey) => prevKey + 1)
    }
  }, [hasUnread, isOpen])

  const addNotification = (notification: Omit<Notification, "id" | "read" | "timestamp">) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      ...notification,
      read: false,
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev].slice(0, 10))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  useEffect(() => {
    // @ts-ignore
    window.notificationSystem = {
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
    }
  }, [])

  return (
    <div className={cn("relative", className)} ref={bellRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="hidden md:inline-flex relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors overflow-hidden mx-0.5 space-x-5 px-5 items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
        onHoverStart={() => {
          setIsHoveringButton(true)
          // La animación de entrada del ícono (deslizamiento) se activa si hay nuevas notificaciones y el panel está cerrado.
          // No es necesario reactivarla explícitamente en hover aquí si el objetivo es solo el hover simple.
          if (hasUnread && !isOpen) {
            setAnimationKey((prevKey) => prevKey + 1) // Mantener para la animación de nueva notificación
          }
        }}
        onHoverEnd={() => setIsHoveringButton(false)}
      >
        <motion.div
          key={animationKey} // Mantiene la animación de entrada de izquierda a derecha
          initial={{ x: "-50%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
          // Se eliminan las 'variants' y el 'animate' condicional para el bamboleo
        >
          <ActivityIcon // O considera usar Bell de lucide-react para un ícono de campana
            className="border-0 shadow-md h-10 w-12"
            style={{
              color: isHoveringButton ? colors.primaryLight : hasUnread ? colors.primary : colors.primaryDark,
            }}
          />
        </motion.div>
        <AnimatePresence>
          {hasUnread && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500"
              style={{
                boxShadow: `0 0 0 2px rgba(15, 23, 42, 0.8)`,
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-50"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="p-3 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-medium">Notificaciones</h3>
              {notifications.length > 0 && (
                <button className="text-xs text-white/70 hover:text-white transition-colors" onClick={markAllAsRead}>
                  Marcar todas como leídas
                </button>
              )}
            </div>
            <div className="divide-y divide-white/10">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-white/60 text-sm">No hay notificaciones</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn("p-3 hover:bg-white/5 transition-colors", !notification.read && "bg-white/5")}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h4
                        className="text-sm font-medium mb-1"
                        style={{
                          color:
                            notification.type === "success"
                              ? colors.success
                              : notification.type === "error"
                                ? colors.danger
                                : notification.type === "warning"
                                  ? "#f59e0b"
                                  : colors.primary,
                        }}
                      >
                        {notification.title}
                      </h4>
                      <button
                        className="text-white/40 hover:text-white/70 transition-colors text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-white/80 text-xs mb-1">{notification.message}</p>
                    <p className="text-white/50 text-xs">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                    {!notification.read && <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 ml-auto" />}
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t border-white/10">
                <button
                  className="w-full text-xs text-white/70 hover:text-white p-1 transition-colors"
                  onClick={clearAllNotifications}
                >
                  Limpiar todas
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
