"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, ChefHat } from "lucide-react"

interface Dish {
  id: number
  name: string
  description: string
  price: number
  category: string
  available: boolean
  imageUrl?: string
}

export function DishesManager() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    price: string
    category: string
    available: boolean
    imageUrl: string
    imageFile: File | null
    previewUrl: string
  }>({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
    imageUrl: "",
    imageFile: null,
    previewUrl: "",
  })

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || ""

  useEffect(() => {
    fetchDishes()
  }, [])

  const fetchDishes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/dishes`, { credentials: "include" })
      const data = await res.json()
      setDishes(data.dishes || data)
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingDish(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      available: true,
      imageUrl: "",
      imageFile: null,
      previewUrl: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish)
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      category: dish.category,
      available: dish.available,
      imageUrl: dish.imageUrl || "",
      imageFile: null,
      previewUrl: dish.imageUrl
        ? dish.imageUrl.startsWith("http")
          ? dish.imageUrl
          : `${imageBaseUrl}${dish.imageUrl}`
        : "",
    })
    setIsDialogOpen(true)
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({
        ...formData,
        imageFile: file,
        previewUrl: URL.createObjectURL(file),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const url = editingDish ? `${baseUrl}/dishes/${editingDish.id}` : `${baseUrl}/dishes`
      const method = editingDish ? "PATCH" : "POST"

      const payload = new FormData()
      payload.append("name", formData.name)
      payload.append("description", formData.description)
      payload.append("price", formData.price)
      payload.append("category", formData.category)
      payload.append("available", String(formData.available))
      if (formData.imageFile) payload.append("image", formData.imageFile)
      else if (formData.imageUrl) payload.append("imageUrl", formData.imageUrl)

      const res = await fetch(url, { method, body: payload, credentials: "include" })
      if (res.ok) {
        await fetchDishes()
        setIsDialogOpen(false)
      } else {
        const data = await res.json()
        setError(data.error || "Erreur lors de la sauvegarde")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce plat ?")) return
    try {
      const res = await fetch(`${baseUrl}/dishes/${id}`, { method: "DELETE", credentials: "include" })
      if (res.ok) await fetchDishes()
      else setError("Erreur lors de la suppression")
    } catch {
      setError("Erreur serveur")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Plats</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter un plat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDish ? "Modifier le plat" : "Ajouter un plat"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Nom</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Prix (CFA)</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required className="w-full border rounded px-2 py-1">
                    <option value="">Sélectionner</option>
                    <option value="ENTREE">Entrée</option>
                    <option value="PLAT">Plat</option>
                    <option value="DESSERT">Dessert</option>
                    <option value="BOISSON">Boisson</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {formData.previewUrl && <img src={formData.previewUrl} className="mt-2 max-h-32 rounded" />}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.available} onChange={e => setFormData({ ...formData, available: e.target.checked })} />
                <Label>Disponible</Label>
              </div>
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full">{loading ? "Sauvegarde..." : editingDish ? "Modifier" : "Ajouter"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dishes.map(d => (
          <Card key={d.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" /> {d.name}
                </CardTitle>
                <Badge variant={d.available ? "default" : "secondary"}>
                  {d.available ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
              <CardDescription>{d.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {d.imageUrl && (
                <img
                  src={d.imageUrl.startsWith("http") ? d.imageUrl : `${imageBaseUrl}${d.imageUrl}`}
                  alt={d.name}
                  className="max-h-32 w-full object-contain rounded mb-2"
                />
              )}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{d.price} CFA</p>
                  <p className="text-sm text-muted-foreground">{d.category}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(d)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
