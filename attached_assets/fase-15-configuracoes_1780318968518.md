# OptFinance ERP — Fase 15: Configurações & Usuários
> Depende das Fases 0 e 1.
> Referências visuais: configuracoes + usuarios_permissoes + novo_usuario + inativacao_de_usuario

---

## 15.1 — Configurações

Criar `src/pages/Configuracoes/index.jsx`.

`PageHeader` com:
- Título: "CONFIGURAÇÕES"
- Subtítulo: "Parâmetros gerais do sistema"

Layout: menu lateral esquerdo (250px) + conteúdo à direita (scroll interno).

**Menu lateral** com itens:
- Empresa & Filiais (ativo por padrão)
- Centros de Custo
- Padrão de Impostos
- Tabela de Comissões
- Parâmetros do Sistema

---

### 15.1a — Empresa & Filiais

**Seção "Dados da Empresa"** (com botão lápis editar no canto direito):
- Razão Social, CNPJ, Nome Fantasia, Endereço — em grid 2×2

**Seção "Filiais"** (com botão "+ Nova Filial"):
Tabela: ID / Nome / CNPJ / Status (badge ATIVO) / Ações (olho + lápis)

---

### 15.1b — Padrão de Impostos

Grid de campos editáveis:
ISS % | CSLL % | PIS % | IRPJ % | COFINS %

Botão "Salvar Padrão" (laranja) — ao salvar, atualizar os valores padrão usados em Nova Venda (Section 03 — Impostos).

---

### 15.1c — Parâmetros do Sistema

Lista de parâmetros com label, descrição e controle à direita:

| Parâmetro | Descrição | Controle |
|---|---|---|
| Paginação do histórico | Número de itens por página em auditoria | Select: 50 / 100 / 200 |
| Horizonte do Forecast | Período padrão para projeções financeiras | Select: 12 / 24 / 36 meses |
| Timezone | Fuso horário do servidor central | Texto estático: "America/Sao_Paulo" |
| Concorrência de edição | Bloqueio automático de registros em uso | Badge "Habilitado" (laranja) |

Botão "Salvar Parâmetros" (laranja) no rodapé desta seção.

---

## 15.2 — Usuários & Permissões (página separada)

Criar `src/pages/Usuarios/index.jsx`.

Acessível via item "Usuários" no sidebar (item próprio, não dentro de Configurações).

**Header da tela:** "Usuários & Permissões" + subtítulo "Gestão de acesso ao sistema" + botão "+ Novo Usuário" (laranja com ícone `UserPlus`)

**Filtros:**
- Busca por nome ou e-mail (placeholder "Ex: João Silva...")
- Tipo (select: Todos / Admin / Usuário)
- Perfil (select: Todos / Operacional / Comercial / Diretoria)
- Status (select: Ativos / Inativos / Todos)
- Botão "Limpar"

**Tabela:**

Colunas: **ID** | **Nome + E-mail** | **Tipo** | **Perfil** | **Módulos com Acesso** | **Status** | **Último Acesso** | **Ações**

- **Tipo**: badge `ADMIN` (laranja) / `USUÁRIO` (cinza)
- **Perfil**: badge `DIRETORIA` (azul) / `OPERACIONAL` (verde) / `COMERCIAL` (laranja claro)
- **Módulos**: badges empilhados (máx. 4 visíveis): Comercial, Financeiro, Fiscal, Gerencial, etc.
- **Status**: bolinha verde "Ativo" / bolinha cinza "Inativo"
- **Último Acesso**: "Hoje, 09:42" / "Ontem, 16:15" / "12 Out, 2023"
- **Ações**: ícone olho (`Eye`) + ícone lápis (`Pencil`) + três pontos (`MoreVertical`)

Três pontos abre dropdown: "Inativar usuário" / "Redefinir senha" / "Ver histórico de acessos"

**Cards abaixo da tabela:**
- "ACESSOS HOJE: 42 (+12%)" com barra de progresso laranja
- Card "Segurança do Sistema" (fundo `inverse-surface` escuro): "3 usuários estão sem autenticação de dois fatores ativa. Recomendamos a ativação obrigatória para cargos de diretoria." + botão "VER AUDITORIA" (outline laranja) → navega para `/historico`

