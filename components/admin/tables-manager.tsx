"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Table as TableIcon, QrCode } from "lucide-react"
import { QRCodeDisplay } from "./qr-code-display"

type OrderStatus = "PENDING" | "PREPARING" | "READY" | "DELIVERED"

interface Table {
  id: number
  number: number
  qrData?: string
  currentOrder?: {
    id: number
    totalAmount: number
    createdAt: string
    status: OrderStatus
  }
}

export function TablesManager() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState({ number: "" })

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch(`${baseUrl}/tables`, { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setTables(data.tables || data)
      } else {
        setError("Erreur lors du chargement des tables")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = editingTable
        ? `${baseUrl}/tables/${editingTable.id}`
        : `${baseUrl}/tables`
      const method = editingTable ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: parseInt(formData.number) }),
        credentials: "include",
      })

      if (response.ok) {
        await fetchTables()
        setIsDialogOpen(false)
        setEditingTable(null)
        setFormData({ number: "" })
      } else {
        const data = await response.json()
        setError(data.error || "Erreur lors de la sauvegarde")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setFormData({ number: table.number.toString() })
    setIsDialogOpen(true)
  }

  const handleDelete = async (tableId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette table ?")) return
    try {
      const response = await fetch(`${baseUrl}/tables/${tableId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (response.ok) await fetchTables()
      else setError("Erreur lors de la suppression")
    } catch {
      setError("Erreur de connexion au serveur")
    }
  }

  const openCreateDialog = () => {
    setEditingTable(null)
    setFormData({ number: "" })
    setIsDialogOpen(true)
  }

  const downloadQRCode = async (table: Table) => {
    try {
      if (!table.qrData) {
        setError("QR code non disponible pour cette table")
        return
      }

      if (table.qrData.startsWith("data:image/")) {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement("a")
              link.href = url
              link.download = `table-${table.number}-qr-code.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            } else setError("Erreur lors de la création du fichier")
          }, "image/png")
        }
        img.onerror = () => setError("Erreur lors du chargement de l'image")
        img.src = table.qrData
      } else {
        const link = document.createElement("a")
        link.href = table.qrData
        link.download = `table-${table.number}-qr-code.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch {
      setError("Erreur lors du téléchargement du QR code")
    }
  }

  const activeOrders = tables.filter(
    (t) => t.currentOrder && t.currentOrder.status !== "DELIVERED"
  )

  if (loading && tables.length === 0)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )

  return (
    <div className="space-y-6">
      {/* Header & Dialog */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Tables</h1>
          <p className="text-muted-foreground mt-2">
            Gérez la disposition de vos tables et téléchargez leurs QR codes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter une table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? "Modifier la table" : "Ajouter une nouvelle table"}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">Configurez le numéro de la table</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="number">Numéro de table</Label>
                <Input
                  id="number"
                  type="number"
                  min="1"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sauvegarde..." : editingTable ? "Modifier" : "Ajouter"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avec commandes</CardTitle>
            <QrCode className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tables.filter((t) => t.qrData).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grille des tables */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <Card key={table.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-primary" />
                  Table {table.number} (ID: {table.id})
                </CardTitle>
                {table.currentOrder && table.currentOrder.status !== "DELIVERED" && (
                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                    <QrCode className="h-4 w-4" /> Commande active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <QRCodeDisplay
                tableNumber={table.number}
                qrData={table.qrData}
                onDownload={() => downloadQRCode(table)}
              />

              {table.currentOrder && table.currentOrder.status !== "DELIVERED" && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Commande en cours</h4>
                  <div className="text-sm space-y-1">
                    <div>Commande #{table.currentOrder.id}</div>
                    <div className="text-muted-foreground">
                      {new Date(table.currentOrder.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="font-medium text-primary">
                      {table.currentOrder.totalAmount} CFA
                    </div>
                    <Badge className="bg-blue-200 text-blue-900">{table.currentOrder.status}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="absolute top-2 right-2 flex gap-1">
              <Button variant="outline" size="icon" onClick={() => handleEdit(table)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleDelete(table.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
