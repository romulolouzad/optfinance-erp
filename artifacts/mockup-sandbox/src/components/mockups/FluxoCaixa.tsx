import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Activity, LayoutDashboard, ShoppingCart, CreditCard, Percent,
  Users, UserCheck, Truck, FileText, BarChart2, TrendingUp,
  Target, Landmark, Building2, PieChart, BookOpen, Clock,
  Settings, HelpCircle, LogOut, Search, Download, Filter,
  Plus, Calendar, BanknoteIcon, TrendingDown, X, Upload,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

type TipoLancamento = "ENTRADA" | "SAÍDA" | "TRANSF" | "PROJETADO";

interface Movimentacao {
  id: number;
  data: string;
  tipo: TipoLancamento;
  descricao: string;
  categoria: string;
  centroCusto: string;
  conta: string;
  entrada: number;
  saida: number;
  projetado?: boolean;
}

const INITIAL_MOVIMENTACOES: Movimentacao[] = [
  { id: 1,  data: "22/01/2024", tipo: "ENTRADA",   descricao: "Venda Serv. Tech Cloud",       categoria: "Serviços",      centroCusto: "Operacional",    conta: "Itaú Corp",  entrada: 15400,  saida: 0,     projetado: false },
  { id: 2,  data: "21/01/2024", tipo: "SAÍDA",     descricao: "Aluguel Sede SP",               categoria: "Infraestrutura",centroCusto: "Administrativo", conta: "Itaú Corp",  entrada: 0,      saida: 8200,  projetado: false },
  { id: 3,  data: "20/01/2024", tipo: "TRANSF",    descricao: "Transf. para Investimento",     categoria: "Transferência", centroCusto: "Financeiro",     conta: "BTG Pact",   entrada: 20000,  saida: 0,     projetado: false },
  { id: 4,  data: "19/01/2024", tipo: "ENTRADA",   descricao: "Contrato Anual Softbank",       categoria: "Receita",       centroCusto: "Vendas",         conta: "Itaú Corp",  entrada: 32000,  saida: 0,     projetado: false },
  { id: 5,  data: "18/01/2024", tipo: "SAÍDA",     descricao: "Folha de Pagamento Jan",        categoria: "RH",            centroCusto: "Administrativo", conta: "Bradesco",   entrada: 0,      saida: 28500, projetado: false },
  { id: 6,  data: "17/01/2024", tipo: "ENTRADA",   descricao: "Recebimento Parcela #12",       categoria: "Receita",       centroCusto: "Vendas",         conta: "Itaú Corp",  entrada: 7800,   saida: 0,     projetado: false },
  { id: 7,  data: "15/01/2024", tipo: "SAÍDA",     descricao: "Assinatura SaaS Stack",         categoria: "TI",            centroCusto: "Operacional",    conta: "Itaú Corp",  entrada: 0,      saida: 3200,  projetado: false },
  { id: 8,  data: "14/01/2024", tipo: "SAÍDA",     descricao: "Impostos & Taxas",              categoria: "Fiscal",        centroCusto: "Financeiro",     conta: "Bradesco",   entrada: 0,      saida: 11400, projetado: false },
  { id: 9,  data: "10/01/2024", tipo: "ENTRADA",   descricao: "Consultoria TI Externa",        categoria: "Serviços",      centroCusto: "Operacional",    conta: "BTG Pact",   entrada: 9120,   saida: 0,     projetado: false },
  { id: 10, data: "28/01/2024", tipo: "PROJETADO", descricao: "Previsão Faturamento B2B",      categoria: "Receita",       centroCusto: "Vendas",         conta: "Itaú Corp",  entrada: 12000,  saida: 0,     projetado: true  },
];

const CHART_DATA = [
  { semana: "01 Jan", entradas: 9120,  saidas: 11400, saldo: 127500 },
  { semana: "07 Jan", entradas: 7800,  saidas: 3200,  saldo: 132100 },
  { semana: "14 Jan", entradas: 0,     saidas: 28500, saldo: 103600 },
  { semana: "21 Jan", entradas: 32000, saidas: 8200,  saldo: 127400 },
  { semana: "28 Jan", entradas: 15400, saidas: 0,     saldo: 142800 },
  { semana: "31 Jan", entradas: 20000, saidas: 0,     saldo: 142500 },
];

