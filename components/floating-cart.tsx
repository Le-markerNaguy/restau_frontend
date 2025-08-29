"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Utensils, X } from "lucide-react" // Icône assiette

// 🔹 Types intégrés
interface Dish {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
  available: boolean
}

interface CartItem {
  platId: number
  quantite: number
  dish: Dish
}

interface FloatingCartProps {
  cart: CartItem[]
  onUpdateQuantity: (dishId: number, change: number) => void
  onOrder: (orderData: { tableId: number; nom: string; plats: { platId: number; quantite: number }[] }) => void
}

export function FloatingCart({ cart, onUpdateQuantity, onOrder }: FloatingCartProps) {
  const [open, setOpen] = useState(false)
  const [tableId, setTableId] = useState<number>(1)
  const [nom, setNom] = useState("")

  const total = cart.reduce((sum, item) => sum + item.dish.price * item.quantite, 0)

  const handleFinalize = () => {
    if (!tableId) return alert("Veuillez sélectionner un numéro de table")
    if (cart.length === 0) return alert("Votre panier est vide")

    onOrder({
      tableId,
      nom,
      plats: cart.map((item) => ({ platId: item.platId, quantite: item.quantite })),
    })

    setOpen(false)
    setNom("")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bouton assiette flottant */}
      {!open && (
        <Button
          size="icon"
          onClick={() => setOpen(true)}
          className="rounded-full p-4 shadow-lg bg-primary text-white relative"
        >
          <Utensils className="h-6 w-6" />
          {cart.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 rounded-full text-xs px-2"
            >
              {cart.length}
            </Badge>
          )}
        </Button>
      )}

      {/* Panier flottant */}
      {open && (
        <Card className="w-80 shadow-xl relative">
          {/* Bouton fermer */}
          <Button
            size="icon"
            className="absolute top-2 right-2 p-1"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          <CardHeader>
            <CardTitle>Votre commande</CardTitle>
            <CardDescription>{cart.length} plat(s)</CardDescription>
          </CardHeader>

          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {/* Sélecteur de table */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Table</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={tableId}
                onChange={(e) => setTableId(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Nom du client */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Nom (facultatif)</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom du client"
                className="w-full border rounded px-2 py-1"
              />
            </div>

            {/* Liste des plats */}
            {cart.map((item) => (
              <div key={item.platId} className="flex justify-between items-center border-b py-1">
                <div>
                  <span className="font-medium">{item.dish.name}</span>
                  <div className="text-sm text-muted-foreground">
                    {(item.dish.price * item.quantite).toFixed(2)}€
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => onUpdateQuantity(item.platId, -1)}
                  >
                    -
                  </Button>
                  <span className="px-2">{item.quantite}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => onUpdateQuantity(item.platId, 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>{total.toFixed(2)}€</span>
            </div>

            {/* Finaliser la commande */}
            <Button className="w-full mt-2" onClick={handleFinalize}>
              Finaliser la commande
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
