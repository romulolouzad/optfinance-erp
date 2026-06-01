import { useState, useMemo, useEffect } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import SlidePanel from '../../components/shared/SlidePanel'
import PrintHeader from '../../components/shared/PrintHeader'
import { centrosCusto } from '../../data/index'
import { useEmprestimos, addEmprestimo } from '../../data/emprestimos-store'
import { registrarHistorico } from '../../data/historico-store'
import { useAuth } from '../../context/AuthContext'
import NoPermissionState from '../../components/shared/NoPermissionState'
import { toast } from '../../hooks/use-toast'
import { BriefcaseBusiness, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const PAGE_SIZE = 10
const CENTROS = centrosCusto.filter(c => c.ativo)
const TIPOS = ['cce', 'capital-giro', 'financiamento', 'leasing', 'debenture']

function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-label text-text-muted mb-1">
      {children}{required && <span className="text-error ml-0.5">*</span>}
    </label>
  )
}

function inputCls(err) {
  return cn(
    'w-full px-3 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-text-muted',
    'focus:outline-none focus:ring-2 transition-shadow',
    err ? 'ring-2 ring-error' : 'focus:ring-primary-container/40'
  )
}

export default function EmprestimosPage() {
  const { temPermissao } = useAuth()
  const emprestimos = useEmprestimos()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t) }, [])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [situacaoFiltro, setSituacaoFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [novoOpen, setNovoOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    descricao: '',
    credor: '',
    tipo: 'cce',
    taxaJuros: '',
    valorOriginal: '',
    centroCustoId: '',
    dataInicio: new Date().toISOString().slice(0, 10),
    previsaoFim: '',
  })
  const [errors, setErrors] = useState({})

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

  const filtered = useMemo(() => {
    return emprestimos.filter(e => {
      const matchSearch = !search || e.descricao.toLowerCase().includes(search.toLowerCase()) || e.credor.toLowerCase().includes(search.toLowerCase())
      const matchSituacao = !situacaoFiltro || e.situacao === situacaoFiltro
      return matchSearch && matchSituacao
    })
  }, [search, situacaoFiltro, emprestimos])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const ativos = emprestimos.filter(e => e.situacao === 'ativo')
  const saldoDevedor = ativos.reduce((s, e) => s + e.saldoDevedor, 0)
  const valorOriginal = ativos.reduce((s, e) => s + e.valorOriginal, 0)

  const cards = [
    { title: 'Saldo Devedor Total', value: saldoDevedor, icon: BriefcaseBusiness, accent: '#C62828', type: 'currency' },
    { title: 'Valor Contratado (ativos)', value: valorOriginal, icon: BriefcaseBusiness, type: 'currency' },
    { title: 'Empréstimos Ativos', value: ativos.length, icon: BriefcaseBusiness, type: 'number' },
    { title: 'Inadimplentes', value: emprestimos.filter(e => e.situacao === 'inadimplente').length, icon: AlertTriangle, accent: '#C62828', type: 'number' },
  ]

  const columns = [
    { header: 'Descrição', accessor: 'descricao', cell: r => <span className="font-medium">{r.descricao}</span> },
    { header: 'Credor', accessor: 'credor' },
    { header: 'Tipo', accessor: 'tipo', cell: r => <span className="text-xs capitalize">{r.tipo.replace('-', ' ')}</span> },
    { header: 'Taxa (a.m.)', accessor: 'taxaJuros', align: 'right', cell: r => `${r.taxaJuros}%` },
    { header: 'Valor Original', accessor: 'valorOriginal', align: 'right', cell: r => fmt(r.valorOriginal) },
    { header: 'Saldo Devedor', accessor: 'saldoDevedor', align: 'right', cell: r => <span className={`font-bold ${r.saldoDevedor > 0 ? 'text-error' : 'text-green-600'}`}>{fmt(r.saldoDevedor)}</span> },
    { header: 'Status', accessor: 'situacao', sortable: false, cell: r => <StatusBadge status={r.situacao} /> },
  ]

  function validate() {
    const errs = {}
    if (!form.descricao.trim()) errs.descricao = true
    if (!form.credor.trim()) errs.credor = true
    if (!form.valorOriginal || parseFloat(form.valorOriginal) <= 0) errs.valorOriginal = true
    if (!form.centroCustoId) errs.centroCustoId = true
    if (!form.previsaoFim) errs.previsaoFim = true
    return errs
  }

  const canSave = form.descricao.trim() && form.credor.trim() && parseFloat(form.valorOriginal) > 0 && form.centroCustoId && form.previsaoFim

  function handleSalvar() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }
    setSaving(true)
    setTimeout(() => {
      addEmprestimo({
        descricao: form.descricao,
        credor: form.credor,
        tipo: form.tipo,
        taxaJuros: parseFloat(form.taxaJuros) || 0,
        valorOriginal: parseFloat(form.valorOriginal),
        centroCustoId: form.centroCustoId,
        dataInicio: form.dataInicio,
        previsaoFim: form.previsaoFim,
      })
      registrarHistorico({
        acao: `Novo empréstimo registrado — ${form.descricao} — ${fmt(parseFloat(form.valorOriginal))}`,
        tipoEvento: 'normal',
        entidade: 'Emprestimo',
        camposAlterados: [
          { campo: 'descricao', valorAnterior: null, novoValor: form.descricao },
          { campo: 'credor', valorAnterior: null, novoValor: form.credor },
          { campo: 'valorOriginal', valorAnterior: null, novoValor: form.valorOriginal },
          { campo: 'centroCustoId', valorAnterior: null, novoValor: form.centroCustoId },
        ],
      })
      toast({ title: 'Empréstimo registrado com sucesso' })
      setSaving(false)
      setNovoOpen(false)
      setForm({ descricao: '', credor: '', tipo: 'cce', taxaJuros: '', valorOriginal: '', centroCustoId: '', dataInicio: new Date().toISOString().slice(0, 10), previsaoFim: '' })
      setErrors({})
    }, 800)
  }

  const printFiltros = [
    situacaoFiltro ? { label: 'Situação', valor: situacaoFiltro } : null,
    search ? { label: 'Busca', valor: search } : null,
  ].filter(Boolean)

  if (!temPermissao('emprestimos', 'visualizar')) return <NoPermissionState message="Você não tem permissão para acessar Empréstimos." />

  return (
    <div>
      <PrintHeader titulo="Empréstimos & Financiamentos" filtros={printFiltros} />

      <PageHeader
        title="Empréstimos & Financiamentos"
        subtitle="Controle de dívidas e obrigações financeiras"
        actions={
          temPermissao('emprestimos', 'criar') && (
            <button
              onClick={() => setNovoOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: 'linear-gradient(to top, #9D4300, #F97316)' }}
            >
              <Plus className="w-3.5 h-3.5" /> Novo Empréstimo
            </button>
          )
        }
      />

      <SummaryCards cards={cards} />

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={[{
          value: situacaoFiltro,
          onChange: v => { setSituacaoFiltro(v); setPage(1) },
          placeholder: 'Todos os status',
          options: [
            { value: 'ativo', label: 'Ativo' },
            { value: 'quitado', label: 'Quitado' },
            { value: 'inadimplente', label: 'Inadimplente' },
          ]
        }]}
      />

      <DataTable
        columns={columns}
        data={paginated}
        keyField="id"
        onRowClick={setSelected}
        emptyMessage={search || situacaoFiltro ? 'Nenhum empréstimo corresponde ao filtro aplicado.' : 'Nenhum empréstimo cadastrado.'}
        onRetry={search || situacaoFiltro ? () => { setSearch(''); setSituacaoFiltro('') } : undefined}
        loading={loading}
      />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Detalhe do Empréstimo" subtitle={selected?.credor}>
        {selected && (
          <div className="space-y-3">
            {[
              ['Descrição', selected.descricao],
              ['Credor', selected.credor],
              ['Tipo', selected.tipo],
              ['Taxa (a.m.)', `${selected.taxaJuros}%`],
              ['Valor Original', fmt(selected.valorOriginal)],
              ['Saldo Devedor', <span className="font-bold text-error">{fmt(selected.saldoDevedor)}</span>],
              ['Início', new Date(selected.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')],
              ['Previsão Fim', new Date(selected.previsaoFim + 'T00:00:00').toLocaleDateString('pt-BR')],
              ['Status', <StatusBadge status={selected.situacao} />],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2.5 border-b border-surface-container">
                <span className="text-xs font-semibold uppercase tracking-label text-text-muted">{l}</span>
                <span className="text-sm font-medium text-on-surface">{v}</span>
              </div>
            ))}
            {selected.parcelas?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-label text-text-muted mb-3">Últimas Parcelas</p>
                <div className="space-y-2">
                  {selected.parcelas.slice(-3).map(p => (
                    <div key={p.numero} className="flex justify-between items-center p-3 rounded-lg bg-surface-container">
                      <span className="text-xs font-mono">#{p.numero}</span>
                      <span className="text-xs">{new Date(p.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      <span className="text-xs font-semibold">{fmt(p.valor)}</span>
                      <StatusBadge status={p.pago ? 'paga' : 'em-aberto'} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SlidePanel>

      <SlidePanel open={novoOpen} onClose={() => setNovoOpen(false)} title="Novo Empréstimo" subtitle="Registre uma nova dívida ou financiamento">
        <div className="space-y-4">
          <div>
            <Label required>Descrição</Label>
            <input
              type="text"
              placeholder="Ex: Financiamento de equipamento..."
              value={form.descricao}
              onChange={e => { set('descricao', e.target.value); setErrors(p => ({ ...p, descricao: false })) }}
              className={inputCls(errors.descricao)}
            />
            {errors.descricao && <p className="text-xs text-error mt-1">Campo obrigatório</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Credor</Label>
              <input
                type="text"
                placeholder="Ex: Banco Bradesco..."
                value={form.credor}
                onChange={e => { set('credor', e.target.value); setErrors(p => ({ ...p, credor: false })) }}
                className={inputCls(errors.credor)}
              />
              {errors.credor && <p className="text-xs text-error mt-1">Campo obrigatório</p>}
            </div>
            <div>
              <Label>Tipo</Label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls(false)}>
                {TIPOS.map(t => <option key={t} value={t}>{t.replace('-', ' ').toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Valor Original (R$)</Label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.valorOriginal}
                onChange={e => { set('valorOriginal', e.target.value); setErrors(p => ({ ...p, valorOriginal: false })) }}
                className={inputCls(errors.valorOriginal)}
              />
              {errors.valorOriginal && <p className="text-xs text-error mt-1">Informe um valor válido</p>}
            </div>
            <div>
              <Label>Taxa de Juros (a.m. %)</Label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 1.5"
                value={form.taxaJuros}
                onChange={e => set('taxaJuros', e.target.value)}
                className={inputCls(false)}
              />
            </div>
          </div>

          <div>
            <Label required>Centro de Custo</Label>
            <select
              value={form.centroCustoId}
              onChange={e => { set('centroCustoId', e.target.value); setErrors(p => ({ ...p, centroCustoId: false })) }}
              className={inputCls(errors.centroCustoId)}
            >
              <option value="">Selecione o centro de custo...</option>
              {CENTROS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {errors.centroCustoId && <p className="text-xs text-error mt-1">Centro de custo é obrigatório</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data de Início</Label>
              <input
                type="date"
                value={form.dataInicio}
                onChange={e => set('dataInicio', e.target.value)}
                className={inputCls(false)}
              />
            </div>
            <div>
              <Label required>Previsão de Fim</Label>
              <input
                type="date"
                value={form.previsaoFim}
                onChange={e => { set('previsaoFim', e.target.value); setErrors(p => ({ ...p, previsaoFim: false })) }}
                className={inputCls(errors.previsaoFim)}
              />
              {errors.previsaoFim && <p className="text-xs text-error mt-1">Campo obrigatório</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setNovoOpen(false)}
              className="flex-1 py-2.5 text-sm font-semibold text-text-muted border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={saving || !canSave}
              className="flex-1 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to top, #9D4300, #F97316)' }}
            >
              {saving ? 'Salvando...' : 'Registrar Empréstimo'}
            </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  )
}
