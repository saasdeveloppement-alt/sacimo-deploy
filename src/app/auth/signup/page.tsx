"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  User,
  CheckCircle
} from "lucide-react"

const features = [
  "Surveillance continue des nouvelles annonces",
  "Rapports quotidiens personnalisés",
  "Veille concurrentielle",
  "Export des données en PDF/CSV",
  "Support en français"
]

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    agency: "",
    phone: "",
    acceptTerms: false,
    acceptMarketing: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simuler la création du compte
    setTimeout(() => {
      setIsLoading(false)
      alert("Compte créé ! Vérifiez votre email pour activer votre compte.")
    }, 2000)
  }

  const handleGoogleSignUp = () => {
    // Simuler l'inscription Google
    console.log("Inscription Google")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl"
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">SACIMO</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Rejoignez des centaines d'agences qui font confiance à SACIMO
              </h1>
              <p className="text-xl text-gray-600">
                Transformez votre veille immobilière avec notre plateforme automatisée
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white"
            >
              <h3 className="text-lg font-semibold mb-2">Essai gratuit 14 jours</h3>
              <p className="text-blue-100">
                Commencez immédiatement sans engagement. Aucune carte de crédit requise.
              </p>
            </motion.div>
          </motion.div>

          {/* Right side - Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Créer un compte
                </CardTitle>
                <p className="text-gray-600">
                  Commencez votre essai gratuit de 14 jours
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Jean Dupont"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email professionnel</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="jean@agence.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="agency">Nom de l'agence</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="agency"
                        type="text"
                        placeholder="Agence Immobilière Dupont"
                        value={formData.agency}
                        onChange={(e) => setFormData({...formData, agency: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 1 23 45 67 89"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
                        required
                      />
                      <Label htmlFor="terms" className="text-sm">
                        J'accepte les{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          conditions d'utilisation
                        </Link>{" "}
                        et la{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          politique de confidentialité
                        </Link>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketing"
                        checked={formData.acceptMarketing}
                        onCheckedChange={(checked) => setFormData({...formData, acceptMarketing: checked as boolean})}
                      />
                      <Label htmlFor="marketing" className="text-sm">
                        Je souhaite recevoir des conseils et actualités par email
                      </Label>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !formData.acceptTerms}
                    data-magnetic
                    data-cursor="Sign Up"
                  >
                    {isLoading ? (
                      "Création du compte..."
                    ) : (
                      <>
                        Créer mon compte
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Ou continuer avec</span>
                  </div>
                </div>

                {/* Google Sign Up */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignUp}
                  data-magnetic
                  data-cursor="Sign Up"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuer avec Google
                </Button>

                {/* Sign In Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Déjà un compte ?{" "}
                    <Link 
                      href="/auth/signin" 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      data-magnetic
                      data-cursor="View"
                    >
                      Se connecter
                    </Link>
                  </p>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                  <Link 
                    href="/" 
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    data-magnetic
                    data-cursor="Back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour à l'accueil
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}



