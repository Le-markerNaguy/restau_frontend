"use client"

import { Loader2, Shield, Crown } from "lucide-react"

interface AuthLoadingProps {
  role?: "ADMIN" | "SUPERADMIN"
  message?: string
}

export function AuthLoading({ role, message }: AuthLoadingProps) {
  const getRoleIcon = () => {
    if (role === "SUPERADMIN") {
      return <Crown className="h-8 w-8 text-primary" />
    }
    if (role === "ADMIN") {
      return <Shield className="h-8 w-8 text-primary" />
    }
    return <Shield className="h-8 w-8 text-primary" />
  }

  const getRoleText = () => {
    if (role === "SUPERADMIN") {
      return "Super Admin"
    }
    if (role === "ADMIN") {
      return "Admin"
    }
    return "Administrateur"
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-6">
          {getRoleIcon()}
        </div>
        
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        
        <h2 className="text-xl font-semibold mb-2">
          Vérification de l'authentification
        </h2>
        
        {role && (
          <p className="text-muted-foreground mb-4">
            Connexion en tant que {getRoleText()}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground">
          {message || "Veuillez patienter..."}
        </p>
      </div>
    </div>
  )
} 