"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Building2, 
  Search, 
  Bell,
  MapPin,
  Euro,
  Home,
  Users,
  Settings,
  X
} from "lucide-react"

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const steps = [
  {
    id: 1,
    title: "Informations de l'agence",
    description: "Dites-nous en plus sur votre agence",
    icon: Building2
  },
  {
    id: 2,
    title: "Critères de recherche",
    description: "Configurez vos premières recherches",
    icon: Search
  },
  {
    id: 3,
    title: "Préférences de rapport",
    description: "Personnalisez vos rapports quotidiens",
    icon: Bell
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

export function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Étape 1: Informations agence
    agencyName: "",
    agencySize: "",
    markets: [] as string[],
    phone: "",
    
    // Étape 2: Critères de recherche
    searches: [
      {
        name: "",
        postalCodes: "",
        priceMin: "",
        priceMax: "",
        types: [] as string[],
        surfaceMin: "",
        surfaceMax: "",
        roomsMin: "",
        roomsMax: ""
      }
    ],
    
    // Étape 3: Préférences rapport
    reportTime: "08:00",
    reportEmail: true,
    reportInApp: true,
    competitorMonitoring: false,
    weeklySummary: true
  })

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addSearch = () => {
    setFormData({
      ...formData,
      searches: [
        ...formData.searches,
        {
          name: "",
          postalCodes: "",
          priceMin: "",
          priceMax: "",
          types: [],
          surfaceMin: "",
          surfaceMax: "",
          roomsMin: "",
          roomsMax: ""
        }
      ]
    })
  }

  const removeSearch = (index: number) => {
    if (formData.searches.length > 1) {
      setFormData({
        ...formData,
        searches: formData.searches.filter((_, i) => i !== index)
      })
    }
  }

  const updateSearch = (index: number, field: string, value: any) => {
    const updatedSearches = [...formData.searches]
    updatedSearches[index] = { ...updatedSearches[index], [field]: value }
    setFormData({ ...formData, searches: updatedSearches })
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.agencyName && formData.agencySize && formData.markets.length > 0
      case 2:
        return formData.searches.every(search => 
          search.name && search.postalCodes && search.priceMax
        )
      case 3:
        return true
      default:
        return false
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuration initiale</h2>
            <p className="text-gray-600">Configurez SACIMO en 3 étapes simples</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Informations de votre agence
                  </h3>
                  <p className="text-gray-600">
                    Ces informations nous aident à personnaliser votre expérience
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="agencyName">Nom de l'agence *</Label>
                    <Input
                      id="agencyName"
                      placeholder="Agence Immobilière Dupont"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="agencySize">Taille de l'agence *</Label>
                    <select
                      id="agencySize"
                      value={formData.agencySize}
                      onChange={(e) => setFormData({...formData, agencySize: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="1-5">1-5 agents</option>
                      <option value="6-15">6-15 agents</option>
                      <option value="16-50">16-50 agents</option>
                      <option value="50+">50+ agents</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Marchés d'intervention *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {["Paris", "Banlieue parisienne", "Province", "International"].map((market) => (
                      <label key={market} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.markets.includes(market)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                markets: [...formData.markets, market]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                markets: formData.markets.filter(m => m !== market)
                              })
                            }
                          }}
                        />
                        <span className="text-sm">{market}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    placeholder="+33 1 23 45 67 89"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Critères de recherche
                  </h3>
                  <p className="text-gray-600">
                    Configurez vos premières recherches comme sur LeBonCoin
                  </p>
                </div>

                {formData.searches.map((search, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Recherche {index + 1}
                      </h4>
                      {formData.searches.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSearch(index)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom de la recherche *</Label>
                        <Input
                          placeholder="ex: 75_2P_<500k"
                          value={search.name}
                          onChange={(e) => updateSearch(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Codes postaux *</Label>
                        <Input
                          placeholder="75001, 75002, 75003..."
                          value={search.postalCodes}
                          onChange={(e) => updateSearch(index, 'postalCodes', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Prix minimum (€)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={search.priceMin}
                          onChange={(e) => updateSearch(index, 'priceMin', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Prix maximum (€) *</Label>
                        <Input
                          type="number"
                          placeholder="1000000"
                          value={search.priceMax}
                          onChange={(e) => updateSearch(index, 'priceMax', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Surface minimum (m²)</Label>
                        <Input
                          type="number"
                          placeholder="20"
                          value={search.surfaceMin}
                          onChange={(e) => updateSearch(index, 'surfaceMin', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Surface maximum (m²)</Label>
                        <Input
                          type="number"
                          placeholder="200"
                          value={search.surfaceMax}
                          onChange={(e) => updateSearch(index, 'surfaceMax', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Types de biens</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {propertyTypes.map((type) => (
                          <label key={type.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={search.types.includes(type.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateSearch(index, 'types', [...search.types, type.id])
                                } else {
                                  updateSearch(index, 'types', search.types.filter(t => t !== type.id))
                                }
                              }}
                            />
                            <span className="text-sm">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}

                <Button variant="outline" onClick={addSearch} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Ajouter une recherche
                </Button>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Préférences de rapport
                  </h3>
                  <p className="text-gray-600">
                    Personnalisez la fréquence et le contenu de vos rapports
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Heure d'envoi du rapport quotidien</Label>
                    <select
                      value={formData.reportTime}
                      onChange={(e) => setFormData({...formData, reportTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="07:00">07:00</option>
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Rapport par email</p>
                        <p className="text-sm text-gray-600">Recevoir le rapport quotidien par email</p>
                      </div>
                      <Checkbox
                        checked={formData.reportEmail}
                        onCheckedChange={(checked) => setFormData({...formData, reportEmail: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Notification in-app</p>
                        <p className="text-sm text-gray-600">Recevoir des notifications dans l'application</p>
                      </div>
                      <Checkbox
                        checked={formData.reportInApp}
                        onCheckedChange={(checked) => setFormData({...formData, reportInApp: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Veille concurrentielle</p>
                        <p className="text-sm text-gray-600">Surveiller l'activité des concurrents</p>
                      </div>
                      <Checkbox
                        checked={formData.competitorMonitoring}
                        onCheckedChange={(checked) => setFormData({...formData, competitorMonitoring: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Résumé hebdomadaire</p>
                        <p className="text-sm text-gray-600">Recevoir un résumé chaque lundi</p>
                      </div>
                      <Checkbox
                        checked={formData.weeklySummary}
                        onCheckedChange={(checked) => setFormData({...formData, weeklySummary: checked as boolean})}
                      />
                    </div>
                  </div>
                </div>

                {/* Aperçu du rapport */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Aperçu de votre premier rapport</h4>
                    <div className="text-sm text-blue-800">
                      <p>📊 <strong>47 nouvelles annonces</strong> trouvées</p>
                      <p>🏠 <strong>32 particuliers</strong> • <strong>15 professionnels</strong></p>
                      <p>📍 Top zones: 75015, 75011, 75020</p>
                      <p>⏰ Envoyé chaque jour à {formData.reportTime}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="flex items-center space-x-2">
            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                data-magnetic
                data-cursor="Next"
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                data-magnetic
                data-cursor="Complete"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Terminer la configuration
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}









