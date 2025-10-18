"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signIn } from "next-auth/react"
import { Loader2, Mail, User } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleEmailLogin = async () => {
    setIsLoading(true)
    setMessage("")
    
    try {
      // Essayer d'abord la connexion par email (magic link)
      const result = await signIn('email', { 
        email, 
        redirect: false 
      })
      
      if (result?.ok) {
        setMessage("✅ Email de connexion envoyé ! Vérifiez votre boîte email.")
      } else {
        setMessage("❌ Erreur d'envoi d'email. Utilisez la connexion directe.")
      }
    } catch (error) {
      setMessage("❌ Erreur d'envoi d'email. Utilisez la connexion directe.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectLogin = async () => {
    if (email !== "saasdeveloppement@gmail.com") {
      setMessage("❌ Email non autorisé pour la connexion directe")
      return
    }

    setIsLoading(true)
    setMessage("")
    
    try {
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage("✅ Connexion réussie ! Redirection...")
        setTimeout(() => {
          router.push('/app/dashboard')
        }, 1000)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage("❌ Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Connexion SACIMO</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Connectez-vous à votre compte
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="direct" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct">Connexion Directe</TabsTrigger>
              <TabsTrigger value="email">Magic Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="direct" className="space-y-4">
              <div>
                <Label htmlFor="email-direct">Email</Label>
                <Input
                  id="email-direct"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="saasdeveloppement@gmail.com"
                />
              </div>
              <Button 
                onClick={handleDirectLogin}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Se connecter directement
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Connexion immédiate sans email
              </p>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="email-magic">Email</Label>
                <Input
                  id="email-magic"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
              <Button 
                onClick={handleEmailLogin}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer le lien magique
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Vous recevrez un email de connexion
              </p>
            </TabsContent>
          </Tabs>

          {message && (
            <div className="mt-4 p-3 text-sm text-center rounded-lg bg-gray-100">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}