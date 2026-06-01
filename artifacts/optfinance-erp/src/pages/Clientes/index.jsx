import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import SlidePanel from '../../components/shared/SlidePanel'
import StatusBadge from '../../components/shared/StatusBadge'
import { clientes, contratos } from '../../data/index'
import { Users } from 'lucide-react'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function ClientesPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() =>
    clientes.filter(c => !search || c.razaoSocial.toLowerCase().includes(search.toLowerCase()) || c.cnpj.includes(search)),
    [search]
  )

  const columns = [
    { header: 'Razão Social', accessor: 'razaoSocial', cell: r => <span className="font-medium">{r.razaoSocial}</span> },
    { header: 'CNPJ', accessor: 'cnpj', cell: r => <span className="font-mono text-xs">{r.cnpj}</span> },
    { header: 'Nome Fantasia', accessor: 'nomeFantasia' },
    { header: 'Contratos', sortable: false, cell: r => <span className="text-xs font-bold text-primary-container">{r.contratosVinculados.length}</span> },
    { header: 'Ativo', sortable: false, cell: r => <StatusBadge status={r.contratosVinculados.some(c => c.situacao === 'ativa') ? 'ativa' : 'inativa'} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} clientes cadastrados`}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold">
            <Plus className="w-3.5 h-3.5" /> Novo Cliente
          </button>
        }
      />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} keyField="id" onRowClick={setSelected} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Detalhe do Cliente" subtitle={selected?.nomeFantasia}>
        {selected && (
          <div className="space-y-4">
            {[
              ['Razão Social', selected.razaoSocial],
              ['CNPJ', <span className="font-mono">{selected.cnpj}</span>],
              ['Nome Fantasia', selected.nomeFantasia],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2.5 border-b border-surface-container">
                <span className="text-xs font-semibold uppercase tracking-label text-text-muted">{l}</span>
                <span className="text-sm font-medium text-on-surface">{v}</span>
              </div>
            ))}
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-label text-text-muted mb-3">Contratos Vinculados</p>
              {selected.contratosVinculados.length === 0 ? (
                <p className="text-sm text-text-muted">Nenhum contrato.</p>
              ) : (
                <div className="space-y-2">
                  {selected.contratosVinculados.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container">
                      <span className="text-xs font-mono text-on-surface">#{c.numero}</span>
                      <span className="text-xs font-semibold text-on-surface">{fmt(c.valorTotal)}</span>
                      <StatusBadge status={c.situacao} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
