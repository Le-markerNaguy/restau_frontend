"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
})

export function useWebSocket() {
  return useContext(WebSocketContext)
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL
    if (!url) {
      console.error("[WebSocket] ❌ NEXT_PUBLIC_WEBSOCKET_URL manquant")
      return
    }

    const socketInstance = io(url, {
      transports: ["websocket"], // 🚀 forcer WebSocket pur
      withCredentials: true,
      timeout: 10000, // ⏱️ 10s pour Render (démarrage lent)
      reconnectionAttempts: 20, // 🚦 limite les essais
      reconnectionDelay: 5000, // ⏳ attend 2s avant retry
    })

    socketInstance.on("connect", () => {
      console.log("[WebSocket] ✅ Connected:", socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on("disconnect", (reason) => {
      console.warn("[WebSocket] ⚠️ Disconnected:", reason)
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("[WebSocket] ❌ Connection error:", err.message)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
      console.log("[WebSocket] 🔌 Disconnected (cleanup)")
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}
