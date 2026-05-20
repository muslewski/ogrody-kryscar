# Reactbits Component Map — ogrody-kryscar

> Living document. Every reactbits component we pull into this project gets logged here with its **use case**, **install command**, and **location in code**.

## Setup

- Registry config lives in [components.json](components.json) — mirrors the fadok project setup.
- `cn` helper at [src/lib/utils.ts](src/lib/utils.ts).
- Install via `npx shadcn@latest add @<registry>/<slug>` (this project uses npm; fadok uses pnpm).
- Free reactbits components land in `src/components/<slug>.tsx`.

## Registry quick reference

| Alias | Tier | Auth | Catalog URL |
|---|---|---|---|
| `@react-bits` | Free | None | https://reactbits.dev/ |
| `@reactbits-starter` | Paid (Starter) | Bearer `REACTBITS_LICENSE_KEY` | https://pro.reactbits.dev/components |
| `@reactbits-pro` | Paid (Pro) | Bearer `REACTBITS_LICENSE_KEY` | https://pro.reactbits.dev/components |

To use the paid registries, export `REACTBITS_LICENSE_KEY` in your shell before running shadcn.

### Free slug naming

Reactbits free registry uses PascalCase + variant suffix: `<Name>-<TS|JS>-<TW|CSS>`. e.g. `CountUp-TS-TW`, `BlurText-TS-TW`. The variant pieces:

- `TS` = TypeScript, `JS` = JavaScript
- `TW` = Tailwind, `CSS` = vanilla CSS

This project is TS + Tailwind, so always pick the `-TS-TW` variant.

---

## Master table

| Status | Component | Registry | Use case | Used in (file) |
|---|---|---|---|---|
| 🟢 | CountUp-TS-TW | `@react-bits` | Animated number counters on every `STATS` block across the 10 example pages — fires once when the row scrolls into view | [src/components/CountUp.tsx](src/components/CountUp.tsx), wrapped by [src/components/Stat.tsx](src/components/Stat.tsx) |
| 🟢 | preloader-tw | `@reactbits-starter` | First-paint preloader on every example page — palette-matched variant (slide / stairs / curtain / circle) with brand block layered over | [src/components/react-bits/preloader.tsx](src/components/react-bits/preloader.tsx), wrapped by [src/components/SitePreloader.tsx](src/components/SitePreloader.tsx) |

### CountUp-TS-TW

- **Source:** https://reactbits.dev/text-animations/count-up
- **Registry slug:** `@react-bits/CountUp-TS-TW`
- **Install command:** `npx shadcn@latest add @react-bits/CountUp-TS-TW`
- **Files created:** [src/components/CountUp.tsx](src/components/CountUp.tsx) (added `"use client"` directive — hooks require client boundary)
- **Wrapper:** [src/components/Stat.tsx](src/components/Stat.tsx) parses values like `"500+"`, `"98%"`, `"4.9"` into `(numeric, suffix)` and renders `<CountUp>` + suffix.
- **Usage:** Drop in place of any string stat — e.g. `<Stat value="500+" />` or `<Stat value={s.value} />` inside a `STATS.map()`.
- **Notes:** Uses `Intl.NumberFormat('en-US', ...)` internally — decimal separator is `.`, not `,`. Strings starting with a non-digit (e.g. `"4,9 / 5"`) fall through as a static `<span>`.
