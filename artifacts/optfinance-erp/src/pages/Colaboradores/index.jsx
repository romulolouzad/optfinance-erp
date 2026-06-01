import { useState, useMemo } from 'react'
import { Link, useLocation } from 'wouter'
import { Plus, Eye, ChevronDown, ChevronUp, X, UserCheck, Receipt, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { getColaboradores } from '../../data/colaboradores-store'
import { cn } from '../../utils/cn'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

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
  if (tipo === 'PF') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#cde5ff] text-[#003554]">
        PF
      </span>
    )
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
      PJ
    </span>
  )
}

function HistoricoSection({ historico }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section>
      <button
        className="w-full flex items-center justify-between p-4 border border-outline-variant/20 rounded-xl hover:bg-surface-container-low/60 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-base">⏱</span>
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Histórico de Alterações
          </h4>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
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
                    {h.data} às {h.hora} · {h.usuario}
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
    </section>
  )
}

function ColaboradorSlidePanel({ colaborador, onClose }) {
  const docId = colaborador?.tipo === 'PJ' ? colaborador.cnpj : colaborador?.cpf

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        colaborador ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-inverse-surface/40 transition-opacity duration-300',
          colaborador ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-[480px] flex flex-col',
          'bg-white/90 backdrop-blur-xl shadow-2xl border-l border-outline-variant/20',
          'transform transition-transform duration-300 ease-in-out'
        )}
        style={{ transform: colaborador ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {colaborador && (
          <>
            {/* Header */}
            <div className="p-6 pb-5 border-b border-outline-variant/10 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-on-surface tracking-tight">
                  {colaborador.nome} — {colaborador.tipo}
                </h2>
                <p className="text-sm text-text-muted mt-0.5">Colaborador ID #{colaborador.id}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-surface-container-low text-text-muted transition-colors ml-4 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Dados Cadastrais */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-4 h-4 text-[#F97316]" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                    Dados Cadastrais
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                      {colaborador.tipo === 'PJ' ? 'CNPJ' : 'CPF'}
                    </p>
                    <p className="text-sm font-semibold text-on-surface font-mono">{docId}</p>
                  </div>
                  {colaborador.tipo === 'PF' && colaborador.dataNascimento && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                        Data de Nascimento
                      </p>
                      <p className="text-sm font-semibold text-on-surface">
                        {new Date(colaborador.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                      E-mail
                    </p>
                    <p className="text-sm font-semibold text-on-surface break-all">{colaborador.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                      Cargo / Função
                    </p>
                    <p className="text-sm font-semibold text-on-surface">{colaborador.cargo}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                      Centro de Custo
                    </p>
                    <p className="text-sm font-semibold text-on-surface">{colaborador.centroDeCusto || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
                      Custo Mensal
                    </p>
                    <p className="text-sm font-bold text-[#F97316]">
                      {colaborador.custoMensal ? fmt(colaborador.custoMensal) : '—'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Despesas Recentes */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-[#F97316]" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                      Despesas Recentes
                    </h4>
                  </div>
                  <a
                    href="#ver-despesas"
                    onClick={(e) => e.preventDefault()}
                    className="text-[10px] font-bold text-[#F97316] uppercase hover:underline flex items-center gap-1"
                  >
                    Ver todas as despesas
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <div className="overflow-hidden border border-outline-variant/10 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="px-4 py-2.5 font-bold text-text-muted uppercase tracking-wider">Data</th>
                        <th className="px-4 py-2.5 font-bold text-text-muted uppercase tracking-wider">Ref</th>
                        <th className="px-4 py-2.5 font-bold text-text-muted uppercase tracking-wider text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5 bg-surface-container-lowest">
                      {colaborador.despesasRecentes && colaborador.despesasRecentes.length > 0 ? (
                        colaborador.despesasRecentes.map((d, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2.5 text-text-muted">{d.data}</td>
                            <td className="px-4 py-2.5 font-medium text-on-surface">{d.ref}</td>
                            <td className="px-4 py-2.5 font-bold text-on-surface text-right">{fmt(d.valor)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-5 text-center text-text-muted">
                            Nenhuma despesa registrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Histórico de Alterações */}
              <HistoricoSection historico={colaborador.historicoAlteracoes} />
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
                className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
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

export default function ColaboradoresPage() {
  const [, navigate] = useLocation()
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selected, setSelected] = useState(null)

  const colaboradores = getColaboradores()

  const filtered = useMemo(() => {
    let list = colaboradores

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          (c.cpf && c.cpf.includes(q)) ||
          (c.cnpj && c.cnpj.includes(q)) ||
          c.cargo.toLowerCase().includes(q)
      )
    }

    if (tipoFilter !== 'Todos') {
      list = list.filter((c) => c.tipo === tipoFilter)
    }

    if (statusFilter !== 'Todos') {
      list = list.filter((c) => c.status === statusFilter.toLowerCase())
    }

    return list
  }, [colaboradores, search, tipoFilter, statusFilter])

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        subtitle="Pessoas físicas e jurídicas com custo interno registrado no sistema"
        actions={
          <button
            onClick={() => navigate('/colaboradores/novo')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg text-white font-bold shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
          >
            <Plus className="w-4 h-4" />
            Novo Colaborador
          </button>
        }
      />

      {/* Filter card */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm mb-6 flex flex-wrap items-end gap-4 border border-outline-variant/10">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 ml-1">
            Pesquisar
          </label>
          <div className="relative flex items-center bg-surface-container-low rounded-lg px-3 py-2.5">
            <span className="mr-2 text-text-muted text-sm">🔍</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full text-on-surface placeholder:text-text-muted"
              placeholder="Nome, CPF ou CNPJ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-40">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 ml-1">
            Tipo
          </label>
          <select
            className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary-container focus:outline-none"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="PF">PF</option>
            <option value="PJ">PJ</option>
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
            <option value="Todos">Todos os Status</option>
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
              {['ID', 'Nome / Razão Social', 'Tipo', 'CPF / CNPJ', 'Cargo', 'Status', 'Último Acesso', 'Ações'].map(
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
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-text-muted">
                  Nenhum colaborador encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[#FFF7ED] transition-colors cursor-pointer group"
                  onClick={() => setSelected(c)}
                >
                  <td className="px-5 py-4 text-sm text-text-muted font-mono">{c.id}</td>
                  <td className="px-5 py-4 text-sm font-bold text-on-surface">{c.nome}</td>
                  <td className="px-5 py-4">
                    <TipoBadge tipo={c.tipo} />
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted font-mono">
                    {c.tipo === 'PJ' ? c.cnpj : c.cpf}
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted">{c.cargo}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted">
                    {c.ultimoAcesso
                      ? new Date(c.ultimoAcesso + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '—'}
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

        {/* Footer */}
        <div className="px-5 py-3.5 bg-surface-container-low flex justify-between items-center">
          <span className="text-xs text-text-muted font-medium">
            Mostrando {filtered.length} de {colaboradores.length} registros
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
      <ColaboradorSlidePanel colaborador={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
