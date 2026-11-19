# TLIM — Tibia Loot & Inventory Manager
### Stage 3: React / TypeScript / Vite

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript_6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Status](https://img.shields.io/badge/Status-In_Progress-yellow?style=for-the-badge)

> The React frontend for [TLIM Stage 2](https://github.com/calgadev/tlim-java), a REST API built in Java / Spring Boot / PostgreSQL. It needs the Stage 2 backend running to work.

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
| UI framework | React 19 + TypeScript 6 |
| Routing | React Router v7 (data router, nested layout route) |
| Data fetching | TanStack Query v5 |
| HTTP client | Axios |
| Styling | Tailwind CSS v3 with project design tokens |
| Components | Own UI kit in `src/components/ui` (no third-party component library) |
| Form handling | React Hook Form + Zod |
| Tests | Vitest + Testing Library (jsdom) |
| Icons | lucide-react |

---

## Architecture

```
src/
├── api/              ← Axios client, error parsing and endpoint functions
│   ├── client.ts         base URL, Bearer interceptor, 401 → /login
│   ├── errors.ts         getApiErrorMessage(): any error → message for the UI
│   ├── auth.ts           login / register
│   ├── catalog.ts        servers, items, creatures (shared catalog)
│   ├── characters.ts     characters, inventory, sale decisions, hunts, market prices
│   └── admin.ts          TibiaWiki scraper and world list import
├── hooks/            ← TanStack Query hooks per domain + centralised query keys
├── contexts/         ← AuthContext (session + JWT expiry), ActiveCharacterContext
├── components/
│   ├── ui/               Button, Card, Field (Input/Select/Textarea/Checkbox), Modal,
│   │                     Table, Badge, StatCard, SegmentedToggle, States, Toast, …
│   ├── AppShell/         layout route: Sidebar + Topbar (character switcher) + <Outlet/>
│   ├── CharacterScope    loads :characterId, handles 404/403, sets the active character
│   └── ItemPicker        debounced item autocomplete
├── pages/            ← One folder per section; panels are shared between pages
├── types/            ← TypeScript interfaces mirroring the tlim-java DTOs
├── lib/              ← cn(), formatting, labels, auth storage helpers
├── App.tsx           ← Route table
└── main.tsx          ← QueryClient, AuthProvider, ToastProvider
```

**Auth flow.** Login returns `{ token, username, role }`. With *Remember me* it is stored in `localStorage`, otherwise in `sessionStorage` (the other storage is always cleared first). An Axios interceptor attaches `Authorization: Bearer <token>` to every call. The JWT has no refresh token and lives 24 h: `AuthContext` reads its `exp` claim and signs the user out when it expires, and any 401 from a protected endpoint clears the session and redirects to `/login?expired=1`.

**Route protection.** `ProtectedRoute` sends signed-out users to `/login`; `adminOnly` sends non-admins to `/dashboard`. Signed-in users visiting `/login` or `/register` go to the dashboard. These are UX conveniences: tlim-java enforces every permission itself.

**Active character.** Inventory, sale decisions and hunts belong to a character. The character picked in the top bar (remembered per browser) is what `/inventory` and `/hunts` open.

---

## Key Technical Decisions

**Dev proxy instead of CORS in development.** Requests go to `/api` on the Vite dev server, which proxies them to the backend (`vite.config.ts`). `VITE_API_BASE_URL` is only needed when the frontend is served from a different origin than the API; tlim-java allows the origins listed in its `CORS_ALLOWED_ORIGINS`.

**Hierarchical query keys.** Keys such as `['inventory', characterId, 'decisions', filters]` let one invalidation refresh a whole area. Importing or deleting a hunt changes the inventory on the server, so both invalidate the character's inventory and decisions; changing a market price invalidates every decision view.

**The catalog is never fetched whole.** `GET /api/items` can return thousands of rows, so item search only runs with 2+ letters or a category and passes `?limit=`. Creatures (no loot in the list) are fetched once and filtered on the client.

**Tolerant error parsing.** tlim-java returns `{ status, error, message }`, but `getApiErrorMessage()` still copes with an empty body, a missing message, a network failure or a 5xx, so every screen shows a useful line instead of a raw Axios error. 4xx responses are not retried.

**`marketPrice: null` vs `0`.** `null` means "not registered yet" (the decision engine flags it); `0` means the item is known to be worthless on the market. The price manager shows them differently, and clearing a price sends `null`.

**Hunt times are shown in UTC.** tlim-java stores the Hunt Analyser's wall-clock times as UTC, so showing them in UTC matches what the player saw in the game client.

**Route-level code splitting.** Every page is loaded with `React.lazy` the first time its route is visited, so the initial bundle only carries the shell, auth and shared libraries.

**Hunt detail route is `/hunts/session/:id`.** `/hunts/:characterId` and a session detail route would both be single-param routes; the `session` segment keeps them unambiguous.

---

## Prerequisites

- Node.js 20+
- The [tlim-java](https://github.com/calgadev/tlim-java) backend running locally (default `http://localhost:8080`), with PostgreSQL. See its README for setup. On first start it imports the official world list; an admin then runs the TibiaWiki scraper from `/admin/scraper` to fill the item and creature catalog.

---

## Environment Variables

All optional. Put them in `.env.local` (ignored by git through `*.local`).

| Variable | Used by | Description |
|---|---|---|
| `VITE_API_PROXY_TARGET` | dev server | Where `/api` is proxied. Default `http://localhost:8080` |
| `VITE_API_BASE_URL` | build | Absolute API URL when the built app is served from another origin. Leave unset to use relative `/api` |

---

## Running Locally

```bash
# 1. Clone and install
git clone https://github.com/calgadev/tlim-frontend.git
cd tlim-frontend
npm install

# 2. Start tlim-java (see its README), then the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and register an account. Admin accounts are created by tlim-java from `TLIM_ADMIN_USERNAME` / `TLIM_ADMIN_PASSWORD`.

```bash
npm test        # Vitest + Testing Library
npm run build   # type-check + production build into dist/
npm run lint
```

---

## Routes

Routes marked USER need a signed-in user; ADMIN routes send other users to `/dashboard`.

| Path | Description | Auth |
|---|---|---|
| `/` | Redirects to `/dashboard` or `/login` | — |
| `/login`, `/register` | Sign in / create an account | Public |
| `/dashboard` | Active character overview: passive gold, recent hunts, best sales | USER |
| `/characters` | Character list | USER |
| `/characters/new`, `/characters/:id/edit` | Create / edit (name, world, vocation) | USER |
| `/characters/:id` | Character detail with Inventory, Sell and Hunt history tabs | USER |
| `/inventory` | Opens the active character's inventory | USER |
| `/inventory/:characterId` | Inventory with targets, deficit and surplus | USER |
| `/inventory/:characterId/sell` | Sale decisions (uses the character's world prices) | USER |
| `/hunts` | Opens the active character's hunts | USER |
| `/hunts/:characterId` | Hunt list with location filter | USER |
| `/hunts/:characterId/import` | Hunt Analyser import (text or JSON) | USER |
| `/hunts/session/:id` | Hunt session detail | USER |
| `/wiki` | Catalog index | USER |
| `/wiki/items`, `/wiki/items/:id` | Item search and detail with NPC buyers | USER |
| `/wiki/creatures`, `/wiki/creatures/:id` | Creature list and detail with damage modifiers and loot | USER |
| `/servers` | Official worlds (create/edit/delete for ADMIN) | USER |
| `/prices/:serverId` | Market prices of a world; `?character=` lists that character's missing prices | USER |
| `/admin` | Admin panel: scraper status, world list import | ADMIN |
| `/admin/scraper` | TibiaWiki scraper with scope and 5 s status polling | ADMIN |

---

## What is NOT in scope for Stage 3

- Email verification, password reset, OAuth or social login
- Role-based access beyond USER / ADMIN
- Tibia.com live API integration (character lookup, server status)
- Push notifications or real-time updates (WebSocket, SSE)
- Pagination (the backend returns full lists)
- Soft delete / undo, audit trail
- Multi-language / i18n
- Mobile app

---

## Implementation Phases

- [x] **Foundation:** scaffold, design tokens, UI kit, typed API layer synced with tlim-java, auth with JWT expiry, layout route
- [x] **Characters:** list, create/edit with world picker, detail with tabs, active character switcher
- [x] **Inventory and sale decisions:** colour-coded inventory, upsert modal with item autocomplete, decision filters, totals, missing-price alert
- [x] **Hunt sessions:** list with location filter, text/JSON import with skipped-name report, detail, delete (reverts inventory)
- [x] **Wiki:** item search and detail, creature list and detail
- [x] **Market prices and servers:** inline price editing with null-vs-0, missing prices from the sale view, world list with admin CRUD
- [x] **Admin:** scraper with scope, polling, 409 / FAILED handling and results; world list import
- [x] **Quality:** Vitest + Testing Library tests, route-level code splitting, GitHub Actions CI (lint, test, build)
- [ ] **Next:** deployment

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
