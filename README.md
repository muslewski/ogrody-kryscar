<div align="center">

![Ogrody Kryscar](./.github/banner.png)

# Ogrody Kryscar

**Marketing site + customer portal for a garden & lawn-care company near Bydgoszcz.**
Browse services and pricing, then draw your lawn on satellite imagery, order work, and track visits — all in one panel.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Payload](https://img.shields.io/badge/Payload-3-000000?logo=payloadcms&logoColor=white)](https://payloadcms.com)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.6-1E1E1E)](https://better-auth.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## What it is

A production web platform for **Ogrody Kryscar** (*Ogrodnictwo z pasją*, est. 2014). Two surfaces share one codebase and one backend:

- **Public site** — services, pricing, project gallery, seasonal guides, and local-SEO city pages that turn visitors into leads.
- **Customer portal** — a logged-in space where a customer maps their lawn from satellite imagery, configures services against live pricing, and follows the work; gardeners get a role-scoped view of the same data.

Payload CMS is the backend for both. Marketing content, the service catalog, lawns, and orders are all Payload collections — there is no second database.

## Features

### Public site
- **Service catalog & landing pages** — eight services with per-service pages (`/uslugi/[usluga]`), category filtering, and motion reordering.
- **Pricing calculator** — interactive area × frequency estimate driven by the same pricing engine the portal uses.
- **Realizacje** — before/after project gallery with a draggable comparison slider (`/realizacje`).
- **Ogrodowe ABC** — seasonal gardening guides (`/ogrodowe-abc`), cross-linked with services.
- **Local SEO** — per-city pages (`/ogrodnik/[miasto]`), a service-area coverage map, plus sitemap, robots, and canonical wiring.
- **Polished delivery** — blur-up image loading, a 3D section (React Three Fiber), and motion primitives throughout.

### Customer portal (authenticated)
- **My Lawn** (`/panel/ogrody`) — search an address, draw a lawn polygon over Google satellite imagery, watch the area compute live, and save it (owner-scoped).
- **Order services** (`/panel/ogrody/[id]/zamow`) — a smart configurator prices a basket live and saves it as a server-recomputed order snapshot (`/panel/zamowienia`).
- **Role-gated shells** — `/panel` for customers, `/zespol` for gardeners, behind a shared shadcn sidebar with role-driven navigation.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router) · **React 19** |
| Backend / CMS | **Payload 3** — `/admin` panel, Lexical rich text |
| Database | **PostgreSQL** (Neon) via `@payloadcms/db-postgres`, UUID keys |
| Auth | **Better Auth** for customers/gardeners, through a custom BA → Payload Local-API adapter |
| Storage | **Vercel Blob** for media (blur placeholders generated on upload) |
| Styling | **Tailwind CSS 4** · **shadcn/ui** (new-york) · **Radix UI** |
| Maps & geometry | **Google Maps JS API** · `proj4` · `polygon-clipping` (lawn drawing & area calc) |
| Motion / 3D | **Motion** · **Three.js** + **React Three Fiber** |
| Validation | **Zod 4** (typed env + form schemas) · **TypeScript 5** |
| Images | **sharp** (blur-up pipeline) |

> **Note:** this repo runs a *modified* build of Next.js — APIs and conventions can differ from upstream. Read `AGENTS.md` and `node_modules/next/dist/docs/` before writing Next code.

## Getting started

### Prerequisites
- **Node.js ≥ 20.9** and **npm**
- A **PostgreSQL** database (Neon recommended)

### 1. Install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Fill in the values below (`.env.local` is git-ignored — never commit real secrets):

| Variable | Required | Purpose |
|---|:---:|---|
| `DATABASE_URI` | ✅ | Postgres (Neon) connection string |
| `PAYLOAD_SECRET` | ✅ | Payload admin secret (≥ 16 chars) |
| `BETTER_AUTH_SECRET` | ✅ | Customer-auth signing secret (≥ 16 chars) |
| `DATABASE_URI_DIRECT` | — | Direct (non-pooled) URI for schema push / migrations |
| `BLOB_READ_WRITE_TOKEN` | — | Vercel Blob token (falls back to local disk if unset) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | — | Google Maps — needed for the lawn drawing flow |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | — | Cloud Map Style id for the satellite map |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | — | Coverage map tiles |
| `NEXT_PUBLIC_APP_URL` | — | Public origin override (auto-derived on Vercel) |

### 3. Generate types & seed
```bash
npm run generate:types   # Payload → src/payload-types.ts
npm run seed             # seed the tenant, services, and demo content
```

### 4. Run
```bash
npm run dev
```
- App → **http://localhost:1111**
- Payload admin → **http://localhost:1111/admin**

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Start the dev server on port **1111** |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (port 1111) |
| `npm run lint` | ESLint |
| `npm run check` | Full gate — `tsc --noEmit` + ESLint + Payload types + Mind generator |
| `npm run seed` | Seed the database |
| `npm run generate:types` | Regenerate Payload types |
| `npm run blur` | Regenerate blur-up image placeholders |
| `npm run mind` | Rebuild the Mind index (see below) |

## Project structure

```
src/
  app/                 # Next.js App Router — (public) marketing + (auth) + /panel + /zespol
  collections/         # Payload collections (Users, Sessions, Lawns, Services, ServiceRequests, …)
  components/          # shadcn/ui primitives + feature components
  lib/                 # data, pricing engine, env (zod), Better Auth + Payload adapter
  payload.config.ts    # Payload setup — Postgres adapter, Blob storage, collections
kryscar-mind/          # "the Mind" — the project's knowledge base (see below)
scripts/               # seed, blur generator, Mind generator
public/img/            # self-hosted imagery (garden / projects / …)
```

## The Mind

This repo carries its own knowledge base — **the Mind**, at [`kryscar-mind/`](./kryscar-mind) — as the single source of truth for how the system works. A generator (`npm run mind`) builds a map of ~23 zones from the code; `npm run check` fails on broken anchors, keeping the docs honest. Start at `kryscar-mind/map/index.md`.

## License

Private and proprietary — © Ogrody Kryscar. All rights reserved.
