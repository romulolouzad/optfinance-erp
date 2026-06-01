import { useLocation } from 'wouter'
import { useAuth } from '../context/AuthContext'
import NoPermissionState from '../components/shared/NoPermissionState'
import AppShell from '../components/layout/AppShell'

export default function PrivateRoute({ component: Component, recurso, acao = 'visualizar' }) {
  const { autenticado, temPermissao, perfil } = useAuth()
  const [, setLocation] = useLocation()

  if (!autenticado) {
    setLocation('/login')
    return null
  }

  const hasPermission = recurso ? temPermissao(recurso, acao) : true

  return (
    <AppShell>
      {hasPermission ? (
        <Component />
      ) : (
        <NoPermissionState
          message={`Seu perfil atual (${perfil}) não tem acesso a este módulo. Solicite ao administrador a permissão necessária.`}
        />
      )}
    </AppShell>
  )
}
