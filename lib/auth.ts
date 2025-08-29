// Authentication utilities for HTTP-only cookie authentication

export async function getCurrentUser() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    if (!baseUrl) {
      throw new Error("URL de l'API non configurée")
    }

    const response = await fetch(`${baseUrl}/auth/me`, {
      credentials: "include",
    })

    if (response.ok) {
      const data = await response.json()
      return data.user
    }
    
    if (response.status === 401) {
      // Utilisateur non authentifié
      return null
    }
    
    throw new Error(`Erreur ${response.status}: ${response.statusText}`)
  } catch (error) {
    console.error("Error getting current user:", error)
    throw error
  }
}

export async function logout() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    if (!baseUrl) {
      throw new Error("URL de l'API non configurée")
    }

    const response = await fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })

    if (response.ok) {
      // Rediriger vers la page de connexion
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      return true
    }
    
    throw new Error(`Erreur de déconnexion: ${response.status}`)
  } catch (error) {
    console.error("Error logging out:", error)
    throw error
  }
}

export function isAuthorized(userRole: string, requiredRoles: string[]) {
  return requiredRoles.includes(userRole)
}

export function hasPermission(userRole: string, requiredRole: string) {
  if (requiredRole === "SUPERADMIN") {
    return userRole === "SUPERADMIN"
  }
  
  if (requiredRole === "ADMIN") {
    return userRole === "ADMIN" || userRole === "SUPERADMIN"
  }
  
  return false
}

export function getRedirectPath(userRole: string) {
  switch (userRole) {
    case "SUPERADMIN":
      return "/superadmin"
    case "ADMIN":
      return "/admin"
    default:
      return "/login"
  }
}
