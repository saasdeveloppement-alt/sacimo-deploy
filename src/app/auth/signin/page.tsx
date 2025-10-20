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
            
            {/* Bouton Google */}
            <div className="mt-4">
              <Button 
                onClick={() => signIn('google', { callbackUrl: '/app/dashboard' })}
                variant="outline"
                className="w-full"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Se connecter avec Google
              </Button>
            </div>
            
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