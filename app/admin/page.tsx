"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardHome } from "@/components/admin/dashboard-home"
import { DishesManager } from "@/components/admin/dishes-manager"
import { OrdersManager } from "@/components/admin/orders-manager"
import { TablesManager } from "@/components/admin/tables-manager"
import { UserManager } from "@/components/admin/user-manager"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface User {
  id: string
  email: string
  role: "ADMIN" | "SUPERADMIN"
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState("home")
  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/me`, {
        credentials: "include",
      })

      if (response.ok) {
        const userData = await response.json()
        if (userData.user && (userData.user.role === "ADMIN" || userData.user.role === "SUPERADMIN")) {
          setUser(userData.user)
        } else {
          // Rediriger vers la page appropriée selon le rôle
          if (userData.user?.role === "SUPERADMIN") {
            router.push("/superadmin")
          } else {
            router.push("/login")
          }
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
      router.push("/login")
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
    }
  }

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <DashboardHome user={user!} />
      case "dishes":
        return <DishesManager />
      case "orders":
        return <OrdersManager />
      case "tables":
        return <TablesManager />
      case "users":
        // Afficher UserManager si c'est un super admin, sinon rediriger
        if (user?.role === "SUPERADMIN") {
          return <UserManager user={user} />
        } else {
          // Rediriger vers la page superadmin pour la gestion des utilisateurs
          router.push("/superadmin")
          return null
        }
      case "settings":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">
              Page des paramètres en cours de développement...
            </p>
          </div>
        )
      default:
        return <DashboardHome user={user!} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="flex h-screen bg-background">
        <AdminSidebar 
          user={user} 
          activeView={activeView} 
          onViewChange={setActiveView} 
          onLogout={handleLogout} 
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
