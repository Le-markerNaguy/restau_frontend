"use client"

import { WebSocketProvider } from "../components/websocket-provider" // adapte le chemin selon où tu as mis websocket.tsx

export function Providers({ children }: { children: React.ReactNode }) {
  return <WebSocketProvider>{children}</WebSocketProvider>
}
