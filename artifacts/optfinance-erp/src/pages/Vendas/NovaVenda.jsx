import { useState, useMemo } from 'react'
import { Link, useLocation } from 'wouter'
import { AlertTriangle, ChevronRight, Info } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { clientes, colaboradores, centrosCusto } from '../../data/index'
import { getImpostos } from '../../data/configuracoes-store'
import { vendas, addVenda, getNextVendaId, getNextVendaNumero, detectDuplicatas } from '../../data/vendas-store'
import { registrarHistorico } from '../../data/historico-store'
import { toast } from '../../hooks/use-toast'
import { useAuth } from '../../context/AuthContext'

const CENTROS = centrosCusto.filter(c => c.ativo)

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const PERIODICIDADE_MESES = { mensal: 1, bimestral: 2, trimestral: 3, semestral: 6, anual: 12 }

function fmtBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

function addMonths(dateStr, n) {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function addMonthsToDate(dateStr, n) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  d.setMonth(d.getMonth() + n)
  return d.toISOString().split('T')[0]
}

function fmtCompetencia(c) {
  if (!c) return '-'
  const [y, m] = c.split('-')
  return `${MESES[parseInt(m, 10) - 1]} / ${y}`
}

function SectionLabel({ n, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-bold text-primary-container uppercase tracking-widest">SECTION {String(n).padStart(2, '0')}</span>
      <span className="flex-1 h-px bg-surface-container" />
      <span className="text-sm font-semibold text-on-surface">{title}</span>
    </div>
  )
}

function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-label text-text-muted mb-1">
      {children}{required && <span className="text-error ml-0.5">*</span>}
    </label>
  )
}

function inputCls(err) {
  return `w-full px-3 py-2 text-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-text-muted focus:outline-none focus:ring-2 transition-shadow ${err ? 'ring-2 ring-error' : 'focus:ring-primary-container/40'}`
}

const CLIENTES_ATIVOS = clientes.filter(c => !c.inativo)
const COLABORADORES_ATIVOS = colaboradores.filter(c => c.ativo !== false)

const DIAS_GERACAO = [
  { value: '1', label: '1º dia' },
  { value: '5', label: '5º dia' },
  { value: '10', label: '10º dia' },
  { value: '15', label: '15º dia' },
  { value: '19', label: '19º dia' },
  { value: 'ultimo', label: 'Último dia' },
]

