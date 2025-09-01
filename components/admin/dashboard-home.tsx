"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, TrendingUp, Users, Utensils, Table } from "lucide-react"
import { useWebSocket } from "../websocket-provider"

// --- Animation CSS injectée dynamiquement ---
const styles = `
@keyframes blink-red {
  0%, 100% { background-color: #ef4444; color: white; }
  50% { background-color: #ffffff; color: #ef4444; border: 1px solid #ef4444; }
}
.blink-red {
  animation: blink-red 1s ease-in-out 3;
}
`
if (typeof document !== "undefined" && !document.getElementById("blink-style")) {
  const style = document.createElement("style")
  style.id = "blink-style"
  style.innerHTML = styles
  document.head.appendChild(style)
}

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
  const [isBlinking, setIsBlinking] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { socket, isConnected } = useWebSocket()
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.emit("admin:join")

    const handleNewOrder = (newOrder: any) => {
      // 🔔 Jouer le son
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }

      // 🚨 Lancer le clignotement
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 3000)

      // 🔄 Mettre à jour les stats
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalOrders: prev.totalOrders + 1,
              pendingOrders: prev.pendingOrders + 1,
            }
          : prev
      )
    }

    socket.on("order:new", handleNewOrder)

    return () => {
      socket.off("order:new", handleNewOrder)
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )

  if (error)
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    )

  if (!stats)
    return (
      <div className="text-center py-8">
        Aucune donnée disponible
      </div>
    )

  const statsCards = [
    { title: "Utilisateurs", value: stats.totalUsers, icon: <Users className="h-4 w-4 text-muted-foreground" />, description: "Admins & Superadmins" },
    { title: "Plats", value: stats.totalDishes, icon: <Utensils className="h-4 w-4 text-muted-foreground" />, description: "Plats au menu" },
    { title: "Commandes", value: stats.totalOrders, icon: <Clock className="h-4 w-4 text-muted-foreground" />, description: "Total des commandes" },
    { title: "Tables", value: stats.totalTables, icon: <Table className="h-4 w-4 text-muted-foreground" />, description: "Tables disponibles" },
  ]

  const revenueCards = [
    { title: "Commandes en attente", value: stats.pendingOrders, icon: <Clock className="h-4 w-4 text-yellow-600" />, color: "text-yellow-600" },
    { title: "Revenus aujourd'hui", value: formatCFA(stats.todayRevenue), icon: <DollarSign className="h-4 w-4 text-green-600" />, color: "text-green-600" },
    { title: "Revenus totaux", value: formatCFA(stats.monthlyRevenue), icon: <TrendingUp className="h-4 w-4 text-blue-600" />, color: "text-blue-600" },
  ]

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src="/sounds/MÉLODIE K - XYLOPHONE COURT (HOROFRANCE)  SONNERIE ÉCOLECOLLÈGELYCÉEEREACFA.mp3" preload="auto" />

      <div className="flex justify-end">
        {isConnected ? (
          <Badge variant="default" className={isBlinking ? "blink-red" : ""}>
            Connecté
          </Badge>
        ) : (
          <Badge variant="destructive">Déconnecté</Badge>
        )}
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.description && <p className="text-xs text-muted-foreground">{card.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commandes & revenus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {revenueCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plats populaires */}
      <Card>
        <CardHeader>
          <CardTitle>Plats les plus populaires</CardTitle>
          <CardDescription>Top 5 des plats les plus commandés</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.popularDishes.length > 0 ? (
            stats.popularDishes.map((dish, index) => (
              <div key={`${dish.dishId}-${index}`} className="flex justify-between p-3 bg-muted rounded-lg mb-2">
                <div>
                  <p className="font-medium">{dish.name}</p>
                  <p className="text-sm text-muted-foreground">{dish.orderCount} commande(s)</p>
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
