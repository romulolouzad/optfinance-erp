import { useState, useMemo, useEffect } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import PrintHeader from '../../components/shared/PrintHeader'
import SlidePanel from '../../components/shared/SlidePanel'
import { useMovimentacoes, addMovimentacao } from '../../hooks/useParcelas'
import { centrosCusto } from '../../data/index'
import { registrarHistorico } from '../../data/historico-store'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../hooks/use-toast'
import { ArrowUpRight, ArrowDownRight, CandlestickChart, Plus, Download } from 'lucide-react'
import { cn } from '../../utils/cn'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const PAGE_SIZE = 12
const CENTROS = centrosCusto.filter(c => c.ativo)

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

export default function FluxoDeCaixaPage() {
  const movimentacoes = useMovimentacoes()
  const { temPermissao } = useAuth()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t) }, [])
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [page, setPage] = useState(1)
  const [novoOpen, setNovoOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    descricao: '',
    categoria: '',
    tipo: 'entrada',
    valor: '',
    data: new Date().toISOString().slice(0, 10),
    centroCustoId: '',
    conta: '',
  })
  const [errors, setErrors] = useState({})

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

  const filtered = useMemo(() => {
    return movimentacoes.filter(m => {
      const matchSearch = !search || m.descricao.toLowerCase().includes(search.toLowerCase()) || m.categoria.toLowerCase().includes(search.toLowerCase())
      const matchTipo = !tipoFiltro || m.tipo === tipoFiltro
      return matchSearch && matchTipo
    })
  }, [movimentacoes, search, tipoFiltro])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const entradas = movimentacoes.filter(m => m.tipo === 'entrada').reduce((s, m) => s + (m.entrada || 0), 0)
  const saidas = movimentacoes.filter(m => m.tipo === 'saida').reduce((s, m) => s + (m.saida || 0), 0)
  const projetado = movimentacoes.filter(m => m.tipo === 'projetado')
  const saldoProjetado = projetado.reduce((s, m) => s + (m.entrada || 0) - (m.saida || 0), 0)

  const cards = [
    { title: 'Total Entradas', value: entradas, icon: ArrowUpRight, accent: '#2E7D32', type: 'currency' },
    { title: 'Total Saídas', value: saidas, icon: ArrowDownRight, accent: '#C62828', type: 'currency' },
    { title: 'Resultado Real', value: entradas - saidas, icon: CandlestickChart, accent: entradas > saidas ? '#2E7D32' : '#C62828', type: 'currency' },
    { title: 'Saldo Projetado', value: saldoProjetado, icon: CandlestickChart, accent: '#F57F17', type: 'currency' },
  ]

  const columns = [
    { header: 'Data', accessor: 'data', cell: r => new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR') },
    { header: 'Descrição', accessor: 'descricao', cell: r => <span className="font-medium">{r.descricao}</span> },
    { header: 'Categoria', accessor: 'categoria' },
    { header: 'Conta', accessor: 'conta' },
    { header: 'Entrada', accessor: 'entrada', align: 'right', cell: r => r.entrada ? <span className="font-semibold text-green-700">{fmt(r.entrada)}</span> : <span className="text-text-muted">—</span> },
    { header: 'Saída', accessor: 'saida', align: 'right', cell: r => r.saida ? <span className="font-semibold text-error">{fmt(r.saida)}</span> : <span className="text-text-muted">—</span> },
    { header: 'Tipo', accessor: 'tipo', sortable: false, cell: r => <StatusBadge status={r.tipo} /> },
  ]

  function validate() {
    const errs = {}
    if (!form.descricao.trim()) errs.descricao = true
    if (!form.valor || parseFloat(form.valor) <= 0) errs.valor = true
    if (!form.centroCustoId) errs.centroCustoId = true
    if (!form.data) errs.data = true
    return errs
  }

  const canSave = form.descricao.trim() && form.valor && parseFloat(form.valor) > 0 && form.centroCustoId && form.data

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
      addMovimentacao({
        descricao: form.descricao,
        categoria: form.categoria || 'Manual',
        tipo: form.tipo,
        data: form.data,
        conta: form.conta || '',
        centroCustoId: form.centroCustoId,
        entrada: form.tipo === 'entrada' ? valorNum : undefined,
        saida: form.tipo === 'saida' ? valorNum : undefined,
      })
      registrarHistorico({
        acao: `Criação de lançamento no Fluxo de Caixa — ${form.descricao} — ${fmt(valorNum)}`,
        tipoEvento: 'normal',
        entidade: 'FluxoDeCaixa',
        camposAlterados: [
          { campo: 'descricao', valorAnterior: null, novoValor: form.descricao },
          { campo: 'valor', valorAnterior: null, novoValor: form.valor },
          { campo: 'tipo', valorAnterior: null, novoValor: form.tipo },
          { campo: 'centroCustoId', valorAnterior: null, novoValor: form.centroCustoId },
        ],
      })
      toast({ title: 'Lançamento registrado com sucesso' })
      setSaving(false)
      setNovoOpen(false)
      setForm({ descricao: '', categoria: '', tipo: 'entrada', valor: '', data: new Date().toISOString().slice(0, 10), centroCustoId: '', conta: '' })
      setErrors({})
    }, 800)
  }

  const printFiltros = [
    tipoFiltro ? { label: 'Tipo', valor: tipoFiltro } : null,
    search ? { label: 'Busca', valor: search } : null,
  ].filter(Boolean)

  return (
    <div>
      <PrintHeader titulo="Fluxo de Caixa" filtros={printFiltros} />

      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Movimentações financeiras consolidadas"
        actions={
          <>
            {temPermissao('fluxo-de-caixa', 'exportar') && (
              <button
                onClick={() => {
                  registrarHistorico({ acao: 'Exportação de Fluxo de Caixa', tipoEvento: 'normal', entidade: 'FluxoDeCaixa' })
                  toast({ title: 'Exportação iniciada' })
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
              >
                <Download className="w-3.5 h-3.5" /> Exportar
              </button>
            )}
            {temPermissao('fluxo-de-caixa', 'criar') && (
              <button
                onClick={() => setNovoOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: 'linear-gradient(to top, #9D4300, #F97316)' }}
              >
                <Plus className="w-3.5 h-3.5" /> Novo Lançamento
              </button>
            )}
          </>
        }
      />

      <SummaryCards cards={cards} />

      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={[{
          value: tipoFiltro,
          onChange: v => { setTipoFiltro(v); setPage(1) },
          placeholder: 'Todos os tipos',
          options: [
            { value: 'entrada', label: 'Entradas' },
            { value: 'saida', label: 'Saídas' },
            { value: 'projetado', label: 'Projetados' },
          ]
        }]}
      />

      <DataTable
        columns={columns}
        data={paginated}
        keyField="id"
        emptyMessage={search || tipoFiltro ? 'Nenhum lançamento corresponde ao filtro aplicado.' : 'Nenhum lançamento cadastrado.'}
        onRetry={search || tipoFiltro ? () => { setSearch(''); setTipoFiltro(''); setPage(1) } : undefined}
        loading={loading}
      />
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      <SlidePanel open={novoOpen} onClose={() => setNovoOpen(false)} title="Novo Lançamento" subtitle="Registre uma entrada ou saída no fluxo de caixa">
        <div className="space-y-4">
          <div>
            <Label required>Descrição</Label>
            <input
              type="text"
              placeholder="Ex: Recebimento de parcela #001..."
              value={form.descricao}
              onChange={e => { set('descricao', e.target.value); setErrors(p => ({ ...p, descricao: false })) }}
              className={inputCls(errors.descricao)}
            />
            {errors.descricao && <p className="text-xs text-error mt-1">Campo obrigatório</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Tipo</Label>
              <select
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
                className={inputCls(false)}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="projetado">Projetado</option>
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
              <Label required>Data</Label>
              <input
                type="date"
                value={form.data}
                onChange={e => { set('data', e.target.value); setErrors(p => ({ ...p, data: false })) }}
                className={inputCls(errors.data)}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <input
                type="text"
                placeholder="Ex: Receita, Salário..."
                value={form.categoria}
                onChange={e => set('categoria', e.target.value)}
                className={inputCls(false)}
              />
            </div>
          </div>

          <div>
            <Label>Conta Financeira</Label>
            <input
              type="text"
              placeholder="Ex: Conta Corrente Principal"
              value={form.conta}
              onChange={e => set('conta', e.target.value)}
              className={inputCls(false)}
            />
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
              {saving ? 'Salvando...' : 'Salvar Lançamento'}
            </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  )
}
