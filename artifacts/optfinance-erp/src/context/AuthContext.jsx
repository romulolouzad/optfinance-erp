import { createContext, useContext, useState } from 'react'
import { temPermissao } from '../utils/permissoes'
import { estadoInicial } from './auth-defaults'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(true)
  const [usuario, setUsuario] = useState({
    usuario: estadoInicial.usuario,
    email: estadoInicial.email,
    cargo: estadoInicial.cargo,
  })
  const [perfil, setPerfil] = useState(estadoInicial.perfil)

  function login(email, senha) {
    setAutenticado(true)
    setUsuario({
      usuario: email.split('@')[0],
      email,
      cargo: estadoInicial.cargo,
    })
    setPerfil('admin')
  }

  function logout() {
    setAutenticado(false)
    setUsuario(null)
    setPerfil('admin')
  }

  return (
    <AuthContext.Provider value={{
      autenticado,
      usuario: usuario ? { ...usuario, perfil } : null,
      perfil,
      setPerfil,
      login,
      logout,
      temPermissao: (recurso, acao) => temPermissao(perfil, recurso, acao),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { temPermissao }
