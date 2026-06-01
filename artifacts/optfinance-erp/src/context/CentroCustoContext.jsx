import { createContext, useContext, useState } from 'react'
import centrosCusto from '../data/centros-custo.json'

const CentroCustoContext = createContext(null)

export function CentroCustoProvider({ children }) {
  const [centroCustoAtivo, setCentroCustoAtivo] = useState(null)

  const centros = centrosCusto.filter(c => c.ativo)

  return (
    <CentroCustoContext.Provider value={{ centros, centroCustoAtivo, setCentroCustoAtivo }}>
      {children}
    </CentroCustoContext.Provider>
  )
}

export function useCentroCusto() {
  const ctx = useContext(CentroCustoContext)
  if (!ctx) throw new Error('useCentroCusto must be used within CentroCustoProvider')
  return ctx
}
