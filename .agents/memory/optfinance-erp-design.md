---
name: OptFinance ERP — Design System
description: Precision Architect color token setup and conventions for OptFinance ERP
---

## Rule
Tailwind v4 colors are registered using `@theme { --color-*: hex; }` (NOT `@theme inline` which uses CSS var references). Direct hex values only.

**Why:** `@theme inline` maps to CSS variables using `hsl(var(--x))` — incompatible with the hex-based Precision Architect palette. Using bare `@theme` registers utilities like `bg-primary`, `bg-inverse-surface` directly.

## Key tokens
- Primary: `#9D4300` (dark orange) — `bg-primary`
- Primary container: `#F97316` (bright orange) — `bg-primary-container`
- Sidebar: `#111827` — `bg-inverse-surface`
- Surface: `#F3F4F6` — `bg-surface`
- Text: `#141B2B` — `text-on-surface`, muted: `#6B7280` — `text-text-muted`

## Status badge color rules
- paga/ativo/ativa = green `#2E7D32`
- vencida/cancelada/inadimplente = red `#C62828`
- em-aberto/prevista/projecao = yellow `#F57F17`
- pagamento-parcial = orange `#F97316`
- quitado/tertiary = blue `#006398`
- encerrada/inativa = gray `#6B7280`

## tsconfig
Local `tsconfig.json` needs `"allowJs": true, "checkJs": false` to support .jsx files alongside .tsx in Vite+TypeScript.
