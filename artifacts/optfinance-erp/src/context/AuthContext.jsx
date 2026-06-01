import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(false)
  const [usuario, setUsuario] = useState(null)

  function login(email, senha) {
    setAutenticado(true)
    setUsuario({
      usuario: email.split('@')[0],
      email,
      perfil: 'admin',
      cargo: 'Finance Director',
    })
  }

  function logout() {
    setAutenticado(false)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ autenticado, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
