"use client"

import { motion } from "framer-motion"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="w-full py-4 mt-8 text-center text-white/60"
    >
      <div className="container mx-auto">
        <p className="text-sm">&copy; {currentYear} V1tr0. Todos los derechos reservados.</p>
        
      </div>
    </motion.footer>
  )
}
