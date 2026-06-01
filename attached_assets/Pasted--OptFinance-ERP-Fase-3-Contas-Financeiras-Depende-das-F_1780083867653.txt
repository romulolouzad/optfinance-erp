# OptFinance ERP — Fase 3: Contas Financeiras
> Depende das Fases 0 e 1. Cadastro base do sistema.
> Referências visuais: contas_bancarias + nova_conta_bancaria + detalhe_da_conta + inativacao_de_conta

---

## 3.1 — Listagem de contas

Criar `src/pages/ContasFinanceiras/index.jsx`.

`PageHeader` com:
- Título: "Contas Bancárias"
- Subtítulo: "Gestão de contas da empresa"
- Ações: "+ Nova Conta Bancária" (laranja, link para `/contas-financeiras/nova`)

**Banner informativo** logo abaixo do header (fundo azul claro com ícone info):
"As contas bancárias são a base do Fluxo de Caixa. Todo movimento financeiro está vinculado a uma conta. Contas não são excluídas fisicamente — apenas inativadas."

**3 cards de resumo** acima da listagem:
- SALDO TOTAL CONSOLIDADO — soma de saldoAtual de contas ativas (laranja, ícone carteira, delta "+ X% em relação ao mês anterior")
- CONTAS ATIVAS — count de contas com ativa=true (verde, ícone check, subtexto "Sem contas pendentes de regularização")
- ÚLTIMA MOVIMENTAÇÃO — data/hora + nome da conta da última movimentação registrada (neutro, ícone relógio)

**Tabela "Listagem de Contas":**