---

## 15.3 — Página Novo Usuário

Criar `src/pages/Usuarios/NovoUsuario.jsx`.

**Página própria** em `/usuarios/novo`.
Breadcrumb: "Usuários & Permissões > Novo Usuário"

`PageHeader`: "Configurar Novo Usuário" + subtítulo "Defina as credenciais, o papel organizacional e os níveis de acesso granular para o novo colaborador dentro da plataforma Optsolv."

**Seção "Identificação"** (ícone `Person` laranja):
- Nome Completo * (input texto, placeholder "Ex: Roberto Silva de Oliveira")
- E-mail Corporativo * (input email, placeholder "roberto.silva@optsolv.com.br")
- Tipo de Conta: radio inline — `Administrador` / `Usuário` (padrão = Usuário)

**Seção "Perfil Organizacional"** (ícone `Briefcase` laranja):
Subtítulo: "Selecione o modelo de atuação pré-definido."

3 cards visuais (igual ao Novo Colaborador):
- **Operacional** — "Acesso a rotinas diárias, fluxo de caixa e emissão de notas."
- **Comercial** (selecionado por padrão, borda laranja) — "Focado em vendas, metas e gestão de carteira de clientes."
- **Diretoria** — "Acesso total a DRE, Forecast e relatórios estratégicos."

Box informativo laranja quando Comercial selecionado:
"Usuários com perfil Comercial visualizam apenas os próprios dados e carteira, a menos que possuam permissão de gerência explícita."

Botões após a seção: "Cancelar" + "Salvar Usuário" (laranja)

**Seção "Permissões de Módulo"** (ícone `Shield` laranja):
Subtítulo: "Configure os níveis de acesso granular por área do ERP."

Grid 2 colunas, 8 módulos, cada um com checkbox LEITURA + ESCRITA:

| Módulo | Padrão (Comercial) |
|---|---|
| Comercial | ✅ LEITURA ✅ ESCRITA |
| Financeiro | ✅ LEITURA ☐ ESCRITA |
| Fiscal | ✅ LEITURA ☐ ESCRITA |
| Gerencial | ☐ LEITURA ☐ ESCRITA |
| Metas | ✅ LEITURA ✅ ESCRITA |
| Caixa | ✅ LEITURA ☐ ESCRITA |
| Relatórios | ✅ LEITURA ☐ ESCRITA |
| Administração | ☐ LEITURA ☐ ESCRITA |

Ao mudar o Perfil Organizacional: atualizar automaticamente os checkboxes com os valores padrão do perfil selecionado (mas mantendo editáveis individualmente).

**Ao salvar:**
1. Adicionar ao mock de usuários
2. Navegar para `/usuarios`
3. Toast: "Usuário criado com sucesso"
4. Registrar no histórico: `{ acao: 'Criação de usuário', tipoEvento: 'acao-critica' }`

---

## 15.4 — Modal "Inativar Usuário"

Ao clicar em "Inativar usuário" no menu de três pontos:

`Dialog` com:
- Título: "Inativar Usuário — [Nome do Usuário]"
- Box laranja com ícone `AlertTriangle`:
  "Este usuário possui X contratos ativos como vendedor. As comissões futuras ficarão pausadas até reatribuição do vendedor."

**Seção "CONTRATOS AFETADOS":**
Tabela compacta: ID (link laranja #CTR-XXXX) / Cliente / Valor

Texto abaixo:
"Ao confirmar, o acesso do colaborador será revogado imediatamente e seu status passará a ser **Inativo**."

Botões: "Cancel" (outline) + "Confirmar Inativação" (laranja gradiente)

Ao confirmar:
1. `status = 'inativo'` no mock
2. Comissões futuras marcadas como pausadas
3. Toast: "Usuário inativado"
4. Registrar no histórico: `{ acao: 'Inativação de usuário', tipoEvento: 'acao-critica' }`
