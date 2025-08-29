"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface QRDownloadProps {
  tableNumber: number
  qrCodeUrl: string
}

export function QRDownload({ tableNumber, qrCodeUrl }: QRDownloadProps) {
  const [downloading, setDownloading] = useState(false)

  const downloadQRCode = async () => {
    setDownloading(true)

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `table-${tableNumber}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "QR Code téléchargé",
        description: `Le QR code de la table ${tableNumber} a été téléchargé.`,
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le QR code.",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={downloadQRCode}
      disabled={downloading}
      className="flex items-center space-x-2 bg-transparent"
    >
      {downloading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>{downloading ? "Téléchargement..." : "QR Code"}</span>
    </Button>
  )
}
