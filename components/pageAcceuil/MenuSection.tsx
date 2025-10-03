import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import DishCard from "./DishCard"
import CategorySelector from "./CategorySelector"

interface Dish {
  id: number
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
  available: boolean
}

interface MenuSectionProps {
  dishes: Dish[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  addToCart: (dish: Dish) => void
  formatCFA: (amount: number) => string
  getImageUrl: (url?: string) => string
}

export default function MenuSection({
  dishes,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  formatCFA,
  getImageUrl,
}: MenuSectionProps) {
  const categories = ["all", ...new Set(dishes.map(d => d.category))]
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="lg:col-span-3">
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"/>
          <Input
            placeholder="Rechercher un plat..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDishes.map(dish => (
          <DishCard
            key={dish.id}
            dish={dish}
            formatCFA={formatCFA}
            getImageUrl={getImageUrl}
            addToCart={addToCart}
          />
        ))}
      </div>
    </div>
  )
}