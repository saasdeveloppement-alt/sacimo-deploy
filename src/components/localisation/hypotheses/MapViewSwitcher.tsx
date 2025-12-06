/**
 * 🗺️ MAP VIEW SWITCHER
 * 
 * Composant pour basculer entre les différents types de vues cartographiques
 */

"use client"

import { Button } from "@/components/ui/button"
import { Map, Satellite, Eye, Layers, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

export type MapViewType = "plan" | "satellite" | "streetview" | "parcelle" | "ign"

interface MapViewSwitcherProps {
  activeView: MapViewType
  onViewChange: (view: MapViewType) => void
  className?: string
}

const views: Array<{ id: MapViewType; label: string; icon: React.ReactNode }> = [
  { id: "plan", label: "Plan", icon: <Map className="h-4 w-4" /> },
  { id: "satellite", label: "Satellite", icon: <Satellite className="h-4 w-4" /> },
  { id: "streetview", label: "Street View", icon: <Eye className="h-4 w-4" /> },
  { id: "parcelle", label: "Parcelle", icon: <Layers className="h-4 w-4" /> },
  { id: "ign", label: "IGN", icon: <Camera className="h-4 w-4" /> },
]

export function MapViewSwitcher({
  activeView,
  onViewChange,
  className,
}: MapViewSwitcherProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto rounded-lg border bg-white p-2",
        className
      )}
    >
      {views.map((view) => (
        <Button
          key={view.id}
          variant={activeView === view.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(view.id)}
          className={cn(
            "flex items-center gap-2 whitespace-nowrap",
            activeView === view.id && "bg-primary-600 text-white"
          )}
        >
          {view.icon}
          <span>{view.label}</span>
        </Button>
      ))}
    </div>
  )
}

