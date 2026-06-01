import { cn } from '../../utils/cn'

const STATUS_MAP = {
  // Verde
  paga:        { label: 'Paga',         color: '#2E7D32' },
  ativo:       { label: 'Ativo',        color: '#2E7D32' },
  ativa:       { label: 'Ativa',        color: '#2E7D32' },
  aprovado:    { label: 'Aprovado',     color: '#2E7D32' },
  confirmado:  { label: 'Confirmado',   color: '#2E7D32' },
  quitado:     { label: 'Quitado',      color: '#006398' },
  recebido:    { label: 'Recebido',     color: '#006398' },
  // Vermelho
  vencida:      { label: 'Vencida',      color: '#C62828' },
  inadimplente: { label: 'Inadimplente', color: '#C62828' },
  cancelada:    { label: 'Cancelada',    color: '#C62828' },
  cancelado:    { label: 'Cancelado',    color: '#C62828' },
  perdida:      { label: 'Perdida',      color: '#C62828' },
  // Amarelo
  'em-aberto':  { label: 'Em Aberto',    color: '#F57F17' },
  prevista:     { label: 'Prevista',     color: '#F57F17' },
  projecao:     { label: 'Projeção',     color: '#F57F17' },
  // Laranja
  'pagamento-parcial': { label: 'Parcial', color: '#F97316' },
  medio:               { label: 'Médio',   color: '#F97316' },
  // Cinza
  encerrada: { label: 'Encerrada', color: '#6B7280' },
  encerrado: { label: 'Encerrado', color: '#6B7280' },
  inativa:   { label: 'Inativa',   color: '#6B7280' },
  inativo:   { label: 'Inativo',   color: '#6B7280' },
  // Azul claro
  projetado:    { label: 'Projetado',    color: '#0288D1' },
  transferencia: { label: 'Transferência', color: '#0288D1' },
  transf:        { label: 'Transferência', color: '#0288D1' },
  // Azul
  'acao-critica': { label: 'Ação Crítica', color: '#C62828', bold: true },
  normal:          { label: 'Normal',       color: '#006398' },
  automatico:      { label: 'Automático',   color: '#6B7280' },
}

export default function StatusBadge({ status, className }) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '-')
  const config = STATUS_MAP[key] || { label: status, color: '#6B7280' }
  const { label, color, bold } = config

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-0.5 text-xs uppercase tracking-wide',
        bold ? 'font-bold' : 'font-semibold',
        className
      )}
      style={{
        color,
        backgroundColor: `${color}1A`,
      }}
    >
      {label}
    </span>
  )
}
