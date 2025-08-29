"use client"

import { useEffect, useState } from "react"
import { useWebSocket } from "./websocket-provider"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NewOrder {
  id: string
  tableId: string
  nom: string
  dailyNumber: number
  total: number
}

export function OrderNotifications() {
  const { socket } = useWebSocket()
  const [notifications, setNotifications] = useState<NewOrder[]>([])

  useEffect(() => {
    if (!socket) return

    socket.emit("admin:join")

    socket.on("newOrder", (order: NewOrder) => {
      console.log("[Notification] New order received:", order)

      // Ajout de la notification
      setNotifications((prev) => [...prev, order])

      // Jouer le son
      const audio = new Audio("/sounds/notification.mp3")
      audio.play().catch(() => {
        console.warn("🔇 Le son est bloqué par le navigateur")
      })

      // Auto-hide après 5s
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== order.id))
      }, 5000)
    })

    return () => {
      socket.off("newOrder")
    }
  }, [socket])

  const dismissNotification = (orderId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== orderId))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((order) => (
        <Card
          key={order.id}
          className="w-80 bg-red-50 border-red-200 shadow-lg animate-slide-in"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-red-600 animate-pulse" />
                <div>
                  <h4 className="font-semibold text-red-800">
                    Nouvelle commande #{order.dailyNumber}
                  </h4>
                  <p className="text-sm text-red-600">
                    Table {order.tableId} – {order.nom}
                  </p>
                  <p className="text-sm font-medium text-red-700">
                    Total : {order.total.toFixed(2)} €
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(order.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
