import { useState } from 'react'
import { Link } from 'wouter'
import { Eye, Plus, Upload, Info, Wallet, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import ContaSlidePanel from './components/ContaSlidePanel'
import {
  contas,
  getSaldoTotalAtivo,
  getUltimaMovimentacao,
} from '../../data/contasMock'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function ContasFinanceirasPage() {
  const [selectedConta, setSelectedConta] = useState(null)
  const [contasState, setContasState] = useState(contas)

  const refresh = () => setContasState([...contas])

  const saldoTotal = getSaldoTotalAtivo()
  const ativas = contasState.filter((c) => c.ativa)
  const ultimaMov = getUltimaMovimentacao()

  const totalAll = contasState.reduce((s, c) => s + c.saldoAtual, 0)

  return (
    <div>
      <PageHeader
        title="Contas Bancárias"
        subtitle="Gestão de contas da empresa"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/contas-financeiras/conciliacao">
              <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-surface-container-high text-on-surface hover:bg-surface-container transition-colors font-medium">
                <Upload className="w-3.5 h-3.5" />
                Importar Extrato
              </button>
            </Link>
            <Link href="/contas-financeiras/nova">
              <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white font-semibold transition-colors"
                style={{ background: 'linear-gradient(135deg,#F97316,#9D4300)' }}>
                <Plus className="w-3.5 h-3.5" />
                Nova Conta Bancária
              </button>
            </Link>
          </div>
        }
      />

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-blue-50 border border-blue-100">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          As contas bancárias são a base do Fluxo de Caixa. Todo movimento financeiro está vinculado a uma conta.{' '}
          <strong>Contas não são excluídas fisicamente — apenas inativadas.</strong>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Saldo Total */}
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Saldo Total Consolidado</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#F9731618' }}>
              <Wallet className="w-4 h-4" style={{ color: '#F97316' }} />
            </div>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#F97316' }}>{fmt(saldoTotal)}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <p className="text-xs text-green-600 font-medium">+2.4% em relação ao mês anterior</p>
          </div>
        </div>

        {/* Card 2: Contas Ativas */}
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Contas Ativas</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {ativas.length} <span className="text-base font-normal text-text-muted">Contas</span>
          </p>
          <p className="text-xs text-text-muted mt-2">Sem contas pendentes de regularização</p>
        </div>

        {/* Card 3: Última Movimentação */}
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Última Movimentação</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container">
              <Clock className="w-4 h-4 text-text-muted" />
            </div>
          </div>
          <p className="text-2xl font-bold text-on-surface">{ultimaMov.dataHora}</p>
          <p className="text-xs text-text-muted mt-2">Conta: {ultimaMov.contaNome}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-container">
          <h2 className="text-sm font-bold text-on-surface tracking-editorial">Listagem de Contas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-container">
                {['ID', 'Nome da Conta', 'Banco', 'Agência', 'Conta', 'Saldo Inicial', 'Saldo Atual', 'Status', 'Ações'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-muted whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contasState.map((conta) => (
                <tr
                  key={conta.id}
                  className={`border-b border-surface-container transition-colors hover:bg-surface-container/40 ${!conta.ativa ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3.5 text-xs font-mono text-text-muted">{conta.numero}</td>
                  <td className="px-4 py-3.5 font-bold text-on-surface whitespace-nowrap">{conta.nome}</td>
                  <td className="px-4 py-3.5 text-sm text-on-surface whitespace-nowrap">{conta.banco}</td>
                  <td className="px-4 py-3.5 text-sm text-on-surface">{conta.agencia}</td>
                  <td className="px-4 py-3.5 text-sm text-on-surface font-mono">{conta.conta}</td>
                  <td className="px-4 py-3.5 text-sm text-text-muted whitespace-nowrap">{fmt(conta.saldoInicial)}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className="font-bold"
                      style={{ color: conta.ativa ? '#F97316' : undefined }}
                    >
                      {fmt(conta.saldoAtual)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${conta.ativa ? 'bg-green-50 text-green-700' : 'bg-surface-container text-text-muted'}`}>
                      {conta.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelectedConta(conta)}
                      className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-text-muted hover:text-on-surface"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Footer total row */}
              <tr className="bg-surface-container/40">
                <td colSpan={6} className="px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-text-muted text-right">
                  Saldo Total
                </td>
                <td className="px-4 py-3.5 font-bold" style={{ color: '#F97316' }}>
                  {fmt(totalAll)}
                </td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center justify-between border-t border-surface-container">
          <p className="text-xs text-text-muted">
            Exibindo {contasState.length} de {contasState.length} contas cadastradas
          </p>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded text-xs text-text-muted hover:bg-surface-container transition-colors">‹</button>
            <button className="px-2 py-1 rounded text-xs bg-primary-container/10 text-primary-container font-bold">1</button>
            <button className="px-2 py-1 rounded text-xs text-text-muted hover:bg-surface-container transition-colors">›</button>
          </div>
        </div>
      </div>

      {/* SlidePanel */}
      <ContaSlidePanel
        conta={selectedConta}
        open={!!selectedConta}
        onClose={() => setSelectedConta(null)}
        onUpdate={refresh}
      />
    </div>
  )
}
