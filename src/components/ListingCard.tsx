"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Eye, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Home,
  Building2,
  Users,
  Target,
  BarChart3,
  Save,
  ExternalLink,
  Image as ImageIcon,
  Maximize2,
  Bed,
  Phone,
  Mail,
  Copy,
  Send
} from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { showSuccess, showInfo } from "@/lib/toast"

interface Listing {
  title: string
  price: number
  surface?: number
  rooms?: number
  city: string
  postalCode: string
  type: string
  source: string
  url: string
  publishedAt: string
  isPrivateSeller: boolean
  description?: string
  photos: string[]
}

interface ListingCardProps {
  listing: Listing
  viewMode?: "grid" | "list"
  onSave?: (listing: Listing) => void
  onAnalyze?: (listing: Listing) => void
  onEstimate?: (listing: Listing) => void
  onLocate?: (listing: Listing) => void
}

export default function ListingCard({
  listing,
  viewMode = "grid",
  onSave,
  onAnalyze,
  onEstimate,
  onLocate
}: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  // Calculs et données mock
  const pricePerM2 = listing.surface && listing.surface > 0 
    ? Math.round(listing.price / listing.surface) 
    : 0
  
  const daysOnline = Math.floor(
    (new Date().getTime() - new Date(listing.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Estimation IA (±10% du prix)
  const estimatedValue = Math.round(listing.price * (0.9 + Math.random() * 0.2))
  const priceDiff = estimatedValue - listing.price
  const priceDiffPercent = Math.round((priceDiff / listing.price) * 100)
  
  // Score de localisation (3-5 étoiles)
  const locationScore = Math.floor(3 + Math.random() * 3)
  const locationStars = Array.from({ length: 5 }, (_, i) => i < locationScore)
  
  // Nombre d'annonces similaires (mock)
  const similarCount = Math.floor(Math.random() * 5) + 1
  
  // Coordonnées vendeur (mock : 50% téléphone, 30% email, 20% sur demande)
  const hasPhone = Math.random() < 0.5
  const hasEmail = Math.random() < 0.3 && !hasPhone
  const sellerPhone = hasPhone ? `06 ${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}` : null
  const sellerEmail = hasEmail ? `contact${Math.floor(Math.random() * 1000)}@example.com` : null
  const sellerName = listing.isPrivateSeller ? `M. ${['Dupont', 'Martin', 'Bernard', 'Dubois', 'Laurent'][Math.floor(Math.random() * 5)]}` : 'Agence Immobilière'
  
  const handleCopyPhone = () => {
    if (sellerPhone) {
      navigator.clipboard.writeText(sellerPhone.replace(/\s/g, ''))
      showSuccess("📱 Numéro de téléphone copié dans le presse-papiers")
    }
  }
  
  // Type de bien formaté
  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'APARTMENT': 'Appartement',
      'HOUSE': 'Maison',
      'STUDIO': 'Studio',
      'LOFT': 'Loft',
      'PENTHOUSE': 'Penthouse',
      'VILLA': 'Villa',
      'TOWNHOUSE': 'Maison de ville'
    }
    return types[type] || type
  }
  
  // Badge pour l'estimation
  const getPriceBadge = () => {
    if (priceDiffPercent < -5) {
      return { label: "Opportunité", variant: "default" as const, color: "bg-green-100 text-green-700 border-green-200", icon: TrendingDown }
    } else if (priceDiffPercent > 5) {
      return { label: "Surévalué", variant: "destructive" as const, color: "bg-red-100 text-red-700 border-red-200", icon: TrendingUp }
    } else {
      return { label: "Bon prix", variant: "secondary" as const, color: "bg-blue-100 text-blue-700 border-blue-200", icon: Minus }
    }
  }
  
  const priceBadge = getPriceBadge()
  const PriceIcon = priceBadge.icon

  const handleSave = () => {
    const wasSaved = isSaved
    setIsSaved(!isSaved)
    onSave?.(listing)
    if (!wasSaved) {
      showSuccess(`✅ "${listing.title.substring(0, 30)}..." sauvegardé`)
    } else {
      showInfo(`🗑️ Annonce retirée des sauvegardes`)
    }
  }

  if (viewMode === "list") {
    return (
      <motion.div
        variants={{}}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl max-w-full"
      >
        <div className="flex gap-4 p-4 max-w-full overflow-hidden">
          {/* Photo à gauche */}
          <div className="w-48 h-48 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
            {listing.photos && listing.photos.length > 0 ? (
              <img 
                src={listing.photos[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder.svg'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-slate-400" />
              </div>
            )}
          </div>

          {/* Infos principales */}
          <div className="flex-1 space-y-3">
            {/* Section haut : Titre + Badge + Prix */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {listing.title}
                </h3>
                <Badge variant={priceBadge.variant} className={`${priceBadge.color} text-xs`}>
                  <PriceIcon className="h-3 w-3 mr-1" />
                  {priceBadge.label}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </div>
                {pricePerM2 > 0 && (
                  <div className="text-xs text-slate-600">
                    {pricePerM2.toLocaleString('fr-FR')}€/m²
                  </div>
                )}
              </div>
            </div>

            {/* Section milieu - Ligne 1 : Prix | Surface | Pièces | Prix/m² */}
            <div className="flex items-center gap-4 text-xs">
              {listing.surface && (
                <div className="flex items-center gap-1 text-slate-600">
                  <Maximize2 className="h-3 w-3 text-slate-400" />
                  <span>{listing.surface} m²</span>
                </div>
              )}
              {listing.rooms && (
                <div className="flex items-center gap-1 text-slate-600">
                  <Bed className="h-3 w-3 text-slate-400" />
                  <span>{listing.rooms} pièces</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>{listing.city} ({listing.postalCode})</span>
                <Badge variant="outline" className="text-xs h-4 border-slate-200 text-slate-600">
                  {getTypeLabel(listing.type)}
                </Badge>
              </div>
            </div>

            {/* Section milieu - Ligne 2 : ⭐ Score */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                {locationStars.map((filled, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                  />
                ))}
              </div>
              <span className="text-slate-600">Quartier recherché</span>
            </div>

            {/* Section bas : Marché + En ligne + Particulier + Similaires */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1 text-slate-600">
                <Target className="h-3 w-3 text-purple-600" />
                <span className="font-medium">Marché:</span>
                <span>{estimatedValue.toLocaleString('fr-FR')}€</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-slate-600">
                <Calendar className="h-3 w-3 text-orange-600" />
                <span>{daysOnline}j</span>
              </div>
              <span className="text-slate-300">•</span>
              <Badge 
                variant={listing.isPrivateSeller ? "default" : "secondary"}
                className={`text-xs h-5 ${listing.isPrivateSeller 
                  ? "bg-purple-100 text-purple-700 border-purple-200" 
                  : "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Users className="h-3 w-3 mr-1" />
                {listing.isPrivateSeller ? "Particulier" : "Pro"}
              </Badge>
              {similarCount > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <Badge variant="secondary" className="text-xs h-5 bg-cyan-100 text-cyan-700 border-cyan-200">
                    {similarCount} sim.
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Actions rapides à droite - 2 lignes */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Ligne 1 : Localiser, Estimer, Analyser */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onLocate?.(listing)}
                className="text-xs border-blue-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
              >
                <MapPin className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEstimate?.(listing)}
                className="text-xs border-purple-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50"
              >
                <Target className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAnalyze?.(listing)}
                className="text-xs border-cyan-200 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50"
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Ligne 2 : Coordonnées, Sauvegarder */}
            <div className="flex gap-2 flex-wrap">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs border-orange-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Coordonnées
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Coordonnées du vendeur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {/* Nom du vendeur */}
                    {sellerName && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{sellerName}</span>
                      </div>
                    )}
                    
                    {/* Type de vendeur */}
                    <Badge 
                      variant={listing.isPrivateSeller ? "default" : "secondary"}
                      className={listing.isPrivateSeller 
                        ? "bg-purple-100 text-purple-700 border-purple-200" 
                        : "bg-slate-100 text-slate-700 border-slate-200"
                      }
                    >
                      {listing.isPrivateSeller ? "Particulier" : "Professionnel"}
                    </Badge>
                    
                    {/* Téléphone */}
                    {sellerPhone ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span className="font-medium">Téléphone</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`tel:${sellerPhone.replace(/\s/g, '')}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                          >
                            {sellerPhone}
                          </a>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleCopyPhone}
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copier
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Téléphone non disponible
                      </div>
                    )}
                    
                    {/* Email */}
                    {sellerEmail ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <span className="font-medium">Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`mailto:${sellerEmail}`}
                            className="text-blue-600 hover:text-blue-700 hover:underline font-medium truncate flex-1"
                          >
                            {sellerEmail}
                          </a>
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                            className="text-xs"
                          >
                            <a href={`mailto:${sellerEmail}`}>
                              <Send className="h-3 w-3 mr-1" />
                              Envoyer
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email non disponible
                      </div>
                    )}
                    
                    {/* Message si aucune coordonnée */}
                    {!sellerPhone && !sellerEmail && (
                      <div className="text-center py-4 text-slate-500">
                        <Phone className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p>Coordonnées sur demande</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                className={`text-xs ${isSaved ? 'bg-green-50 text-green-600 border-green-200' : 'border-slate-200 hover:border-green-300 hover:text-green-600'}`}
              >
                <Save className={`h-3 w-3 mr-1 ${isSaved ? 'fill-green-600' : ''}`} />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Mode grid
  return (
    <motion.div
      variants={{}}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group rounded-xl max-w-full"
    >
      {/* Photo principale (plus grande) */}
      <div className="relative h-64 bg-slate-100 overflow-hidden">
        {listing.photos && listing.photos.length > 0 ? (
          <img 
            src={listing.photos[0]} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder.svg'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-slate-400" />
          </div>
        )}
        {/* Badge estimation en overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant={priceBadge.variant} className={priceBadge.color}>
            <PriceIcon className="h-3 w-3 mr-1" />
            {priceBadge.label}
          </Badge>
        </div>
        {/* Badge sauvegardé */}
        {isSaved && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-green-500 text-white">
              <Save className="h-3 w-3 mr-1 fill-white" />
              Sauvegardé
            </Badge>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-3 space-y-2 max-w-full overflow-hidden">
        {/* Section haut : Titre + Badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 flex-1">
            {listing.title}
          </h3>
          <Badge variant={priceBadge.variant} className={`${priceBadge.color} text-xs shrink-0`}>
            <PriceIcon className="h-3 w-3 mr-1" />
            {priceBadge.label}
          </Badge>
        </div>

        {/* Section milieu - Ligne 1 : Prix | Surface | Pièces | Prix/m² */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg text-purple-600">
              {listing.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
          </div>
          {listing.surface && (
            <div className="flex items-center gap-1 text-slate-600">
              <Maximize2 className="h-3 w-3 text-slate-400" />
              <span>{listing.surface} m²</span>
            </div>
          )}
          {listing.rooms && (
            <div className="flex items-center gap-1 text-slate-600">
              <Bed className="h-3 w-3 text-slate-400" />
              <span>{listing.rooms} pièces</span>
            </div>
          )}
          {pricePerM2 > 0 && (
            <div className="flex items-center gap-1 text-slate-600">
              <TrendingUp className="h-3 w-3 text-slate-400" />
              <span>{pricePerM2.toLocaleString('fr-FR')}€/m²</span>
            </div>
          )}
        </div>

        {/* Section milieu - Ligne 2 : 📍 Ville (Code postal) + Type bien */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <MapPin className="h-3 w-3 text-slate-400" />
          <span>{listing.city} ({listing.postalCode})</span>
          <Badge variant="outline" className="text-xs h-4 border-slate-200 text-slate-600">
            {getTypeLabel(listing.type)}
          </Badge>
        </div>

        {/* Section milieu - Ligne 3 : ⭐ Score + "Quartier recherché" */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            {locationStars.map((filled, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
              />
            ))}
          </div>
          <span className="text-slate-600">Quartier recherché</span>
        </div>


        {/* Section bas : Infos complémentaires */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          {/* Ligne 1 : Marché + En ligne + Particulier + Similaires */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <Target className="h-3 w-3 text-purple-600" />
              <span className="font-medium">Marché:</span>
              <span>{estimatedValue.toLocaleString('fr-FR')}€</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-slate-600">
              <Calendar className="h-3 w-3 text-orange-600" />
              <span>{daysOnline}j</span>
            </div>
            <span className="text-slate-300">•</span>
            <Badge 
              variant={listing.isPrivateSeller ? "default" : "secondary"}
              className={`text-xs h-5 ${listing.isPrivateSeller 
                ? "bg-purple-100 text-purple-700 border-purple-200" 
                : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Users className="h-3 w-3 mr-1" />
              {listing.isPrivateSeller ? "Particulier" : "Pro"}
            </Badge>
            {similarCount > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <Badge variant="secondary" className="text-xs h-5 bg-cyan-100 text-cyan-700 border-cyan-200">
                  {similarCount} sim.
                </Badge>
              </>
            )}
          </div>
          
        </div>

        {/* Actions rapides - 2 lignes */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
          {/* Ligne 1 : Localiser, Estimer, Analyser */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onLocate?.(listing)}
              className="flex-1 text-xs border-blue-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Localiser
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEstimate?.(listing)}
              className="flex-1 text-xs border-purple-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50"
            >
              <Target className="h-3 w-3 mr-1" />
              Estimer
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAnalyze?.(listing)}
              className="flex-1 text-xs border-cyan-200 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Analyser
            </Button>
          </div>
          
          {/* Ligne 2 : Coordonnées, Sauvegarder */}
          <div className="flex gap-2 flex-wrap">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-xs border-orange-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Coordonnées
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Coordonnées du vendeur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Nom du vendeur */}
                  {sellerName && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{sellerName}</span>
                    </div>
                  )}
                  
                  {/* Type de vendeur */}
                  <Badge 
                    variant={listing.isPrivateSeller ? "default" : "secondary"}
                    className={listing.isPrivateSeller 
                      ? "bg-purple-100 text-purple-700 border-purple-200" 
                      : "bg-slate-100 text-slate-700 border-slate-200"
                    }
                  >
                    {listing.isPrivateSeller ? "Particulier" : "Professionnel"}
                  </Badge>
                  
                  {/* Téléphone */}
                  {sellerPhone ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">Téléphone</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={`tel:${sellerPhone.replace(/\s/g, '')}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                        >
                          {sellerPhone}
                        </a>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCopyPhone}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Téléphone non disponible
                    </div>
                  )}
                  
                  {/* Email */}
                  {sellerEmail ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">Email</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={`mailto:${sellerEmail}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium truncate flex-1"
                        >
                          {sellerEmail}
                        </a>
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                          className="text-xs"
                        >
                          <a href={`mailto:${sellerEmail}`}>
                            <Send className="h-3 w-3 mr-1" />
                            Envoyer
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email non disponible
                    </div>
                  )}
                  
                  {/* Message si aucune coordonnée */}
                  {!sellerPhone && !sellerEmail && (
                    <div className="text-center py-4 text-slate-500">
                      <Phone className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p>Coordonnées sur demande</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSave}
              className={`flex-1 text-xs ${isSaved ? 'bg-green-50 text-green-600 border-green-200' : 'border-slate-200 hover:border-green-300 hover:text-green-600'}`}
            >
              <Save className={`h-3 w-3 mr-1 ${isSaved ? 'fill-green-600' : ''}`} />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

