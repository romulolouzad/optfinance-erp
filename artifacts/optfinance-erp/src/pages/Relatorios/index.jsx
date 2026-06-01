import { useState, useMemo } from 'react'
import { useLocation } from 'wouter'
import {
  BarChart2, TrendingUp, Target, Receipt, FileText, TrendingDown,
  Settings2, Download, Search, Plus, X, Bell, CheckCircle,
  Mail, ChevronDown, Clock, AlertTriangle, Info
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import PrintHeader from '../../components/shared/PrintHeader'
import SlidePanel from '../../components/shared/SlidePanel'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../context/AuthContext'
import {
  vendas, parcelas, comissoes, colaboradores, centrosCusto
} from '../../data/index'
import { detectDuplicatas } from '../../data/vendas-store'
import { registrarHistorico } from '../../data/historico-store'
import { cn } from '../../utils/cn'

const RELATORIOS = [
  {
    id: 'dre',
    recurso: 'dre',
    titulo: 'DRE Gerencial',
    descricao: 'Visão executiva de lucros e perdas do período atual.',
    icon: BarChart2,
    formato: 'PDF',
    href: '/dre',
  },
  {
    id: 'fluxo',
    recurso: 'fluxo-de-caixa',
    titulo: 'Fluxo de Caixa',
    descricao: 'Movimentação diária de entradas e saídas previstas.',
    icon: TrendingUp,
    formato: 'CSV',
    href: '/fluxo-de-caixa',
  },
  {
    id: 'metas',
    recurso: 'metas',
    titulo: 'Metas vs Realizado',
    descricao: 'Comparativo de performance comercial por equipe.',
    icon: Target,
    formato: 'PDF',
    href: '/metas',
  },
  {
    id: 'comissoes',
    recurso: 'comissoes',
    titulo: 'Comissões Detalhadas',
    descricao: 'Extrato detalhado de comissões por vendedor/venda.',
    icon: Receipt,
    formato: 'CSV',
    href: '/comissoes',
  },
  {
    id: 'parcelas',
    recurso: 'parcelas',
    titulo: 'Parcelas em Aberto',
    descricao: 'Listagem de recebíveis vencidos e vincendos.',
    icon: FileText,
    formato: 'PDF',
    href: '/parcelas',
  },
  {
    id: 'forecast',
    recurso: 'forecast',
    titulo: 'Forecast Detalhado',
    descricao: 'Projeção de faturamento baseada no pipeline atual.',
    icon: TrendingDown,
    formato: 'PDF',
    href: '/forecast',
  },
]

const FREQUENCIAS = ['Mensal', 'Semanal', 'Diária']

function useAlerts() {
  const comissoesBase = comissoes.filter(c => !c.tipo)
  const duplicatas = detectDuplicatas()
  const dupCount = Math.round(duplicatas.size / 2)

  const activeVendedoresNomes = new Set(
    colaboradores.filter(c => c.status === 'ativo').map(c => c.nome)
  )
  const vendasComVendedorInativo = vendas.filter(
    v => v.situacao === 'ativa' && v.vendedor && !activeVendedoresNomes.has(v.vendedor)
  ).length

  const parcelasPagasSemNF = parcelas.filter(
    p => p.situacao === 'paga' && !p.nfEmitida
  ).length

  const comissoesEstorno = comissoesBase.filter(
    c => c.status === 'estorno'
  ).length

  const comissoesAguardandoNF = comissoesBase.filter(
    c => c.status === 'aguardando-nf'
  ).length

  const comissoesProntas = comissoesBase.filter(
    c => c.status === 'pronta'
  ).length

  return [
    {
      id: 'dup',
      cor: '#EF4444',
      label: 'Vendas com suspeita de duplicidade',
      count: dupCount,
      href: '/vendas',
    },
    {
      id: 'vinativo',
      cor: '#EAB308',
      label: 'Vendas com vendedor inativo',
      count: vendasComVendedorInativo,
      href: '/vendas',
    },
    {
      id: 'parcelas-sem-nf',
      cor: '#EAB308',
      label: 'Parcelas pagas sem NF anexada',
      count: parcelasPagasSemNF,
      href: '/parcelas',
    },
    {
      id: 'estorno',
      cor: '#F97316',
      label: 'Comissões com estorno',
      count: comissoesEstorno,
      href: '/comissoes',
    },
    {
      id: 'aguard-nf',
      cor: '#3B82F6',
      label: 'Comissões aguardando NF do vendedor',
      count: comissoesAguardandoNF,
      href: '/comissoes',
    },
    {
      id: 'prontas',
      cor: '#22C55E',
      label: 'Comissões prontas e não pagas',
      count: comissoesProntas,
      href: '/comissoes',
    },
  ]
}

function TabBar({ tab, setTab, search, setSearch, onNovoAlerta }) {
  const tabs = ['VISÃO GERAL', 'EXPORTAR', 'HISTÓRICO']
  return (
    <div className="flex items-center border-b border-outline-variant bg-surface-container-lowest px-6">
      <div className="flex items-center flex-1">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors relative',
              tab === t ? 'text-[#F97316]' : 'text-text-muted hover:text-on-surface'
            )}
          >
            {t}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-t" />
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Procurar relatórios..."
            className="pl-8 pr-3 py-1.5 text-xs bg-surface-container rounded-lg border border-outline-variant focus:outline-none focus:border-[#F97316] w-44 text-on-surface placeholder:text-text-muted"
          />
        </div>
        <button
          onClick={onNovoAlerta}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316] text-white text-xs font-bold hover:bg-[#ea6c0a] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Alerta
        </button>
      </div>
    </div>
  )
}

