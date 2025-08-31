"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, TrendingUp, Users, Utensils, Table } from "lucide-react"
import { useWebSocket } from "../websocket-provider"

interface DashboardStats {
  totalUsers: number
  totalDishes: number
  totalTables: number
  totalOrders: number
  pendingOrders: number
  todayRevenue: number
  monthlyRevenue: number
  popularDishes: Array<{
    dishId: number
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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { socket, isConnected } = useWebSocket()
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (!socket) return

    console.log("Connexion WebSocket établie")
    socket.emit("admin:join")

    socket.on("order:new", (newOrder: any) => {
      console.log("Nouvelle commande reçue", newOrder)

      // Jouer le son
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }

      // Mettre à jour les stats
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalOrders: prev.totalOrders + 1,
              pendingOrders: prev.pendingOrders + 1,
            }
          : prev
      )
    })

    return () => {
      socket.off("order:new")
    }
  }, [socket])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch(`${baseUrl}/dashboard/dashboard`, { credentials: "include" })
      if (!res.ok) throw new Error("Erreur API")
      const data: DashboardStats = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
      setError("Erreur lors du chargement des statistiques")
    } finally {
      setLoading(false)
    }
  }

  const formatCFA = (amount: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(amount)

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
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-8">Aucune donnée disponible</div>
  }

  return (
    <div className="space-y-6">
      {/* Audio pour notifications */}
      <audio ref={audioRef} src="/sounds/MÉLODIE K - XYLOPHONE COURT (HOROFRANCE)  SONNERIE ÉCOLECOLLÈGELYCÉEEREACFA.mp3" preload="auto" />

      {/* Statut WebSocket */}
      <div className="flex justify-end">
        {isConnected ? (
          <Badge variant="default">Connecté</Badge>
        ) : (
          <Badge variant="destructive">Déconnecté</Badge>
        )}
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Admins & Superadmins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plats</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDishes}</div>
            <p className="text-xs text-muted-foreground">Plats au menu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total des commandes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTables}</div>
            <p className="text-xs text-muted-foreground">Tables disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Commandes en attente et revenus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commandes en attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenus aujourd'hui</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCFA(stats.todayRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenus totaux</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCFA(stats.monthlyRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Plats populaires */}
      <Card>
        <CardHeader>
          <CardTitle>Plats les plus populaires</CardTitle>
          <CardDescription>Top 5 des plats les plus commandés</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.popularDishes.length > 0 ? (
            stats.popularDishes.map((dish) => (
              <div
                key={dish.dishId}
                className="flex justify-between p-3 bg-muted rounded-lg mb-2"
              >
                <div>
                  <p className="font-medium">{dish.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {dish.orderCount} commande(s)
                  </p>
                </div>
                <div className="font-semibold">{formatCFA(dish.revenue)}</div>
              </div>
            ))
          ) : (
            <p>Aucune commande pour le moment</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
