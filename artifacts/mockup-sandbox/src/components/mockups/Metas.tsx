import { useState, useMemo } from "react";
import {
  type VendedorMeta, type MetaMensal,
  MESES, ANO_ATUAL, MES_ATUAL, VENDEDORES_BY_ANO, VENDEDORES_2026,
} from "../../data/metas";
import {
  Building2, LayoutDashboard, ShoppingCart, CreditCard, Percent,
  Users, UserCheck, Truck, FileText, BarChart2, TrendingUp,
  Target, Landmark, PieChart, BookOpen, Clock, Activity,
  Settings, Search, Plus, X, ChevronDown, ChevronUp,
  AlertTriangle, Check, HelpCircle, Bell,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:      "#9d4300",
  primaryCont:  "#f97316",
  surfLow:      "#f1f3ff",
  surfLowest:   "#ffffff",
  surfCont:     "#e9edff",
  onBg:         "#141b2b",
  secondary:    "#575e70",
  error:        "#ba1a1a",
  outlineVar:   "#e0c0b1",
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

// ─── Local types ──────────────────────────────────────────────────────────────
interface HistoricoEntry {
  id: number;
  data: string;
  acao: string;
  detalhe: string;
  usuario: string;
}

type StatusMensal = "ATINGIDA" | "EM ANDAMENTO" | "ABAIXO" | "NÃO INICIADA";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBRL(v: number): string {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtBRL2(v: number): string {
  return `R$ ${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function pct(realizado: number, meta: number): number {
  if (meta === 0) return 0;
  return Math.round((realizado / meta) * 100);
}

function calcRealizado(v: VendedorMeta): number {
  return v.metas.reduce((s, m) => s + m.realizado, 0);
}

/**
 * Returns the projected annual total sourced from the vendor data file.
 * projetadoAnual = Σ realizado (months with data)
 *                + active/open contracts in pipeline
 *                + forecast for remaining months
 * These explicit values come from the Vendas & Forecast phase mocks.
 */
function calcProjetado(v: VendedorMeta): number {
  return v.projetadoAnual;
}

function statusMensal(m: MetaMensal): StatusMensal {
  if (m.metaNum > MES_ATUAL) return "NÃO INICIADA";
  if (m.realizado >= m.meta) return "ATINGIDA";
  if (m.metaNum === MES_ATUAL) {
    return m.realizado / m.meta >= 0.5 ? "EM ANDAMENTO" : "ABAIXO";
  }
  return "ABAIXO";
}

function statusBadge(s: StatusMensal) {
  const map: Record<StatusMensal, { bg: string; color: string }> = {
    "ATINGIDA":     { bg: "#DCFCE7", color: "#15803D" },
    "EM ANDAMENTO": { bg: "#DBEAFE", color: "#1D4ED8" },
    "ABAIXO":       { bg: "#FFF7ED", color: "#C2410C" },
    "NÃO INICIADA": { bg: "#F3F4F6", color: "#6B7280" },
  };
  return map[s];
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
          <p className="text-sm font-bold text-white leading-none tracking-tight">Architect ERP</p>
          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 leading-none">ENTERPRISE SUITE</p>
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
                  const active = item.href === "/metas";
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
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="flex items-center gap-2 px-2 py-2.5 rounded-lg bg-white/5">
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium leading-none truncate">Admin User</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ title }: { title: string }) {
  return (
    <header className="fixed top-0 left-[220px] right-0 h-14 z-30 flex items-center px-6 gap-4 border-b border-gray-200 bg-white">
      <span className="text-sm font-semibold text-orange-600 border-b-2 border-orange-500 pb-[1px]">{title}</span>
      <div className="flex-1" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          readOnly
          placeholder="Buscar registros..."
          className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg w-52 focus:outline-none"
        />
      </div>
      <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
        <Bell className="w-4 h-4" />
      </button>
      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
        <HelpCircle className="w-4 h-4" />
      </button>
    </header>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max = 100, thick = false }: { value: number; max?: number; thick?: boolean }) {
  const pctVal = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 max-w-[160px] rounded-full overflow-hidden bg-gray-200 ${thick ? "h-3" : "h-2"}`}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pctVal}%`, background: C.primaryCont }}
        />
      </div>
      <span className={`text-right font-semibold ${thick ? "text-sm text-orange-600" : "text-xs text-gray-700"}`} style={{ minWidth: 36 }}>
        {Math.round(pctVal)}%
      </span>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium"
      style={{ background: "#15803D", minWidth: 260 }}>
      <Check className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{msg}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-70" /></button>
    </div>
  );
}

// ─── Modal Definir Meta ────────────────────────────────────────────────────────
interface FormDefinirMetaProps {
  vendedores: VendedorMeta[];
  onClose: () => void;
  onSave: (vendedorId: string, ano: number, metaAnual: number) => void;
}

function FormDefinirMeta({ vendedores, onClose, onSave }: FormDefinirMetaProps) {
  const [vendedorId, setVendedorId] = useState(vendedores[0]?.id ?? "");
  const [ano, setAno] = useState(String(ANO_ATUAL));
  const [metaAnualStr, setMetaAnualStr] = useState("");
  const [distribuirIgual, setDistribuirIgual] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const metaAnual = parseFloat(metaAnualStr.replace(/\./g, "").replace(",", ".")) || 0;
  const metaMensal = distribuirIgual && metaAnual > 0 ? metaAnual / 12 : 0;

  function validate() {
    const e: Record<string, string> = {};
    if (!vendedorId) e.vendedor = "Selecione um vendedor";
    if (!metaAnual || metaAnual <= 0) e.meta = "Informe a meta anual";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(vendedorId, parseInt(ano), metaAnual);
  }

  function handleMetaInput(val: string) {
    const digits = val.replace(/\D/g, "");
    const num = parseInt(digits || "0", 10);
    setMetaAnualStr(num.toLocaleString("pt-BR"));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "#FFF7ED" }}>
              <Target className="w-5 h-5" style={{ color: C.primaryCont }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: C.onBg }}>Definir Meta</h2>
              <p className="text-xs text-gray-500">Configure metas por vendedor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Vendedor */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Vendedor <span className="text-red-500">*</span>
            </label>
            <select
              value={vendedorId}
              onChange={e => setVendedorId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              style={{ borderColor: errors.vendedor ? C.error : "#D1D5DB" }}
            >
              {vendedores.map(v => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
            {errors.vendedor && <p className="text-xs text-red-600 mt-1">{errors.vendedor}</p>}
          </div>

          {/* Ano */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Ano</label>
            <select
              value={ano}
              onChange={e => setAno(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Meta Anual */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Meta Anual (R$) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={metaAnualStr}
                onChange={e => handleMetaInput(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                style={{ borderColor: errors.meta ? C.error : "#D1D5DB" }}
              />
            </div>
            {errors.meta && <p className="text-xs text-red-600 mt-1">{errors.meta}</p>}
          </div>

          {/* Toggle distribuição */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">Distribuir igualmente pelos 12 meses</p>
              {distribuirIgual && metaAnual > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {fmtBRL(Math.round(metaMensal))} / mês
                </p>
              )}
            </div>
            <button
              onClick={() => setDistribuirIgual(!distribuirIgual)}
              className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${distribuirIgual ? "bg-orange-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${distribuirIgual ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: C.primaryCont }}
          >
            Salvar Meta
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Metas() {
  const [anoFiltro, setAnoFiltro] = useState(String(ANO_ATUAL));
  const [vendedorFiltro, setVendedorFiltro] = useState("todos");
  const [activeTab, setActiveTab] = useState("joao");
  const [gapOpen, setGapOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [vendedoresByAno, setVendedoresByAno] = useState<Record<string, VendedorMeta[]>>(VENDEDORES_BY_ANO);
  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);

  // Redistribuição state: map mesNum -> ajuste value
  const [ajustes, setAjustes] = useState<Record<number, number>>({});

  // Active year's vendedores list
  const vendedores = vendedoresByAno[anoFiltro] ?? vendedoresByAno["2026"];

  // Compute for Visão Anual
  const filteredVendedores = useMemo(() => {
    if (vendedorFiltro === "todos") return vendedores;
    return vendedores.filter(v => v.id === vendedorFiltro);
  }, [vendedores, vendedorFiltro]);

  const visaoAnual = useMemo(() => {
    return filteredVendedores.map(v => {
      const realizado = calcRealizado(v);
      const projetado = calcProjetado(v);
      const gap = projetado - v.metaAnual;
      return { v, realizado, projetado, gap, pctAtingido: pct(realizado, v.metaAnual) };
    });
  }, [filteredVendedores]);

  const totais = useMemo(() => {
    const totalMeta = visaoAnual.reduce((s, r) => s + r.v.metaAnual, 0);
    const totalReal = visaoAnual.reduce((s, r) => s + r.realizado, 0);
    const totalProj = visaoAnual.reduce((s, r) => s + r.projetado, 0);
    const totalGap  = visaoAnual.reduce((s, r) => s + r.gap, 0);
    const pctTotal  = pct(totalReal, totalMeta);
    return { totalMeta, totalReal, totalProj, totalGap, pctTotal };
  }, [visaoAnual]);

  // Metas mensais for active tab
  const activeVendedor = vendedores.find(v => v.id === activeTab) ?? vendedores[0];

  // Gap redistribuição
  const gapVendedor = useMemo(() => {
    if (!activeVendedor) return 0;
    const real = calcRealizado(activeVendedor);
    const projetado = calcProjetado(activeVendedor);
    return projetado - activeVendedor.metaAnual;
  }, [activeVendedor]);

  const mesesFuturos = useMemo(() => {
    if (!activeVendedor) return [];
    return activeVendedor.metas.filter(m => m.metaNum >= MES_ATUAL && m.realizado === 0);
  }, [activeVendedor]);

  const totalDistribuido = useMemo(() => {
    return Object.values(ajustes).reduce((s, v) => s + (v || 0), 0);
  }, [ajustes]);

  const gapTotal = Math.abs(Math.min(0, gapVendedor));
  const restante = gapTotal - totalDistribuido;

  const canSave = Math.abs(restante) < 0.01 && gapTotal > 0;

  function handleAjusteChange(mesNum: number, val: string) {
    const num = parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
    setAjustes(prev => ({ ...prev, [mesNum]: num }));
  }

  function addHistorico(acao: string, detalhe: string) {
    const now = new Date();
    const data = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setHistorico(prev => [
      { id: Date.now(), data, acao, detalhe, usuario: "Admin User" },
      ...prev,
    ]);
  }

  function handleSalvarRedistribuicao() {
    const nomeVendedor = activeVendedor?.nome ?? "";
    const mesesAfetados = Object.entries(ajustes)
      .filter(([, v]) => v > 0)
      .map(([k]) => MESES[parseInt(k) - 1])
      .join(", ");
    setVendedoresByAno(prev => ({
      ...prev,
      [anoFiltro]: (prev[anoFiltro] ?? []).map(v => {
        if (v.id !== activeVendedor?.id) return v;
        return {
          ...v,
          metas: v.metas.map(m => {
            const adj = ajustes[m.metaNum] ?? 0;
            return { ...m, meta: m.meta + adj };
          }),
        };
      }),
    }));
    setAjustes({});
    addHistorico(
      "Redistribuição de Gap",
      `[${anoFiltro}] Gap de ${fmtBRL(gapTotal)} redistribuído para ${nomeVendedor} nos meses: ${mesesAfetados}`,
    );
    showToast("Redistribuição salva com sucesso!");
  }

  function handleDefinirMeta(vendedorId: string, ano: number, metaAnual: number) {
    const anoStr = String(ano);
    const allVendedores = vendedoresByAno[anoStr] ?? vendedoresByAno["2026"];
    const nomeVendedor = allVendedores.find(v => v.id === vendedorId)?.nome ?? vendedorId;
    const metaMensal = Math.round(metaAnual / 12);
    setVendedoresByAno(prev => {
      const base: VendedorMeta[] = prev[anoStr] ?? VENDEDORES_2026.map(v => ({ ...v, metas: v.metas.map(m => ({ ...m, realizado: 0 })) }));
      return {
        ...prev,
        [anoStr]: base.map(v => {
          if (v.id !== vendedorId) return v;
          return {
            ...v,
            metaAnual,
            // Keep projetadoAnual unchanged — it reflects pipeline/forecast snapshot
            metas: v.metas.map(m => ({ ...m, meta: metaMensal })),
          };
        }),
      };
    });
    addHistorico(
      "Meta Definida",
      `[${anoStr}] Meta anual de ${fmtBRL(metaAnual)} definida para ${nomeVendedor} (${metaMensal.toLocaleString("pt-BR")}/mês)`,
    );
    setShowModal(false);
    showToast(`Meta ${anoStr} definida com sucesso!`);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="min-h-screen" style={{ background: C.surfLow, fontFamily: "system-ui, sans-serif" }}>
      <Sidebar />
      <Topbar title="Metas Comerciais" />

      <main className="pl-[220px] pt-14">
        <div className="p-6 max-w-[1100px] mx-auto space-y-6">

          {/* ── Page Header ───────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: C.onBg }}>Metas Comerciais</h1>
              <p className="text-sm mt-0.5" style={{ color: C.secondary }}>Acompanhamento de metas por vendedor</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Ano filter */}
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">ANO</span>
                <select
                  value={anoFiltro}
                  onChange={e => setAnoFiltro(e.target.value)}
                  className="text-sm font-semibold border-0 bg-transparent focus:outline-none cursor-pointer"
                  style={{ color: C.onBg }}
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              {/* Vendedor filter */}
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">VENDEDOR</span>
                <select
                  value={vendedorFiltro}
                  onChange={e => setVendedorFiltro(e.target.value)}
                  className="text-sm font-semibold border-0 bg-transparent focus:outline-none cursor-pointer"
                  style={{ color: C.onBg }}
                >
                  <option value="todos">Todos</option>
                  {vendedores.map(v => (
                    <option key={v.id} value={v.id}>{v.nome}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: C.primaryCont }}
              >
                <Plus className="w-4 h-4" />
                Definir Meta
              </button>
            </div>
          </div>

          {/* ── Visão Anual ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold" style={{ color: C.onBg }}>Visão Anual</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["VENDEDOR", "META ANUAL", "REALIZADO", "% ATINGIDO", "PROJETADO", "GAP"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visaoAnual.map(({ v, realizado, projetado, gap, pctAtingido }) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium" style={{ color: C.onBg }}>{v.nome}</td>
                      <td className="px-5 py-3.5 text-gray-700">{fmtBRL(v.metaAnual)}</td>
                      <td className="px-5 py-3.5 text-gray-700">{fmtBRL(realizado)}</td>
                      <td className="px-5 py-3.5">
                        <ProgressBar value={pctAtingido} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{fmtBRL(projetado)}</td>
                      <td className="px-5 py-3.5 font-bold">
                        <span style={{ color: gap >= 0 ? "#15803D" : C.error }}>
                          {gap >= 0 ? "+" : "-"}{fmtBRL2(gap)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr style={{ background: "#F8FAFC" }}>
                    <td className="px-5 py-4 font-bold text-gray-900">Total</td>
                    <td className="px-5 py-4 font-bold text-gray-900">{fmtBRL(totais.totalMeta)}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">{fmtBRL(totais.totalReal)}</td>
                    <td className="px-5 py-4">
                      <ProgressBar value={totais.pctTotal} thick />
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900">{fmtBRL(totais.totalProj)}</td>
                    <td className="px-5 py-4 font-bold">
                      <span style={{ color: totais.totalGap >= 0 ? "#15803D" : C.error }}>
                        {totais.totalGap >= 0 ? "+" : "-"}{fmtBRL2(totais.totalGap)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Metas Mensais ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-base font-bold" style={{ color: C.onBg }}>Metas Mensais</h2>
              {/* Pill tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {vendedores.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setActiveTab(v.id); setAjustes({}); }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={activeTab === v.id
                      ? { background: C.primaryCont, color: "#fff" }
                      : { background: "#F3F4F6", color: "#6B7280" }
                    }
                  >
                    {v.nome}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["MÊS", "META", "REALIZADO", "% ATINGIDO", "STATUS"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeVendedor?.metas.map(m => {
                    const s = statusMensal(m);
                    const p = pct(m.realizado, m.meta);
                    const badge = statusBadge(s);
                    return (
                      <tr key={m.mes} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-medium" style={{ color: C.onBg }}>{m.mes}</td>
                        <td className="px-5 py-3.5 text-gray-700">{fmtBRL(m.meta)}</td>
                        <td className="px-5 py-3.5 text-gray-700">{fmtBRL(m.realizado)}</td>
                        <td className="px-5 py-3.5">
                          <ProgressBar value={p} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {s}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Gap e Redistribuição Manual ───────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Accordion header */}
            <button
              onClick={() => setGapOpen(!gapOpen)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-5 h-5" style={{ color: C.primaryCont }} />
                <h2 className="text-base font-bold" style={{ color: C.onBg }}>Gap e redistribuição manual</h2>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              {gapOpen
                ? <ChevronUp className="w-5 h-5 text-gray-400" />
                : <ChevronDown className="w-5 h-5 text-gray-400" />
              }
            </button>

            {gapOpen && (
              <div className="border-t border-gray-100">
                {/* Warning box */}
                {gapTotal > 0 && (
                  <div className="mx-6 mt-5 mb-4 flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "#FFEDD5" }}>
                      <AlertTriangle className="w-4 h-4" style={{ color: C.primaryCont }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.primary }}>ATENÇÃO</p>
                      <p className="text-sm mt-0.5 text-gray-700">
                        Você tem um gap de{" "}
                        <strong style={{ color: C.error }}>{fmtBRL(gapTotal)}</strong>{" "}
                        acumulado até {MESES[MES_ATUAL - 2]}. Redistribua este valor nos meses futuros.
                      </p>
                    </div>
                  </div>
                )}
                {gapTotal === 0 && (
                  <div className="mx-6 mt-5 mb-4 flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: "#15803D" }} />
                    <p className="text-sm text-green-800 font-medium">
                      {activeVendedor?.nome} está acima da meta anual projetada. Nenhum gap para redistribuir.
                    </p>
                  </div>
                )}

                {gapTotal > 0 && (
                  <div className="px-6 pb-6 flex gap-5 flex-wrap">
                    {/* Left table */}
                    <div className="flex-1 min-w-0">
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              {["MÊS FUTURO", "META ORIGINAL", "NOVO AJUSTE", "META FINAL"].map(h => (
                                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-400">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {mesesFuturos.map(m => {
                              const adj = ajustes[m.metaNum] ?? 0;
                              const metaFinal = m.meta + adj;
                              return (
                                <tr key={m.mes} className="border-b border-gray-50">
                                  <td className="px-4 py-3 font-medium text-gray-800">{m.mes}</td>
                                  <td className="px-4 py-3 text-gray-500">{fmtBRL(m.meta)}</td>
                                  <td className="px-4 py-3">
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">R$</span>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        value={adj > 0 ? adj.toLocaleString("pt-BR") : ""}
                                        onChange={e => {
                                          const d = e.target.value.replace(/\D/g,"");
                                          handleAjusteChange(m.metaNum, d);
                                        }}
                                        placeholder="0"
                                        className="pl-8 pr-2 py-1.5 text-sm w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        style={{ fontWeight: adj > 0 ? 600 : 400, color: adj > 0 ? C.primaryCont : "#9CA3AF" }}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-bold" style={{ color: adj > 0 ? C.primaryCont : C.onBg }}>
                                    {fmtBRL(metaFinal)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right summary card */}
                    <div className="w-60 flex-shrink-0">
                      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">RESUMO DA REDISTRIBUIÇÃO</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Gap Total:</span>
                          <span className="text-sm font-bold" style={{ color: C.error }}>{fmtBRL(gapTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Distribuído:</span>
                          <span className="text-sm font-bold" style={{ color: "#15803D" }}>{fmtBRL(totalDistribuido)}</span>
                        </div>
                        <div className="h-px bg-gray-100" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-800">Restante:</span>
                          <span className="text-base font-bold" style={{ color: restante > 0 ? C.error : "#15803D" }}>
                            {restante === 0 ? "R$ 0,00" : (restante > 0 ? "" : "-") + fmtBRL2(restante)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={canSave ? handleSalvarRedistribuicao : undefined}
                        disabled={!canSave}
                        className="mt-3 w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                        style={{
                          background: canSave ? C.primaryCont : "#D1D5DB",
                          cursor: canSave ? "pointer" : "not-allowed",
                        }}
                      >
                        Salvar redistribuição
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <FormDefinirMeta
          vendedores={vendedores}
          onClose={() => setShowModal(false)}
          onSave={handleDefinirMeta}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
