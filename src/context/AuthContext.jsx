import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const loginMiembro = async (correo, password) => {
  const res = await authService.loginMiembro({ correo, password })
  const { token, cargo, nombreCompleto, documento } = res.data
  localStorage.setItem('token',     token)
  localStorage.setItem('cargo',     cargo)
  localStorage.setItem('correo',    correo)
  localStorage.setItem('nombre',    nombreCompleto)
  localStorage.setItem('documento', documento)
  setUser({ token, cargo, correo, nombre: nombreCompleto, documento })
  return cargo
}

  useEffect(() => {
  const token     = localStorage.getItem('token')
  const cargo     = localStorage.getItem('cargo')
  const correo    = localStorage.getItem('correo')
  const nombre    = localStorage.getItem('nombre')
  const documento = localStorage.getItem('documento')
  if (token) setUser({ token, cargo, correo, nombre, documento })
  setLoading(false)
}, [])

  const login = async (correo, password) => {
    const res = await authService.login({ correo, password })
    const { token, cargo, nombreCompleto } = res.data
    localStorage.setItem('token',  token)
    localStorage.setItem('cargo',  cargo)
    localStorage.setItem('correo', correo)
    localStorage.setItem('nombre', nombreCompleto)
    setUser({ token, cargo, correo, nombre: nombreCompleto })
    return cargo
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  const isAdmin        = () => user?.cargo === 'administrador'
  const isRecepcionista= () => user?.cargo === 'recepcionista'
  const isInstructor   = () => user?.cargo === 'instructor'
  const isTecnico      = () => user?.cargo === 'tecnico_mantenimiento'
  const hasRole        = (...roles) => roles.includes(user?.cargo)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loginMiembro, isAdmin, isRecepcionista, isInstructor, isTecnico, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)