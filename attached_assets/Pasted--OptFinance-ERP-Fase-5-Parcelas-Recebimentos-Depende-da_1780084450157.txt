# OptFinance ERP — Fase 5: Parcelas & Recebimentos
> Depende das Fases 0, 1 e 8A (Vendas).
> Referência visual: parcelas_recebimentos_optsolv_erp_screen.png

---

## 5.1 — Estrutura da página

Criar `src/pages/Parcelas/index.jsx`.

Topbar: abas "Parcelas & Recebimentos" (ativa) | "Em Atraso" | "Pagas Recentemente"

`PageHeader` com:
- Título: "Parcelamentos & Recebimentos"  
- Subtítulo: "Controle de cobranças e recebimentos"
- Ações: "Exportar" (`Download`, outline) + **"Registrar Pagamento"** (`Plus`, laranja)

---

## 5.2 — Filtros inline

Uma linha:
- **Cliente** — busca texto
- **Status** — select: Todos / Em Aberto / Paga / Pagamento Parcial / Vencida
- **Período de vencimento** — date range
- **Vendedor** — select
- Botão "Limpar"

---

## 5.3 — Cards de resumo

4 cards calculados sobre os dados filtrados:

| Label | Cálculo | Cor |
|---|---|---|
| Total a Receber | soma de parcelas em aberto | info (azul) |
| Vencidas | soma de vencidas sem recebimento | danger (vermelho) |
| Recebido no Período | soma de recebidas no filtro | success (verde) |
| Parcial | count de pagamentos parciais | warning (amarelo) |

---

## 5.4 — Tabela de parcelas

Colunas:

| Coluna | Campo | Observação |
|---|---|---|
| Nº | `numero` | "01/12" em `font-mono` |
| Cliente | `clienteNome` | bold |
| Vencimento | `vencimento` | vermelho se vencida |
| Valor | `valorBruto` | R$ |
| Status | `situacao` | `StatusBadge` |
| NF | `nfEmitida` | ícone check verde ou traço |
| Recebimento | `recebimento` | data ou "—" |
| Ações | — | botão "Registrar" (laranja) |

Clicar em uma linha: abrir SlidePanel com detalhes da parcela e venda vinculada.

---

## 5.5 — Modal "Registrar Pagamento"

Ao clicar em "Registrar" na tabela, abrir modal `FormRegistrarPagamento.jsx`.

**Título:** "Registrar Pagamento — Parcela #0XX"
**Subtítulo:** "[Nome do cliente] • Vencimento: [data]"

**Campos:**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Valor Recebido (R$) | Input numérico | Sim | Pré-preenchido com `valorBruto`; fonte grande bold |
| Data do Recebimento | Date picker | Sim | Padrão = hoje |
| Conta Bancária | Select | Sim | "Banco do Brasil - Ag: 1234 C/C: 98765-4" |
| Comprovante | Upload drag-and-drop | Não | "Upload de arquivo ou arraste para aqui / PDF, JPG ou PNG até 10MB" |
| Pagamento Parcial | Toggle | Não | Label: "Pagamento Parcial — A parcela continuará aberta com o saldo remanescente" |

**Comportamento do toggle "Pagamento Parcial":**
- Padrão: desligado
- Quando ligado: exibir campo adicional "Novo vencimento do saldo restante" (date picker)
- O valor recebido permanece editável — usuário digita o valor parcial

**Botões:** "Cancelar" (outline) + "Confirmar Pagamento" (laranja gradiente)

**Ao confirmar:**
1. Se pagamento parcial: `situacao = 'pagamento-parcial'`, `valorRecebido = valorDigitado`
2. Se pagamento total: `situacao = 'paga'`, `recebimento = dataDigitada`
3. Criar movimentação de entrada no Fluxo de Caixa
4. Toast: "Pagamento registrado com sucesso"
5. Registrar no histórico: `{ acao: 'Recebimento registrado', entidade: 'parcelas' }`
