import { useState, useMemo, useCallback } from "react";
import {
  Building2, LayoutDashboard, ShoppingCart, CreditCard, Percent,
  Users, UserCheck, Truck, FileText, BarChart2, TrendingUp,
  Target, Landmark, PieChart, BookOpen, History, Activity,
  Settings, HelpCircle, LogOut, Search, Download, Filter,
  X, CheckCircle, AlertTriangle, Eye, ChevronLeft, ChevronRight,
  Info,
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
  { label: "Histórico",          href: "/historico",       icon: History,         section: "SISTEMA" },
  { label: "Configurações",      href: "/configuracoes",   icon: Settings,        section: "SISTEMA" },
];
const NAV_SECTIONS = ["COMERCIAL", "OPERACIONAL", "FINANCEIRO", "SISTEMA"];

// ─── Types ────────────────────────────────────────────────────────────────────
type TipoEvento = "Normal" | "Ação Crítica" | "Automático";
type EntidadeTipo = "Venda" | "Parcela" | "Despesa" | "Contrato" | "Comissão" | "Conta Financeira" | "Cliente" | "Colaborador" | "Fornecedor" | "Nota Fiscal";

interface CampoAlterado {
  campo: string;
  anterior: string | null;
  novo: string;
}

interface EventoHistorico {
  id: string;
  dataHora: string;
  entidade: EntidadeTipo;
  entidadeId: string;
  tipoEvento: TipoEvento;
  automatico: boolean;
  usuario: string;
  usuarioId: string;
  usuarioDept: string;
  descricaoCompleta: string;
  camposAlterados: CampoAlterado[];
  ip: string;
  empresa: string;
  filial: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_EVENTOS: EventoHistorico[] = [
  {
    id: "04821", dataHora: "01/06/2026 14:32:01", entidade: "Venda", entidadeId: "#0038",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "O usuário Carlos Silva alterou manualmente a porcentagem de comissão da venda #0038 de 5% para 7%. Esta ação foi realizada após o encerramento do período fiscal de Maio. O sistema gerou um log de alerta devido à sensibilidade da alteração.",
    camposAlterados: [
      { campo: "percent_comissao", anterior: "5.00", novo: "7.00" },
      { campo: "motivo_ajuste", anterior: null, novo: "Bonificação Especial" },
    ],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04820", dataHora: "01/06/2026 14:15:12", entidade: "Parcela", entidadeId: "#9921",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Baixa manual de parcela pendente vinculada ao boleto 34191.79001 01300.070004 61700.820008 2 10100000024900. A parcela estava em aberto desde 15/05/2026.",
    camposAlterados: [
      { campo: "status", anterior: "Pendente", novo: "Pago" },
      { campo: "data_pagamento", anterior: null, novo: "01/06/2026" },
      { campo: "comprovante", anterior: null, novo: "boleto_9921.pdf" },
    ],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04819", dataHora: "01/06/2026 13:40:05", entidade: "Cliente", entidadeId: "#C022",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Novo lead cadastrado via integração Webhook site institucional. Dados preenchidos automaticamente pelo pipeline de captação CRM. Aguarda validação manual do responsável comercial.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04818", dataHora: "01/06/2026 12:55:30", entidade: "Despesa", entidadeId: "#8821",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Aprovação de despesa de Serviços AWS Cloud para o período de Junho/2026. Valor autorizado conforme orçamento aprovado em reunião de diretoria do dia 28/05/2026.",
    camposAlterados: [
      { campo: "status", anterior: "Prevista", novo: "Aprovada" },
      { campo: "aprovador", anterior: null, novo: "Rafael Mendes" },
    ],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04817", dataHora: "01/06/2026 11:22:10", entidade: "Contrato", entidadeId: "#CT-0091",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Encerramento antecipado do contrato CT-0091 com cliente Empresa Delta Ltda. Motivo declarado: rescisão por mútuo acordo. O contrato estava vigente desde 01/01/2026 com prazo até 31/12/2026.",
    camposAlterados: [
      { campo: "status", anterior: "Ativo", novo: "Encerrado" },
      { campo: "data_encerramento", anterior: null, novo: "01/06/2026" },
      { campo: "motivo_encerramento", anterior: null, novo: "Rescisão por mútuo acordo" },
    ],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04816", dataHora: "01/06/2026 10:05:44", entidade: "Comissão", entidadeId: "#COM-0224",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Cálculo e liberação de comissão referente à venda #0035 do colaborador João Souza. Comissão calculada com base na régua vigente de 6% sobre o valor líquido da venda.",
    camposAlterados: [
      { campo: "valor_comissao", anterior: "0.00", novo: "1.440,00" },
      { campo: "status", anterior: "Pendente", novo: "Liberada" },
    ],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04815", dataHora: "31/05/2026 17:48:22", entidade: "Conta Financeira", entidadeId: "#CF-014",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Conciliação automática bancária executada para a conta Itaú Business. 47 lançamentos processados, 3 pendentes de revisão manual. Saldo conciliado: R$ 234.541,20.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04814", dataHora: "31/05/2026 16:30:15", entidade: "Fornecedor", entidadeId: "#F-0019",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "Compras",
    descricaoCompleta: "Cadastro de novo fornecedor Logística Express Ltda. CNPJ validado na Receita Federal. Documentação completa anexada: contrato social, certidão negativa, comprovante bancário.",
    camposAlterados: [],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Filial RJ",
  },
  {
    id: "04813", dataHora: "31/05/2026 15:12:00", entidade: "Nota Fiscal", entidadeId: "#NF-4421",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Emissão de nota fiscal NF-e 4421 para cliente Construtora Horizonte. Valor: R$ 24.000,00. CFOP 5102. Chave de acesso gerada com sucesso na SEFAZ-SP.",
    camposAlterados: [],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04812", dataHora: "31/05/2026 14:02:33", entidade: "Venda", entidadeId: "#0037",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Nova venda cadastrada para o cliente Grupo Sigma S.A. Produto: Módulo ERP Avançado. Valor total: R$ 48.000,00. Prazo de entrega: 90 dias. Contrato em elaboração pelo jurídico.",
    camposAlterados: [],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04811", dataHora: "31/05/2026 11:45:08", entidade: "Colaborador", entidadeId: "#COL-0082",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "RH",
    descricaoCompleta: "Desligamento do colaborador Pedro Alves (ID: 082) do quadro de funcionários. Motivo: pedido de demissão. Data efetiva: 31/05/2026. Documentos de rescisão gerados e assinados.",
    camposAlterados: [
      { campo: "status", anterior: "Ativo", novo: "Desligado" },
      { campo: "data_desligamento", anterior: null, novo: "31/05/2026" },
      { campo: "tipo_desligamento", anterior: null, novo: "Pedido de demissão" },
    ],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04810", dataHora: "30/05/2026 16:20:44", entidade: "Parcela", entidadeId: "#9905",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Geração automática de notificação de vencimento para parcela #9905. E-mail enviado ao cliente Grupo Beta Ltda com 5 dias de antecedência conforme configuração do sistema.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04809", dataHora: "30/05/2026 14:10:19", entidade: "Despesa", entidadeId: "#8820",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Pagamento da despesa de aluguel do escritório central realizado via transferência bancária. Comprovante de pagamento anexado ao registro. Conta debitada: Itaú Business Ag 0412.",
    camposAlterados: [
      { campo: "status", anterior: "Prevista", novo: "Paga" },
      { campo: "data_pagamento", anterior: null, novo: "30/05/2026" },
    ],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04808", dataHora: "30/05/2026 10:30:55", entidade: "Contrato", entidadeId: "#CT-0090",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Renovação automática do contrato CT-0090 com cliente TechBrasil S.A. aprovada. Novo prazo vigente: 01/06/2026 a 31/05/2027. Valor atualizado com índice IPCA de 4,62%.",
    camposAlterados: [
      { campo: "data_fim", anterior: "31/05/2026", novo: "31/05/2027" },
      { campo: "valor_mensal", anterior: "R$ 8.200,00", novo: "R$ 8.579,00" },
    ],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04807", dataHora: "29/05/2026 17:55:00", entidade: "Comissão", entidadeId: "#COM-0223",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Estorno de comissão indevida paga ao colaborador João Souza referente à venda cancelada #0031. O valor de R$ 960,00 foi estornado e registrado como desconto na próxima folha.",
    camposAlterados: [
      { campo: "valor_comissao", anterior: "960.00", novo: "0.00" },
      { campo: "status", anterior: "Paga", novo: "Estornada" },
      { campo: "motivo_estorno", anterior: null, novo: "Venda cancelada pelo cliente" },
    ],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04806", dataHora: "29/05/2026 15:22:18", entidade: "Venda", entidadeId: "#0036",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Alteração do status da venda #0036 de Negociação para Fechada. Cliente Empresa Alpha assinou o contrato. Parcelas geradas automaticamente com vencimento em 30 dias.",
    camposAlterados: [
      { campo: "status", anterior: "Negociação", novo: "Fechada" },
      { campo: "data_fechamento", anterior: null, novo: "29/05/2026" },
    ],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04805", dataHora: "29/05/2026 13:08:42", entidade: "Conta Financeira", entidadeId: "#CF-013",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Lançamento de entrada referente a recebimento de cliente Sigma Corp via PIX. Valor: R$ 12.500,00. Identificador de transação: E341...9B2.",
    camposAlterados: [
      { campo: "saldo", anterior: "R$ 180.000,00", novo: "R$ 192.500,00" },
    ],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04804", dataHora: "28/05/2026 16:40:00", entidade: "Nota Fiscal", entidadeId: "#NF-4420",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Cancelamento automático de NF-e 4420 solicitado via portal SEFAZ. Motivo: erro no CNPJ do tomador. Prazo de cancelamento: 24 horas a partir da emissão. Chave cancelada com sucesso.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04803", dataHora: "28/05/2026 10:15:33", entidade: "Fornecedor", entidadeId: "#F-0018",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "Compras",
    descricaoCompleta: "Atualização dos dados bancários do fornecedor Oracle Corp. Nova conta informada pelo fornecedor por e-mail oficial verificado. Dados anteriores mantidos no histórico de segurança.",
    camposAlterados: [
      { campo: "banco", anterior: "Bradesco 0001", novo: "Santander 033" },
      { campo: "agencia", anterior: "1234-5", novo: "0892-0" },
      { campo: "conta", anterior: "00012345-6", novo: "00098765-4" },
    ],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04802", dataHora: "27/05/2026 14:50:11", entidade: "Colaborador", entidadeId: "#COL-0071",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "RH",
    descricaoCompleta: "Atualização salarial do colaborador Fernanda Lima conforme acordo coletivo 2026. Reajuste de 6% sobre o salário base aplicado a partir de 01/06/2026.",
    camposAlterados: [
      { campo: "salario_base", anterior: "R$ 7.500,00", novo: "R$ 7.950,00" },
      { campo: "data_reajuste", anterior: null, novo: "01/06/2026" },
    ],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04801", dataHora: "27/05/2026 11:30:00", entidade: "Venda", entidadeId: "#0035",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Cancelamento da venda #0035 com cliente Empresa Gama após recusa do contrato. Parcelas geradas foram canceladas e comissão revertida. Valor total devolvido: R$ 32.000,00.",
    camposAlterados: [
      { campo: "status", anterior: "Fechada", novo: "Cancelada" },
      { campo: "motivo_cancelamento", anterior: null, novo: "Recusa do cliente após análise jurídica" },
    ],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04800", dataHora: "26/05/2026 16:00:20", entidade: "Despesa", entidadeId: "#8819",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Cancelamento da despesa de manutenção Ar Condicionado #8819. Serviço não realizado por indisponibilidade do fornecedor Clima Tech Ltda. Reagendamento previsto para Julho/2026.",
    camposAlterados: [
      { campo: "status", anterior: "Prevista", novo: "Cancelada" },
      { campo: "motivo_cancelamento", anterior: null, novo: "Indisponibilidade do fornecedor" },
    ],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04799", dataHora: "26/05/2026 14:25:41", entidade: "Parcela", entidadeId: "#9888",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Geração automática de boleto para parcela #9888 vencendo em 05/06/2026. Boleto enviado ao e-mail cadastrado do cliente. Código de barras: 34191.79001 01300.070004.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04798", dataHora: "25/05/2026 09:15:00", entidade: "Cliente", entidadeId: "#C019",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Comercial",
    descricaoCompleta: "Atualização dos dados de contato do cliente Empresa Delta Ltda. Novo responsável comercial informado: Dra. Luciana Rocha, tel: (11) 98888-1234.",
    camposAlterados: [
      { campo: "contato_nome", anterior: "Sr. Marcos Vieira", novo: "Dra. Luciana Rocha" },
      { campo: "contato_telefone", anterior: "(11) 97777-0000", novo: "(11) 98888-1234" },
    ],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04797", dataHora: "23/05/2026 15:00:00", entidade: "Contrato", entidadeId: "#CT-0089",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Alerta automático de vencimento do contrato CT-0089 em 30 dias. Notificação enviada ao gerente de contas Carlos Silva e ao cliente TechBrasil via e-mail.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04796", dataHora: "22/05/2026 11:45:09", entidade: "Nota Fiscal", entidadeId: "#NF-4419",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Emissão de nota fiscal complementar NF-e 4419 referente a ajuste de valor da venda #0034. Diferença de R$ 1.200,00 lançada após revisão do contrato.",
    camposAlterados: [],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04795", dataHora: "21/05/2026 16:30:00", entidade: "Comissão", entidadeId: "#COM-0221",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Pagamento de comissão mensal referente a Abril/2026 para 8 colaboradores. Valor total pago: R$ 14.280,00. Transferências processadas via lote bancário.",
    camposAlterados: [
      { campo: "status_lote", anterior: "Pendente", novo: "Processado" },
    ],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04794", dataHora: "20/05/2026 14:00:00", entidade: "Venda", entidadeId: "#0034",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Atualização do status da venda #0034 para 'Em Negociação'. Proposta revisada enviada ao cliente Construtora Horizonte com desconto de 5% aprovado pela diretoria.",
    camposAlterados: [
      { campo: "status", anterior: "Proposta", novo: "Negociação" },
      { campo: "desconto", anterior: "0%", novo: "5%" },
      { campo: "valor_negociado", anterior: "R$ 25.000,00", novo: "R$ 23.750,00" },
    ],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04793", dataHora: "19/05/2026 09:30:00", entidade: "Conta Financeira", entidadeId: "#CF-012",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Importação automática de extrato bancário Nubank PJ — 28 novos lançamentos identificados. 25 conciliados automaticamente, 3 aguardando classificação manual.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04792", dataHora: "18/05/2026 11:10:00", entidade: "Fornecedor", entidadeId: "#F-0017",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "Compras",
    descricaoCompleta: "Inativação do fornecedor Meta Ads por inadimplência. Três faturas em aberto totalizando R$ 8.400,00. Conta bloqueada até regularização. Advogado notificado para procedimento de cobrança.",
    camposAlterados: [
      { campo: "status", anterior: "Ativo", novo: "Inativo" },
      { campo: "motivo_inativacao", anterior: null, novo: "Inadimplência — faturas em aberto" },
    ],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04791", dataHora: "16/05/2026 16:55:00", entidade: "Parcela", entidadeId: "#9870",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Renegociação da parcela #9870 com novo vencimento e acréscimo de multa e juros de mora. Cliente TechBrasil S.A. assinou termo de renegociação em 15/05/2026.",
    camposAlterados: [
      { campo: "vencimento", anterior: "10/05/2026", novo: "25/06/2026" },
      { campo: "valor", anterior: "R$ 5.000,00", novo: "R$ 5.350,00" },
      { campo: "status", anterior: "Vencida", novo: "Renegociada" },
    ],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04790", dataHora: "15/05/2026 10:00:00", entidade: "Cliente", entidadeId: "#C021",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Cadastro do novo cliente Logística Express Ltda. CNPJ: 12.345.678/0001-90. Limite de crédito aprovado: R$ 50.000,00. Segmento: Logística e Transporte.",
    camposAlterados: [],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04789", dataHora: "14/05/2026 15:40:00", entidade: "Despesa", entidadeId: "#8818",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Lembrete automático de vencimento da despesa #8818 (Material de Escritório) em 3 dias. Notificação enviada ao responsável Rafael Mendes via e-mail e sistema.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04788", dataHora: "13/05/2026 14:20:00", entidade: "Colaborador", entidadeId: "#COL-0083",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "RH",
    descricaoCompleta: "Admissão do novo colaborador Lucas Martins na função de Analista de Dados. Salário inicial: R$ 6.500,00. Período de experiência: 45 dias. Início: 13/05/2026.",
    camposAlterados: [],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04787", dataHora: "12/05/2026 09:00:00", entidade: "Contrato", entidadeId: "#CT-0092",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Assinatura e ativação do novo contrato CT-0092 com Logística Express Ltda. Produto: Módulo Financeiro Standard. Valor: R$ 36.000,00 anuais. Parcelas: 12x R$ 3.000,00.",
    camposAlterados: [],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04786", dataHora: "10/05/2026 16:10:00", entidade: "Nota Fiscal", entidadeId: "#NF-4418",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Emissão de NF-e 4418 referente à venda #0033. Valor total: R$ 18.500,00. Serviço de implementação de software. Aprovada pela SEFAZ em menos de 2 minutos.",
    camposAlterados: [],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04785", dataHora: "08/05/2026 11:30:00", entidade: "Venda", entidadeId: "#0033",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Fechamento da venda #0033 com Empresa Beta Ltda. Produto: Integração API Avançada. Valor: R$ 18.500,00. Prazo: 60 dias. Parcelas geradas: 3x R$ 6.166,67.",
    camposAlterados: [],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04784", dataHora: "07/05/2026 14:00:00", entidade: "Comissão", entidadeId: "#COM-0219",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Cálculo automático de comissões do período Abril/2026 finalizado. 12 colaboradores incluídos, valor total provisionado: R$ 21.840,00. Aguarda aprovação do financeiro.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04783", dataHora: "05/05/2026 10:45:00", entidade: "Conta Financeira", entidadeId: "#CF-011",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Transferência de R$ 80.000,00 entre contas Itaú Business e BTG Pactual para cobertura de investimentos de curto prazo. Aprovação dupla obtida conforme política financeira interna.",
    camposAlterados: [
      { campo: "saldo_itau", anterior: "R$ 320.000,00", novo: "R$ 240.000,00" },
      { campo: "saldo_btg", anterior: "R$ 150.000,00", novo: "R$ 230.000,00" },
    ],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04782", dataHora: "03/05/2026 15:20:00", entidade: "Despesa", entidadeId: "#8817",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Pagamento do salário equipe Dev referente a Abril/2026. 8 colaboradores. Transferência via lote bancário processada com sucesso. Comprovantes emitidos e arquivados.",
    camposAlterados: [
      { campo: "status", anterior: "Pendente", novo: "Paga" },
      { campo: "data_pagamento", anterior: null, novo: "03/05/2026" },
    ],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04781", dataHora: "02/05/2026 09:15:00", entidade: "Fornecedor", entidadeId: "#F-0016",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "Compras",
    descricaoCompleta: "Avaliação trimestral do fornecedor Google Workspace concluída. Score de desempenho: 9.2/10. Renovação do contrato de serviços recomendada para mais 12 meses.",
    camposAlterados: [
      { campo: "score_desempenho", anterior: "8.8", novo: "9.2" },
      { campo: "data_avaliacao", anterior: null, novo: "02/05/2026" },
    ],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04780", dataHora: "30/04/2026 17:00:00", entidade: "Parcela", entidadeId: "#9850",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Relatório mensal de parcelas gerado automaticamente para Abril/2026. Total de parcelas no período: 148. Recebidas: 112 (R$ 340.200,00). Em aberto: 36 (R$ 98.500,00).",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04779", dataHora: "29/04/2026 14:00:00", entidade: "Venda", entidadeId: "#0032",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Proposta enviada ao prospecto Distribuidora Nordeste Ltda para implantação do módulo de gestão de estoque. Valor: R$ 42.000,00. Prazo de retorno esperado: 10 dias úteis.",
    camposAlterados: [],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04778", dataHora: "28/04/2026 11:00:00", entidade: "Colaborador", entidadeId: "#COL-0055",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "RH",
    descricaoCompleta: "Atualização do cargo do colaborador Beatriz Santos de Analista Jr para Analista Pleno após avaliação semestral. Aumento salarial de 12% aplicado conforme política de progressão.",
    camposAlterados: [
      { campo: "cargo", anterior: "Analista Jr", novo: "Analista Pleno" },
      { campo: "salario_base", anterior: "R$ 4.200,00", novo: "R$ 4.704,00" },
    ],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Filial RJ",
  },
  {
    id: "04777", dataHora: "27/04/2026 09:30:00", entidade: "Contrato", entidadeId: "#CT-0088",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Aditamento de contrato CT-0088 com Empresa Alpha com ampliação de escopo. Inclusão de módulo de relatórios avançados. Valor adicional: R$ 15.000,00 sem licitação de mercado.",
    camposAlterados: [
      { campo: "valor_total", anterior: "R$ 60.000,00", novo: "R$ 75.000,00" },
      { campo: "escopo", anterior: "Módulo base", novo: "Módulo base + Relatórios avançados" },
    ],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04776", dataHora: "25/04/2026 16:00:00", entidade: "Nota Fiscal", entidadeId: "#NF-4417",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "DAS Simples Nacional gerado automaticamente para competência Março/2026. Valor apurado: R$ 4.218,90. Prazo de pagamento: 20/04/2026. Alerta: data já ultrapassada, verificar regularização.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04775", dataHora: "24/04/2026 14:30:00", entidade: "Comissão", entidadeId: "#COM-0218",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Aprovação da régua de comissões para o segundo trimestre de 2026. Porcentagens revisadas: 5% a 8% conforme faixa de performance. Aprovação obtida em reunião de diretoria.",
    camposAlterados: [
      { campo: "regua_comissao_q2", anterior: "4%-7%", novo: "5%-8%" },
      { campo: "data_vigencia", anterior: null, novo: "01/04/2026" },
    ],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04774", dataHora: "22/04/2026 10:00:00", entidade: "Conta Financeira", entidadeId: "#CF-010",
    tipoEvento: "Automático", automatico: true,
    usuario: "Sistema", usuarioId: "0", usuarioDept: "Fluxo Automático",
    descricaoCompleta: "Fechamento automático do período financeiro Março/2026. Saldo consolidado de todas as contas: R$ 623.441,80. Relatório de DRE preliminar disponibilizado no módulo financeiro.",
    camposAlterados: [],
    ip: "10.0.0.1", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04773", dataHora: "20/04/2026 15:45:00", entidade: "Despesa", entidadeId: "#8816",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Aprovação e pagamento da campanha Google Ads Q2/2026. Valor: R$ 4.800,00. Pagamento via cartão corporativo BTG. Comprovante registrado. Meta de leads: 120/mês.",
    camposAlterados: [
      { campo: "status", anterior: "Prevista", novo: "Paga" },
      { campo: "data_pagamento", anterior: null, novo: "20/04/2026" },
      { campo: "forma_pagamento", anterior: null, novo: "Cartão Corporativo BTG" },
    ],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  // Additional non-automatic events within last 30 days to ensure 50+ visible records
  {
    id: "04772", dataHora: "19/05/2026 11:00:00", entidade: "Venda", entidadeId: "#0031",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Atualização da proposta comercial para cliente Distribuidora Central Ltda. Revisão de escopo incluindo módulo mobile. Valor ajustado para R$ 38.500,00.",
    camposAlterados: [{ campo: "valor_proposta", anterior: "R$ 35.000,00", novo: "R$ 38.500,00" }],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04771", dataHora: "19/05/2026 09:20:00", entidade: "Parcela", entidadeId: "#9865",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Confirmação de recebimento da parcela #9865 referente ao contrato CT-0087. Depósito identificado via extrato Itaú Business. Baixa manual realizada após conferência.",
    camposAlterados: [{ campo: "status", anterior: "Pendente", novo: "Pago" }, { campo: "data_recebimento", anterior: null, novo: "19/05/2026" }],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04770", dataHora: "17/05/2026 14:00:00", entidade: "Nota Fiscal", entidadeId: "#NF-4416",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Emissão de NF-e 4416 para TechBrasil S.A. referente à mensalidade de Maio/2026. Valor: R$ 8.200,00. Chave autorizada pela SEFAZ em 2 minutos.",
    camposAlterados: [],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04769", dataHora: "17/05/2026 10:30:00", entidade: "Comissão", entidadeId: "#COM-0220",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Lançamento de comissão antecipada para vendedor Rodrigo Alves referente ao fechamento da venda #0033 no mês de Maio. Adiantamento de R$ 720,00 aprovado pelo gestor.",
    camposAlterados: [{ campo: "valor_adiantamento", anterior: "0.00", novo: "720.00" }, { campo: "status", anterior: "Pendente", novo: "Liberada" }],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04768", dataHora: "14/05/2026 16:45:00", entidade: "Fornecedor", entidadeId: "#F-0015",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "Compras",
    descricaoCompleta: "Renovação do contrato de prestação de serviços com Amazon Web Services por mais 12 meses. Desconto de 8% negociado sobre o valor anterior. Novo valor: R$ 5.704,00/mês.",
    camposAlterados: [{ campo: "valor_contrato", anterior: "R$ 6.200,00", novo: "R$ 5.704,00" }, { campo: "data_fim", anterior: "30/06/2026", novo: "30/06/2027" }],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04767", dataHora: "11/05/2026 11:15:00", entidade: "Despesa", entidadeId: "#8815",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Pagamento da licença Oracle Database referente a Março/2026. Comprovante de transferência bancária anexado. Conta debitada: Nubank PJ Principal. Número do pedido: ORD-2026-0312.",
    camposAlterados: [{ campo: "status", anterior: "Paga", novo: "Conciliada" }],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04766", dataHora: "09/05/2026 15:00:00", entidade: "Contrato", entidadeId: "#CT-0086",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Renovação do contrato CT-0086 com Empresa Beta Ltda por 6 meses adicionais. Valor reajustado pelo IGPM de 5,1%. Assinatura digital realizada via DocuSign.",
    camposAlterados: [{ campo: "data_fim", anterior: "30/06/2026", novo: "31/12/2026" }, { campo: "valor_mensal", anterior: "R$ 4.200,00", novo: "R$ 4.414,20" }],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04765", dataHora: "07/05/2026 09:40:00", entidade: "Cliente", entidadeId: "#C020",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Bloqueio temporário do cliente Empresa Gama por inadimplência. Três parcelas em atraso totalizando R$ 28.500,00. Serviços suspensos até regularização. Notificação enviada ao responsável.",
    camposAlterados: [{ campo: "status", anterior: "Ativo", novo: "Bloqueado" }, { campo: "motivo_bloqueio", anterior: null, novo: "Inadimplência — 3 parcelas em atraso" }],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04764", dataHora: "06/05/2026 14:30:00", entidade: "Colaborador", entidadeId: "#COL-0077",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "RH",
    descricaoCompleta: "Registro de férias do colaborador Paulo Henrique — 15 dias a partir de 19/05/2026. Solicitação aprovada pelo gestor Financeiro. Backup designado: Mariana Costa.",
    camposAlterados: [{ campo: "status_ferias", anterior: "Solicitado", novo: "Aprovado" }, { campo: "data_inicio_ferias", anterior: null, novo: "19/05/2026" }],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04763", dataHora: "04/05/2026 11:00:00", entidade: "Nota Fiscal", entidadeId: "#NF-4415",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Emissão de NF-e 4415 para Construtora Horizonte — mensalidade Abril/2026. Valor: R$ 11.000,00. Nota emitida com 5 dias de atraso por solicitação do cliente.",
    camposAlterados: [],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04762", dataHora: "30/05/2026 09:00:00", entidade: "Venda", entidadeId: "#0039",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Prospecção convertida: novo lead Agência Digital SpeedUp virou oportunidade qualificada. Reunião técnica agendada para 05/06/2026. Estimativa de contrato: R$ 28.000,00 anuais.",
    camposAlterados: [],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04761", dataHora: "28/05/2026 15:30:00", entidade: "Parcela", entidadeId: "#9895",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Registro de parcela como devedora duvidosa (#9895). Valor: R$ 18.400,00. Prazo de vencimento ultrapassado em 60 dias sem resposta do cliente. Encaminhado para cobrança jurídica.",
    camposAlterados: [{ campo: "classificacao", anterior: "Normal", novo: "Devedora Duvidosa" }, { campo: "data_encaminhamento", anterior: null, novo: "28/05/2026" }],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04760", dataHora: "26/05/2026 11:00:00", entidade: "Comissão", entidadeId: "#COM-0222",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Ajuste de comissão da vendedora Amanda Rocha após revisão de contrato de venda #0036. Porcentagem mantida em 6%, mas base de cálculo atualizada com novo valor negociado.",
    camposAlterados: [{ campo: "base_calculo", anterior: "R$ 23.000,00", novo: "R$ 23.750,00" }, { campo: "valor_comissao", anterior: "R$ 1.380,00", novo: "R$ 1.425,00" }],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04759", dataHora: "24/05/2026 16:00:00", entidade: "Fornecedor", entidadeId: "#F-0014",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "Compras",
    descricaoCompleta: "Cadastro do novo fornecedor Assessoria Contábil Plus Ltda. CNPJ: 98.765.432/0001-10. Serviços: contabilidade e obrigações acessórias. Contrato mensal de R$ 3.200,00.",
    camposAlterados: [],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04758", dataHora: "22/05/2026 09:00:00", entidade: "Despesa", entidadeId: "#8825",
    tipoEvento: "Normal", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Lançamento de nova despesa: Assessoria Contábil Plus — Maio/2026. Valor: R$ 3.200,00. Vencimento: 30/05/2026. Centro de custo: Administrativo.",
    camposAlterados: [],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04757", dataHora: "20/05/2026 10:00:00", entidade: "Contrato", entidadeId: "#CT-0093",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Proposta de contrato CT-0093 enviada para análise jurídica interna. Cliente: RapidLog Transportes. Prazo de resposta: 7 dias úteis. Valor estimado: R$ 54.000,00 anuais.",
    camposAlterados: [{ campo: "status", anterior: "Em Elaboração", novo: "Em Análise Jurídica" }],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04756", dataHora: "11/05/2026 09:00:00", entidade: "Colaborador", entidadeId: "#COL-0084",
    tipoEvento: "Normal", automatico: false,
    usuario: "Ana Ferreira", usuarioId: "612", usuarioDept: "RH",
    descricaoCompleta: "Registro de treinamento concluído pela colaboradora Isabela Torres — Certificação Salesforce Admin. Custo: R$ 1.800,00 (reembolsado pela empresa). Vigência do certificado: 2 anos.",
    camposAlterados: [{ campo: "certificacoes", anterior: "Nenhuma", novo: "Salesforce Admin (05/2026)" }],
    ip: "192.168.1.201", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04755", dataHora: "06/05/2026 09:00:00", entidade: "Venda", entidadeId: "#0030",
    tipoEvento: "Normal", automatico: false,
    usuario: "Carlos Silva", usuarioId: "442", usuarioDept: "Comercial",
    descricaoCompleta: "Venda #0030 reativada após cliente RapidLog Transportes retomar contato. Proposta anterior de Março/2026 reanalisada. Nova reunião agendada para 12/05/2026.",
    camposAlterados: [{ campo: "status", anterior: "Fria", novo: "Em Negociação" }, { campo: "responsavel", anterior: "Amanda Rocha", novo: "Carlos Silva" }],
    ip: "192.168.1.142", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04754", dataHora: "05/05/2026 14:00:00", entidade: "Nota Fiscal", entidadeId: "#NF-4414",
    tipoEvento: "Ação Crítica", automatico: false,
    usuario: "Rafael Mendes", usuarioId: "305", usuarioDept: "Financeiro",
    descricaoCompleta: "Cancelamento de NF-e 4414 após identificação de erro no valor da base de cálculo de ISS. Diferença de R$ 480,00. Nova nota será emitida com valores corrigidos. Prazo: 24h.",
    camposAlterados: [{ campo: "status_nfe", anterior: "Autorizada", novo: "Cancelada" }, { campo: "motivo_cancelamento", anterior: null, novo: "Erro no valor de ISS" }],
    ip: "192.168.1.55", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04753", dataHora: "04/05/2026 09:30:00", entidade: "Cliente", entidadeId: "#C018",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Comercial",
    descricaoCompleta: "Reativação do cliente Grupo Sigma S.A. após período inativo de 90 dias. Novo contato comercial estabelecido. Pipeline reaberto com oportunidade de expansão de contrato existente.",
    camposAlterados: [{ campo: "status", anterior: "Inativo", novo: "Ativo" }, { campo: "data_reativacao", anterior: null, novo: "04/05/2026" }],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
  {
    id: "04752", dataHora: "02/05/2026 15:45:00", entidade: "Conta Financeira", entidadeId: "#CF-009",
    tipoEvento: "Normal", automatico: false,
    usuario: "Mariana Costa", usuarioId: "881", usuarioDept: "Financeiro",
    descricaoCompleta: "Abertura de nova conta bancária BTG Pactual para operações de investimento de curto prazo. Documentação enviada ao gerente de relacionamento. Previsão de liberação: 5 dias úteis.",
    camposAlterados: [],
    ip: "192.168.1.88", empresa: "Optsolv Corp", filial: "Matriz SP",
  },
];

const TOTAL_REGISTROS = 1284;
const PAGE_SIZE = 50;

// ─── Mocked permissions (respects historico/exportar permission structure) ────
const MOCK_PERMISSOES: Record<string, boolean> = {
  "historico/exportar": true,
  "historico/visualizar": true,
};
function hasPermissao(perm: string): boolean {
  return MOCK_PERMISSOES[perm] ?? false;
}

// ─── Entity badge config ──────────────────────────────────────────────────────
const ENTITY_BADGE: Record<EntidadeTipo, { bg: string; color: string }> = {
  "Venda":           { bg: "#DBEAFE", color: "#1D4ED8" },
  "Parcela":         { bg: "#CCFBF1", color: "#0F766E" },
  "Despesa":         { bg: "#FEF9C3", color: "#92400E" },
  "Contrato":        { bg: "#EDE9FE", color: "#6D28D9" },
  "Comissão":        { bg: "#DCFCE7", color: "#15803D" },
  "Conta Financeira":{ bg: "#F3F4F6", color: "#374151" },
  "Cliente":         { bg: "#FCE7F3", color: "#9D174D" },
  "Colaborador":     { bg: "#FFF7ED", color: "#C2410C" },
  "Fornecedor":      { bg: "#F0FDF4", color: "#166534" },
  "Nota Fiscal":     { bg: "#F0F9FF", color: "#0369A1" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "..." : s;
}

function getDefaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
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
                  const active = item.href === "/historico";
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

function ToastStack({ toasts, onDismiss }: { toasts: ToastMsg[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="pointer-events-auto flex items-center gap-3 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl cursor-pointer"
          onClick={() => onDismiss(t.id)}
        >
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Entity Badge ─────────────────────────────────────────────────────────────
function EntityBadge({ tipo }: { tipo: EntidadeTipo }) {
  const s = ENTITY_BADGE[tipo];
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}>
      {tipo}
    </span>
  );
}

// ─── Tipo Evento Badge ────────────────────────────────────────────────────────
function TipoBadge({ tipo }: { tipo: TipoEvento }) {
  if (tipo === "Ação Crítica") {
    return (
      <span className="flex items-center gap-1 text-red-600 font-bold text-[10px] uppercase whitespace-nowrap">
        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
        Ação Crítica
      </span>
    );
  }
  if (tipo === "Automático") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap"
        style={{ background: "#F3F4F6", color: "#6B7280" }}>
        Sistema
      </span>
    );
  }
  return <span className="text-[10px] text-gray-500 font-medium">Normal</span>;
}

// ─── Active Filter Chip ───────────────────────────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: "rgba(249,115,22,0.12)", color: C.primaryCont }}>
      {label}
      <button onClick={onRemove} className="hover:text-orange-800 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Historico() {
  const defaultRange = getDefaultDateRange();

  // Filters
  const [filterFrom, setFilterFrom] = useState(defaultRange.from);
  const [filterTo, setFilterTo] = useState(defaultRange.to);
  const [filterBusca, setFilterBusca] = useState("");
  const [filterEntidade, setFilterEntidade] = useState<EntidadeTipo | "">("");
  const [filterTipo, setFilterTipo] = useState<TipoEvento | "">("");
  const [filterUsuario, setFilterUsuario] = useState("");
  const [showAutomatico, setShowAutomatico] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Active tab
  const [tab, setTab] = useState<"historico" | "recente" | "pesquisados">("historico");

  // Selected event for detail modal
  const [selectedEvento, setSelectedEvento] = useState<EventoHistorico | null>(null);

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("CSV");

  // Toast
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [nextToastId, setNextToastId] = useState(1);
  const [exportEvents, setExportEvents] = useState<EventoHistorico[]>([]);

  const addToast = useCallback((msg: string) => {
    const id = nextToastId;
    setNextToastId(n => n + 1);
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, [nextToastId]);

  // Computed filtered events
  const filteredEvents = useMemo(() => {
    let evts = [...MOCK_EVENTOS, ...exportEvents];
    if (!showAutomatico) evts = evts.filter(e => !e.automatico);
    if (filterEntidade) evts = evts.filter(e => e.entidade === filterEntidade);
    if (filterTipo) evts = evts.filter(e => e.tipoEvento === filterTipo);
    if (filterUsuario.trim()) {
      const q = filterUsuario.toLowerCase();
      evts = evts.filter(e => e.usuario.toLowerCase().includes(q));
    }
    if (filterBusca.trim()) {
      const q = filterBusca.toLowerCase();
      evts = evts.filter(e =>
        e.descricaoCompleta.toLowerCase().includes(q) ||
        e.entidade.toLowerCase().includes(q) ||
        e.usuario.toLowerCase().includes(q) ||
        e.entidadeId.toLowerCase().includes(q)
      );
    }
    // Date range filter — dataHora format: "DD/MM/YYYY HH:mm:ss"
    if (filterFrom || filterTo) {
      evts = evts.filter(e => {
        const parts = e.dataHora.split(" ")[0].split("/"); // [DD, MM, YYYY]
        const evtIso = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
        if (filterFrom && evtIso < filterFrom) return false;
        if (filterTo && evtIso > filterTo) return false;
        return true;
      });
    }
    return evts;
  }, [showAutomatico, filterEntidade, filterTipo, filterUsuario, filterBusca, filterFrom, filterTo, exportEvents]);

  const displayTotal = filteredEvents.length;
  const totalPages = Math.max(1, Math.ceil(displayTotal / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageEvents = filteredEvents.slice(pageStart, pageStart + PAGE_SIZE);

  // Active filter chips
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (filterEntidade) activeChips.push({ label: `Entidade: ${filterEntidade}`, onRemove: () => setFilterEntidade("") });
  if (filterTipo) activeChips.push({ label: `Tipo: ${filterTipo}`, onRemove: () => setFilterTipo("") });
  if (filterUsuario) activeChips.push({ label: `Usuário: ${filterUsuario}`, onRemove: () => setFilterUsuario("") });
  if (filterBusca) activeChips.push({ label: `Busca: "${filterBusca}"`, onRemove: () => setFilterBusca("") });
  if (filterFrom !== defaultRange.from || filterTo !== defaultRange.to) {
    activeChips.push({ label: `Período: ${fmtDate(filterFrom)} – ${fmtDate(filterTo)}`, onRemove: () => { setFilterFrom(defaultRange.from); setFilterTo(defaultRange.to); } });
  }

  function clearAllFilters() {
    setFilterEntidade("");
    setFilterTipo("");
    setFilterUsuario("");
    setFilterBusca("");
    setFilterFrom(defaultRange.from);
    setFilterTo(defaultRange.to);
    setPage(1);
  }

  function handleExportConfirm() {
    const count = filteredEvents.length;
    const dateStr = new Date().toISOString().slice(0, 10);

    if (exportFormat === "PDF") {
      // Generate HTML-based print document as PDF
      const rows = filteredEvents.map(e =>
        `<tr>
          <td style="padding:6px 8px;font-size:11px;font-family:monospace;white-space:nowrap">#H${e.id}</td>
          <td style="padding:6px 8px;font-size:11px;font-family:monospace;white-space:nowrap">${e.dataHora}</td>
          <td style="padding:6px 8px;font-size:11px">${e.entidade} ${e.entidadeId}</td>
          <td style="padding:6px 8px;font-size:11px;color:${e.tipoEvento === "Ação Crítica" ? "#dc2626" : "#374151"}">${e.tipoEvento}</td>
          <td style="padding:6px 8px;font-size:11px">${e.usuario} (ID: ${e.usuarioId})</td>
          <td style="padding:6px 8px;font-size:11px;max-width:300px">${e.descricaoCompleta.slice(0, 120)}${e.descricaoCompleta.length > 120 ? "..." : ""}</td>
        </tr>`
      ).join("");
      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
        <title>Histórico — Optsolv ERP — ${dateStr}</title>
        <style>body{font-family:Inter,sans-serif;padding:32px;color:#141b2b}h1{font-size:20px;margin-bottom:4px}p{font-size:12px;color:#575e70;margin:0 0 20px}table{width:100%;border-collapse:collapse}th{background:#f1f3ff;padding:8px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;text-align:left}tr:nth-child(even){background:#f9f9ff}td{border-bottom:1px solid #f1f3ff}footer{margin-top:24px;font-size:10px;color:#9ca3af;text-align:center}</style>
        </head><body>
        <h1>Histórico — Audit Trail</h1>
        <p>Optsolv Corp · Exportado em ${dateStr} · ${count} registros</p>
        <table><thead><tr><th>ID</th><th>Data/Hora</th><th>Entidade</th><th>Tipo Evento</th><th>Usuário</th><th>Descrição</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <footer>ESTE REGISTRO NÃO PODE SER EDITADO OU EXCLUÍDO. — Optsolv ERP Precision Architect</footer>
        </body></html>`;
      const blob = new Blob([html], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `historico_${dateStr}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Generate CSV blob
      const headers = ["ID", "Data/Hora", "Entidade", "Entidade ID", "Tipo Evento", "Usuário", "Descrição"];
      const rows = filteredEvents.map(e => [
        `#H${e.id}`, e.dataHora, e.entidade, e.entidadeId, e.tipoEvento, `${e.usuario} (ID: ${e.usuarioId})`,
        `"${e.descricaoCompleta.replace(/"/g, '""')}"`,
      ]);
      const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `historico_${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Register export event in history
    const exportEvt: EventoHistorico = {
      id: String(Date.now()),
      dataHora: new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(",", ""),
      entidade: "Conta Financeira",
      entidadeId: "—",
      tipoEvento: "Normal",
      automatico: false,
      usuario: "Admin Optsolv",
      usuarioId: "1",
      usuarioDept: "Sistema",
      descricaoCompleta: `Exportação do histórico realizada pelo usuário Admin Optsolv. Formato: ${exportFormat}. Registros exportados: ${count}. Filtros aplicados: ${activeChips.map(c => c.label).join("; ") || "Nenhum"}.`,
      camposAlterados: [],
      ip: "192.168.1.1",
      empresa: "Optsolv Corp",
      filial: "Matriz SP",
    };
    setExportEvents(prev => [exportEvt, ...prev]);

    setShowExportModal(false);
    addToast(`Histórico exportado com sucesso (${count} registros)`);
  }

  return (
    <div className="min-h-screen" style={{ background: "#f9f9ff", fontFamily: "Inter, sans-serif" }}>
      <Sidebar />

      {/* Main content */}
      <div className="ml-[220px] min-h-screen flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 h-16"
          style={{ background: "#F3F4F6", borderBottom: `1px solid ${C.outlineVar}` }}>
          <div className="flex items-center gap-8">
            <span className="font-bold text-lg" style={{ color: C.onBg }}>Audit Trail</span>
            <nav className="flex items-center gap-6">
              {([
                ["historico", "Histórico"],
                ["recente", "Recente"],
                ["pesquisados", "Mais Pesquisados"],
              ] as const).map(([key, label]) => (
                <button key={key}
                  onClick={() => setTab(key)}
                  className={`text-sm font-medium pb-1 transition-all ${
                    tab === key
                      ? "font-bold border-b-2"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                  style={tab === key ? { color: C.primaryCont, borderColor: C.primaryCont } : {}}>
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center rounded-lg px-3 py-1.5 w-56"
              style={{ background: "rgba(255,255,255,0.6)" }}>
              <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input className="bg-transparent border-none outline-none text-sm w-full"
                placeholder="Busca global..." readOnly />
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #F97316, #9D4300)" }}>
              OA
            </div>
          </div>
        </header>

        {/* Page content */}
        {tab !== "historico" ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center space-y-2">
              <History className="w-12 h-12 mx-auto" style={{ color: C.outlineVar }} />
              <p className="font-semibold" style={{ color: C.secondary }}>
                {tab === "recente" ? "Recente" : "Mais Pesquisados"}
              </p>
              <p className="text-sm text-gray-400">Em desenvolvimento</p>
            </div>
          </div>
        ) : (
          <main className="flex-1 p-8 space-y-6">

            {/* Page Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.onBg }}>Histórico</h1>
                <p className="text-sm mt-0.5" style={{ color: C.secondary }}>Auditoria completa de todas as ações do sistema</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => hasPermissao("historico/exportar") && setShowExportModal(true)}
                  disabled={!hasPermissao("historico/exportar")}
                  title={hasPermissao("historico/exportar") ? "Exportar histórico" : "Sem permissão: historico/exportar"}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    border: `1px solid ${C.outlineVar}`,
                    color: hasPermissao("historico/exportar") ? C.onBg : "#9CA3AF",
                    background: "transparent",
                    cursor: hasPermissao("historico/exportar") ? "pointer" : "not-allowed",
                    opacity: hasPermissao("historico/exportar") ? 1 : 0.5,
                  }}>
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-gray-100"
                  style={{ color: C.secondary }}>
                  <Filter className="w-4 h-4" /> Filtrar
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "#E5E7EB", borderLeft: `4px solid #9CA3AF` }}>
              <Info className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">
                O histórico é somente leitura e não pode ser editado ou excluído. Eventos automáticos são ocultados por padrão. Use os filtros para uma busca precisa.
              </p>
            </div>

            {/* Filter bar */}
            <div className="rounded-xl p-6 shadow-sm space-y-5" style={{ background: C.surfLowest }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Período De */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Período De</label>
                  <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(1); }}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
                    style={{ background: C.surfLow, border: "none" }} />
                </div>
                {/* Período Até */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Período Até</label>
                  <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(1); }}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
                    style={{ background: C.surfLow, border: "none" }} />
                </div>
                {/* Busca */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Busca Textual</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="search" placeholder="Descrição, entidade, usuário..."
                      value={filterBusca} onChange={e => { setFilterBusca(e.target.value); setPage(1); }}
                      className="w-full rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2"
                      style={{ background: C.surfLow, border: "none" }} />
                  </div>
                </div>
                {/* Entidade */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Entidade</label>
                  <select value={filterEntidade} onChange={e => { setFilterEntidade(e.target.value as EntidadeTipo | ""); setPage(1); }}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 cursor-pointer"
                    style={{ background: C.surfLow, border: "none" }}>
                    <option value="">Todas</option>
                    {(["Venda","Parcela","Despesa","Contrato","Comissão","Conta Financeira","Cliente","Colaborador","Fornecedor","Nota Fiscal"] as EntidadeTipo[]).map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                {/* Tipo Evento */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Tipo de Evento</label>
                  <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value as TipoEvento | ""); setPage(1); }}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 cursor-pointer"
                    style={{ background: C.surfLow, border: "none" }}>
                    <option value="">Todos</option>
                    <option value="Normal">Normal</option>
                    <option value="Ação Crítica">Ação Crítica</option>
                    <option value="Automático">Automático</option>
                  </select>
                </div>
                {/* Usuário */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Usuário</label>
                  <input type="text" placeholder="Nome do usuário..."
                    value={filterUsuario} onChange={e => { setFilterUsuario(e.target.value); setPage(1); }}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
                    style={{ background: C.surfLow, border: "none" }} />
                </div>
                {/* Toggle automático */}
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      role="switch"
                      aria-checked={showAutomatico}
                      onClick={() => setShowAutomatico(v => !v)}
                      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
                      style={{ background: showAutomatico ? C.primaryCont : "#D1D5DB" }}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${showAutomatico ? "translate-x-[18px]" : "translate-x-1"}`} />
                    </button>
                    <span className="text-sm text-gray-600 font-medium">Mostrar eventos automáticos</span>
                  </label>
                </div>
              </div>

              {/* Active chips + actions */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${C.surfLow}` }}>
                <div className="flex flex-wrap gap-2">
                  {activeChips.map((chip, i) => (
                    <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
                  ))}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {activeChips.length > 0 && (
                    <button onClick={clearAllFilters}
                      className="text-sm font-semibold hover:underline"
                      style={{ color: C.primary }}>
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results summary */}
            <div className="flex justify-between items-center px-4 py-2.5 rounded-lg" style={{ background: "#F3F4F6" }}>
              <span className="text-xs text-gray-500 font-medium">
                Exibindo <span className="font-bold text-gray-800">{pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, displayTotal)}</span> de{" "}
                <span className="font-bold text-gray-800">{displayTotal.toLocaleString("pt-BR")}</span> eventos |{" "}
                Ordenado por: <span className="font-bold text-gray-800">Mais recente primeiro</span>
              </span>
              <span className="text-[10px] text-gray-400 italic uppercase tracking-wider">Somente leitura</span>
            </div>

            {/* Data table */}
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: C.surfLowest }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead style={{ background: C.surfLow }}>
                    <tr>
                      {["Data/Hora", "Entidade", "Tipo de Evento", "Usuário", "Descrição", ""].map(h => (
                        <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                          Nenhum evento encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    ) : pageEvents.map(evt => (
                      <tr key={evt.id}
                        onClick={() => setSelectedEvento(evt)}
                        className="cursor-pointer transition-colors border-b group"
                        style={{
                          borderColor: C.surfLow,
                          background: evt.tipoEvento === "Ação Crítica" ? "#FFF5F5" : "transparent",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = evt.tipoEvento === "Ação Crítica" ? "#FFE4E4" : "#FFF7ED")}
                        onMouseLeave={e => (e.currentTarget.style.background = evt.tipoEvento === "Ação Crítica" ? "#FFF5F5" : "transparent")}
                      >
                        <td className="px-5 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">{evt.dataHora}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <EntityBadge tipo={evt.entidade} />
                            <p className="text-[10px] font-mono text-gray-400">{evt.entidadeId}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <TipoBadge tipo={evt.tipoEvento} />
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold whitespace-nowrap" style={{ color: C.onBg }}>{evt.usuario}</p>
                          <p className="text-[10px] italic text-gray-400">ID: {evt.usuarioId} — {evt.usuarioDept}</p>
                        </td>
                        <td className="px-5 py-4 text-sm max-w-xs" style={{ color: C.secondary }}>
                          {truncate(evt.descricaoCompleta, 80)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button className="p-1.5 rounded-full transition-colors group-hover:bg-orange-50">
                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between px-2 py-3 gap-4">
              <span className="text-sm text-gray-500">
                Página <span className="font-bold" style={{ color: C.onBg }}>{page}</span> de {totalPages} | {PAGE_SIZE} registros por página
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                {[1, 2, 3].map(p => (
                  <button key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors"
                    style={page === p ? { background: C.primary, color: "#fff" } : { color: C.onBg }}
                    onMouseEnter={e => { if (page !== p) (e.currentTarget as HTMLButtonElement).style.background = C.surfContHigh; }}
                    onMouseLeave={e => { if (page !== p) (e.currentTarget as HTMLButtonElement).style.background = ""; }}>
                    {p}
                  </button>
                ))}
                <span className="text-gray-400 mx-1">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors"
                  style={page === totalPages ? { background: C.primary, color: "#fff" } : { color: C.onBg }}
                  onMouseEnter={e => { if (page !== totalPages) (e.currentTarget as HTMLButtonElement).style.background = C.surfContHigh; }}
                  onMouseLeave={e => { if (page !== totalPages) (e.currentTarget as HTMLButtonElement).style.background = ""; }}>
                  {totalPages}
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100">
                  <ChevronRight className="w-5 h-5" style={{ color: C.primaryCont }} />
                </button>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* ─── Event Detail Modal ─────────────────────────────────────────────── */}
      {selectedEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedEvento(null); }}>
          <div className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ background: C.surfLowest, maxHeight: "90vh" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: `1px solid ${C.surfLow}` }}>
              <h3 className="text-lg font-bold" style={{ color: C.onBg }}>
                Detalhe do Evento #H{selectedEvento.id}
              </h3>
              <button onClick={() => setSelectedEvento(null)} className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-7">
              {/* Grid 2 col */}
              <div className="grid grid-cols-2 gap-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Data/Hora</p>
                  <p className="text-sm font-mono" style={{ color: C.onBg }}>{selectedEvento.dataHora}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Entidade</p>
                  <div className="flex items-center gap-2">
                    <EntityBadge tipo={selectedEvento.entidade} />
                    <span className="text-sm font-mono text-gray-500">{selectedEvento.entidadeId}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Tipo de Evento</p>
                  <TipoBadge tipo={selectedEvento.tipoEvento} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Usuário</p>
                  <p className="text-sm font-semibold" style={{ color: C.onBg }}>
                    {selectedEvento.usuario} (ID: {selectedEvento.usuarioId})
                  </p>
                </div>
              </div>

              {/* Descrição completa */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Descrição Completa</p>
                <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: C.surfLow, color: C.secondary }}>
                  {selectedEvento.descricaoCompleta}
                </div>
              </div>

              {/* Campos alterados */}
              {selectedEvento.camposAlterados.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Campos Alterados</p>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.surfLow}` }}>
                    <table className="w-full text-left text-sm">
                      <thead style={{ background: C.surfLow }}>
                        <tr>
                          {["Campo", "Valor Anterior", "Novo Valor"].map(h => (
                            <th key={h} className="px-4 py-2.5 font-bold text-gray-600 text-xs">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEvento.camposAlterados.map((c, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${C.surfLow}` }}>
                            <td className="px-4 py-3 font-medium font-mono text-xs" style={{ color: C.onBg }}>{c.campo}</td>
                            <td className="px-4 py-3 text-xs">
                              {c.anterior === null
                                ? <span className="text-gray-400 italic">null</span>
                                : <span className="text-red-500 font-medium">{c.anterior}</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-green-600">{c.novo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Metadados grid 3 col */}
              <div className="grid grid-cols-3 gap-4 pt-5" style={{ borderTop: `1px solid ${C.surfLow}` }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">IP do Cliente</p>
                  <p className="text-xs font-mono" style={{ color: C.onBg }}>{selectedEvento.ip}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Empresa</p>
                  <p className="text-xs font-medium" style={{ color: C.onBg }}>{selectedEvento.empresa}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Filial</p>
                  <p className="text-xs font-medium" style={{ color: C.onBg }}>{selectedEvento.filial}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-4" style={{ background: C.surfLow }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                ESTE REGISTRO NÃO PODE SER EDITADO OU EXCLUÍDO.
              </span>
              <button
                onClick={() => setSelectedEvento(null)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-gray-100"
                style={{ border: `1px solid ${C.outlineVar}`, color: C.onBg }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Export Modal ────────────────────────────────────────────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowExportModal(false); }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: C.surfLowest }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.surfLow}` }}>
              <h3 className="text-base font-bold" style={{ color: C.onBg }}>Exportar Histórico</h3>
              <button onClick={() => setShowExportModal(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Active filters chips */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Filtros Aplicados</p>
                {activeChips.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Nenhum filtro ativo — exportando todos os registros</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeChips.map((chip, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(249,115,22,0.12)", color: C.primaryCont }}>
                        {chip.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Format selector */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Formato</p>
                <div className="flex gap-3">
                  {(["CSV", "PDF"] as const).map(fmt => (
                    <button key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={exportFormat === fmt
                        ? { background: C.primaryCont, color: "#fff" }
                        : { background: C.surfLow, color: C.secondary, border: `1px solid ${C.outlineVar}` }}>
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Record count */}
              <div className="rounded-lg p-3 text-sm" style={{ background: C.surfLow }}>
                <span className="text-gray-500">Registros a exportar: </span>
                <span className="font-bold" style={{ color: C.onBg }}>{filteredEvents.length}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: `1px solid ${C.surfLow}` }}>
              <button onClick={() => setShowExportModal(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-gray-100"
                style={{ border: `1px solid ${C.outlineVar}`, color: C.secondary }}>
                Cancelar
              </button>
              <button onClick={handleExportConfirm}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${C.primaryCont}, ${C.primary})` }}>
                <Download className="w-4 h-4" /> Confirmar Exportação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast stack */}
      <ToastStack toasts={toasts} onDismiss={id => setToasts(t => t.filter(x => x.id !== id))} />
    </div>
  );
}
