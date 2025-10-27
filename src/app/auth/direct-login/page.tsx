"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DirectLoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDirectLogin = async () => {
    if (email === "saasdeveloppement@gmail.com") {
      setIsLoading(true)
      
      // Simuler une connexion directe
      setTimeout(() => {
        // Rediriger vers le dashboard
        router.push("/app/dashboard")
      }, 1000)
    } else {
      alert("Email non autorisé pour la connexion directe")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion Directe (Test)</CardTitle>
          <p className="text-sm text-gray-600">
            Connexion temporaire en attendant la configuration email
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
            {isLoading ? "Connexion..." : "Se connecter directement"}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Cette page est temporaire. Une fois les emails configurés, 
            utilisez la page de connexion normale.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}





