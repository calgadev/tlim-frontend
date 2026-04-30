# TLIM — Tibia Loot & Inventory Manager
### Stage 3: React / TypeScript / Vite

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Status](https://img.shields.io/badge/Status-In_Progress-yellow?style=for-the-badge)

> The React frontend for [TLIM Stage 2](https://github.com/calgadev/tlim-java) — a production-grade REST API built in Java / Spring Boot / PostgreSQL. Requires the Stage 2 backend running locally to function.

---

## What is TLIM?

TLIM is a personal portfolio project built to solve real problems faced by players of the MMORPG [Tibia](https://www.tibia.com):

- **What should I do with my loot after a hunt?** Keep it, sell to an NPC, or list on the market?
- **Where should I grind?** Which hunting spots actually generate the most value over time?

Stage 1 proved the concept with a working Python/FastAPI MVP. Stage 2 rebuilt the foundation as a production-grade REST API. Stage 3 delivers the first real user interface: a fully reactive frontend that exposes all backend features including inventory management, a sale decision engine, hunt session import, a TibiaWiki browser, and an admin panel with scraper control.

---

## Project Roadmap

| Stage | Stack | Repository | Status |
|---|---|---|---|
| Stage 1 — Backend + Server-side UI | Python 3.12 · FastAPI · SQLAlchemy 2.0 · SQLite · Jinja2 | tlim-python2 | ✅ Complete |
| Stage 2 — Backend rewrite | Java 17 · Spring Boot · Spring Data JPA · PostgreSQL · Maven | [tlim-java](https://github.com/calgadev/tlim-java) | ✅ Complete |
| Stage 3 — Modern frontend | React 19 · TypeScript · Vite · TanStack Query · Tailwind CSS | tlim-frontend *(current)* | 🚧 In Progress |

The project is intentionally developed in three stages with different stacks to demonstrate that the same problem can be solved across different languages and technologies — showing transferable knowledge rather than familiarity with a single tool.

---

## How this project was built

Stage 3 was developed using a structured AI-assisted development methodology — a pipeline that takes a project from idea to deploy using large language models at each stage of the process.

| Stage | Purpose |
|---|---|
| **Research** | Understand the problem domain, constraints, and prior art before writing any spec |
| **Specification** | Produce a detailed, unambiguous spec that drives all subsequent development |
| **Setup** | Initialize the project environment, dependencies, and base configuration |
| **Issue breakdown** | Decompose the spec into discrete, implementation-ready Kanban cards |
| **Code generation** | Write production code following the spec and security requirements |
| **Code review** | Audit generated code for security issues, sensitive data exposure, spec conformance, and code quality — before any commit |
| **Debug** | Isolate and fix errors surfaced during development or testing |
| **Deploy** | Package and deploy the application to the target environment |

Each stage uses purpose-built prompts and skills designed to produce consistent, auditable outputs. The code review stage acts as a quality gate: no code is committed without passing security and conformance checks.

This methodology is the foundation of a future SaaS product aimed at enabling non-developers to go from idea to deployed microSaaS using AI. TLIM Stage 3 is its second real-world validation.

---

## Tech Stack

| Concern | Library |
|---|---|
| Build tool | Vite 8 |
| UI framework | React 19 + TypeScript 5 |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 (React Query) |
| HTTP client | Axios |
| Styling | Tailwind CSS v3 |
| Component library | shadcn/ui |
| Form handling | React Hook Form + Zod |
| Icons | lucide-react |

---

## Architecture

```
src/
├── api/              ← Axios instance + all endpoint functions (one file per domain)
├── components/       ← Shared, reusable UI pieces (not tied to a route)
├── contexts/         ← React contexts (AuthContext)
├── hooks/            ← Custom hooks that wrap TanStack Query calls
├── pages/            ← One folder per route; contains the route component + sub-components
├── types/            ← All TypeScript interfaces derived from the Stage 2 API
├── lib/
│   └── utils.ts      ← cn() helper (clsx + tailwind-merge) and other pure utilities
├── App.tsx           ← React Router route definitions with ProtectedRoute wrappers
└── main.tsx          ← ReactDOM root with QueryClientProvider + AuthProvider
```

**Auth flow** — JWT token, username, and role are persisted to `localStorage` via `AuthContext`. An Axios request interceptor attaches `Authorization: Bearer <token>` to every API call. A response interceptor clears all three `localStorage` keys and redirects to `/login` on any 401 response.

**Route protection** — `ProtectedRoute` redirects unauthenticated users to `/login`. An `adminOnly` flag redirects non-admin users to `/dashboard`. Admin routes (`/admin/**`) are wrapped with `adminOnly`.

---

## Key Technical Decisions

**TanStack Query with `staleTime: 30_000` and `retry: 1`** — API data is considered fresh for 30 seconds before a background refetch is triggered. One retry is attempted on failure before surfacing an error to the UI. This avoids hammering the backend on transient errors without silently swallowing them.

**Axios interceptor reads `localStorage` at call time** — The Bearer token is read inside the request interceptor function, not captured at module initialisation. This means a logout immediately prevents the token from being attached to any subsequent request, with no need to recreate the Axios instance.

**401 interceptor clears all three `localStorage` keys** — On a 401 response, `token`, `username`, and `role` are all removed before redirecting to `/login`. Clearing only the token would leave `username` and `role` in storage, creating an inconsistent auth state on next page load.

**`cn()` utility wraps `clsx` + `tailwind-merge`** — Class names are composed with `clsx` for conditional logic and deduplicated with `tailwind-merge` to prevent Tailwind utility conflicts (e.g. `p-2` being overridden by `p-4` without the last-wins semantics). This is the standard pattern used by shadcn/ui components.

**`marketPrice: null` vs `0` preserved in the type system** — `ServerItemPriceResponse.marketPrice` is typed as `number | null`. `null` means "price not yet registered"; `0` means the item is known to be worthless. These are semantically distinct and rendered differently in the price manager UI.

**Hunt detail route uses `/hunts/session/:id`** — The spec defines both `/hunts/:characterId` (character hunt list) and `/hunts/:id` (session detail). Both are single-param routes and would be ambiguous in React Router. The session detail route uses `/hunts/session/:id` to make routing unambiguous without restructuring the URL namespace.

---

## Prerequisites

- Node.js 20+ (install via [nvm](https://github.com/nvm-sh/nvm))
- The TLIM Stage 2 backend running at `http://localhost:8080`

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Stage 2 REST API |

⚠️ Never commit your `.env.local` file to GitHub. It is protected by `*.local` in `.gitignore`.

---

## Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/calgadev/tlim-frontend.git
cd tlim-frontend

# 2. Install dependencies
npm install

# 3. Create your environment file
echo "VITE_API_BASE_URL=http://localhost:8080" > .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Make sure the Stage 2 backend is running before logging in — the frontend has no mock data layer.

---

## Routes

All protected routes redirect unauthenticated users to `/login`. Routes marked ADMIN redirect non-admin users to `/dashboard`.

| Path | Description | Auth |
|---|---|---|
| `/` | Redirects to `/dashboard` if logged in, `/login` otherwise | — |
| `/login` | Login form | Public |
| `/register` | Register form | Public |
| `/dashboard` | Overview: characters, recent sessions, quick decisions | USER |
| `/characters` | Character list | USER |
| `/characters/new` | Create character | USER |
| `/characters/:id` | Character detail with Inventory, Hunt History, and Sell tabs | USER |
| `/inventory/:characterId` | Full inventory view for a character | USER |
| `/inventory/:characterId/sell` | Sale decision view (requires server selection) | USER |
| `/hunts/:characterId` | Hunt session list with location filter | USER |
| `/hunts/:characterId/import` | Hunt Analyser import form | USER |
| `/hunts/session/:id` | Single hunt session detail | USER |
| `/wiki/items` | Item browser with name/category search | USER |
| `/wiki/items/:id` | Item detail with NPC buyers and loot sources | USER |
| `/wiki/creatures` | Creature browser | USER |
| `/wiki/creatures/:id` | Creature detail with stats, resistances, loot table | USER |
| `/prices/:serverId` | Market price manager for a server | USER |
| `/servers` | Server list and management | USER |
| `/admin` | Admin panel | ADMIN |
| `/admin/scraper` | Scraper trigger and status polling | ADMIN |

---

## What is NOT in scope for Stage 3

- Email verification, OAuth, or social login
- Role-based access beyond USER / ADMIN binary
- Tibia.com live API integration (character lookup, server status)
- Push notifications or real-time updates (WebSocket, SSE)
- Pagination on any list endpoint (the backend returns full lists)
- Soft delete / undo functionality
- Audit trail / change history
- Multi-language / i18n
- Mobile app (React Native)

---

## Implementation Phases

### Phase 1 — Foundation *(current)*
- [x] Project scaffold (Vite + React + TypeScript)
- [x] All dependencies installed (React Router, TanStack Query, Axios, React Hook Form, Zod, Tailwind CSS, shadcn/ui)
- [x] TypeScript interfaces for all API response and request shapes
- [x] Axios instance with JWT request interceptor and 401 response interceptor
- [x] AuthContext with login/logout and localStorage persistence
- [x] ProtectedRoute with adminOnly support
- [x] React Router with all routes stubbed

### Phase 2 — Character Management
- [ ] Character list page
- [ ] Create / edit character form (server selector, vocation selector)
- [ ] Character detail page with tab shell (Inventory, Hunt History, Sell)

### Phase 3 — Inventory and Sale Decision Engine
- [ ] Inventory table with color-coded rows (deficit / surplus / neutral)
- [ ] Inline upsert modal and delete
- [ ] Sale decision view: server selector, decision table, summary cards, missing-price alert

### Phase 4 — Hunt Sessions
- [ ] Hunt session list with debounced location filter
- [ ] Hunt Analyser import form (text / JSON toggle, optional fields)
- [ ] Hunt session detail (stats, loot table, kill table, skip warnings)

### Phase 5 — Item and Creature Wiki Browsers
- [ ] Item browser with debounced name / category search
- [ ] Item detail with NPC buyers table and boolean badges
- [ ] Creature browser
- [ ] Creature detail with resistance table (color-coded) and loot table

### Phase 6 — Market Prices and Server Management
- [ ] Market price manager with inline editing and null-vs-0 distinction
- [ ] Server list and create / edit form
- [ ] Missing-price CTA linking from sale decision to pre-filtered price manager

### Phase 7 — Admin Panel
- [ ] Scraper trigger button with 5-second status polling while RUNNING
- [ ] 409 "already running" friendly message
- [ ] Scraper result display (items scraped, failures, duration)

---

## Sobre o projeto

O TLIM nasceu de duas dores reais de um jogador de Tibia: saber o que fazer com o loot após uma hunt, e ter histórico estruturado de sessões para comparar onde vale mais a pena caçar.

Este projeto é a terceira etapa de um portfólio desenvolvido em três stacks diferentes — Python/FastAPI/SQLite, Java/Spring Boot/PostgreSQL e React/TypeScript. O Stage 3 entrega a primeira interface real para os dados do Stage 2, construída com React 19, TanStack Query e Tailwind CSS. A ideia central continua a mesma: demonstrar raciocínio transferível entre tecnologias diferentes, não familiaridade com uma única ferramenta.

Faz parte de uma transição de carreira de Analista de Sistemas para Desenvolvedor.

---

## Author

**Guilherme Calgaro**
Systems Analyst | AI-assisted development methodologies
[LinkedIn](https://www.linkedin.com/in/guilherme-de-oliveira-calgaro/) · [GitHub](https://github.com/calgadev)