const NAV_ITEMS = [
  { label: "Dashboard",         href: "/dashboard",          icon: LayoutDashboard, section: null },
  { label: "Vendas & Contratos",href: "/vendas",             icon: ShoppingCart,    section: "COMERCIAL" },
  { label: "Parcelas",          href: "/parcelas",           icon: CreditCard,      section: "COMERCIAL" },
  { label: "Comissões",         href: "/comissoes",          icon: Percent,         section: "COMERCIAL" },
  { label: "Clientes",          href: "/clientes",           icon: Users,           section: "COMERCIAL" },
  { label: "Colaboradores",     href: "/colaboradores",      icon: UserCheck,       section: "OPERACIONAL" },
  { label: "Fornecedores",      href: "/fornecedores",       icon: Truck,           section: "OPERACIONAL" },
  { label: "Notas Fiscais",     href: "/notas-fiscais",      icon: FileText,        section: "OPERACIONAL" },
  { label: "DRE",               href: "/dre",                icon: BarChart2,       section: "FINANCEIRO" },
  { label: "Forecast",          href: "/forecast",           icon: TrendingUp,      section: "FINANCEIRO" },
  { label: "Metas",             href: "/metas",              icon: Target,          section: "FINANCEIRO" },
  { label: "Fluxo de Caixa",   href: "/fluxo-de-caixa",     icon: Activity,        section: "FINANCEIRO" },
  { label: "Despesas",          href: "/despesas",           icon: Landmark,        section: "FINANCEIRO" },
  { label: "Relatórios",        href: "/relatorios",         icon: PieChart,        section: "SISTEMA" },
  { label: "Budget",            href: "/budget",             icon: BookOpen,        section: "SISTEMA" },
  { label: "Histórico",         href: "/historico",          icon: Clock,           section: "SISTEMA" },
  { label: "Configurações",     href: "/configuracoes",      icon: Settings,        section: "SISTEMA" },
];

const NAV_SECTIONS = ["COMERCIAL", "OPERACIONAL", "FINANCEIRO", "SISTEMA"];

// Opening balance before the current period — all KPI values derive from this + movements
const OPENING_BALANCE = 109480;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtBRL(v: number) {
  return `R$ ${fmt(v)}`;
}

function calcKPIs(movs: Movimentacao[]) {
  const realized  = movs.filter(m => !m.projetado);
  const projected = movs.filter(m => m.projetado);
  const entradas  = realized.reduce((a, m) => a + m.entrada, 0);
  const saidas    = realized.reduce((a, m) => a + m.saida, 0);
  const saldo     = OPENING_BALANCE + entradas - saidas;
  const projetado = saldo + projected.reduce((a, m) => a + m.entrada - m.saida, 0);
  return { saldo, entradas, saidas, projetado };
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: TipoLancamento }) {
  const map: Record<TipoLancamento, { bg: string; text: string }> = {
    ENTRADA:   { bg: "#DCFCE7", text: "#15803D" },
    SAÍDA:     { bg: "#FEE2E2", text: "#B91C1C" },
    TRANSF:    { bg: "#DBEAFE", text: "#1D4ED8" },
    PROJETADO: { bg: "#FFF7ED", text: "#C2410C" },
  };
  const s = map[tipo];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: s.bg, color: s.text }}
    >
      {tipo}
    </span>
  );
}

// ─── Novo Lançamento Modal ───────────────────────────────────────────────────

interface FormData {
  conta: string;
  tipo: TipoLancamento;
  data: string;
  descricao: string;
  valor: string;
  categoria: string;
  centroCusto: string;
  status: "Realizado" | "Pendente" | "Projetado";
  observacao: string;
}

const EMPTY_FORM: FormData = {
  conta: "",
  tipo: "ENTRADA",
  data: new Date().toISOString().slice(0, 10),
  descricao: "",
  valor: "",
  categoria: "",
  centroCusto: "",
  status: "Realizado",
  observacao: "",
};

