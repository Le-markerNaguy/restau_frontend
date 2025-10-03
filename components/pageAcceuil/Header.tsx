import { Button } from "@/components/ui/button"

interface HeaderProps {
  showAdmin: boolean
  onTitleClick: () => void
  onAdminClick: () => void
}

export default function Header({ showAdmin, onTitleClick, onAdminClick }: HeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-primary cursor-pointer"
          onClick={onTitleClick}
        >
          RestauOpti
        </h1>
        {showAdmin && (
          <Button variant="ghost" size="sm" onClick={onAdminClick}>
            Admin
          </Button>
        )}
      </div>
    </header>
  )
}