import { Switch, Route, Router as WouterRouter, useLocation } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CentroCustoProvider } from './context/CentroCustoContext'

// Pages
import LoginPage from './pages/Login/index.jsx'
import DashboardPage from './pages/Dashboard/index.jsx'
import FluxoDeCaixaPage from './pages/FluxoDeCaixa/index.jsx'
import VendasPage from './pages/Vendas/index.jsx'
import ParcelasPage from './pages/Parcelas/index.jsx'
import ComissoesPage from './pages/Comissoes/index.jsx'
import ClientesPage from './pages/Clientes/index.jsx'
import ColaboradoresPage from './pages/Colaboradores/index.jsx'
import FornecedoresPage from './pages/Fornecedores/index.jsx'
import NotasFiscaisPage from './pages/NotasFiscais/index.jsx'
import DrePage from './pages/DRE/index.jsx'
import ForecastPage from './pages/Forecast/index.jsx'
import MetasPage from './pages/Metas/index.jsx'
import DespesasPage from './pages/Despesas/index.jsx'
import EmprestimosPage from './pages/Emprestimos/index.jsx'
import ContasFinanceirasPage from './pages/ContasFinanceiras/index.jsx'
import RelatoriosPage from './pages/Relatorios/index.jsx'
import BudgetPage from './pages/Budget/index.jsx'
import HistoricoPage from './pages/Historico/index.jsx'
import ConfiguracoesPage from './pages/Configuracoes/index.jsx'
import SemPermissaoPage from './pages/SemPermissao/index.jsx'
import AppShell from './components/layout/AppShell.jsx'

const queryClient = new QueryClient()

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { autenticado } = useAuth()
  const [, setLocation] = useLocation()

  if (!autenticado) {
    setLocation('/login')
    return null
  }

  return (
    <AppShell>
      <Component />
    </AppShell>
  )
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/" component={() => <PrivateRoute component={DashboardPage} />} />
      <Route path="/fluxo-de-caixa" component={() => <PrivateRoute component={FluxoDeCaixaPage} />} />
      <Route path="/vendas" component={() => <PrivateRoute component={VendasPage} />} />
      <Route path="/vendas/nova" component={() => <PrivateRoute component={VendasPage} />} />
      <Route path="/vendas/:id" component={() => <PrivateRoute component={VendasPage} />} />
      <Route path="/parcelas" component={() => <PrivateRoute component={ParcelasPage} />} />
      <Route path="/comissoes" component={() => <PrivateRoute component={ComissoesPage} />} />
      <Route path="/clientes" component={() => <PrivateRoute component={ClientesPage} />} />
      <Route path="/colaboradores" component={() => <PrivateRoute component={ColaboradoresPage} />} />
      <Route path="/fornecedores" component={() => <PrivateRoute component={FornecedoresPage} />} />
      <Route path="/notas-fiscais" component={() => <PrivateRoute component={NotasFiscaisPage} />} />
      <Route path="/dre" component={() => <PrivateRoute component={DrePage} />} />
      <Route path="/forecast" component={() => <PrivateRoute component={ForecastPage} />} />
      <Route path="/metas" component={() => <PrivateRoute component={MetasPage} />} />
      <Route path="/despesas" component={() => <PrivateRoute component={DespesasPage} />} />
      <Route path="/emprestimos" component={() => <PrivateRoute component={EmprestimosPage} />} />
      <Route path="/contas-financeiras" component={() => <PrivateRoute component={ContasFinanceirasPage} />} />
      <Route path="/contas-financeiras/nova" component={() => <PrivateRoute component={ContasFinanceirasPage} />} />
      <Route path="/relatorios" component={() => <PrivateRoute component={RelatoriosPage} />} />
      <Route path="/budget" component={() => <PrivateRoute component={BudgetPage} />} />
      <Route path="/historico" component={() => <PrivateRoute component={HistoricoPage} />} />
      <Route path="/configuracoes" component={() => <PrivateRoute component={ConfiguracoesPage} />} />
      <Route path="/sem-permissao" component={SemPermissaoPage} />
    </Switch>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CentroCustoProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </CentroCustoProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
