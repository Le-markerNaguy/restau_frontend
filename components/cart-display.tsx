"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Utensils } from "lucide-react"

interface CartItem {
  platId: number
  quantite: number
  dish: {
    id: number
    name: string
    price: number
    category: string
  }
}

interface CartDisplayProps {
  cart: CartItem[]
  onUpdateQuantity: (dishId: number, change: number) => void
  onOrder: (orderData: { tableId: number; nom: string; plats: { platId: number; quantite: number }[] }) => void
}

export function CartDisplay({ cart, onUpdateQuantity, onOrder }: CartDisplayProps) {
  const [customerName, setCustomerName] = useState("")
  const [tableNumber, setTableNumber] = useState<number>(1)

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.dish.price * item.quantite, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantite, 0)
  }

  const handleOrder = () => {
    if (cart.length === 0) return

    const orderData = {
      tableId: tableNumber,
      nom: customerName,
      plats: cart.map((item) => ({
        platId: item.platId,
        quantite: item.quantite,
      })),
    }

    onOrder(orderData)
    setCustomerName("")
  }

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="relative">
            <Utensils className="h-5 w-5 text-primary" />
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {getTotalItems()}
              </Badge>
            )}
          </div>
          Mon Panier
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nom (optionnel)</label>
            <Input
              placeholder="Votre nom..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Numéro de table *</label>
            <Input
              type="number"
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Votre panier est vide</p>
            <p className="text-sm text-muted-foreground/70">Ajoutez des plats pour commencer</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.platId} className="bg-card border rounded-lg p-3 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm leading-tight">{item.dish.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {item.dish.category}
                        </Badge>
                        <span className="text-sm font-medium text-primary">{item.dish.price.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.platId, -1)}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantite}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.platId, 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-medium text-sm">{(item.dish.price * item.quantite).toFixed(2)}€</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg text-primary">{getTotalPrice().toFixed(2)}€</span>
              </div>

              <Button onClick={handleOrder} className="w-full h-12 text-base font-medium">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Commander ({getTotalItems()} plat{getTotalItems() > 1 ? "s" : ""})
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
