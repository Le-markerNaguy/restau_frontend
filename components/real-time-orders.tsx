"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

interface Order {
  id: number
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  status: "pending" | "preparing" | "ready" | "delivered"
  timestamp: string
  tableNumber?: number
}

interface RealTimeOrdersProps {
  onNewOrder?: (order: Order) => void
}

export function RealTimeOrders({ onNewOrder }: RealTimeOrdersProps) {
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  // 🔊 Référence vers l'audio
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${baseUrl}/orders?recent=true`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.orders) {
            const newOrders = data.orders.filter(
              (order: Order) => !recentOrders.find((existing) => existing.id === order.id),
            )

            if (newOrders.length > 0) {
              setRecentOrders((prev) => [...newOrders, ...prev].slice(0, 5))
              
              // 🔊 Jouer le son à chaque nouvelle commande
              if (audioRef.current) {
                audioRef.current.currentTime = 0 // repart du début
                audioRef.current.play().catch((err) => {
                  console.warn("Impossible de jouer le son automatiquement:", err)
                })
              }

              newOrders.forEach((order: Order) => {
                if (onNewOrder) onNewOrder(order)
              })
            }
          }
        })
        .catch((error) => console.error("Erreur lors du chargement des commandes:", error))
    }, 5000)

    return () => clearInterval(interval)
  }, [recentOrders, onNewOrder, baseUrl])

  if (recentOrders.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      {/* 🔊 Audio caché */}
      <audio ref={audioRef} src="/sounds/MÉLODIE K - XYLOPHONE COURT (HOROFRANCE)  SONNERIE ÉCOLECOLLÈGELYCÉEEREACFA.mp3" preload="auto" />

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Nouvelles commandes
        </CardTitle>
        <CardDescription>Commandes reçues en temps réel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Commande #{order.id}</p>
                <p className="text-sm text-muted-foreground">
                  {order.tableNumber && `Table ${order.tableNumber} • `}
                  {order.total.toFixed(2)} CFA
                </p>
              </div>
              <Badge variant="secondary">Nouvelle</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
