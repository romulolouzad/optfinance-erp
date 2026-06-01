import { useState } from 'react'
import { Eye, Pencil, Building2, ChevronRight, Save } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../utils/cn'
import { getImpostos, setImpostos as salvarImpostos } from '../../data/configuracoes-store'

const MENU_ITEMS = [
  { id: 'empresa', label: 'Empresa & Filiais' },
  { id: 'centros', label: 'Centros de Custo' },
  { id: 'impostos', label: 'Padrão de Impostos' },
  { id: 'comissoes', label: 'Tabela de Comissões' },
  { id: 'parametros', label: 'Parâmetros do Sistema' },
]

const EMPRESA_DADOS = {
  razaoSocial: 'Optsolv Soluções Empresariais LTDA',
  cnpj: '12.345.678/0001-90',
  nomeFantasia: 'Optsolv ERP',
  endereco: 'Av. Paulista, 1000 - São Paulo, SP',
}

const FILIAIS = [
  { id: '001', nome: 'Matriz São Paulo', cnpj: '12.345.678/0001-90', status: 'ativo' },
  { id: '002', nome: 'Filial Rio de Janeiro', cnpj: '12.345.678/0002-71', status: 'ativo' },
]

const DEFAULT_IMPOSTOS = getImpostos()

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="w-1 h-5 rounded-full" style={{ background: '#F97316' }} />
      <h2 className="text-base font-bold text-on-surface">{children}</h2>
    </div>
  )
}

function inputCls() {
  return 'w-full px-4 py-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all text-on-surface bg-surface-container-low border-none'
}

function ImpostosSection({ impostos, setImpostos, onSave }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 mb-4">
      <SectionTitle>Padrão de Impostos</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {['iss', 'csll', 'pis', 'irpj', 'cofins'].map((key) => (
          <div key={key} className="relative">
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">
              {key.toUpperCase()} %
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                className={inputCls() + ' pr-8'}
                value={impostos[key]}
                onChange={e => setImpostos(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-6 py-2.5 text-sm rounded-lg text-white font-bold transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
        >
          <Save className="w-4 h-4" />
          Salvar Padrão
        </button>
      </div>
    </div>
  )
}

function EmpresaSection() {
  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between mb-5">
          <SectionTitle>Dados da Empresa</SectionTitle>
          <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-[#F97316]">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: 'RAZÃO SOCIAL', value: EMPRESA_DADOS.razaoSocial },
            { label: 'CNPJ', value: EMPRESA_DADOS.cnpj },
            { label: 'NOME FANTASIA', value: EMPRESA_DADOS.nomeFantasia },
            { label: 'ENDEREÇO', value: EMPRESA_DADOS.endereco },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">{label}</p>
              <p className="text-sm font-medium text-on-surface">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <SectionTitle>Filiais</SectionTitle>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-bold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
          >
            + Nova Filial
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20">
              {['ID', 'NOME', 'CNPJ', 'STATUS', 'AÇÕES'].map(h => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-text-muted pb-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILIAIS.map(f => (
              <tr key={f.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3 pr-4 font-mono text-xs text-text-muted">{f.id}</td>
                <td className="py-3 pr-4 font-medium text-on-surface">{f.nome}</td>
                <td className="py-3 pr-4 font-mono text-xs text-text-muted">{f.cnpj}</td>
                <td className="py-3 pr-4">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider"
                    style={{ background: '#dcfce7', color: '#166534' }}>
                    ATIVO
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded hover:bg-surface-container text-text-muted hover:text-on-surface transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-surface-container text-text-muted hover:text-[#F97316] transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function ParametrosSection({ params, setParams, onSave }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
      <SectionTitle>Parâmetros do Sistema</SectionTitle>
      <div className="space-y-0 divide-y divide-outline-variant/10">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-on-surface">Paginação do histórico</p>
            <p className="text-xs text-text-muted mt-0.5">Número de itens por página em auditoria</p>
          </div>
          <select
            className="bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-[#F97316]/20 focus:outline-none appearance-none pr-8"
            value={params.paginacao}
            onChange={e => setParams(p => ({ ...p, paginacao: e.target.value }))}
          >
            <option value="50">50 itens por página</option>
            <option value="100">100 itens por página</option>
            <option value="200">200 itens por página</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-on-surface">Horizonte do Forecast</p>
            <p className="text-xs text-text-muted mt-0.5">Período padrão para projeções financeiras</p>
          </div>
          <select
            className="bg-surface-container-low border-none rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-[#F97316]/20 focus:outline-none appearance-none pr-8"
            value={params.forecast}
            onChange={e => setParams(p => ({ ...p, forecast: e.target.value }))}
          >
            <option value="12">12 meses</option>
            <option value="24">24 meses</option>
            <option value="36">36 meses</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-on-surface">Timezone</p>
            <p className="text-xs text-text-muted mt-0.5">Fuso horário do servidor central</p>
          </div>
          <span className="text-sm font-mono text-on-surface bg-surface-container-low px-3 py-2 rounded-lg">
            America/Sao_Paulo
          </span>
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-on-surface">Concorrência de edição</p>
            <p className="text-xs text-text-muted mt-0.5">Bloqueio automático de registros em uso</p>
          </div>
          <span className="px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider"
            style={{ background: '#fff7ed', color: '#F97316', border: '1px solid #fed7aa' }}>
            Habilitado
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-6 py-2.5 text-sm rounded-lg text-white font-bold transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: 'linear-gradient(to top, #9d4300, #f97316)' }}
        >
          <Save className="w-4 h-4" />
          Salvar Parâmetros
        </button>
      </div>
    </div>
  )
}

function ComingSoon({ label }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
        <Building2 className="w-6 h-6 text-text-muted" />
      </div>
      <p className="text-sm font-semibold text-on-surface">{label}</p>
      <p className="text-xs text-text-muted mt-1">Esta seção estará disponível em breve.</p>
      <span className="mt-3 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider"
        style={{ background: '#f3f4f6', color: '#6b7280' }}>
        Em breve
      </span>
    </div>
  )
}

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState('empresa')
  const [impostos, setImpostos] = useState(DEFAULT_IMPOSTOS)
  const [params, setParams] = useState({ paginacao: '100', forecast: '24' })

  function handleSaveImpostos() {
    salvarImpostos(impostos)
    toast({ title: 'Padrão de impostos salvo com sucesso' })
  }

  function handleSaveParametros() {
    toast({ title: 'Parâmetros do sistema salvos com sucesso' })
  }

  function renderContent() {
    switch (activeSection) {
      case 'empresa': return <EmpresaSection />
      case 'impostos': return <ImpostosSection impostos={impostos} setImpostos={setImpostos} onSave={handleSaveImpostos} />
      case 'parametros': return <ParametrosSection params={params} setParams={setParams} onSave={handleSaveParametros} />
      case 'centros': return <ComingSoon label="Centros de Custo" />
      case 'comissoes': return <ComingSoon label="Tabela de Comissões" />
      default: return null
    }
  }

  return (
    <div>
      <PageHeader title="CONFIGURAÇÕES" subtitle="Parâmetros gerais do sistema" />

      <div className="flex gap-6 min-h-0">
        {/* Sidebar menu */}
        <div className="w-[250px] flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            {MENU_ITEMS.map((item, idx) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3.5 text-sm transition-colors text-left',
                    idx > 0 ? 'border-t border-outline-variant/10' : '',
                    isActive
                      ? 'text-[#F97316] font-semibold bg-orange-50'
                      : 'text-on-surface hover:bg-surface-container-low'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-[#F97316]" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 overflow-y-auto pb-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
