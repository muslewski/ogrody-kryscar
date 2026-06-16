# Transactional Email (Resend) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire transactional email — Better Auth password-reset + soft (non-blocking) email verification, and order/visit notifications (new request → team + ops inbox; accepted/declined/visit-scheduled → customer) — through a self-contained Resend + React Email module that self-disables without a key and never lets a failed send break a DB write.

**Architecture:** One seam at `src/lib/email/` (client → send → notifications, plus pure `recipients` + React Email `templates/`). Better Auth's `sendResetPassword` / `emailVerification.sendVerificationEmail` callbacks and the existing data-layer functions (`requests.ts`, `team.ts`) call into it fire-and-forget. New `(auth)` UI for forgot/reset password. Verification is soft (no `requireEmailVerification`).

**Tech Stack:** Resend SDK v6, `@react-email/components` v1 + `@react-email/render` v2, Better Auth 1.6, Payload 3.85 Local API, Next 16 App Router, React 19. Tests follow the repo convention: `node:assert` scripts run via `tsx` under `npm run check:logic` (no jest/vitest in this repo).

**Reference reading before coding:** the `resend` and `email-and-password-best-practices` skills (gotchas: client method names, `replyTo` casing, no account enumeration). This is NOT the Better Auth you may remember — the callback shapes below were confirmed against the installed `node_modules/better-auth` (1.6): `sendResetPassword({ user, url, token })` and `emailVerification.sendVerificationEmail({ user, url, token })`; client uses `authClient.requestPasswordReset({ email, redirectTo })` + `authClient.resetPassword({ newPassword, token })`.

**No schema change** — `users.emailVerified` already exists; email content is not persisted. The prod build's `prod-migrate.mjs` will just re-verify the existing delta.

---

## File Structure

**Create:**
- `src/lib/email/config.ts` — sender constants (`EMAIL_FROM` env-overridable, `EMAIL_REPLY_TO`, `OPS_INBOX`), `emailLink()`, `formatPlDateTime()`.
- `src/lib/email/client.ts` — lazy Resend client; `null` (logged no-op) when `RESEND_API_KEY` absent.
- `src/lib/email/send.ts` — `sendEmail({ to, subject, react })`; renders + sends; never throws.
- `src/lib/email/recipients.ts` — pure `buildTeamRecipients(gardenerEmails, opsInbox)` (dedupe).
- `src/lib/email/notifications.ts` — `notifyNewRequest`, `notifyRequestDecision`, `notifyVisitScheduled` (Payload lookups + send).
- `src/lib/email/templates/Layout.tsx` — shared branded shell.
- `src/lib/email/templates/{VerifyEmail,ResetPassword,NewRequestTeam,RequestDecision,VisitScheduled}.tsx`.
- `src/components/auth/ForgotPasswordForm.tsx`, `src/components/auth/ResetPasswordForm.tsx` (client islands).
- `src/app/(public)/(auth)/forgot-password/page.tsx`, `src/app/(public)/(auth)/reset-password/page.tsx`.
- `scripts/check-email.tsx` — render + recipient assertions.

**Modify:**
- `src/lib/auth.ts` — add `sendResetPassword` + `emailVerification`.
- `src/lib/requests.ts` — fire `notifyNewRequest` after create.
- `src/lib/team.ts` — fire `notifyRequestDecision` / `notifyVisitScheduled` after the transitions.
- `src/components/auth-form.tsx` — "Nie pamiętasz hasła?" link (sign-in mode).
- `src/lib/env.ts` — optional `RESEND_API_KEY` / `EMAIL_FROM`.
- `.env.example` — document both vars.
- `package.json` — deps + `check:logic` includes `check-email.tsx`.

**Note on `.ts` vs `.tsx`:** modules that *invoke* a template (auth.ts, notifications.ts) call it as a plain function — `ResetPassword({ name, url })` returns a `ReactElement` and is valid in a `.ts` file (the templates use no hooks/context of their own). Only the template files and `check-email` contain JSX, so they are `.tsx`.

---

## Task 1: Dependencies + env wiring

**Files:**
- Modify: `package.json`, `src/lib/env.ts`, `.env.example`

- [ ] **Step 1: Install runtime deps**

Run:
```bash
npm i resend@^6 @react-email/components@^1 @react-email/render@^2
```
Expected: added to `dependencies`, lockfile updated, no peer-dep errors against React 19.

- [ ] **Step 2: Add optional env vars to `src/lib/env.ts`**

In the `EnvSchema` object (after the `BETTER_AUTH_SECRET` block), add:
```ts
  // Transactional email (Resend). Optional: when RESEND_API_KEY is absent the
  // email module self-disables (logged no-op), so dev/build never require it.
  RESEND_API_KEY: z.string().min(1).optional(),
  // Verified sender. Defaults (in email/config.ts) to Resend's onboarding sender
  // until the kryscar.pl domain is verified; then set to the kryscar.pl address.
  EMAIL_FROM: z.string().min(1).optional(),
```

- [ ] **Step 3: Document in `.env.example`**

