"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Map } from "lucide-react"

export function GeoAIMap() {
  return (
    <Card className="border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Carte interactive IA</h3>
        </div>

        <div className="h-96 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <Map className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium">Carte interactive</p>
            <p className="text-sm">Intégration carte à venir</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