export default function NovaVenda() {
  const [, navigate] = useLocation()
  const { usuario } = useAuth()

  const vendedorDefault = useMemo(() => {
    const nome = usuario?.usuario || 'Admin User'
    const col = COLABORADORES_ATIVOS.find(c => c.nome.toLowerCase().includes(nome.split(' ')[0].toLowerCase()))
    return col?.id || (COLABORADORES_ATIVOS[0]?.id || '')
  }, [usuario])

  const [form, setForm] = useState({
    clienteId: '',
    vendedorId: vendedorDefault,
    tipoVenda: 'pontual',
    estadoInicial: 'ativa',
    valorTotal: '',
    competencia: '',
    descricao: '',
    centroCustoId: '',
    qtdParcelas: '',
    periodicidade: 'mensal',
    dataInicio: '',
    impostos: { ...getImpostos() },
    recorrencia: {
      intervalo: 1,
      unidade: 'meses',
      diaGeracao: '1',
      termino: 'indeterminado',
      dataTermino: '',
      ocorrencias: '',
    },
  })

  const [dupOk, setDupOk] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))
  const setImposto = (field, val) => setForm(p => ({ ...p, impostos: { ...p.impostos, [field]: val } }))
  const setRecorrencia = (field, val) => setForm(p => ({ ...p, recorrencia: { ...p.recorrencia, [field]: val } }))

  const clienteSelecionado = CLIENTES_ATIVOS.find(c => c.id === form.clienteId)
  const vendedorSelecionado = COLABORADORES_ATIVOS.find(c => c.id === form.vendedorId)

  const valorNum = parseFloat(String(form.valorTotal).replace(',', '.')) || 0

  const isDuplicata = useMemo(() => {
    if (!form.clienteId || !form.valorTotal || !form.competencia) return false
    const clienteNome = clienteSelecionado?.nomeFantasia || ''
    return vendas.some(v =>
      v.clienteNome === clienteNome &&
      Math.abs(v.valorTotal - valorNum) < 0.01 &&
      v.competencia === form.competencia
    )
  }, [form.clienteId, form.valorTotal, form.competencia, clienteSelecionado, valorNum])

  const parcelas = useMemo(() => {
    const qtd = parseInt(form.qtdParcelas)
    const periodos = PERIODICIDADE_MESES[form.periodicidade] || 1
    if (!qtd || !form.dataInicio || !form.competencia) return null
    const valorParcela = valorNum > 0 ? Math.floor((valorNum / qtd) * 100) / 100 : 0
    const diff = valorNum > 0 ? parseFloat((valorNum - valorParcela * qtd).toFixed(2)) : 0
    return Array.from({ length: qtd }, (_, i) => {
      const competenciaStr = addMonths(form.competencia, i * periodos)
      const vencimento = addMonthsToDate(form.dataInicio, i * periodos)
      return {
        numero: `${String(i + 1).padStart(2, '0')}/${String(qtd).padStart(2, '0')}`,
        competencia: fmtCompetencia(competenciaStr),
        vencimento: vencimento ? new Date(vencimento + 'T00:00:00').toLocaleDateString('pt-BR') : '-',
        valor: i === qtd - 1 ? valorParcela + diff : valorParcela,
      }
    })
  }, [form.qtdParcelas, form.periodicidade, form.dataInicio, form.competencia, valorNum])

  const somaParcelas = parcelas ? parcelas.reduce((s, p) => s + p.valor, 0) : 0
  const somaOk = valorNum <= 0 || !parcelas || Math.abs(somaParcelas - valorNum) < 0.02

  const primeiraVendaDate = useMemo(() => {
    if (!form.recorrencia.diaGeracao || !form.competencia) return ''
    const [y, m] = form.competencia.split('-').map(Number)
    const dia = form.recorrencia.diaGeracao === 'ultimo'
      ? new Date(y, m, 0).getDate()
      : parseInt(form.recorrencia.diaGeracao)
    return new Date(y, m - 1, dia).toLocaleDateString('pt-BR')
  }, [form.recorrencia.diaGeracao, form.competencia])

  const vigenciaTotal = useMemo(() => {
    const { termino, dataTermino, ocorrencias } = form.recorrencia
    const intervalo = parseInt(form.recorrencia.intervalo) || 1
    if (termino === 'indeterminado') return 'Indeterminado'
    if (termino === 'ocorrencias') {
      const oc = parseInt(ocorrencias)
      if (!oc) return '-'
      const meses = oc * intervalo
      return `${meses} meses`
    }
    if (termino === 'periodo' && dataTermino && form.competencia) {
      const [y1, m1] = form.competencia.split('-').map(Number)
      const [y2, m2] = dataTermino.slice(0, 7).split('-').map(Number)
      const meses = (y2 - y1) * 12 + (m2 - m1)
      return meses > 0 ? `${meses} meses` : '-'
    }
    return '-'
  }, [form.recorrencia, form.competencia])

  function validate() {
    const errs = {}
    if (!form.clienteId) errs.clienteId = true
    if (!form.vendedorId) errs.vendedorId = true
    if (!form.valorTotal || valorNum <= 0) errs.valorTotal = true
    if (!form.competencia) errs.competencia = true
    if (!form.centroCustoId) errs.centroCustoId = true
    return errs
  }

  function handleSalvar() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    const novoId = getNextVendaId()
    const novoNumero = getNextVendaNumero()
    const clienteNome = clienteSelecionado?.nomeFantasia || clienteSelecionado?.razaoSocial || ''
    const vendedorNome = vendedorSelecionado?.nome || ''
    const ccNome = CENTROS.find(c => c.id === form.centroCustoId)?.nome || ''

    const qtd = parseInt(form.qtdParcelas) || 0
    const parcelasGeradas = parcelas
      ? parcelas.map((p, i) => ({
          numero: p.numero,
          vencimento: p.vencimento !== '-' ? p.vencimento : '',
          valor: p.valor,
          situacao: 'em-aberto',
        }))
      : []

    const novaVenda = {
      id: novoId,
      numero: novoNumero,
      clienteNome,
      clienteId: form.clienteId,
      vendedor: vendedorNome,
      vendedorId: form.vendedorId,
      tipoVenda: form.tipoVenda,
      estadoInicial: form.estadoInicial,
      valorTotal: valorNum,
      competencia: form.competencia,
      situacao: form.estadoInicial,
      descricao: form.descricao,
      centroCustoId: form.centroCustoId,
      centroCusto: ccNome,
      impostos: { ...form.impostos },
      parcelas: parcelasGeradas,
      ...(form.tipoVenda === 'recorrente' ? { recorrencia: { ...form.recorrencia } } : {}),
    }

    addVenda(novaVenda)

    registrarHistorico({
      acao: `Criação de venda — ${clienteNome} — ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorNum)}.`,
      tipoEvento: 'normal',
      entidade: 'Venda',
      entidadeId: novoId,
      camposAlterados: [
        { campo: 'cliente', valorAnterior: null, novoValor: clienteNome },
        { campo: 'valorTotal', valorAnterior: null, novoValor: valorNum },
        { campo: 'centroCustoId', valorAnterior: null, novoValor: form.centroCustoId },
      ],
    })

    toast({ title: 'Venda criada com sucesso' })
    navigate(`/vendas/${novoId}`)
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-4">
        <Link href="/vendas" className="hover:text-primary-container transition-colors">Vendas &amp; Contratos</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-on-surface font-semibold">Nova Venda</span>
      </nav>

      <PageHeader title="Nova Venda" />

      {/* Section 01 */}
      <div className="bg-surface-container-lowest rounded-xl p-6 mb-4" style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}>
        <SectionLabel n={1} title="Dados Comerciais" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Cliente</Label>
            <select
              value={form.clienteId}
              onChange={e => { set('clienteId', e.target.value); setErrors(p => ({ ...p, clienteId: false })) }}
              className={inputCls(errors.clienteId)}
            >
              <option value="">Selecione um cliente...</option>
              {CLIENTES_ATIVOS.map(c => (
                <option key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial}</option>
              ))}
            </select>
          </div>

          <div>
            <Label required>Vendedor</Label>
            <select
              value={form.vendedorId}
              onChange={e => { set('vendedorId', e.target.value); setErrors(p => ({ ...p, vendedorId: false })) }}
              className={inputCls(errors.vendedorId)}
            >
              <option value="">Selecione um vendedor...</option>
              {COLABORADORES_ATIVOS.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.cargo}</option>
              ))}
            </select>
          </div>

          <div>
            <Label required>Centro de Custo</Label>
            <select
              value={form.centroCustoId}
              onChange={e => { set('centroCustoId', e.target.value); setErrors(p => ({ ...p, centroCustoId: false })) }}
              className={inputCls(errors.centroCustoId)}
            >
              <option value="">Selecione o centro de custo...</option>
              {CENTROS.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {errors.centroCustoId && <p className="text-xs text-error mt-1">Centro de custo é obrigatório</p>}
          </div>

          <div>
            <Label>Tipo de Venda</Label>
            <div className="flex items-center gap-4 py-2">
              {['pontual', 'recorrente'].map(tipo => (
                <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoVenda"
                    value={tipo}
                    checked={form.tipoVenda === tipo}
                    onChange={() => set('tipoVenda', tipo)}
                    className="accent-primary-container w-4 h-4"
                  />
                  <span className="text-sm text-on-surface capitalize">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Estado Inicial</Label>
            <div className="flex items-center gap-4 py-2">
              {['projecao', 'ativa'].map(estado => (
                <label key={estado} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="estadoInicial"
                    value={estado}
                    checked={form.estadoInicial === estado}
                    onChange={() => set('estadoInicial', estado)}
                    className="accent-primary-container w-4 h-4"
                  />
                  <span className="text-sm text-on-surface capitalize">{estado === 'projecao' ? 'Projeção' : 'Ativa'}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label required>Valor Total</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted font-semibold">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valorTotal}
                onChange={e => { set('valorTotal', e.target.value); setErrors(p => ({ ...p, valorTotal: false })) }}
                placeholder="0,00"
                className={`${inputCls(errors.valorTotal)} pl-9`}
              />
            </div>
          </div>

          <div>
            <Label required>Competência</Label>
            <input
              type="month"
              value={form.competencia}
              onChange={e => { set('competencia', e.target.value); setErrors(p => ({ ...p, competencia: false })) }}
              className={inputCls(errors.competencia)}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Descrição</Label>
            <textarea
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Detalhes adicionais da venda..."
              rows={3}
              className={`${inputCls(false)} resize-none`}
            />
          </div>
        </div>

        {/* Duplicate alert */}
        {isDuplicata && !dupOk && (
          <div className="mt-4 flex items-start gap-3 rounded-lg p-4" style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-800">Possível duplicidade detectada</p>
              <p className="text-sm text-orange-700 mt-0.5">Já existe uma venda para este cliente com o mesmo valor e competência. Deseja continuar?</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setDupOk(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-orange-400 text-orange-700 hover:bg-orange-50 transition-colors"
                >
                  Sim, continuar
                </button>
                <button
                  onClick={() => {}}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 02 */}
      <div className="bg-surface-container-lowest rounded-xl p-6 mb-4" style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}>
        <SectionLabel n={2} title="Parcelamento" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Qtd. Parcelas</Label>
            <input
              type="number"
              min="1"
              max="360"
              value={form.qtdParcelas}
              onChange={e => set('qtdParcelas', e.target.value)}
              placeholder="Ex: 12"
              className={inputCls(false)}
            />
          </div>

          <div>
            <Label>Periodicidade</Label>
            <select
              value={form.periodicidade}
              onChange={e => set('periodicidade', e.target.value)}
              className={inputCls(false)}
            >
              <option value="mensal">Mensal</option>
              <option value="bimestral">Bimestral</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          <div>
            <Label>Data de Início</Label>
            <input
              type="date"
              value={form.dataInicio}
              onChange={e => set('dataInicio', e.target.value)}
              className={inputCls(false)}
            />
          </div>
        </div>

        {/* Parcelas preview */}
        {!parcelas ? (
          <div className="rounded-lg bg-surface-container p-4 text-sm text-text-muted text-center">
            Aguardando preenchimento dos dados básicos para gerar a pré-visualização...
          </div>
        ) : (
          <div>
            {!somaOk && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFF7ED' }}>
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-orange-700 font-medium">
                  ⚠️ Soma das parcelas ({fmtBRL(somaParcelas)}) difere do valor total ({fmtBRL(valorNum)})
                </span>
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border border-surface-container">
              <table className="w-full text-sm">
                <thead className="bg-surface-container">
                  <tr>
                    {['Nº', 'Competência', 'Vencimento', 'Valor'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-label text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parcelas.slice(0, 12).map((p, i) => (
                    <tr key={i} className="border-t border-surface-container hover:bg-surface-container/50">
                      <td className="px-4 py-2.5 font-mono text-xs">{p.numero}</td>
                      <td className="px-4 py-2.5">{p.competencia}</td>
                      <td className="px-4 py-2.5">{p.vencimento}</td>
                      <td className="px-4 py-2.5 font-semibold text-primary-container">{fmtBRL(p.valor)}</td>
                    </tr>
                  ))}
                  {parcelas.length > 12 && (
                    <tr className="border-t border-surface-container">
                      <td colSpan={4} className="px-4 py-2 text-xs text-text-muted text-center">
                        + {parcelas.length - 12} parcela{parcelas.length - 12 > 1 ? 's' : ''} não exibida{parcelas.length - 12 > 1 ? 's' : ''}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 03 */}
      <div className="bg-surface-container-lowest rounded-xl p-6 mb-4" style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}>
        <SectionLabel n={3} title="Impostos" />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          {[
            { key: 'iss', label: 'ISS %' },
            { key: 'pis', label: 'PIS %' },
            { key: 'cofins', label: 'COFINS %' },
            { key: 'csll', label: 'CSLL %' },
            { key: 'irpj', label: 'IRPJ %' },
          ].map(({ key, label }) => (
            <div key={key}>
              <Label>{label}</Label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.impostos[key]}
                onChange={e => setImposto(key, e.target.value)}
                className={inputCls(false)}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-text-muted flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Os impostos podem ser ajustados manualmente a qualquer momento.
          </p>
          <button
            onClick={() => setForm(p => ({ ...p, impostos: { ...getImpostos() } }))}
            className="text-xs font-semibold text-primary-container hover:underline transition-colors"
          >
            Aplicar padrão de impostos
          </button>
        </div>
      </div>

      {/* Recorrência (condicional) */}
      {form.tipoVenda === 'recorrente' && (
        <div className="bg-surface-container-lowest rounded-xl p-6 mb-4" style={{ boxShadow: '0 1px 8px -2px rgba(157,67,0,0.06)' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Configurações de Recorrência</span>
            <span className="flex-1 h-px bg-surface-container" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Repetir venda a cada</Label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={form.recorrencia.intervalo}
                  onChange={e => setRecorrencia('intervalo', e.target.value)}
                  className={`${inputCls(false)} w-24`}
                />
                <select
                  value={form.recorrencia.unidade}
                  onChange={e => setRecorrencia('unidade', e.target.value)}
                  className={inputCls(false)}
                >
                  <option value="meses">Mês / meses</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Dia de geração das vendas</Label>
              <select
                value={form.recorrencia.diaGeracao}
                onChange={e => setRecorrencia('diaGeracao', e.target.value)}
                className={inputCls(false)}
              >
                {DIAS_GERACAO.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Data da primeira venda</Label>
              <div className="px-3 py-2 rounded-lg text-sm font-semibold text-primary-container bg-primary-container/5 border border-primary-container/20">
                {primeiraVendaDate || '—'}
              </div>
              <p className="text-xs text-text-muted mt-1">Calculada automaticamente</p>
            </div>

            <div>
              <Label>Término da recorrência</Label>
              <select
                value={form.recorrencia.termino}
                onChange={e => setRecorrencia('termino', e.target.value)}
                className={inputCls(false)}
              >
                <option value="indeterminado">Indeterminado</option>
                <option value="periodo">Em um período específico</option>
                <option value="ocorrencias">Após X ocorrências</option>
              </select>
            </div>

            {form.recorrencia.termino === 'periodo' && (
              <div>
                <Label>Data de término</Label>
                <input
                  type="date"
                  value={form.recorrencia.dataTermino}
                  onChange={e => setRecorrencia('dataTermino', e.target.value)}
                  className={inputCls(false)}
                />
              </div>
            )}

            {form.recorrencia.termino === 'ocorrencias' && (
              <div>
                <Label>Número de ocorrências</Label>
                <input
                  type="number"
                  min="1"
                  value={form.recorrencia.ocorrencias}
                  onChange={e => setRecorrencia('ocorrencias', e.target.value)}
                  placeholder="Ex: 12"
                  className={inputCls(false)}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <Label>Vigência total</Label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#F973161A', color: '#C2410C' }}>
                {vigenciaTotal}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-8">
        <Link href="/vendas">
          <button className="px-4 py-2 text-sm rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container transition-colors">
            Cancelar
          </button>
        </Link>
        <button
          onClick={handleSalvar}
          disabled={!!Object.keys(validate()).length}
          className="flex items-center gap-2 px-6 py-2.5 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Salvar Venda
        </button>
      </div>
    </div>
  )
}
