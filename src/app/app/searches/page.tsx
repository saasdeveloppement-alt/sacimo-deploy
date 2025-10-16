"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  MapPin,
  Euro,
  Home,
  Filter,
  Settings
} from "lucide-react"

const mockSearches = [
  {
    id: "1",
    name: "75_2P_<500k",
    description: "Appartements 2 pièces dans le 75, moins de 500k€",
    isActive: true,
    listingsCount: 23,
    lastRun: "2024-01-15T08:00:00Z",
    criteria: {
      postalCodes: ["75001", "75002", "75003", "75004", "75005"],
      priceMax: 500000,
      roomsMin: 2,
      roomsMax: 2,
      types: ["APARTMENT"]
    }
  },
  {
    id: "2",
    name: "Maisons_92_<800k",
    description: "Maisons dans le 92, moins de 800k€",
    isActive: true,
    listingsCount: 8,
    lastRun: "2024-01-15T08:00:00Z",
    criteria: {
      postalCodes: ["92000", "92100", "92200"],
      priceMax: 800000,
      types: ["HOUSE"]
    }
  },
  {
    id: "3",
    name: "Studios_Paris_Centre",
    description: "Studios dans le centre de Paris",
    isActive: false,
    listingsCount: 15,
    lastRun: "2024-01-14T08:00:00Z",
    criteria: {
      postalCodes: ["75001", "75002", "75003", "75004"],
      priceMax: 400000,
      roomsMin: 1,
      roomsMax: 1,
      types: ["STUDIO"]
    }
  }
]

const propertyTypes = [
  { id: "APARTMENT", label: "Appartement", icon: Home },
  { id: "HOUSE", label: "Maison", icon: Home },
  { id: "STUDIO", label: "Studio", icon: Home },
  { id: "LOFT", label: "Loft", icon: Home },
  { id: "PENTHOUSE", label: "Penthouse", icon: Home },
  { id: "VILLA", label: "Villa", icon: Home },
  { id: "TOWNHOUSE", label: "Townhouse", icon: Home },
  { id: "OTHER", label: "Autre", icon: Home }
]

export default function SearchesPage() {
  const [searches, setSearches] = useState(mockSearches)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSearch, setEditingSearch] = useState(null)

  const toggleSearchStatus = (id: string) => {
    setSearches(searches.map(search => 
      search.id === id ? { ...search, isActive: !search.isActive } : search
    ))
  }

  const deleteSearch = (id: string) => {
    setSearches(searches.filter(search => search.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recherches</h1>
          <p className="text-gray-600">Configurez vos critères de recherche personnalisés</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} data-magnetic data-cursor="Add">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle recherche
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recherches actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searches.filter(s => s.isActive).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total recherches</p>
                <p className="text-2xl font-bold text-gray-900">{searches.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Annonces trouvées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searches.reduce((sum, s) => sum + s.listingsCount, 0)}
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
                <p className="text-sm font-medium text-gray-600">Dernière exécution</p>
                <p className="text-sm font-bold text-gray-900">08:00</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Searches List */}
      <div className="space-y-4">
        {searches.map((search, index) => (
          <motion.div
            key={search.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {search.name}
                      </h3>
                      <Badge variant={search.isActive ? "default" : "secondary"}>
                        {search.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{search.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {search.criteria.postalCodes.length} codes postaux
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Euro className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          Max {search.criteria.priceMax?.toLocaleString()}€
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Home className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {search.criteria.types?.length || 0} types
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {search.listingsCount} annonces trouvées • 
                        Dernière exécution: {new Date(search.lastRun).toLocaleString('fr-FR')}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingSearch(search)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleSearchStatus(search.id)}
                        >
                          {search.isActive ? (
                            <Pause className="w-4 h-4 mr-1" />
                          ) : (
                            <Play className="w-4 h-4 mr-1" />
                          )}
                          {search.isActive ? "Pause" : "Activer"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteSearch(search.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingSearch ? "Modifier la recherche" : "Nouvelle recherche"}
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Nom de la recherche</Label>
                <Input 
                  id="name" 
                  placeholder="ex: 75_2P_<500k"
                  defaultValue={editingSearch?.name || ""}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="Description de la recherche"
                  defaultValue={editingSearch?.description || ""}
                />
              </div>

              <div>
                <Label>Codes postaux</Label>
                <Input 
                  placeholder="75001, 75002, 75003..."
                  defaultValue={editingSearch?.criteria.postalCodes.join(", ") || ""}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Séparez les codes postaux par des virgules
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceMin">Prix minimum (€)</Label>
                  <Input 
                    id="priceMin" 
                    type="number"
                    placeholder="0"
                    defaultValue={editingSearch?.criteria.priceMin || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="priceMax">Prix maximum (€)</Label>
                  <Input 
                    id="priceMax" 
                    type="number"
                    placeholder="1000000"
                    defaultValue={editingSearch?.criteria.priceMax || ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomsMin">Pièces minimum</Label>
                  <Input 
                    id="roomsMin" 
                    type="number"
                    placeholder="1"
                    defaultValue={editingSearch?.criteria.roomsMin || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="roomsMax">Pièces maximum</Label>
                  <Input 
                    id="roomsMax" 
                    type="number"
                    placeholder="5"
                    defaultValue={editingSearch?.criteria.roomsMax || ""}
                  />
                </div>
              </div>

              <div>
                <Label>Types de biens</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {propertyTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type.id}
                        defaultChecked={editingSearch?.criteria.types?.includes(type.id) || false}
                      />
                      <Label htmlFor={type.id} className="text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="surfaceMin">Surface minimum (m²)</Label>
                <Input 
                  id="surfaceMin" 
                  type="number"
                  placeholder="20"
                  defaultValue={editingSearch?.criteria.surfaceMin || ""}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingSearch(null)
                }}
              >
                Annuler
              </Button>
              <Button data-magnetic data-cursor="Save">
                {editingSearch ? "Modifier" : "Créer"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
