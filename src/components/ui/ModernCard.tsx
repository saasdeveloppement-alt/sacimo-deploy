"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fadeInUp } from "./PageContainer"

interface ModernCardProps {
  children: React.ReactNode
  title?: string
  icon?: React.ReactNode
  className?: string
  hover?: boolean
}

export default function ModernCard({ 
  children, 
  title, 
  icon, 
  className = "",
  hover = true 
}: ModernCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
        {(title || icon) && (
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              {icon}
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}