function FormNovoLancamento({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (m: Movimentacao) => void;
}) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const isValid =
    form.conta.trim() !== "" &&
    form.descricao.trim() !== "" &&
    form.valor.trim() !== "" &&
    form.categoria.trim() !== "" &&
    form.centroCusto.trim() !== "";

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    if (!isValid) return;
    const val = parseFloat(form.valor.replace(",", ".")) || 0;
    const projetado = form.status === "Projetado";
    const nov: Movimentacao = {
      id: Date.now(),
      data: new Date(form.data + "T12:00:00").toLocaleDateString("pt-BR"),
      tipo: form.tipo,
      descricao: form.descricao,
      categoria: form.categoria,
      centroCusto: form.centroCusto,
      conta: form.conta,
      entrada: form.tipo === "ENTRADA" || form.tipo === "TRANSF" ? val : 0,
      saida:   form.tipo === "SAÍDA" ? val : 0,
      projetado,
    };
    onSave(nov);
    onClose();
  }

  const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400/40 placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Novo Lançamento</h2>
            <p className="text-xs text-gray-400 mt-0.5">Preencha os dados do lançamento financeiro</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Conta + Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Conta <span className="text-red-400">*</span></label>
              <select className={inputCls} value={form.conta} onChange={e => set("conta", e.target.value)}>
                <option value="">Selecionar...</option>
                <option>Itaú Corp</option>
                <option>Bradesco</option>
                <option>BTG Pact</option>
                <option>Caixa Econômica</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo <span className="text-red-400">*</span></label>
              <select className={inputCls} value={form.tipo} onChange={e => set("tipo", e.target.value as TipoLancamento)}>
                <option value="ENTRADA">Entrada</option>
                <option value="SAÍDA">Saída</option>
                <option value="TRANSF">Transferência</option>
                <option value="PROJETADO">Projetado</option>
              </select>
            </div>
          </div>

          {/* Data */}
          <div>
            <label className={labelCls}>Data <span className="text-red-400">*</span></label>
            <input type="date" className={inputCls} value={form.data} onChange={e => set("data", e.target.value)} />
          </div>

          {/* Descrição */}
          <div>
            <label className={labelCls}>Descrição <span className="text-red-400">*</span></label>
            <input type="text" className={inputCls} placeholder="Ex: Pagamento fornecedor XYZ" value={form.descricao} onChange={e => set("descricao", e.target.value)} />
          </div>

          {/* Valor */}
          <div>
            <label className={labelCls}>Valor (R$) <span className="text-red-400">*</span></label>
            <input type="text" className={inputCls} placeholder="0,00" value={form.valor} onChange={e => set("valor", e.target.value)} />
          </div>

          {/* Categoria + Centro de Custo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Categoria <span className="text-red-400">*</span></label>
              <select className={inputCls} value={form.categoria} onChange={e => set("categoria", e.target.value)}>
                <option value="">Selecionar...</option>
                <option>Receita</option>
                <option>Serviços</option>
                <option>RH</option>
                <option>Infraestrutura</option>
                <option>TI</option>
                <option>Fiscal</option>
                <option>Transferência</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Centro de Custo <span className="text-red-400">*</span></label>
              <select className={inputCls} value={form.centroCusto} onChange={e => set("centroCusto", e.target.value)}>
                <option value="">Selecionar...</option>
                <option>Operacional</option>
                <option>Administrativo</option>
                <option>Financeiro</option>
                <option>Vendas</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <div className="flex gap-4 mt-1">
              {(["Realizado", "Pendente", "Projetado"] as const).map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={() => set("status", s)}
                    className="accent-orange-500"
                  />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className={labelCls}>Observação <span className="text-gray-300 font-normal normal-case">(opcional)</span></label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Informações adicionais..."
              value={form.observacao}
              onChange={e => set("observacao", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
            style={{ background: isValid ? "linear-gradient(to top, #9D4300, #F97316)" : "#9ca3af" }}
          >
            Salvar Lançamento
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar() {
  const sections: (string | null)[] = [null, ...NAV_SECTIONS];
  return (
    <aside className="fixed top-0 left-0 h-full w-[220px] z-40 flex flex-col" style={{ background: "#111827" }}>
      {/* Logo */}
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

      {/* Nav */}
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
                  const active = item.href === "/fluxo-de-caixa";
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href="#"
                      onClick={e => e.preventDefault()}
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

      {/* User */}
      <div className="px-3 pb-4 flex-shrink-0 space-y-2">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F97316, #9D4300)" }}>
            MV
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate leading-none">Marcus Viana</p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-none">CFO</p>
          </div>
        </div>
        <div className="space-y-0.5">
          <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
            Support
          </a>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {fmtBRL(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FluxoCaixa() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(INITIAL_MOVIMENTACOES);
  const [modalOpen, setModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const syncTime = useMemo(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }, []);

  const kpis = useMemo(() => calcKPIs(movimentacoes), [movimentacoes]);

  function handleSave(nov: Movimentacao) {
    setMovimentacoes(prev => [nov, ...prev]);
  }

  // Progressive running balance
  const movimentacoesComSaldo = useMemo(() => {
    let saldo = OPENING_BALANCE;
    return [...movimentacoes].reverse().map(m => {
      saldo += m.entrada - m.saida;
      return { ...m, saldoAtual: saldo };
    }).reverse();
  }, [movimentacoes]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      {/* Main content */}
      <div className="ml-[220px] flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center gap-4 sticky top-0 z-30">
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900 leading-none">Fluxo de Caixa</h1>
            <p className="text-xs text-gray-400 mt-0.5">Entradas, saídas e saldo por período</p>
          </div>

          {/* Search */}
          <div className="relative hidden sm:flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar lançamento..."
              className="pl-9 pr-4 py-1.5 text-sm rounded-lg w-52 bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
            />
          </div>

          {/* Export PDF */}
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </button>

          {/* Novo Lançamento */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: "linear-gradient(to top, #9D4300, #F97316)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Lançamento
          </button>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">

          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 flex items-center gap-3 flex-wrap">
            {/* Período */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">PERÍODO</span>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 cursor-pointer hover:border-orange-400/50 transition-colors">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium">01 Jan — 31 Jan, 2024</span>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 mx-1" />

            {/* Conta Bancária */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">CONTA BANCÁRIA</span>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 cursor-pointer">
                <option>Todas as Contas</option>
                <option>Itaú Corp</option>
                <option>Bradesco</option>
                <option>BTG Pact</option>
              </select>
            </div>

            {/* Centro de Custo */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">CENTRO DE CUSTO</span>
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 cursor-pointer">
                <option>Todos os Centros</option>
                <option>Operacional</option>
                <option>Administrativo</option>
                <option>Financeiro</option>
                <option>Vendas</option>
              </select>
            </div>

            {/* Filtrar */}
            <div className="flex flex-col gap-0.5 mt-[18px]">
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: "linear-gradient(to top, #9D4300, #F97316)" }}>
                <Filter className="w-3.5 h-3.5" />
                Filtrar
              </button>
            </div>

            <div className="flex-1" />

            {/* Export buttons */}
            <div className="flex items-end gap-2 mt-[18px]">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* Saldo Atual */}
            <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderLeft: "4px solid #16A34A" }}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">SALDO ATUAL</p>
                <div className="p-1.5 rounded-lg bg-green-50">
                  <BanknoteIcon className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-[11px] font-bold text-green-600 mb-0.5">R$</p>
              <p className="text-2xl font-extrabold text-green-600 leading-none">{fmt(kpis.saldo)}</p>
            </div>

            {/* Entradas */}
            <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderLeft: "4px solid #16A34A" }}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">ENTRADAS NO PERÍODO</p>
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-[11px] font-bold text-gray-600 mb-0.5">R$</p>
              <p className="text-2xl font-extrabold text-gray-900 leading-none">{fmt(kpis.entradas)}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-[11px] font-semibold text-green-600">+12.4% vs anterior</span>
              </div>
            </div>

            {/* Saídas */}
            <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderLeft: "4px solid #DC2626" }}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">SAÍDAS NO PERÍODO</p>
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-[11px] font-bold text-gray-600 mb-0.5">R$</p>
              <p className="text-2xl font-extrabold text-gray-900 leading-none">{fmt(kpis.saidas)}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowDownRight className="w-3 h-3 text-red-500" />
                <span className="text-[11px] font-semibold text-red-600">-5.2% vs anterior</span>
              </div>
            </div>

            {/* Saldo Projetado */}
            <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderLeft: "4px solid #F97316" }}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">SALDO PROJETADO 30D</p>
                <div className="p-1.5 rounded-lg bg-orange-50">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <p className="text-[11px] font-bold text-orange-500 mb-0.5">R$</p>
              <p className="text-2xl font-extrabold text-orange-500 leading-none">{fmt(kpis.projetado)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Evolução do Caixa</h2>
                <p className="text-xs text-gray-400 mt-0.5">Consolidado diário de entradas vs saídas</p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#F97316" }} />ENTRADAS</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#FB7185" }} />SAÍDAS</span>
                <span className="flex items-center gap-1.5"><span className="w-8 h-0.5 inline-block" style={{ background: "#111827" }} />SALDO</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={CHART_DATA} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis dataKey="semana" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="entradas" name="ENTRADAS" fill="#F97316" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="saidas"   name="SAÍDAS"   fill="#FB7185" radius={[4, 4, 0, 0]} barSize={24} />
                <Line dataKey="saldo" name="SALDO" type="monotone" stroke="#111827" strokeWidth={2.5} dot={{ r: 4, fill: "#111827" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Extrato Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Extrato de Movimentações</h2>
              <span className="text-xs text-gray-400">Mostrando {movimentacoes.length} resultados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["DATA", "TIPO", "DESCRIÇÃO", "CATEGORIA", "CENTRO DE CUSTO", "CONTA", "ENTRADA", "SAÍDA", "SALDO"].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movimentacoesComSaldo.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`border-b border-gray-50 transition-colors hover:bg-gray-50/50 ${m.projetado ? "italic" : ""}`}
                      style={m.projetado ? { background: "#FFFBF5" } : undefined}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{m.data}</td>
                      <td className="px-4 py-3"><TipoBadge tipo={m.tipo} /></td>
                      <td className="px-4 py-3 font-semibold text-gray-800 max-w-[160px] truncate">{m.descricao}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{m.categoria}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{m.centroCusto}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{m.conta}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-green-600 whitespace-nowrap">
                        {m.entrada > 0 ? fmtBRL(m.entrada) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-red-600 whitespace-nowrap">
                        {m.saida > 0 ? fmtBRL(m.saida) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-700 whitespace-nowrap">
                        {fmtBRL(m.saldoAtual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Resumo de Fechamento */}
            <div className="rounded-xl p-6 flex flex-col justify-between min-h-[160px]"
              style={{ background: "linear-gradient(135deg, #F97316, #9D4300)" }}>
              <div>
                <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">RESUMO DE FECHAMENTO</p>
                <p className="text-lg font-bold text-white/90 mt-2 leading-snug">Saldo final do período<br />selecionado</p>
              </div>
              <div>
                <p className="text-xs text-orange-200 mt-4">Janeiro 2024</p>
                <p className="text-3xl font-bold text-white mt-1">{fmtBRL(kpis.saldo)}</p>
              </div>
            </div>

            {/* Conciliação Bancária */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Conciliação Bancária — Importar Extrato</p>
                    <p className="text-xs text-gray-400">Sincronize seus lançamentos com o extrato do banco</p>
                  </div>
                </div>
              </div>

              {/* Drag & Drop area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  dragOver ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); }}
                onClick={() => { window.location.href = "/contas-financeiras/conciliacao"; }}
              >
                <div className="p-3 rounded-full bg-orange-50">
                  <Upload className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Arraste um arquivo CSV ou OFX aqui</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">OU CLIQUE PARA SELECIONAR</p>
              </div>
            </div>
          </div>

          {/* Page Footer */}
          <div className="flex items-center justify-between pt-2 pb-4">
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              © 2024 OPTSOLV PRECISION ARCHITECT — ERP BUSINESS SUITE
            </p>
            <div className="flex items-center gap-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">VERSÃO 2.4.0-STABLE</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">ÚLTIMA SINCRONIZAÇÃO: {syncTime}</p>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalOpen && (
        <FormNovoLancamento
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
