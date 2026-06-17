---
type: idea
summary: "Native mobile app (React Native + Expo) for the customer panel: open app → pick customer-or-gardener → (customer) map your garden by auto-fill, order services, requests route to the Kryscar team, watch upcoming visits, get push when a gardener is coming. Auth via Better Auth Expo; a thin authenticated mobile JSON API wraps the existing owner-scoped data layer; no tenancy/role change in v1. Horizon: a full gardening marketplace (gardener self-signup = new tenant, or join a company with an invite code)."
tags: [product, vision, mobile, expo, auth, platform, maps]
status: active
created: 2026-06-17
updated: 2026-06-17
related: ["[[2026-06-03-customer-garden-portal]]", "[[customer-auth]]", "[[customer-lawns]]", "[[service-requests]]", "[[team-schedule]]", "[[tenancy-and-roles]]", "[[transactional-email]]", "[[payload-backend]]"]
sources: []
maturity: shaping
---

> **Shaping idea — captured from a brainstorming session (2026-06-17).** Decisions
> below were made live with the owner; the design is worked, not raw. Graduate **v1**
> to a `specs/YYYY-MM-DD-*-design.md` + `plans/` plan before any code. The marketplace
> (Phase 2) gets its OWN spec later. Intended to be picked up cold by a future session.

## One-liner
Take the customer panel native: open the app, say whether you want services or you're a
gardener, and (as a customer) map your garden in a couple of taps, choose what needs
doing, and people arrive. The web panel stays the gardener/admin surface; the marketplace
(be your own gardening business, or join one) is the north star.

## Decisions locked in the brainstorm
1. **Staged, not big-bang.** v1 ships the Expo app on the **current single-tenant model**.
   No tenancy/role backend changes. The marketplace is a deliberate Phase 2.
