import { useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  LayoutDashboard, ShoppingCart, CreditCard, Percent, Users, UserCheck,
  Truck, FileText, BarChart2, TrendingUp, Target, Landmark, PieChart,
  BookOpen, Clock, Activity, Settings, Search, Download, Pencil,
  Save, X, TrendingDown, ChevronRight,
} from "lucide-react";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:       "#9d4300",
  primaryCont:   "#f97316",
  surfLow:       "#f1f3ff",
  surfLowest:    "#ffffff",
  surfCont:      "#e9edff",
  surfContHigh:  "#e1e8fd",
  onBg:          "#141b2b",
  secondary:     "#575e70",
  error:         "#ba1a1a",
  tertiary:      "#006398",
  tertiaryCont:  "#00a2f4",
  outlineVar:    "#e0c0b1",
  green:         "#16a34a",
};

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",          icon: LayoutDashboard, section: null },
  { label: "Vendas & Contratos", icon: ShoppingCart,    section: "COMERCIAL" },
  { label: "Parcelas",           icon: CreditCard,      section: "COMERCIAL" },
  { label: "Comissões",          icon: Percent,         section: "COMERCIAL" },
  { label: "Clientes",           icon: Users,           section: "COMERCIAL" },
  { label: "Colaboradores",      icon: UserCheck,       section: "OPERACIONAL" },
  { label: "Fornecedores",       icon: Truck,           section: "OPERACIONAL" },
  { label: "Notas Fiscais",      icon: FileText,        section: "OPERACIONAL" },
  { label: "DRE",                icon: BarChart2,       section: "FINANCEIRO" },
  { label: "Forecast",           icon: TrendingUp,      section: "FINANCEIRO" },
  { label: "Metas",              icon: Target,          section: "FINANCEIRO" },
  { label: "Fluxo de Caixa",    icon: Activity,        section: "FINANCEIRO" },
  { label: "Despesas",           icon: Landmark,        section: "FINANCEIRO" },
  { label: "Relatórios",         icon: PieChart,        section: "SISTEMA" },
  { label: "Budget",             icon: BookOpen,        section: "SISTEMA", active: true },
  { label: "Histórico",          icon: Clock,           section: "SISTEMA" },
  { label: "Configurações",      icon: Settings,        section: "SISTEMA" },
];
const NAV_SECTIONS = ["COMERCIAL", "OPERACIONAL", "FINANCEIRO", "SISTEMA"];

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Initial budget data (values in thousands)
const INIT_PONTUAL: number[] = [250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360];
const INIT_RECORRENTE: number[] = [750, 760, 770, 780, 790, 800, 810, 820, 830, 840, 850, 860];
const REALIZADO: (number | null)[] = [1100, 980, 1200, 930, null, null, null, null, null, null, null, null];

// Chart data (monthly bar chart: 4 visible months)
const CHART_MONTHS = ["Jan", "Fev", "Mar", "Abr"];
const CHART_DATA = CHART_MONTHS.map((month, i) => ({
  name: month,
  orcado: INIT_PONTUAL[i] + INIT_RECORRENTE[i],
  realizadoRec: REALIZADO[i] ?? 0,
  realizadoDesp: [670, 680, 685, 690][i],
}));

