"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChefHat, ArrowLeft, Eye, EyeOff } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_API_URL

interface User {
  id: string
  email: string
  role: "SUPERADMIN" | "ADMIN" | string
}

interface UserResponse {
  user?: User
  error?: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Vérification automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkAuth = async () => {
      if (!baseUrl) return
      try {
        const response = await fetch(`${baseUrl}/auth/me`, { credentials: "include" })
        if (response.ok) {
          const data: UserResponse = await response.json()
          if (data.user) {
            setIsAuthenticated(true)
            if (data.user.role === "SUPERADMIN") router.replace("/superadmin")
            else if (data.user.role === "ADMIN") router.replace("/admin")
          }
        }
      } catch (err) {
        console.error("Erreur lors de la vérification d'auth:", err)
      }
    }
    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError(!email ? "L'email est requis" : "Le mot de passe est requis")
      return
    }
    if (!baseUrl) {
      setError("Configuration de l'API manquante")
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), motDePasse: password }),
        credentials: "include",
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error || "Identifiants invalides")
        return
      }

      // Récupération des infos utilisateur après login
      const userRes = await fetch(`${baseUrl}/auth/me`, { credentials: "include" })
      if (userRes.ok) {
        const data: UserResponse = await userRes.json()
        if (!data.user) return setError("Impossible de récupérer les informations utilisateur")
        if (data.user.role === "SUPERADMIN") router.replace("/superadmin")
        else if (data.user.role === "ADMIN") router.replace("/admin")
        else setError("Rôle non autorisé")
      } else {
        setError("Erreur lors de la récupération des informations utilisateur")
      }
    } catch (err) {
      console.error("Erreur de connexion:", err)
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <Button variant="ghost" onClick={() => router.push("/")} className="absolute left-4 top-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Connexion Admin</CardTitle>
            <CardDescription>Connectez-vous pour accéder au panneau d'administration</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@restaurant.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError("") }}
                  disabled={loading}
                  required
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError("") }}
                    disabled={loading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Bouton connexion */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