function ReportCard({ relatorio, onConfigurar, onExportar, exporting }) {
  const Icon = relatorio.icon
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#F9731618' }}
        >
          <Icon className="w-5 h-5 text-[#F97316]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-on-surface">{relatorio.titulo}</p>
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{relatorio.descricao}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={() => onConfigurar(relatorio)}
          className="flex items-center gap-1 text-[10px] font-bold text-[#F97316] uppercase tracking-widest hover:underline transition-colors"
        >
          <Settings2 className="w-3 h-3" />
          Configurar Filtros
        </button>
        <button
          onClick={() => onExportar(relatorio)}
          disabled={exporting}
          className="flex items-center gap-1 text-[10px] font-bold text-[#F97316] uppercase tracking-widest hover:underline transition-colors disabled:opacity-50"
        >
          <Download className={cn('w-3 h-3', exporting && 'animate-bounce')} />
          {exporting ? 'Exportando…' : `Exportar ${relatorio.formato}`}
        </button>
      </div>
    </div>
  )
}

function AlertaRow({ alerta, onVer }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-outline-variant last:border-0">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: alerta.cor }}
        />
        <span className="text-xs text-on-surface leading-snug">{alerta.label}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-xs font-bold text-on-surface w-5 text-right">{alerta.count}</span>
        <button
          onClick={() => onVer(alerta.href)}
          className="text-[10px] font-bold text-[#F97316] uppercase tracking-widest hover:underline"
        >
          VER
        </button>
      </div>
    </div>
  )
}

