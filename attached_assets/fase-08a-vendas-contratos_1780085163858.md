# OptFinance ERP — Fase 8A: Vendas & Contratos
> Depende das Fases 0, 1 e 8D (Clientes).
> Referências visuais: vendas_contratos + nova_venda + venda_recorrente (3 prints)

---

## 8A.1 — Listagem de Vendas & Contratos

Criar `src/pages/Vendas/index.jsx`.

`PageHeader` com:
- Título: "Vendas & Contratos"
- Subtítulo: "Gestão de contratos e vendas"
- Ações: "+ Nova Venda" (laranja, link `/vendas/nova`)

**Filtros todos inline** em uma linha (não FilterBar colapsável):
- **Cliente** — busca texto, placeholder "Buscar cliente..."
- **Vendedor** — select: "Todos os Vendedores" + lista
- **Status** — select: Todos / Ativa / Projeção / Inativa / Perdida / Encerrada
- **Período** — date range (dois inputs: início `a` fim)
- **Tipo** — select: Todos / Pontual / Recorrente
- Botão **"Limpar"** (outline com ícone filtro)

**Tabela:**

Colunas: **ID** | **Cliente** | **Vendedor** | **Valor Total** | **Competência** | **Tipo** | **Status** | **Parcelas**

Detalhe por coluna:
- **ID**: `#0042` em `font-mono text-sm` — se duplicidade detectada, exibir badge `⚠️ POSSÍVEL DUPLICIDADE` em laranja abaixo do ID na mesma célula
- **Cliente**: `font-bold text-on-surface`
- **Valor Total**: `font-bold text-primary-container` (laranja)
- **Competência**: "Ago / 2023" — mês e ano separados por barra
- **Tipo**: badge pill — `PONTUAL` (cinza `bg-gray-100 text-gray-600`) / `RECORRENTE` (azul `bg-blue-100 text-blue-700`)
- **Status**: badge — `ATIVA` (verde) / `PROJEÇÃO` (cinza) / `INATIVA` (amarelo) / `PERDIDA` (vermelho) / `ENCERRADA` (preto `bg-gray-900 text-white`)
- **Parcelas**: "01/12", "00/03" — parcelas pagas / total

Clicar em uma linha navega para `/vendas/:id` (Detalhe da Venda — Fase 8B).

Paginação: "Mostrando 1-8 de 38 registros" + paginação numérica (1, 2, 3...)

---

## 8A.2 — Página Nova Venda

Criar `src/pages/Vendas/NovaVenda.jsx`.

**Página própria** em `/vendas/nova`.
Breadcrumb: "Vendas & Contratos > Nova Venda"

`PageHeader`: "Nova Venda" — sem subtítulo.

O formulário é dividido em **3 seções numeradas** com label "SECTION 0X":

---

### Section 01 — Dados Comerciais

- **Cliente** * — select de clientes ativos (obrigatório)
- **Vendedor** * — select de colaboradores, pré-preenchido com usuário logado
- **Tipo de Venda** — radio inline: `Pontual` (padrão selecionado) / `Recorrente`
- **Estado Inicial** — radio inline: `Projeção` / `Ativa` (padrão)
- **Valor Total** * — input numérico com prefixo "R$"
- **Competência** * — mês/ano (input do tipo month)
- **Descrição** — textarea, placeholder "Detalhes adicionais da venda..."

**Alerta de duplicidade inline** (visível apenas quando detectado):
Box laranja claro com ícone `AlertTriangle`:
"Já existe uma venda para este cliente com o mesmo valor e competência. Deseja continuar?"
Botões inline: "Sim, continuar" (outline laranja) / "Cancelar" (ghost)
— **não bloqueia** — apenas avisa. O usuário pode ignorar e salvar.

---

### Section 02 — Parcelamento

- **Quantidade de Parcelas** — input numérico
- **Periodicidade** — select: Mensal / Bimestral / Trimestral / Semestral / Anual
- **Data de Início** — date picker

**Pré-visualização das parcelas** (tabela ao lado ou abaixo):
Gerada automaticamente em tempo real: Nº | Competência | Vencimento | Valor
- Se quantidade/periodicidade/data não preenchidos: texto "Aguardando preenchimento dos dados básicos..."
- **Alerta de inconsistência** quando soma das parcelas ≠ valor total:
  Texto laranja: "⚠️ Soma das parcelas (R$ X) difere do valor total (R$ Y)"
  — não bloqueia salvar

---

### Section 03 — Impostos

Grid de 5 campos editáveis (pré-preenchidos com os valores de Configurações):
ISS % | PIS % | COFINS % | CSLL % | IRPJ %

Texto informativo abaixo: "Os impostos podem ser ajustados manualmente a qualquer momento."
Botão link laranja: **"Aplicar padrão de impostos"** — reseta para os valores das Configurações.

---

**Venda Recorrente:**
Quando `Tipo de Venda = Recorrente`, expandir seção adicional "Configurações de Recorrência":
- Repetir venda a cada: número + select (Mês/meses)
- Dia da geração das vendas: select (1º dia, 5º dia, 10º dia, ..., 19º dia do mês, último dia)
- **Data da primeira venda** (calculada automaticamente, somente leitura em laranja)
- Término da recorrência: select (Em um período específico / Indeterminado / Após X ocorrências)
- Data de término: date picker (ativo quando "período específico")
- **Vigência total** (calculada, badge laranja): ex "12 meses"

**Rodapé:**
Botão "Salvar Venda" (laranja) — navega para `/vendas/:id` após salvar.

**Ao salvar:**
1. Gerar parcelas no mock baseado na configuração de parcelamento
2. Registrar no histórico: `{ acao: 'Criação de venda', entidade: 'vendas' }`
3. Toast: "Venda criada com sucesso"
