import { useState, useMemo } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../../context/AuthContext'
import { Users, Eye, Plus, ChevronDown, ChevronUp, X } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SlidePanel from '../../components/shared/SlidePanel'
import { getClientes } from '../../data/clientes-store'
import { centrosCusto } from '../../data/index'
import { cn } from '../../utils/cn'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function getCentroCusto(id) {
  return centrosCusto.find((c) => c.id === id)?.nome || id
}

function StatusBadge({ status }) {
  if (status === 'ativo') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Ativo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container text-text-muted">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Inativo
    </span>
  )
}

function ContratoBadge({ status }) {
  if (status === 'VIGENTE') {
    return (
      <span className="text-green-600 font-bold uppercase text-[9px] tracking-wider">
        Vigente
      </span>
    )
  }
  return (
    <span className="text-amber-600 font-bold uppercase text-[9px] tracking-wider">
      Pendente
    </span>
  )
}

function HistoricoSection({ historico }) {
  const [expanded, setExpanded] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <section className="border-t border-surface-container pt-5">
      <button
        className="w-full flex items-center justify-between group"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[#F97316] text-base">⏱</span>
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Histórico
          </h4>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted group-hover:text-on-surface transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-on-surface transition-colors" />
        )}
      </button>

      {expanded && (
        <div className="mt-4">
          {!loaded ? (
            <div className="flex flex-col items-center justify-center p-6 bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/40">
              <span className="text-4xl mb-2 opacity-30">☁</span>
              <p className="text-xs text-text-muted mb-4">
                Clique para visualizar o histórico de interações
              </p>
              <button
                onClick={() => setLoaded(true)}
                className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-colors"
              >
                Carregar histórico
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {historico && historico.length > 0 ? (
                historico.map((h, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-3 rounded-lg bg-surface-container-low"
                  >
                    <div className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-[#F97316]" />
                    <div>
                      <p className="text-xs font-semibold text-on-surface">{h.acao}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {h.data} · {h.usuario}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-muted text-center py-4">
                  Nenhum histórico registrado.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function ClienteSlidePanel({ cliente, onClose }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        cliente ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-inverse-surface/40 transition-opacity duration-300',
          cliente ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-[480px] flex flex-col',
          'bg-white/85 backdrop-blur-xl shadow-2xl border-l border-outline-variant/20',
          'transform transition-transform duration-300 ease-in-out',
          cliente ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {cliente && (
          <>
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F97316]">
                  {cliente.id}
                </span>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-5 h-5 text-[#F97316] flex-shrink-0" />
                <h3 className="text-xl font-black text-on-surface tracking-tight leading-tight">
                  Detalhe do Cliente — {cliente.nomeFantasia}
                </h3>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Dados Cadastrais */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#F97316]">🪪</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    Dados Cadastrais
                  </h4>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                      Razão Social
                    </p>
                    <p className="text-sm font-semibold text-on-surface">{cliente.razaoSocial}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                      CNPJ
                    </p>
                    <p className="text-sm font-mono text-on-surface">{cliente.cnpj}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Nome Fantasia
                      </p>
                      <p className="text-sm font-semibold text-on-surface">{cliente.nomeFantasia}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Centro de Custo
                      </p>
                      <p className="text-sm font-semibold text-on-surface">
                        {getCentroCusto(cliente.centroCustoId)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contratos Vinculados */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F97316]">📄</span>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Contratos Vinculados
                    </h4>
                  </div>
                  <a
                    href="#ver-todos"
                    onClick={(e) => e.preventDefault()}
                    className="text-[10px] font-bold text-[#F97316] uppercase hover:underline"
                  >
                    Ver todos
                  </a>
                </div>
                <div className="overflow-hidden border border-outline-variant/10 rounded-xl">
                  <table className="w-full text-left text-xs bg-surface-container-low">
                    <thead>
                      <tr className="bg-surface-container/50">
                        <th className="px-3 py-2 font-bold text-text-muted">ID</th>
                        <th className="px-3 py-2 font-bold text-text-muted">Tipo</th>
                        <th className="px-3 py-2 font-bold text-text-muted">Valor</th>
                        <th className="px-3 py-2 font-bold text-text-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {cliente.contratos && cliente.contratos.length > 0 ? (
                        cliente.contratos.map((c) => (
                          <tr key={c.id}>
                            <td className="px-3 py-2.5 font-mono text-[#F97316] font-bold">
                              {c.id}
                            </td>
                            <td className="px-3 py-2.5 font-medium text-on-surface">{c.tipo}</td>
                            <td className="px-3 py-2.5 font-bold text-on-surface">{fmt(c.valor)}</td>
                            <td className="px-3 py-2.5">
                              <ContratoBadge status={c.status} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-text-muted">
                            Nenhum contrato vinculado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Histórico */}
              <HistoricoSection historico={cliente.historico} />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-container-low/50 border-t border-outline-variant/10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-outline/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors"
              >
                Fechar
              </button>
              <button className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}>
                Editar completo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const TABS = [
  { key: 'all', label: 'All Clients' },
  { key: 'recent', label: 'Recent' },
  { key: 'archived', label: 'Archived' },
]

export default function ClientesPage() {
  const [, navigate] = useLocation()
  const [search, setSearch] = useState('')
  const [tipoPessoa, setTipoPessoa] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [activeTab, setActiveTab] = useState('all')
  const [selected, setSelected] = useState(null)
  const { temPermissao } = useAuth()

  const clientes = getClientes()

  const filtered = useMemo(() => {
    let list = clientes

    if (activeTab === 'recent') {
      list = list.filter((c) => {
        if (!c.historico || c.historico.length === 0) return false
        const last = c.historico[c.historico.length - 1]
        const d = new Date(last.data)
        const cutoff = new Date()
        cutoff.setMonth(cutoff.getMonth() - 3)
        return d >= cutoff
      })
    } else if (activeTab === 'archived') {
      list = list.filter((c) => c.status === 'inativo')
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.razaoSocial.toLowerCase().includes(q) ||
          c.cnpj.includes(q) ||
          c.nomeFantasia?.toLowerCase().includes(q)
      )
    }

    if (tipoPessoa !== 'Todos') {
      list = list.filter((c) => c.tipoPessoa === tipoPessoa)
    }

    if (statusFilter !== 'Todos') {
      list = list.filter((c) => c.status === statusFilter.toLowerCase())
    }

    return list
  }, [clientes, search, tipoPessoa, statusFilter, activeTab])

  return (
    <div>
      {/* Topbar tabs (rendered at top, inside page content) */}
      <div className="flex items-center gap-6 mb-6 border-b border-surface-container">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'text-[#F97316] border-[#F97316]'
                : 'text-text-muted border-transparent hover:text-on-surface'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <PageHeader
        title="Clientes"
        subtitle="Cadastro de clientes geradores de receita"
        actions={
          temPermissao('clientes', 'criar') ? (
            <button
              onClick={() => navigate('/clientes/novo')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg text-white font-bold shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>
          ) : null
        }
      />

      {/* Filters */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm mb-6 flex flex-wrap items-end gap-4 border border-outline-variant/10">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 ml-1">
            Pesquisar
          </label>
          <div className="relative flex items-center bg-surface-container-low rounded-lg px-3 py-2.5">
            <span className="mr-2 text-text-muted text-sm">🔍</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full text-on-surface placeholder:text-text-muted"
              placeholder="Nome ou CNPJ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-44">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 ml-1">
            Tipo de Pessoa
          </label>
          <select
            className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary-container focus:outline-none"
            value={tipoPessoa}
            onChange={(e) => setTipoPessoa(e.target.value)}
          >
            <option>Todos</option>
            <option value="PJ">PJ</option>
            <option value="PF">PF</option>
          </select>
        </div>

        <div className="w-44">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 ml-1">
            Status
          </label>
          <select
            className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary-container focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              {['ID', 'Razão Social', 'CNPJ', 'Nome Fantasia', 'Contratos', 'Status', 'Ações'].map(
                (h) => (
                  <th
                    key={h}
                    className={cn(
                      'px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-muted',
                      h === 'Ações' && 'text-right'
                    )}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-text-muted">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((c, idx) => (
                <tr
                  key={c.id}
                  className="hover:bg-primary-container/5 transition-colors cursor-pointer group"
                  onClick={() => setSelected(c)}
                >
                  <td className="px-5 py-4 text-sm text-text-muted font-mono">
                    #{String(idx + 1).padStart(3, '0')}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-on-surface">{c.razaoSocial}</td>
                  <td className="px-5 py-4 text-sm text-text-muted font-mono">{c.cnpj}</td>
                  <td className="px-5 py-4 text-sm text-text-muted">{c.nomeFantasia}</td>
                  <td className="px-5 py-4">
                    {c.contratos && c.contratos.length > 0 ? (
                      <span className="bg-orange-50 text-[#F97316] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#F97316]/20">
                        {String(c.contratos.length).padStart(2, '0')}
                      </span>
                    ) : (
                      <span className="bg-surface-container text-text-muted px-2.5 py-0.5 rounded-full text-xs font-bold border border-outline-variant/20">
                        00
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected(c)
                        }}
                        className="p-1.5 hover:bg-white rounded-md text-text-muted hover:text-[#F97316] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination bar */}
        <div className="px-5 py-3.5 bg-surface-container-low flex justify-between items-center">
          <span className="text-xs text-text-muted font-medium">
            Mostrando {filtered.length} de {clientes.length} registros
          </span>
          <div className="flex gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-outline-variant/10 text-text-muted hover:bg-surface-container transition-colors">
              ‹
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#F97316] text-white font-bold text-xs">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-outline-variant/10 text-text-muted hover:bg-surface-container transition-colors">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* SlidePanel */}
      <ClienteSlidePanel cliente={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
