import { Building2 } from 'lucide-react'

export default function PrintHeader({ titulo, filtros = [] }) {
  const now = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const filtrosAtivos = filtros.filter(f => f.valor)

  return (
    <div className="hidden print:block mb-6 pb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F97316, #9D4300)' }}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Optsolv ERP
            </p>
            <h1 className="text-xl font-black text-gray-900">{titulo}</h1>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>
            Gerado em: <strong>{now}</strong>
          </p>
        </div>
      </div>

      {filtrosAtivos.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Filtros ativos:
          </span>
          {filtrosAtivos.map((f, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded font-semibold text-gray-700"
              style={{ background: '#f3f4f6' }}
            >
              {f.label}: {f.valor}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
