# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Run production server
```

There are no test or lint commands configured.

## Environment Variables

Create a `.env.local` file (never committed) with:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
EVOLUTION_API_URL=https://api.evolution.example.com
EVOLUTION_API_KEY=your-api-key
```

## Architecture

This is a **Next.js 15** app acting as a backend + API host for a CRM system. The frontend is **not** a React app — it lives entirely in a single vanilla JS/CSS/HTML file at `public/crm.html` (~3800 lines). The Next.js `app/` directory only hosts API routes and a root `page.js` that redirects to `/crm.html`.

```
public/crm.html          ← Entire frontend SPA (vanilla JS, inline CSS)
app/
  page.js                ← Redirects to /crm.html
  layout.js              ← Root layout (dark theme, pt-BR lang)
  api/
    leads/               ← CRUD for leads + status history
    vendas/              ← CRUD for sales records
    settings/            ← Key-value config store (GET/PUT ?key=X)
    whatsapp/            ← Proxy to Evolution API (instances, send)
lib/
  db.js                  ← Supabase singleton client (server-side only)
```

### Frontend (`public/crm.html`)

All UI pages (Dashboard, Leads, Pipeline, Follow-up, Vendas, Relatórios, Disparos, WhatsApp, Equipe) are rendered inside a single HTML file via JS-driven show/hide. State is kept in global `let` variables (`leads`, `vendas`, `contaWaMap`, etc.) with `localStorage` used as an offline cache. The XLSX library is loaded from CDN for import/export.

When editing the frontend, all changes go into `public/crm.html`. There is no build step for the frontend.

### Backend (Next.js API Routes)

All API routes use the Supabase service role key (`lib/db.js`) — there is no row-level security from the client side. Key conventions in the routes:

- `PUT /api/leads/[id]` automatically inserts a row into `lead_history` when `status` changes.
- `GET /api/settings?key=X` / `PUT /api/settings?key=X` store JSON blobs in a `settings` table (key-value pattern).
- `/api/whatsapp/*` routes are thin proxies to the **Evolution API** (external WhatsApp gateway). The proxy forwards requests using `EVOLUTION_API_URL` + `EVOLUTION_API_KEY`.

### Database (Supabase / PostgreSQL)

Schema is managed directly in the Supabase dashboard (no migration files in the repo). Tables inferred from API routes:

| Table | Key columns |
|---|---|
| `leads` | `nome`, `tel`, `carro`, `cidade`, `status`, `origem`, `valor`, `followup`, `exec`, `obs`, `status_at` |
| `vendas` | `cliente`, `data`, `carro`, `plano`, `valor`, `origem`, `exec` |
| `lead_history` | `lead_id`, `status`, `obs`, `created_at` |
| `settings` | `key` (unique), `value` (JSON) |

### WhatsApp Integration

The app integrates with **Evolution API** for WhatsApp. Instances represent individual WhatsApp accounts. The `/api/whatsapp/instances/[name]` route supports `?action=qrcode`, `?action=status`, and `?action=disconnect`. Bulk messaging in the frontend uses anti-spam intervals configured per send job.

## Key Conventions

- **Path alias:** `@/*` resolves to the repo root (`jsconfig.json`).
- **Language:** The UI is in **Brazilian Portuguese**. Keep all user-visible strings in pt-BR.
- **No authentication:** There is currently no login system. The hardcoded user is "Cássio Junior" / role "Executivo LOOVI".
- **Deployment target:** Vercel (`vercel.json` present). No Docker.
