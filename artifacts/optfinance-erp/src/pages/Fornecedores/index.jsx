import { useState, useMemo } from 'react'
import { Link, useLocation } from 'wouter'
import {
  Building2, Eye, Plus, ChevronDown, ChevronUp, X, Receipt, Search
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { getFornecedores } from '../../data/fornecedores-store'
import { despesas, centrosCusto } from '../../data/index'
import { cn } from '../../utils/cn'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function getCentroCusto(id) {
  return centrosCusto.find((c) => c.id === id)?.nome || id || '—'
}

function getDespesasFornecedor(ids) {
  if (!ids || ids.length === 0) return []
  return despesas.filter((d) => ids.includes(d.id))
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

function TipoBadge({ tipo }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
      tipo === 'PJ'
        ? 'bg-blue-50 text-blue-700 border border-blue-200'
        : 'bg-purple-50 text-purple-700 border border-purple-200'
    )}>
      {tipo}
    </span>
  )
}

function SituacaoDespBadge({ situacao }) {
  const map = {
    paga: 'bg-green-50 text-green-700',
    prevista: 'bg-amber-50 text-amber-700',
    cancelada: 'bg-surface-container text-text-muted',
  }
  return (
    <span className={cn(
      'inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
      map[situacao] || 'bg-surface-container text-text-muted'
    )}>
      {situacao}
    </span>
  )
}

