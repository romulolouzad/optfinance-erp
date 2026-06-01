import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import StatusBadge from '../../components/shared/StatusBadge'
import { parcelas } from '../../data/index'
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function NotasFiscaisPage() {
  const parcelasComNF = parcelas.filter(p => p.nfEmitida)
  const parcelasSemNF = parcelas.filter(p => !p.nfEmitida && p.situacao === 'paga')

  const cards = [
    { title: 'NFs Emitidas', value: parcelasComNF.length, icon: CheckCircle, accent: '#2E7D32', type: 'number' },
    { title: 'Pagas Sem NF', value: parcelasSemNF.length, icon: AlertTriangle, accent: '#C62828', type: 'number' },
    { title: 'Base de Cálculo', value: parcelasComNF.reduce((s, p) => s + p.valorRecebido, 0), icon: FileText, type: 'currency' },
    { title: 'Total de Parcelas', value: parcelas.length, icon: FileText, type: 'number' },
  ]

  const columns = [
    { header: 'Cliente', accessor: 'clienteNome' },
    { header: 'Parcela', accessor: 'numero', cell: r => <span className="font-mono text-xs">{r.numero}</span> },
    { header: 'Competência', accessor: 'competencia' },
    { header: 'Valor', accessor: 'valorRecebido', align: 'right', cell: r => fmt(r.valorRecebido) },
    { header: 'NF Emitida', accessor: 'nfEmitida', sortable: false, cell: r => (
      <StatusBadge status={r.nfEmitida ? 'ativo' : r.situacao === 'paga' ? 'vencida' : 'em-aberto'} />
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Notas Fiscais"
        subtitle="Controle de emissão de notas fiscais de serviço"
      />
      <SummaryCards cards={cards} />
      <DataTable columns={columns} data={parcelas} keyField="id" />
    </div>
  )
}
