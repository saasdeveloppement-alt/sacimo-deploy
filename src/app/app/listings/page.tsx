"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Euro,
  Home,
  ExternalLink,
  Star,
  Tag,
  MoreHorizontal
} from "lucide-react"

const mockListings = [
  {
    id: "1",
    title: "Appartement 3 pièces",
    price: 450000,
    surface: 75,
    rooms: 3,
    city: "Paris 15e",
    postalCode: "75015",
    type: "Particulier",
    source: "LeBonCoin",
    publishedAt: "2024-01-15T10:30:00Z",
    url: "https://leboncoin.fr/ventes_immobilieres/1234567890",
    description: "Bel appartement 3 pièces dans le 15e arrondissement...",
    photos: ["/placeholder1.jpg", "/placeholder2.jpg"],
    isNew: true,
    tags: ["À contacter", "Prioritaire"]
  },
  {
    id: "2",
    title: "Maison 4 pièces avec jardin",
    price: 680000,
    surface: 120,
    rooms: 4,
    city: "Boulogne-Billancourt",
    postalCode: "92100",
    type: "Professionnel",
    source: "SeLoger",
    publishedAt: "2024-01-15T09:15:00Z",
    url: "https://seloger.com/annonces/achat/maison/1234567890",
    description: "Maison familiale avec jardin privé...",
    photos: ["/placeholder3.jpg"],
    isNew: true,
    tags: ["En cours"]
  },
  {
    id: "3",
    title: "Studio meublé",
    price: 280000,
    surface: 25,
    rooms: 1,
    city: "Paris 11e",
    postalCode: "75011",
    type: "Particulier",
    source: "PAP",
    publishedAt: "2024-01-15T08:45:00Z",
    url: "https://pap.fr/annonces/studio-meuble-paris-11e-1234567890",
    description: "Studio entièrement meublé...",
    photos: ["/placeholder4.jpg"],
    isNew: false,
    tags: []
  },
  {
    id: "4",
    title: "Loft 2 pièces",
    price: 520000,
    surface: 65,
    rooms: 2,
    city: "Paris 20e",
    postalCode: "75020",
    type: "Professionnel",
    source: "Orpi",
    publishedAt: "2024-01-15T07:20:00Z",
    url: "https://orpi.com/annonces/loft-paris-20e-1234567890",
    description: "Loft moderne dans ancien atelier...",
    photos: ["/placeholder5.jpg", "/placeholder6.jpg"],
    isNew: true,
    tags: ["À contacter"]
  },
  {
    id: "5",
    title: "Appartement 5 pièces",
    price: 890000,
    surface: 140,
    rooms: 5,
    city: "Paris 12e",
    postalCode: "75012",
    type: "Particulier",
    source: "Century21",
    publishedAt: "2024-01-15T06:30:00Z",
    url: "https://century21.fr/annonces/appartement-paris-12e-1234567890",
    description: "Grand appartement familial...",
    photos: ["/placeholder7.jpg"],
    isNew: false,
    tags: ["Contacté"]
  }
]

const availableTags = [
  { id: "À contacter", color: "bg-blue-100 text-blue-800" },
  { id: "Prioritaire", color: "bg-red-100 text-red-800" },
  { id: "En cours", color: "bg-yellow-100 text-yellow-800" },
  { id: "Contacté", color: "bg-green-100 text-green-800" },
  { id: "Intéressant", color: "bg-purple-100 text-purple-800" },
  { id: "À revoir", color: "bg-orange-100 text-orange-800" }
]

export default function ListingsPage() {
  const [listings, setListings] = useState(mockListings)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("publishedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredListings = listings
    .filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           listing.city.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === "all" || listing.type === selectedType
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => listing.tags.includes(tag))
      return matchesSearch && matchesType && matchesTags
    })
    .sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "surface":
          aValue = a.surface
          bValue = b.surface
          break
        case "publishedAt":
        default:
          aValue = new Date(a.publishedAt).getTime()
          bValue = new Date(b.publishedAt).getTime()
          break
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

  const addTag = (listingId: string, tag: string) => {
    setListings(listings.map(listing => 
      listing.id === listingId 
        ? { ...listing, tags: [...listing.tags, tag] }
        : listing
    ))
  }

  const removeTag = (listingId: string, tag: string) => {
    setListings(listings.map(listing => 
      listing.id === listingId 
        ? { ...listing, tags: listing.tags.filter(t => t !== tag) }
        : listing
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Annonces</h1>
          <p className="text-gray-600">Toutes les annonces trouvées par vos recherches</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" data-magnetic data-cursor="Download">
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Button data-magnetic data-cursor="Download">
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total annonces</p>
                <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Particuliers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {listings.filter(l => l.type === "Particulier").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Professionnels</p>
                <p className="text-2xl font-bold text-gray-900">
                  {listings.filter(l => l.type === "Professionnel").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nouvelles (24h)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {listings.filter(l => l.isNew).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Titre, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Type de vendeur
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="Particulier">Particuliers</option>
                <option value="Professionnel">Professionnels</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="publishedAt">Date de publication</option>
                <option value="price">Prix</option>
                <option value="surface">Surface</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ordre
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (selectedTags.includes(tag.id)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag.id))
                    } else {
                      setSelectedTags([...selectedTags, tag.id])
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? tag.color
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag.id}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Annonce</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Surface</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing, index) => (
                  <motion.tr
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{listing.title}</p>
                            {listing.isNew && (
                              <Badge variant="secondary" className="text-xs">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{listing.rooms} pièces</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-gray-900">
                        {listing.price.toLocaleString()}€
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-900">{listing.surface}m²</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm">{listing.city}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={listing.type === "Particulier" ? "default" : "secondary"}>
                        {listing.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{listing.source}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm">
                          {new Date(listing.publishedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {listing.tags.map((tag) => {
                          const tagInfo = availableTags.find(t => t.id === tag)
                          return (
                            <Badge
                              key={tag}
                              variant="outline"
                              className={`text-xs ${tagInfo?.color || 'bg-gray-100 text-gray-700'}`}
                            >
                              {tag}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
