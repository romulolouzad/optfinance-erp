import { useState, useMemo } from 'react'
import { useLocation } from 'wouter'
import { UserPlus, Eye, Pencil, MoreVertical, Search, Shield, X } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../../components/ui/dialog'
import { toast } from '../../hooks/use-toast'
import { getUsuarios, inativarUsuario } from '../../data/usuarios-store'
import { addHistorico } from '../../data/historico-store'
import { cn } from '../../utils/cn'

function tipoBadge(tipo) {
  if (tipo === 'admin')
    return (
      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider"
        style={{ background: '#fff7ed', color: '#F97316', border: '1px solid #fed7aa' }}>
        ADMIN
      </span>
    )
  return (
    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider"
      style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
      USUÁRIO
    </span>
  )
}

function perfilBadge(perfil) {
  const map = {
    diretoria: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'DIRETORIA' },
    operacional: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', label: 'OPERACIONAL' },
    comercial: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: 'COMERCIAL' },
  }
  const s = map[perfil] || map.operacional
  return (
    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  )
}

function statusDot(status) {
  const ativo = status === 'ativo'
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-2 h-2 rounded-full', ativo ? 'bg-green-500' : 'bg-gray-400')} />
      <span className="text-xs text-text-muted">{ativo ? 'Ativo' : 'Inativo'}</span>
    </div>
  )
}

function moduleBadges(modulos) {
  const max = 4
  const visible = modulos.slice(0, max)
  const extra = modulos.length - max
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map(m => (
        <span key={m} className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-surface-container text-text-muted border border-outline-variant/20 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-text-muted/60" />
          {m}
        </span>
      ))}
      {extra > 0 && (
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-surface-container-low text-text-muted">
          +{extra}
        </span>
      )}
    </div>
  )
}

