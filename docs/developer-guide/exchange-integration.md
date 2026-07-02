---
slug: /developer-guide/exchange-integration
title: Exchange & Integrator Guide
sidebar_label: Exchange Integration
sidebar_position: 11
---

# Exchange & Integrator Guide

Everything an exchange, custodian, or payment integrator needs to list QOR and process deposits and withdrawals: choosing an interface, detecting deposits safely, and signing withdrawals.

:::note
This guide targets the **`qorechain-vladi`** mainnet (chain version **v3.1.82**). Rehearse the full flow on the **`qorechain-diana`** testnet first — endpoints for both networks are in [Networks](/appendix/networks#public-endpoints).
:::

## Choosing an integration path {#choosing-a-path}

QoreChain is a single chain with **one unified native-QOR balance** exposed through three interfaces. The **same private key controls the same funds** under a Cosmos (`qor1...`), an EVM (`0x...`), and an SVM (base58) address — pick whichever interface fits your stack.

| | **A) Cosmos (native)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Address | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (same key) |
| Decimals (native QOR) | **6** (`uqor`) | **18** (wei-style) | **9** (lamports; 1 uqor = 1,000 lamports) |
| Tooling | Cosmos SDK / CosmJS | **Standard Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Withdrawal signing | **Hybrid PQC required** (ML-DSA-87 + secp256k1) | **Standard secp256k1 / EIP-155 — no PQC** | via Cosmos tx or on-node submission |
| Memo / tag support | **Yes** (shared address + memo) | No (one address per user) | No (one address per user) |
| Deposit detection | scan `MsgSend` events | scan blocks via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Best for | Cosmos-native platforms | **Platforms with existing EVM integration** | Solana-tooling platforms |

**Recommendation:** if you already support EVM chains, **Path B (EVM)** is the least-effort integration — standard Ethereum tooling, and **withdrawals do not require post-quantum signing** (the EVM ante path is exempt). Path A (Cosmos) is the native route with memo-based shared deposit addresses. Path C (SVM) is a full native-QOR interface too — choose it if you specifically prefer Solana tooling.

The three interfaces are **not mutually exclusive** — funds sent to the `0x`, `qor1`, or SVM form of the same key are the same balance.

## Running your node {#node}

