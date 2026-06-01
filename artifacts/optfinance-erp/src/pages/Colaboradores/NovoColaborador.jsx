import { useState } from 'react'
import { useLocation } from 'wouter'
import { ChevronRight, Save, Info, UserCircle2, Building2, Link, Settings } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { addColaborador } from '../../data/colaboradores-store'
import { centrosCusto } from '../../data/index'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../utils/cn'

const CENTROS = centrosCusto.filter((c) => c.ativo)

function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  )
}

function inputCls() {
  return 'w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted text-on-surface bg-surface-container-low border-none'
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon
        className="w-5 h-5 text-[#F97316]"
        style={{ fill: 'currentColor' }}
      />
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
    </div>
  )
}

export default function NovoColaborador() {
  const [, navigate] = useLocation()

  const [tipo, setTipo] = useState('PF')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [centroDeCusto, setCentroDeCusto] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [cargo, setCargo] = useState('')
  const [email, setEmail] = useState('')

  const canSave =
    nome.trim() &&
    (tipo === 'PF' ? cpf.trim() : cnpj.trim()) &&
    email.trim()

  function formatCpf(val) {
    const d = val.replace(/\D/g, '').slice(0, 11)
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
  }

  function formatCnpj(val) {
    const d = val.replace(/\D/g, '').slice(0, 14)
    return d
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return

    const ccNome = CENTROS.find((c) => c.id === centroDeCusto)?.nome || centroDeCusto || 'Geral'

    addColaborador({
      nome: nome.trim(),
      tipo,
      cpf: tipo === 'PF' ? cpf : null,
      cnpj: tipo === 'PJ' ? cnpj : null,
      dataNascimento: null,
      email: email.trim(),
      cargo: cargo.trim() || tipo === 'PF' ? cargo.trim() : 'Prestador de Serviços',
      centroDeCusto: ccNome,
      custoMensal: 0,
      status: ativo ? 'ativo' : 'inativo',
    })

    toast({ title: 'Colaborador cadastrado com sucesso' })
    navigate('/colaboradores')
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Colaboradores
        </span>
        <ChevronRight className="w-3 h-3 text-text-muted" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#F97316]">
          Novo Colaborador
        </span>
      </nav>

      <PageHeader
        title="Novo Colaborador"
        subtitle="Preencha os dados abaixo para cadastrar um novo integrante na equipe."
        actions={
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg text-white font-bold transition-all',
              canSave
                ? 'hover:brightness-110 active:scale-[0.98] shadow-lg'
                : 'opacity-50 cursor-not-allowed'
            )}
            style={{ background: canSave ? 'linear-gradient(to top, #9d4300, #f97316)' : '#d1d5db' }}
          >
            <Save className="w-4 h-4" />
            Salvar Colaborador
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Identificação */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <SectionHeading icon={UserCircle2} title="Identificação" />

          {/* PF / PJ card selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* PF card */}
            <label
              className={cn(
                'relative flex flex-col p-5 rounded-xl cursor-pointer border-2 transition-all',
                tipo === 'PF'
                  ? 'border-[#F97316] bg-surface-container-lowest ring-2 ring-[#F97316]/10'
                  : 'border-transparent bg-surface-container-low hover:bg-surface-container'
              )}
            >
              <input
                type="radio"
                name="tipo_pessoa"
                value="PF"
                checked={tipo === 'PF'}
                onChange={() => setTipo('PF')}
                className="absolute opacity-0"
              />
              <div className="flex justify-between items-start mb-3">
                <UserCircle2
                  className={cn('w-8 h-8', tipo === 'PF' ? 'text-[#F97316]' : 'text-text-muted')}
                />
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    tipo === 'PF'
                      ? 'border-[#F97316] bg-[#F97316]'
                      : 'border-outline-variant bg-white'
                  )}
                >
                  {tipo === 'PF' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <span className="font-bold text-on-surface text-sm">Pessoa Física (PF)</span>
              <span className="text-xs text-text-muted mt-1">
                Colaboradores CLT, Estagiários ou Autônomos.
              </span>
            </label>

            {/* PJ card */}
            <label
              className={cn(
                'relative flex flex-col p-5 rounded-xl cursor-pointer border-2 transition-all',
                tipo === 'PJ'
                  ? 'border-[#F97316] bg-surface-container-lowest ring-2 ring-[#F97316]/10'
                  : 'border-transparent bg-surface-container-low hover:bg-surface-container'
              )}
            >
              <input
                type="radio"
                name="tipo_pessoa"
                value="PJ"
                checked={tipo === 'PJ'}
                onChange={() => setTipo('PJ')}
                className="absolute opacity-0"
              />
              <div className="flex justify-between items-start mb-3">
                <Building2
                  className={cn('w-8 h-8', tipo === 'PJ' ? 'text-[#F97316]' : 'text-text-muted')}
                />
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    tipo === 'PJ'
                      ? 'border-[#F97316] bg-[#F97316]'
                      : 'border-outline-variant bg-white'
                  )}
                >
                  {tipo === 'PJ' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <span className="font-bold text-on-surface text-sm">Pessoa Jurídica (PJ)</span>
              <span className="text-xs text-text-muted mt-1">
                Prestadores de serviço e consultorias externas.
              </span>
            </label>
          </div>

          {/* Info box */}
          <div className="p-4 bg-[#cde5ff] rounded-lg flex gap-3 items-start mb-6">
            <Info className="w-4 h-4 text-[#004b74] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#004b74] leading-relaxed">
              O sistema não infere o tipo automaticamente. Certifique-se de selecionar a opção
              correta para garantir a integridade dos cálculos tributários e campos de identificação.
            </p>
          </div>

          {/* Dynamic fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <Label required>{tipo === 'PF' ? 'Nome Completo' : 'Razão Social'}</Label>
              <input
                type="text"
                className={inputCls()}
                placeholder={tipo === 'PF' ? 'Ex: João da Silva Santos' : 'Ex: Soluções Tech LTDA'}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <Label required>{tipo === 'PF' ? 'CPF' : 'CNPJ'}</Label>
              {tipo === 'PF' ? (
                <input
                  type="text"
                  className={inputCls()}
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                />
              ) : (
                <input
                  type="text"
                  className={inputCls()}
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                />
              )}
            </div>
            <div className="md:col-span-2">
              <Label required>E-mail</Label>
              <input
                type="email"
                className={inputCls()}
                placeholder="colaborador@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Cargo / Função</Label>
              <input
                type="text"
                className={inputCls()}
                placeholder={tipo === 'PF' ? 'Ex: Analista Financeiro' : 'Ex: Consultoria Jurídica'}
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Configuração */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <SectionHeading icon={Settings} title="Configuração" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <Label>Centro de Custo</Label>
              <div className="relative">
                <select
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none appearance-none pr-10"
                  value={centroDeCusto}
                  onChange={(e) => setCentroDeCusto(e.target.value)}
                >
                  <option value="">Selecione um departamento...</option>
                  {CENTROS.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.nome}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs">
                  ▾
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg h-[50px]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-on-surface">Status do Colaborador</span>
                {ativo && (
                  <span className="px-2 py-0.5 bg-orange-50 text-[#F97316] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Ativo
                  </span>
                )}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={ativo}
                onClick={() => setAtivo((v) => !v)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0',
                  ativo ? 'bg-[#F97316]' : 'bg-surface-container-high'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                    ativo ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Vínculo com Usuário */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-6">
          <SectionHeading icon={Link} title="Vínculo com Usuário" />

          <div className="p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-outline-variant/15 flex items-start gap-4">
            <div className="bg-surface-container-low p-2.5 rounded-full flex-shrink-0">
              <span className="text-text-muted text-base">🚫</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Acesso ao Sistema</p>
              <p className="text-xs text-text-muted leading-relaxed mt-1">
                Colaboradores não possuem login por padrão. Se este colaborador precisar acessar o
                Optsolv ERP, você deverá criar um usuário vinculado após concluir este cadastro na
                seção de "Segurança &amp; Acessos".
              </p>
              <button
                type="button"
                className="mt-3 text-[11px] font-bold text-[#F97316] flex items-center gap-1 hover:underline uppercase tracking-wider"
              >
                Saiba mais sobre permissões →
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Fixed footer */}
      <footer className="fixed bottom-0 right-0 left-0 lg:left-[220px] bg-white/80 backdrop-blur-md px-8 py-4 flex justify-end gap-4 z-40 border-t border-outline-variant/10">
        <button
          type="button"
          onClick={() => navigate('/colaboradores')}
          className="px-6 py-2.5 rounded-lg text-sm font-bold text-text-muted border border-outline/30 hover:bg-surface-container-low transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSave}
          className={cn(
            'px-8 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2 shadow-lg transition-all',
            canSave
              ? 'hover:brightness-110 active:scale-[0.98]'
              : 'opacity-50 cursor-not-allowed'
          )}
          style={{ background: canSave ? 'linear-gradient(to top, #9d4300, #f97316)' : '#d1d5db' }}
        >
          <Save className="w-4 h-4" />
          Salvar Colaborador
        </button>
      </footer>
    </div>
  )
}
