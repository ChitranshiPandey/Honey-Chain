"""
Blockchain recording service for Honey Chain batches.

Two modes, chosen automatically:

- **Stub** (default, zero setup): fabricates a plausible tx hash/block number
  so the rest of the app (API responses, frontend) can be built and demoed
  against a stable interface. This is what runs until Polygon credentials are
  configured.
- **Live**: once POLYGON_RPC_URL, POLYGON_PRIVATE_KEY and
  POLYGON_CONTRACT_ADDRESS are set (see .env.example), every call goes
  through web3.py to the deployed BatchProvenance contract
  (Honey-Chain/contracts/contracts/BatchProvenance.sol) on Polygon Amoy.

Everything that calls this module (see routers/batches.py) only depends on
the `ChainReceipt` shape and the two function signatures below, so switching
modes needs no changes anywhere else.
"""

import hashlib
import json
import os
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Any

NETWORK_NAME = os.getenv("POLYGON_NETWORK_NAME", "Polygon Amoy")
CHAIN_ID = int(os.getenv("POLYGON_CHAIN_ID", "80002"))  # Polygon Amoy

_RPC_URL = os.getenv("POLYGON_RPC_URL")
_PRIVATE_KEY = os.getenv("POLYGON_PRIVATE_KEY")
_CONTRACT_ADDRESS = os.getenv("POLYGON_CONTRACT_ADDRESS")

IS_LIVE = bool(_RPC_URL and _PRIVATE_KEY and _CONTRACT_ADDRESS)

_ABI_PATH = Path(__file__).parent / "contracts" / "BatchProvenance.abi.json"

# Populated lazily by _client() only when IS_LIVE, so `web3` need not even be
# installed for the zero-config stub path to work.
_contract: Any = None
_w3: Any = None
_account: Any = None


@dataclass
class ChainReceipt:
    tx_hash: str
    block_number: int
    network: str


def _batch_data_hash(batch_id: str, extraction_date: str, quantity_kg: float) -> bytes:
    """Deterministic fingerprint of the immutable fields that identify a batch.

    Must stay reproducible from the same inputs so verification can recompute
    it later and compare against what's stored on-chain.
    """
    payload = f"{batch_id}:{extraction_date}:{quantity_kg}".encode()
    return hashlib.sha256(payload).digest()


def _client() -> tuple[Any, Any, Any]:
    """Lazily construct the web3 client, signer account, and contract handle."""
    global _w3, _account, _contract
    if _contract is not None:
        return _w3, _account, _contract

    from web3 import Web3

    abi = json.loads(_ABI_PATH.read_text())
    w3 = Web3(Web3.HTTPProvider(_RPC_URL))
    account = w3.eth.account.from_key(_PRIVATE_KEY)
    contract = w3.eth.contract(address=Web3.to_checksum_address(_CONTRACT_ADDRESS), abi=abi)

    _w3, _account, _contract = w3, account, contract
    return _w3, _account, _contract


def _send(function_call: Any) -> "ChainReceipt":
    w3, account, _ = _client()
    tx = function_call.build_transaction(
        {
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address),
            "chainId": CHAIN_ID,
            "gasPrice": w3.eth.gas_price,
        }
    )
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    # web3.py 7's HexBytes.hex() drops the "0x" prefix (unlike earlier
    # versions) — add it back so this matches standard Ethereum tx-hash
    # format (what Polygonscan etc. expect) and the stub's format below.
    receipt_hash = receipt["transactionHash"].hex()
    return ChainReceipt(
        tx_hash=receipt_hash if receipt_hash.startswith("0x") else f"0x{receipt_hash}",
        block_number=receipt["blockNumber"],
        network=NETWORK_NAME,
    )


def record_batch(batch_id: str, extraction_date: str, quantity_kg: float) -> ChainReceipt:
    """Record a batch's provenance on-chain and return the receipt."""
    data_hash = _batch_data_hash(batch_id, extraction_date, quantity_kg)

    if IS_LIVE:
        _, _, contract = _client()
        return _send(contract.functions.recordBatch(batch_id, data_hash))

    tx_hash = f"0x{data_hash.hex()}"
    block_number = 2_700_000 + random.randint(0, 200_000)
    return ChainReceipt(tx_hash=tx_hash, block_number=block_number, network=NETWORK_NAME)


def record_event(batch_id: str, label: str, date: str) -> ChainReceipt | None:
    """Record a provenance event (quality check, packaging, dispatch, ...) on-chain.

    Returns None in stub mode — only batch creation gets a stub receipt today;
    the frontend doesn't display per-event chain info yet.
    """
    if not IS_LIVE:
        return None

    data_hash = hashlib.sha256(f"{batch_id}:{label}:{date}".encode()).digest()
    _, _, contract = _client()
    return _send(contract.functions.recordEvent(batch_id, data_hash))


def verify_batch_on_chain(
    batch_id: str, extraction_date: str, quantity_kg: float, tx_hash: str | None
) -> bool:
    """Confirm a previously recorded batch still checks out on-chain.

    Stub behaviour: true if a tx hash was ever recorded. Live behaviour: the
    real fraud-detection check — recompute the batch's data hash from its
    current off-chain fields and confirm it still matches what's stored
    on-chain. If someone edits the off-chain record, this comparison fails.
    """
    if not tx_hash:
        return False

    if not IS_LIVE:
        return True

    expected_hash = _batch_data_hash(batch_id, extraction_date, quantity_kg)
    _, _, contract = _client()
    stored_hash, recorded_at = contract.functions.getBatch(batch_id).call()
    return recorded_at > 0 and stored_hash == expected_hash
