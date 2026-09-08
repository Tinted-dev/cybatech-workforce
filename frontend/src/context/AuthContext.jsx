import { createContext, useContext, useState } from "react"
import apiClient from "../api/client"

const AuthContext = createContext(null)

function decodeToken(token) {
  const payload = token.split(".")[1]
  return JSON.parse(atob(payload))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return null
    try {
      return decodeToken(token)
    } catch {
      return null
    }
  })

  async function login(email, password) {
    const response = await apiClient.post("/auth/login", { email, password })
    const token = response.data.access_token
    localStorage.setItem("access_token", token)
    setUser(decodeToken(token))
  }

  function logout() {
    localStorage.removeItem("access_token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
