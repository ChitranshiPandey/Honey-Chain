# Honey Chain — backend

FastAPI + SQLite backend for the Honey Chain frontend, with a `blockchain.py` module that's live
today against a local Hardhat chain by default (see "Where the blockchain goes" below) and falls
back to a zero-setup stub if you'd rather not run one.

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
copy .env.example .env       # Windows; `cp` on macOS/Linux — defaults work as-is

python -m app.seed           # creates honeychain.db and loads sample data
uvicorn app.main:app --reload --port 8000
```

For real (non-stub) blockchain calls to succeed, a local Hardhat node needs to be running first
— see the root [README's Setup](../README.md#setup) or [contracts/README.md](../contracts/README.md).

API docs (auto-generated): http://localhost:8000/docs

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/hives` | — | All hives (for beekeeper dashboard) |
| GET | `/hives/{id}` | — | One hive incl. sensor trend (for hive monitor page) |
| GET | `/batches` | — | All batches |
| GET | `/batches/{id}` | — | One batch incl. provenance events |
| POST | `/batches` | `X-API-Key` | Create a batch — triggers `blockchain.record_batch()` |
| POST | `/batches/{id}/events` | `X-API-Key` | Append a provenance event (e.g. "Dispatched") |
| GET | `/batches/{id}/verify` | — | Consumer QR-scan lookup (`/verify/[id]` page) |
| GET | `/beekeepers/{id}/profile` | — | Dashboard header stats |
| GET | `/admin/beekeepers` | `X-API-Key` | KVIC cluster table |
| GET | `/admin/stats` | `X-API-Key` | KVIC cluster summary numbers |
| GET | `/health` | — | Liveness check |

`X-API-Key` routes require a header matching `API_KEY` in `.env` (see `app/auth.py` and the
root README's "Auth" section) — a shared-secret stopgap, not real user auth.

Run the test suite with `python -m pytest` (see `tests/`) — 8 tests covering batch creation,
validation, verify, and the API-key gate, against an isolated SQLite file, never `honeychain.db`.

## Where the blockchain goes

`app/blockchain.py` is the only file that knows about chains. `IS_LIVE` (computed from whether
`POLYGON_RPC_URL` / `POLYGON_PRIVATE_KEY` / `POLYGON_CONTRACT_ADDRESS` are all set) controls which
mode it runs in:

- **Live (default in this repo's `.env`)**: `POLYGON_CONTRACT_ADDRESS` points at
  `BatchProvenance.sol` already deployed to a local Hardhat chain — `record_batch()` and
  `verify_batch_on_chain()` make real signed `web3.py` calls against it. Needs `npx hardhat node`
  running (see the root README or [contracts/README.md](../contracts/README.md)) — if it isn't,
  these calls fail with a connection error rather than silently falling back.
- **Stub**: blank out the three variables above and restart — `record_batch()` fabricates a tx
  hash/block number instead, zero setup, no chain involved.
- **Public Polygon Amoy**: same three variables, pointed at a public deployment instead of the
  local one — see [contracts/README.md](../contracts/README.md) for the full wallet/faucet/RPC
  walkthrough. Also set `POLYGON_NETWORK_NAME=Polygon Amoy` and `POLYGON_CHAIN_ID=80002` (the
  local setup overrides these to `Hardhat Local` / `31337`).

Nothing else in the app needs to change between modes — routers, schemas, and the frontend all
consume `ChainReceipt`'s fields, not chain internals. `backend/tests/conftest.py` forces the stub
during `pytest` regardless of `.env`, so the suite never depends on a chain being up.
