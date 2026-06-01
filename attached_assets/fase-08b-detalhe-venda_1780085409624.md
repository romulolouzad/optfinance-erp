# OptFinance ERP — Fase 8B: Detalhe da Venda
> Depende das Fases 0, 1 e 8A.
> Referência visual: detalhe_da_venda_optsolv_erp_screen.png
> É uma PÁGINA PRÓPRIA em /vendas/:id — não SlidePanel.

---

## 8B.1 — Estrutura da página

Criar `src/pages/Vendas/DetalheVenda.jsx`.

Breadcrumb: "Vendas & Contratos > #0038 — AMT Engenharia" (último item em laranja)

Layout: coluna principal (70%) + painel de ações (30%) lado a lado no topo.

---

## 8B.2 — Card "Resumo da Venda"

Card branco no lado esquerdo com:
- Badge de status `ATIVA` (verde) no canto superior direito
- Grid 2×2 de campos (label em `text-muted text-xs uppercase`, valor em `font-medium`):
  - **Cliente**: nome do cliente
  - **Vendedor**: nome do vendedor
  - **Tipo**: Recorrente / Pontual
  - **Competência**: "03/2026"
- **Valor Total** em destaque: "VALOR TOTAL" label + `R$ 180.000,00` em `text-3xl font-bold text-primary-container`

---

## 8B.3 — Painel "Ações Disponíveis"

Card escuro (`bg-inverse-surface`) no lado direito, título "AÇÕES DISPONÍVEIS" em `text-xs uppercase text-muted`:

4 botões empilhados verticalmente:
- **"✏️ Editar Venda"** — laranja primário (gradiente)
- **"⊘ Inativar"** — outline branco
- **"🚩 Marcar como Perdida"** — outline branco
- **"✕ Encerrar"** — outline branco

Cada botão com ícone à esquerda. Largura total do card.

---

## 8B.4 — Seção "Parcelas"

Abaixo do resumo, título "Parcelas" + link "FILTRAR STATUS" à direita.

Tabela com colunas:
**Nº** | **Competência** | **Vencimento** | **Valor Bruto** | **Status** | **NF** | **Recebimento** | **Ações**

- Coluna **Nº**: "01/12", "02/12", etc.
- Coluna **Status**: badge — `PAGA` (verde) / `PAGAMENTO PARCIAL` (amarelo) / `EM ABERTO` (cinza)
- Coluna **NF**: ícone `CheckCircle` verde se emitida, badge "PENDENTE" amarelo se não
- Coluna **Recebimento**: data se recebida, "—" se não
- Coluna **Ações**: botão "REGISTRAR" (laranja) para parcelas em aberto; "—" para pagas

Ao clicar em "REGISTRAR": abrir modal `FormRegistrarParcela` com:
- Valor recebido (pré-preenchido), Data do recebimento, Conta bancária, Comprovante (drag-and-drop), Toggle "Pagamento Parcial"

---

## 8B.5 — Seção "Comissões"

Abaixo das parcelas, título "Comissões".

Tabela com colunas:
**Parcela** | **Vendedor** | **%** | **Valor** | **Status**

- Status de comissão: `PAGA` (verde) / `PRONTA` (azul — NF emitida, aguardando pagamento) / `AGUARDANDO NF` (amarelo)
- Lógica: comissão só fica `PRONTA` quando a NF da parcela correspondente for emitida

---

## 8B.6 — Seção "Histórico de Alterações"

Ao lado das comissões (ou abaixo em mobile), título "Histórico de alterações" + contador (ex: "12") + botão "CARREGAR".

Timeline vertical:
- Cada item: bolinha colorida (laranja = sistema, cinza = usuário) + data/hora + texto descritivo
- Exemplos:
  - "10 MAR 2026 — 14:32 [Sistema] João Silva registrou o pagamento da parcela 01/12."
  - "02 MAR 2026 — 09:15 Ana Costa anexou a nota fiscal para a parcela 01/12."
  - "01 MAR 2026 — 16:45 Venda criada por João Silva com status inicial Ativa."
- Evento de acesso: toast temporário no topo "✅ Venda visualizada — Log de acesso registrado com sucesso." (desaparece após 3s)
- Botão "CARREGAR" carrega mais eventos (simular paginação)