Append:
```bash
# --- Transactional email (Resend) ---
# API key from https://resend.com (account-level). Optional: without it, email is disabled.
RESEND_API_KEY=
# Sender identity. Leave unset to use Resend's onboarding sender during testing;
# set to "Ogrody Kryscar <no-reply@kryscar.pl>" once the domain is verified.
EMAIL_FROM=
```

- [ ] **Step 4: Verify typecheck still passes**

Run: `NODE_OPTIONS="--max-old-space-size=2048" npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/env.ts .env.example
git commit -m "chore(email): add resend + react-email deps and optional env vars"
```

---

## Task 2: Email config + client + send helper

**Files:**
- Create: `src/lib/email/config.ts`, `src/lib/email/client.ts`, `src/lib/email/send.ts`

- [ ] **Step 1: `src/lib/email/config.ts`**

```ts
/**
 * Email sender identity + small formatting helpers. Reads process.env directly
 * for EMAIL_FROM so the default (onboarding sender) can flip to the verified
 * kryscar.pl sender via env alone — no code change once DNS verifies.
 */
import { getServerBaseURL } from "@/lib/base-url";

/** Verified sender. Defaults to Resend's shared onboarding sender so email works
 *  before the kryscar.pl domain is verified; override with EMAIL_FROM in prod. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() || "Ogrody Kryscar <onboarding@resend.dev>";

/** Customer replies should reach the real company inbox. */
export const EMAIL_REPLY_TO = "ogrody@kryscar.pl";

/** Where team/ops notifications also go, regardless of gardener accounts. */
export const OPS_INBOX = "ogrody@kryscar.pl";

/** Absolute deep-link for email buttons (no trailing slash). */
export function emailLink(path: string): string {
  const base = getServerBaseURL();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Human Polish date+time for email bodies, e.g. "poniedziałek, 16 czerwca 2026, 09:00". */
export function formatPlDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}
```

- [ ] **Step 2: `src/lib/email/client.ts`**

```ts
/**
 * Lazy Resend client. Returns null when RESEND_API_KEY is absent so the app
 * (and `next build`, and key-less dev) runs with email simply disabled — the
 * same self-disabling pattern as the Vercel Blob storage plugin.
 */
import { Resend } from "resend";

let cached: Resend | null | undefined;

export function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY?.trim();
  cached = key ? new Resend(key) : null;
  if (!cached) {
    console.warn("[email] RESEND_API_KEY not set — email is disabled (no-op).");
  }
  return cached;
}
```

- [ ] **Step 3: `src/lib/email/send.ts`**

```ts
/**
 * The single send primitive. Renders a React Email element to HTML and sends via
 * Resend. NEVER throws and never rejects — a failed/disabled send is logged and
 * swallowed, so a notification can never roll back a DB write or break a flow.
 */
import { render } from "@react-email/render";
import type { ReactElement } from "react";

import { getResend } from "./client";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  react: ReactElement;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return; // disabled (no key)
  try {
    const html = await render(opts.react);
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      replyTo: EMAIL_REPLY_TO,
      subject: opts.subject,
      html,
    });
    if (error) console.error("[email] send failed:", error);
  } catch (err) {
    console.error("[email] send threw:", err);
  }
}
```

- [ ] **Step 4: Verify typecheck**

Run: `NODE_OPTIONS="--max-old-space-size=2048" npx tsc --noEmit`
Expected: exit 0 (no usages yet, just the new modules compile).

- [ ] **Step 5: Commit**

```bash
git add src/lib/email/config.ts src/lib/email/client.ts src/lib/email/send.ts
git commit -m "feat(email): Resend client + send helper (self-disabling, never throws)"
```

---

## Task 3: Pure recipient builder + its check

**Files:**
- Create: `src/lib/email/recipients.ts`, `scripts/check-email.tsx`
- Modify: `package.json`

- [ ] **Step 1: Write the failing check first — `scripts/check-email.tsx`**

```tsx
/**
 * Logic checks for the email module — pure, no network. Run by `npm run check:logic`.
 * (1) buildTeamRecipients dedupes the ops inbox case-insensitively.
 * (2) every template renders to non-empty HTML containing its key fields.
 */
import assert from "node:assert/strict";
import { render } from "@react-email/render";

import { buildTeamRecipients } from "../src/lib/email/recipients";

// (1) recipient dedupe
{
  const r = buildTeamRecipients(
    ["ogrodnik@kryscar.pl", "OGRODY@kryscar.pl"],
    "ogrody@kryscar.pl",
  );
  assert.deepEqual(r, ["ogrodnik@kryscar.pl", "OGRODY@kryscar.pl"],
    "ops inbox already present as a gardener (case-insensitive) must not duplicate");

  const r2 = buildTeamRecipients(["ogrodnik@kryscar.pl"], "ogrody@kryscar.pl");
  assert.deepEqual(r2, ["ogrodnik@kryscar.pl", "ogrody@kryscar.pl"],
    "distinct gardener + ops inbox both kept, gardeners first");

  const r3 = buildTeamRecipients([], "ogrody@kryscar.pl");
  assert.deepEqual(r3, ["ogrody@kryscar.pl"], "no gardeners → just the ops inbox");
}

// (2) template render assertions are appended in Task 4 Step 4.

console.log("check-email: OK");
```

