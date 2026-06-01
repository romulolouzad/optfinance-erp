import { useState } from 'react'
import { useLocation } from 'wouter'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const BREADCRUMBS = {
  '/':                    ['OptFinance', 'Dashboard'],
  '/fluxo-de-caixa':      ['OptFinance', 'Fluxo de Caixa'],
  '/vendas':              ['OptFinance', 'Vendas'],
  '/parcelas':            ['OptFinance', 'Parcelas'],
  '/comissoes':           ['OptFinance', 'Comissões'],
  '/clientes':            ['OptFinance', 'Clientes'],
  '/colaboradores':       ['OptFinance', 'Colaboradores'],
  '/fornecedores':        ['OptFinance', 'Fornecedores'],
  '/notas-fiscais':       ['OptFinance', 'Notas Fiscais'],
  '/dre':                 ['OptFinance', 'DRE'],
  '/forecast':            ['OptFinance', 'Forecast'],
  '/metas':               ['OptFinance', 'Metas'],
  '/despesas':            ['OptFinance', 'Despesas'],
  '/emprestimos':         ['OptFinance', 'Empréstimos'],
  '/contas-financeiras':  ['OptFinance', 'Contas Financeiras'],
  '/relatorios':          ['OptFinance', 'Relatórios'],
  '/budget':              ['OptFinance', 'Budget'],
  '/historico':           ['OptFinance', 'Histórico'],
  '/configuracoes':       ['OptFinance', 'Configurações'],
}

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [location] = useLocation()

  const breadcrumb = BREADCRUMBS[location] || ['OptFinance']

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
