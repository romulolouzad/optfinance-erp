import { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Building2, LayoutDashboard, ShoppingCart, CreditCard, Percent,
  Users, UserCheck, Truck, FileText, BarChart2, TrendingUp,
  Target, Landmark, PieChart, BookOpen, Clock, Activity,
  Settings, HelpCircle, LogOut, Search, Plus, X, Upload,
  ChevronDown, CheckCircle, Circle, AlertCircle, Eye, Pencil,
  MoreVertical, Paperclip, Receipt,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:        "#9d4300",
  primaryCont:    "#f97316",
  surfLow:        "#f1f3ff",
  surfLowest:     "#ffffff",
  surfCont:       "#e9edff",
  surfContHigh:   "#e1e8fd",
  onBg:           "#141b2b",
  secondary:      "#575e70",
  error:          "#ba1a1a",
  outlineVar:     "#e0c0b1",
};

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",          href: "/dashboard",       icon: LayoutDashboard, section: null },
  { label: "Vendas & Contratos", href: "/vendas",          icon: ShoppingCart,    section: "COMERCIAL" },
  { label: "Parcelas",           href: "/parcelas",        icon: CreditCard,      section: "COMERCIAL" },
  { label: "Comissões",          href: "/comissoes",       icon: Percent,         section: "COMERCIAL" },
  { label: "Clientes",           href: "/clientes",        icon: Users,           section: "COMERCIAL" },
  { label: "Colaboradores",      href: "/colaboradores",   icon: UserCheck,       section: "OPERACIONAL" },
  { label: "Fornecedores",       href: "/fornecedores",    icon: Truck,           section: "OPERACIONAL" },
  { label: "Notas Fiscais",      href: "/notas-fiscais",   icon: FileText,        section: "OPERACIONAL" },
  { label: "DRE",                href: "/dre",             icon: BarChart2,       section: "FINANCEIRO" },
  { label: "Forecast",           href: "/forecast",        icon: TrendingUp,      section: "FINANCEIRO" },
  { label: "Metas",              href: "/metas",           icon: Target,          section: "FINANCEIRO" },
  { label: "Fluxo de Caixa",    href: "/fluxo-de-caixa",  icon: Activity,        section: "FINANCEIRO" },
  { label: "Despesas",           href: "/despesas",        icon: Landmark,        section: "FINANCEIRO" },
  { label: "Relatórios",         href: "/relatorios",      icon: PieChart,        section: "SISTEMA" },
  { label: "Budget",             href: "/budget",          icon: BookOpen,        section: "SISTEMA" },
  { label: "Histórico",          href: "/historico",       icon: Clock,           section: "SISTEMA" },
  { label: "Configurações",      href: "/configuracoes",   icon: Settings,        section: "SISTEMA" },
];
const NAV_SECTIONS = ["COMERCIAL", "OPERACIONAL", "FINANCEIRO", "SISTEMA"];

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "Prevista" | "Paga" | "Cancelada";
type Categoria = "Infraestrutura" | "Salários" | "Marketing" | "Manutenção" | "Suprimentos" | "Fixo";

