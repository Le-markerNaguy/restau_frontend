"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, X, Utensils, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// 🔹 Types
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

// 🔹 URL API
const baseUrl = process.env.NEXT_PUBLIC_API_URL
const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL

// 🔹 Format Franc CFA
const formatCFA = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount)

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState<string>("")
  const [clickCount, setClickCount] = useState(0)
  const [showAdmin, setShowAdmin] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const tableFromUrl = searchParams.get("table") // récupère table=ID dans l’URL

  // 🔹 Préfixe images
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "/placeholder.svg"
    if (imageUrl.startsWith("http")) return imageUrl
    return `${imageBaseUrl}${imageUrl}`
  }

  // 🔹 Fetch plats
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch(`${baseUrl}/dishes`)
        if (response.ok) {
          const data = await response.json()
          setDishes(data.filter((dish: Dish) => dish.available))
        } else {
          setDishes([])
        }
      } catch {
        setDishes([])
      }
    }
    fetchDishes()
  }, [])

  // 🔹 Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(`${baseUrl}/tables`)
        if (response.ok) {
          const data = await response.json()
          setTables(data)
        } else {
          setTables([])
        }
      } catch {
        setTables([])
      }
    }
    fetchTables()
  }, [])

  // 🔹 Pré-sélection table si QR code
  useEffect(() => {
    if (tableFromUrl && tables.length > 0) {
      const tableId = Number(tableFromUrl)
      const table = tables.find(t => t.id === tableId)
      if (table) {
        setSelectedTableId(table.id)       // pour l’API
        setSelectedTableNumber(table.number) // pour affichage
      }
    }
  }, [tableFromUrl, tables])

  const getCategories = () => ["all", ...new Set(dishes.map(d => d.category))]
  const categories = getCategories()

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.platId === dish.id)
      if (existing) {
        return prev.map(item =>
          item.platId === dish.id ? { ...item, quantite: item.quantite + 1 } : item
        )
      }
      return [...prev, { platId: dish.id, quantite: 1, dish }]
    })
    setCartOpen(true)
  }

  const updateCartQuantity = (dishId: number, change: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.platId === dishId)
      if (existing) {
        const newQty = existing.quantite + change
        if (newQty <= 0) return prev.filter(item => item.platId !== dishId)
        return prev.map(item =>
          item.platId === dishId ? { ...item, quantite: newQty } : item
        )
      }
      return prev
    })
  }

  const handleOrder = async () => {
    if (!selectedTableId) return alert("Veuillez sélectionner une table")
    if (cart.length === 0) return alert("Le panier est vide")

    const orderData = {
      tableId: selectedTableId,
      nom: customerName || "",
      plats: cart.map(c => ({ platId: c.platId, quantite: c.quantite })),
    }

    try {
      setIsSending(true)
      const response = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
      if (response.ok) {
        const data = await response.json()
        alert(`Commande validée ! Numéro de commande : ${data.order.dailyNumber}`)
        setCart([])
        setCartOpen(false)
        setCustomerName("")
      } else {
        const errorData = await response.json()
        alert(`Erreur : ${errorData.error || "Erreur lors de la commande"}`)
      }
    } catch (error) {
      console.error(error)
      alert("Erreur serveur")
    } finally {
      setIsSending(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.dish.price * item.quantite, 0)

  const handleTitleClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1
      if (newCount >= 3 && !showAdmin) {
        setShowAdmin(true)
        setTimeout(() => {
          setShowAdmin(false)
          setClickCount(0)
        }, 120000)
      }
      return newCount
    })
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-primary cursor-pointer"
            onClick={handleTitleClick}
          >
            RestauOpti
          </h1>

          {showAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login")}
            >
              Admin
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Menu */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
              <Input
                placeholder="Rechercher un plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat === "all" ? "Tous" : cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map(dish => (
              <Card
                key={dish.id}
                className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="aspect-square relative">
                  <img
                    src={getImageUrl(dish.imageUrl)}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-semibold">{dish.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize text-xs">{dish.category}</Badge>
                  </div>
                  <CardDescription className="text-sm line-clamp-2">{dish.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">{formatCFA(dish.price)}</span>
                  <Button onClick={() => addToCart(dish)} size="sm" className="shrink-0">
                    <Plus className="h-4 w-4 mr-1"/>Ajouter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Panier flottant */}
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

              <select
                value={selectedTableId || ""}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  const table = tables.find(t => t.id === id)
                  if (table) {
                    setSelectedTableId(table.id)
                    setSelectedTableNumber(table.number)
                  }
                }}
                className="w-full mb-2 border rounded px-2 py-1"
                disabled={!!tableFromUrl} // 🔒 désactive si QR code a fixé la table
              >
                <option value="" disabled>Choisir une table</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>
                    Table {t.number}
                  </option>
                ))}
              </select>

              {selectedTableNumber && (
                <div className="mb-2 font-medium">
                  Table sélectionnée : {selectedTableNumber}
                </div>
              )}

              <Input
                placeholder="Nom du client (optionnel)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
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
                disabled={cart.length === 0 || !selectedTableId || isSending}
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
      </div>
    </div>
  )
}
