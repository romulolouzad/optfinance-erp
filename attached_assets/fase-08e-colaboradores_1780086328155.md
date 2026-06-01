# OptFinance ERP — Fase 8E: Colaboradores
> Depende das Fases 0 e 1. Colaborador ≠ Usuário do sistema.
> Referências visuais: colaboradores + novo_colaborador

---

## 8E.1 — Listagem de colaboradores

Criar `src/pages/Colaboradores/index.jsx`.

`PageHeader` com:
- Título: "Colaboradores"
- Subtítulo: "Pessoas físicas e jurídicas com custo interno registrado no sistema"
- Ações: "Novo Colaborador" (laranja, link `/colaboradores/novo`)

**Filtros inline:**
- Busca por nome, CPF ou CNPJ
- Tipo (select: Todos, PF, PJ)
- Status (select: Todos os Status, Ativo, Inativo)

**Tabela:** ID, Nome (bold), Tipo (badge PF/PJ), CPF/CNPJ, Cargo, Status (toggle visual), Último Acesso

Ao clicar em uma linha: abrir SlidePanel de detalhe.

---

## 8E.2 — SlidePanel de detalhe

Abrir ao clicar em qualquer linha.

**Header:** título "[Nome] — PF" ou "[Nome] — PJ", subtítulo "Colaborador ID #00XX"

**Seção DADOS CADASTRAIS** (ícone `UserCheck` laranja):
Grid 2×3: CPF, Data de Nascimento, Email, Cargo

**Seção DESPESAS RECENTES** (ícone `Receipt` laranja):
Tabela compacta: Data, Ref (descrição da despesa), Valor
Link "Ver todas as despesas →"

**Seção HISTÓRICO DE ALTERAÇÕES** (colapsável):
Timeline com eventos recentes + data/hora

**Rodapé:** "Editar" (laranja) + "Fechar" (outline)

---

## 8E.3 — Página Novo Colaborador

Criar `src/pages/Colaboradores/NovoColaborador.jsx`.

**Página própria** em `/colaboradores/novo`.
Breadcrumb na topbar: "Colaboradores > Novo Colaborador"
Botão "Salvar Colaborador" na topbar à direita (além do rodapé).

`PageHeader`: "Novo Colaborador" + subtítulo "Preencha os dados abaixo para cadastrar um novo integrante na equipe."

**Seção "Identificação"** (ícone `Person` laranja preenchido):

Seletor de tipo PF/PJ em **cards visuais** (não radio buttons simples):
- Card PF (selecionado): borda `border-2 border-primary`, fundo `surface-container-lowest`, ícone `AccountCircle` laranja, título "Pessoa Física (PF)", subtítulo "Colaboradores CLT, Estagiários ou Autônomos.", radio laranja selecionado no canto superior direito
- Card PJ: borda transparente, hover `surface-container-low`, ícone `Business` cinza, título "Pessoa Jurídica (PJ)", subtítulo "Prestadores de serviço e consultorias externas."

Box informativo azul claro (fundo `tertiary-fixed`):
"O sistema não infere o tipo automaticamente. Certifique-se de selecionar a opção correta para garantir a integridade dos cálculos tributários e campos de identificação."

Campos (mudam conforme PF/PJ):
- PF: Nome Completo (col-span-2) + CPF
- PJ: Razão Social (col-span-2) + CNPJ

**Seção "Configuração"** (ícone `Settings` laranja preenchido):
- Centro de Custo (select)
- Status do Colaborador (toggle com badge "ATIVO" laranja inline)

**Seção "Vínculo com Usuário"** (ícone `Link` laranja):
Card glassmorphism informativo:
- Ícone `NoAccounts` cinza
- Título: "Acesso ao Sistema"
- Texto: "Colaboradores não possuem login por padrão. Se este colaborador precisar acessar o Optsolv ERP, você deverá criar um usuário vinculado após concluir este cadastro na seção de 'Segurança & Acessos'."
- Link: "SAIBA MAIS SOBRE PERMISSÕES →"

**Footer fixo** (fundo `white/80 backdrop-blur-md`, borda topo):
"Cancelar" (outline) + "Salvar Colaborador" (gradiente laranja)

**Ao salvar:**
1. Adicionar ao mock
2. Navegar para `/colaboradores`
3. Toast: "Colaborador cadastrado com sucesso"
4. Registrar no histórico: `{ acao: 'Cadastro de colaborador' }`
