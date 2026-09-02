# Honey Chain — frontend prototype

A working UI prototype for Honey Chain (SIH 2026, PS 26021), built with Next.js, TypeScript, and
Tailwind CSS. All data is mocked in `lib/mock-data.ts` — no backend required yet.

## Setup

You'll need [Node.js](https://nodejs.org) 18 or later installed.

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## What's included

| Route | What it shows |
|---|---|
| `/` | Role selection — Beekeeper / Consumer / KVIC admin |
| `/beekeeper` | Beekeeper dashboard — hive overview, alerts, stats |
| `/beekeeper/hive/H101` (also H102, H103, H104) | Live hive monitoring, sensor cards, trend chart, AI insight. H104 shows the offline/stale-data state |
| `/beekeeper/batch/new` | Guided batch-creation wizard |
| `/beekeeper/batch/HC-MP-2026-00142` | Batch detail — blockchain provenance timeline + QR code |
| `/verify/HC-MP-2026-00142` | Consumer-facing QR scan result page (mobile-first) |
| `/admin` | KVIC cluster dashboard — beekeepers, hives, flagged records |

## Project structure

```
app/                    Next.js App Router pages
  page.tsx              Home / role select
  beekeeper/             Beekeeper section (has its own layout.tsx with sidebar)
  verify/[id]/           Consumer scan result
  admin/                 KVIC dashboard
components/             Shared UI components
lib/mock-data.ts        All mock data — swap this out for real API calls later
tailwind.config.ts      Design tokens (colors, fonts) — the whole visual system lives here
```

## Design system

Colors, fonts, and spacing are all defined as tokens in `tailwind.config.ts` — change a value
there and it updates everywhere. Key colors:

- `primary` (#8C5A1E) — honey brown, main actions
- `gold` (#F2A93B) — highlights, KVIC/blockchain accents
- `trust` (#0F6E56) — verified states, healthy status
- `alert` (#A94438) — warnings, critical status
- `ink` (#231A10) — dark surfaces (sidebar, hero sections)

Fonts: **Fraunces** (serif, headings) + **Manrope** (sans, body) — loaded automatically via
`next/font/google`, no extra setup needed.

## Next steps

- Swap `lib/mock-data.ts` calls for real API calls once the FastAPI backend is ready
- Wire up the batch-creation wizard to actually POST to the backend
- Add authentication (phone + OTP) on the login/role-select flow
- Connect the QR code to a real deployed `/verify/[id]` URL once hosted
