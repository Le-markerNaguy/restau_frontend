"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Utensils, 
  Clock, 
  TrendingUp, 
  Calendar,
  DollarSign,
  ChefHat,
  Table,
  Plus
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalDishes: number
  totalOrders: number
  totalTables: number
  pendingOrders: number
  todayRevenue: number
  monthlyRevenue: number
  popularDishes: Array<{
    name: string
    orderCount: number
    revenue: number
  }>
}

interface User {
  id: string
  email: string
  role: "ADMIN" | "SUPERADMIN"
}

interface DashboardHomeProps {
  user: User
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError("")

      // Récupérer les statistiques depuis l'API avec gestion d'erreur individuelle
      const fetchWithFallback = async (url: string, fallback: any = []) => {
        try {
          const response = await fetch(url, { credentials: "include" })
          if (response.ok) {
            const data = await response.json()
            return data.users || data.dishes || data.orders || data.tables || data || fallback
          }
          console.warn(`Erreur ${response.status} pour ${url}`)
          return fallback
        } catch (error) {
          console.warn(`Erreur de connexion pour ${url}:`, error)
          return fallback
        }
      }

      // Récupérer les données en parallèle avec fallback
      const [users, dishes, orders, tables] = await Promise.all([
        fetchWithFallback(`${baseUrl}/superadmin/users`, []),
        fetchWithFallback(`${baseUrl}/dishes`, []),
        fetchWithFallback(`${baseUrl}/orders`, []),
        fetchWithFallback(`${baseUrl}/tables`, [])
      ])

      // Calculer les statistiques
      const pendingOrders = orders.filter((o: any) => o.status === "PENDING").length
      const todayOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt)
        const today = new Date()
        return orderDate.toDateString() === today.toDateString()
      })

      const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
      const monthlyRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)

      // Calculer les plats populaires
      const dishStats = new Map()
      orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          const dishName = item.dishName || "Plat inconnu"
          if (!dishStats.has(dishName)) {
            dishStats.set(dishName, { orderCount: 0, revenue: 0 })
          }
          const stats = dishStats.get(dishName)
          stats.orderCount += item.quantity || 1
          stats.revenue += (item.price || 0) * (item.quantity || 1)
        })
      })

      const popularDishes = Array.from(dishStats.entries())
        .map(([name, stats]: [string, any]) => ({
          name,
          orderCount: stats.orderCount,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)

      setStats({
        totalUsers: users.length,
        totalDishes: dishes.length,
        totalOrders: orders.length,
        totalTables: tables.length,
        pendingOrders,
        todayRevenue,
        monthlyRevenue,
        popularDishes
      })

      // Afficher un avertissement si certaines données n'ont pas pu être récupérées
      const warnings = []
      if (users.length === 0) warnings.push("Utilisateurs")
      if (dishes.length === 0) warnings.push("Plats")
      if (orders.length === 0) warnings.push("Commandes")
      if (tables.length === 0) warnings.push("Tables")
      
      if (warnings.length > 0) {
        console.warn(`Certaines données n'ont pas pu être récupérées: ${warnings.join(", ")}`)
      }

    } catch (error) {
      console.error("Erreur générale lors du chargement des statistiques:", error)
      setError("Erreur lors du chargement des statistiques")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchDashboardStats} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenue, {user.email} - {user.role === "SUPERADMIN" ? "Super Administrateur" : "Administrateur"}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Admins et Super Admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plats</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDishes}</div>
            <p className="text-xs text-muted-foreground">
              Plats au menu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total des commandes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTables}</div>
            <p className="text-xs text-muted-foreground">
              Tables disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques des commandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes en attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus aujourd'hui</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.todayRevenue}CFA</div>
            <p className="text-xs text-muted-foreground">
              Chiffre d'affaires du jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.monthlyRevenue}CFA</div>
            <p className="text-xs text-muted-foreground">
              Chiffre d'affaires total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plats populaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Plats les plus populaires
          </CardTitle>
          <CardDescription>
            Top 5 des plats les plus commandés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.popularDishes.length > 0 ? (
            <div className="space-y-4">
              {stats.popularDishes.map((dish, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{dish.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dish.orderCount} commande{dish.orderCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{dish.revenue}CFA</p>
                    <p className="text-xs text-muted-foreground">Revenus</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune commande pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 