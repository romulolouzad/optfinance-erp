# OptFinance ERP — Fase 8G: Notas Fiscais
> Depende das Fases 0, 1 e 8A (Vendas).
> Referência visual: notas_fiscais_optsolv_erp_screen.png

---

## 8G.1 — Estrutura da página

Criar `src/pages/NotasFiscais/index.jsx`.

A topbar desta tela exibe 3 abas: **Visão Geral** (ativa, underline laranja) | **Pendentes** | **Arquivados**

`PageHeader` com:
- Título: "Notas Fiscais"
- Subtítulo: "Gerenciamento centralizado de NFs de clientes e vendedores."

---

## 8G.2 — Toggle NF Cliente / NF Vendedor

Logo abaixo do header, toggle de tipo:
- Botão **"NF Cliente"** (fundo laranja, texto branco quando ativo)
- Botão **"NF Vendedor"** (outline quando inativo)

O conteúdo da página filtra conforme o tipo ativo.

---

## 8G.3 — Filtros e ações

Linha de filtros:
- Buscar cliente (input texto, placeholder "Buscar cliente...")
- Período (date range, padrão = mês atual)
- Status (select: Todos os Status / Emitida / Pendente / Arquivada)

Linha de ações:
- "Emitir Nota" (laranja, ícone `FileText`)
- "Importar XML" (outline, ícone `Upload`)

---

## 8G.4 — Área de upload central

Dois cards drag-and-drop lado a lado:

**Card "PDF da NF":**
- Ícone PDF laranja (círculo com ícone)
- Texto: "PDF da NF"
- Subtexto: "Arraste ou clique para enviar"
- Borda tracejada laranja `border-2 border-dashed border-primary-container/40`

**Card "XML da NF":**
- Ícone XML laranja
- Mesma estrutura do PDF

Ao soltar/selecionar arquivo: simular upload com loading 1s + toast "Arquivo recebido com sucesso"

---

## 8G.5 — 4 Cards de resumo

Abaixo da área de upload, linha de 4 cards com borda lateral colorida:

| Label | Cálculo | Cor borda |
|---|---|---|
| Total Emitido (Mês) | soma de NFs emitidas no mês atual | verde (borda esquerda) |
| Pendentes de Upload | count de vendas com NF pendente | amarelo + ícone `AlertTriangle` "Atenção ao prazo fiscal" |
| Vendas Sem NF | count de vendas aprovadas sem NF anexada | laranja + link "Ver irregularidades" em laranja |
| Meta de Faturamento | (total emitido / meta mensal) * 100 | neutral + barra de progresso laranja |

"Ver irregularidades" navega para `/vendas?semNF=true`.

---

## 8G.6 — Modal "Emitir Nota"

Ao clicar em "Emitir Nota":

Modal `FormEmitirNota.jsx`:
- Venda vinculada (select de vendas aprovadas sem NF)
- Número da NF (input texto)
- Data de emissão (date picker)
- Valor da NF (pré-preenchido com valorTotal da venda, editável)
- PDF da NF (upload)
- XML da NF (upload)
- Informações fiscais: Local da prestação do serviço (select de municípios)

Ao salvar:
1. Marcar `nfAnexada = true` na venda vinculada
2. Atualizar cards de resumo
3. Toast: "Nota Fiscal emitida com sucesso"
4. Registrar no histórico: `{ acao: 'Emissão de Nota Fiscal' }`
