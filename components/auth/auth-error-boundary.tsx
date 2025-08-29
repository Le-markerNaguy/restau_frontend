"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleLogout = () => {
    // Rediriger vers la page de connexion
    window.location.href = "/login"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-destructive mb-2">
                Erreur d'authentification
              </h1>
              <p className="text-muted-foreground mb-6">
                Une erreur s'est produite lors de la vérification de l'authentification.
              </p>
            </div>

            <Alert className="mb-6 text-left">
              <AlertDescription>
                {this.state.error?.message || "Erreur inconnue"}
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button onClick={this.handleLogout} variant="destructive">
                Se reconnecter
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 