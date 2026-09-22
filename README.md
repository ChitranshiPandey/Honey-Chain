# Honey Chain

Blockchain-based honey traceability and smart beekeeping system — SIH 2026, PS 26021
(Ministry of MSME). Next.js/TypeScript frontend, FastAPI backend, deploying to Polygon.

This is **no longer a frontend-only prototype** — the app is a real frontend + backend, talking
to each other over HTTP. The frontend has no mock data left; every page reads from and writes to
the FastAPI service in `backend/`. The batch-provenance smart contract is written, tested, and
**deployed and live** — by default against a local Hardhat chain (zero wallet/signup, see
[contracts/README.md](contracts/README.md)), with a public Polygon Amoy deployment documented
there too as a 15-minute optional next step for a persistent, publicly-verifiable deployment.

## Setup

Three processes for the full live experience (chain included) — or two if you're fine with the
zero-setup blockchain stub, see the note after step 3.

**1. Local blockchain** (Hardhat — no wallet, no signup, free):

```bash
cd contracts
npm install
npx hardhat node             # leave this running
```

In a second terminal, deploy once (redeploying after a restart reproduces the same address, so
`backend/.env` — already configured for this — doesn't need touching again; see
[contracts/README.md](contracts/README.md) for why):

```bash
cd contracts
npm run deploy:local
```

**2. Backend** (FastAPI + SQLite), in a third terminal:

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows; `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
copy .env.example .env       # `cp` on macOS/Linux — defaults work as-is
python -m app.seed           # creates honeychain.db with sample data
uvicorn app.main:app --reload --port 8000
```

**3. Frontend** (Next.js), in a fourth terminal:

```bash
npm install
copy .env.local.example .env.local   # `cp` on macOS/Linux — defaults work as-is
npm run dev
```

Open **http://localhost:3000**. API docs / a way to poke the backend directly:
**http://localhost:8000/docs**.

