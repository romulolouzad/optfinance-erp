import { useEffect, useState } from 'react'
import { Link, useParams } from 'wouter'
import {
  ChevronRight,
  Edit,
  Ban,
  ThumbsDown,
  X,
  CheckCircle,
  Filter,
  Clock,
  ChevronDown,
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { vendas } from '../../data/vendas-store'
import FormRegistrarParcela from './FormRegistrarParcela'
import { cn } from '../../utils/cn'

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmtDate = (s) =>
  s ? new Date(s + 'T00:00:00').toLocaleDateString('pt-BR') : '—'

const fmtCompetencia = (c) => {
  if (!c) return '—'
  const [y, m] = c.split('-')
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${MESES[parseInt(m, 10) - 1]}/${y}`
}

// Maps raw vendas.json situacao values to display keys used in the table
const SITUACAO_MAP = {
  paga:               'paga',
  'pagamento-parcial':'pagamento-parcial',
  'em-aberto':        'em-aberto',
  vencida:            'em-aberto',  // show as em-aberto with REGISTRAR
  projetado:          'em-aberto',
}

function buildMockParcelas(venda) {
  if (!venda || !venda.parcelas || venda.parcelas.length === 0) return []

  const last = venda.parcelas[venda.parcelas.length - 1]
  const parts = (last.numero || '').split('/')
  const total = parts[1] ? parseInt(parts[1]) : venda.parcelas.length
  const valorFallback = venda.valorTotal / total

  return venda.parcelas.map((p, i) => {
    const rawSituacao = (p.situacao || 'em-aberto').toLowerCase()
    const situacao = SITUACAO_MAP[rawSituacao] || 'em-aberto'
    const isPaga = situacao === 'paga'

    // Derive NF and recebimento from real situacao.
    // If the parcela has explicit fields, prefer them; otherwise infer sensible defaults.
    const nfEmitida = p.nfEmitida !== undefined
      ? Boolean(p.nfEmitida)
      : isPaga                    // paid parcelas assumed to have NF; open ones don't

    const recebimento = p.dataRecebimento !== undefined
      ? p.dataRecebimento
      : isPaga
        ? p.vencimento            // use vencimento as a fallback receipt date for paid parcelas
        : null

    const mesBase = parseInt((venda.competencia || '2026-01').split('-')[1], 10)
    const anoBase = parseInt((venda.competencia || '2026-01').split('-')[0], 10)
    const parcMes = ((mesBase - 1 + i) % 12) + 1
    const parcAno = anoBase + Math.floor((mesBase - 1 + i) / 12)
    const compStr = `${String(parcMes).padStart(2, '0')}/${parcAno}`

    return {
      id:          p.numero || `${String(i + 1).padStart(2, '0')}/${total}`,
      numero:      p.numero || `${String(i + 1).padStart(2, '0')}/${total}`,
      competencia: compStr,
      vencimento:  p.vencimento || null,
      valor:       p.valor || valorFallback,
      situacao,
      nfEmitida,
      recebimento,
    }
  })
}

function deriveComissaoStatus(parcela) {
  if (parcela.situacao === 'paga') return 'paga'
  if (parcela.nfEmitida) return 'pronta'
  return 'aguardando-nf'
}

const HISTORICO_INICIAL = [
  {
    id: 1,
    tipo: 'sistema',
    data: '10 Mar 2026 — 14:32',
    texto: (
      <>
        <strong className="font-bold">João Silva</strong> registrou o pagamento da parcela 01/12.
      </>
    ),
  },
  {
    id: 2,
    tipo: 'usuario',
    data: '02 Mar 2026 — 09:15',
    texto: (
      <>
        <strong className="font-bold">Ana Costa</strong> anexou a nota fiscal para a parcela 01/12.
      </>
    ),
  },
  {
    id: 3,
    tipo: 'usuario',
    data: '01 Mar 2026 — 16:45',
    texto: (
      <>
        Venda criada por <strong className="font-bold">João Silva</strong> com status inicial{' '}
        <span className="text-green-600 font-bold">Ativa</span>.
      </>
    ),
  },
]

const HISTORICO_EXTRA = [
  {
    id: 4,
    tipo: 'sistema',
    data: '28 Fev 2026 — 11:00',
    texto: (
      <>
        Proposta comercial aprovada por <strong className="font-bold">Carlos Souza</strong>.
      </>
    ),
  },
  {
    id: 5,
    tipo: 'usuario',
    data: '25 Fev 2026 — 10:20',
    texto: (
      <>
        <strong className="font-bold">João Silva</strong> enviou proposta ao cliente AMT Engenharia.
      </>
    ),
  },
  {
    id: 6,
    tipo: 'sistema',
    data: '20 Fev 2026 — 08:00',
    texto: <>Contrato gerado automaticamente pelo sistema.</>,
  },
]

function StatusParcelaBadge({ situacao }) {
  const map = {
    paga:               { label: 'PAGA',              cls: 'bg-green-100 text-green-700' },
    'pagamento-parcial':{ label: 'PAGAMENTO PARCIAL', cls: 'bg-yellow-100 text-yellow-700' },
    'em-aberto':        { label: 'EM ABERTO',         cls: 'bg-gray-100 text-gray-600'   },
    vencida:            { label: 'VENCIDA',           cls: 'bg-red-100 text-red-700'     },
  }
  const cfg = map[situacao] || map['em-aberto']
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

function StatusComissaoBadge({ status }) {
  const map = {
    paga:          { label: 'PAGA',         cls: 'bg-green-100 text-green-700'  },
    pronta:        { label: 'PRONTA',       cls: 'bg-blue-100 text-blue-700'    },
    'aguardando-nf':{ label: 'AGUARDANDO NF', cls: 'bg-yellow-100 text-yellow-700' },
  }
  const cfg = map[status] || map['aguardando-nf']
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

function StatusVendaBadge({ situacao }) {
  const map = {
    ativa:     { label: 'ATIVA',     cls: 'bg-green-100 text-green-700' },
    projecao:  { label: 'PROJEÇÃO',  cls: 'bg-gray-100 text-gray-600'   },
    inativa:   { label: 'INATIVA',   cls: 'bg-orange-100 text-orange-700' },
    perdida:   { label: 'PERDIDA',   cls: 'bg-red-100 text-red-700'     },
    encerrada: { label: 'ENCERRADA', cls: 'bg-gray-800 text-white'      },
  }
  const cfg = map[(situacao || '').toLowerCase()] || map.ativa
  return (
    <span className={cn('px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

export default function DetalheVenda() {
  const { id } = useParams()
  const { toast } = useToast()

  const venda = vendas.find((v) => v.id === id) || vendas[0]
  const parcelas = buildMockParcelas(venda)
  const [registrando, setRegistrando] = useState(null)
  const [historicoVisible, setHistoricoVisible] = useState(HISTORICO_INICIAL)
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const { id: toastId, dismiss } = toast({
        title: '✅ Venda visualizada',
        description: 'Log de acesso registrado com sucesso.',
      })
      setTimeout(() => dismiss(), 3000)
    }, 400)
    return () => clearTimeout(t)
  }, [])

  function handleCarregarHistorico() {
    if (!carregado) {
      setHistoricoVisible([...HISTORICO_INICIAL, ...HISTORICO_EXTRA])
      setCarregado(true)
    }
  }

  function handleConfirmarParcela(dados) {
    setRegistrando(null)
    toast({
      title: '✅ Recebimento registrado',
      description: `Parcela ${dados.parcelaNumero} registrada com sucesso.`,
    })
  }

  const tipoLabel = venda?.tipoVenda === 'recorrente' ? 'Recorrente' : 'Pontual'

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
        <Link href="/vendas" className="hover:text-primary-container transition-colors">
          Vendas &amp; Contratos
        </Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span className="text-primary-container border-b border-primary-container pb-px">
          #{venda?.numero || '0000'} — {venda?.clienteNome || '—'}
        </span>
      </div>

      {/* Top: Resumo + Ações */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumo da Venda (2/3) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                Resumo da Venda
              </h2>
              <StatusVendaBadge situacao={venda?.situacao} />
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  Cliente
                </p>
                <p className="text-sm font-semibold text-on-surface">
                  {venda?.clienteNome || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  Vendedor
                </p>
                <p className="text-sm font-semibold text-on-surface">
                  {venda?.vendedor || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  Tipo
                </p>
                <p className="text-sm font-semibold text-on-surface">{tipoLabel}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  Competência
                </p>
                <p className="text-sm font-semibold text-on-surface">
                  {fmtCompetencia(venda?.competencia)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-surface-container-high">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
              Valor Total
            </p>
            <p className="text-4xl font-bold text-primary-container tracking-tighter">
              {fmt(venda?.valorTotal ?? 0)}
            </p>
          </div>
        </div>

        {/* Ações Disponíveis (1/3) */}
        <div className="bg-inverse-surface rounded-xl p-8 flex flex-col space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Ações Disponíveis
          </p>
          <button
            className="w-full text-white font-bold py-3 px-4 rounded-lg text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(to top, #9D4300, #F97316)' }}
          >
            <Edit className="w-4 h-4" />
            Editar Venda
          </button>
          <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <Ban className="w-4 h-4" />
            Inativar
          </button>
          <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <ThumbsDown className="w-4 h-4" />
            Marcar como Perdida
          </button>
          <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 px-4 rounded-lg text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <X className="w-4 h-4" />
            Encerrar
          </button>
        </div>
      </section>

      {/* Parcelas */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-high">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Parcelas</h2>
          <button className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-primary-container transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filtrar Status
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                {['Nº', 'Competência', 'Vencimento', 'Valor Bruto', 'Status', 'NF', 'Recebimento', 'Ações'].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        'py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest',
                        h === 'Nº' || h === 'Ações' ? 'px-8' : 'px-4',
                        h === 'Ações' ? 'text-right' : '',
                      )}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {parcelas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-8 text-center text-sm text-text-muted">
                    Nenhuma parcela encontrada.
                  </td>
                </tr>
              )}
              {parcelas.map((p) => {
                const paga = p.situacao === 'paga'
                return (
                  <tr key={p.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-on-surface">{p.numero}</td>
                    <td className="px-4 py-4 text-sm text-text-muted">{p.competencia}</td>
                    <td className="px-4 py-4 text-sm text-text-muted">{fmtDate(p.vencimento)}</td>
                    <td className="px-4 py-4 text-sm font-bold text-on-surface">{fmt(p.valor)}</td>
                    <td className="px-4 py-4">
                      <StatusParcelaBadge situacao={p.situacao} />
                    </td>
                    <td className="px-4 py-4">
                      {p.nfEmitida ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-100 text-yellow-700">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-muted">
                      {p.recebimento ? fmtDate(p.recebimento) : '—'}
                    </td>
                    <td className="px-8 py-4 text-right">
                      {paga ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <button
                          onClick={() => setRegistrando(p)}
                          className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg text-white hover:brightness-110 transition-all"
                          style={{ background: '#F97316' }}
                        >
                          Registrar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Comissões + Histórico */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Comissões */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-surface-container-high">
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Comissões</h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  {['Parcela', 'Vendedor', '%', 'Valor', 'Status'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest',
                        h === 'Parcela' || h === 'Status' ? 'px-8' : 'px-4',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {parcelas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-8 text-center text-sm text-text-muted">
                      Nenhuma comissão encontrada.
                    </td>
                  </tr>
                )}
                {parcelas.map((p) => {
                  const comStatus = deriveComissaoStatus(p)
                  const comissaoValor = p.valor * 0.05
                  return (
                    <tr key={p.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-8 py-4 text-sm font-bold text-on-surface">{p.numero}</td>
                      <td className="px-4 py-4 text-sm text-text-muted">
                        {venda?.vendedor || '—'}
                      </td>
                      <td className="px-4 py-4 text-sm text-text-muted">5%</td>
                      <td className="px-4 py-4 text-sm font-bold text-on-surface">
                        {fmt(comissaoValor)}
                      </td>
                      <td className="px-8 py-4">
                        <StatusComissaoBadge status={comStatus} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Histórico de Alterações */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col">
          <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-on-surface">
                Histórico de alterações
              </h2>
              <span className="px-2 py-0.5 bg-surface-container text-text-muted text-[10px] font-bold rounded">
                {historicoVisible.length + (carregado ? 0 : HISTORICO_EXTRA.length)} eventos
              </span>
            </div>
            <button
              onClick={handleCarregarHistorico}
              disabled={carregado}
              className={cn(
                'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors',
                carregado
                  ? 'text-text-muted cursor-default'
                  : 'text-primary-container hover:underline',
              )}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              {carregado ? 'Carregado' : 'Carregar'}
            </button>
          </div>

          <div className="p-8 space-y-6">
            {historicoVisible.map((item, idx) => {
              const isLast = idx === historicoVisible.length - 1
              const isSistema = item.tipo === 'sistema'
              return (
                <div
                  key={item.id}
                  className={cn('relative pl-8', !isLast && 'border-l-2 border-surface-container pb-2')}
                  style={isLast ? { borderLeft: '2px solid transparent' } : {}}
                >
                  {/* Colored dot */}
                  <div
                    className={cn(
                      'absolute -left-[9px] top-0 w-4 h-4 rounded-full ring-4 ring-surface-container-lowest',
                      isSistema ? 'bg-primary-container' : 'bg-surface-container-high',
                    )}
                  />
                  <div className="mb-1 flex items-center gap-3">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      {item.data}
                    </p>
                    {isSistema && (
                      <span className="px-1.5 py-0.5 bg-surface-container text-on-surface text-[9px] font-bold rounded uppercase">
                        Sistema
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface">{item.texto}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FormRegistrarParcela modal */}
      {registrando && (
        <FormRegistrarParcela
          parcela={registrando}
          onClose={() => setRegistrando(null)}
          onConfirm={handleConfirmarParcela}
        />
      )}
    </div>
  )
}
