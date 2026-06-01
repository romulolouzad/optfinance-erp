# OptFinance ERP — Fase 8F: Fornecedores
> Depende das Fases 0 e 1. Fornecedor e Cliente são entidades separadas — mesmo CNPJ pode existir nos dois.
> Referências visuais: fornecedores + novo_fornecedor

---

## 8F.1 — Listagem de fornecedores

Criar `src/pages/Fornecedores/index.jsx`.

Banner informativo laranja (abaixo do header):
"Um fornecedor pode ter o mesmo CNPJ que um cliente cadastrado. Verifique antes de criar duplicatas."

`PageHeader` com:
- Título: "Fornecedores"
- Subtítulo: "Entidades externas geradoras de despesas"
- Ações: "Novo Fornecedor" (laranja, link `/fornecedores/novo`)

**Filtros inline:** Busca (nome ou documento), Tipo de Pessoa (Todos/PJ/PF), Status (Todos/Ativo/Inativo)

**Tabela:** ID, Razão Social (bold), Tipo (badge), CNPJ/CPF, Status (badge), Ações (olho)

Ao clicar: abrir SlidePanel.

---

## 8F.2 — SlidePanel de detalhe

**Header:** título "Fornecedor — [Razão Social]"

**Seção DADOS CADASTRAIS** (ícone `Building2` laranja):
Grid 2×2: Razão Social, CNPJ, E-mail Financeiro, Telefone

**Seção DESPESAS VINCULADAS** (ícone `Receipt` laranja):
Tabela: Data, Descrição, Valor. Link "Ver todas →" navega para `/despesas?fornecedorId=X`.

**Seção HISTÓRICO** (colapsável):
Timeline com: evento (bold) + executor + data/hora. Inclui eventos "Automação API" em cinza.

**Rodapé:** "Editar" (laranja) + "Fechar" (outline)

---

## 8F.3 — Página Novo Fornecedor

Criar `src/pages/Fornecedores/NovoFornecedor.jsx`.

**Página própria** em `/fornecedores/novo`.
Breadcrumb: "Fornecedores > Novo Fornecedor"

Layout com 2 seções card (barra laranja vertical à esquerda como decoração):

**Seção "IDENTIFICAÇÃO":**
- Tipo de Pessoa: radio PJ (pré-selecionado) + PF — inline horizontal
- Razão Social * (input texto, placeholder "Nome jurídico da empresa")
- CNPJ * (com ícone de busca `Search` à direita — simula consulta SEFAZ)
- Nome Fantasia (input texto)
- **Alerta "Registro Duplicado"** (quando CNPJ já existe como Cliente):
  Box laranja claro com ícone info: "Este CNPJ já está cadastrado como Cliente. Você pode continuar — Fornecedor e Cliente são entidades separadas dentro do Optsolv ERP."
  — **não bloqueia o cadastro** (diferente do Novo Cliente que apenas alerta)

**Seção "CONFIGURAÇÃO":**
- Centro de Custo Padrão (select)
- Status do Cadastro: toggle "Inativo ⟷ Ativo" (labels nos dois lados)

**Rodapé:** texto "🔒 Dados protegidos por criptografia de ponta a ponta" + "Cancelar" + "Salvar Fornecedor" (laranja com ícone save)

**3 cards informativos** abaixo (glassmorphism com imagens decorativas):
- "Fornecedores com CNPJ ativo são validados automaticamente na SEFAZ."
- "Gerencie contas a pagar e estoque em um só lugar."
- "Configure as alíquotas de retenção após salvar o cadastro."

**Ao salvar:**
1. Adicionar ao mock
2. Navegar para `/fornecedores`
3. Toast: "Fornecedor cadastrado com sucesso"
4. Registrar no histórico: `{ acao: 'Cadastro de fornecedor' }`
