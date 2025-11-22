"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Badge } from "lucide-react"
import { Badge as UIBadge } from "@/components/ui/badge"

export function GeoAIMap() {
  return (
    <Card className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl shadow-lg hover:shadow-xl transition-all">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 rounded-xl">
              <MapPin className="w-6 h-6 text-cyan-600" strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Carte interactive IA</CardTitle>
              <CardDescription className="text-xs text-gray-500">Localisations en temps réel</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Interactive Map Placeholder */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-80 overflow-hidden mb-4">
          {/* Scan Effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <MapPin className="w-24 h-24 text-primary-600 opacity-30" strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* Map Markers */}
          {[
            { top: "30%", left: "40%", delay: 0 },
            { top: "50%", left: "60%", delay: 0.5 },
            { top: "70%", left: "35%", delay: 1 },
            { top: "45%", left: "75%", delay: 1.5 },
          ].map((marker, index) => (
            <motion.div
              key={index}
              className="absolute w-5 h-5 bg-primary-600 rounded-full"
              style={{ top: marker.top, left: marker.left }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: marker.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Center Message */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-2xl">
              <MapPin className="w-16 h-16 text-primary-600 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Carte interactive</h3>
              <p className="text-sm text-gray-600 mb-4">Intégration carte à venir</p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                <motion.div
                  className="w-2 h-2 bg-primary-600 rounded-full"
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span>127 points actifs</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