// Format compact number
function fmt(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}k`;
  return `${v}`;
}

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  let currentSection: string | null = null;
  return (
    <aside
      style={{ width: 240, background: "#0f172a" }}
      className="fixed left-0 top-0 h-full flex flex-col py-6 z-50 shadow-xl"
    >
      <div className="px-6 mb-6">
        <h1 className="text-lg font-bold text-white tracking-tight">OptFinance ERP</h1>
        <p className="text-xs text-slate-400 font-medium tracking-tight">Enterprise Resource Planning</p>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-0.5 pb-4">
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== currentSection;
          if (showSection) currentSection = item.section;
          const Icon = item.icon;
          return (
            <div key={item.label}>
              {showSection && (
                <p className="px-6 pt-4 pb-1 text-[10px] font-bold tracking-widest uppercase text-slate-500">
                  {item.section}
                </p>
              )}
              <a
                href="#"
                style={item.active ? {
                  borderLeft: `3px solid ${C.primaryCont}`,
                  background: "rgba(249,115,22,0.08)",
                  color: "#fff",
                } : undefined}
                className={
                  item.active
                    ? "flex items-center gap-3 px-5 py-2.5 text-sm font-semibold"
                    : "flex items-center gap-3 px-6 py-2.5 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
                }
              >
                <Icon size={16} />
                {item.label}
              </a>
            </div>
          );
        })}
      </nav>
      <div className="px-4 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            CF
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-bold truncate">Carlos Ferreira</p>
            <p className="text-slate-500 text-[10px] truncate">CFO</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Budget() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [pontual, setPontual] = useState<number[]>([...INIT_PONTUAL]);
  const [recorrente, setRecorrente] = useState<number[]>([...INIT_RECORRENTE]);
  const [savedPontual] = useState<number[]>([...INIT_PONTUAL]);
  const [savedRecorrente] = useState<number[]>([...INIT_RECORRENTE]);
  const [anoFiltro, setAnoFiltro] = useState("2026");
  const [centroCusto, setCentroCusto] = useState("Todos os Centros");
  const [search, setSearch] = useState("");

  // Derived values
  const bruta = pontual.map((v, i) => v + recorrente[i]);
  const totalBruta = bruta.reduce((a, b) => a + b, 0) * 1000;
  const totalPontual = pontual.reduce((a, b) => a + b, 0) * 1000;
  const totalRecorrente = recorrente.reduce((a, b) => a + b, 0) * 1000;
  const totalRealizado = (REALIZADO.filter(Boolean) as number[]).reduce((a, b) => a + b, 0) * 1000;

  const handleCellEdit = useCallback((row: "pontual" | "recorrente", monthIdx: number, raw: string) => {
    const stripped = raw.replace(/[^0-9.]/g, "");
    const val = parseFloat(stripped);
    if (isNaN(val)) return;
    if (row === "pontual") {
      setPontual((prev) => { const n = [...prev]; n[monthIdx] = val; return n; });
    } else {
      setRecorrente((prev) => { const n = [...prev]; n[monthIdx] = val; return n; });
    }
    setPendingChanges((p) => p + 1);
  }, []);

  const handleCancel = () => {
    setPontual([...savedPontual]);
    setRecorrente([...savedRecorrente]);
    setPendingChanges(0);
    setIsEditMode(false);
  };

  const handleSave = () => {
    setPendingChanges(0);
    setIsEditMode(false);
  };

  const variacaoColor = (real: number | null, orcado: number): string => {
    if (real === null) return "#94a3b8";
    return real >= orcado ? C.green : C.error;
  };

  const variacaoLabel = (real: number | null, orcado: number): string => {
    if (real === null) return "—";
    const pct = ((real - orcado) / orcado * 100).toFixed(1);
    return real >= orcado ? `▲ ${pct}%` : `▼ ${Math.abs(Number(pct))}%`;
  };

  // KPI derived
  const receitaOrcada = totalBruta;
  const receitaRealizada = totalRealizado;
  const despesasOrcadas = 8_120_000;
  const resultado = receitaRealizada - receitaOrcada;

  return (
    <div className="bg-slate-50 min-h-screen font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
      <Sidebar />

      {/* Topbar */}
      <header
        className="fixed top-0 right-0 z-40 flex justify-between items-center px-8 h-16 border-b border-slate-200"
        style={{ left: 240, background: "rgba(249,249,255,0.9)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-6">
          <h2 className="text-base font-black text-slate-900">Budget / Orçamento</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar rubrica..."
              className="bg-slate-100 border-none rounded-lg pl-9 pr-4 py-1.5 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all"
              style={{ background: C.primaryCont }}
            >
              <Save size={14} />
              Salvar Alterações
            </button>
          )}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <ChevronRight size={18} className="text-slate-400" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        className="min-h-screen pb-32"
        style={{ marginLeft: 240, paddingTop: 64 }}
      >
        <div className="p-8 max-w-full">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Budget — Orçamento Anual</h1>
              <p className="text-sm mt-1" style={{ color: C.secondary }}>Planejamento financeiro por centro de custo</p>
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Ano</label>
                  <select
                    value={anoFiltro}
                    onChange={(e) => setAnoFiltro(e.target.value)}
                    className="bg-white border border-slate-200 text-sm font-bold rounded-lg py-2 px-4 shadow-sm focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  >
                    <option>2026</option>
                    <option>2025</option>
                    <option>2024</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Centro de Custo</label>
                  <select
                    value={centroCusto}
                    onChange={(e) => setCentroCusto(e.target.value)}
                    className="bg-white border border-slate-200 text-sm font-bold rounded-lg py-2 px-4 shadow-sm focus:ring-1 focus:ring-orange-400 focus:outline-none"
                  >
                    <option>Todos os Centros</option>
                    <option>Marketing</option>
                    <option>Operações</option>
                    <option>Tecnologia</option>
                  </select>
                </div>
                <button
                  className="text-white px-5 py-2 rounded-lg font-bold text-sm mt-5 shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ background: C.primaryCont, boxShadow: "0 4px 14px rgba(249,115,22,0.25)" }}
                >
                  Filtrar
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 border border-slate-200 font-bold px-5 py-2.5 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors" style={{ color: C.primary }}>
                <Download size={16} />
                Exportar PDF
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
                style={{ background: C.primaryCont, boxShadow: "0 4px 14px rgba(249,115,22,0.25)" }}
              >
                <Pencil size={16} />
                Editar Budget
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Receita Orçada */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-b-4" style={{ borderBottomColor: C.tertiaryCont }}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Receita Orçada (ano)</p>
              <p className="text-2xl font-black" style={{ color: C.tertiary }}>
                {fmtBRL(receitaOrcada)}
              </p>
              <p className="text-xs text-slate-400 mt-1">{anoFiltro} · {centroCusto}</p>
            </div>
            {/* Receita Realizada YTD */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-green-500">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Receita Realizada (YTD)</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-green-600">{fmtBRL(receitaRealizada)}</p>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                  {(receitaRealizada / receitaOrcada * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">do orçado anual</p>
            </div>
            {/* Despesas Orçadas */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-b-4 border-slate-400">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Despesas Orçadas (ano)</p>
              <p className="text-2xl font-black text-slate-600">{fmtBRL(despesasOrcadas)}</p>
              <p className="text-xs text-slate-400 mt-1">12 meses consolidados</p>
            </div>
            {/* Resultado */}
            <div
              className="bg-white p-6 rounded-xl shadow-sm border-b-4"
              style={{ borderBottomColor: resultado >= 0 ? C.green : C.error }}
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resultado Orçado vs Real</p>
              <p className="text-2xl font-black" style={{ color: resultado >= 0 ? C.green : C.error }}>
                {resultado >= 0 ? "" : "- "}{fmtBRL(Math.abs(resultado))}
              </p>
              <p className="text-xs text-slate-400 mt-1">YTD vs meta anual</p>
            </div>
          </div>

          {/* Revenue Table */}
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-base font-bold flex items-center gap-2">
                <TrendingUp size={18} style={{ color: C.primaryCont }} />
                Orçamento de Receitas
              </h3>
              {isEditMode && (
                <span className="text-xs font-medium text-slate-400 italic">
                  Clique nas células brancas para editar valores
                </span>
              )}
            </div>
            <div className="overflow-x-auto" style={{ maxWidth: "100%" }}>
              <table className="w-full text-left text-sm border-collapse" style={{ minWidth: 960 }}>
                <thead>
                  <tr className="text-slate-500 font-bold text-[11px] uppercase tracking-tight" style={{ background: C.surfLow }}>
                    <th className="p-4 whitespace-nowrap" style={{ minWidth: 180 }}>Linha de Receita</th>
                    {MONTHS.map((m) => (
                      <th key={m} className="p-4 text-center whitespace-nowrap">{m}</th>
                    ))}
                    <th className="p-4 text-center bg-orange-50 text-orange-700 whitespace-nowrap">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Receita Bruta Orçada — parent, read-only */}
                  <tr className="font-bold text-slate-800" style={{ background: "rgba(249,115,22,0.06)" }}>
                    <td className="p-4 whitespace-nowrap">Receita Bruta Orçada</td>
                    {bruta.map((v, i) => (
                      <td key={i} className="p-4 text-center">{fmt(v * 1000)}</td>
                    ))}
                    <td className="p-4 text-center bg-orange-100 text-orange-900 font-black">
                      {fmt(totalBruta)}
                    </td>
                  </tr>
                  {/* Pontual — editable child */}
                  <tr className="border-b border-slate-50 hover:bg-orange-50/20">
                    <td className="p-4 text-slate-500 pl-8">↳ Pontual</td>
                    {pontual.map((v, i) => (
                      <td key={i} className="p-2 text-center">
                        {isEditMode ? (
                          <input
                            type="text"
                            defaultValue={String(v)}
                            onBlur={(e) => handleCellEdit("pontual", i, e.target.value)}
                            className="w-full text-center rounded px-1 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                            style={{ background: "#fff", border: "1px solid #e2e8f0", cursor: "text" }}
                          />
                        ) : (
                          <span>{fmt(v * 1000)}</span>
                        )}
                      </td>
                    ))}
                    <td className="p-4 text-center font-bold text-slate-700">{fmt(totalPontual)}</td>
                  </tr>
                  {/* Recorrente — editable child */}
                  <tr className="border-b border-slate-50 hover:bg-orange-50/20">
                    <td className="p-4 text-slate-500 pl-8">↳ Recorrente</td>
                    {recorrente.map((v, i) => (
                      <td key={i} className="p-2 text-center">
                        {isEditMode ? (
                          <input
                            type="text"
                            defaultValue={String(v)}
                            onBlur={(e) => handleCellEdit("recorrente", i, e.target.value)}
                            className="w-full text-center rounded px-1 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                            style={{ background: "#fff", border: "1px solid #e2e8f0", cursor: "text" }}
                          />
                        ) : (
                          <span>{fmt(v * 1000)}</span>
                        )}
                      </td>
                    ))}
                    <td className="p-4 text-center font-bold text-slate-700">{fmt(totalRecorrente)}</td>
                  </tr>
                  {/* Receita Realizada */}
                  <tr className="font-bold" style={{ background: "rgba(22,163,74,0.05)", color: C.green }}>
                    <td className="p-4 whitespace-nowrap">Receita Realizada</td>
                    {REALIZADO.map((v, i) => (
                      <td key={i} className="p-4 text-center">{v !== null ? fmt(v * 1000) : "—"}</td>
                    ))}
                    <td className="p-4 text-center font-bold" style={{ background: "rgba(22,163,74,0.08)" }}>
                      {fmt(totalRealizado)}
                    </td>
                  </tr>
                  {/* Variação */}
                  <tr className="border-t border-slate-100 font-bold text-sm">
                    <td className="p-4 text-slate-700">Variação (%)</td>
                    {REALIZADO.map((v, i) => (
                      <td
                        key={i}
                        className="p-4 text-center"
                        style={{ color: variacaoColor(v, bruta[i]) }}
                      >
                        {variacaoLabel(v, bruta[i])}
                      </td>
                    ))}
                    <td className="p-4 text-center text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Charts section */}
          <section className="bg-white p-8 rounded-2xl shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-900">Orçado vs Realizado por Mês</h3>
              <div className="flex gap-4 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: C.tertiary }}></span>
                  Orçado
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block bg-green-500"></span>
                  Realizado (Rec)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: C.error }}></span>
                  Realizado (Desp)
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {CHART_DATA.map((d) => (
                <div key={d.name} className="flex flex-col">
                  <p className="text-xs font-bold text-slate-500 text-center mb-2 uppercase tracking-wider">{d.name}</p>
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[d]} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number, name: string) => [fmt(value * 1000), name]}
                          contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        />
                        <Bar dataKey="orcado" fill={C.tertiary} name="Orçado" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="realizadoRec" fill="#16a34a" name="Realizado (Rec)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="realizadoDesp" fill={C.error} name="Realizado (Desp)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom grid: Expenses summary + Resultado Geral */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resumo de Despesas */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <TrendingDown size={18} className="text-slate-400" />
                <h3 className="text-base font-bold text-slate-900">Resumo de Despesas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-slate-500 font-bold text-xs uppercase tracking-wider" style={{ background: C.surfLow }}>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Orçado (Mês)</th>
                      <th className="p-4">Realizado</th>
                      <th className="p-4">Variação</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-50">
                      <td className="p-4">Salários &amp; Encargos</td>
                      <td className="p-4 text-slate-400">R$ 450.000</td>
                      <td className="p-4 font-bold text-slate-800">R$ 448.200</td>
                      <td className="p-4 font-bold text-green-600">▼ 0.4%</td>
                    </tr>
                    <tr className="border-b border-slate-50">
                      <td className="p-4">Infraestrutura / Cloud</td>
                      <td className="p-4 text-slate-400">R$ 120.000</td>
                      <td className="p-4 font-bold text-slate-800">R$ 135.000</td>
                      <td className="p-4 font-bold" style={{ color: C.error }}>▲ 12.5%</td>
                    </tr>
                    <tr className="border-b border-slate-50">
                      <td className="p-4">Marketing / Ads</td>
                      <td className="p-4 text-slate-400">R$ 80.000</td>
                      <td className="p-4 font-bold text-slate-800">R$ 95.000</td>
                      <td className="p-4 font-bold" style={{ color: C.error }}>▲ 18.7%</td>
                    </tr>
                    <tr className="bg-slate-900 text-white">
                      <td className="p-4 font-bold">TOTAL DESPESAS</td>
                      <td className="p-4 font-bold">R$ 650.000</td>
                      <td className="p-4 font-bold">R$ 678.200</td>
                      <td className="p-4 font-bold text-orange-400">▲ 4.3%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resultado Geral */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-6">Resultado Geral</h3>
              <div className="space-y-5">
                {/* Visão Orçado */}
                <div className="p-4 rounded-xl" style={{ background: C.surfLow }}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Visão: Orçado</p>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Receita:</span>
                    <span className="text-sm font-bold text-slate-900">R$ 15.0M</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-slate-600">Despesas:</span>
                    <span className="text-sm font-bold" style={{ color: C.error }}>-R$ 8.1M</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2.5 flex justify-between">
                    <span className="text-sm font-black text-slate-800">EBITDA:</span>
                    <span className="text-sm font-black" style={{ color: C.tertiary }}>R$ 6.9M</span>
                  </div>
                </div>

                {/* Visão Realizado YTD */}
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-3">Visão: Realizado (YTD)</p>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Receita:</span>
                    <span className="text-sm font-bold text-slate-900">R$ 4.2M</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-slate-600">Despesas:</span>
                    <span className="text-sm font-bold" style={{ color: C.error }}>-R$ 2.8M</span>
                  </div>
                  <div className="border-t border-orange-200 pt-2.5 flex justify-between">
                    <span className="text-sm font-black text-slate-800">EBITDA:</span>
                    <span className="text-sm font-black text-orange-700">R$ 1.4M</span>
                  </div>
                </div>

                {/* Variação */}
                <div className="text-center pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Variação Real vs Orçado
                  </p>
                  <p className="text-4xl font-black" style={{ color: C.error }}>-12.4%</p>
                  <p className="text-[10px] text-slate-400 mt-2 italic px-2 leading-relaxed">
                    Alterações no budget são registradas no histórico com usuário e data/hora.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating edit mode banner */}
      {isEditMode && (
        <div
          className="fixed bottom-6 z-50 flex items-center justify-between gap-8 rounded-2xl px-8 py-4 shadow-2xl border border-slate-200"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 500,
            background: "#FFF7ED",
            boxShadow: "0 8px 32px rgba(249,115,22,0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ background: C.primaryCont }}
            />
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest leading-none"
                style={{ color: C.primaryCont }}
              >
                Modo de edição ativo
              </p>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                Alterações pendentes: {pendingChanges}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-slate-600 font-bold text-sm hover:bg-orange-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 text-white rounded-lg font-bold text-sm transition-transform hover:scale-105 active:scale-95"
              style={{ background: C.primaryCont, boxShadow: "0 4px 14px rgba(249,115,22,0.3)" }}
            >
              <Save size={14} />
              Salvar Budget
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