- [ ] **Step 2: Wire it into `package.json` and run it (expect FAIL — module missing)**

Edit the `check:logic` script to append ` && tsx scripts/check-email.tsx`:
```json
"check:logic": "tsx scripts/check-pricing.ts && tsx scripts/check-lawns.ts && tsx scripts/check-safe-next.ts && tsx scripts/check-visits.ts && tsx scripts/check-email.tsx",
```
Run: `npx tsx scripts/check-email.tsx`
Expected: FAIL — `Cannot find module '../src/lib/email/recipients'`.

- [ ] **Step 3: Implement `src/lib/email/recipients.ts`**

```ts
/**
 * Pure team-notification recipient list: every gardener email + the ops inbox,
 * deduped case-insensitively, gardeners first then ops. No Payload/env imports
 * so it stays unit-checkable.
 */
export function buildTeamRecipients(
  gardenerEmails: string[],
  opsInbox: string,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...gardenerEmails, opsInbox]) {
    const trimmed = raw.trim();
    const norm = trimmed.toLowerCase();
    if (!norm || seen.has(norm)) continue;
    seen.add(norm);
    out.push(trimmed);
  }
  return out;
}
```

- [ ] **Step 4: Run the check (expect PASS for part 1)**

Run: `npx tsx scripts/check-email.tsx`
Expected: `check-email: OK`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/email/recipients.ts scripts/check-email.tsx package.json
git commit -m "feat(email): pure team-recipient builder + check-email logic test"
```

---

## Task 4: React Email templates

**Files:**
- Create: `src/lib/email/templates/Layout.tsx` + 5 template files
- Modify: `scripts/check-email.tsx` (append render assertions)

- [ ] **Step 1: `src/lib/email/templates/Layout.tsx`**

```tsx
import {
  Body, Container, Head, Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const main = { backgroundColor: "#f6f7f6", fontFamily: "Arial, sans-serif" };
const container = {
  margin: "0 auto", padding: "24px", maxWidth: "560px",
  backgroundColor: "#ffffff", borderRadius: "12px",
};
const brand = { color: "#047857", fontSize: "18px", fontWeight: "bold" as const, margin: "0 0 16px" };
const footer = { color: "#9ca3af", fontSize: "12px", lineHeight: "18px" };

/** Shared shell: emerald wordmark header + address footer. `preview` is the inbox snippet. */
export function Layout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Ogrody Kryscar</Text>
          <Section>{children}</Section>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
          <Text style={footer}>
            Ogrody Kryscar · ogrody@kryscar.pl<br />
            Ta wiadomość została wysłana automatycznie.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const btn = {
  display: "inline-block", backgroundColor: "#047857", color: "#ffffff",
  padding: "10px 18px", borderRadius: "8px", textDecoration: "none",
  fontWeight: "bold" as const, fontSize: "14px",
};
export const p = { color: "#374151", fontSize: "14px", lineHeight: "22px" };
```

- [ ] **Step 2: `src/lib/email/templates/VerifyEmail.tsx` and `ResetPassword.tsx`**

`VerifyEmail.tsx`:
```tsx
import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function VerifyEmail({ name, url }: { name: string; url: string }) {
  return (
    <Layout preview="Potwierdź swój adres e-mail">
      <Heading as="h2">Witaj{name ? `, ${name}` : ""}!</Heading>
      <Text style={p}>
        Dziękujemy za założenie konta w Ogrodach Kryscar. Potwierdź swój adres
        e-mail, klikając przycisk poniżej.
      </Text>
      <Button href={url} style={btn}>Potwierdź adres e-mail</Button>
      <Text style={p}>Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.</Text>
    </Layout>
  );
}
```

`ResetPassword.tsx`:
```tsx
import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function ResetPassword({ name, url }: { name: string; url: string }) {
  return (
    <Layout preview="Reset hasła do konta Ogrody Kryscar">
      <Heading as="h2">Reset hasła</Heading>
      <Text style={p}>
        Cześć{name ? `, ${name}` : ""}. Otrzymaliśmy prośbę o reset hasła do Twojego
        konta. Kliknij przycisk poniżej, aby ustawić nowe hasło. Link jest ważny
        przez ograniczony czas.
      </Text>
      <Button href={url} style={btn}>Ustaw nowe hasło</Button>
      <Text style={p}>Jeśli to nie Ty prosiłeś o reset, zignoruj tę wiadomość.</Text>
    </Layout>
  );
}
```

- [ ] **Step 3: `NewRequestTeam.tsx`, `RequestDecision.tsx`, `VisitScheduled.tsx`**

`NewRequestTeam.tsx`:
```tsx
import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function NewRequestTeam(props: {
  customerName: string;
  lawnName: string;
  address: string;
  serviceTitles: string[];
  note: string | null;
  estRange: string;
  url: string;
}) {
  return (
    <Layout preview={`Nowe zlecenie: ${props.lawnName}`}>
      <Heading as="h2">Nowe zlecenie</Heading>
      <Text style={p}>
        <strong>{props.customerName}</strong> złożył(a) nowe zlecenie dla ogrodu{" "}
        <strong>{props.lawnName}</strong>
        {props.address ? ` (${props.address})` : ""}.
      </Text>
      <Text style={p}>
        Usługi: {props.serviceTitles.join(", ") || "—"}<br />
        Szacunkowa wycena: {props.estRange}
        {props.note ? <><br />Uwagi: „{props.note}”</> : null}
      </Text>
      <Button href={props.url} style={btn}>Otwórz zlecenie</Button>
    </Layout>
  );
}
```

`RequestDecision.tsx`:
```tsx
import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function RequestDecision(props: {
  customerName: string;
  lawnName: string;
  decision: "accepted" | "declined";
  visitDate?: string;
  reason?: string;
  url: string;
}) {
  const accepted = props.decision === "accepted";
  return (
    <Layout preview={accepted ? "Twoje zlecenie zostało przyjęte" : "Twoje zlecenie zostało odrzucone"}>
      <Heading as="h2">{accepted ? "Zlecenie przyjęte" : "Zlecenie odrzucone"}</Heading>
      <Text style={p}>
        Cześć{props.customerName ? `, ${props.customerName}` : ""}. Twoje zlecenie dla
        ogrodu <strong>{props.lawnName}</strong>{" "}
        {accepted ? "zostało przyjęte." : "niestety zostało odrzucone."}
      </Text>
      {accepted && props.visitDate ? (
        <Text style={p}>Pierwsza wizyta zaplanowana na: <strong>{props.visitDate}</strong>.</Text>
      ) : null}
      {!accepted && props.reason ? (
        <Text style={p}>Powód: {props.reason}</Text>
      ) : null}
      <Button href={props.url} style={btn}>Zobacz swoje zamówienia</Button>
    </Layout>
  );
}
```

`VisitScheduled.tsx`:
```tsx
import { Button, Heading, Text } from "@react-email/components";
import { Layout, btn, p } from "./Layout";

export function VisitScheduled(props: {
  customerName: string;
  lawnName: string;
  scheduledAt: string;
  url: string;
}) {
  return (
    <Layout preview={`Zaplanowano wizytę: ${props.lawnName}`}>
      <Heading as="h2">Zaplanowano kolejną wizytę</Heading>
      <Text style={p}>
        Cześć{props.customerName ? `, ${props.customerName}` : ""}. Zaplanowaliśmy
        wizytę w ogrodzie <strong>{props.lawnName}</strong> na:{" "}
        <strong>{props.scheduledAt}</strong>.
      </Text>
      <Button href={props.url} style={btn}>Szczegóły w panelu</Button>
    </Layout>
  );
}
```

- [ ] **Step 4: Append render assertions to `scripts/check-email.tsx`**

Replace the `// (2) template render ...` comment line with:
```tsx
// (2) templates render to non-empty HTML containing their key fields
{
  const { VerifyEmail } = await import("../src/lib/email/templates/VerifyEmail");
  const { ResetPassword } = await import("../src/lib/email/templates/ResetPassword");
  const { NewRequestTeam } = await import("../src/lib/email/templates/NewRequestTeam");
  const { RequestDecision } = await import("../src/lib/email/templates/RequestDecision");
  const { VisitScheduled } = await import("../src/lib/email/templates/VisitScheduled");

  const verify = await render(VerifyEmail({ name: "Jan", url: "https://x.test/verify?token=abc" }));
  assert.ok(verify.includes("https://x.test/verify?token=abc"), "verify email carries the url");

  const reset = await render(ResetPassword({ name: "Jan", url: "https://x.test/reset?token=xyz" }));
  assert.ok(reset.includes("https://x.test/reset?token=xyz"), "reset email carries the url");

  const team = await render(NewRequestTeam({
    customerName: "Jan Nowak", lawnName: "Ogród A", address: "ul. Kwiatowa 1",
    serviceTitles: ["Koszenie"], note: "proszę o kontakt", estRange: "200–300 zł",
    url: "https://x.test/zespol/zlecenia",
  }));
  assert.ok(team.includes("Ogród A") && team.includes("Koszenie"), "team email carries lawn + service");

  const declined = await render(RequestDecision({
    customerName: "Jan", lawnName: "Ogród A", decision: "declined",
    reason: "poza obszarem", url: "https://x.test/panel/zamowienia",
  }));
  assert.ok(declined.includes("poza obszarem"), "declined email carries the reason");

  const visit = await render(VisitScheduled({
    customerName: "Jan", lawnName: "Ogród A", scheduledAt: "poniedziałek, 16 czerwca 2026, 09:00",
    url: "https://x.test/panel",
  }));
  assert.ok(visit.includes("16 czerwca 2026"), "visit email carries the date");
}
```

- [ ] **Step 5: Run the check (expect PASS)**

Run: `npx tsx scripts/check-email.tsx`
Expected: `check-email: OK`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/email/templates scripts/check-email.tsx
git commit -m "feat(email): five Polish React Email templates + render checks"
```

---

## Task 5: Notification helpers

**Files:**
- Create: `src/lib/email/notifications.ts`

- [ ] **Step 1: Implement `src/lib/email/notifications.ts`**

```ts
/**
 * Notification helpers: assemble recipients + props from Payload and send. Each
 * is fire-and-forget at the call site (`void notify...().catch(...)`), and
 * sendEmail itself never throws, so a notification can't break a flow. Recipient
 * emails are looked up here (depth:0) so callers pass only ids.
 */
import { getPayload } from "payload";
import config from "@payload-config";
import type { Payload } from "payload";

import { sendEmail } from "./send";
import { buildTeamRecipients } from "./recipients";
import { OPS_INBOX, emailLink, formatPlDateTime } from "./config";
import { NewRequestTeam } from "./templates/NewRequestTeam";
import { RequestDecision } from "./templates/RequestDecision";
import { VisitScheduled } from "./templates/VisitScheduled";

async function gardenerEmails(payload: Payload, tenantId: string): Promise<string[]> {
  const { docs } = await payload.find({
    collection: "users",
    where: { and: [{ role: { equals: "gardener" } }, { tenant: { equals: tenantId } }] },
    depth: 0,
    limit: 100,
  });
  return docs.map((u) => u.email).filter((e): e is string => Boolean(e));
}

async function customerContact(
  payload: Payload,
  customerId: string,
): Promise<{ email: string; name: string } | null> {
  try {
    const u = await payload.findByID({ collection: "users", id: customerId, depth: 0 });
    return u?.email ? { email: u.email, name: u.name ?? "" } : null;
  } catch {
    return null;
  }
}

/** New request → all tenant gardeners + ops inbox. Resolves the customer's name
 *  by id (LawnView carries no owner name). */
export async function notifyNewRequest(input: {
  tenantId: string;
  customerId: string;
  lawnName: string;
  address: string;
  serviceTitles: string[];
  note: string | null;
  estRange: string;
}): Promise<void> {
  const payload = await getPayload({ config });
  const to = buildTeamRecipients(await gardenerEmails(payload, input.tenantId), OPS_INBOX);
  if (!to.length) return;
  const customer = await customerContact(payload, input.customerId);
  await sendEmail({
    to,
    subject: `Nowe zlecenie — ${input.lawnName}`,
    react: NewRequestTeam({
      customerName: customer?.name || "Klient",
      lawnName: input.lawnName,
      address: input.address,
      serviceTitles: input.serviceTitles,
      note: input.note,
      estRange: input.estRange,
      url: emailLink("/zespol/zlecenia"),
    }),
  });
}

/** Accept/decline → the customer. */
export async function notifyRequestDecision(input: {
  customerId: string;
  lawnName: string;
  decision: "accepted" | "declined";
  visitDateIso?: string;
  reason?: string;
}): Promise<void> {
  const payload = await getPayload({ config });
  const c = await customerContact(payload, input.customerId);
  if (!c) return;
  await sendEmail({
    to: c.email,
    subject:
      input.decision === "accepted"
        ? `Zlecenie przyjęte — ${input.lawnName}`
        : `Zlecenie odrzucone — ${input.lawnName}`,
    react: RequestDecision({
      customerName: c.name,
      lawnName: input.lawnName,
      decision: input.decision,
      visitDate: input.visitDateIso ? formatPlDateTime(input.visitDateIso) : undefined,
      reason: input.reason,
      url: emailLink("/panel/zamowienia"),
    }),
  });
}

/** Next visit scheduled → the customer. */
export async function notifyVisitScheduled(input: {
  customerId: string;
  lawnName: string;
  scheduledAtIso: string;
}): Promise<void> {
  const payload = await getPayload({ config });
  const c = await customerContact(payload, input.customerId);
  if (!c) return;
  await sendEmail({
    to: c.email,
    subject: `Zaplanowano wizytę — ${input.lawnName}`,
    react: VisitScheduled({
      customerName: c.name,
      lawnName: input.lawnName,
      scheduledAt: formatPlDateTime(input.scheduledAtIso),
      url: emailLink("/panel"),
    }),
  });
}
```

- [ ] **Step 2: Verify typecheck**

Run: `NODE_OPTIONS="--max-old-space-size=2048" npx tsc --noEmit`
Expected: exit 0. (If `u.name` is typed `string` not `string | null`, the `?? ""` is harmless.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/notifications.ts
git commit -m "feat(email): notification helpers (new request, decision, visit scheduled)"
```

---

## Task 6: Wire notifications into the data layer

**Files:**
- Modify: `src/lib/requests.ts`, `src/lib/team.ts`

- [ ] **Step 1: `requests.ts` — notify the team after a request is created**

At the top, add the import:
```ts
import { notifyNewRequest } from "./email/notifications";
```
In `createRequest`, the created `doc` carries `tenant` (set by the default-tenant hook). Replace the final `return project(doc);` with:
```ts
  const view = project(doc);
  const tenantId =
    typeof doc.tenant === "object" && doc.tenant ? String(doc.tenant.id) : String(doc.tenant);
  if (tenantId && tenantId !== "undefined") {
    void notifyNewRequest({
      tenantId,
      customerId: userId, // notifyNewRequest resolves the name (LawnView has none)
      lawnName: view.lawnName,
      address: lawn.address, // LawnView.address is a required string
      serviceTitles: view.items.map((it) => it.serviceTitle),
      note: view.note,
      estRange: view.estMin > 0 ? `${view.estMin}–${view.estMax} zł` : "Wycena indywidualna",
    }).catch((err) => console.error("[email] notifyNewRequest:", err));
  }
  return view;
```
Field check (already done): `LawnView` (src/lib/lawn-types.ts) has a required `address: string` and **no** owner name — that's why `notifyNewRequest` takes `customerId` (= `userId`) and resolves the name itself. `view.lawnName` and `view.items` come from `project`.

- [ ] **Step 2: `team.ts` — imports + accept/decline/schedule notifications**

Add at the top:
```ts
import { notifyRequestDecision, notifyVisitScheduled } from "./email/notifications";
```

In `acceptRequest`, after the `createVisit(...)` call succeeds (inside the `try`, after the await), add:
```ts
    const lawnName =
      typeof req.lawn === "object" && req.lawn ? (req.lawn.name ?? "Ogród") : "Ogród";
    void notifyRequestDecision({
      customerId,
      lawnName,
      decision: "accepted",
      visitDateIso: scheduledAt,
    }).catch((err) => console.error("[email] notifyRequestDecision(accept):", err));
```
(`customerId` and `req` are already in scope; the accept email carries the first visit date, so we do NOT also call `notifyVisitScheduled` here.)

In `declineRequest`, after the `payload.update(...)` that sets `declined`, add:
```ts
  const customerId =
    typeof req.owner === "object" && req.owner ? String(req.owner.id) : String(req.owner);
  const lawnName =
    typeof req.lawn === "object" && req.lawn ? (req.lawn.name ?? "Ogród") : "Ogród";
  void notifyRequestDecision({
    customerId,
    lawnName,
    decision: "declined",
    reason: reason || undefined,
  }).catch((err) => console.error("[email] notifyRequestDecision(decline):", err));
```

In `scheduleNextVisit`, after the `createVisit(...)` call, add:
```ts
  const lawnName =
    typeof req.lawn === "object" && req.lawn ? (req.lawn.name ?? "Ogród") : "Ogród";
  void notifyVisitScheduled({
    customerId,
    lawnName,
    scheduledAtIso: scheduledAt,
  }).catch((err) => console.error("[email] notifyVisitScheduled:", err));
```
(`customerId` is already derived in `scheduleNextVisit`.)

- [ ] **Step 3: Verify typecheck + the logic checks still pass**

Run: `NODE_OPTIONS="--max-old-space-size=2048" npx tsc --noEmit && npm run check:logic`
Expected: tsc exit 0; all check scripts incl. `check-email: OK`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/requests.ts src/lib/team.ts
git commit -m "feat(email): fire notifications on request create/accept/decline/schedule"
```

---

## Task 7: Better Auth wiring (reset + soft verification)

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Add imports**

Below the existing imports:
```ts
import { sendEmail } from "./email/send";
import { ResetPassword } from "./email/templates/ResetPassword";
import { VerifyEmail } from "./email/templates/VerifyEmail";
```

- [ ] **Step 2: Replace the `emailAndPassword` line + add `emailVerification`**

Replace:
```ts
  emailAndPassword: { enabled: true },
  // NO organization plugin (single-tenant MVP). NO email verification (slice 1).
```
with:
```ts
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset hasła — Ogrody Kryscar",
        react: ResetPassword({ name: user.name ?? "", url }),
      });
    },
  },
  // Soft email verification: send on signup, mark verified on click, but do NOT
  // block sign-in (no requireEmailVerification) — existing prod accounts keep
  // working. See spec 2026-06-16-transactional-email-design.
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Potwierdź adres e-mail — Ogrody Kryscar",
        react: VerifyEmail({ name: user.name ?? "", url }),
      });
    },
  },
  // NO organization plugin (single-tenant MVP).
