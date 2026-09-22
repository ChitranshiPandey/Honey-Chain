# Honey Chain — contracts

Solidity contract + Hardhat project for the on-chain batch-provenance ledger. This is what
`backend/app/blockchain.py` talks to once it's switched out of stub mode.

## Setup

```bash
cd Honey-Chain/contracts
npm install
```

## Test

```bash
npm test
```

## Deploy locally (default for this project — no wallet, no signup)

What `backend/.env` is configured against today. Two terminals:

```bash
# Terminal 1 — leave running
npx hardhat node
```

```bash
# Terminal 2
npm run deploy:local
```

`npx hardhat node` starts a local Ethereum-compatible chain and prints 20 pre-funded test accounts
with their private keys — fixed, publicly documented values that ship with every Hardhat project
(not a secret, not tied to any real funds). `backend/.env` is set to use Account #0 as the signer.
Deploying from a fresh node's first account, as its first transaction, always produces the same
contract address (`0x5FbDB2315678afecb367f032d93F642f64180aa3` — deterministic function of the
deployer's address and nonce, both fixed for a brand-new node), so `backend/.env` doesn't need to
change on a normal restart — just make sure Terminal 1 is running before the backend makes any
blockchain call.

**Confirming it's real:** create a batch through the app or `POST /batches` in the backend's
`/docs`. The response's `txHash` and `blockNumber` are genuine — `blockNumber` will be small
(1, 2, 3, ...), this chain's actual height, unlike the stub's `2,700,000+`-style fake numbers.
`GET /batches/{id}/verify` does a real on-chain read (`getBatch`) to confirm the hash. Optional:
`npx hardhat console --network localhost` here to query the deployed contract directly.

**Don't want to run a local chain?** Blank out `backend/.env`'s `POLYGON_RPC_URL` /
`POLYGON_PRIVATE_KEY` / `POLYGON_CONTRACT_ADDRESS` and restart the backend — `app/blockchain.py`
falls back to a zero-setup stub (fabricated tx hash/block number) automatically.

## Deploy to Polygon Amoy (public testnet — optional)

Worth doing if you want a deployment that persists without a process running, and a real,
publicly-clickable Polygonscan link to show — instead of a local chain that resets whenever you
close it. Free, no real money, about 15 minutes.

### What you need

- [MetaMask](https://metamask.io) (or any wallet browser extension) — create a
  **fresh wallet just for this project**. Never use a personal/mainnet wallet's
  private key in a `.env` file.
- Node.js 18+ (already required for the frontend/contracts).

### 1. Create a testnet wallet

1. Install MetaMask, create a new wallet, save the seed phrase somewhere safe.
2. Add the **Polygon Amoy** network to MetaMask:
   - Network name: `Polygon Amoy Testnet`
   - RPC URL: `https://rpc-amoy.polygon.technology`
   - Chain ID: `80002`
   - Currency symbol: `POL`
   - Block explorer: `https://amoy.polygonscan.com`

   (MetaMask may also offer to add Amoy automatically if you visit
   [chainlist.org](https://chainlist.org) and search "Polygon Amoy".)
3. Export the private key for this wallet: MetaMask → account menu → **Account
   details** → **Show private key**. You'll paste this into `.env` files — it's a
   throwaway testnet wallet, so this is safe, but still never commit it to git.

### 2. Get free test MATIC (POL)

1. Copy your wallet address from MetaMask.
2. Go to the official faucet: **[faucet.polygon.technology](https://faucet.polygon.technology)**
3. Select network **Amoy**, paste your address, request tokens.
4. Wait ~30 seconds, confirm the balance shows up in MetaMask (switch to the Amoy
   network first). You only need a small amount — each contract write on Amoy costs
   a fraction of a cent's worth of gas.

### 3. Get an RPC URL

Two options — pick whichever is faster for you:

- **Option A — zero signup (fastest):** use Polygon's public endpoint directly:
  `https://rpc-amoy.polygon.technology`. Free, no account needed. It can be a bit
  slower or rate-limited under heavy load, which doesn't matter for a demo.
- **Option B — more reliable:** sign up free at [Alchemy](https://www.alchemy.com)
  or [Infura](https://www.infura.io), create an app on the **Polygon Amoy**
  network, and copy its HTTPS RPC URL. Takes ~5 extra minutes, worth it if the
  public RPC feels flaky right before a demo.

### 4. Deploy the contract

```bash
cd Honey-Chain/contracts
copy .env.example .env        # `cp` on macOS/Linux
```

Edit `contracts/.env`:

```env
POLYGON_RPC_URL=<the RPC URL from step 3>
POLYGON_PRIVATE_KEY=<the private key from step 1, paste exactly as MetaMask shows it>
```

Then test and deploy:

```bash
npm test              # 5 tests, against a local chain, unrelated to Amoy
npm run deploy:amoy
```

This prints something like:

```text
BatchProvenance deployed to: 0xAbC123...
```

Copy that address.

### 5. Point the backend at the deployed contract

Edit `Honey-Chain/backend/.env` and set all five blockchain variables:

```env
POLYGON_RPC_URL=<same RPC URL as step 3>
POLYGON_PRIVATE_KEY=<same private key as step 1 — this wallet is also the backend's signer>
POLYGON_CONTRACT_ADDRESS=<the address printed in step 4>
POLYGON_NETWORK_NAME=Polygon Amoy
POLYGON_CHAIN_ID=80002
```

Restart the backend (`uvicorn app.main:app --reload --port 8000`) — no local Hardhat node needed
anymore, this is now talking to the public Amoy testnet.

### 6. Confirm it's actually live

1. Create a batch through the UI or `POST /batches` in the Swagger docs.
2. Take the returned `txHash` and open `https://amoy.polygonscan.com/tx/<txHash>` — a real,
   mined, publicly-viewable transaction.
3. `/verify/<id>` now does a real on-chain read against the public network.

### Troubleshooting

| Symptom | Fix |
|---|---|
| `insufficient funds for gas` | Faucet drip too small / wallet not funded yet — request from the faucet again, wait a minute. |
| RPC request times out or hangs | Public RPC (Option A) is rate-limited — switch to Alchemy/Infura (Option B). |
| `nonce too low` / transaction stuck | Reset the account in MetaMask (Settings → Advanced → Clear activity tab data) — unrelated to the backend, just a stale nonce in your wallet cache. |
| Backend still shows stub tx hashes after restart | One of the connection variables (`POLYGON_RPC_URL`, `POLYGON_PRIVATE_KEY`, `POLYGON_CONTRACT_ADDRESS`) in `backend/.env` is still blank or has a typo — `IS_LIVE` in `blockchain.py` requires all three set. |