Requires [Node.js](https://nodejs.org) 18+ and Python 3.11+.

**Don't want to run the chain?** Blank out the three connection vars in `backend/.env`
(`POLYGON_RPC_URL`, `POLYGON_PRIVATE_KEY`, `POLYGON_CONTRACT_ADDRESS`) and restart the backend —
it falls back to the zero-setup stub automatically, and step 1 becomes unnecessary. Every route
still works, batch creation just returns a fabricated tx hash instead of a real one.

Both `.env.example` files ship with a matching `dev-local-key` / `HONEYCHAIN_API_KEY` pair, so
write endpoints work out of the box locally — see "Auth" below before using this anywhere but
your own machine.

**Backend tests**:

```bash
cd backend
python -m pytest       # 8 tests: batch creation, validation, verify, API-key gating
                        # always run against the stub, regardless of backend/.env's chain config
```

**Contract tests** (independent of the running local chain above — spins up its own):

```bash
cd contracts
npm test              # runs the 5-test Hardhat suite
```

## What's included

| Route | What it shows |
|---|---|
| `/` | Role selection — Beekeeper / Consumer / KVIC admin |
| `/beekeeper` | Beekeeper dashboard — hive overview, alerts, stats (live from the API) |
| `/beekeeper/hive/H101` (also H102, H103, H104) | Live hive monitoring, sensor cards, trend chart, AI insight. H104 shows the offline/stale-data state |
| `/beekeeper/batch/new` | Guided batch-creation wizard — actually POSTs to the backend, which records the batch and returns a blockchain receipt |
| `/beekeeper/batch/HC-MP-2026-00142` | Batch detail — blockchain provenance timeline + QR code |
| `/verify/HC-MP-2026-00142` | Consumer-facing QR scan result page (mobile-first), including a live chain-confirmation check |
| `/admin` | KVIC cluster dashboard — beekeepers, hives, flagged records |

## Project structure

```
app/                    Next.js App Router pages (all server components fetch from the API)
  page.tsx              Home / role select
  beekeeper/             Beekeeper section (has its own layout.tsx with sidebar)
  verify/[id]/           Consumer scan result
  admin/                 KVIC dashboard
  api/batches/route.ts   Server-side proxy for the one client-side write (batch creation) —
                          keeps the API key out of the browser bundle, see "Auth" below
  error.tsx              Friendly fallback if the API can't be reached
components/             Shared UI components
lib/api.ts              Typed fetch client — the only place that knows the backend's URL
lib/types.ts            Shared TypeScript types, matching the backend's Pydantic schemas 1:1
tailwind.config.ts      Design tokens (colors, fonts) — the whole visual system lives here

backend/
  app/main.py           FastAPI app, CORS, router wiring
  app/models.py          SQLAlchemy tables
  app/schemas.py          Pydantic request/response shapes (camelCase, matches the frontend)
  app/routers/             hives, batches, beekeepers, admin endpoints
  app/blockchain.py         The ONLY file that knows about chains — see below
  app/auth.py                Shared-secret API-key gate for write/admin routes — see "Auth" below
  app/insight.py              Rule-based hive health engine behind the "AI insight" panel
  app/contracts/             Compiled contract ABI, used by blockchain.py's web3.py calls
  app/seed.py               Loads sample data
  tests/                      pytest suite (TestClient + an isolated SQLite file)

contracts/                Solidity contract + Hardhat project (separate from the backend's Python env)
  contracts/BatchProvenance.sol   The on-chain batch-provenance ledger
  test/                            5 passing Hardhat tests
  scripts/deploy.js                Deploys to a local Hardhat chain or Polygon Amoy (`npm run deploy:local` / `deploy:amoy`)
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

## Blockchain: Polygon-compatible (local by default, Polygon Amoy optional)

The provenance record for each honey batch lives partly on-chain — a tamper-evident hash trail —
so no single party (KVIC, a distributor, the app itself) can quietly edit batch history after the
fact. The human-readable data stays in the backend's database; only a hash of it goes on-chain as
the trust anchor.

The contract (`contracts/contracts/BatchProvenance.sol`) is written, its 5-test Hardhat suite
passes, and it's **deployed and live**. `backend/app/blockchain.py` is fully wired to it via
`web3.py` — real signed transactions on batch creation, real on-chain reads to verify a batch
hasn't been tampered with. By default it's pointed at a local Hardhat chain (see "Setup" above and
[contracts/README.md](contracts/README.md)) rather than the public Polygon Amoy testnet, to skip
wallet/faucet/RPC signup entirely — it's the same EVM, the same contract, the same `web3.py` code
path, just running locally instead of publicly. `contracts/README.md` also documents deploying to
the real Polygon Amoy testnet, for a persistent deployment with a public, clickable Polygonscan
link — a ~15-minute, free, optional next step. Leave the three connection env vars blank and the
app falls back to the built-in stub (fabricated tx hash/block number, zero setup, no chain
involved) automatically — nothing else changes either way.

## Auth

There's no login yet — no phone+OTP, no sessions, no per-user identity. What exists today is a
shared-secret gate (`backend/app/auth.py`): an `X-API-Key` header is required on `POST /batches`,
`POST /batches/{id}/events`, and all `/admin/*` routes, checked against `API_KEY` in
`backend/.env`. That closes the "anyone on the internet can write a batch or read the KVIC
dashboard" gap, but it's one key for everyone, not real auth. The frontend's server components
attach the key automatically from `HONEYCHAIN_API_KEY` (server-only env var); the one client-side
write (the batch-creation wizard) goes through `app/api/batches/route.ts` instead, so the key
never ships to the browser. Every page still acts as one seeded beekeeper
(`lib/api.ts`'s `CURRENT_BEEKEEPER_ID`) — real phone+OTP login, replacing that constant with a
session, is still the next step.

## AI insight

The hive detail page's "AI insight" text is a rule-based engine (`backend/app/insight.py`), not a
trained model — there's no labeled failure dataset for these hives to train one on. It reads each
hive's live temperature, activity, weight trend, and offline status and picks a reason/action pair
from a small set of thresholds (colony stress, overheating, offline sensor, all-normal), computed
fresh on every request rather than fixed per hive. It's real in that it reacts to the actual
numbers — change a hive's readings, the insight changes — but it's still hand-written domain
rules, not learned. A trained model is a drop-in replacement later: nothing else in the app reads
more than the `reason` / `action` strings it returns.

## Next steps

- Deploy the batch-provenance contract to the public Polygon Amoy testnet (currently live against a local chain only) — see [contracts/README.md](contracts/README.md) — for a persistent deployment with a real Polygonscan link
- Replace the shared API key with real authentication (phone + OTP) on the login/role-select flow
- Build the IoT ingestion path from real ESP32 hive sensors into the backend (hive data is seeded, not live, today)
- Train an actual model behind "AI insight" (disease detection, productivity prediction) once real sensor history exists to train on — the rule-based engine is a reasonable stand-in until then