function HistoricoSection({ historico }) {
  const [expanded, setExpanded] = useState(false)

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
        <div className="mt-4 space-y-2">
          {historico && historico.length > 0 ? (
            historico.map((h, i) => {
              const isApi = h.executor === 'Automação API' || h.tipo === 'api'
              return (
                <div
                  key={i}
                  className={cn(
                    'flex gap-3 items-start p-3 rounded-lg',
                    isApi ? 'bg-gray-50' : 'bg-surface-container-low'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full',
                    isApi ? 'bg-gray-400' : 'bg-[#F97316]'
                  )} />
                  <div>
                    <p className={cn(
                      'text-xs font-semibold',
                      isApi ? 'text-gray-500' : 'text-on-surface'
                    )}>
                      {h.acao}
                    </p>
                    <p className={cn(
                      'text-[10px] mt-0.5',
                      isApi ? 'text-gray-400' : 'text-text-muted'
                    )}>
                      {h.data} · <span className={isApi ? 'italic' : ''}>{h.executor}</span>
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-xs text-text-muted text-center py-4">
              Nenhum histórico registrado.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function FornecedorSlidePanel({ fornecedor, onClose }) {
  const desp = fornecedor ? getDespesasFornecedor(fornecedor.despesasVinculadas) : []

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        fornecedor ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-inverse-surface/40 transition-opacity duration-300',
          fornecedor ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-[500px] flex flex-col',
          'bg-white/85 backdrop-blur-xl shadow-2xl border-l border-outline-variant/20',
          'transform transition-transform duration-300 ease-in-out',
          fornecedor ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {fornecedor && (
          <>
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F97316]">
                  {fornecedor.id}
                </span>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-5 h-5 text-[#F97316] flex-shrink-0" />
                <h3 className="text-xl font-black text-on-surface tracking-tight leading-tight">
                  Fornecedor — {fornecedor.razaoSocial}
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* DADOS CADASTRAIS */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-[#F97316]" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    Dados Cadastrais
                  </h4>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Razão Social
                      </p>
                      <p className="text-sm font-semibold text-on-surface">{fornecedor.razaoSocial}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        {fornecedor.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}
                      </p>
                      <p className="text-sm font-mono text-on-surface">{fornecedor.cnpj}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        E-mail Financeiro
                      </p>
                      <p className="text-sm text-on-surface break-all">{fornecedor.emailFinanceiro}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Telefone
                      </p>
                      <p className="text-sm text-on-surface">{fornecedor.telefone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Centro de Custo
                      </p>
                      <p className="text-sm font-semibold text-on-surface">{getCentroCusto(fornecedor.centroCustoId)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Status
                      </p>
                      <StatusBadge status={fornecedor.status} />
                    </div>
                  </div>
                </div>
              </section>

              {/* DESPESAS VINCULADAS */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#F97316]" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Despesas Vinculadas
                    </h4>
                  </div>
                  <Link
                    href={`/despesas?fornecedorId=${fornecedor.id}`}
                    onClick={onClose}
                    className="text-[10px] font-bold text-[#F97316] uppercase hover:underline"
                  >
                    Ver todas →
                  </Link>
                </div>
                <div className="overflow-hidden border border-outline-variant/10 rounded-xl">
                  <table className="w-full text-left text-xs bg-surface-container-low">
                    <thead>
                      <tr className="bg-surface-container/50">
                        <th className="px-3 py-2 font-bold text-text-muted">ID</th>
                        <th className="px-3 py-2 font-bold text-text-muted">Descrição</th>
                        <th className="px-3 py-2 font-bold text-text-muted">Valor</th>
                        <th className="px-3 py-2 font-bold text-text-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {desp.length > 0 ? (
                        desp.map((d) => (
                          <tr key={d.id}>
                            <td className="px-3 py-2.5 font-mono text-[#F97316] font-bold">{d.id}</td>
                            <td className="px-3 py-2.5 font-medium text-on-surface max-w-[140px] truncate">{d.descricao}</td>
                            <td className="px-3 py-2.5 font-bold text-on-surface whitespace-nowrap">{fmt(d.valor)}</td>
                            <td className="px-3 py-2.5">
                              <SituacaoDespBadge situacao={d.situacao} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-text-muted">
                            Nenhuma despesa vinculada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* HISTÓRICO */}
              <HistoricoSection historico={fornecedor.historico} />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-container-low/50 border-t border-outline-variant/10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-outline/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors"
              >
                Fechar
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
              >
                Editar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function FornecedoresPage() {
  const [, navigate] = useLocation()
  const [search, setSearch] = useState('')
  const [tipoPessoa, setTipoPessoa] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selected, setSelected] = useState(null)

  const fornecedores = getFornecedores()

  const filtered = useMemo(() => {
    let list = fornecedores

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (f) =>
          f.razaoSocial.toLowerCase().includes(q) ||
          f.cnpj.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
          f.cnpj.includes(q) ||
          (f.nomeFantasia || '').toLowerCase().includes(q)
      )
    }

    if (tipoPessoa !== 'Todos') {
      list = list.filter((f) => f.tipoPessoa === tipoPessoa)
    }

    if (statusFilter !== 'Todos') {
      list = list.filter((f) => f.status === statusFilter.toLowerCase())
    }

    return list
  }, [fornecedores, search, tipoPessoa, statusFilter])

  return (
    <div>
      {/* Orange info banner */}
      <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl border border-[#F97316]/30 bg-[#F97316]/5">
        <Building2 className="w-4 h-4 text-[#F97316] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#9d4300] leading-relaxed">
          <span className="font-bold">Fornecedores são entidades independentes de Clientes.</span>{' '}
          O mesmo CNPJ pode existir nas duas bases simultaneamente. Use os filtros abaixo para localizar e
          gerenciar os fornecedores vinculados ao fluxo de despesas e contas a pagar.
        </p>
      </div>

      <PageHeader
        title="Fornecedores"
        subtitle="Cadastro de fornecedores e prestadores de serviços"
        actions={
          <button
            onClick={() => navigate('/fornecedores/novo')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg text-white font-bold shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
          >
            <Plus className="w-4 h-4" />
            Novo Fornecedor
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm mb-6 flex flex-wrap items-end gap-4 border border-outline-variant/10">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 ml-1">
            Pesquisar
          </label>
          <div className="relative flex items-center bg-surface-container-low rounded-lg px-3 py-2.5">
            <Search className="w-3.5 h-3.5 mr-2 text-text-muted flex-shrink-0" />
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full text-on-surface placeholder:text-text-muted"
              placeholder="Nome ou CNPJ/CPF"
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
              {['ID', 'Razão Social', 'Tipo', 'CNPJ / CPF', 'Status', 'Ações'].map((h) => (
                <th
                  key={h}
                  className={cn(
                    'px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text-muted',
                    h === 'Ações' && 'text-right'
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-text-muted">
                  Nenhum fornecedor encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((f, idx) => (
                <tr
                  key={f.id}
                  className="hover:bg-primary-container/5 transition-colors cursor-pointer group"
                  onClick={() => setSelected(f)}
                >
                  <td className="px-5 py-4 text-sm text-text-muted font-mono">
                    #{String(idx + 1).padStart(3, '0')}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-on-surface">{f.razaoSocial}</td>
                  <td className="px-5 py-4">
                    <TipoBadge tipo={f.tipoPessoa} />
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted font-mono">{f.cnpj}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelected(f)
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

        <div className="px-5 py-3.5 bg-surface-container-low flex justify-between items-center">
          <span className="text-xs text-text-muted font-medium">
            Mostrando {filtered.length} de {fornecedores.length} registros
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

      <FornecedorSlidePanel fornecedor={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
