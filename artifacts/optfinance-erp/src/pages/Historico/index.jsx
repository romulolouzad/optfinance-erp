import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import FilterBar from '../../components/shared/FilterBar'
import Pagination from '../../components/shared/Pagination'
import StatusBadge from '../../components/shared/StatusBadge'
import { historico } from '../../data/index'
import { cn } from '../../utils/cn'

const PAGE_SIZE = 15

export default function HistoricoPage() {
  const [search, setSearch] = useState('')
  const [entidadeFiltro, setEntidadeFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [page, setPage] = useState(1)

  const entidades = [...new Set(historico.map(h => h.entidade))].sort()

  const filtered = useMemo(() => {
    return historico.filter(h => {
      const matchSearch = !search || h.descricaoCompleta.toLowerCase().includes(search.toLowerCase()) || h.usuario.toLowerCase().includes(search.toLowerCase())
      const matchEntidade = !entidadeFiltro || h.entidade === entidadeFiltro
      const matchTipo = !tipoFiltro || h.tipoEvento === tipoFiltro
      return matchSearch && matchEntidade && matchTipo
    })
  }, [search, entidadeFiltro, tipoFiltro])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <PageHeader
        title="Histórico de Auditoria"
        subtitle={`${historico.length} eventos registrados`}
      />
      <FilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={[
          {
            value: entidadeFiltro,
            onChange: v => { setEntidadeFiltro(v); setPage(1) },
            placeholder: 'Todas as entidades',
            options: entidades.map(e => ({ value: e, label: e }))
          },
          {
            value: tipoFiltro,
            onChange: v => { setTipoFiltro(v); setPage(1) },
            placeholder: 'Todos os tipos',
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'automatico', label: 'Automático' },
              { value: 'acao-critica', label: 'Ação Crítica' },
            ]
          }
        ]}
      />
      <div className="space-y-2">
        {paginated.map(h => (
          <div
            key={h.id}
            className={cn(
              'rounded-xl p-4 bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow',
              h.tipoEvento === 'acao-critica' && 'border-l-4 border-l-error'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface">{h.descricaoCompleta}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted flex-wrap">
                  <span className="font-semibold text-primary-container">{h.entidade}</span>
                  <span>·</span>
                  <span>{h.usuario}</span>
                  <span>·</span>
                  <span>{new Date(h.dataHora).toLocaleString('pt-BR')}</span>
                </div>
                {h.camposAlterados.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {h.camposAlterados.map((ca, i) => (
                      <span key={i} className="text-[10px] bg-surface-container px-2 py-0.5 rounded font-mono text-text-muted">
                        {ca.campo}: <span className="line-through opacity-50">{ca.valorAnterior ?? 'null'}</span> → <span className="text-on-surface font-semibold">{ca.novoValor}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <StatusBadge status={h.tipoEvento} className="flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
    </div>
  )
}
