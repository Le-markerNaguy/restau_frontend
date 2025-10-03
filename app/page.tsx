"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/pageAcceuil/Header"
import MenuSection from "@/components/pageAcceuil/MenuSection"
import FloatingCart from "@/components/pageAcceuil/FloatingCart"

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

  // 🔹 Table sélectionnée
  const [selectedTable, setSelectedTable] = useState<number | null>(null) // stocke l'ID
  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null) // stocke le numéro
  const [customerName, setCustomerName] = useState<string>("")
  const [clickCount, setClickCount] = useState(0)
  const [showAdmin, setShowAdmin] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const tableFromUrl = searchParams.get("table") // récupère "1003"

  // 🔹 Préfixe images
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "/placeholder.svg"
    if (imageUrl.startsWith("http")) return imageUrl
    return `${imageBaseUrl}${imageUrl}`
  }

  // Fetch plats
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

  // Fetch tables
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

  // 🔹 Sélection de la table depuis l’URL (par numéro)
  useEffect(() => {
    if (tableFromUrl && tables.length > 0) {
      const tableNumber = Number(tableFromUrl)
      const table = tables.find(t => t.number === tableNumber)
      if (table) {
        setSelectedTable(table.id)          // utilisé pour la commande
        setSelectedTableNumber(table.number) // affiché à l’écran
      }
    }
  }, [tableFromUrl, tables])

  const getCategories = () => ["all", ...new Set(dishes.map(d => d.category))]
  const categories = getCategories()

  // Filtrage
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Ajouter au panier
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
    if (!selectedTable) return alert("Veuillez sélectionner une table")
    if (cart.length === 0) return alert("Le panier est vide")

    const orderData = {
      tableId: selectedTable, // ⚡️ envoie l’ID au backend
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

  // 🔹 Gestion bouton Admin
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
        <Header
          showAdmin={showAdmin}
          onTitleClick={handleTitleClick}
          onAdminClick={() => router.push("/login")}
        />
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <MenuSection
            dishes={dishes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            addToCart={addToCart}
            formatCFA={formatCFA}
            getImageUrl={getImageUrl}
          />
          <FloatingCart
            cart={cart}
            cartOpen={cartOpen}
            setCartOpen={setCartOpen}
            tables={tables}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            selectedTableNumber={selectedTableNumber}
            setSelectedTableNumber={setSelectedTableNumber}
            customerName={customerName}
            setCustomerName={setCustomerName}
            updateCartQuantity={updateCartQuantity}
            handleOrder={handleOrder}
            isSending={isSending}
            total={total}
            tableFromUrl={tableFromUrl}
            formatCFA={formatCFA}
          />
        </div>
      </div>
  )
}
