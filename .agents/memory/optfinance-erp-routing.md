---
name: OptFinance ERP — Routing
description: wouter routing setup, PrivateRoute pattern, and route base config
---

## Rule
Uses **wouter** (not react-router-dom). Never install or use react-router-dom in this project.

**Why:** Established early; all existing components use useLocation, Link from 'wouter'.

## PrivateRoute pattern
```jsx
function PrivateRoute({ component: Component }) {
  const { autenticado } = useAuth()
  const [, setLocation] = useLocation()
  if (!autenticado) { setLocation('/login'); return null }
  return <AppShell><Component /></AppShell>
}
```

## Router base
```jsx
<WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
```
BASE_URL is "/" so base resolves to "" — routes like `/login`, `/` work normally.

## Data files
All 13 JSON data files live in `src/data/`. Export hub at `src/data/index.js` with filter helpers and `getSummaryFinanceiro()`.