2. **Role choice on entry, customer-only functional in v1.** First screen asks
   *"Zlecam usługi" (customer)* vs *"Jestem ogrodnikiem" (gardener)*. **Gardener → a polite
   "Niedostępne w aplikacji — skorzystaj z panelu na kryscar.pl" screen** (link out); we do
   NOT mint gardener accounts from mobile in v1. **Customer → full app**, and their requests
   route to the **Kryscar team** (exactly today's behaviour — single tenant). Because we
   never set `role` from mobile, the existing "role is admin-only-writable" guard
   ([[tenancy-and-roles]]) is untouched — **zero backend role/tenancy work for v1.**
3. **Garden mapping = auto-fill first, no manual draw.** Map (satellite) → address search or
   drop-a-pin on the house → the EXISTING server auto-fill (ULDK parcel + OSM buildings,
   `src/lib/boundary/*`) returns the parcel boundary minus buildings + net area → customer
   confirms & names it. Finger-drawing a polygon is *not* in the mobile MVP (it's the
   "fine-tune in the web panel" nicety). This is both less work and a better touch UX.
4. **Push notifications in v1.** Expo push alongside the existing email on
   accept/decline/visit-scheduled ([[team-schedule]], [[transactional-email]]). It's the
   expected mobile channel for "a gardener is coming."

## Why Expo (and why it fits this backend)
- The backend is Next + Payload + Better Auth. **Better Auth has a first-class Expo
  integration** (`@better-auth/expo`) — the deciding factor. Same `/api/auth/*` server, the
  app just adds the `expo()` server plugin and the app scheme to `trustedOrigins`.
- Expo gives us EAS Build/Submit, push, secure storage, OTA updates — fastest path to a
  real app from a TS/React team.

## v1 architecture (recommended approaches + why)
**Repo structure — monorepo-light (recommended).** Keep the Next/Payload app exactly where
it is at root (don't disturb the live Vercel deploy or the Mind globs); add the Expo app as
a sibling **`/mobile`** with its own `package.json`. The app talks to the backend purely
over HTTP, so it imports no server code — it needs only a few response **DTOs**
(`/mobile/src/api/types.ts`, hand-synced with `src/payload-types.ts`; they're small).
*Rejected:* a formal npm-workspaces restructure (`/apps/web` + `/apps/mobile`) — cleanest
long-term but moves the whole web app and risks the prod deploy; a separate repo — splits
the Mind and loses type-sharing. **Revisit workspaces when Phase 2 starts.**

**API surface — thin authenticated Next route handlers (recommended).** New
`src/app/api/mobile/v1/.../route.ts` handlers, each: `auth.api.getSession({ headers })` →
`userId` → call the EXISTING owner-scoped data-layer fn → return purpose-built JSON.
Endpoints: `GET/POST /gardens`, `POST /gardens/autofill`, `GET /services`, `POST /quote`,
`POST /requests`, `GET /requests`, `GET /visits/upcoming`, `POST /push/register`. Versioned
(`/v1`). *Rejected:* exposing Payload REST/GraphQL directly — the ops collections are
access-closed (`mcpOnly`, admin-only; see [[payload-backend]]), so using them would mean
re-opening access and re-implementing ownership there, re-litigating a settled decision.
The data-layer fns already carry the ownership boundary — wrap, don't rebuild.

**Auth transport — Better Auth Expo.** Session lives in `expo-secure-store`, rides as a
cookie. Packages: `better-auth`, `@better-auth/expo`, `expo-secure-store`, `expo-network`
(+ `expo-linking`, `expo-web-browser`, `expo-constants` if social later). Client:
`createAuthClient({ baseURL, plugins: [expoClient({ scheme: "kryscar", storagePrefix:
"kryscar", storage: SecureStore })] })`. Server: add `expo()` to the BA `plugins` and add
the app scheme(s) to `trustedOrigins` (prod `kryscar://`, dev `exp://` — **no wildcard**,
honouring [[scoped-trusted-origins]]). For calls to non-BA endpoints the BA docs say grab
`authClient.getCookie()` and send it as a `Cookie` header; our mobile API simply re-uses
`auth.api.getSession` so the cookie flows through. Native fetch isn't subject to browser
CORS, so no origin relaxation is needed.

## Backend additions (all additive, no tenancy/role change)
1. `expo()` BA plugin + app scheme in `trustedOrigins` (`src/lib/auth.ts`).
2. **Mobile API** (`src/app/api/mobile/v1/*`) wrapping: `getMyLawns`/`createLawn`/
   `autoFillLawnAction`→`autoFillLawn`, `getConfiguratorServices`+`estimate`/`createRequest`,
   `getMyRequests`, `getUpcomingVisitsForCustomer`. DTO mappers + a `check-mobile-api` logic
   test for them.
3. **Push tokens:** a small access-closed `device-tokens` collection (`user`,
   `expoPushToken`, `platform`, `tenant`) + register endpoint; `src/lib/push.ts` (Expo push
   send) called next to the email hooks in `src/lib/team.ts` (accept/decline/schedule) —
   email + push both fire-and-forget, neither can break the action.

## The Expo app (`/mobile`)
- **Stack:** Expo SDK 53+, `expo-router` (file-based nav), TypeScript, NativeWind (Tailwind
  for RN) to mirror the web's emerald look, `react-native-maps` (Google provider — reuse the
  existing Maps key) for satellite display + polygon overlay (display only, no draw editor).
- **Onboarding:** splash (brand logo) → **role choice** → gardener: "use the web panel"
  screen; customer: BA Expo sign-in/sign-up + forgot-password (reuse the BA endpoints just
  shipped, [[transactional-email]]).
- **Customer tabs:** **Moje ogrody** (list + Add Garden), **Zamówienia** (requests + status +
  "Najbliższa wizyta"), **Profil** (account, sign out, push toggle).
- **Add Garden:** map → search/drop pin → `/gardens/autofill` → render parcel polygon +
  buildings + net m² → name & save. **Order:** `/services` → toggle + qty → live total from
  `/quote` → submit → `/requests`.

## Access control & mobile clients (the security story)
Identity = the BA session only; **ownership lives in the data layer** (every query filters
`owner == userId`). The app holds the session in SecureStore; every API call carries it;
each handler resolves `getSession` → `userId` → owner-scoped fn. No collection is opened;
no customer can read another's data; gardener/admin surfaces stay web-only and unreachable
from the customer app. Same trust posture as the web — re-used, not re-invented.

## Testing & distribution
Backend: a node:assert `check-mobile-api` for the DTO mappers (handlers reuse already-tested
fns). App: targeted tests for the API client + quote/labels; manual E2E on Expo Go + an EAS
**preview** build. Distribution: EAS Build → internal/TestFlight + Play internal testing for
v1; public store release (accounts, assets, review) is a later step.

## Phase 2 — the marketplace (own spec; NOT v1)
The north star the owner wants: gardening **marketplace**. A signup can **create a company**
(→ a new `tenants` row; the gardener becomes that tenant's owner) **or join an existing
company with an invite code**. Then: gardener mobile flows; **request routing/matching** of a
customer's request to a provider (by area / pick-a-provider / open board); **per-tenant data
isolation** across lawns/requests/visits; **provider onboarding & verification**; **payouts**
(Stripe Connect — see the Stripe phase in [[2026-06-03-customer-garden-portal]]). The backend
tenancy **seam** ([[tenancy-and-roles]]: a real `tenants` collection + `tenant`/`role` on
users + the default-tenant hook) was built precisely so this slots above v1 without a
migration. Likely vehicle: Better Auth **organization** plugin (`organization-best-practices`
skill) mapped onto tenants, or `@payloadcms/plugin-multi-tenant`. **Big enough to be its own
product** — keep it out of v1.

## Open questions / risks (resolve at spec time)
- **Deep-link scheme + universal links** — finalise `kryscar://`, configure `app.json`, and
  the `exp://` dev origins; confirm BA reset/verify links open correctly on device.
- **`react-native-maps` key config** — separate iOS/Android Maps API keys + restrictions
  (the web key is referrer-restricted); satellite tiles ToS for display.
- **RODO/GDPR** — push tokens + home location + parcel geometry are personal data; consent +
  retention story (this already applies to the web; mobile adds device tokens).
- **EAS accounts** — Apple Developer + Google Play accounts, signing, and a push credential
  (APNs/FCM) are prerequisites for production push.
- **DTO drift** — `/mobile/src/api/types.ts` is hand-synced to `payload-types.ts`; a
  `check-mobile-api` guard + a note in the mobile zone should pin this. (If it bites,
  promote to a shared `/packages` in the Phase-2 workspace move.)
- **The eventual gardener-from-mobile path** — when Phase 2 lands, setting `role`/creating a
  tenant from a client needs a controlled server path (signup additionalFields + a validated
  hook, or a "create company" action), since `role` is admin-only-writable today.
- **Offline / flaky network** — minimum viable: optimistic UI + retry on the few mutations;
  full offline is out of scope.

## Plugs into what exists
[[customer-auth]] (BA — add the Expo plugin) · [[customer-lawns]] (`autoFillLawn` server
logic, reused as the mapping API) · [[service-requests]] (`estimate`/`createRequest`, the
order flow) · [[team-schedule]] (visits = "people arrive"; push next to its notify hooks) ·
[[transactional-email]] (reset/verify endpoints the app reuses; push mirrors its email
events) · [[tenancy-and-roles]] (the seam the marketplace grows from). Skills for later:
`better-auth-best-practices`, `organization-best-practices`, `stripe-best-practices`.
