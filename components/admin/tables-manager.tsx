"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Users, Table, QrCode, Download } from "lucide-react"
import { QRCodeDisplay } from "./qr-code-display"

interface Table {
  id: number
  number: number
  qrData?: string
  currentOrder?: {
    id: number
    totalAmount: number
    createdAt: string
  }
}

export function TablesManager() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState({
    number: "",
  })

  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch(`${baseUrl}/tables`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setTables(data.tables || data)
      } else {
        setError("Erreur lors du chargement des tables")
      }
    } catch (error) {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: parseInt(formData.number),
        }),
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
    } catch (error) {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setFormData({
      number: table.number.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (tableId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette table ?")) return

    try {
      const response = await fetch(`${baseUrl}/tables/${tableId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        await fetchTables()
      } else {
        setError("Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Erreur de connexion au serveur")
    }
  }

  const openCreateDialog = () => {
    setEditingTable(null)
    setFormData({ number: "" })
    setIsDialogOpen(true)
  }

  // Fonction pour télécharger le QR code
  const downloadQRCode = async (table: Table) => {
    try {
      console.log("Tentative de téléchargement pour la table:", table.number)
      console.log("QR Data disponible:", !!table.qrData)
      
      if (!table.qrData) {
        setError("QR code non disponible pour cette table")
        return
      }

      // Vérifier si c'est une Data URL
      if (table.qrData.startsWith('data:image/')) {
        console.log("QR code détecté comme Data URL")
        
        // Créer un canvas pour convertir le Data URL en blob
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `table-${table.number}-qr-code.png`
              link.style.display = 'none'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
              console.log("Téléchargement réussi!")
            } else {
              setError("Erreur lors de la création du fichier")
            }
          }, 'image/png')
        }
        
        img.onerror = () => {
          setError("Erreur lors du chargement de l'image")
        }
        
        img.src = table.qrData
      } else {
        console.log("QR code détecté comme URL normale")
        // Méthode alternative pour les URLs normales
        const link = document.createElement('a')
        link.href = table.qrData
        link.download = `table-${table.number}-qr-code.png`
        link.target = '_blank'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log("Téléchargement réussi!")
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      setError("Erreur lors du téléchargement du QR code")
    }
  }

  if (loading && tables.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground">Gestion des Tables</h1>
          <p className="text-muted-foreground mt-2">Gérez la disposition de vos tables et téléchargez leurs QR codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTable ? "Modifier la table" : "Ajouter une nouvelle table"}</DialogTitle>
              <DialogDescription>Configurez le numéro de la table</DialogDescription>
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold text-blue-600">
              {tables.filter(t => t.currentOrder).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tables.filter(t => t.qrData).length}
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
                  <Table className="h-4 w-4 text-primary" />
                  Table {table.number}
                </CardTitle>
                {table.currentOrder && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <span className="flex items-center gap-1">
                      <QrCode className="h-4 w-4" />
                      Commande active
                    </span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Composant QR Code */}
              <QRCodeDisplay
                tableNumber={table.number}
                qrData={table.qrData}
                onDownload={() => downloadQRCode(table)}
              />

              {/* Commande en cours */}
              {table.currentOrder && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Commande en cours</h4>
                  <div className="text-sm space-y-1">
                    <div>Commande #{table.currentOrder.id}</div>
                    <div className="text-muted-foreground">
                      {new Date(table.currentOrder.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="font-medium text-primary">
                      {table.currentOrder.totalAmount}€
                    </div>
                  </div>
                </div>
              )}

              {/* Actions de gestion */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(table)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(table.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Table className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune table configurée</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par ajouter des tables à votre restaurant
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre première table
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 