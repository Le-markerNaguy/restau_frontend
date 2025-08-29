"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link } from "lucide-react"

interface DishFormProps {
  dishId?: number // si présent = édition, sinon création
  initialData?: any
  onSubmit: (dishData: any) => void
  onClose: () => void
}

export function DishForm({ dishId, initialData, onSubmit, onClose }: DishFormProps) {
  const [dishData, setDishData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    available: true,
    imageUrl: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageMethod, setImageMethod] = useState<"url" | "upload">("url")

  // URLs depuis .env
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL // ton API gère déjà /uploads

  // Si édition : pré-remplir
  useEffect(() => {
    if (initialData) {
      setDishData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || 0,
        category: initialData.category || "",
        available: initialData.available ?? true,
        imageUrl: initialData.imageUrl || "",
      })
      if (initialData.imageUrl?.startsWith("http")) {
        setImageMethod("url")
      } else {
        setImageMethod("upload")
      }
    }
  }, [initialData])

  const handleSubmit = async () => {
    if (!dishData.name || !dishData.description || dishData.price <= 0 || !dishData.category) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      let response

      if (imageMethod === "upload" && imageFile) {
        // Cas fichier upload
        const formData = new FormData()
        formData.append("name", dishData.name)
        formData.append("description", dishData.description)
        formData.append("price", String(dishData.price))
        formData.append("category", dishData.category)
        formData.append("available", String(dishData.available))
        formData.append("image", imageFile)

        response = await fetch(
          dishId ? `${baseUrl}/api/dishes/${dishId}` : `${baseUrl}/api/dishes`,
          {
            method: dishId ? "PUT" : "POST",
            body: formData,
          }
        )
      } else {
        // Cas URL externe ou pas d’image
        response = await fetch(
          dishId ? `${baseUrl}/api/dishes/${dishId}` : `${baseUrl}/api/dishes`,
          {
            method: dishId ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dishData),
          }
        )
      }

      if (!response.ok) throw new Error("Erreur lors de l’enregistrement du plat")

      const savedDish = await response.json()
      onSubmit(savedDish)
      onClose()
    } catch (error) {
      console.error("Erreur DishForm:", error)
      alert("Impossible d’enregistrer le plat")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="dishName">Nom du plat *</Label>
        <Input
          id="dishName"
          value={dishData.name}
          onChange={(e) => setDishData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Pizza Margherita"
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={dishData.description}
          onChange={(e) => setDishData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Décrivez votre plat..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Prix (CFA) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={dishData.price || ""}
            onChange={(e) => setDishData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <Select
            value={dishData.category}
            onValueChange={(value) => setDishData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entree">Entrée</SelectItem>
              <SelectItem value="plat">Plat principal</SelectItem>
              <SelectItem value="pizza">Pizza</SelectItem>
              <SelectItem value="burger">Burger</SelectItem>
              <SelectItem value="salade">Salade</SelectItem>
              <SelectItem value="dessert">Dessert</SelectItem>
              <SelectItem value="boisson">Boisson</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Image du plat</Label>
        <Tabs value={imageMethod} onValueChange={(value) => setImageMethod(value as "url" | "upload")} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4">
            <Input
              value={dishData.imageUrl}
              onChange={(e) => setDishData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : "Cliquez pour sélectionner une image"}
                </p>
              </label>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          {dishId ? "Mettre à jour" : "Ajouter le plat"}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </div>
  )
}