```

- [ ] **Step 3: Update the file's top doc comment**

Change the line `NO organization plugin and NO email verification in this slice (deferred)` to:
```
NO organization plugin (single-tenant MVP). Email verification is SOFT (sent on
signup, never blocks login); password reset + verification email go through
src/lib/email. `role`/`tenant` live on the `users` collection.
```

- [ ] **Step 4: Verify typecheck**

Run: `NODE_OPTIONS="--max-old-space-size=2048" npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat(auth): wire password reset + soft email verification to Resend"
```

---

## Task 8: Forgot/reset-password UI

**Files:**
- Create: `src/components/auth/ForgotPasswordForm.tsx`, `src/components/auth/ResetPasswordForm.tsx`, `src/app/(public)/(auth)/forgot-password/page.tsx`, `src/app/(public)/(auth)/reset-password/page.tsx`
- Modify: `src/components/auth-form.tsx`

- [ ] **Step 1: `src/components/auth/ForgotPasswordForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

/**
 * Request a password-reset link. Always shows a neutral confirmation regardless
 * of whether the address exists (no account enumeration). The reset link in the
 * email lands on /reset-password (set via redirectTo).
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    setSent(true);
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Nie pamiętasz hasła?</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Podaj adres e-mail — wyślemy link do ustawienia nowego hasła.
      </p>
      {sent ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Jeśli konto istnieje, wysłaliśmy wiadomość z linkiem do resetu hasła.
          Sprawdź swoją skrzynkę.
        </p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); void submit(); }}
          className="flex flex-col gap-3"
        >
          <input
            className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {pending ? "…" : "Wyślij link"}
          </button>
        </form>
      )}
      <p className="mt-4 text-sm text-neutral-500">
        <Link href="/sign-in" className="font-medium text-emerald-700 hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: `src/components/auth/ResetPasswordForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth-client";

/**
 * Set a new password using the token from the reset link (?token=...). On success
 * redirect to /sign-in. A missing/invalid token shows a clear message.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setError(null);
    setPending(true);
    const res = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (res.error) {
      setError(res.error.message ?? "Nie udało się zresetować hasła. Link mógł wygasnąć.");
      return;
    }
    router.push("/sign-in");
    router.refresh();
  };

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Nieprawidłowy link</h1>
        <p className="text-sm text-neutral-500">
          Link do resetu hasła jest nieprawidłowy lub wygasł. Poproś o nowy na stronie
          „Nie pamiętasz hasła?”.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Ustaw nowe hasło</h1>
      <p className="mb-6 text-sm text-neutral-500">Wpisz nowe hasło do swojego konta.</p>
      <form
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
        className="flex flex-col gap-3"
      >
        <input
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-emerald-600"
          type="password"
          placeholder="Nowe hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "…" : "Zapisz nowe hasło"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: The two pages (mirror sign-in's Suspense + signed-in redirect)**

`src/app/(public)/(auth)/forgot-password/page.tsx`:
```tsx
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Nie pamiętasz hasła?" };

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/panel");
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
```

`src/app/(public)/(auth)/reset-password/page.tsx`:
```tsx
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Ustaw nowe hasło" };

export default function ResetPasswordPage() {
  // No signed-in redirect: a logged-in user may still arrive via a reset link.
  // ResetPasswordForm reads ?token via useSearchParams → needs Suspense.
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

- [ ] **Step 4: Add the "forgot password" link in `src/components/auth-form.tsx`**

Directly after the password `<input>` (before `{error && ...}`), add a sign-in-only link:
```tsx
        {!isSignUp && (
          <Link
            href="/forgot-password"
            className="self-end text-xs text-emerald-700 hover:underline"
          >
            Nie pamiętasz hasła?
          </Link>
        )}
```
(`Link` is already imported in this file.)

- [ ] **Step 5: Verify typecheck + lint + build the routes**

Run: `NODE_OPTIONS="--max-old-space-size=2048" npx tsc --noEmit && npx eslint src/components/auth src/components/auth-form.tsx "src/app/(public)/(auth)/forgot-password/page.tsx" "src/app/(public)/(auth)/reset-password/page.tsx"`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add "src/components/auth" src/components/auth-form.tsx "src/app/(public)/(auth)/forgot-password" "src/app/(public)/(auth)/reset-password"
git commit -m "feat(auth): forgot-password + reset-password pages and sign-in link"
```

---

## Task 9: Resend domain + DNS (guided, partly manual)

**Files:** none (ops). This is the gate for the `kryscar.pl` sender; until done, everything sends from the onboarding sender.

- [ ] **Step 1: Create / confirm the `kryscar.pl` domain in Resend**

Using the saved key (in `.env.local`), create the domain and read back its DNS records:
```bash
curl -s -X POST https://api.resend.com/domains \
  -H "Authorization: Bearer $(grep RESEND_API_KEY .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{"name":"kryscar.pl","region":"eu-west-1"}'
```
Expected: JSON with an `id` and a `records` array (SPF `TXT`/`MX`, DKIM `TXT`, optional DMARC). If the domain already exists, instead `GET https://api.resend.com/domains` and pick `kryscar.pl`'s `id`, then `GET https://api.resend.com/domains/<id>` for the records. **Region note:** match the account's region; `eu-west-1` keeps EU data residency for a Polish business (confirm in the dashboard if the create call errors on region).

- [ ] **Step 2: Hand the records to the owner**

Present the exact `type / name / value` rows. The owner adds them at the `kryscar.pl` DNS registrar. **Do not** guess records — only relay what the API returns.

- [ ] **Step 3: Verify the domain**

After the owner confirms the records are added (DNS can take minutes–hours):
```bash
curl -s -X POST https://api.resend.com/domains/<id>/verify \
  -H "Authorization: Bearer $(grep RESEND_API_KEY .env.local | cut -d= -f2)"
# then poll:
curl -s https://api.resend.com/domains/<id> \
  -H "Authorization: Bearer $(grep RESEND_API_KEY .env.local | cut -d= -f2)"
```
Expected: `"status":"verified"`.

- [ ] **Step 4: Flip the sender**

Set `EMAIL_FROM` to the kryscar.pl sender in Vercel (prod + dev) and `.env.local`:
```bash
printf '%s' "Ogrody Kryscar <no-reply@kryscar.pl>" | vercel env add EMAIL_FROM production --sensitive --force
printf '%s' "Ogrody Kryscar <no-reply@kryscar.pl>" | vercel env add EMAIL_FROM development --force
```
And append `EMAIL_FROM="Ogrody Kryscar <no-reply@kryscar.pl>"` to `.env.local`.
(No code change — `config.ts` reads `EMAIL_FROM`.)

---

## Task 10: Mind maintenance + final verification

**Files:**
- Create: `kryscar-mind/map/zones/transactional-email.md`, `kryscar-mind/map/decisions/transactional-email-resend.md`
- Modify: `kryscar-mind/map/zones/customer-auth.md`, `service-requests.md`, `team-schedule.md`

- [ ] **Step 1: New zone card `transactional-email.md`**

Frontmatter `type: zone`, `status: active`, owns globs `src/lib/email/**`, `src/components/auth/**`, `src/app/(public)/(auth)/forgot-password/**`, `src/app/(public)/(auth)/reset-password/**`, `scripts/check-email.tsx`; anchors `symbol:sendEmail`, `symbol:notifyNewRequest`, `symbol:notifyRequestDecision`, `symbol:notifyVisitScheduled`, `symbol:buildTeamRecipients`. Invariants: "sendEmail never throws / self-disables without RESEND_API_KEY"; "verification is soft — no requireEmailVerification"; "notifications are fire-and-forget after the DB write". Set `verifiedAt` to current HEAD. Body: purpose, the send→notify→template flow, the EMAIL_FROM flip, links to `[[customer-auth]]`, `[[service-requests]]`, `[[team-schedule]]`.

- [ ] **Step 2: Decision record `transactional-email-resend.md`**

`type: decision`. Cover: direct Resend SDK over `@payloadcms/email-resend` (BA needs a callback regardless); soft verification (don't lock out live accounts); graceful no-op without a key; single `EMAIL_FROM` env flip from onboarding → kryscar.pl after DNS. `sources: ["[[2026-06-16-transactional-email-design]]"]`.

- [ ] **Step 3: Update related zone cards**

`customer-auth.md`: the slice-1 "no email verification" note is superseded — reset + soft verification now wired via `[[transactional-email]]`; re-stamp `verifiedAt`. `service-requests.md` + `team-schedule.md`: note the notification hook points (create → team; accept/decline/schedule → customer); re-stamp `verifiedAt`.

- [ ] **Step 4: Regenerate the Mind index + full check**

Run:
```bash
NODE_OPTIONS="--max-old-space-size=2048" npm run mind
NODE_OPTIONS="--max-old-space-size=3072" npm run check
```
Expected: `mind` prints zone count incl. the new zone; `check` (tsc + eslint + generate:types + mind + check:logic) exits 0.

- [ ] **Step 5: Commit**

```bash
git add kryscar-mind
git commit -m "docs(mind): transactional-email zone + decision; update auth/requests/schedule zones"
```

---

## Task 11: Manual end-to-end verification (after deploy)

- [ ] **Step 1: Build locally with the prod command path**

Run: `NODE_OPTIONS="--max-old-space-size=3072" npm run build`
Expected: `prod-migrate` re-verifies the existing delta; `next build` succeeds; the new routes appear (`/forgot-password`, `/reset-password`).

- [ ] **Step 2: Deploy to production**

Run: `vercel --prod --yes`
Expected: READY, aliased to www.kryscar.pl.

- [ ] **Step 3: Live smoke (uses the onboarding sender until DNS verifies)**

- Visit `https://www.kryscar.pl/forgot-password`, submit the demo customer's address; confirm the neutral message and that a reset email arrives.
- Click the link → `/reset-password?token=...` → set a new password → land on `/sign-in` → log in.
- As the demo customer, submit a request; confirm the team notification reaches `ogrody@kryscar.pl`.
- As the demo gardener, accept it; confirm the customer gets the "accepted" email with the visit date.

- [ ] **Step 4: Note results**

Record what was tested and any deferrals (e.g. DNS not yet verified → still on onboarding sender) in the PR / summary.

---

## Self-Review (completed during planning)

- **Spec coverage:** module (T2) · client self-disable (T2) · send never-throws (T2) · 5 templates (T4) · recipient dedupe (T3) · notifications + hook points (T5–T6) · reset + soft verify (T7) · forgot/reset UI + link (T8) · env + `.env.example` (T1) · DNS/EMAIL_FROM flip (T9) · check-email + `check:logic` (T3–T4) · Mind zone/decision/updates (T10) · manual E2E (T11). All spec sections mapped.
- **Type consistency:** template prop names match between templates (T4), `check-email` (T3–T4), notifications (T5), and auth (T7): `RequestDecision({ decision, visitDate, reason })`, `VisitScheduled({ scheduledAt })`, `NewRequestTeam({ serviceTitles, estRange })`. `sendEmail({ to, subject, react })` used identically everywhere. Notification helpers take ISO dates (`visitDateIso`/`scheduledAtIso`) and format inside; templates receive pre-formatted strings.
- **Field shapes resolved during planning:** `LawnView` has required `address: string`, no owner name → `notifyNewRequest` takes `customerId` and resolves the name. Better Auth callback shapes + client method names confirmed against installed `node_modules`. The one remaining runtime unknown is the Resend **account region** in Task 9 Step 1 (`eu-west-1` assumed; adjust if the create call errors).
- **Placeholder scan:** no TBD/TODO; every code step shows complete code; every run step states the expected result.
```
