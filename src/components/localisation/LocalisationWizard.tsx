/**
 * 🎯 WIZARD D'ENRICHISSEMENT DE LOCALISATION
 * 
 * Collecte structurée des hints utilisateur en 3 étapes
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Home,
  Building,
  Info,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { LocalizationUserHints } from "@/types/localisation"

interface LocalisationWizardProps {
  initialHints?: Partial<LocalizationUserHints>
  onComplete: (hints: LocalizationUserHints) => void
  onCancel?: () => void
}

export function LocalisationWizard({
  initialHints = {},
  onComplete,
  onCancel,
}: LocalisationWizardProps) {
  const [step, setStep] = useState(1)
  const [hints, setHints] = useState<Partial<LocalizationUserHints>>(initialHints)

  // Calcul de la précision estimée basée sur les hints renseignés
  const calculatePrecision = (): number => {
    let score = 0
    const maxScore = 20

    // Infos de base (5 points)
    if (hints.city) score += 1
    if (hints.postalCode) score += 1
    if (hints.propertyType) score += 1
    if (hints.roomsApprox) score += 1
    if (hints.priceRange?.min || hints.priceRange?.max) score += 1

    // Gabarit (5 points)
    if (hints.housingTypeDetails?.maisonMitoyennete !== undefined) score += 1
    if (hints.housingTypeDetails?.terrainSurfaceRange) score += 1
    if (hints.housingTypeDetails?.appartEtage) score += 1
    if (hints.housingTypeDetails?.balconOuTerrasse !== undefined) score += 1
    if (hints.constructionPeriod) score += 1

    // Environnement (5 points)
    if (hints.quartierType) score += 1
    if (hints.piscine) score += 1
    if (hints.vue) score += 1
    if (hints.repereProche?.type) score += 1
    if (hints.repereProche?.nom) score += 1

    // Divers (5 points)
    if (hints.surfaceHabitableRange?.min || hints.surfaceHabitableRange?.max) score += 1
    if (hints.notesLibres) score += 1

    return Math.min(100, Math.round((score / maxScore) * 100))
  }

  const precision = calculatePrecision()

  const updateHints = (updates: Partial<LocalizationUserHints>) => {
    setHints((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete(hints as LocalizationUserHints)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Enrichissement de localisation
            </CardTitle>
            <CardDescription className="mt-2">
              Plus vous ajoutez d'informations, plus la localisation pourra être précise
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>

        {/* Barre de progression */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Précision estimée</span>
            <span className="font-semibold">{precision}%</span>
          </div>
          <Progress value={precision} className="h-2" />
        </div>

        {/* Étapes */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded ${
                s <= step ? "bg-primary-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {/* ÉTAPE 1 — Entrée principale */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Étape 1 — Entrée principale</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Ex: Paris"
                    value={hints.city || ""}
                    onChange={(e) => updateHints({ city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    placeholder="Ex: 75001"
                    value={hints.postalCode || ""}
                    onChange={(e) => updateHints({ postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type de bien</Label>
                <Select
                  value={hints.propertyType || ""}
                  onValueChange={(value) =>
                    updateHints({ propertyType: value as LocalizationUserHints["propertyType"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maison">Maison</SelectItem>
                    <SelectItem value="appartement">Appartement</SelectItem>
                    <SelectItem value="immeuble">Immeuble</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="local">Local commercial</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 2 — Contexte rapide */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Home className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Étape 2 — Contexte rapide</h3>
              </div>

              <div className="space-y-2">
                <Label>Nombre de pièces approximatif</Label>
                <Select
                  value={hints.roomsApprox || ""}
                  onValueChange={(value) =>
                    updateHints({ roomsApprox: value as LocalizationUserHints["roomsApprox"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">T1 (Studio)</SelectItem>
                    <SelectItem value="T2">T2</SelectItem>
                    <SelectItem value="T3">T3</SelectItem>
                    <SelectItem value="T4">T4</SelectItem>
                    <SelectItem value="T5plus">T5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Surface habitable approximative (m²)</Label>
                <Select
                  value={
                    hints.surfaceHabitableRange
                      ? `${hints.surfaceHabitableRange.min || 0}-${hints.surfaceHabitableRange.max || 0}`
                      : ""
                  }
                  onValueChange={(value) => {
                    const ranges: Record<string, { min: number; max: number }> = {
                      "<40": { min: 0, max: 40 },
                      "40-60": { min: 40, max: 60 },
                      "60-80": { min: 60, max: 80 },
                      "80-120": { min: 80, max: 120 },
                      "120+": { min: 120, max: 9999 },
                    }
                    updateHints({ surfaceHabitableRange: ranges[value] })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<40">Moins de 40 m²</SelectItem>
                    <SelectItem value="40-60">40-60 m²</SelectItem>
                    <SelectItem value="60-80">60-80 m²</SelectItem>
                    <SelectItem value="80-120">80-120 m²</SelectItem>
                    <SelectItem value="120+">Plus de 120 m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fourchette de prix (€)</Label>
                <Select
                  value={
                    hints.priceRange
                      ? `${hints.priceRange.min || 0}-${hints.priceRange.max || 0}`
                      : ""
                  }
                  onValueChange={(value) => {
                    const ranges: Record<string, { min: number; max: number }> = {
                      "<150k": { min: 0, max: 150000 },
                      "150-250k": { min: 150000, max: 250000 },
                      "250-400k": { min: 250000, max: 400000 },
                      "400-600k": { min: 400000, max: 600000 },
                      "600k+": { min: 600000, max: 999999999 },
                    }
                    updateHints({ priceRange: ranges[value] })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<150k">Moins de 150 000 €</SelectItem>
                    <SelectItem value="150-250k">150 000 - 250 000 €</SelectItem>
                    <SelectItem value="250-400k">250 000 - 400 000 €</SelectItem>
                    <SelectItem value="400-600k">400 000 - 600 000 €</SelectItem>
                    <SelectItem value="600k+">Plus de 600 000 €</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 3 — Boost précision */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Étape 3 — Boost précision (optionnel)</h3>
                <Badge variant="outline" className="ml-2">
                  Recommandé
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Type de quartier</Label>
                <Select
                  value={hints.quartierType || ""}
                  onValueChange={(value) =>
                    updateHints({ quartierType: value as LocalizationUserHints["quartierType"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centre_bourg">Centre-bourg</SelectItem>
                    <SelectItem value="lotissement_recent">Lotissement récent</SelectItem>
                    <SelectItem value="zone_pavillonnaire">Zone pavillonnaire</SelectItem>
                    <SelectItem value="campagne_isolee">Campagne isolée</SelectItem>
                    <SelectItem value="bord_route">Bord de route</SelectItem>
                    <SelectItem value="inconnu">Inconnu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Détails selon le type de bien */}
              {hints.propertyType === "maison" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <Label>Maison — Mitoyenneté</Label>
                  <RadioGroup
                    value={String(hints.housingTypeDetails?.maisonMitoyennete ?? "")}
                    onValueChange={(value) =>
                      updateHints({
                        housingTypeDetails: {
                          ...hints.housingTypeDetails,
                          maisonMitoyennete: value ? (Number(value) as 0 | 1 | 2) : undefined,
                        },
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="mitoy0" />
                      <Label htmlFor="mitoy0" className="cursor-pointer">
                        Isolée (0 côté)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="mitoy1" />
                      <Label htmlFor="mitoy1" className="cursor-pointer">
                        Mitoyenne 1 côté
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="mitoy2" />
                      <Label htmlFor="mitoy2" className="cursor-pointer">
                        Mitoyenne 2 côtés (rangée)
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    <Label>Surface terrain approximative (m²)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={hints.housingTypeDetails?.terrainSurfaceRange?.min || ""}
                        onChange={(e) =>
                          updateHints({
                            housingTypeDetails: {
                              ...hints.housingTypeDetails,
                              terrainSurfaceRange: {
                                ...hints.housingTypeDetails?.terrainSurfaceRange,
                                min: e.target.value ? Number(e.target.value) : undefined,
                              },
                            },
                          })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={hints.housingTypeDetails?.terrainSurfaceRange?.max || ""}
                        onChange={(e) =>
                          updateHints({
                            housingTypeDetails: {
                              ...hints.housingTypeDetails,
                              terrainSurfaceRange: {
                                ...hints.housingTypeDetails?.terrainSurfaceRange,
                                max: e.target.value ? Number(e.target.value) : undefined,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {hints.propertyType === "appartement" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label>Étage approximatif</Label>
                    <Select
                      value={hints.housingTypeDetails?.appartEtage || ""}
                      onValueChange={(value) =>
                        updateHints({
                          housingTypeDetails: {
                            ...hints.housingTypeDetails,
                            appartEtage: value as LocalizationUserHints["housingTypeDetails"]["appartEtage"],
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rdc">Rez-de-chaussée</SelectItem>
                        <SelectItem value="1-2">1er ou 2ème étage</SelectItem>
                        <SelectItem value="3plus">3ème étage et plus</SelectItem>
                        <SelectItem value="inconnu">Inconnu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="balcon"
                      checked={hints.housingTypeDetails?.balconOuTerrasse || false}
                      onChange={(e) =>
                        updateHints({
                          housingTypeDetails: {
                            ...hints.housingTypeDetails,
                            balconOuTerrasse: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />
                    <Label htmlFor="balcon" className="cursor-pointer">
                      Balcon ou terrasse
                    </Label>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Période de construction</Label>
                <Select
                  value={hints.constructionPeriod || ""}
                  onValueChange={(value) =>
                    updateHints({
                      constructionPeriod: value as LocalizationUserHints["constructionPeriod"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avant1950">Avant 1950</SelectItem>
                    <SelectItem value="1950-1980">1950-1980</SelectItem>
                    <SelectItem value="1980-2000">1980-2000</SelectItem>
                    <SelectItem value="2000-2015">2000-2015</SelectItem>
                    <SelectItem value="apres2015">Après 2015</SelectItem>
                    <SelectItem value="inconnu">Inconnu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Piscine</Label>
                <Select
                  value={hints.piscine || ""}
                  onValueChange={(value) =>
                    updateHints({ piscine: value as LocalizationUserHints["piscine"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aucune">Aucune</SelectItem>
                    <SelectItem value="oui_rectangulaire">Oui, rectangulaire</SelectItem>
                    <SelectItem value="oui_autre_forme">Oui, autre forme</SelectItem>
                    <SelectItem value="inconnu">Inconnu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vue</Label>
                <Select
                  value={hints.vue || ""}
                  onValueChange={(value) =>
                    updateHints({ vue: value as LocalizationUserHints["vue"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="village">Village</SelectItem>
                    <SelectItem value="vignes">Vignes</SelectItem>
                    <SelectItem value="foret">Forêt</SelectItem>
                    <SelectItem value="champs">Champs</SelectItem>
                    <SelectItem value="rue_commercante">Rue commerçante</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                    <SelectItem value="inconnu">Inconnu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="font-semibold">Repère proche (optionnel)</Label>
                <div className="space-y-2">
                  <Select
                    value={hints.repereProche?.type || ""}
                    onValueChange={(value) =>
                      updateHints({
                        repereProche: {
                          ...hints.repereProche,
                          type: value as LocalizationUserHints["repereProche"]["type"],
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de repère" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecole">École</SelectItem>
                      <SelectItem value="mairie">Mairie</SelectItem>
                      <SelectItem value="supermarche">Supermarché</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Nom du repère (ex: Carrefour Market, École Jules Ferry)"
                    value={hints.repereProche?.nom || ""}
                    onChange={(e) =>
                      updateHints({
                        repereProche: {
                          ...hints.repereProche,
                          nom: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Distance en minutes à pied"
                    value={hints.repereProche?.distanceMinutes || ""}
                    onChange={(e) =>
                      updateHints({
                        repereProche: {
                          ...hints.repereProche,
                          distanceMinutes: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes libres (optionnel)</Label>
                <Textarea
                  placeholder="Toute autre information utile (ex: près d'une église, en haut d'une colline...)"
                  value={hints.notesLibres || ""}
                  onChange={(e) => updateHints({ notesLibres: e.target.value })}
                  rows={3}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>

          <div className="text-sm text-gray-600">
            Étape {step} sur 3
          </div>

          <Button onClick={handleNext}>
            {step === 3 ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Terminer
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


