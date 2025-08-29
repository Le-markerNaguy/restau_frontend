"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Crown, Shield } from "lucide-react"

interface UserData {
  id: number
  email: string
  role: "ADMIN" | "SUPERADMIN"
}

interface UserManagerProps {
  user: any
}

export function UserManager({ user }: UserManagerProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "ADMIN" as "ADMIN" | "SUPERADMIN",
  })

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  // ✅ Charger les utilisateurs depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(`${baseUrl}/superadmin/users`, {
          method: "GET",
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || data) // data doit être un tableau [{id, email, role}, ...]
        } else {
          const err = await response.json()
          setError(err.error || "Impossible de charger les utilisateurs")
        }
      } catch (err) {
        setError("Erreur de connexion au serveur")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [baseUrl])

  // ✅ Création d'un utilisateur
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const endpoint = `${baseUrl}${
        formData.role === "SUPERADMIN" ? "/superadmin/superadmins" : "/superadmin/admins"
      }`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (response.ok) {
        const newUser = await response.json()
        setUsers((prev) => [...prev, newUser])
        setIsDialogOpen(false)
        setFormData({ email: "", password: "", role: "ADMIN" })
      } else {
        const data = await response.json()
        setError(data.error || "Erreur lors de la création de l'utilisateur")
      }
    } catch (error) {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  // Utils role
  const getRoleIcon = (role: string) => (role === "SUPERADMIN" ? Crown : Shield)
  const getRoleColor = (role: string) => (role === "SUPERADMIN" ? "bg-purple-500" : "bg-blue-500")
  const getRoleLabel = (role: string) => (role === "SUPERADMIN" ? "Super Admin" : "Administrateur")

  // ✅ Restriction
  if (user?.role !== "SUPERADMIN") {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
            <p className="text-muted-foreground text-center">
              Seuls les super administrateurs peuvent gérer les utilisateurs
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ✅ Loader
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">Gérez les administrateurs et super administrateurs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>Ajoutez un administrateur ou super administrateur</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "ADMIN" | "SUPERADMIN") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                    <SelectItem value="SUPERADMIN">Super Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création..." : "Créer l'utilisateur"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ✅ Liste des utilisateurs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((userData) => {
          const RoleIcon = getRoleIcon(userData.role)
          return (
            <Card key={userData.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <RoleIcon className="h-4 w-4" />
                    {userData.email}
                  </CardTitle>
                  <Badge className={getRoleColor(userData.role)}>{getRoleLabel(userData.role)}</Badge>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {users.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun utilisateur créé</h3>
            <p className="text-muted-foreground text-center mb-4">Commencez par ajouter des administrateurs</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre premier utilisateur
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ✅ Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Super Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {users.filter((u) => u.role === "SUPERADMIN").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Administrateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{users.filter((u) => u.role === "ADMIN").length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 