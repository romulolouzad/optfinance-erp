import { Switch, Route, Router as WouterRouter } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from './context/AuthContext'
import { CentroCustoProvider } from './context/CentroCustoContext'
import PrivateRoute from './routes/PrivateRoute'

import LoginPage from './pages/Login/index.jsx'
import DashboardPage from './pages/Dashboard/index.jsx'
import FluxoDeCaixaPage from './pages/FluxoDeCaixa/index.jsx'
import VendasPage from './pages/Vendas/index.jsx'
import NovaVendaPage from './pages/Vendas/NovaVenda.jsx'
import DetalheVendaPage from './pages/Vendas/DetalheVenda.jsx'
import ParcelasPage from './pages/Parcelas/index.jsx'
import ComissoesPage from './pages/Comissoes/index.jsx'
import ClientesPage from './pages/Clientes/index.jsx'
import NovoClientePage from './pages/Clientes/NovoCliente.jsx'
import ColaboradoresPage from './pages/Colaboradores/index.jsx'
import NovoColaboradorPage from './pages/Colaboradores/NovoColaborador.jsx'
import FornecedoresPage from './pages/Fornecedores/index.jsx'
import NovoFornecedorPage from './pages/Fornecedores/NovoFornecedor.jsx'
import NotasFiscaisPage from './pages/NotasFiscais/index.jsx'
import DrePage from './pages/DRE/index.jsx'
import ForecastPage from './pages/Forecast/index.jsx'
import MetasPage from './pages/Metas/index.jsx'
import DespesasPage from './pages/Despesas/index.jsx'
import EmprestimosPage from './pages/Emprestimos/index.jsx'
import ContasFinanceirasPage from './pages/ContasFinanceiras/index.jsx'
import NovaContaPage from './pages/ContasFinanceiras/NovaConta.jsx'
import ConciliacaoPage from './pages/ContasFinanceiras/Conciliacao/index.jsx'
import RelatoriosPage from './pages/Relatorios/index.jsx'
import BudgetPage from './pages/Budget/index.jsx'
import HistoricoPage from './pages/Historico/index.jsx'
import ConfiguracoesPage from './pages/Configuracoes/index.jsx'
import CartaoCorporativoPage from './pages/CartaoCorporativo/index.jsx'

const queryClient = new QueryClient()

type PageComp = React.ComponentType

function pr(component: PageComp, recurso?: string) {
  return () => <PrivateRoute component={component} recurso={recurso} />
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/"                       component={pr(DashboardPage, 'dashboard')} />
      <Route path="/dashboard"              component={pr(DashboardPage, 'dashboard')} />
      <Route path="/vendas"                 component={pr(VendasPage, 'vendas')} />
      <Route path="/vendas/nova"            component={pr(NovaVendaPage, 'vendas')} />
      <Route path="/vendas/:id"             component={pr(DetalheVendaPage, 'vendas')} />
      <Route path="/parcelas"               component={pr(ParcelasPage, 'parcelas')} />
      <Route path="/comissoes"              component={pr(ComissoesPage, 'comissoes')} />
      <Route path="/clientes/novo"           component={pr(NovoClientePage, 'clientes')} />
      <Route path="/clientes"               component={pr(ClientesPage, 'clientes')} />
      <Route path="/colaboradores/novo"      component={pr(NovoColaboradorPage, 'colaboradores')} />
      <Route path="/colaboradores"          component={pr(ColaboradoresPage, 'colaboradores')} />
      <Route path="/fornecedores/novo"       component={pr(NovoFornecedorPage, 'fornecedores')} />
      <Route path="/fornecedores"           component={pr(FornecedoresPage, 'fornecedores')} />
      <Route path="/notas-fiscais"          component={pr(NotasFiscaisPage, 'notas-fiscais')} />
      <Route path="/dre"                    component={pr(DrePage, 'dre')} />
      <Route path="/forecast"              component={pr(ForecastPage, 'forecast')} />
      <Route path="/metas"                  component={pr(MetasPage, 'metas')} />
      <Route path="/fluxo-de-caixa"         component={pr(FluxoDeCaixaPage, 'fluxo-de-caixa')} />
      <Route path="/despesas"               component={pr(DespesasPage, 'despesas')} />
      <Route path="/emprestimos"            component={pr(EmprestimosPage, 'emprestimos')} />
      <Route path="/contas-financeiras"            component={pr(ContasFinanceirasPage, 'contas-financeiras')} />
      <Route path="/contas-financeiras/nova"       component={pr(NovaContaPage, 'contas-financeiras')} />
      <Route path="/contas-financeiras/conciliacao" component={pr(ConciliacaoPage, 'contas-financeiras')} />
      <Route path="/relatorios"             component={pr(RelatoriosPage, 'relatorios')} />
      <Route path="/budget"                 component={pr(BudgetPage, 'budget')} />
      <Route path="/historico"              component={pr(HistoricoPage, 'historico')} />
      <Route path="/configuracoes"          component={pr(ConfiguracoesPage, 'configuracoes')} />
      <Route path="/cartao-corporativo"     component={pr(CartaoCorporativoPage, 'cartao-corporativo')} />
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
