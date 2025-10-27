"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestLoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleDirectLogin = async () => {
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
          <CardTitle>Test Connexion Directe</CardTitle>
          <p className="text-sm text-gray-600">
            Test de l'authentification sans email
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
          {message && (
            <p className="text-sm text-center">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





