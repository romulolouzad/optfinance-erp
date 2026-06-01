import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import DataTable from '../../components/shared/DataTable'
import FilterBar from '../../components/shared/FilterBar'
import SlidePanel from '../../components/shared/SlidePanel'
import StatusBadge from '../../components/shared/StatusBadge'
import { colaboradores } from '../../data/index'

export default function ColaboradoresPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() =>
    colaboradores.filter(c => !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.cargo.toLowerCase().includes(search.toLowerCase())),
    [search]
  )

  const columns = [
    { header: 'Nome', accessor: 'nome', cell: r => <span className="font-medium">{r.nome}</span> },
    { header: 'Cargo', accessor: 'cargo' },
    { header: 'Tipo', accessor: 'tipo', cell: r => <span className="text-xs font-semibold text-primary-container">{r.tipo}</span> },
    { header: 'E-mail', accessor: 'email', cell: r => <span className="text-xs font-mono">{r.email}</span> },
    { header: 'Status', accessor: 'ativo', sortable: false, cell: r => <StatusBadge status={r.ativo ? 'ativo' : 'inativo'} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        subtitle={`${colaboradores.filter(c => c.ativo).length} ativos de ${colaboradores.length} cadastrados`}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors font-semibold">
            <Plus className="w-3.5 h-3.5" /> Novo Colaborador
          </button>
        }
      />
      <FilterBar search={search} onSearchChange={setSearch} />
      <DataTable columns={columns} data={filtered} keyField="id" onRowClick={setSelected} />

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title="Perfil do Colaborador" subtitle={selected?.cargo}>
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-lg font-bold text-primary-container">
                {selected.nome.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-on-surface">{selected.nome}</p>
                <p className="text-xs text-text-muted">{selected.cargo}</p>
                <StatusBadge status={selected.ativo ? 'ativo' : 'inativo'} className="mt-1" />
              </div>
            </div>
            {[
              ['CPF', <span className="font-mono">{selected.cpf}</span>],
              ['E-mail', selected.email],
              ['Tipo', selected.tipo],
              ['Data Nasc.', new Date(selected.dataNasc + 'T00:00:00').toLocaleDateString('pt-BR')],
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
