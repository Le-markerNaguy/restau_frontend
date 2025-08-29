"use client"

import { Button } from "@/components/ui/button"
import { 
  Home, 
  Utensils, 
  Clock, 
  Table, 
  Users, 
  LogOut, 
  Settings,
  Shield
} from "lucide-react"

interface AdminSidebarProps {
  user: any
  activeView: string
  onViewChange: (view: string) => void
  onLogout: () => void
}

export function AdminSidebar({ user, activeView, onViewChange, onLogout }: AdminSidebarProps) {
  const menuItems = [
    {
      id: "home",
      label: "Tableau de bord",
      icon: Home,
      description: "Vue d'ensemble"
    },
    {
      id: "dishes",
      label: "Gestion des plats",
      icon: Utensils,
      description: "Menu et plats"
    },
    {
      id: "orders",
      label: "Commandes",
      icon: Clock,
      description: "Suivi des commandes"
    },
    {
      id: "tables",
      label: "Tables",
      icon: Table,
      description: "Gestion des tables"
    }
  ]

  // Ajouter la gestion des utilisateurs si c'est un super admin
  if (user?.role === "SUPERADMIN") {
    menuItems.push({
      id: "users",
      label: "Utilisateurs",
      icon: Users,
      description: "Gestion des admins"
    })
  }

  return (
    <div className="w-64 bg-card border-r min-h-screen">
      {/* En-tête */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Administration</h2>
            <p className="text-sm text-muted-foreground">
              {user?.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
            </p>
          </div>
        </div>
        
        <div className="text-sm">
          <p className="font-medium">{user?.email}</p>
          <p className="text-muted-foreground">
            {user?.role === "SUPERADMIN" ? "Accès complet" : "Accès limité"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-3 ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </nav>

      {/* Actions */}
      <div className="p-4 border-t mt-auto">
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => onViewChange("settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  )
} 