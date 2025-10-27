"use client"

import { motion } from "framer-motion"
import { fadeInUp } from "./PageContainer"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export default function SectionHeader({ 
  title, 
  subtitle, 
  icon, 
  action, 
  className = "" 
}: SectionHeaderProps) {
  return (
    <motion.div 
      className={`bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10 ${className}`}
      variants={fadeInUp}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent flex items-center gap-3"
              variants={fadeInUp}
            >
              {icon}
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p 
                className="text-slate-600 text-lg"
                variants={fadeInUp}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
          {action && (
            <motion.div variants={fadeInUp}>
              {action}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}