interface Despesa {
  id: string;
  descricao: string;
  fornecedor: string;
  categoria: Categoria;
  centroCusto: string;
  vencimento: string; // YYYY-MM-DD
  valor: number;
  status: Status;
  competencia: string;
  dataPagamento?: string;
  contaBancaria?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_FORNECEDORES = [
  "Amazon Web Services",
  "Google Workspace",
  "Imobiliária Horizonte",
  "Clima Tech Ltda",
  "Papelaria Central",
  "Folha RH",
  "Meta Ads",
  "Oracle Corp",
  "Limpeza Total Ltda",
  "Telefônica Vivo",
];

const MOCK_CENTROS_CUSTO = [
  "Tecnologia",
  "Administrativo",
  "Operações Log",
  "Vendas",
  "Marketing",
  "RH",
  "Geral",
];

const MOCK_CONTAS_BANCARIAS = [
  "Itaú Business — Ag 0412",
  "Nubank PJ — Principal",
  "Bradesco Empresarial",
  "BTG Pactual Investimentos",
];

const INITIAL_DESPESAS: Despesa[] = [
  { id: "#8821", descricao: "Serviços de AWS Cloud",          fornecedor: "Amazon Web Services",    categoria: "Infraestrutura", centroCusto: "Tecnologia",    vencimento: "2026-04-12", valor: 6200.00,  status: "Prevista",  competencia: "2026-04" },
  { id: "#8820", descricao: "Aluguel Escritório Central",     fornecedor: "Imobiliária Horizonte",  categoria: "Fixo",           centroCusto: "Administrativo",vencimento: "2026-04-25", valor: 5400.00,  status: "Paga",      competencia: "2026-04", dataPagamento: "2026-04-25", contaBancaria: "Itaú Business — Ag 0412" },
  { id: "#8819", descricao: "Manutenção Ar Condicionado",     fornecedor: "Clima Tech Ltda",        categoria: "Manutenção",     centroCusto: "Geral",         vencimento: "2026-04-20", valor: 450.00,   status: "Cancelada", competencia: "2026-04" },
  { id: "#8818", descricao: "Material de Escritório Q4",      fornecedor: "Papelaria Central",      categoria: "Suprimentos",    centroCusto: "Vendas",        vencimento: "2026-04-28", valor: 890.20,   status: "Prevista",  competencia: "2026-04" },
  { id: "#8817", descricao: "Salários Equipe Dev",            fornecedor: "Folha RH",               categoria: "Salários",       centroCusto: "RH",            vencimento: "2026-04-10", valor: 25000.00, status: "Paga",      competencia: "2026-04", dataPagamento: "2026-04-10", contaBancaria: "Bradesco Empresarial" },
  { id: "#8816", descricao: "Campanha Google Ads — Q2",       fornecedor: "Meta Ads",               categoria: "Marketing",      centroCusto: "Marketing",     vencimento: "2026-04-28", valor: 4800.00,  status: "Prevista",  competencia: "2026-04" },
  { id: "#8815", descricao: "Licença Oracle Database",        fornecedor: "Oracle Corp",            categoria: "Infraestrutura", centroCusto: "Tecnologia",    vencimento: "2026-03-15", valor: 3200.00,  status: "Paga",      competencia: "2026-03", dataPagamento: "2026-03-15", contaBancaria: "Nubank PJ — Principal" },
  { id: "#8814", descricao: "Salários Equipe Comercial",      fornecedor: "Folha RH",               categoria: "Salários",       centroCusto: "RH",            vencimento: "2026-03-10", valor: 18500.00, status: "Paga",      competencia: "2026-03", dataPagamento: "2026-03-10", contaBancaria: "Bradesco Empresarial" },
  { id: "#8813", descricao: "Campanha Social Media — Mar",    fornecedor: "Meta Ads",               categoria: "Marketing",      centroCusto: "Marketing",     vencimento: "2026-03-20", valor: 2100.00,  status: "Paga",      competencia: "2026-03", dataPagamento: "2026-03-20", contaBancaria: "Itaú Business — Ag 0412" },
  { id: "#8812", descricao: "Serviços de Limpeza",            fornecedor: "Limpeza Total Ltda",     categoria: "Fixo",           centroCusto: "Administrativo",vencimento: "2026-03-01", valor: 800.00,   status: "Paga",      competencia: "2026-03", dataPagamento: "2026-03-01", contaBancaria: "Itaú Business — Ag 0412" },
  { id: "#8811", descricao: "Plano Corporativo Telefônica",   fornecedor: "Telefônica Vivo",        categoria: "Fixo",           centroCusto: "Administrativo",vencimento: "2026-02-15", valor: 1200.00,  status: "Paga",      competencia: "2026-02", dataPagamento: "2026-02-15", contaBancaria: "Nubank PJ — Principal" },
  { id: "#8810", descricao: "Salários Equipe Tech — Fev",     fornecedor: "Folha RH",               categoria: "Salários",       centroCusto: "RH",            vencimento: "2026-02-10", valor: 22000.00, status: "Paga",      competencia: "2026-02", dataPagamento: "2026-02-10", contaBancaria: "Bradesco Empresarial" },
  { id: "#8809", descricao: "Google Workspace Anual",         fornecedor: "Google Workspace",       categoria: "Infraestrutura", centroCusto: "Tecnologia",    vencimento: "2026-01-20", valor: 2850.00,  status: "Paga",      competencia: "2026-01", dataPagamento: "2026-01-20", contaBancaria: "Nubank PJ — Principal" },
  { id: "#8808", descricao: "Salários Equipe Admin — Jan",    fornecedor: "Folha RH",               categoria: "Salários",       centroCusto: "RH",            vencimento: "2026-01-10", valor: 20000.00, status: "Paga",      competencia: "2026-01", dataPagamento: "2026-01-10", contaBancaria: "Bradesco Empresarial" },
];

// Stacked bar chart data (JAN–ABR)
const CHART_DATA = [
  { mes: "JAN", Salários: 20000, Infra: 2850,  Marketing: 1800 },
  { mes: "FEV", Salários: 22000, Infra: 3100,  Marketing: 2400 },
  { mes: "MAR", Salários: 18500, Infra: 3200,  Marketing: 2100 },
  { mes: "ABR", Salários: 25000, Infra: 6200,  Marketing: 4800 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBRL(v: number): string {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function isOverdue(iso: string, status: Status): boolean {
  if (status === "Paga" || status === "Cancelada") return false;
  return new Date(iso) < new Date(new Date().toDateString());
}

function categoryBadge(cat: Categoria): { bg: string; color: string } {
  const map: Record<Categoria, { bg: string; color: string }> = {
    Infraestrutura: { bg: "#EDE9FE", color: "#6D28D9" },
    Salários:       { bg: "#DBEAFE", color: "#1D4ED8" },
    Marketing:      { bg: "#FFF7ED", color: "#C2410C" },
    Manutenção:     { bg: "#FEF9C3", color: "#854D0E" },
    Suprimentos:    { bg: "#DCFCE7", color: "#15803D" },
    Fixo:           { bg: "#F3F4F6", color: "#374151" },
  };
  return map[cat];
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return `${months[parseInt(m, 10) - 1]} / ${y}`;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar() {
  const sections: (string | null)[] = [null, ...NAV_SECTIONS];
  return (
    <aside className="fixed top-0 left-0 h-full w-[220px] z-40 flex flex-col" style={{ background: "#111827" }}>
      <div className="flex items-center gap-2.5 px-4 h-16 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #F97316, #9D4300)" }}>
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none tracking-tight">Optsolv ERP</p>
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 leading-none">PRECISION ARCHITECT</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sections.map(section => {
          const items = section === null
            ? NAV_ITEMS.filter(i => i.section === null)
            : NAV_ITEMS.filter(i => i.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section ?? "_top"} className={section ? "mt-2" : ""}>
              {section && (
                <p className="text-[10px] text-gray-500 uppercase tracking-widest px-4 mt-4 mb-1 font-semibold">{section}</p>
              )}
              <div className="space-y-0.5">
                {items.map(item => {
                  const active = item.href === "/despesas";
                  const Icon = item.icon;
                  return (
                    <a key={item.href} href="#" onClick={e => e.preventDefault()}
                      className={`relative flex items-center gap-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-white/5 text-white font-semibold pl-[calc(1rem-4px)] pr-3 border-l-4 border-[#F97316]"
                          : "text-gray-400 hover:text-white hover:bg-white/10 px-4"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#F97316]" : ""}`} />
                      <span className="truncate">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="px-3 pb-4 flex-shrink-0 space-y-2">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F97316, #9D4300)" }}>
            OA
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate leading-none">Admin Optsolv</p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-none">Master Account</p>
          </div>
        </div>
        <div className="space-y-0.5">
          <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <HelpCircle className="w-3.5 h-3.5" /> Support
          </a>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastMsg { id: number; msg: string }

function Toast({ toasts, onDismiss }: { toasts: ToastMsg[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="pointer-events-auto flex items-center gap-3 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl"
          onClick={() => onDismiss(t.id)}
        >
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────
function CatBadge({ cat }: { cat: Categoria }) {
  const s = categoryBadge(cat);
  return (
    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold"
      style={{ background: s.bg, color: s.color }}>
      {cat}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; color: string }> = {
    Prevista:  { bg: "#FEF9C3", color: "#92400E" },
    Paga:      { bg: "#DCFCE7", color: "#166534" },
    Cancelada: { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ─── Despesas Table ───────────────────────────────────────────────────────────
function DespesasTable({
  despesas,
  onPagar,
}: {
  despesas: Despesa[];
  onPagar: (d: Despesa) => void;
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100"
      style={{ boxShadow: "0 4px 24px rgba(17,24,39,0.04)" }}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ background: C.surfLow }}>
            {["ID","Descrição","Fornecedor","Categoria","Centro Custo","Vencimento","Valor","Status","Ações"].map(h => (
              <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: C.secondary }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {despesas.length === 0 && (
            <tr>
              <td colSpan={9} className="px-5 py-10 text-center text-sm text-gray-400">
                Nenhuma despesa encontrada.
              </td>
            </tr>
          )}
          {despesas.map(d => {
            const overdue = isOverdue(d.vencimento, d.status);
            return (
              <tr key={d.id}
                className="transition-colors hover:bg-orange-50/20"
                style={overdue ? { background: "rgba(254,226,226,0.3)" } : undefined}>
                <td className="px-5 py-3.5 text-xs font-mono" style={{ color: "#6B7280" }}>{d.id}</td>
                <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: C.onBg }}>{d.descricao}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: C.secondary }}>{d.fornecedor}</td>
                <td className="px-5 py-3.5"><CatBadge cat={d.categoria} /></td>
                <td className="px-5 py-3.5 text-sm" style={{ color: C.secondary }}>{d.centroCusto}</td>
                <td className="px-5 py-3.5 text-sm font-medium"
                  style={{ color: overdue ? C.error : C.secondary }}>
                  {isoToDisplay(d.vencimento)}
                </td>
                <td className="px-5 py-3.5 text-sm font-bold" style={{ color: C.onBg }}>{fmtBRL(d.valor)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <button className="hover:text-orange-600 transition-colors p-0.5 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    {d.status !== "Cancelada" && (
                      <button className="hover:text-orange-600 transition-colors p-0.5 rounded">
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {d.status === "Prevista" && (
                      <button
                        onClick={() => onPagar(d)}
                        className="px-2.5 py-1 rounded text-[11px] font-bold text-white transition-all hover:brightness-110 active:scale-95"
                        style={{ background: C.primaryCont }}
                      >
                        Pagar
                      </button>
                    )}
                    <button className="hover:text-orange-600 transition-colors p-0.5 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {despesas.length > 0 && (
        <div className="px-5 py-3 flex justify-between items-center border-t border-gray-100"
          style={{ background: C.surfLow }}>
          <p className="text-xs" style={{ color: C.secondary }}>
            Mostrando {despesas.length} despesa{despesas.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-1.5">
            {["Anterior","1","2","3","Próximo"].map((lbl, i) => (
              <button key={i}
                className="px-2.5 py-1 rounded border text-xs font-medium transition-colors"
                style={{
                  borderColor: "#E5E7EB",
                  background: lbl === "1" ? "#fff" : "transparent",
                  color: lbl === "1" ? C.onBg : C.secondary,
                  opacity: (lbl === "Anterior") ? 0.4 : 1,
                }}
                disabled={lbl === "Anterior"}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Por Categoria tab ────────────────────────────────────────────────────────
const CAT_META: Record<Categoria, { icon: string; tag: string; projetado: number }> = {
  Infraestrutura: { icon: "🖥️",  tag: "Operação",  projetado: 15000 },
  Salários:       { icon: "👥",  tag: "RH",        projetado: 30000 },
  Marketing:      { icon: "📢",  tag: "Growth",    projetado: 8000  },
  Manutenção:     { icon: "🔧",  tag: "Estrutural", projetado: 2000 },
  Suprimentos:    { icon: "📦",  tag: "Geral",     projetado: 2500  },
  Fixo:           { icon: "🏢",  tag: "Estrutural", projetado: 8000 },
};

function PorCategoria({ despesas }: { despesas: Despesa[] }) {
  const grouped = useMemo(() => {
    const acc: Partial<Record<Categoria, number>> = {};
    for (const d of despesas) {
      if (d.status === "Paga") acc[d.categoria] = (acc[d.categoria] ?? 0) + d.valor;
    }
    return acc;
  }, [despesas]);

  const cats: Categoria[] = ["Infraestrutura","Salários","Marketing","Manutenção","Suprimentos","Fixo"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {cats.map(cat => {
        const meta = CAT_META[cat];
        const pago = grouped[cat] ?? 0;
        const pct = Math.min(100, Math.round((pago / meta.projetado) * 100));
        return (
          <div key={cat} className="bg-white rounded-xl p-5 border border-gray-100 hover:bg-orange-50/20 transition-colors group cursor-default"
            style={{ boxShadow: "0 4px 24px rgba(17,24,39,0.04)" }}>
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ background: C.surfLow }}>
                {meta.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: C.surfContHigh, color: C.secondary }}>
                {meta.tag}
              </span>
            </div>
            <h3 className="text-sm font-bold mb-4" style={{ color: C.onBg }}>{cat}</h3>
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: "#9CA3AF" }}>Pago</p>
                <p className="text-lg font-bold" style={{ color: C.onBg }}>{fmtBRL(pago)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: "#9CA3AF" }}>Projetado</p>
                <p className="text-sm font-semibold" style={{ color: C.secondary }}>{fmtBRL(meta.projetado)}</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.surfContHigh }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: C.primaryCont }} />
            </div>
            <p className="text-[10px] text-right mt-1" style={{ color: C.secondary }}>{pct}%</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Accordion Item ───────────────────────────────────────────────────────────
function AccordionItem({
  ym,
  despesas,
  defaultOpen,
}: {
  ym: string;
  despesas: Despesa[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const previsto = despesas.reduce((a, d) => a + d.valor, 0);
  const pago = despesas.filter(d => d.status === "Paga").reduce((a, d) => a + d.valor, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 4px 24px rgba(17,24,39,0.04)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-orange-50/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className="w-5 h-5 transition-transform duration-300"
            style={{ color: open ? C.primaryCont : "#9CA3AF", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
          <span className="text-base font-bold" style={{ color: C.onBg }}>{monthLabel(ym)}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#9CA3AF" }}>Previsto</p>
            <p className="text-sm font-semibold" style={{ color: C.secondary }}>{fmtBRL(previsto)}</p>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.primaryCont }}>Pago</p>
            <p className="text-sm font-bold" style={{ color: C.primaryCont }}>{fmtBRL(pago)}</p>
          </div>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="rounded-lg overflow-hidden mt-4" style={{ background: C.surfLow }}>
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.04)" }}>
                  {["Vencimento","Descrição","Categoria","Valor","Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: C.secondary }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {despesas.map(d => (
                  <tr key={d.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium" style={{ color: C.onBg }}>{isoToDisplay(d.vencimento)}</td>
                    <td className="px-4 py-2.5 text-sm" style={{ color: C.onBg }}>{d.descricao}</td>
                    <td className="px-4 py-2.5"><CatBadge cat={d.categoria} /></td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-right" style={{ color: C.onBg }}>{fmtBRL(d.valor)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {d.status === "Paga"
                        ? <CheckCircle className="w-4 h-4 mx-auto" style={{ color: "#16A34A" }} />
                        : d.status === "Cancelada"
                        ? <AlertCircle className="w-4 h-4 mx-auto text-gray-300" />
                        : <Circle className="w-4 h-4 mx-auto text-gray-300" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Por Mês tab ──────────────────────────────────────────────────────────────
function PorMes({ despesas }: { despesas: Despesa[] }) {
  const byMonth = useMemo(() => {
    const acc: Record<string, Despesa[]> = {};
    for (const d of despesas) {
      if (!acc[d.competencia]) acc[d.competencia] = [];
      acc[d.competencia].push(d);
    }
    return Object.entries(acc).sort((a, b) => b[0].localeCompare(a[0]));
  }, [despesas]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {byMonth.map(([ym, ds], i) => (
          <AccordionItem key={ym} ym={ym} despesas={ds} defaultOpen={i === 0} />
        ))}
      </div>

      {/* Stacked bar chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100"
        style={{ boxShadow: "0 4px 24px rgba(17,24,39,0.04)" }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold" style={{ color: C.onBg }}>Despesas Mensais por Categoria</h3>
            <p className="text-xs mt-0.5" style={{ color: C.secondary }}>
              Visão consolidada do primeiro quadrimestre de 2026
            </p>
          </div>
          <div className="flex gap-4">
            {[
              { label: "Salários",  color: "#3B82F6" },
              { label: "Infra",     color: "#8B5CF6" },
              { label: "Marketing", color: "#F97316" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.secondary }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={CHART_DATA} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: number, name: string) => [fmtBRL(value), name]}
              contentStyle={{ borderRadius: 10, border: "1px solid #F3F4F6", fontSize: 12 }}
            />
            <Bar dataKey="Salários"  stackId="a" fill="#3B82F6" radius={[0,0,0,0]} />
            <Bar dataKey="Infra"     stackId="a" fill="#8B5CF6" radius={[0,0,0,0]} />
            <Bar dataKey="Marketing" stackId="a" fill="#F97316" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── FormNovaDespesa modal ───────────────────────────────────────────────────
interface NovaDespesaForm {
  descricao: string;
  fornecedor: string;
  categoria: string;
  centroCusto: string;
  valor: string;
  competencia: string;
  vencimento: string;
  status: "Prevista" | "Paga";
  dataPagamento: string;
  contaBancaria: string;
}

const EMPTY_FORM: NovaDespesaForm = {
  descricao: "",
  fornecedor: "",
  categoria: "",
  centroCusto: "Tecnologia",
  valor: "",
  competencia: "2026-04",
  vencimento: "",
  status: "Prevista",
  dataPagamento: "",
  contaBancaria: "",
};

function FormNovaDespesa({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (d: Despesa) => void;
}) {
  const [form, setForm] = useState<NovaDespesaForm>(EMPTY_FORM);
  const [dragOver, setDragOver] = useState(false);

  function set<K extends keyof NovaDespesaForm>(k: K, v: NovaDespesaForm[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  const isValid =
    form.descricao.trim() !== "" &&
    form.centroCusto !== "" &&
    form.valor.trim() !== "" &&
    (form.status === "Prevista" || (form.dataPagamento !== "" && form.contaBancaria !== ""));

  function handleSave() {
    if (!isValid) return;
    const val = parseFloat(form.valor.replace(/\./g, "").replace(",", ".")) || 0;
    const cat = (form.categoria || "Fixo") as Categoria;
    const id = `#${9000 + Math.floor(Math.random() * 999)}`;
    const venc = form.vencimento || `${form.competencia}-28`;
    const novo: Despesa = {
      id,
      descricao: form.descricao,
      fornecedor: form.fornecedor,
      categoria: cat,
      centroCusto: form.centroCusto,
      vencimento: venc,
      valor: val,
      status: form.status,
      competencia: form.competencia,
      dataPagamento: form.status === "Paga" ? form.dataPagamento : undefined,
      contaBancaria: form.status === "Paga" ? form.contaBancaria : undefined,
    };
    onSave(novo);
  }

  const inputCls = "w-full rounded-lg border-none text-sm focus:outline-none focus:ring-2 px-3 py-2.5 placeholder:text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-3xl mx-4 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center" style={{ background: C.surfLow }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: C.onBg }}>Nova Despesa</h2>
            <p className="text-xs mt-0.5" style={{ color: C.secondary }}>Preencha os campos para registrar um novo custo.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Descrição */}
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                Descrição <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                style={{ background: C.surfLow, color: C.onBg }}
                placeholder="Ex: Licença Anual Software de Design"
                value={form.descricao}
                onChange={e => set("descricao", e.target.value)}
              />
            </div>

            {/* Fornecedor */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                Fornecedor / Colaborador
              </label>
              <select className={inputCls} style={{ background: C.surfLow, color: C.onBg }}
                value={form.fornecedor} onChange={e => set("fornecedor", e.target.value)}>
                <option value="">Selecionar...</option>
                {MOCK_FORNECEDORES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                Categoria
              </label>
              <select className={inputCls} style={{ background: C.surfLow, color: C.onBg }}
                value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                <option value="">Selecionar...</option>
                {(["Infraestrutura","Salários","Marketing","Manutenção","Suprimentos","Fixo"] as Categoria[]).map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Centro de Custo */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                Centro de Custo <span className="text-red-400">*</span>
              </label>
              <select className={inputCls} style={{ background: C.surfLow, color: C.onBg }}
                value={form.centroCusto} onChange={e => set("centroCusto", e.target.value)}>
                {MOCK_CENTROS_CUSTO.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                Valor <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "#9CA3AF" }}>R$</span>
                <input
                  type="text"
                  className={`${inputCls} pl-9 font-mono font-bold`}
                  style={{ background: C.surfLow, color: C.onBg }}
                  placeholder="0,00"
                  value={form.valor}
                  onChange={e => set("valor", e.target.value)}
                />
              </div>
            </div>

            {/* Competência */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                Competência
              </label>
              <input type="month" className={inputCls} style={{ background: C.surfLow, color: C.onBg }}
                value={form.competencia} onChange={e => set("competencia", e.target.value)} />
            </div>

            {/* Vencimento */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                Vencimento
              </label>
              <input type="date" className={inputCls} style={{ background: C.surfLow, color: C.onBg }}
                value={form.vencimento} onChange={e => set("vencimento", e.target.value)} />
            </div>

            {/* Status */}
            <div className="col-span-2 pt-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.secondary }}>
                Status da Despesa
              </label>
              <div className="flex gap-6">
                {(["Prevista","Paga"] as const).map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="despesa-status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => set("status", s)}
                      className="accent-orange-500"
                    />
                    <span className="text-sm font-medium" style={{ color: C.onBg }}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional payment section */}
            {form.status === "Paga" && (
              <div className="col-span-2">
                <div className="rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border"
                  style={{ background: "rgba(249,115,22,0.04)", borderColor: C.outlineVar }}>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                      Data do Pagamento <span className="text-red-400">*</span>
                    </label>
                    <input type="date" className={inputCls}
                      style={{ background: "#fff", color: C.onBg, border: "1px solid #E5E7EB" }}
                      value={form.dataPagamento}
                      onChange={e => set("dataPagamento", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                      Conta Bancária <span className="text-red-400">*</span>
                    </label>
                    <select className={inputCls}
                      style={{ background: "#fff", color: C.onBg, border: "1px solid #E5E7EB" }}
                      value={form.contaBancaria}
                      onChange={e => set("contaBancaria", e.target.value)}>
                      <option value="">Selecionar conta...</option>
                      {MOCK_CONTAS_BANCARIAS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.secondary }}>
                      Comprovante
                    </label>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); }}
                      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                      style={{
                        borderColor: dragOver ? C.primaryCont : C.outlineVar,
                        background: dragOver ? "#FFF7ED" : "#fff",
                      }}
                    >
                      <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: C.primaryCont }} />
                      <p className="text-sm font-bold" style={{ color: C.onBg }}>
                        Arraste seu arquivo ou clique para upload
                      </p>
                      <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#9CA3AF" }}>
                        PDF, PNG ou JPG (Máx 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-gray-100 flex justify-end items-center gap-3" style={{ background: C.surfLow }}>
          <button onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200"
            style={{ color: C.secondary }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-7 py-2 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: isValid ? "linear-gradient(to top, #9D4300, #F97316)" : "#9CA3AF" }}
          >
            Salvar Despesa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Registrar Pagamento Panel ────────────────────────────────────────────────
function PagamentoPanel({
  despesa,
  onClose,
  onConfirm,
}: {
  despesa: Despesa;
  onClose: () => void;
  onConfirm: (id: string, data: string, conta: string) => void;
}) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [conta, setConta] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function handleConfirm() {
    if (!data || !conta) return;
    onConfirm(despesa.id, data, conta);
  }

  return (
    <div className="fixed bottom-6 right-6 z-[70] w-80">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 flex justify-between items-center" style={{ background: "#1F2937" }}>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest">Registrar Pagamento</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#FFF7ED", color: C.primaryCont }}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: "#9CA3AF" }}>
                Despesa Pendente
              </p>
              <h5 className="text-sm font-bold" style={{ color: C.onBg }}>
                {despesa.id} — {despesa.descricao.slice(0, 24)}{despesa.descricao.length > 24 ? "…" : ""}
              </h5>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>
                Data do Pagamento
              </label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full rounded-lg text-xs px-3 py-2 border-none focus:outline-none focus:ring-1"
                style={{ background: C.surfLow, color: C.onBg }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>
                Conta Bancária
              </label>
              <select
                value={conta}
                onChange={e => setConta(e.target.value)}
                className="w-full rounded-lg text-xs px-3 py-2 border-none focus:outline-none focus:ring-1"
                style={{ background: C.surfLow, color: C.onBg }}
              >
                <option value="">Selecionar...</option>
                {MOCK_CONTAS_BANCARIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>
                Upload Comprovante
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); }}
                className="border border-dashed rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                style={{ borderColor: dragOver ? C.primaryCont : "#D1D5DB", background: dragOver ? "#FFF7ED" : "transparent" }}
              >
                <Paperclip className="w-4 h-4" style={{ color: C.secondary }} />
                <span className="text-[10px] font-bold uppercase" style={{ color: C.secondary }}>Anexar Arquivo</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!data || !conta}
            className="w-full mt-5 py-2.5 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(to top, #9D4300, #F97316)" }}
          >
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mock Cash-Flow ───────────────────────────────────────────────────────────
interface CashFlowOutflow {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  centroCusto: string;
  conta: string;
  valor: number;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type TabId = "todas" | "previstas" | "pagas" | "por-categoria" | "por-mes";

const TABS: { id: TabId; label: string }[] = [
  { id: "todas",          label: "Todas" },
  { id: "previstas",      label: "Previstas" },
  { id: "pagas",          label: "Pagas" },
  { id: "por-categoria",  label: "Por Categoria" },
  { id: "por-mes",        label: "Por Mês" },
];

export default function Despesas() {
  const [despesas, setDespesas] = useState<Despesa[]>(INITIAL_DESPESAS);
  const [cashFlowOutflows, setCashFlowOutflows] = useState<CashFlowOutflow[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [pagandoDespesa, setPagandoDespesa] = useState<Despesa | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Filters
  const [fDescricao, setFDescricao]     = useState("");
  const [fFornecedor, setFornecedor]    = useState("");
  const [fCategoria, setFCategoria]     = useState("");
  const [fCentro, setFCentro]           = useState("");
  const [fStatus, setFStatus]           = useState("");

  function addToast(msg: string) {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  function dismissToast(id: number) {
    setToasts(t => t.filter(x => x.id !== id));
  }

  const filtered = useMemo(() => despesas.filter(d => {
    if (fDescricao && !d.descricao.toLowerCase().includes(fDescricao.toLowerCase())) return false;
    if (fFornecedor && d.fornecedor !== fFornecedor) return false;
    if (fCategoria && d.categoria !== fCategoria) return false;
    if (fCentro && d.centroCusto !== fCentro) return false;
    if (fStatus && d.status !== fStatus) return false;
    return true;
  }), [despesas, fDescricao, fFornecedor, fCategoria, fCentro, fStatus]);

  const todasRows      = filtered;
  const previstasRows  = filtered.filter(d => d.status === "Prevista");
  const pagasRows      = filtered.filter(d => d.status === "Paga");

  // KPIs
  const totalPrevisto = useMemo(() => despesas.reduce((a, d) => a + (d.status !== "Cancelada" ? d.valor : 0), 0), [despesas]);
  const totalPago     = useMemo(() => despesas.filter(d => d.status === "Paga").reduce((a, d) => a + d.valor, 0), [despesas]);
  const aPagar        = useMemo(() => despesas.filter(d => d.status === "Prevista").reduce((a, d) => a + d.valor, 0), [despesas]);
  const atrasados     = useMemo(() => despesas.filter(d => isOverdue(d.vencimento, d.status)).length, [despesas]);

  // Maior centro de custo by previsto value
  const maiorCentro = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const d of despesas) {
      if (d.status !== "Cancelada") acc[d.centroCusto] = (acc[d.centroCusto] ?? 0) + d.valor;
    }
    const entries = Object.entries(acc);
    if (entries.length === 0) return { name: "—", pct: 0 };
    const total = entries.reduce((a, [, v]) => a + v, 0);
    const [name, val] = entries.sort((a, b) => b[1] - a[1])[0];
    return { name, pct: Math.round((val / total) * 100) };
  }, [despesas]);

  function createOutflow(d: Despesa, data: string, conta: string): CashFlowOutflow {
    return {
      id: `CF-${Date.now()}`,
      data,
      descricao: `[Despesa] ${d.descricao}`,
      categoria: d.categoria,
      centroCusto: d.centroCusto,
      conta,
      valor: d.valor,
    };
  }

  const handleSaveDespesa = useCallback((d: Despesa) => {
    setDespesas(prev => [d, ...prev]);
    if (d.status === "Paga" && d.dataPagamento && d.contaBancaria) {
      setCashFlowOutflows(prev => [createOutflow(d, d.dataPagamento!, d.contaBancaria!), ...prev]);
    }
    setModalOpen(false);
    addToast("Despesa cadastrada com sucesso");
  }, []);

  const handleConfirmPagamento = useCallback((id: string, data: string, conta: string) => {
    let paidDespesa: Despesa | undefined;
    setDespesas(prev => prev.map(d => {
      if (d.id === id) {
        paidDespesa = { ...d, status: "Paga" as Status, dataPagamento: data, contaBancaria: conta };
        return paidDespesa;
      }
      return d;
    }));
    if (paidDespesa) {
      setCashFlowOutflows(prev => [createOutflow(paidDespesa!, data, conta), ...prev]);
    }
    setPagandoDespesa(null);
    addToast("Pagamento registrado");
  }, []);

  const cardStyle = {
    background: C.surfLowest,
    boxShadow: "0 4px 24px rgba(17,24,39,0.04)",
    border: "1px solid rgba(229,231,235,0.5)",
  };

  const selectCls = "w-full rounded-lg border-none text-sm px-3 py-2 focus:outline-none focus:ring-1 appearance-none";

  return (
    <div className="min-h-screen font-sans" style={{ background: "#F9FAFB" }}>
      <Sidebar />
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div className="ml-[220px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center gap-4 sticky top-0 z-30">
          <div className="flex-1">
            <h1 className="text-base font-bold leading-none" style={{ color: C.onBg }}>Despesas</h1>
            <p className="text-xs mt-0.5" style={{ color: C.secondary }}>Controle de custos e saídas financeiras</p>
          </div>
          <div className="relative hidden sm:flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar despesa..."
              className="pl-9 pr-4 py-1.5 text-sm rounded-lg w-52 border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
              style={{ background: C.surfLow }}
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: "linear-gradient(to top, #9D4300, #F97316)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Despesa
          </button>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          {/* Page title */}
          <div>
            <h2 className="text-2xl font-bold tracking-tighter" style={{ color: C.onBg }}>Despesas</h2>
            <p className="text-sm mt-0.5" style={{ color: C.secondary }}>Controle de custos e saídas financeiras</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Previsto */}
            <div className="rounded-xl p-5" style={cardStyle}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.secondary }}>
                Total Previsto (mês)
              </p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold tracking-tighter" style={{ color: C.onBg }}>
                  {fmtBRL(totalPrevisto)}
                </span>
              </div>
            </div>
            {/* Total Pago */}
            <div className="rounded-xl p-5" style={cardStyle}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.secondary }}>
                Total Pago (mês)
              </p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold tracking-tighter" style={{ color: C.primaryCont }}>
                  {fmtBRL(totalPago)}
                </span>
                <span className="text-xs mb-0.5" style={{ color: "#9CA3AF" }}>
                  {totalPrevisto > 0 ? Math.round((totalPago / totalPrevisto) * 100) : 0}% do total
                </span>
              </div>
            </div>
            {/* A Pagar */}
            <div className="rounded-xl p-5" style={cardStyle}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.secondary }}>
                A Pagar (em aberto)
              </p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold tracking-tighter" style={{ color: C.onBg }}>
                  {fmtBRL(aPagar)}
                </span>
                {atrasados > 0 && (
                  <span className="text-xs mb-0.5 font-medium" style={{ color: C.error }}>
                    Atrasado: {atrasados}
                  </span>
                )}
              </div>
            </div>
            {/* Maior Centro */}
            <div className="rounded-xl p-5" style={cardStyle}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.secondary }}>
                Maior Centro de Custo
              </p>
              <div className="flex items-end gap-2">
                <span className="text-lg font-bold tracking-tight" style={{ color: C.onBg }}>
                  {maiorCentro.name}
                </span>
                <span className="text-xs mb-0.5" style={{ color: C.secondary }}>
                  {maiorCentro.pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel"
                  className="w-full rounded-lg border-none text-sm px-3 py-2 focus:outline-none focus:ring-1"
                  style={{ background: C.surfLow, color: C.onBg }}
                  value={fDescricao}
                  onChange={e => setFDescricao(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>
                  Fornecedor
                </label>
                <select className={selectCls} style={{ background: C.surfLow, color: C.onBg }}
                  value={fFornecedor} onChange={e => setFornecedor(e.target.value)}>
                  <option value="">Todos</option>
                  {MOCK_FORNECEDORES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>
                  Categoria
                </label>
                <select className={selectCls} style={{ background: C.surfLow, color: C.onBg }}
                  value={fCategoria} onChange={e => setFCategoria(e.target.value)}>
                  <option value="">Todas</option>
                  {(["Infraestrutura","Salários","Marketing","Manutenção","Suprimentos","Fixo"] as Categoria[]).map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>
                  Centro de Custo
                </label>
                <select className={selectCls} style={{ background: C.surfLow, color: C.onBg }}
                  value={fCentro} onChange={e => setFCentro(e.target.value)}>
                  <option value="">Todos</option>
                  {MOCK_CENTROS_CUSTO.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.secondary }}>
                  Status
                </label>
                <select className={selectCls} style={{ background: C.surfLow, color: C.onBg }}
                  value={fStatus} onChange={e => setFStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="Prevista">Prevista</option>
                  <option value="Paga">Paga</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-6 border-b border-gray-200 px-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="pb-3.5 text-sm font-medium transition-all border-b-2"
                  style={{
                    color: activeTab === tab.id ? C.primaryCont : C.secondary,
                    borderColor: activeTab === tab.id ? C.primaryCont : "transparent",
                    fontWeight: activeTab === tab.id ? 700 : 500,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "todas" && (
              <DespesasTable despesas={todasRows} onPagar={d => setPagandoDespesa(d)} />
            )}
            {activeTab === "previstas" && (
              <DespesasTable despesas={previstasRows} onPagar={d => setPagandoDespesa(d)} />
            )}
            {activeTab === "pagas" && (
              <DespesasTable despesas={pagasRows} onPagar={d => setPagandoDespesa(d)} />
            )}
            {activeTab === "por-categoria" && (
              <PorCategoria despesas={despesas} />
            )}
            {activeTab === "por-mes" && (
              <PorMes despesas={despesas} />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {modalOpen && (
        <FormNovaDespesa onClose={() => setModalOpen(false)} onSave={handleSaveDespesa} />
      )}
      {pagandoDespesa && (
        <PagamentoPanel
          despesa={pagandoDespesa}
          onClose={() => setPagandoDespesa(null)}
          onConfirm={handleConfirmPagamento}
        />
      )}
    </div>
  );
}
