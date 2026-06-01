import { useState } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useCentroCusto } from '../../context/CentroCustoContext'
import { Settings, User, Building2, Bell, Shield, Palette } from 'lucide-react'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden mb-4">
      <div className="flex items-center gap-2 px-6 py-4 bg-surface-container">
        <Icon className="w-4 h-4 text-primary-container" />
        <h3 className="text-sm font-bold text-on-surface">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-label text-text-muted mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={value}
        readOnly
        className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container text-on-surface cursor-default focus:outline-none"
      />
    </div>
  )
}

export default function ConfiguracoesPage() {
  const { usuario } = useAuth()
  const { centros } = useCentroCusto()

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Preferências do sistema e dados da empresa" />

      <Section icon={User} title="Meu Perfil">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Usuário" value={usuario?.usuario} />
          <Field label="E-mail" value={usuario?.email} />
          <Field label="Cargo" value={usuario?.cargo} />
          <Field label="Perfil de Acesso" value={usuario?.perfil} />
        </div>
      </Section>

      <Section icon={Building2} title="Empresa">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Razão Social" value="OptSolv Consultoria Financeira Ltda" />
          <Field label="CNPJ" value="12.345.678/0001-90" />
          <Field label="Filial" value="São Paulo — SP" />
          <Field label="Regime Tributário" value="Lucro Presumido" />
        </div>
      </Section>

      <Section icon={Palette} title="Centros de Custo Ativos">
        <div className="space-y-2">
          {centros.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container">
              <span className="text-sm font-medium text-on-surface">{c.nome}</span>
              <span className="text-xs font-mono text-text-muted">{c.id}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Bell} title="Notificações">
        {[
          ['Alertas de inadimplência', true],
          ['Lembretes de vencimento (7 dias antes)', true],
          ['Relatório semanal por e-mail', false],
          ['Alertas de empréstimos', true],
        ].map(([label, active]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-on-surface">{label}</span>
            <div className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${active ? 'bg-primary-container' : 'bg-surface-container-high'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </div>
        ))}
      </Section>

      <Section icon={Shield} title="Segurança">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Último Login" value="01/06/2026 — 08:30" />
          <Field label="IP do Último Acesso" value="192.168.1.100" />
        </div>
        <button className="mt-2 px-4 py-2 text-sm rounded-lg bg-error/10 text-error font-semibold hover:bg-error/20 transition-colors">
          Alterar Senha
        </button>
      </Section>
    </div>
  )
}