function EmailRow({ relatorio, checked, frequencia, onToggle, onFrequencia, userEmail }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors',
        checked
          ? 'bg-[#F9731610] border-[#F97316]/30'
          : 'bg-surface-container-lowest border-outline-variant'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onToggle}
          className={cn(
            'w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors',
            checked
              ? 'bg-[#F97316] border-[#F97316]'
              : 'border-outline-variant bg-surface-container'
          )}
        >
          {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-on-surface">{relatorio.titulo}</p>
          {checked && (
            <p className="text-xs text-[#F97316] font-medium mt-0.5 truncate">
              Enviado apenas para: {userEmail}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        <div className="relative">
          <select
            value={frequencia}
            onChange={e => onFrequencia(e.target.value)}
            className="appearance-none pl-2 pr-6 py-1 text-xs bg-transparent text-text-muted border-0 focus:outline-none cursor-pointer"
          >
            {FREQUENCIAS.map(f => <option key={f}>{f}</option>)}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

function FilterSlidePanel({ open, onClose, relatorio, onExportar }) {
  const centros = centrosCusto ? centrosCusto.filter(c => c.ativo) : []
  const vendedoresList = useMemo(
    () => [...new Set(vendas.filter(v => v.vendedor).map(v => v.vendedor))].sort(),
    []
  )
  const [periodo, setPeriodo] = useState('2026-05')
  const [centro, setCentro] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [formato, setFormato] = useState('PDF')

  function handleExportar() {
    onClose()
    onExportar(relatorio, { periodo, centro, vendedor, formato })
  }

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title={relatorio ? `Filtros — ${relatorio.titulo}` : 'Configurar Filtros'}
      subtitle="Defina o período e parâmetros de exportação"
      width="md"
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-widest">
            Período (Competência)
          </label>
          <input
            type="month"
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-[#F97316] text-on-surface"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-widest">
            Centro de Custo
          </label>
          <select
            value={centro}
            onChange={e => setCentro(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-[#F97316] text-on-surface"
          >
            <option value="">Todos os Centros</option>
            {centros.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        {(relatorio?.id === 'comissoes' || relatorio?.id === 'metas') && (
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-widest">
              Vendedor
            </label>
            <select
              value={vendedor}
              onChange={e => setVendedor(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-[#F97316] text-on-surface"
            >
              <option value="">Todos os Vendedores</option>
              {vendedoresList.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-widest">
            Formato de Exportação
          </label>
          <div className="flex gap-2">
            {['PDF', 'CSV', 'XLSX'].map(f => (
              <button
                key={f}
                onClick={() => setFormato(f)}
                className={cn(
                  'flex-1 py-2 text-xs font-bold rounded-lg border transition-colors',
                  formato === f
                    ? 'bg-[#F97316] border-[#F97316] text-white'
                    : 'bg-surface-container border-outline-variant text-text-muted hover:border-[#F97316] hover:text-[#F97316]'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExportar}
          className="mt-2 w-full py-2.5 bg-[#F97316] hover:bg-[#ea6c0a] text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar {formato}
        </button>
      </div>
    </SlidePanel>
  )
}

function NovoAlertaModal({ open, onClose, onSave }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('parcelas-vencidas')
  const [limite, setLimite] = useState(5)

  function handleSave() {
    if (!nome.trim()) return
    onSave({ nome, tipo, limite })
    setNome('')
    setTipo('parcelas-vencidas')
    setLimite(5)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-on-surface">Novo Alerta Personalizado</h3>
            <p className="text-xs text-text-muted mt-0.5">Configure um alerta operacional customizado</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-widest">
              Nome do Alerta
            </label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Parcelas sem NF há mais de 30 dias"
              className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-[#F97316] text-on-surface placeholder:text-text-muted"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-widest">
              Tipo de Condição
            </label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-[#F97316] text-on-surface"
            >
              <option value="parcelas-vencidas">Parcelas vencidas</option>
              <option value="comissoes-pendentes">Comissões pendentes</option>
              <option value="vendas-inativas">Vendas com status crítico</option>
              <option value="despesas-acima">Despesas acima do limite</option>
              <option value="saldo-baixo">Saldo em conta abaixo do limite</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5 uppercase tracking-widest">
              Limite / Quantidade
            </label>
            <input
              type="number"
              value={limite}
              onChange={e => setLimite(Number(e.target.value))}
              min={1}
              className="w-full px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-[#F97316] text-on-surface"
            />
          </div>

          <div className="flex gap-2 mt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-text-muted border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!nome.trim()}
              className="flex-1 py-2.5 text-sm font-bold bg-[#F97316] text-white rounded-lg hover:bg-[#ea6c0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Alerta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoricoTab({ historico }) {
  if (historico.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-muted">
        <Clock className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">Nenhuma exportação registrada ainda.</p>
        <p className="text-xs mt-1">As exportações aparecem aqui assim que forem realizadas.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {historico.map((h, i) => (
        <div key={i} className="flex items-start gap-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
          <div className="w-8 h-8 rounded-full bg-[#F9731620] flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 text-[#F97316]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface">{h.titulo}</p>
            <p className="text-xs text-text-muted mt-0.5">{h.descricao}</p>
          </div>
          <span className="text-[10px] text-text-muted flex-shrink-0 mt-0.5">{h.hora}</span>
        </div>
      ))}
    </div>
  )
}

export default function RelatoriosPage() {
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const { usuario, temPermissao } = useAuth()
  const userEmail = usuario?.email || 'admin@optsolv.com'

  const [tab, setTab] = useState('VISÃO GERAL')
  const [search, setSearch] = useState('')
  const [slidePanelOpen, setSlidePanelOpen] = useState(false)
  const [selectedRelatorio, setSelectedRelatorio] = useState(null)
  const [novoAlertaOpen, setNovoAlertaOpen] = useState(false)
  const [customAlertas, setCustomAlertas] = useState([])
  const [historico, setHistorico] = useState([])
  const [emailConfig, setEmailConfig] = useState(() =>
    Object.fromEntries(RELATORIOS.map(r => [r.id, { checked: false, frequencia: 'Mensal' }]))
  )
  const [exporting, setExporting] = useState(null)

  const alertas = useAlerts()

  const filteredRelatorios = useMemo(() => {
    const permitted = RELATORIOS.filter(r => temPermissao(r.recurso, 'visualizar'))
    if (!search.trim()) return permitted
    const q = search.toLowerCase()
    return permitted.filter(r =>
      r.titulo.toLowerCase().includes(q) || r.descricao.toLowerCase().includes(q)
    )
  }, [search, temPermissao])

  function handleConfigurar(relatorio) {
    setSelectedRelatorio(relatorio)
    setSlidePanelOpen(true)
  }

  function handleExportarDireto(relatorio) {
    runExport(relatorio, { formato: relatorio.formato })
  }

  function handleExportarComFiltros(relatorio, filtros) {
    if (relatorio) runExport(relatorio, filtros)
  }

  function runExport(relatorio, filtros) {
    setExporting(relatorio.id)
    setTimeout(() => {
      setExporting(null)
      registrarHistorico({
        acao: `Exportação de relatório — ${relatorio.titulo}`,
        tipoEvento: 'normal',
        entidade: 'Relatorio',
        detalhes: `Formato: ${filtros.formato || relatorio.formato} · Período: ${filtros.periodo || 'atual'}`,
        camposAlterados: [
          { campo: 'formato', valorAnterior: null, novoValor: filtros.formato || relatorio.formato },
          { campo: 'periodo', valorAnterior: null, novoValor: filtros.periodo || 'atual' },
        ],
      })
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setHistorico(prev => [
        {
          titulo: relatorio.titulo,
          descricao: `Exportado em ${filtros.formato || relatorio.formato} · Período: ${filtros.periodo || 'atual'}`,
          hora,
        },
        ...prev,
      ])
      toast({
        title: 'Exportação concluída',
        description: `${relatorio.titulo} exportado com sucesso em ${filtros.formato || relatorio.formato}.`,
      })
    }, 1500)
  }

  function handleNovoAlertaSave(alerta) {
    setCustomAlertas(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        cor: '#6366F1',
        label: alerta.nome,
        count: alerta.limite,
        href: '/relatorios',
      },
    ])
    toast({
      title: 'Alerta criado',
      description: `"${alerta.nome}" adicionado ao painel de alertas.`,
    })
  }

  function handleEmailToggle(relatorioId) {
    setEmailConfig(prev => {
      const nowChecked = !prev[relatorioId].checked
      const next = { ...prev, [relatorioId]: { ...prev[relatorioId], checked: nowChecked } }
      const relatorio = RELATORIOS.find(r => r.id === relatorioId)
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      if (nowChecked) {
        setHistorico(old => [
          {
            titulo: `Envio automático ativado — ${relatorio.titulo}`,
            descricao: `Frequência: ${next[relatorioId].frequencia} · Para: ${userEmail}`,
            hora,
          },
          ...old,
        ])
        toast({
          title: 'Envio automático ativado',
          description: `${relatorio.titulo} será enviado ${next[relatorioId].frequencia.toLowerCase()} para ${userEmail}.`,
        })
      } else {
        toast({
          title: 'Envio automático desativado',
          description: `${relatorio.titulo} não será mais enviado por e-mail.`,
        })
      }
      return next
    })
  }

  function handleEmailFrequencia(relatorioId, frequencia) {
    setEmailConfig(prev => ({
      ...prev,
      [relatorioId]: { ...prev[relatorioId], frequencia },
    }))
  }

  const allAlertas = [...alertas, ...customAlertas]

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TabBar
        tab={tab}
        setTab={setTab}
        search={search}
        setSearch={setSearch}
        onNovoAlerta={() => setNovoAlertaOpen(true)}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <PrintHeader titulo="Relatórios & Alertas" />

        <PageHeader
          title="Relatórios & Alertas"
          subtitle="Exportações e checklist operacional diário"
        />

        {tab === 'VISÃO GERAL' && (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                    RELATÓRIOS
                  </p>
                  <button className="flex items-center gap-1 text-[11px] text-[#F97316] font-semibold hover:underline">
                    <Info className="w-3 h-3" />
                    Ver Todos
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredRelatorios.map(r => (
                    <ReportCard
                      key={r.id}
                      relatorio={r}
                      onConfigurar={handleConfigurar}
                      onExportar={handleExportarDireto}
                      exporting={exporting === r.id}
                    />
                  ))}
                </div>

                {filteredRelatorios.length === 0 && (
                  <div className="py-10 text-center text-text-muted text-sm">
                    Nenhum relatório encontrado para "{search}".
                  </div>
                )}
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-4 h-4 text-[#F97316]" />
                  <p className="text-xs font-bold text-on-surface uppercase tracking-widest">
                    ENVIO AUTOMÁTICO POR E-MAIL
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {RELATORIOS.map(r => (
                    <EmailRow
                      key={r.id}
                      relatorio={r}
                      checked={emailConfig[r.id].checked}
                      frequencia={emailConfig[r.id].frequencia}
                      onToggle={() => handleEmailToggle(r.id)}
                      onFrequencia={f => handleEmailFrequencia(r.id, f)}
                      userEmail={userEmail}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-72 flex-shrink-0">
              <div
                className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden sticky top-0"
                style={{ borderLeft: '4px solid #F97316' }}
              >
                <div className="p-5 border-b border-outline-variant">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-[#F97316]" />
                    <p className="text-sm font-bold text-on-surface">Painel de Alertas Operacionais</p>
                  </div>
                  <p className="text-xs text-text-muted">Checklist diário de consistência</p>
                </div>

                <div className="px-4 pt-2 pb-1">
                  {allAlertas.map(alerta => (
                    <AlertaRow
                      key={alerta.id}
                      alerta={alerta}
                      onVer={href => navigate(href)}
                    />
                  ))}
                  {allAlertas.length === 0 && (
                    <div className="py-4 text-center text-xs text-text-muted">
                      Nenhum alerta ativo.
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-outline-variant">
                  <p className="text-[10px] text-text-muted leading-relaxed italic">
                    Atualizado agora · Somente leitura · Ações devem ser feitas nos módulos correspondentes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'EXPORTAR' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-muted">
              Selecione um relatório e clique em{' '}
              <strong className="text-on-surface">Configurar Filtros</strong>{' '}
              para exportar com parâmetros personalizados.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RELATORIOS.map(r => (
                <ReportCard
                  key={r.id}
                  relatorio={r}
                  onConfigurar={handleConfigurar}
                  onExportar={handleExportarDireto}
                  exporting={exporting === r.id}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 'HISTÓRICO' && (
          <div className="max-w-2xl">
            <p className="text-sm text-text-muted mb-4">
              Registro de exportações e configurações de envio automático realizadas nesta sessão.
            </p>
            <HistoricoTab historico={historico} />
          </div>
        )}
      </div>

      <FilterSlidePanel
        open={slidePanelOpen}
        onClose={() => setSlidePanelOpen(false)}
        relatorio={selectedRelatorio}
        onExportar={handleExportarComFiltros}
      />

      <NovoAlertaModal
        open={novoAlertaOpen}
        onClose={() => setNovoAlertaOpen(false)}
        onSave={handleNovoAlertaSave}
      />

      <button
        onClick={() => setNovoAlertaOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#F97316] text-white shadow-lg hover:bg-[#ea6c0a] transition-colors flex items-center justify-center z-30"
        title="Novo Alerta"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  )
}
