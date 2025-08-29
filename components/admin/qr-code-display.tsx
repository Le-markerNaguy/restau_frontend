"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, QrCode, ExternalLink } from "lucide-react"

interface QRCodeDisplayProps {
  tableNumber: number
  qrData?: string
  onDownload?: () => void
}

export function QRCodeDisplay({ 
  tableNumber, 
  qrData, 
  onDownload
}: QRCodeDisplayProps) {
  if (!qrData) {
    return (
      <Card className="border-dashed border-2 border-orange-300 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
            <QrCode className="h-4 w-4" />
            QR Code Table {tableNumber}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <QrCode className="h-12 w-12 text-orange-400 mx-auto mb-2" />
            <p className="text-sm text-orange-600">
              QR code non disponible
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Fonction pour ouvrir le QR code dans un nouvel onglet
  const openQRInNewTab = () => {
    if (qrData) {
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>QR Code Table ${tableNumber}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  background: #f5f5f5; 
                  font-family: Arial, sans-serif;
                  text-align: center;
                }
                .container {
                  background: white;
                  padding: 30px;
                  border-radius: 15px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  max-width: 500px;
                  margin: 0 auto;
                }
                h1 { color: #2563eb; margin-bottom: 20px; }
                img { 
                  max-width: 100%; 
                  height: auto; 
                  border: 3px solid #10b981;
                  border-radius: 10px;
                  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .info {
                  margin-top: 20px;
                  padding: 15px;
                  background: #f0f9ff;
                  border-radius: 8px;
                  border-left: 4px solid #2563eb;
                }
                .download-btn {
                  display: inline-block;
                  background: #10b981;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 8px;
                  text-decoration: none;
                  margin-top: 20px;
                  font-weight: bold;
                  transition: all 0.3s;
                }
                .download-btn:hover {
                  background: #059669;
                  transform: translateY(-2px);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🪑 QR Code Table ${tableNumber}</h1>
                <img src="${qrData}" alt="QR Code Table ${tableNumber}" />
                <div class="info">
                  <p><strong>Instructions :</strong></p>
                  <p>1. Clic droit sur l'image</p>
                  <p>2. Sélectionnez "Enregistrer l'image sous..."</p>
                  <p>3. Choisissez l'emplacement et enregistrez</p>
                </div>
                <a href="${qrData}" download="table-${tableNumber}-qr-code.png" class="download-btn">
                  📥 Télécharger Directement
                </a>
              </div>
            </body>
          </html>
        `)
        newWindow.document.close()
      }
    }
  }

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-green-700">
          <QrCode className="h-4 w-4 text-green-600" />
          QR Code Table {tableNumber}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {/* Affichage du QR code */}
          <div className="mb-4">
            <img
              src={qrData}
              alt={`QR Code Table ${tableNumber}`}
              className="w-32 h-32 object-contain mx-auto border-2 border-green-300 rounded-lg shadow-md bg-white p-2"
            />
          </div>
          
          {/* Informations */}
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2 bg-blue-100 text-blue-800 border-blue-300">
              Table {tableNumber}
            </Badge>
            <p className="text-xs text-gray-600">
              Scannez pour accéder au menu
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-2">
            {/* Bouton de téléchargement principal */}
            <Button
              onClick={onDownload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2 text-white" />
              📥 TÉLÉCHARGER QR CODE
            </Button>
            
            {/* Bouton alternatif - Ouvrir dans un nouvel onglet */}
            <Button
              onClick={openQRInNewTab}
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-green-700 border-green-300 hover:border-green-400 font-medium py-2 px-4 rounded-lg transition-all duration-200"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              🔗 Ouvrir dans un nouvel onglet
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 