Colunas: ID (#001, #002...), Nome da Conta (`font-bold`), Banco, Agência, Conta, Saldo Inicial, Saldo Atual (laranja em bold), Status (badge Ativa/Inativa), Ações (ícone olho)

- Contas inativas: linha em opacity-60, texto muted
- Saldo atual sempre em laranja #F97316 para contas ativas
- Ação "olho" abre o SlidePanel de detalhe (3.3)

**Rodapé da tabela:** linha de totais — "SALDO TOTAL: R$ X.XXX.XXX,XX" em bold laranja

"Exibindo X de Y contas cadastradas" + paginação

---

## 3.2 — Página Nova Conta Bancária

Criar `src/pages/ContasFinanceiras/NovaConta.jsx`.

**Esta é uma PÁGINA PRÓPRIA** (`/contas-financeiras/nova`), não um modal.

`PageHeader` com:
- Título: "Nova Conta Bancária"
- Subtítulo: "Cadastre uma nova instituição financeira para gestão do seu fluxo de caixa."
- Badge "AMBIENTE SEGURO" (ícone shield, fundo surface-container-high) à direita do header

O formulário é dividido em 3 seções card (fundo surface-container-lowest, sem bordas):

**Seção "Identificação"** (ícone Fingerprint):
Grid 12 colunas:
- Nome da Conta * (col-span-8) — placeholder "Ex: Conta Corrente Principal"
- Banco (col-span-4) — select com opções: Itaú Unibanco, Bradesco, Santander, Banco do Brasil, Nubank, Caixa Econômica, BTG Pactual, XP Invest, Safra, Outros
- Agência (col-span-3) — placeholder "0000"
- Número da Conta (col-span-4) — placeholder "00000-0"
- CNPJ/CPF Titular (col-span-5) — placeholder "00.000.000/0000-00"

**Seção "Saldo"** (layout assimétrico: 2/3 + 1/3):
Lado esquerdo (card):
- Ícone `Wallet` + título "Saldo"
- Saldo Inicial * — input com prefixo "R$" em `font-bold text-xl`, placeholder "0,00"
- Data de Abertura — date picker

Lado direito (card glassmorphism `bg-white/40 backdrop-blur-md`):
- Ícone info + título "Informação Importante"
- Texto: "O saldo inicial é o ponto de partida desta conta. Alterações futuras ocorrerão automaticamente através de movimentações ou ajustes manuais no sistema."

**Seção "Configuração"** (ícone Settings):
Layout: campos à esquerda + imagem decorativa à direita

Campos:
- Toggle "Status da Conta" — "Determine se a conta está pronta para uso." + label "ATIVA" — padrão ligado
- Checkbox "Conta padrão?" — "Ao marcar, esta conta será sugerida por padrão em novos lançamentos financeiros."

**Rodapé do formulário** (borda topo, fundo transparente):
- "Cancelar" (outline) + "Salvar Conta" (gradiente laranja)

**Ao salvar:**
1. Adicionar ao mock com id incremental (#00X)
2. Navegar para `/contas-financeiras`
3. Toast: "Conta criada com sucesso"
4. Registrar no histórico: `{ acao: 'Criação de conta financeira' }`

---

## 3.3 — SlidePanel de detalhe da conta

Ao clicar no ícone de olho na tabela, abrir `SlidePanel`.

**Header do painel:**
- Ícone laranja `Building` + Título: "Conta — [Nome da Conta]"
- Subtítulo: "DETALHES DA CONTA"

**Seção DADOS DA CONTA:**
Grid 2 colunas: Nome, Banco, Agência, Número da Conta, Status ("● Ativo para movimentações" em verde)

**Card de saldo** (fundo surface-container-low, destaque):
- "Saldo Inicial (data): R$ XX.XXX,XX" em texto pequeno
- "SALDO ATUAL DISPONÍVEL" label uppercase + valor em `text-3xl font-bold text-primary-container`
- Ícone de trend à direita

**Seção ÚLTIMAS MOVIMENTAÇÕES:**
Tabela compacta: Data, Tipo (ícone seta verde/vermelha/bolinha laranja para ajuste), Origem (texto), Valor (+/- formatado com cor), Saldo progressivo

Link no rodapé da seção: "Ver todas no Fluxo de Caixa →" — navega para `/fluxo-de-caixa?contaId=X`

**Rodapé do painel:** "Fechar" (outline) + "Editar Conta" (laranja)

---

## 3.4 — Dialog de Inativação

Ao clicar em "Inativar" (aparece no SlidePanel de detalhe via botão Editar ou na tabela):

`Dialog` com:
- Título: "Confirmar Inativação"
- Subtítulo: "Conta: [Nome] ([número])"
- Box laranja com ícone `AlertTriangle`:
  - Se conta tiver movimentações futuras: "Esta conta possui **X movimentações futuras previstas**. Ao inativar, ela deixará de aparecer como opção de seleção. Movimentações já registradas são preservadas."
  - Se não tiver: "Conta sem movimentações futuras. Ao inativar, ela deixará de aparecer como opção de seleção."
- "Deseja continuar?"
- Botões: "Cancelar" (outline) + "Inativar mesmo assim" (laranja)

Ao confirmar: ativa=false, toast: "Conta inativada com sucesso", registrar no histórico.

---

## 3.5 — Conciliação Bancária (fluxo de 3 passos)

Botão "Importar Extrato" no header da listagem de contas navega para `/contas-financeiras/conciliacao`.

Esta é uma página própria com stepper de 3 passos na topbar da página:
**1 IMPORTAÇÃO** → **2 CONFERÊNCIA** → **3 FINALIZAÇÃO**

### Step 1 — Importação

Banner de aviso laranja no topo: "Atenção: A importação manual requer conferência detalhada dos saldos finais para garantir a integridade dos registros contábeis."

Card principal dividido em 2 colunas:
- **Esquerda:** Select "Selecionar Conta Bancária" (contas ativas) + card "Resumo da Conta" exibindo: Última Conciliação (data) + Saldo Contábil Atual (R$ em bold)
- **Direita:** Área drag-and-drop "Arquivo de Extrato" — "Clique para upload ou arraste" + "Arquivos suportados: CSV, OFX (Max 10MB)"

Rodapé: "Cancelar Operação" + "Carregar Extrato →" (laranja)

3 cards informativos abaixo: "Segurança de Dados" (criptografado ISO 27001), "Smart Matching" (IA sugere correspondências), "Histórico Auditoria" (cada passo registrado)

### Step 2 — Conferência (Vincular)

Após upload, exibir lista de linhas do extrato.

Ao clicar em uma linha: abrir `Dialog` "Vincular Linha do Extrato":
- **Lado esquerdo — NO EXTRATO:** Descrição, Valor (vermelho), Data — somente leitura
- **Lado direito — NO SISTEMA:** Tipo de Vínculo (select: Parcela, Despesa, Novo Lançamento), Select da parcela/despesa correspondente, Valor do Título

Se houver divergência de valores: box laranja "Divergência de Valores — O valor do extrato é R$ X menor/maior que o título. Deseja registrar a diferença como juros/descontos ou manter parcial?"

Botões: "Cancelar" + "Confirmar Vínculo" (laranja)

### Step 3 — Finalização

Banner verde: "Conciliação concluída com sucesso! X lançamentos foram processados e integrados ao sistema."

4 contadores: Confirmadas (verde), Ignoradas (cinza), Pendências (amarelo), + card de aviso se houver pendências com link "Resolver Pendências"

Tabela "Lançamentos Confirmados (X)":
Colunas: Data, Descrição Bancária (em bold + número do doc), Categoria ERP, Valor (+ verde ou - vermelho), Efeito ao Confirmar (badges: "Redução DRE", "Saída de Caixa", "Aumento DRE", "Entrada de Caixa")

Rodapé: "Total da Operação: R$ XXX.XXX,XX (Saldo Conciliado)" + "Voltar" + "Confirmar X lançamentos →" (laranja)
