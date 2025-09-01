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
    if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) return

    const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
      transports: ["websocket"], // évite le polling qui générait les 400
      withCredentials: true,
    })

    socketInstance.on("connect", () => {
      console.log("[WebSocket] Connected")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("[WebSocket] Disconnected")
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("[WebSocket] Connection error:", err)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return <WebSocketContext.Provider value={{ socket, isConnected }}>{children}</WebSocketContext.Provider>
}
