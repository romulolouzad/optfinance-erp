# OptFinance ERP — Fase 8C: Empréstimos
> Depende das Fases 0, 1 e 3 (Contas Financeiras).
> Referências visuais: emprestimos + detalhe_do_emprestimo + novo_emprestimo

---

## 8C.1 — Listagem de empréstimos

Criar `src/pages/Emprestimos/index.jsx`.

`PageHeader` com:
- Título: "Empréstimos"
- Subtítulo: "Controle de dívidas e financiamentos da empresa"
- Ações: "+ Novo Empréstimo" (laranja, link `/emprestimos/novo`)

**4 cards de resumo:**

| Label | Cálculo | Ícone | Detalhe |
|---|---|---|---|
| Saldo Devedor Total | soma `saldoDevedor` de empréstimos ativos | `Landmark` | delta "% em relação ao mês anterior" |
| Parcelas em Aberto | count de parcelas com status em-aberto | `AlertCircle` laranja | subtexto "Acompanhamento mensal ativo" |
| Próximo Vencimento | data + valor da próxima parcela vencendo | `Calendar` amarelo | data formatada "dd/MM" |
| Quitados no Ano | count de empréstimos com situacao=quitado no ano atual | `CheckCircle` verde | subtexto "Metas de liquidez atingidas" |

**Filtros inline:**
- Credor (busca texto: "Nome do banco ou credor...")
- Status (select: Todos Status / Ativo / Inadimplente / Quitado)
- Período (date range: início – fim)
- Botão "Filtrar" (laranja)

**Tabela:**

Colunas: ID, Descrição (bold) + subtipo em `text-muted text-xs` abaixo, Credor, Valor Original, Saldo Devedor (vermelho `#C62828`), Parcelas (mini barra de progresso + "X/Y pagas"), Vencimento (vermelho se vencido), Status (badge)

- Status `Inadimplente`: badge vermelho, vencimento em vermelho bold
- Status `Quitado`: badge verde, saldo devedor = R$ 0,00

Paginação: "Exibindo X de Y empréstimos ativos"

---

## 8C.2 — SlidePanel de detalhe

Ao clicar em qualquer linha, abrir `SlidePanel`.

**Header do painel:**
- Badge "CONTRATO ATIVO" em laranja no topo
- Título: "Empréstimo #E007"
- Subtítulo: ícone banco + "Banco Bradesco S.A."

**Campos em grid 2 colunas:**
- Credor, Taxa de Juros ("1.85% a.m.")
- Valor Original, Saldo Devedor (vermelho bold)
- Data Início, Previsão Fim
- Centro de Custo (com bolinha colorida + nome)

**Seção "Status da Quitação":**
- Texto: "30% quitado" em laranja bold à direita
- Barra de progresso laranja proporcional
- Subtextos: "12 PARCELAS PAGAS" (esquerda) + "28 PARCELAS RESTANTES" (direita)

**Seção "Cronograma de Parcelas":**
Tabela com: Nº, Vencimento, Valor Total, Status + botão de ação por linha

| Status parcela | Ação na linha |
|---|---|
| Paga | ícone documento (comprovante) |
| Vencida | botão "Pagar" (laranja) |
| Em Aberto | texto "Registrar" (link laranja) |

**Rodapé:** "Editar Contrato" (outline) + "Registrar Pagamento" (laranja)

---

## 8C.3 — Página Novo Empréstimo

Criar `src/pages/Emprestimos/NovoEmprestimo.jsx`.

**Página própria** em `/emprestimos/novo`. Breadcrumb: "Empréstimos > Novo Empréstimo"

`PageHeader`: "Novo Empréstimo" + subtítulo "Preencha os dados abaixo para registrar uma nova operação de crédito."

3 seções card:

**Seção "Dados do Empréstimo"** (ícone `FileText` laranja):
- Descrição * (input texto, placeholder "Ex: Capital de Giro - Expansão Matriz")
- Credor * (select, obrigatório)
- Centro de Custo * (select, obrigatório)
- Valor Original * (numérico R$)
- Taxa de Juros % (numérico, sufixo "a.m.")
- Data Início * (date picker)
- Data Primeira Parcela * (date picker — separado de Data Início)

**Seção "Parcelamento"** (layout 2 colunas: configuração esquerda + preview direita):

*Esquerda — card "Parcelamento"* (ícone `Clock` laranja):
- Quantidade de Parcelas * (input numérico, padrão: 12)
- Periodicidade (select: Mensal / Bimestral / Trimestral / Semestral / Anual)

*Direita — card "Pré-visualização de Parcelas"*:
- Badge "GERADO AUTOMATICAMENTE" em cinza
- Tabela com: Nº, Vencimento, Valor Estimado
- Gerada em tempo real conforme campos preenchidos
- Se dados incompletos: texto "Aguardando preenchimento dos dados básicos..." em itálico cinza
- Botões "Cancelar" + "Salvar Empréstimo" dentro desta seção

**Seção "Observações"** (ícone `MessageSquare` laranja):
- Textarea larga, placeholder "Adicione notas relevantes sobre a contratação deste empréstimo, termos específicos ou garantias vinculadas."

**Ao salvar:**
1. Gerar cronograma de parcelas e adicionar ao mock
2. Navegar para `/emprestimos`
3. Toast: "Empréstimo registrado com sucesso"
4. Registrar no histórico: `{ acao: 'Novo empréstimo registrado' }`

---

## 8C.4 — Registrar pagamento de parcela

Ao clicar em "Pagar" ou "Registrar" no cronograma do SlidePanel:

Modal `FormPagamentoEmprestimo.jsx`:
- Parcela: "Nº X/Y — Vencimento: [data]"
- Valor da Parcela (pré-preenchido, editável)
- Data do Pagamento (date picker, padrão = hoje)
- Conta Financeira (select)
- Comprovante (drag-and-drop)
- Botões: "Cancelar" + "Confirmar Pagamento" (laranja)

Ao confirmar:
- Alterar status da parcela para "paga"
- Recalcular saldo devedor
- Criar movimentação de saída no Fluxo de Caixa
- Registrar no histórico
