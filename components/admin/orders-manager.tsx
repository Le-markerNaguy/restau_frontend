"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, CheckCircle, AlertCircle, Package, Truck } from "lucide-react"

interface OrderItem {
  dishId: number
  quantity: number
  dishName: string
  price: number
}

interface Order {
  id: number
  tableNumber: number
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELED"
  items: OrderItem[]
  createdAt: string
  totalAmount: number
  customerName?: string
  notes?: string
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [highlightedIds, setHighlightedIds] = useState<number[]>([]) // ✅ pour highlight
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterStatus, setFilterStatus] = useState<Order["status"] | "ALL">("ALL")

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Vérifie si une date correspond à aujourd'hui
  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  useEffect(() => {
    fetchOrders()

    const socket: Socket = io(socketUrl, { withCredentials: true })
    socket.emit("admin:join") // ✅ rejoindre la room admins

    socket.on("order:new", (newOrder: Order) => {
      if (isToday(newOrder.createdAt)) {
        setOrders(prev => [newOrder, ...prev])

        // ✅ Highlight la commande
        setHighlightedIds(prev => [...prev, newOrder.id])
        setTimeout(() => {
          setHighlightedIds(prev => prev.filter(id => id !== newOrder.id))
        }, 3000)

        // 🔔 Jouer le son
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch(() => {})
        }
      }
    })

    socket.on("order:status", (updatedOrder: Order) => {
      if (isToday(updatedOrder.createdAt)) {
        setOrders(prev =>
          prev.map(order => (order.id === updatedOrder.id ? updatedOrder : order))
        )
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${baseUrl}/orders`, { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        const ordersData = data.orders || data
        setOrders(ordersData.filter((order: Order) => isToday(order.createdAt)))
      } else {
        setError("Erreur lors du chargement des commandes")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: Order["status"]) => {
    try {
      const response = await fetch(`${baseUrl}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      })
      if (!response.ok) {
        setError("Erreur lors de la mise à jour du statut")
        return
      }

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
    } catch {
      setError("Erreur de connexion au serveur")
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "PREPARING": return <Package className="h-4 w-4" />
      case "READY": return <CheckCircle className="h-4 w-4" />
      case "DELIVERED": return <Truck className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "PREPARING": return "bg-blue-100 text-blue-800"
      case "READY": return "bg-green-100 text-green-800"
      case "DELIVERED": return "bg-gray-100 text-gray-800"
      default: return "bg-red-100 text-red-800"
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "PENDING": return "En attente"
      case "PREPARING": return "En préparation"
      case "READY": return "Prêt"
      case "DELIVERED": return "Livré"
      case "CANCELED": return "Annulée"
      default: return status
    }
  }

  const getNextStatus = (currentStatus: Order["status"]): Order["status"] | null => {
    switch (currentStatus) {
      case "PENDING": return "PREPARING"
      case "PREPARING": return "READY"
      case "READY": return "DELIVERED"
      default: return null
    }
  }

  const filteredOrders = filterStatus === "ALL"
    ? orders
    : orders.filter(order => order.status === filterStatus)

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src="/sounds/MÉLODIE K - XYLOPHONE COURT (HOROFRANCE)  SONNERIE ÉCOLECOLLÈGELYCÉEEREACFA.mp3" preload="auto" />

      {/* Header et filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Commandes</h1>
          <p className="text-muted-foreground mt-2">
            Suivez et gérez les commandes en temps réel 🚀
          </p>
        </div>

        <div className="flex gap-2">
          {["ALL","PENDING","PREPARING","READY"].map(st => (
            <Button
              key={st}
              variant={filterStatus === st ? "default" : "outline"}
              onClick={() => setFilterStatus(st as Order["status"] | "ALL")}
            >
              {st === "ALL" ? "Toutes" : getStatusText(st as Order["status"])}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <Card
            key={order.id}
            className={`border-l-4 border-l-primary transition-all duration-500 ${
              highlightedIds.includes(order.id) ? "bg-yellow-50 animate-pulse" : ""
            }`}
          >
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  Commande #{order.id} - <span className="font-semibold text-primary">Table {order.tableNumber}</span>
                </CardTitle>
                <CardDescription>Passée le {new Date(order.createdAt).toLocaleString()}</CardDescription>
                {order.customerName && <p className="text-sm mt-1">👤 Client : {order.customerName}</p>}
                {order.notes && <p className="text-sm text-muted-foreground mt-1">📝 Note : {order.notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(order.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </span>
                </Badge>
                <div className="text-lg font-bold text-primary">Total : {order.totalAmount} CFA</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.quantity} × {item.dishName}</span>
                    <span>{item.price * item.quantity} CFA</span>
                  </div>
                ))}
              </div>

              {getNextStatus(order.status) && (
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                  className="flex-1"
                >
                  {getNextStatus(order.status) === "PREPARING" && "Commencer"}
                  {getNextStatus(order.status) === "READY" && "Marquer comme prêt"}
                  {getNextStatus(order.status) === "DELIVERED" && "Marquer comme livré"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filterStatus === "ALL" ? "Aucune commande" : `Aucune commande ${getStatusText(filterStatus as Order["status"]).toLowerCase()}`}
              </h3>
              <p className="text-muted-foreground text-center">
                {filterStatus === "ALL" ? "Aucune commande n'a été passée pour le moment" : "Toutes les commandes ont été traitées"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
