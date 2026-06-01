import { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  Clock, Landmark, PiggyBank, ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import PageHeader from '../../components/shared/PageHeader'
import SummaryCards from '../../components/shared/SummaryCards'
import StatusBadge from '../../components/shared/StatusBadge'
import { getSummaryFinanceiro, parcelas, despesas, movimentacoes } from '../../data/index'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'wouter'

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function saudacao(usuario) {
  const h = new Date().getHours()
  const nome = usuario?.usuario || 'usuário'
  if (h < 12) return `Bom dia, ${nome}`
  if (h < 18) return `Boa tarde, ${nome}`
  return `Boa noite, ${nome}`
}

export default function DashboardPage() {
  const { usuario } = useAuth()
  const summary = getSummaryFinanceiro()

  const cards = [
    {
      title: 'Saldo Total',
      value: summary.saldoTotal,
      type: 'currency',
      icon: Landmark,
      trend: 1,
      trendLabel: '+8,2% vs mês anterior',
    },
    {
      title: 'Receitas — Maio/26',
      value: summary.receitasMes,
      type: 'currency',
      icon: TrendingUp,
      trend: 1,
      trendLabel: '+3,1% vs Abr',
      accent: '#2E7D32',
    },
    {
      title: 'Despesas — Maio/26',
      value: summary.despesasMes,
      type: 'currency',
      icon: TrendingDown,
      trend: -1,
      trendLabel: '-1,4% vs Abr',
      accent: '#C62828',
    },
    {
      title: 'A Receber',
      value: summary.aReceber,
      type: 'currency',
      icon: DollarSign,
      trend: 0,
      trendLabel: `${parcelas.filter(p => p.situacao === 'em-aberto').length} parcelas pendentes`,
      accent: '#F57F17',
    },
  ]

  const cardsRow2 = [
    {
      title: 'A Pagar',
      value: summary.aPagar,
      type: 'currency',
      icon: Clock,
      trend: 0,
      trendLabel: `${despesas.filter(d => d.situacao === 'prevista').length} despesas previstas`,
      accent: '#F97316',
    },
    {
      title: 'Parcelas Vencidas',
      value: summary.parcelasVencidas,
      type: 'number',
      icon: AlertTriangle,
      trend: -1,
      trendLabel: 'Requer atenção imediata',
      accent: '#C62828',
    },
    {
      title: 'Resultado Maio/26',
      value: summary.lucroMes,
      type: 'currency',
      icon: PiggyBank,
      trend: summary.lucroMes > 0 ? 1 : -1,
      trendLabel: summary.lucroMes > 0 ? 'Margem positiva' : 'Margem negativa',
      accent: summary.lucroMes > 0 ? '#2E7D32' : '#C62828',
    },
    {
      title: 'Dívida Total',
      value: summary.saldoDevedor,
      type: 'currency',
      icon: Landmark,
      trend: -1,
      trendLabel: 'Empréstimos ativos',
      accent: '#006398',
    },
  ]

  // Recent movimentacoes (excluding projected)
  const recentes = movimentacoes
    .filter(m => m.tipo !== 'projetado')
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 6)

  // Parcelas vencidas
  const parcelasVencidas = parcelas.filter(p => p.situacao === 'vencida').slice(0, 4)

  // Upcoming (em-aberto)
  const proximas = parcelas
    .filter(p => p.situacao === 'em-aberto')
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, 4)

  return (
    <div>
      <PageHeader
        title={saudacao(usuario)}
        subtitle="Aqui está o resumo financeiro de hoje — 01 de junho de 2026"
      />

      <SummaryCards cards={cards} />
      <SummaryCards cards={cardsRow2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Movimentações recentes */}
        <div className="lg:col-span-2 rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-surface-container">
            <h3 className="text-sm font-bold text-on-surface">Movimentações Recentes</h3>
            <Link href="/fluxo-de-caixa">
              <a className="text-xs font-semibold text-primary-container hover:text-primary flex items-center gap-1">
                Ver tudo <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </Link>
          </div>
          <div className="divide-y divide-surface-container">
            {recentes.map(mov => (
              <div key={mov.id} className="flex items-center gap-3 px-5 py-3 hover:bg-row-hover transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${mov.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {mov.tipo === 'entrada'
                    ? <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                    : <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{mov.descricao}</p>
                  <p className="text-xs text-text-muted">{mov.categoria} · {mov.conta}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${mov.tipo === 'entrada' ? 'text-green-700' : 'text-error'}`}>
                    {mov.tipo === 'entrada' ? '+' : '-'}{fmt(mov.entrada ?? mov.saida ?? 0)}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {new Date(mov.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div className="space-y-4">
          {/* Parcelas vencidas */}
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-surface-container">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-error" />
                Vencidas
              </h3>
              <Link href="/parcelas">
                <a className="text-xs font-semibold text-primary-container hover:text-primary">Ver mais</a>
              </Link>
            </div>
            {parcelasVencidas.length === 0 ? (
              <p className="px-5 py-4 text-xs text-text-muted">Nenhuma parcela vencida. 🎉</p>
            ) : (
              <div className="divide-y divide-surface-container">
                {parcelasVencidas.map(p => (
                  <div key={p.id} className="px-5 py-3">
                    <p className="text-xs font-semibold text-on-surface truncate">{p.clienteNome}</p>
                    <p className="text-[10px] text-text-muted">#{p.numero} · Venc. {new Date(p.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs font-bold text-error mt-0.5">{fmt(p.valorBruto)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Próximos recebimentos */}
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-surface-container">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary-container" />
                Próximos
              </h3>
              <Link href="/parcelas">
                <a className="text-xs font-semibold text-primary-container hover:text-primary">Ver mais</a>
              </Link>
            </div>
            <div className="divide-y divide-surface-container">
              {proximas.map(p => (
                <div key={p.id} className="px-5 py-3">
                  <p className="text-xs font-semibold text-on-surface truncate">{p.clienteNome}</p>
                  <p className="text-[10px] text-text-muted">#{p.numero} · {new Date(p.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs font-bold text-primary-container mt-0.5">{fmt(p.valorBruto)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
