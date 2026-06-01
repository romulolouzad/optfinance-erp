# OptFinance MVP — Fase 7: Cartão Corporativo / Outras Contas
> Depende das Fases 0, 1, 3 e 6. Representa a leitura analítica da fatura mensal com rastreabilidade por fechamento mensal. A fatura consolidada permanece visível em Contas a Pagar (Fase 6); esta tela oferece a visão detalhada por mês.

---

## 7.1 — Seletor de conta/cartão

Criar `src/pages/CartaoCorporativo/index.jsx`.

**Header da página:**
Usar `PageHeader` com:
- Título: "Cartão Corporativo"
- Subtítulo: "Acompanhe os gastos mensais e o pagamento da fatura"

**Seletor de conta no topo da tela:**
- Dropdown `<Select>` com label "Selecionar cartão:"
- Opções: filtrar `contas-financeiras.json` pelo campo `tipo === 'cartão'`
- Se não houver contas do tipo cartão cadastradas: exibir `EmptyState` com mensagem "Nenhum cartão corporativo cadastrado. Cadastre uma conta do tipo Cartão Corporativo em Contas Financeiras."
- Ao selecionar uma conta: carregar os dados da fatura do mês atual para aquela conta

**Estado inicial:** selecionar automaticamente o primeiro cartão disponível.

---

## 7.2 — Navegação mensal e resumo da fatura

Abaixo do seletor de conta, exibir a navegação mensal e o card de resumo.

**Navegação mensal:**
```
[← Mês anterior]   [Maio 2025]   [Próximo mês →]
```
- Botões de seta são `<button>` com ícones `ChevronLeft` e `ChevronRight`
- Mês atual exibido por extenso no centro: "Maio 2025"
- Clicar nos botões de seta atualiza o `mesAtivo` (estado local) e recarrega os dados da fatura
- Não permitir navegar para meses futuros além do mês atual

**Card de resumo da fatura:**
Exibir como card com fundo branco, borda e sombra suave. Conteúdo:

| Campo | Valor | Observação |
|---|---|---|
| Valor total da fatura | R$ [valorTotal] | destaque em `text-2xl font-bold` |
| Data de vencimento | [data formatada] | |
| Status | badge colorido | Aberta → amarelo, Paga → verde |
| Botão "Registrar pagamento" | — | Visível se `status === 'aberto'` e perfil Admin ou Financeiro |

O botão "Registrar pagamento" abre o modal `FormPagamentoFatura` (etapa 7.4).

**Estado: fatura não encontrada para o mês selecionado:**
Exibir mensagem: "Nenhuma fatura disponível para [Mês Ano]. Os gastos do período podem não ter sido importados."

---

## 7.3 — Listagem de gastos do período

Abaixo do card de resumo, exibir tabela com os gastos que compõem a fatura do mês selecionado.

**Fonte de dados:** array `composicao` da fatura correspondente em `faturas-cartao.json`, filtrado por `contaFinanceiraId === contaSelecionada.id` e `mesReferencia === mesAtivo`.

**Tabela (`DataTable`):**

Colunas:

| Coluna | Campo | Observação |
|---|---|---|
| Data da compra | `data` | formato "dd/mm/aaaa" |
| Descrição | `descricao` | — |
| Categoria | `categoria` | — |
| Parcela | `parcela` | ex: "1/1", "2/3"; "—" se não parcelado |
| Valor | `valor` | R$ formatado, sempre saída (vermelho) |
| Centro de custo | `centroCustoId` | exibir o nome; se `null`: célula com ícone `AlertTriangle` vermelho + "Sem centro de custo" |
| Competência | — | exibida como texto separado da data da compra. Label deve ser "Competência", não confundir com data de compra, fechamento ou pagamento da fatura |

**Rodapé da tabela:**
- Total de gastos listados: "X lançamentos"
- Somatória dos valores: "Total: R$ [soma]"
- Mensagem informativa: "O pagamento da fatura é um evento separado no fluxo de caixa."

**`EmptyState`** quando não houver lançamentos: "Nenhum lançamento encontrado para este período."

---

## 7.4 — Pagamento da fatura

Ao clicar em "Registrar pagamento" no card de resumo, abrir modal `FormPagamentoFatura.jsx`.

**Título:** "Registrar pagamento da fatura — [nome do cartão] — [Mês Ano]"

**Cabeçalho informativo (somente leitura):**
- Total da fatura: R$ [valorTotal]
- Vencimento: [data]

**Campos:**

| Campo | Tipo | Obrigatório | Observações |
|---|---|---|---|
| Data de pagamento | Date picker | Sim | padrão = hoje |
| Valor pago | Input numérico | Sim | Pré-preenchido com `valorTotal`; editável |
| Conta financeira de débito | Select | Sim | Conta bancária de onde sai o dinheiro para pagar o cartão (não o próprio cartão) |
| Observação | Textarea | Não | — |

**Aviso no modal (box informativo azul):**
"O pagamento da fatura é um evento separado dos gastos individuais. Um lançamento de saída será criado no Extrato de Movimentações."

**Ao salvar:**
1. Alterar `status = 'pago'` na fatura no mock em memória
2. Criar movimentação de **saída** no extrato: `{ tipo: 'saida', resumo: 'Pagamento fatura ' + nomeCartao + ' ' + mesReferencia, valor, contaFinanceiraId: contaDebitada.id, data: dataPagamento, origem: 'manual' }`
3. Atualizar o card de resumo: badge muda para "Paga" e botão "Registrar pagamento" some
4. Toast: "Pagamento da fatura registrado com sucesso"
5. Registrar no histórico: `{ acao: 'Pagamento da fatura do cartão', entidade: 'cartao-corporativo', entidadeId: faturaId }`
