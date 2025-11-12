"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { 
  Filter, 
  X, 
  MapPin, 
  Home, 
  DollarSign, 
  Users, 
  Calendar,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Bed
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AdvancedFilters, initialFilters } from "@/hooks/useAdvancedFilters"

interface AdvancedFiltersProps {
  onFilterChange: (filters: AdvancedFilters) => void
  onApply?: () => void // Callback optionnel pour le bouton Appliquer
  initialFilters?: AdvancedFilters
  availableCities?: string[]
}

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'LOFT', label: 'Loft' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'TOWNHOUSE', label: 'Maison de ville' },
]

const COMMON_CITIES = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 
  'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
]

export default function AdvancedFiltersComponent({
  onFilterChange,
  onApply,
  initialFilters: propsInitialFilters,
  availableCities = COMMON_CITIES,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<AdvancedFilters>(
    propsInitialFilters || initialFilters
  )
  const [cityInput, setCityInput] = useState("")

  const handleFilterChange = (key: keyof AdvancedFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handleCityToggle = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter((c) => c !== city)
      : [...filters.cities, city]
    handleFilterChange('cities', newCities)
  }

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type]
    handleFilterChange('types', newTypes)
  }

  const handleAddCity = () => {
    if (cityInput.trim() && !filters.cities.includes(cityInput.trim())) {
      handleFilterChange('cities', [...filters.cities, cityInput.trim()])
      setCityInput("")
    }
  }

  const handleRemoveCity = (city: string) => {
    handleFilterChange('cities', filters.cities.filter((c) => c !== city))
  }

  const handleReset = () => {
    const resetFilters = initialFilters
    setFilters(resetFilters)
    setCityInput("")
    onFilterChange(resetFilters)
  }

  const handleApply = () => {
    onFilterChange(filters)
    // Appeler le callback onApply si fourni (pour déclencher la synchronisation)
    if (onApply) {
      onApply()
    }
  }

  const handleBadgeClick = (section: string) => {
    setIsOpen(true)
    // Scroll vers la section après un court délai pour laisser l'animation s'ouvrir
    setTimeout(() => {
      const element = document.querySelector(`[data-accordion-section="${section}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  }

  const getActiveFiltersCount = () => {
    return [
      filters.cities.length,
      filters.types.length,
      filters.minPrice ? 1 : 0,
      filters.maxPrice ? 1 : 0,
      filters.minSurface ? 1 : 0,
      filters.maxSurface ? 1 : 0,
      filters.rooms ? 1 : 0,
      filters.sellerType !== 'all' ? 1 : 0,
      filters.dateFrom ? 1 : 0,
    ].reduce((a, b) => a + b, 0)
  }

  const activeFiltersCount = getActiveFiltersCount()
  const hasActiveFilters = activeFiltersCount > 0

  // Calculer les compteurs par catégorie
  const citiesCount = filters.cities.length
  const typesCount = filters.types.length
  const priceCount = (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0)
  const surfaceCount = (filters.minSurface ? 1 : 0) + (filters.maxSurface ? 1 : 0)
  const roomsCount = filters.rooms ? 1 : 0
  const sellerCount = filters.sellerType !== 'all' ? 1 : 0
  const dateCount = filters.dateFrom ? 1 : 0

  // Debug logs
  console.log('🔍 AdvancedFilters Debug:', {
    isOpen,
    hasActiveFilters,
    activeFiltersCount,
    citiesCount,
    typesCount,
    priceCount,
    surfaceCount,
    roomsCount,
    sellerCount,
    dateCount,
    shouldShowPreview: !isOpen && hasActiveFilters
  })

  return (
    <div className="w-full">
      {/* Header - Bouton et badges sur la même ligne */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        {/* Bouton Filtres avancés à gauche */}
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 hover:bg-purple-50 text-slate-700 hover:text-purple-700"
        >
          <Filter className="h-5 w-5 text-purple-600" />
          <span className="font-semibold">Filtres avancés</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 ml-1">
              {activeFiltersCount}
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 ml-2" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2" />
          )}
        </Button>

        {/* Badges toujours visibles à droite */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            onClick={() => handleBadgeClick('localisation')}
            variant={citiesCount > 0 ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              citiesCount > 0
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "border-slate-300 text-slate-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            <MapPin className="h-3 w-3 mr-1" />
            Villes{citiesCount > 0 && ` (${citiesCount})`}
          </Badge>
          <Badge
            onClick={() => handleBadgeClick('types')}
            variant={typesCount > 0 ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              typesCount > 0
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "border-slate-300 text-slate-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            <Home className="h-3 w-3 mr-1" />
            Types{typesCount > 0 && ` (${typesCount})`}
          </Badge>
          <Badge
            onClick={() => handleBadgeClick('prix')}
            variant={priceCount > 0 ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              priceCount > 0
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "border-slate-300 text-slate-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Prix{priceCount > 0 && ` (${priceCount})`}
          </Badge>
          <Badge
            onClick={() => handleBadgeClick('prix')}
            variant={surfaceCount > 0 ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              surfaceCount > 0
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "border-slate-300 text-slate-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Surface{surfaceCount > 0 && ` (${surfaceCount})`}
          </Badge>
          <Badge
            onClick={() => handleBadgeClick('autres')}
            variant={roomsCount > 0 ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              roomsCount > 0
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "border-slate-300 text-slate-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            <Bed className="h-3 w-3 mr-1" />
            Pièces{roomsCount > 0 && ` (${roomsCount})`}
          </Badge>
          <Badge
            onClick={() => handleBadgeClick('autres')}
            variant={sellerCount > 0 ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              sellerCount > 0
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "border-slate-300 text-slate-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            <Users className="h-3 w-3 mr-1" />
            Vendeur
          </Badge>
          <Badge
            onClick={() => handleBadgeClick('autres')}
            variant={dateCount > 0 ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              dateCount > 0
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "border-slate-300 text-slate-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Date
          </Badge>
        </div>
      </div>

      {/* Contenu rétractable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-white rounded-lg border border-slate-200 shadow-lg">
              <div className="p-6 pb-20">
                <Accordion type="multiple" defaultValue={["localisation", "types", "prix", "autres"]} className="w-full">
                  {/* Section Localisation */}
                  <AccordionItem value="localisation" className="border-b border-slate-200" data-accordion-section="localisation">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-slate-900">Localisation</span>
                        {filters.cities.length > 0 && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 ml-2">
                            {filters.cities.length}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {/* Villes sélectionnées */}
                        {filters.cities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {filters.cities.map((city) => (
                              <Badge
                                key={city}
                                variant="secondary"
                                className="bg-purple-100 text-purple-700 border-purple-200 cursor-pointer hover:bg-purple-200 transition-colors"
                                onClick={() => handleRemoveCity(city)}
                              >
                                {city}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Ajouter une ville */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ajouter une ville..."
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddCity}
                            disabled={!cityInput.trim()}
                          >
                            Ajouter
                          </Button>
                        </div>
                        
                        {/* Villes rapides */}
                        <div className="flex flex-wrap gap-2">
                          {availableCities
                            .filter((city) => !filters.cities.includes(city))
                            .slice(0, 10)
                            .map((city) => (
                              <Button
                                key={city}
                                variant="outline"
                                size="sm"
                                onClick={() => handleCityToggle(city)}
                                className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                              >
                                + {city}
                              </Button>
                            ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section Types de biens */}
                  <AccordionItem value="types" className="border-b border-slate-200" data-accordion-section="types">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-slate-900">Types de biens</span>
                        {filters.types.length > 0 && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 ml-2">
                            {filters.types.length}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                        {PROPERTY_TYPES.map((type) => (
                          <div key={type.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type.value}`}
                              checked={filters.types.includes(type.value)}
                              onCheckedChange={() => handleTypeToggle(type.value)}
                            />
                            <Label
                              htmlFor={`type-${type.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section Prix et Surface */}
                  <AccordionItem value="prix" className="border-b border-slate-200" data-accordion-section="prix">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-slate-900">Prix et Surface</span>
                        {(filters.minPrice || filters.maxPrice || filters.minSurface || filters.maxSurface) && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 ml-2">
                            {[
                              filters.minPrice ? 1 : 0,
                              filters.maxPrice ? 1 : 0,
                              filters.minSurface ? 1 : 0,
                              filters.maxSurface ? 1 : 0,
                            ].reduce((a, b) => a + b, 0)}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-2">
                        {/* Prix */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Prix (€)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="minPrice" className="text-xs text-slate-500">
                                Prix minimum
                              </Label>
                              <Input
                                id="minPrice"
                                type="number"
                                placeholder="0"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxPrice" className="text-xs text-slate-500">
                                Prix maximum
                              </Label>
                              <Input
                                id="maxPrice"
                                type="number"
                                placeholder="Pas de limite"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Surface */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Surface (m²)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="minSurface" className="text-xs text-slate-500">
                                Surface minimum
                              </Label>
                              <Input
                                id="minSurface"
                                type="number"
                                placeholder="0"
                                value={filters.minSurface}
                                onChange={(e) => handleFilterChange('minSurface', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxSurface" className="text-xs text-slate-500">
                                Surface maximum
                              </Label>
                              <Input
                                id="maxSurface"
                                type="number"
                                placeholder="Pas de limite"
                                value={filters.maxSurface}
                                onChange={(e) => handleFilterChange('maxSurface', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section Autres critères */}
                  <AccordionItem value="autres" className="border-b-0" data-accordion-section="autres">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-slate-900">Autres critères</span>
                        {(filters.rooms || filters.sellerType !== 'all' || filters.dateFrom) && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 ml-2">
                            {[
                              filters.rooms ? 1 : 0,
                              filters.sellerType !== 'all' ? 1 : 0,
                              filters.dateFrom ? 1 : 0,
                            ].reduce((a, b) => a + b, 0)}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-2">
                        {/* Nombre de pièces */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700">Nombre de pièces</Label>
                          <Select
                            value={filters.rooms || 'all'}
                            onValueChange={(value) => handleFilterChange('rooms', value === 'all' ? '' : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous</SelectItem>
                              <SelectItem value="1">1 pièce</SelectItem>
                              <SelectItem value="2">2 pièces</SelectItem>
                              <SelectItem value="3">3 pièces</SelectItem>
                              <SelectItem value="4">4 pièces</SelectItem>
                              <SelectItem value="5">5+ pièces</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Type de vendeur */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-500" />
                            <Label className="text-sm font-medium text-slate-700">Type de vendeur</Label>
                          </div>
                          <Select
                            value={filters.sellerType}
                            onValueChange={(value) => handleFilterChange('sellerType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous</SelectItem>
                              <SelectItem value="private">Particuliers</SelectItem>
                              <SelectItem value="professional">Professionnels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date de publication */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <Label htmlFor="dateFrom" className="text-sm font-medium text-slate-700">
                              Publié après le
                            </Label>
                          </div>
                          <Input
                            id="dateFrom"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="max-w-xs"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Boutons sticky en bas */}
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 rounded-b-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={!hasActiveFilters}
                    className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Réinitialiser
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApply}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Appliquer les filtres
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
