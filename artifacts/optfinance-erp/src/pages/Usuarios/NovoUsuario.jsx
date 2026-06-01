import { useState } from 'react'
import { useLocation } from 'wouter'
import { ChevronRight, Save, Info, UserCircle2, Briefcase, Shield } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { addUsuario } from '../../data/usuarios-store'
import { addHistorico } from '../../data/historico-store'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../utils/cn'

function inputCls() {
  return 'w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all placeholder:text-text-muted text-on-surface bg-surface-container-low border-none'
}

function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: '#fff7ed' }}>
        <Icon className="w-4 h-4" style={{ color: '#F97316' }} />
      </div>
      <div>
        <h3 className="text-base font-bold text-on-surface">{title}</h3>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

const PERFIS = [
  {
    id: 'operacional',
    label: 'Operacional',
    desc: 'Acesso a rotinas diárias, fluxo de caixa e emissão de notas.',
    icon: '👥',
  },
  {
    id: 'comercial',
    label: 'Comercial',
    desc: 'Focado em vendas, metas e gestão de carteira de clientes.',
    icon: '📈',
  },
  {
    id: 'diretoria',
    label: 'Diretoria',
    desc: 'Acesso total a DRE, Forecast e relatórios estratégicos.',
    icon: '🏛️',
  },
]

const PERFIL_INFO = {
  operacional: 'Usuários com perfil Operacional têm acesso restrito às rotinas do dia a dia. Permissões adicionais devem ser ativadas manualmente.',
  comercial: 'Usuários com perfil Comercial visualizam apenas os próprios dados e carteira, a menos que possuam permissão de gerência explícita.',
  diretoria: 'Usuários com perfil Diretoria têm acesso amplo a dados estratégicos. Configure as permissões individuais com atenção.',
}

const MODULOS = [
  'Comercial', 'Financeiro', 'Fiscal', 'Gerencial',
  'Metas', 'Caixa', 'Relatórios', 'Administração',
]

const PERFIL_DEFAULTS = {
  operacional: {
    Comercial:    { leitura: false, escrita: false },
    Financeiro:   { leitura: true,  escrita: false },
    Fiscal:       { leitura: true,  escrita: true  },
    Gerencial:    { leitura: false, escrita: false },
    Metas:        { leitura: false, escrita: false },
    Caixa:        { leitura: true,  escrita: true  },
    Relatórios:   { leitura: true,  escrita: false },
    Administração:{ leitura: false, escrita: false },
  },
  comercial: {
    Comercial:    { leitura: true,  escrita: true  },
    Financeiro:   { leitura: true,  escrita: false },
    Fiscal:       { leitura: true,  escrita: false },
    Gerencial:    { leitura: false, escrita: false },
    Metas:        { leitura: true,  escrita: true  },
    Caixa:        { leitura: true,  escrita: false },
    Relatórios:   { leitura: true,  escrita: false },
    Administração:{ leitura: false, escrita: false },
  },
  diretoria: {
    Comercial:    { leitura: true,  escrita: true  },
    Financeiro:   { leitura: true,  escrita: true  },
    Fiscal:       { leitura: true,  escrita: true  },
    Gerencial:    { leitura: true,  escrita: true  },
    Metas:        { leitura: true,  escrita: true  },
    Caixa:        { leitura: true,  escrita: true  },
    Relatórios:   { leitura: true,  escrita: true  },
    Administração:{ leitura: true,  escrita: false },
  },
}

function buildPermsFromProfile(perfil) {
  const defaults = PERFIL_DEFAULTS[perfil] || PERFIL_DEFAULTS.comercial
  const result = {}
  MODULOS.forEach(m => {
    result[m] = { ...defaults[m] }
  })
  return result
}

