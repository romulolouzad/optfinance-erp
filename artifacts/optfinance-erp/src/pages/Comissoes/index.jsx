import { useMemo } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import DataTable from '../../components/shared/DataTable'
import StatusBadge from '../../components/shared/StatusBadge'
import { vendas, contratos, colaboradores } from '../../data/index'
import { TrendingUp, Users } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function ComissoesPage() {
  const comissoes = useMemo(() => {
    return contratos
      .filter(c => c.situacao !== 'projecao' && c.situacao !== 'perdida')
      .map(c => {
        const col = c.vendedores[0]
          ? colaboradores.find(co => co.id === c.vendedores[0])
          : null
        const comissaoValor = (c.valorTotal * c.comissao) / 100
        return {
          id: c.id,
          numero: c.numero,
          clienteNome: c.clienteNome,
          vendedor: col?.nome || '—',
          situacao: c.situacao,
          valorContrato: c.valorTotal,
          percComissao: c.comissao,
          valorComissao: comissaoValor,
        }
      })
  }, [])

  const totalComissoes = comissoes.reduce((s, c) => s + c.valorComissao, 0)
  const totalContratos = comissoes.reduce((s, c) => s + c.valorContrato, 0)

  const cards = [
    { title: 'Total Comissões', value: totalComissoes, icon: TrendingUp, accent: '#F97316', type: 'currency' },
    { title: 'Base de Contratos', value: totalContratos, icon: TrendingUp, type: 'currency' },
    { title: 'Contratos com Comissão', value: comissoes.length, icon: Users, type: 'number' },
    { title: 'Ticket Médio Comissão', value: totalComissoes / (comissoes.length || 1), icon: TrendingUp, type: 'currency' },
  ]

  const columns = [
    { header: 'Contrato', accessor: 'numero', cell: r => <span className="font-mono text-xs">#{r.numero}</span> },
    { header: 'Cliente', accessor: 'clienteNome' },
    { header: 'Vendedor', accessor: 'vendedor', cell: r => <span className="font-medium">{r.vendedor}</span> },
    { header: 'Valor Contrato', accessor: 'valorContrato', align: 'right', cell: r => fmt(r.valorContrato) },
    { header: '%', accessor: 'percComissao', align: 'right', cell: r => `${r.percComissao}%` },
    { header: 'Comissão', accessor: 'valorComissao', align: 'right', cell: r => <span className="font-bold text-primary-container">{fmt(r.valorComissao)}</span> },
    { header: 'Status', accessor: 'situacao', sortable: false, cell: r => <StatusBadge status={r.situacao} /> },
  ]

  return (
    <div>
      <PageHeader title="Comissões" subtitle="Apuração de comissões por contrato e vendedor" />
      <SummaryCards cards={cards} />
      <DataTable columns={columns} data={comissoes} keyField="id" />
    </div>
  )
}
