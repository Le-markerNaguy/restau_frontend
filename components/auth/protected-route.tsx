"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AuthLoading } from "./auth-loading"
import { AuthErrorBoundary } from "./auth-error-boundary"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole: "ADMIN" | "SUPERADMIN"
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const { user, loading, error, isAuthenticated, isAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Utilisateur non connecté, rediriger vers login
        setRedirecting(true)
        router.push("/login")
        return
      }

      // Vérifier les permissions
      let hasPermission = false
      
      if (requiredRole === "SUPERADMIN") {
        hasPermission = isSuperAdmin
      } else if (requiredRole === "ADMIN") {
        hasPermission = isAdmin || isSuperAdmin
      }

      if (!hasPermission) {
        // Rôle insuffisant, rediriger selon le rôle
        setRedirecting(true)
        if (isSuperAdmin) {
          router.push("/superadmin")
        } else if (isAdmin) {
          router.push("/admin")
        } else {
          router.push("/login")
        }
        return
      }

      setIsAuthorized(true)
    }
  }, [user, loading, isAuthenticated, isAdmin, isSuperAdmin, requiredRole, router])

  // Gestion des erreurs d'authentification
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-destructive mb-2">
              Erreur d'authentification
            </h1>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
          </div>
          
          <button 
            onClick={() => window.location.href = "/login"}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    )
  }

  // Affichage du chargement
  if (loading || redirecting) {
    return <AuthLoading role={requiredRole} />
  }

  // Utilisateur non autorisé
  if (!isAuthorized) {
    return fallback || null
  }

  // Utilisateur autorisé, afficher le contenu protégé
  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  )
} 