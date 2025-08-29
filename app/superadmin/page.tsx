"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { LogOut, Plus, Edit, Trash2, Users, Shield, Crown } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface User {
  id: number
  email: string
  role: "ADMIN" | "SUPERADMIN"
  createdAt: string
  lastLogin?: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL

export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "ADMIN" as "ADMIN" | "SUPERADMIN" })
  const [editUser, setEditUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch(`${baseUrl}/superadmin/users`, { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setError("Erreur lors du chargement des utilisateurs")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Erreur de connexion au serveur")
    }
  }

  // 🔹 Création
  const createUser = async () => {
    if (!newUser.email || !newUser.password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const endpoint =
        newUser.role === "SUPERADMIN"
          ? `${baseUrl}/superadmin/superadmins`
          : `${baseUrl}/superadmin/admins`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newUser.email, password: newUser.password }),
        credentials: "include",
      })

      if (response.ok) {
        setSuccess(`${newUser.role === "SUPERADMIN" ? "Super Admin" : "Admin"} créé avec succès`)
        setNewUser({ email: "", password: "", role: "ADMIN" })
        loadUsers()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Suppression
  const deleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return
    try {
      const response = await fetch(`${baseUrl}/superadmin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (response.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== userId))
        setSuccess("Utilisateur supprimé avec succès")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Erreur lors de la suppression")
    }
  }

  // 🔹 Modification
  const updateUser = async () => {
    if (!editUser) return
    try {
      const response = await fetch(`${baseUrl}/superadmin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editUser.email, role: editUser.role }),
        credentials: "include",
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers((prev) => prev.map((u) => (u.id === editUser.id ? updatedUser : u)))
        setSuccess("Utilisateur mis à jour avec succès")
        setEditUser(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Erreur lors de la mise à jour")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${baseUrl}/auth/logout`, { method: "POST", credentials: "include" })
      router.push("/login")
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
    }
  }

  const getRoleIcon = (role: string) => (role === "SUPERADMIN" ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />)
  const getRoleBadgeVariant = (role: string) => (role === "SUPERADMIN" ? "default" : "secondary")

  return (
    <ProtectedRoute requiredRole="SUPERADMIN">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Panneau Super Admin</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Déconnexion
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card><CardHeader><CardTitle>Total Utilisateurs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Admins</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter((u) => u.role === "ADMIN").length}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Super Admins</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter((u) => u.role === "SUPERADMIN").length}</div></CardContent></Card>
          </div>

          {/* Alerts */}
          {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="mb-6"><AlertDescription>{success}</AlertDescription></Alert>}

          {/* User Management */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
              {/* Create User */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Créer un utilisateur</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                    <DialogDescription>Créez un compte Admin ou Super Admin</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Email</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} /></div>
                    <div><Label>Mot de passe</Label><Input type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} /></div>
                    <div>
                      <Label>Rôle</Label>
                      <Select value={newUser.role} onValueChange={(v: "ADMIN" | "SUPERADMIN") => setNewUser((p) => ({ ...p, role: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={createUser} className="w-full" disabled={loading}>{loading ? "Création..." : "Créer l'utilisateur"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Users List */}
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">{getRoleIcon(user.role)} {user.email}</CardTitle>
                        <CardDescription>
                          Créé le {new Date(user.createdAt).toLocaleDateString()}
                          {user.lastLogin && ` • Dernière connexion: ${new Date(user.lastLogin).toLocaleDateString()}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role === "SUPERADMIN" ? "Super Admin" : "Admin"}</Badge>
                        <div className="flex gap-1">
                          {/* Modifier */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setEditUser(user)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            {editUser?.id === user.id && (
                              <DialogContent>
                                <DialogHeader><DialogTitle>Modifier utilisateur</DialogTitle></DialogHeader>
                                <div className="space-y-4">
                                  <div><Label>Email</Label><Input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} /></div>
                                  <div>
                                    <Label>Rôle</Label>
                                    <Select value={editUser.role} onValueChange={(v: "ADMIN" | "SUPERADMIN") => setEditUser({ ...editUser, role: v })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button onClick={updateUser} className="w-full">Enregistrer</Button>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                          {/* Supprimer */}
                          <Button size="sm" variant="outline" onClick={() => deleteUser(user.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {users.length === 0 && <Card><CardContent className="text-center py-8"><Users className="h-12 w-12 mx-auto mb-4" /><p>Aucun utilisateur trouvé</p></CardContent></Card>}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
