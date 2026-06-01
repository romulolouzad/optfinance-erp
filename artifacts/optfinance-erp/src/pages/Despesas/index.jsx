import { useState, useMemo, useEffect } from 'react'
import { Plus, Download } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import SlidePanel from '../../components/shared/SlidePanel'
import despesasBase from '../../data/despesas.json'
import { centrosCusto } from '../../data/index'
import { useDespesas, addDespesa } from '../../data/despesas-store'
import { registrarHistorico } from '../../data/historico-store'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../hooks/use-toast'
import { MinusCircle, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '../../utils/cn'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const PAGE_SIZE = 10
const CENTROS = centrosCusto.filter(c => c.ativo)
const CATEGORIAS = [...new Set(despesasBase.map(d => d.categoria))].sort()

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

export default function DespesasPage() {
  const despesas = useDespesas()
  const { temPermissao } = useAuth()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t) }, [])
  const [search, setSearch] = useState('')
  const [situacaoFiltro, setSituacaoFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [novoOpen, setNovoOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    descricao: '',
    categoria: '',
    competencia: new Date().toISOString().slice(0, 7),
    vencimento: '',
    valor: '',
    centroCustoId: '',
  })
  const [errors, setErrors] = useState({})

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

  const filtered = useMemo(() => {
    return despesas.filter(d => {
      const matchSearch = !search || d.descricao.toLowerCase().includes(search.toLowerCase())
      const matchSituacao = !situacaoFiltro || d.situacao === situacaoFiltro
      const matchCategoria = !categoriaFiltro || d.categoria === categoriaFiltro
      return matchSearch && matchSituacao && matchCategoria
    })
  }, [despesas, search, situacaoFiltro, categoriaFiltro])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalPago = despesas.filter(d => d.situacao === 'paga').reduce((s, d) => s + d.valor, 0)
  const totalPrevisto = despesas.filter(d => d.situacao === 'prevista').reduce((s, d) => s + d.valor, 0)

  const cards = [
    { title: 'Total Pago', value: totalPago, icon: MinusCircle, accent: '#C62828', type: 'currency' },
    { title: 'A Pagar', value: totalPrevisto, icon: Clock, accent: '#F57F17', type: 'currency' },
    { title: 'Total de Lançamentos', value: despesas.length, icon: MinusCircle, type: 'number' },
    { title: 'Canceladas', value: despesas.filter(d => d.situacao === 'cancelada').length, icon: AlertTriangle, type: 'number', accent: '#6B7280' },
  ]

  const columns = [
    { header: 'Descrição', accessor: 'descricao', cell: r => <span className="font-medium">{r.descricao}</span> },
    { header: 'Categoria', accessor: 'categoria' },
    { header: 'Competência', accessor: 'competencia', cell: r => { const [y, m] = r.competencia.split('-'); return `${m}/${y}` } },
    { header: 'Vencimento', accessor: 'vencimento', cell: r => new Date(r.vencimento + 'T00:00:00').toLocaleDateString('pt-BR') },
    { header: 'Valor', accessor: 'valor', align: 'right', cell: r => <span className="font-semibold text-error">{fmt(r.valor)}</span> },
    { header: 'Status', accessor: 'situacao', sortable: false, cell: r => <StatusBadge status={r.situacao} /> },
  ]

  function validate() {
    const errs = {}
    if (!form.descricao.trim()) errs.descricao = true
    if (!form.valor || parseFloat(form.valor) <= 0) errs.valor = true
    if (!form.centroCustoId) errs.centroCustoId = true
    if (!form.vencimento) errs.vencimento = true
    return errs
  }

  const canSave = form.descricao.trim() && form.valor && parseFloat(form.valor) > 0 && form.centroCustoId && form.vencimento

  function handleSalvar() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }
    setSaving(true)
    setTimeout(() => {
      const valorNum = parseFloat(form.valor)
      addDespesa({
        descricao: form.descricao,
        categoria: form.categoria || 'Outros',
        competencia: form.competencia || new Date().toISOString().slice(0, 7),
        vencimento: form.vencimento,
        valor: valorNum,
        centroCustoId: form.centroCustoId,
      })
      registrarHistorico({
        acao: `Nova despesa criada — ${form.descricao} — ${fmt(valorNum)}`,
        tipoEvento: 'normal',
        entidade: 'Despesa',
        camposAlterados: [
          { campo: 'descricao', valorAnterior: null, novoValor: form.descricao },
          { campo: 'valor', valorAnterior: null, novoValor: form.valor },
          { campo: 'categoria', valorAnterior: null, novoValor: form.categoria },
          { campo: 'centroCustoId', valorAnterior: null, novoValor: form.centroCustoId },
        ],
      })
      toast({ title: 'Despesa registrada com sucesso' })
      setSaving(false)
      setNovoOpen(false)
      setForm({ descricao: '', categoria: '', competencia: new Date().toISOString().slice(0, 7), vencimento: '', valor: '', centroCustoId: '' })
      setErrors({})
    }, 800)
  }

  const hasActiveFilters = search || situacaoFiltro || categoriaFiltro

  return (
    <div>
      <PageHeader
        title="Despesas"
        subtitle="Controle de custos e despesas da empresa"
        actions={
          <>
            {temPermissao('despesas', 'exportar') && (
              <button
                onClick={() => {
                  registrarHistorico({ acao: 'Exportação de relatório de Despesas', tipoEvento: 'normal', entidade: 'Despesa' })
                  toast({ title: 'Exportação iniciada' })
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
              >
                <Download className="w-3.5 h-3.5" /> Exportar
              </button>
            )}
            {temPermissao('despesas', 'criar') && (
              <button
                onClick={() => setNovoOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-lg transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: 'linear-gradient(to top, #9D4300, #F97316)' }}
              >
                <Plus className="w-3.5 h-3.5" /> Nova Despesa
              </button>
            )}
          </>
        }
      />
      <SummaryCards cards={cards} />
      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={[
          {
            value: situacaoFiltro,
            onChange: v => { setSituacaoFiltro(v); setPage(1) },
            placeholder: 'Todos os status',
            options: [
              { value: 'paga', label: 'Paga' },
              { value: 'prevista', label: 'Prevista' },
              { value: 'cancelada', label: 'Cancelada' },
            ]
          },
          {
            value: categoriaFiltro,
            onChange: v => { setCategoriaFiltro(v); setPage(1) },
            placeholder: 'Categoria',
            options: CATEGORIAS.map(c => ({ value: c, label: c }))
          }
        ]}
      />
      <DataTable
        columns={columns}
        data={paginated}
        keyField="id"
        onRowClick={setSelected}
        emptyMessage={hasActiveFilters ? 'Nenhuma despesa corresponde ao filtro aplicado.' : 'Nenhuma despesa cadastrada.'}
        onRetry={hasActiveFilters ? () => { setSearch(''); setSituacaoFiltro(''); setCategoriaFiltro(''); setPage(1) } : undefined}
        loading={loading}
      />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Detalhe da Despesa" subtitle={selected?.descricao}>
        {selected && (
          <div className="space-y-4 text-sm">
            {[
              ['Descrição', selected.descricao],
              ['Categoria', selected.categoria],
              ['Competência', selected.competencia],
              ['Vencimento', new Date(selected.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')],
              ['Valor', <span className="text-error font-bold">{fmt(selected.valor)}</span>],
              ['Situação', <StatusBadge status={selected.situacao} />],
              ['Conta', selected.contaFinanceiraId],
              ...(selected.pagamento ? [['Data Pagamento', new Date(selected.pagamento + 'T00:00:00').toLocaleDateString('pt-BR')]] : []),
              ...(selected.comprovante ? [['Comprovante', selected.comprovante]] : []),
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between items-start py-2.5 border-b border-surface-container">
                <span className="text-xs font-semibold uppercase tracking-label text-text-muted shrink-0 mr-4">{l}</span>
                <span className="text-right text-on-surface font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}
      </SlidePanel>

      <SlidePanel open={novoOpen} onClose={() => setNovoOpen(false)} title="Nova Despesa" subtitle="Registre um novo lançamento de despesa">
        <div className="space-y-4">
          <div>
            <Label required>Descrição</Label>
            <input
              type="text"
              placeholder="Ex: Aluguel do escritório..."
              value={form.descricao}
              onChange={e => { set('descricao', e.target.value); setErrors(p => ({ ...p, descricao: false })) }}
              className={inputCls(errors.descricao)}
            />
            {errors.descricao && <p className="text-xs text-error mt-1">Campo obrigatório</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <select
                value={form.categoria}
                onChange={e => set('categoria', e.target.value)}
                className={inputCls(false)}
              >
                <option value="">Selecione...</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label required>Valor (R$)</Label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.valor}
                onChange={e => { set('valor', e.target.value); setErrors(p => ({ ...p, valor: false })) }}
                className={inputCls(errors.valor)}
              />
              {errors.valor && <p className="text-xs text-error mt-1">Informe um valor válido</p>}
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
              <Label>Competência</Label>
              <input
                type="month"
                value={form.competencia}
                onChange={e => set('competencia', e.target.value)}
                className={inputCls(false)}
              />
            </div>
            <div>
              <Label required>Vencimento</Label>
              <input
                type="date"
                value={form.vencimento}
                onChange={e => { set('vencimento', e.target.value); setErrors(p => ({ ...p, vencimento: false })) }}
                className={inputCls(errors.vencimento)}
              />
              {errors.vencimento && <p className="text-xs text-error mt-1">Campo obrigatório</p>}
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
              {saving ? 'Salvando...' : 'Salvar Despesa'}
            </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  )
}
