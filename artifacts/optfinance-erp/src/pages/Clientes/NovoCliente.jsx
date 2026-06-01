import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { ChevronRight, Save, Info } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { addCliente, isCnpjDuplicado } from '../../data/clientes-store'
import { centrosCusto } from '../../data/index'
import { registrarHistorico } from '../../data/historico-store'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../utils/cn'

function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  )
}

function inputCls(err) {
  return cn(
    'w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-text-muted text-on-surface',
    err
      ? 'bg-error-container/20 border-2 border-error/20 focus:ring-error/20'
      : 'bg-surface-container-low border-none focus:ring-primary-container/30'
  )
}

const CENTROS = centrosCusto.filter((c) => c.ativo)

export default function NovoCliente() {
  const [, navigate] = useLocation()

  const [razaoSocial, setRazaoSocial] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [cnpjError, setCnpjError] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [centroCustoId, setCentroCustoId] = useState('')
  const [tipoPessoa, setTipoPessoa] = useState('PJ')
  const [ativo, setAtivo] = useState(true)

  useEffect(() => {
    if (!cnpj) {
      setCnpjError('')
      return
    }
    const digits = cnpj.replace(/\D/g, '')
    if (digits.length < 14) {
      setCnpjError('')
      return
    }
    if (isCnpjDuplicado(cnpj)) {
      setCnpjError('Este CNPJ já está cadastrado como cliente.')
    } else {
      setCnpjError('')
    }
  }, [cnpj])

  const cnpjDigits = cnpj.replace(/\D/g, '')
  const cnpjValid = cnpjDigits.length === 14 && !cnpjError
  const canSave = razaoSocial.trim() && cnpjValid && centroCustoId

  function formatCnpj(val) {
    const digits = val.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  function handleCnpjChange(e) {
    setCnpj(formatCnpj(e.target.value))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return

    const cli = addCliente({
      razaoSocial: razaoSocial.trim(),
      cnpj,
      nomeFantasia: nomeFantasia.trim() || razaoSocial.trim(),
      centroCustoId,
      tipoPessoa,
      status: ativo ? 'ativo' : 'inativo',
    })

    registrarHistorico({
      acao: `Cadastro de cliente — ${razaoSocial.trim()}`,
      tipoEvento: 'normal',
      entidade: 'Cliente',
      entidadeId: cli?.id || '',
      camposAlterados: [
        { campo: 'razaoSocial', valorAnterior: null, novoValor: razaoSocial.trim() },
        { campo: 'tipoPessoa', valorAnterior: null, novoValor: tipoPessoa },
        { campo: 'status', valorAnterior: null, novoValor: ativo ? 'ativo' : 'inativo' },
      ],
    })

    toast({ title: 'Cliente cadastrado com sucesso' })
    navigate('/clientes')
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">
          Clientes
        </span>
        <ChevronRight className="w-3 h-3 text-text-muted" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#F97316]">
          Novo Cliente
        </span>
      </nav>

      <PageHeader
        title="Novo Cliente"
        subtitle="Cadastre uma nova entidade no ecossistema ERP."
      />

      <form onSubmit={handleSubmit}>
        {/* Main card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden mb-8">
          <div className="p-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Razão Social */}
              <div className="col-span-12 md:col-span-8 space-y-1.5">
                <Label required>Razão Social</Label>
                <input
                  type="text"
                  className={inputCls(false)}
                  placeholder="Ex: Optsolv Soluções Tecnológicas LTDA"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                />
              </div>

              {/* CNPJ */}
              <div className="col-span-12 md:col-span-4 space-y-1.5">
                <Label required>CNPJ</Label>
                <input
                  type="text"
                  className={inputCls(!!cnpjError)}
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={handleCnpjChange}
                />
                {cnpjError && (
                  <p className="text-[11px] font-semibold text-error flex items-center gap-1 mt-1">
                    <span className="text-sm">⊘</span>
                    {cnpjError}
                  </p>
                )}
              </div>

              {/* Nome Fantasia */}
              <div className="col-span-12 md:col-span-6 space-y-1.5">
                <Label>Nome Fantasia</Label>
                <input
                  type="text"
                  className={inputCls(false)}
                  placeholder="Como a empresa é conhecida"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                />
              </div>

              {/* Centro de Custo */}
              <div className="col-span-12 md:col-span-6 space-y-1.5">
                <Label required>Centro de Custo Padrão</Label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-low border-none rounded-lg py-3 px-4 appearance-none focus:ring-2 focus:ring-primary-container/30 focus:outline-none text-on-surface text-sm pr-10"
                    value={centroCustoId}
                    onChange={(e) => setCentroCustoId(e.target.value)}
                  >
                    <option value="">Selecione um departamento</option>
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

              {/* Tipo de Pessoa */}
              <div className="col-span-12 md:col-span-6 space-y-1.5">
                <Label>Tipo de Pessoa</Label>
                <div className="flex gap-3">
                  {['PJ', 'PF'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipoPessoa(t)}
                      className={cn(
                        'flex-1 py-3 rounded-lg text-sm font-bold transition-all border',
                        tipoPessoa === t
                          ? 'bg-[#F97316] text-white border-[#F97316]'
                          : 'bg-surface-container-low text-text-muted border-transparent hover:border-outline-variant/30'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status toggle */}
              <div className="col-span-12 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={ativo}
                    onClick={() => setAtivo((v) => !v)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
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
                  <span className="text-sm font-semibold text-on-surface">
                    Status do Cliente ({ativo ? 'Ativo' : 'Inativo'})
                  </span>
                </div>
                <span className="text-xs text-text-muted italic max-w-xs text-right">
                  Defina se este cliente pode receber novos faturamentos imediatamente.
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-container-low p-6 flex justify-end items-center gap-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => navigate('/clientes')}
              className="px-6 py-2.5 rounded-lg border border-outline/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className={cn(
                'px-8 py-2.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 shadow-lg transition-all',
                canSave
                  ? 'hover:brightness-110 active:scale-[0.98] shadow-[#F97316]/30'
                  : 'opacity-50 cursor-not-allowed'
              )}
              style={{ background: canSave ? 'linear-gradient(to top, #9d4300, #f97316)' : '#d1d5db' }}
            >
              <Save className="w-4 h-4" />
              Salvar Cliente
            </button>
          </div>
        </div>
      </form>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Glassmorphism */}
        <div className="md:col-span-2 bg-white/40 backdrop-blur-sm p-6 rounded-xl border border-white/60">
          <div className="flex items-start gap-4">
            <div className="bg-[#F97316]/10 p-3 rounded-full flex-shrink-0">
              <Info className="w-5 h-5 text-[#F97316]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Instruções de Cadastro</h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Certifique-se de que os dados fiscais estão atualizados conforme o Sintegra.
                Clientes inativos não aparecerão nos módulos de vendas e projetos, mas seus
                históricos financeiros permanecerão preservados no banco de dados.
              </p>
            </div>
          </div>
        </div>

        {/* Right: dark card */}
        <div className="bg-inverse-surface p-6 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#F97316] mb-2">
            Suporte Rápido
          </h4>
          <p className="text-[11px] leading-relaxed text-gray-400">
            Precisa de ajuda para validar os dados deste cliente? Nossa equipe fiscal está
            disponível das 08h às 18h.
          </p>
          <button className="mt-4 text-[11px] font-bold text-white flex items-center gap-1 hover:text-[#F97316] transition-colors">
            Abrir chamado →
          </button>
        </div>
      </div>
    </div>
  )
}