export default function NovoUsuario() {
  const [, navigate] = useLocation()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [tipoConta, setTipoConta] = useState('usuario')
  const [perfil, setPerfil] = useState('comercial')
  const [perms, setPerms] = useState(() => buildPermsFromProfile('comercial'))

  function handlePerfilChange(p) {
    setPerfil(p)
    setPerms(buildPermsFromProfile(p))
  }

  function togglePerm(modulo, tipo) {
    setPerms(prev => ({
      ...prev,
      [modulo]: { ...prev[modulo], [tipo]: !prev[modulo][tipo] },
    }))
  }

  const canSave = nome.trim() && email.trim()

  function handleSave() {
    if (!canSave) return
    const modulosAtivos = MODULOS.filter(m => perms[m]?.leitura || perms[m]?.escrita)
    const novoUsuario = addUsuario({
      nome: nome.trim(),
      email: email.trim(),
      tipo: tipoConta,
      perfil,
      modulos: modulosAtivos,
      status: 'ativo',
    })
    addHistorico({
      acao: `Criação de usuário — ${nome.trim()}`,
      tipoEvento: 'acao-critica',
      entidade: 'Usuário',
      entidadeId: novoUsuario.id,
    })
    toast({ title: 'Usuário criado com sucesso' })
    navigate('/usuarios')
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted cursor-pointer hover:text-[#F97316] transition-colors"
          onClick={() => navigate('/usuarios')}>
          Usuários & Permissões
        </span>
        <ChevronRight className="w-3 h-3 text-text-muted" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#F97316]">
          Novo Usuário
        </span>
      </nav>

      <PageHeader
        title="Configurar Novo Usuário"
        subtitle="Defina as credenciais, o papel organizacional e os níveis de acesso granular para o novo colaborador dentro da plataforma Optsolv."
      />

      <div className="space-y-6 pb-28">
        {/* Identificação */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <SectionHeading icon={UserCircle2} title="Identificação" subtitle="Dados básicos de conta e acesso." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <Label required>Nome Completo</Label>
              <input
                type="text"
                className={inputCls()}
                placeholder="Ex: Roberto Silva de Oliveira"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>
            <div>
              <Label required>E-mail Corporativo</Label>
              <input
                type="email"
                className={inputCls()}
                placeholder="roberto.silva@optsolv.com.br"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Tipo de Conta</Label>
            <div className="flex items-center gap-6">
              {[['usuario', 'Usuário'], ['admin', 'Administrador']].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setTipoConta(v)}
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer',
                      tipoConta === v
                        ? 'border-[#F97316] bg-[#F97316]'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {tipoConta === v && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-on-surface">{l}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Perfil Organizacional */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <SectionHeading icon={Briefcase} title="Perfil Organizacional" subtitle="Selecione o modelo de atuação pré-definido." />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {PERFIS.map(p => {
              const selected = perfil === p.id
              return (
                <label
                  key={p.id}
                  className={cn(
                    'relative flex flex-col p-5 rounded-xl cursor-pointer border-2 transition-all',
                    selected
                      ? 'border-[#F97316] bg-surface-container-lowest ring-2 ring-[#F97316]/10'
                      : 'border-transparent bg-surface-container-low hover:bg-surface-container'
                  )}
                  onClick={() => handlePerfilChange(p.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">{p.icon}</span>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        selected
                          ? 'border-[#F97316] bg-[#F97316]'
                          : 'border-outline-variant bg-white'
                      )}
                    >
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <span className="font-bold text-on-surface text-sm">{p.label}</span>
                  <span className="text-xs text-text-muted mt-1 leading-relaxed">{p.desc}</span>
                </label>
              )
            })}
          </div>

          {/* Info box */}
          <div className="flex gap-3 p-4 rounded-lg" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} />
            <p className="text-xs leading-relaxed" style={{ color: '#9a3412' }}>
              {PERFIL_INFO[perfil]}
            </p>
          </div>

          {/* Action buttons inside this section */}
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={() => navigate('/usuarios')}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-text-muted border border-outline/30 hover:bg-surface-container-low transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all',
                canSave ? 'hover:brightness-110 active:scale-[0.98] shadow-lg' : 'opacity-50 cursor-not-allowed'
              )}
              style={{ background: canSave ? 'linear-gradient(to top, #9d4300, #f97316)' : '#d1d5db' }}
            >
              <Save className="w-4 h-4" />
              Salvar Usuário
            </button>
          </div>
        </div>

        {/* Permissões de Módulo */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <SectionHeading icon={Shield} title="Permissões de Módulo" subtitle="Configure os níveis de acesso granular por área do ERP." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 divide-outline-variant/10">
            {MODULOS.map((modulo, idx) => {
              const p = perms[modulo] || { leitura: false, escrita: false }
              const isLeft = idx % 2 === 0
              return (
                <div
                  key={modulo}
                  className={cn(
                    'flex items-center justify-between py-4 px-2',
                    isLeft ? 'md:pr-6 md:border-r md:border-outline-variant/10' : 'md:pl-6',
                    idx < MODULOS.length - 2 ? 'md:border-b md:border-outline-variant/10' : ''
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-surface-container">
                      <div className="w-3 h-3 rounded-sm bg-text-muted/40" />
                    </div>
                    <span className="text-sm font-medium text-on-surface">{modulo}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {[['leitura', 'LEITURA'], ['escrita', 'ESCRITA']].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                        <div
                          onClick={() => togglePerm(modulo, key)}
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors',
                            p[key]
                              ? 'bg-[#F97316] border-[#F97316]'
                              : 'border-gray-300 bg-white'
                          )}
                        >
                          {p[key] && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fixed footer */}
      <footer className="fixed bottom-0 right-0 left-0 lg:left-[220px] bg-white/80 backdrop-blur-md px-8 py-4 flex justify-end gap-4 z-40 border-t border-outline-variant/10">
        <button
          type="button"
          onClick={() => navigate('/usuarios')}
          className="px-6 py-2.5 rounded-lg text-sm font-bold text-text-muted border border-outline/30 hover:bg-surface-container-low transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            'flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-lg',
            canSave ? 'hover:brightness-110 active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'
          )}
          style={{ background: canSave ? 'linear-gradient(to top, #9d4300, #f97316)' : '#d1d5db' }}
        >
          <Save className="w-4 h-4" />
          Salvar Usuário
        </button>
      </footer>
    </div>
  )
}
