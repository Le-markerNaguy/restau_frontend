interface CategorySelectorProps {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
}

export default function CategorySelector({ categories, selectedCategory, setSelectedCategory }: CategorySelectorProps) {
  return (
    <select
      value={selectedCategory}
      onChange={e => setSelectedCategory(e.target.value)}
      className="border rounded px-2 py-1"
    >
      {categories.map(cat => (
        <option key={cat} value={cat}>
          {cat === "all" ? "Tous" : cat}
        </option>
      ))}
    </select>
  )
}