import { useState, useEffect } from 'react'
import { X, FileText, Code2 } from 'lucide-react'
import { notasFiscais, getNextNfNumero, addNotaFiscal, markNfAnexada } from '../../data/notas-fiscais-store'
import { getVendasSemNF } from '../../data/notas-fiscais-store'
import { historico } from '../../data/index'
import { toast } from '../../hooks/use-toast'

const MUNICIPIOS = [
  'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG',
  'Campinas - SP', 'Porto Alegre - RS', 'Curitiba - PR',
  'Salvador - BA', 'Fortaleza - CE', 'Recife - PE', 'Manaus - AM',
  'Goiânia - GO', 'Belém - PA', 'Florianópolis - SC', 'Vitória - ES',
  'Natal - RN', 'Teresina - PI', 'Campo Grande - MS', 'Maceió - AL',
  'João Pessoa - PB', 'São Luís - MA',
]

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FormEmitirNota({ open, onClose, onSuccess }) {
  const [vendas, setVendas] = useState([])
  const [form, setForm] = useState({
    vendaId: '',
    numero: '',
    dataEmissao: new Date().toISOString().slice(0, 10),
    valor: '',
    localPrestacao: '',
    pdfFile: null,
    xmlFile: null,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      const vendasSemNF = getVendasSemNF()
      setVendas(vendasSemNF)
      setForm({
        vendaId: '',
        numero: getNextNfNumero('cliente'),
        dataEmissao: new Date().toISOString().slice(0, 10),
        valor: '',
        localPrestacao: '',
        pdfFile: null,
        xmlFile: null,
      })
      setErrors({})
    }
  }, [open])

  function handleVendaChange(id) {
    const venda = vendas.find(v => v.id === id)
    setForm(f => ({
      ...f,
      vendaId: id,
      valor: venda ? String(venda.valorTotal) : '',
    }))
  }

  function validate() {
    const errs = {}
    if (!form.vendaId) errs.vendaId = 'Selecione uma venda'
    if (!form.numero.trim()) errs.numero = 'Informe o número da NF'
    if (!form.dataEmissao) errs.dataEmissao = 'Informe a data de emissão'
    if (!form.valor || isNaN(parseFloat(form.valor))) errs.valor = 'Informe o valor'
    if (!form.localPrestacao) errs.localPrestacao = 'Selecione o local da prestação'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      const venda = vendas.find(v => v.id === form.vendaId)
      const newNf = {
        id: `NF${String(notasFiscais.length + 1).padStart(3, '0')}`,
        numero: form.numero.trim(),
        vendaId: form.vendaId,
        clienteNome: venda?.clienteNome || '',
        competencia: new Date(form.dataEmissao + 'T00:00:00').toISOString().slice(0, 7),
        valor: parseFloat(form.valor),
        status: 'emitida',
        pdfAnexado: !!form.pdfFile,
        xmlAnexado: !!form.xmlFile,
        dataEmissao: form.dataEmissao,
        tipo: 'cliente',
        localPrestacao: form.localPrestacao,
      }
      addNotaFiscal(newNf)
      markNfAnexada(form.vendaId)

      const newHisId = `HIS${String(historico.length + 1).padStart(3, '0')}`
      historico.unshift({
        id: newHisId,
        dataHora: new Date().toISOString(),
        entidade: 'Nota Fiscal',
        entidadeId: newNf.id,
        tipoEvento: 'normal',
        usuario: 'marcos.oliveira',
        usuarioId: 'COL003',
        descricaoCompleta: `Emissão de Nota Fiscal ${newNf.numero} — ${venda?.clienteNome || ''} — ${fmt(newNf.valor)}`,
        camposAlterados: [],
        ipCliente: '192.168.1.102',
        empresa: 'Optsolv',
        filial: 'São Paulo',
      })

      setSubmitting(false)
      toast({ title: 'Nota Fiscal emitida com sucesso' })
      onSuccess?.()
      onClose()
    }, 600)
  }

  if (!open) return null

  const selectedVenda = vendas.find(v => v.id === form.vendaId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Emitir Nota Fiscal</h2>
            <p className="text-xs text-gray-500 mt-0.5">Vincule uma venda aprovada e preencha os dados da NF</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">
            {/* Venda vinculada */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5">
                Venda Vinculada <span className="text-red-500">*</span>
              </label>
              <select
                value={form.vendaId}
                onChange={e => handleVendaChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="">Selecione uma venda aprovada...</option>
                {vendas.map(v => (
                  <option key={v.id} value={v.id}>
                    #{v.numero} — {v.clienteNome} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valorTotal)}
                  </option>
                ))}
              </select>
              {errors.vendaId && <p className="text-xs text-red-500 mt-1">{errors.vendaId}</p>}
              {selectedVenda && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedVenda.descricao} — Competência: {selectedVenda.competencia}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Número NF */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5">
                  Número da NF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.numero}
                  onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
                  placeholder="NF-0000"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                {errors.numero && <p className="text-xs text-red-500 mt-1">{errors.numero}</p>}
              </div>

              {/* Data de emissão */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5">
                  Data de Emissão <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.dataEmissao}
                  onChange={e => setForm(f => ({ ...f, dataEmissao: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                {errors.dataEmissao && <p className="text-xs text-red-500 mt-1">{errors.dataEmissao}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5">
                  Valor (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                  placeholder="0,00"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                {errors.valor && <p className="text-xs text-red-500 mt-1">{errors.valor}</p>}
              </div>

              {/* Local da prestação */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1.5">
                  Local da Prestação <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.localPrestacao}
                  onChange={e => setForm(f => ({ ...f, localPrestacao: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="">Selecione o município...</option>
                  {MUNICIPIOS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.localPrestacao && <p className="text-xs text-red-500 mt-1">{errors.localPrestacao}</p>}
              </div>
            </div>

            {/* Upload PDF + XML */}
            <div className="grid grid-cols-2 gap-4">
              <UploadCard
                label="PDF da NF"
                icon={FileText}
                accept=".pdf"
                file={form.pdfFile}
                onFile={f => setForm(prev => ({ ...prev, pdfFile: f }))}
              />
              <UploadCard
                label="XML da NF"
                icon={Code2}
                accept=".xml"
                file={form.xmlFile}
                onFile={f => setForm(prev => ({ ...prev, xmlFile: f }))}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#F97316] text-white text-sm font-bold rounded-lg hover:bg-[#9D4300] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {submitting ? 'Emitindo...' : 'Emitir Nota Fiscal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UploadCard({ label, icon: Icon, accept, file, onFile }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(f) {
    if (!f) return
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      onFile(f)
      toast({ title: 'Arquivo recebido com sucesso' })
    }, 1000)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  return (
    <div
      className={`relative h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
        ${dragOver ? 'border-orange-500 bg-orange-50' : file ? 'border-green-400 bg-green-50' : 'border-orange-300 hover:border-orange-500 hover:bg-orange-50'}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById(`upload-${label}`).click()}
    >
      <input
        id={`upload-${label}`}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => { const f = e.target.files[0]; if (f) handleFile(f) }}
      />
      {uploading ? (
        <span className="w-6 h-6 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      ) : (
        <>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${file ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-center px-3">
            <p className="text-xs font-bold text-gray-900">{label}</p>
            {file ? (
              <p className="text-[10px] text-green-600 mt-0.5 truncate max-w-[120px]">{file.name}</p>
            ) : (
              <p className="text-[10px] text-gray-500 mt-0.5">Arraste ou clique para enviar</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