Production integrations should verify deposits against their **own synced node**, not a third-party endpoint. Follow [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — it covers the prebuilt binary bundle (with SHA-256 checksums), genesis, public peers, the fee floor (`0.1uqor`), and a fast bootstrap via the published chain-data snapshot. No license is required to run a non-validating full node.

Because QoreChain has **instant finality** (no reorgs), **1 confirmation is final**; waiting 1–2 blocks gives comfortable operational margin.

## Path A — Cosmos (native) {#path-a-cosmos}

Base REST URL: `https://api.qore.host` (or `http://localhost:1317` on your node).

### Watching deposits

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Anti-fake-deposit checklist {#anti-fake-deposit}

Credit a deposit **only** when **all** of the following hold:

1. **`tx_response.code == 0`** — the transaction succeeded; never credit a failed tx.
2. The message is **`/cosmos.bank.v1beta1.MsgSend`** (or a `MsgMultiSend` output) — not a contract call or another module.
3. The **`to_address`** equals your deposit address, and (with the shared-address model) the **`memo`** matches the user.
4. The **`denom == "uqor"`** and the `amount` is the credited value (uqor → ÷ 10⁶ for QOR). Reject any other denom.
5. The tx is in a **committed block** (`height` present and ≤ the latest committed height). Finality is instant — 1 confirmation is final; wait 1–2 blocks for margin.
6. Recompute the amount from the **transfer events** (`coin_received` / `coin_spent`) and cross-check it against the message amount — never trust a single field or the memo alone.
7. Verify the tx hash exists via `GET /cosmos/tx/v1beta1/txs/{hash}` against your **own** synced node.

### Withdrawals — hybrid PQC signing {#cosmos-withdrawals}

Mainnet enforces **post-quantum signatures** on cosmos transactions (`allow_classical_fallback = false`): every withdrawal needs a **hybrid signature** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Deposits do **not** need this (you only watch the chain).

The signing library is [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), which pulls in `@qorechain/pqc` for the FIPS-204 primitives:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

Signing is a **two-step** flow (mirroring `qorechaind tx pqc cosign`):

**Step 1 — one-time per hot wallet: register its ML-DSA-87 key.** This single registration transaction is **classical-signed** (bootstrap exemption): message `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` with `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Derive the ML-DSA key deterministically so it is recoverable from your existing secret — e.g. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, then `mldsa.keygen(seed)` — and store the seed alongside your hot-wallet key.

**Step 2 — every withdrawal after that: hybrid-sign the `MsgSend`.** The adapter bakes the ML-DSA-87 signature into a tx-body extension *before* the normal secp256k1 `signDirect`, so your existing signer stays unchanged:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

Broadcast the signed bytes:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Then poll `GET /cosmos/tx/v1beta1/txs/{hash}` until it appears in a block with `code == 0`.

For an HSM or a custom signer in another language, use the standalone [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 libraries (npm, PyPI, crates.io, Maven Central, Go) and assemble the same extension. The ML-DSA signature **must be deterministic** (FIPS-204 §3.4) — see [Deterministic signing](/developer-guide/post-quantum-signing#deterministic-signing); the chain rejects hedged signatures.

## Path B — EVM {#path-b-evm}

Standard Ethereum integration against `https://evm.qore.host` (chain ID **9801**) or your own node's port 8545.

* **Decimals:** native QOR is **18 decimals** on the EVM rail (1 uqor = 10¹² wei). Getting this wrong mis-credits deposits by a factor of 10¹².
* **Deposits:** scan blocks with `eth_getBlockByNumber` for native transfers to your addresses; confirm with `eth_getTransactionReceipt` (`status == 0x1`).
* **Withdrawals:** standard secp256k1 / EIP-155 signing — **no PQC required** on the EVM ante path. Any Ethereum signing stack works unchanged.
* **Anti-fake-deposit:** verify the receipt status, that the value moved is a **native** transfer (not an ERC-20 event you don't index), and confirm against your own node.
* **Address mapping:** the `0x` address and the `qor1` address are two encodings of the same account — funds are shared. See [EVM Development](/developer-guide/evm-development).

## Path C — SVM (Solana-compatible) {#path-c-svm}

As of v3.1.82 the SVM interface serves **native QOR** (see [Native QOR on the SVM Interface](/developer-guide/svm-development#native-qor)):

* **Balances:** `getBalance` returns lamports (÷ 10⁹ for QOR; 1 uqor = 1,000 lamports).
* **Deposits:** `getSignaturesForAddress` gives the transaction history for an address; System Program transfers move native QOR.
* Public endpoints (`https://svm.qore.host`, `https://svm-testnet.qore.host`) are **read-only**; submit transactions through your own node.

## Flow summary {#flow-summary}

| Operation | Path | Signing needed? |
|---|---|---|
| **Deposit** (user → platform) | Watch your synced node for transfers to your address (+ memo on Cosmos) | No — monitor only |
| **Withdrawal** (platform → user) | Build the transfer, sign offline, broadcast | Cosmos: hybrid PQC · EVM: standard secp256k1 |
| **Balance / sweep** | REST / EVM / SVM balance query + transfer | Sign only for the sweep |

## Related

* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — node setup, downloads, snapshot
* [Running a Node](/developer-guide/running-a-node) — deployment, pruning, indexing
* [Post-Quantum Signing](/developer-guide/post-quantum-signing) — the FIPS-204 libraries behind hybrid withdrawals
* [Networks](/appendix/networks) — chain IDs, endpoints, decimals per interface
