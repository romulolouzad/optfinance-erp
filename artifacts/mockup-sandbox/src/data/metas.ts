/**
 * Metas Comerciais — mock data
 *
 * Projetado breakdown (consistent with vendas/forecast phase mocks):
 *   projetadoAnual = Σ realizado (months with data)
 *                  + vendas ativas ainda não pagas (pipeline aprovado)
 *                  + forecast para meses futuros sem venda ativa
 *
 * These figures are aligned with the vendor/sales/forecast mocks used in
 * prior phases: same vendedores (ids), same revenue scale, same fiscal year.
 */

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const ANO_ATUAL = 2026;
export const MES_ATUAL = 6; // June 2026 (ref date: 2026-06-01)

export interface MetaMensal {
  mes: string;
  metaNum: number;   // 1-12
  meta: number;      // goal for this month
  realizado: number; // approved sales closed in this month
}

export interface VendedorMeta {
  id: string;
  nome: string;
  metaAnual: number;
  /**
   * Projected annual total = realized-to-date + active pipeline + forecast.
   * Sourced from the Vendas & Forecast module mocks (same phase set).
   * - months 1..MES_ATUAL : actual approved-sales totals already in `metas`
   * - months MES_ATUAL+1..12 : active contracts (open parcelas) + forecast model
   */
  projetadoAnual: number;
  metas: MetaMensal[];
}

function buildMetas(anuais: number[], realizados: number[]): MetaMensal[] {
  return MESES.map((mes, i) => ({
    mes,
    metaNum: i + 1,
    meta: anuais[i] ?? 0,
    realizado: realizados[i] ?? 0,
  }));
}

// ─── 2025 (historical — all months realized) ─────────────────────────────────
export const VENDEDORES_2025: VendedorMeta[] = [
  {
    id: "joao", nome: "João Silva",
    metaAnual: 1_080_000,
    projetadoAnual: 1_097_000,  // Σ realizado (fully closed year)
    metas: buildMetas(
      [90000, 90000, 90000,100000,100000, 90000, 90000, 90000, 80000, 80000, 90000, 90000],
      [95000, 88000, 92000, 78000,104000, 91000, 85000, 87000, 80000, 83000, 96000, 98000],
    ),
  },
  {
    id: "maria", nome: "Maria Clara",
    metaAnual: 860_000,
    projetadoAnual: 834_000,
    metas: buildMetas(
      [72000, 72000, 72000, 80000, 80000, 72000, 68000, 68000, 62000, 62000, 72000, 72000],
      [68000, 75000, 70000, 62000, 84000, 73000, 65000, 69000, 60000, 58000, 74000, 76000],
    ),
  },
  {
    id: "ricardo", nome: "Ricardo Alves",
    metaAnual: 1_000_000,
    projetadoAnual: 1_048_000,
    metas: buildMetas(
      [82000, 82000, 82000, 90000, 90000, 82000, 82000, 82000, 76000, 76000, 92000, 92000],
      [88000, 85000, 91000, 95000, 92000, 84000, 80000, 86000, 76000, 78000, 94000, 99000],
    ),
  },
  {
    id: "ana", nome: "Ana Beatriz",
    metaAnual: 720_000,
    projetadoAnual: 726_000,
    metas: buildMetas(
      [60000, 60000, 60000, 68000, 68000, 60000, 58000, 58000, 50000, 50000, 60000, 60000],
      [62000, 55000, 58000, 60000, 70000, 61000, 54000, 56000, 50000, 52000, 63000, 65000],
    ),
  },
];

// ─── 2026 (current — months 1-6 realized, 7-12 from pipeline+forecast) ────────
export const VENDEDORES_2026: VendedorMeta[] = [
  {
    id: "joao", nome: "João Silva",
    metaAnual: 1_200_000,
    // Realized Jan-Jun: 541.000 + active contracts Jul-Dec: 387.000 + forecast: 102.888
    projetadoAnual: 1_030_888,
    metas: buildMetas(
      [100000,100000,100000,120000,120000,100000,100000,100000, 80000, 80000,100000,100000],
      [105000, 82000,112000, 67000, 90000, 85000,      0,      0,     0,     0,     0,     0],
    ),
  },
  {
    id: "maria", nome: "Maria Clara",
    metaAnual: 950_000,
    // Realized: 292.000 + active pipeline: 180.000 + forecast: 79.284
    projetadoAnual: 551_284,
    metas: buildMetas(
      [ 80000, 80000, 80000, 90000, 90000, 80000, 75000, 75000, 70000, 70000, 80000, 80000],
      [ 72000, 45000, 38000, 27000, 60000, 50000,     0,     0,     0,     0,     0,     0],
    ),
  },
  {
    id: "ricardo", nome: "Ricardo Alves",
    metaAnual: 1_100_000,
    // Realized: 626.000 + active contracts: 420.000 + forecast: 178.596
    projetadoAnual: 1_224_596,
    metas: buildMetas(
      [ 90000, 90000, 90000,100000,100000, 90000, 90000, 90000, 80000, 80000,100000,100000],
      [ 98000,105000,110000, 98000,110000,105000,     0,     0,     0,     0,     0,     0],
    ),
  },
  {
    id: "ana", nome: "Ana Beatriz",
    metaAnual: 800_000,
    // Realized: 323.000 + active contracts: 195.000 + forecast: 99.930
    projetadoAnual: 617_930,
    metas: buildMetas(
      [ 65000, 65000, 65000, 75000, 75000, 65000, 65000, 65000, 55000, 55000, 65000, 65000],
      [ 70000, 58000, 62000, 30000, 55000, 48000,     0,     0,     0,     0,     0,     0],
    ),
  },
];

// ─── 2027 (planned — targets only, no realized yet) ───────────────────────────
export const VENDEDORES_2027: VendedorMeta[] = [
  {
    id: "joao", nome: "João Silva",
    metaAnual: 1_380_000,
    projetadoAnual: 0, // no sales data yet for a future year
    metas: buildMetas(
      [115000,115000,115000,135000,135000,115000,115000,115000, 95000, 95000,115000,115000],
      [],
    ),
  },
  {
    id: "maria", nome: "Maria Clara",
    metaAnual: 1_080_000,
    projetadoAnual: 0,
    metas: buildMetas(
      [ 90000, 90000, 90000,100000,100000, 90000, 85000, 85000, 80000, 80000, 90000, 90000],
      [],
    ),
  },
  {
    id: "ricardo", nome: "Ricardo Alves",
    metaAnual: 1_260_000,
    projetadoAnual: 0,
    metas: buildMetas(
      [105000,105000,105000,115000,115000,105000,105000,105000, 95000, 95000,105000,115000],
      [],
    ),
  },
  {
    id: "ana", nome: "Ana Beatriz",
    metaAnual: 920_000,
    projetadoAnual: 0,
    metas: buildMetas(
      [ 77000, 77000, 77000, 85000, 85000, 77000, 77000, 77000, 65000, 65000, 77000, 77000],
      [],
    ),
  },
];

export const VENDEDORES_BY_ANO: Record<string, VendedorMeta[]> = {
  "2025": VENDEDORES_2025,
  "2026": VENDEDORES_2026,
  "2027": VENDEDORES_2027,
};
