import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Dish {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
  available: boolean
}

interface DishCardProps {
  dish: Dish
  formatCFA: (amount: number) => string
  getImageUrl: (url?: string) => string
  addToCart: (dish: Dish) => void
}

export default function DishCard({ dish, formatCFA, getImageUrl, addToCart }: DishCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
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
  )
}