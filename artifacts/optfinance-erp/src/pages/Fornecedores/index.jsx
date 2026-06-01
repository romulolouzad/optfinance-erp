import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import SlidePanel from '../../components/shared/SlidePanel'
import StatusBadge from '../../components/shared/StatusBadge'
import { fornecedores } from '../../data/index'

export default function FornecedoresPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() =>
    fornecedores.filter(f => !search || f.razaoSocial.toLowerCase().includes(search.toLowerCase()) || f.cnpj.includes(search)),
    [search]
  )

  const columns = [
    { header: 'Razão Social', accessor: 'razaoSocial', cell: r => <span className="font-medium">{r.razaoSocial}</span> },
    { header: 'CNPJ', accessor: 'cnpj', cell: r => <span className="font-mono text-xs">{r.cnpj}</span> },
    { header: 'E-mail Financeiro', accessor: 'emailFinanceiro' },
    { header: 'Telefone', accessor: 'telefone' },
    { header: 'Status', accessor: 'ativo', sortable: false, cell: r => <StatusBadge status={r.ativo ? 'ativo' : 'inativo'} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        subtitle={`${fornecedores.filter(f => f.ativo).length} ativos de ${fornecedores.length} cadastrados`}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold">
            <Plus className="w-3.5 h-3.5" /> Novo Fornecedor
          </button>
        }
      />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} keyField="id" onRowClick={setSelected} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Detalhe do Fornecedor" subtitle={selected?.razaoSocial}>
        {selected && (
          <div className="space-y-3">
            {[
              ['Razão Social', selected.razaoSocial],
              ['CNPJ', <span className="font-mono">{selected.cnpj}</span>],
              ['E-mail Financeiro', selected.emailFinanceiro],
              ['Telefone', selected.telefone],
              ['Status', <StatusBadge status={selected.ativo ? 'ativo' : 'inativo'} />],
              ['Despesas Vinculadas', selected.despesasVinculadas.length],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2.5 border-b border-surface-container">
                <span className="text-xs font-semibold uppercase tracking-label text-text-muted">{l}</span>
                <span className="text-sm font-medium text-on-surface">{v}</span>
              </div>
            ))}
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
