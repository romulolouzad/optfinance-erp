# OptFinance ERP — Fase 1: Shell e Navegação
> Depende da Fase 0. Cria a estrutura visual que envolve todas as páginas.
> Referência visual: dashboard_optsolv_erp_screen.png (sidebar completa visível).

---

## 1.1 — AppShell

Criar `src/components/layout/AppShell.jsx`.

Layout:
```
[Sidebar 220px fixo] [Conteúdo: Topbar fixo + main scrollável]
```

```jsx
<div className="flex min-h-screen bg-surface">
  <Sidebar />
  <div className="flex-1 flex flex-col ml-[220px]">
    <Topbar />
    <main className="flex-1 overflow-y-auto p-8">
      {children}
    </main>
  </div>
</div>
```

---

## 1.2 — Sidebar

Criar `src/components/layout/Sidebar.jsx`.

**Fundo:** `bg-[#111827]` (inverse-surface), largura 220px, altura total da tela, posição fixa.

**Topo:** Logo "Optsolv ERP" em branco `font-bold text-xl` + subtítulo "ENTERPRISE RESOURCE PLANNING" em `text-[10px] text-gray-400 uppercase tracking-widest`.

**Menu de navegação** — grupos com label de categoria:

Sem label de categoria (topo):
- Dashboard → `/` (ícone `LayoutDashboard`)

**COMERCIAL**
- Vendas & Contratos → `/vendas` (ícone `ShoppingCart`)
- Parcelas → `/parcelas` (ícone `CreditCard`)
- Comissões → `/comissoes` (ícone `Percent`)
- Clientes → `/clientes` (ícone `Users`)

**OPERACIONAL**
- Colaboradores → `/colaboradores` (ícone `UserCheck`)
- Fornecedores → `/fornecedores` (ícone `Truck`)
- Notas Fiscais → `/notas-fiscais` (ícone `FileText`)

**FINANCEIRO**
- DRE → `/dre` (ícone `BarChart2`)
- Forecast → `/forecast` (ícone `TrendingUp`)
- Metas → `/metas` (ícone `Target`)
- Fluxo de Caixa → `/fluxo-de-caixa` (ícone `Activity`)
- Empréstimos → `/emprestimos` (ícone `Landmark`)
- Contas Financeiras → `/contas-financeiras` (ícone `Building2`)

**SISTEMA**
- Relatórios → `/relatorios` (ícone `PieChart`)
- Budget → `/budget` (ícone `BookOpen`)
- Histórico → `/historico` (ícone `Clock`)
- Configurações → `/configuracoes` (ícone `Settings`)

**Labels de categoria:** `text-[10px] text-gray-500 uppercase tracking-widest px-4 mt-6 mb-1`

**Item inativo:** `text-gray-400 hover:text-white flex items-center px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm`

**Item ativo:** adicionar `border-l-4 border-[#F97316] text-white font-semibold bg-white/5 pl-[calc(1rem-4px)]` — a borda laranja de 4px fica na borda esquerda do item.

Usar `<NavLink>` do React Router para aplicar classe ativa automaticamente.

**Rodapé da sidebar:**
- Card com fundo `bg-white/5 rounded-xl` contendo: avatar do usuário (iniciais em círculo laranja), nome e cargo
- Links "Support" e "Sign Out" abaixo com ícones

**Mobile (< 1024px):** sidebar oculta, abre via estado `sidebarOpen` controlado pelo botão hambúrguer da Topbar. Usar `translate-x-[-100%]` quando fechada, `translate-x-0` quando aberta, com overlay escuro.

---

## 1.3 — Topbar

Criar `src/components/layout/Topbar.jsx`.

**Estrutura (esquerda → direita):**

1. **Botão hambúrguer** `<Menu>` — visível apenas em mobile (< 1024px)
2. **Busca global** — input `bg-surface-container-lowest rounded-lg px-3 py-1.5 w-64 shadow-sm` com ícone `Search` e placeholder "Pesquisar no sistema..."
3. **flex-1** — espaço empurra os próximos para a direita
4. **Botão "Create New"** — laranja (`bg-gradient-to-t from-primary to-primary-container text-white px-4 py-2 rounded-lg text-sm font-bold`) — abre quick-menu para criar venda, despesa, etc.
5. **Ícone Notificações** `<Bell>` com badge de contagem
6. **Ícone Configurações** `<Settings>`
7. **Avatar + nome + cargo** — foto/iniciais, nome em `font-bold text-sm`, cargo em `text-xs text-muted`

**Fundo da topbar:** `bg-surface` (não branco — segue o fundo da página)

---

## 1.4 — AuthContext e permissões

Criar `src/context/AuthContext.jsx`:

```js
const estadoInicial = {
  usuario: 'Admin User',
  email: 'admin@optsolv.com',
  cargo: 'Finance Director',
  perfil: 'admin', // 'admin' | 'financeiro' | 'visualizacao'
}
```

Exportar:
- `AuthProvider`
- `useAuth()` — retorna `{ usuario, perfil, setPerfil }`
- `temPermissao(perfil, recurso, acao)` — boolean

Criar `src/utils/permissoes.js` com tabela:

```js
const PERMISSOES = {
  admin: {
    'vendas':            ['visualizar', 'criar', 'editar', 'encerrar', 'inativar', 'marcar-perdida'],
    'parcelas':          ['visualizar', 'criar', 'registrar-pagamento', 'exportar'],
    'comissoes':         ['visualizar', 'ajustar', 'exportar'],
    'clientes':          ['visualizar', 'criar', 'editar'],
    'colaboradores':     ['visualizar', 'criar', 'editar'],
    'fornecedores':      ['visualizar', 'criar', 'editar'],
    'despesas':          ['visualizar', 'criar', 'editar', 'registrar-pagamento', 'exportar'],
    'emprestimos':       ['visualizar', 'criar', 'editar', 'registrar-pagamento'],
    'contas-financeiras':['visualizar', 'criar', 'editar', 'inativar', 'conciliar'],
    'fluxo-de-caixa':   ['visualizar', 'criar', 'exportar'],
    'dre':               ['visualizar', 'exportar'],
    'forecast':          ['visualizar', 'atualizar'],
    'metas':             ['visualizar', 'criar', 'editar'],
    'relatorios':        ['visualizar', 'criar', 'exportar', 'agendar'],
    'budget':            ['visualizar', 'editar', 'exportar'],
    'historico':         ['visualizar', 'exportar'],
    'configuracoes':     ['visualizar', 'editar'],
  },
  financeiro: { /* subconjunto sem: ajustar-comissao, inativar, configuracoes */ },
  visualizacao: { /* apenas visualizar em todos */ },
}
```

---

## 1.5 — CentroCustoContext

Criar `src/context/CentroCustoContext.jsx`:

```js
{ centroCustoAtivo: null } // null = Todos
```

Exportar `CentroCustoProvider` e `useCentroCusto()`.

O seletor de centro de custo fica na topbar (dropdown) e atualiza o contexto. Todas as páginas que exibem dados financeiros filtram por este contexto automaticamente.

---

## 1.6 — PrivateRoute

Criar `src/routes/PrivateRoute.jsx`:

- Props: `recurso` (string), `acao` (string, padrão `'visualizar'`)
- Se sem permissão: renderizar `<NoPermissionState />` inline
- Se com permissão: renderizar `<Outlet />`

Em desenvolvimento (`import.meta.env.DEV`): exibir seletor de perfil na topbar (dropdown Admin/Financeiro/Visualização) que chama `setPerfil()` — reflete imediatamente em todas as rotas.