function InativarModal({ usuario, open, onClose, onConfirm }) {
  if (!usuario) return null
  const contratos = usuario.contratosAtivos || []
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            Inativar Usuário — {usuario.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 p-4 rounded-lg mt-1" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm" style={{ color: '#9a3412' }}>
            Este usuário possui <strong>{contratos.length}</strong> contrato{contratos.length !== 1 ? 's' : ''} ativo{contratos.length !== 1 ? 's' : ''} como vendedor. As comissões futuras ficarão pausadas até reatribuição do vendedor.
          </p>
        </div>

        {contratos.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">CONTRATOS AFETADOS</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-text-muted pb-2 pr-3">ID</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-text-muted pb-2 pr-3">CLIENTE</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-wider text-text-muted pb-2">VALOR</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map(c => (
                  <tr key={c.id} className="border-b border-outline-variant/10">
                    <td className="py-2 pr-3">
                      <span className="text-[#F97316] font-mono text-xs font-semibold">#{c.id}</span>
                    </td>
                    <td className="py-2 pr-3 text-xs text-on-surface">{c.cliente}</td>
                    <td className="py-2 text-xs text-on-surface text-right font-mono">{c.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-sm text-text-muted mt-3 leading-relaxed">
          Ao confirmar, o acesso do colaborador será revogado imediatamente e seu status passará a ser <strong className="text-on-surface">Inativo</strong>.
        </p>

        <DialogFooter className="mt-2 gap-2">
          <DialogClose asChild>
            <button className="px-5 py-2.5 rounded-lg text-sm font-bold border border-outline/30 text-text-muted hover:bg-surface-container-low transition-colors">
              Cancelar
            </button>
          </DialogClose>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
          >
            Confirmar Inativação
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function UsuariosPage() {
  const [, navigate] = useLocation()
  const [usuarios, setUsuarios] = useState(() => getUsuarios())
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroPerfil, setFiltroPerfil] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('ativos')
  const [modalInativar, setModalInativar] = useState(null)

  const filtrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchBusca = !busca ||
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())
      const matchTipo = filtroTipo === 'todos' || u.tipo === filtroTipo
      const matchPerfil = filtroPerfil === 'todos' || u.perfil === filtroPerfil
      const matchStatus =
        filtroStatus === 'todos' ? true :
        filtroStatus === 'ativos' ? u.status === 'ativo' :
        u.status === 'inativo'
      return matchBusca && matchTipo && matchPerfil && matchStatus
    })
  }, [usuarios, busca, filtroTipo, filtroPerfil, filtroStatus])

  function handleLimpar() {
    setBusca('')
    setFiltroTipo('todos')
    setFiltroPerfil('todos')
    setFiltroStatus('ativos')
  }

  function handleConfirmarInativar() {
    if (!modalInativar) return
    inativarUsuario(modalInativar.id)
    addHistorico({ acao: `Inativação de usuário — ${modalInativar.nome}`, tipoEvento: 'acao-critica', entidade: 'Usuário', entidadeId: modalInativar.id })
    setUsuarios(getUsuarios())
    setModalInativar(null)
    toast({ title: 'Usuário inativado' })
  }

  return (
    <div>
      <PageHeader
        title="Usuários & Permissões"
        subtitle="Gestão de acesso ao sistema"
        actions={
          <button
            onClick={() => navigate('/usuarios/novo')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg text-white font-bold transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
            style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
          >
            <UserPlus className="w-4 h-4" />
            + Novo Usuário
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">BUSCAR POR NOME OU E-MAIL</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Ex: João Silva..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-surface-container-low border-none focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 text-on-surface"
              />
            </div>
          </div>
          {[
            { label: 'TIPO', value: filtroTipo, set: setFiltroTipo, opts: [['todos','Todos'],['admin','Admin'],['usuario','Usuário']] },
            { label: 'PERFIL', value: filtroPerfil, set: setFiltroPerfil, opts: [['todos','Todos'],['operacional','Operacional'],['comercial','Comercial'],['diretoria','Diretoria']] },
            { label: 'STATUS', value: filtroStatus, set: setFiltroStatus, opts: [['ativos','Ativos'],['inativos','Inativos'],['todos','Todos']] },
          ].map(({ label, value, set, opts }) => (
            <div key={label} className="min-w-[130px]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">{label}</label>
              <select
                className="w-full bg-surface-container-low border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-[#F97316]/20 focus:outline-none appearance-none"
                value={value}
                onChange={e => set(e.target.value)}
              >
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <button
            onClick={handleLimpar}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border border-outline/30 text-text-muted hover:bg-surface-container-low transition-colors font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
              {['ID', 'NOME', 'TIPO', 'PERFIL', 'MÓDULOS COM ACESSO', 'STATUS', 'ÚLTIMO ACESSO', 'AÇÕES'].map(h => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-text-muted px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-text-muted">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : filtrados.map(u => (
              <tr key={u.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-text-muted">#{u.id.replace('USR', '')}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-on-surface text-sm">{u.nome}</div>
                  <div className="text-xs text-text-muted">{u.email}</div>
                </td>
                <td className="px-4 py-3">{tipoBadge(u.tipo)}</td>
                <td className="px-4 py-3">{perfilBadge(u.perfil)}</td>
                <td className="px-4 py-3">{moduleBadges(u.modulos)}</td>
                <td className="px-4 py-3">{statusDot(u.status)}</td>
                <td className="px-4 py-3 text-xs text-text-muted">{u.ultimoAcesso}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-surface-container text-text-muted hover:text-on-surface transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-surface-container text-text-muted hover:text-[#F97316] transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded hover:bg-surface-container text-text-muted hover:text-on-surface transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="text-sm cursor-pointer"
                          onClick={() => setModalInativar(u)}
                          disabled={u.status === 'inativo'}
                        >
                          Inativar usuário
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-sm cursor-pointer">
                          Redefinir senha
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-sm cursor-pointer"
                          onClick={() => navigate('/historico')}
                        >
                          Ver histórico de acessos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-outline-variant/10 text-xs text-text-muted">
          Mostrando 1–{filtrados.length} de {filtrados.length} usuários
        </div>
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Acessos hoje */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">ACESSOS HOJE</p>
            <span className="text-xs font-bold" style={{ color: '#22c55e' }}>+12%</span>
          </div>
          <p className="text-3xl font-bold text-on-surface mb-3">42</p>
          <div className="w-full h-1.5 rounded-full bg-surface-container-low overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '68%', background: 'linear-gradient(to right, #9d4300, #f97316)' }} />
          </div>
        </div>

        {/* Segurança do sistema */}
        <div className="rounded-xl shadow-sm p-5 flex items-center justify-between gap-4" style={{ background: '#111827' }}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white mb-1">Segurança do Sistema</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              3 usuários estão sem autenticação de dois fatores ativa. Recomendamos a ativação obrigatória para cargos de diretoria.
            </p>
            <button
              onClick={() => navigate('/historico')}
              className="px-4 py-2 text-xs font-bold rounded-lg border transition-colors"
              style={{ borderColor: '#F97316', color: '#F97316', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F97316'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#F97316' }}
            >
              VER AUDITORIA
            </button>
          </div>
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(249,115,22,0.15)' }}>
            <Shield className="w-7 h-7" style={{ color: '#F97316' }} />
          </div>
        </div>
      </div>

      <InativarModal
        usuario={modalInativar}
        open={!!modalInativar}
        onClose={() => setModalInativar(null)}
        onConfirm={handleConfirmarInativar}
      />
    </div>
  )
}
