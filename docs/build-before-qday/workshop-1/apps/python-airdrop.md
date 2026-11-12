---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python App, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python App: Q-Day Airdrop

The **Q-Day Airdrop** is a small Python tool that sends testnet QOR to a whole list of addresses in **one** transaction, signed with a classical secp256k1 key and a post-quantum ML-DSA-87 (FIPS 204) key. It then proves from the chain's own record that both signatures were verified. It runs on the QoreChain testnet (`qorechain-diana`, EVM chain ID 9800).

## What it shows {#what-it-shows}

- **Hybrid ML-DSA-87 + secp256k1 signing** from Python.
- **One hybrid-signed transaction verified on chain**, paying many recipients at once with a single multi-send message.
- **A verification report** built from the chain's own transaction record, not from the tool's word.

Why it matters: one signature protects a whole airdrop, and it stays protected against a future quantum computer because the ML-DSA-87 half is post-quantum. See [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Packages and versions {#packages}

| Item | Value |
| --- | --- |
| PyPI package | `qorechain-sdk` 0.13.0 (imported as `qorsdk`) |
| Pinned in `requirements.txt` | `qorechain-sdk==0.13.0` |
| Network | testnet `qorechain-diana`, release v3.2.8 since 12 November 2026 |

The tool imports the protobuf types `Input`, `Output` (from `cosmpy.protos.cosmos.bank.v1beta1.bank_pb2`) and `Coin` (from `cosmpy.protos.cosmos.base.v1beta1.coin_pb2`); the one line in `requirements.txt` is the only dependency. See [SDK install](/sdk/install) for the release table of all languages.

## Set up and run {#run}

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt     # about 15 seconds on a fresh venv
source .venv/bin/activate
```

```bash
python airdrop.py new                 # new key file (mode 600), prints the address
python airdrop.py status              # address, balance, post-quantum key
python airdrop.py register            # register the ML-DSA-87 key once (idempotent)
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day Workshop 1"
python airdrop.py verify <TX_HASH>    # the verification report on its own
```

1. **`new`** creates a recovery phrase in a key file with mode 600 and prints only the address. The default is `~/.config/qday/python.env`; override it with `--key-file` or `QORE_KEY_FILE`. The phrase is never printed. Keep the file private.
2. **Fund the address** from the [Faucet](/dashboard/faucet) (sign-in required; 100 QOR per 24 hours per account and address, plus the builder-fest test tokens).
3. **`register`** registers the ML-DSA-87 key once. The registration is signed classically (a key cannot co-sign its own registration); every transaction after it is hybrid.
4. **`drop`** reads a text file with one address per line and the amount per recipient in QOR. Blank lines, `#` comments, duplicates, the sender itself and anything that is not a valid `qor1...` account address are skipped with a warning. It shows a summary and asks before sending (`--yes` skips the question). At most 100 recipients per transaction.
5. **`verify`** prints the report for any transaction hash.

The repository includes `addresses.example.txt`, a sample list with placeholder lines (it includes an invalid line and a duplicate on purpose, to show the skipping). Replace the placeholders with real testnet addresses before you run `drop`:

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...replace-with-a-testnet-address
qor1...replace-with-another-testnet-address
```

If a broadcast fails while the testnet is upgrading, wait a minute and retry.

## The account {#account}

Coin type 118 (`m/44'/118'/0'/0/0`), the path `build_hybrid_tx` and `ensure_pqc_registered` take. The ML-DSA-87 key is derived from the same mnemonic and bound to the address with `derive_pqc_canonical`. The tool signs from a mnemonic, so it does not use the seed-path helpers. If you build on those, SDK 0.13.0 needs a recovery code or an independent 32-byte PQC secret: in Python `unified_account_from_seed(seed32, recovery_code=...)`; see [SDK install](/sdk/install#whats-new-0130). Never print a recovery code.

```python
account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic
```

## The SDK code that matters {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

The key is registered once with `ensure_pqc_registered(...)`, which does nothing if the same key is already on chain. Gas is never fixed: the real hybrid-signed transaction is simulated first and the limit is the simulated gas times 1.3, priced at 0.15 uqor per gas.

## How the proof works {#proof}

`verify` reads `GET /cosmos/tx/v1beta1/txs/{hash}` from the public testnet REST endpoint and checks:

- an event of type `pqc_hybrid_verify` for the signer with `status=verified`;
- the `/qorechain.pqc.v1.PQCHybridSignature` body extension carries a 4627-byte ML-DSA-87 signature (next to the 64-byte secp256k1 one);
- the transaction succeeded (code 0), and how many recipients it paid.

## What you see when it works {#output}

`drop` prints a summary (recipients, amount each, total), asks for confirmation, then prints the transaction hash and height, and finishes with the verification report: the signer's `pqc_hybrid_verify` status is `verified`, the ML-DSA-87 signature is 4627 bytes, the code is 0, and the recipient count matches your list. Open the transaction at `https://explore.qore.network/tx/<HASH>` (switch the explorer to Testnet).

## Where to access it {#access}

| What | Where |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (switch to Testnet) |
| Faucet | [Faucet](/dashboard/faucet) |

## Get the code {#get-the-code}

The code is in the public repository: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop (the link works once the repository is published; the code is also shown inline on this page).
