"use client"

import { useState, useEffect, useCallback } from "react"
import { getCurrentUser } from "@/lib/auth"

interface User {
  id: string
  email: string
  role: "ADMIN" | "SUPERADMIN"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'authentification")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      // Appeler la fonction de déconnexion du backend
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      
      if (response.ok) {
        setUser(null)
        setError(null)
        // Rediriger vers la page de connexion
        window.location.href = "/login"
      }
    } catch (err) {
      setError("Erreur lors de la déconnexion")
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshAuth = useCallback(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return { 
    user, 
    loading, 
    error, 
    setUser, 
    logout, 
    refreshAuth,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    isSuperAdmin: user?.role === "SUPERADMIN"
  }
}
