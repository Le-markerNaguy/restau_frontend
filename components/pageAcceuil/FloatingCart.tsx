import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Utensils, X, Loader2 } from "lucide-react"
import TableSelector from "./TableSelector"

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

interface Table {
  id: number
  number: number
  qrData: string
}

interface FloatingCartProps {
  cart: CartItem[]
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  tables: Table[]
  selectedTable: number | null
  setSelectedTable: (id: number) => void
  selectedTableNumber: number | null
  setSelectedTableNumber: (num: number) => void
  customerName: string
  setCustomerName: (name: string) => void
  updateCartQuantity: (dishId: number, change: number) => void
  handleOrder: () => void
  isSending: boolean
  total: number
  tableFromUrl: string | null
  formatCFA: (amount: number) => string
}

export default function FloatingCart({
  cart,
  cartOpen,
  setCartOpen,
  tables,
  selectedTable,
  setSelectedTable,
  selectedTableNumber,
  setSelectedTableNumber,
  customerName,
  setCustomerName,
  updateCartQuantity,
  handleOrder,
  isSending,
  total,
  tableFromUrl,
  formatCFA,
}: FloatingCartProps) {
  return (
    <div className="lg:col-span-1 relative">
      <div
        className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-lg cursor-pointer z-50"
        onClick={() => setCartOpen(!cartOpen)}
      >
        <Utensils className="inline h-5 w-5" />
        {cart.length > 0 && <span className="ml-2 text-sm">{cart.length}</span>}
      </div>
      {cartOpen && (
        <div className="fixed bottom-24 right-8 w-80 max-h-[70vh] bg-card shadow-lg rounded-lg p-4 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">Panier</h2>
            <X className="cursor-pointer" onClick={() => setCartOpen(false)} />
          </div>
          {selectedTableNumber && (
            <div className="mb-2 text-sm text-muted-foreground">
              🪑 Table {selectedTableNumber}
            </div>
          )}
          <TableSelector
            tables={tables}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            setSelectedTableNumber={setSelectedTableNumber}
            tableFromUrl={tableFromUrl}
          />
          <Input
            placeholder="Nom du client (optionnel)"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="mb-2"
          />
          <div className="space-y-2 mb-4">
            {cart.map(item => (
              <div key={item.platId} className="flex justify-between items-center">
                <span>{item.dish.name} x{item.quantite}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => updateCartQuantity(item.platId, 1)}
                  >+</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    onClick={() => updateCartQuantity(item.platId, -1)}
                  >-</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold mb-2">
            <span>Total</span>
            <span>{formatCFA(total)}</span>
          </div>
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={handleOrder}
            disabled={cart.length === 0 || !selectedTable || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Commande en cours d’envoi…
              </>
            ) : (
              "Valider la commande"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}