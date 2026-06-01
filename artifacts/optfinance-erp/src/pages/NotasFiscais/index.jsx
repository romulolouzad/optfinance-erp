import { useState, useMemo, useCallback, useRef } from 'react'
import { useLocation } from 'wouter'
import {
  FileText, Upload, AlertTriangle, TrendingUp, Search,
  Calendar, CheckCircle, Paperclip, Eye, MoreVertical, Loader2
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import FormEmitirNota from './FormEmitirNota'
import { notasFiscais } from '../../data/notas-fiscais-store'
import { vendas } from '../../data/vendas-store'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../utils/cn'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const TABS = ['Visão Geral', 'Pendentes', 'Arquivados']

const STATUS_MAP = {
  emitida:  { label: 'Emitida',  bg: '#D1FAE5', color: '#065F46' },
  pendente: { label: 'Pendente', bg: '#FEF3C7', color: '#92400E' },
  arquivada:{ label: 'Arquivada',bg: '#F3F4F6', color: '#374151' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, bg: '#F3F4F6', color: '#374151' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

function DropUploadCard({ label, iconType, onFileReceived }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploaded, setUploaded] = useState(null)
  const inputRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setUploaded(file.name)
      toast({ title: 'Arquivo recebido com sucesso' })
      onFileReceived?.(file)
    }, 1000)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const Icon = iconType === 'pdf' ? FileText : FileText

  return (
    <div
      className={cn(
        'flex-1 h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none',
        dragOver ? 'border-orange-500 bg-orange-50/80' :
        uploaded ? 'border-green-400 bg-green-50' :
        'border-orange-400/40 hover:border-orange-500 hover:bg-orange-50/50'
      )}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={iconType === 'pdf' ? '.pdf' : '.xml'}
        className="hidden"
        onChange={e => { const f = e.target.files[0]; if (f) handleFile(f) }}
      />
      {uploading ? (
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      ) : (
        <>
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            uploaded ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
          )}>
            {iconType === 'pdf'
              ? <FileText className="w-6 h-6" />
              : <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="9" y1="9" x2="11" y2="9"/></svg>
            }
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-bold text-gray-900">
              {iconType === 'pdf' ? 'PDF da NF' : 'XML da NF'}
            </p>
            {uploaded ? (
              <p className="text-[10px] text-green-600 mt-1 max-w-[140px] truncate">{uploaded}</p>
            ) : (
              <p className="text-[10px] text-gray-500 mt-1">Arraste ou clique para enviar</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function NotasFiscaisPage() {
  const [, navigate] = useLocation()
  const [activeTab, setActiveTab] = useState('Visão Geral')
  const [tipoNF, setTipoNF] = useState('cliente')
  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [periodoInicio, setPeriodoInicio] = useState('2026-05-01')
  const [periodoFim, setPeriodoFim] = useState('2026-05-31')
  const [modalOpen, setModalOpen] = useState(false)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick(t => t + 1), [])

  const allNFs = useMemo(() => [...notasFiscais], [tick])

  const filtered = useMemo(() => {
    return allNFs.filter(nf => {
      if (nf.tipo !== tipoNF) return false

      if (activeTab === 'Pendentes' && nf.status !== 'pendente') return false
      if (activeTab === 'Arquivados' && nf.status !== 'arquivada') return false
      if (activeTab === 'Visão Geral' && nf.status === 'arquivada') return false

      if (search && !nf.clienteNome.toLowerCase().includes(search.toLowerCase()) &&
          !nf.numero.toLowerCase().includes(search.toLowerCase())) return false

      if (statusFiltro && nf.status !== statusFiltro) return false

      if (periodoInicio && nf.competencia < periodoInicio.slice(0, 7)) return false
      if (periodoFim && nf.competencia > periodoFim.slice(0, 7)) return false

      return true
    })
  }, [allNFs, activeTab, tipoNF, search, statusFiltro, periodoInicio, periodoFim])

  const vendasSemNF = useMemo(() => {
    const vinculadas = new Set(allNFs.map(n => n.vendaId))
    return vendas.filter(v =>
      (v.situacao === 'ativa' || v.situacao === 'encerrada') &&
      !vinculadas.has(v.id)
    )
  }, [allNFs])

  const nfsMes = useMemo(() =>
    allNFs.filter(n => n.status === 'emitida' && n.tipo === 'cliente' && n.competencia === '2026-05'),
    [allNFs]
  )
  const totalEmitido = nfsMes.reduce((s, n) => s + n.valor, 0)

  const pendentesUpload = allNFs.filter(n => n.status === 'pendente' && n.tipo === tipoNF).length

  const metaFaturamento = 850000
  const progressoPct = Math.min(100, Math.round((totalEmitido / metaFaturamento) * 100))

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-surface-container-high">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-3 text-sm font-semibold transition-colors relative',
              activeTab === tab
                ? 'text-[#F97316]'
                : 'text-text-muted hover:text-on-surface'
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-t" />
            )}
          </button>
        ))}
      </div>

      <PageHeader
        title="Notas Fiscais"
        subtitle="Gerenciamento centralizado de NFs de clientes e vendedores."
      />

      {/* NF Type Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTipoNF('cliente')}
          className={cn(
            'px-6 py-2 text-sm font-bold rounded-lg transition-all',
            tipoNF === 'cliente'
              ? 'bg-[#F97316] text-white shadow-sm'
              : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
          )}
        >
          NF Cliente
        </button>
        <button
          onClick={() => setTipoNF('vendedor')}
          className={cn(
            'px-6 py-2 text-sm font-bold rounded-lg transition-all',
            tipoNF === 'vendedor'
              ? 'bg-[#F97316] text-white shadow-sm'
              : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
          )}
        >
          NF Vendedor
        </button>
      </div>

      {/* Filter Bar + Actions */}
      <div className="bg-white rounded-xl border border-surface-container-high p-5 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Client search */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5">
              Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cliente ou NF..."
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Period */}
          <div className="w-64">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5">
              Período
            </label>
            <div className="flex items-center gap-1">
              <div className="relative flex-1">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="date"
                  value={periodoInicio}
                  onChange={e => setPeriodoInicio(e.target.value)}
                  className="w-full pl-8 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <span className="text-gray-400 text-xs">—</span>
              <input
                type="date"
                value={periodoFim}
                onChange={e => setPeriodoFim(e.target.value)}
                className="flex-1 px-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div className="w-44">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5">
              Status
            </label>
            <select
              value={statusFiltro}
              onChange={e => setStatusFiltro(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent appearance-none"
            >
              <option value="">Todos os Status</option>
              <option value="emitida">Emitida</option>
              <option value="pendente">Pendente</option>
              <option value="arquivada">Arquivada</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#F97316] text-white text-sm font-bold rounded-lg hover:bg-[#9D4300] transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Emitir Nota
            </button>
            <button
              onClick={() => toast({ title: 'Importação de XML em desenvolvimento' })}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-[#9D4300] bg-white text-sm font-bold rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Importar XML
            </button>
          </div>
        </div>
      </div>

      {/* Drag-and-drop upload area */}
      <div className="bg-white rounded-xl border border-surface-container-high p-5 mb-6 shadow-sm">
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-4">
          Anexar Arquivos Fiscais
        </p>
        <div className="flex gap-4">
          <DropUploadCard iconType="pdf" />
          <DropUploadCard iconType="xml" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Emitido */}
        <div className="bg-white rounded-xl border-l-4 border-green-500 shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
            Total Emitido (Mês)
          </p>
          <p className="text-2xl font-bold text-gray-900">{fmt(totalEmitido)}</p>
          <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12% vs mês anterior
          </p>
        </div>

        {/* Pendentes de Upload */}
        <div className="bg-white rounded-xl border-l-4 border-amber-400 shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
            Pendentes de Upload
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {String(pendentesUpload).padStart(2, '0')} Notas
          </p>
          <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Atenção ao prazo fiscal
          </p>
        </div>

        {/* Vendas Sem NF */}
        <div className="bg-white rounded-xl border-l-4 border-[#F97316] shadow-sm p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
            Vendas Sem NF
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {vendasSemNF.length} Registros
          </p>
          <button
            onClick={() => navigate('/vendas?semNF=true')}
            className="text-[10px] text-[#F97316] font-bold mt-2 hover:underline block"
          >
            Ver irregularidades
          </button>
        </div>

        {/* Meta de Faturamento */}
        <div className="bg-white rounded-xl border-l-4 border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
            Meta de Faturamento
          </p>
          <div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F97316] rounded-full transition-all"
                style={{ width: `${progressoPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-[10px] text-gray-500">{fmt(totalEmitido)}</p>
              <p className="text-[10px] font-bold text-gray-900">{progressoPct}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* NF Table */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">
            {activeTab} — {tipoNF === 'cliente' ? 'NF Cliente' : 'NF Vendedor'}
          </p>
          <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5 font-semibold">
            {filtered.length} registros
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <FileText className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">Nenhuma nota fiscal encontrada</p>
            <p className="text-xs text-gray-400 mt-1">Ajuste os filtros ou emita uma nova nota</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  {['ID NF', 'Venda', 'Cliente', 'Competência', 'Valor', 'Status', 'PDF', 'XML', 'Emissão', 'Ações'].map(h => (
                    <th
                      key={h}
                      className={cn(
                        'px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500',
                        ['PDF', 'XML', 'Ações'].includes(h) ? 'text-center' : ''
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(nf => (
                  <tr key={nf.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{nf.numero}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">#{nf.vendaId}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{nf.clienteNome}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {nf.competencia ? nf.competencia.replace(/(\d{4})-(\d{2})/, '$2/$1') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{fmt(nf.valor)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={nf.status} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {nf.pdfAnexado
                        ? <Paperclip className="w-4 h-4 text-[#F97316] inline-block" />
                        : <span className="text-gray-300 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {nf.xmlAnexado
                        ? <Paperclip className="w-4 h-4 text-[#F97316] inline-block" />
                        : <span className="text-gray-300 text-sm">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 italic">
                      {nf.dataEmissao
                        ? new Date(nf.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR')
                        : <span className="text-gray-400">Pendente</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <button
                          className="hover:text-[#F97316] transition-colors"
                          title="Visualizar"
                          onClick={() => toast({ title: `Visualizando ${nf.numero}` })}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="hover:text-gray-600 transition-colors"
                          title="Mais ações"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Emit NF Modal */}
      <FormEmitirNota
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  )
}
