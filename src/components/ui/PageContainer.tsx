"use client"

import { motion } from "framer-motion"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <motion.div 
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 ${className}`}
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      {children}
    </motion.div>
  )
}

export { fadeInUp, staggerChildren }





