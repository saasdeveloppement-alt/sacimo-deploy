"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { fadeInUp } from "./PageContainer"

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  textColor: string
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  textColor 
}: MetricCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}











