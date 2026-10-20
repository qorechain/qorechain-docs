---
slug: /developer-guide/exchange-integration
title: Exchange & Integrator Guide
sidebar_label: Exchange Integration
sidebar_position: 11
---

# Exchange & Integrator Guide

Everything an exchange, custodian, or payment integrator needs to list QOR and process deposits and withdrawals: choosing an interface, detecting deposits safely, and signing withdrawals.

:::note
This guide targets the **`qorechain-vladi`** mainnet (live since 7 June 2026; node release **v3.2.3**, applied at height 3,662,051 on 20 October 2026). Rehearse the full flow on the **`qorechain-diana`** testnet first — it has run v3.2.4 since 19 October 2026, and mainnet moves from v3.2.3 to v3.2.4 at height 3,742,566 (governance proposal 13), so the changes listed below apply to both networks once that block is reached (endpoints for both networks are in [Networks](/appendix/networks#public-endpoints)). If you run your own full node, keep it on the release the download manifest recommends and never below its `minCompatible` (**3.2.3** on mainnet until the upgrade) — an outdated node cannot follow the chain's upgrades and stops at the upgrade height; see [Running a Node](/developer-guide/running-a-node#upgrades) for what to do before height 3,742,566.

**What changed for integrators in v3.2.2 and v3.2.3** (signing format, addresses, decimals, memos and fees are all unchanged):

* **Unprotected (pre-EIP-155) Ethereum transactions are refused** in the mempool and in block execution (v3.2.2). A depositor's wallet must sign with a chain id; every current wallet does.
* **Module accounts cannot be claimed through the EVM** (v3.2.2); do not use a module account address as a deposit or withdrawal address.
* **Vesting accounts can only be created for the signer itself** (v3.2.3); the three vesting-creation messages are also currently on mainnet's circuit-breaker list.
* **PQC key messages need the hybrid signature once an account has a key** (v3.2.3): see [Post-Quantum Signing](/developer-guide/post-quantum-signing#key-integrity). Register the hot wallet's key once, early.
* **EVM windows can be scoped** (v3.2.3): a hot wallet that only sends plain QOR can open a `native_only` window, see [EVM Development](/developer-guide/evm-development#evm-window).

**What changes for integrators in v3.2.4** (on the testnet since 19 October 2026; on mainnet from height 3,742,566). Transaction signing, addresses, decimals, memos and fees are unchanged, and nothing about how a deposit is detected or a withdrawal is signed and broadcast changes:

* **Optional staking locks (new module `x/stakingtier`).** A delegator may lock part of a delegation for 3, 6 or 12 months (minimum lock 10 QOR, at most 16 open locks per delegator). Nothing happens to an account that does not create a lock. While a lock is open, that amount **cannot be undelegated or redelegated**, by any route (a plain transaction, `authz`, a group or a contract); ending a lock early burns a penalty from the locked stake. A custodian that stakes customer funds should therefore not lock the part it may need to return. Read the parameters at `GET /qorechain/stakingtier/v1/params`.
* **A new burn source, `staking_tier_penalty`**, appears in burn statistics once early unlocks happen. Supply-reconciliation jobs that enumerate burn sources should accept an unknown source name.
* **Node-local JSON-RPC limits** for nodes you run yourself: request bodies over 256 KiB are refused (HTTP 413), no more than 256 requests are served at once (HTTP 503 beyond that), and an `eth_getLogs` or `eth_newFilter` filter with more than 4 topic positions, 1000 alternatives in one position or 1000 addresses is refused. The limits are configurable in the `[json-rpc]` section of `app.toml` (see [Running a Node](/developer-guide/running-a-node#exposing-endpoints-for-integration)). A deposit scanner that polls `eth_getLogs` with a long address list should split the list.
* **A repeated key registration is refused before it is paid for.** A node running v3.2.4 rejects, at broadcast time, a `MsgRegisterPQCKeyV2` that carries the exact public key the account already has registered, with the error the chain would have returned (PQC code 7, account already exists), and without charging a fee. Check `GET /qorechain/pqc/v1/account/{address}` before registering a hot wallet's key, as recommended below.
* **Optional possession flag.** The account record gains a `possession_proven` field that says whether a proof of possession was verified at registration; it does not change who may send or receive. See [Post-Quantum Signing](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## Choosing an integration path {#choosing-a-path}

QoreChain is a single chain with **one unified native-QOR balance** exposed through three interfaces. The **same private key controls the same funds** under a Cosmos (`qor1...`), an EVM (`0x...`), and an SVM (base58) address — pick whichever interface fits your stack.

| | **A) Cosmos (native)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Address | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (same key) |
| Decimals (native QOR) | **6** (`uqor`) | **18** (wei-style) | **9** (lamports; 1 uqor = 1,000 lamports) |
| Tooling | Cosmos SDK / CosmJS | **Standard Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Withdrawal signing | **Hybrid PQC required** (ML-DSA-87 + secp256k1) | **Standard secp256k1 / EIP-155, but only inside an open PQC authorisation window** (registered ML-DSA key + a window opened by a hybrid-signed Cosmos message) | via Cosmos tx or on-node submission (lane currently disabled) |
| Memo / tag support | **Yes** (shared address + memo) | No (one address per user) | No (one address per user) |
| Deposit detection | scan `MsgSend` events | scan blocks via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Best for | Cosmos-native platforms | **Platforms with existing EVM integration** | Solana-tooling platforms |

**Recommendation:** use **Path A (Cosmos)** for withdrawals; it is the native route and has memo-based shared deposit addresses. Since v3.2.0 the EVM lane (Path B) also requires a registered ML-DSA-87 key and an open, bounded **EVM authorisation window** that can only be opened with a hybrid-signed Cosmos-lane message, so an EVM withdrawal rail needs the same post-quantum signing stack as Path A **plus** window management (see [Path B](#path-b-evm) and the [EVM authorisation window](/developer-guide/evm-development#evm-window)). Path B remains fine for **deposit detection** with standard Ethereum tooling. Path C (SVM) is a full native-QOR interface on paper, but **its transaction lane is currently disabled network-wide** (see [Path C](#path-c-svm)) — use Path A, or Path B for deposit detection, until it reopens.

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
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&limit=50" | jq '.tx_responses[].txhash'

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
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing@0.32 @cosmjs/stargate@0.32 cosmjs-types@0.9.0
# pin the cosmjs packages to 0.32 (the adapter's peer range) and cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

Signing is a **two-step** flow (mirroring `qorechaind tx pqc cosign`):

**Step 1 — one-time per hot wallet: register its ML-DSA-87 key.** This single registration transaction is **classical-signed** (bootstrap exemption, for an account that has no key yet; once a key exists, any further key message must be hybrid-signed): message `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` with `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Derive the ML-DSA key deterministically so it is recoverable from your existing secret — e.g. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, then `mldsa.keygen(seed)` — and store the seed alongside your hot-wallet key. Registration is explicit: nothing registers the key for you when a hybrid transaction first appears, and a key embedded in a transaction is not registered. The chain refuses `classical_only` keys and keys that give no post-quantum protection (code 230) and verifies an optional proof of possession when you attach one (CLI: `register-key-v2 ... --pqc-key`; `@qorechain/sdk` 0.9.0 attaches one by itself through `ensurePqcRegistered` once the network has applied v3.2.3, and `@qorechain/wallet-adapter` 0.4.0 does not, which is accepted). Set the gas explicitly (the 2,592-byte key needs more than the default 200,000; use `--gas 600000` on the CLI, a gas limit of 600,000 in code, and a fee of at least gas × 0.1 uqor, i.e. 60,000 uqor).

**Step 2 — every withdrawal after that: hybrid-sign the `MsgSend`.** The adapter bakes the ML-DSA-87 signature into a tx-body extension *before* the normal secp256k1 `signDirect`, so your existing signer stays unchanged:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  rest: "https://api.qore.host",   // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
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
# code 20 "hybrid PQC signature required" => the transaction carries no PQC extension
#   (a classical-only transaction is refused; only the key registration itself is exempt)
# code 21 => the PQC half did not verify (wrong key or sign-bytes form), see the troubleshooting link below
```

Then poll `GET /cosmos/tx/v1beta1/txs/{hash}` until it appears in a block with `code == 0`.

For an HSM or a custom signer in another language, use the standalone [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 libraries (npm, PyPI, crates.io, Maven Central, Go) and assemble the same extension. The chain accepts any valid FIPS-204 ML-DSA-87 signature, hedged or deterministic; signing deterministically (FIPS-204 §3.4, the libraries' default) gives you a reproducible signature and tx hash. See [Deterministic signing](/developer-guide/post-quantum-signing#deterministic-signing), and [Troubleshooting code 21](/developer-guide/post-quantum-signing#code-21) if a hybrid transaction is rejected.

### Server-side alternative: `@qorechain/chain-bridge` {#chain-bridge}

For a fully server-side hot-wallet worker (no browser wallet involved), **`@qorechain/chain-bridge`** (npm) wraps the whole flow — key derivation, hybrid signing, and broadcast — in one call. It is pure JavaScript (no native addons), suitable for serverless workers:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  cosmosRest: "https://api.qore.host",      // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, hybrid-signs the MsgSend, and broadcasts.
// Amounts are in uqor (6 decimals). Register the key beforehand with bridge.registerPqc({ mnemonic }).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

If the account has no registered key yet, the library itself sends the explicit `MsgRegisterPQCKeyV2` transaction and retries once; that is the library's behaviour, not the chain's, so a hot-wallet rail should register the key ahead of time and confirm it (`GET /qorechain/pqc/v1/account/{address}`) before the first withdrawal. From `chain-bridge` 0.2.3, with `cosmosRest` set, the registration carries the proof of possession once the network has applied v3.2.3, and before any re-registration the library reads the chain: if the account already holds a key that is neither the canonical nor the legacy key of your mnemonic it throws `pqc_key_mismatch` and sends nothing (a repeated registration costs its fee and is refused). `chain-bridge` (≥0.1.1) uses the same canonical address-bound PQC derivation as the rest of the stack — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — so the key is recoverable from the mnemonic with `qorechaind tx pqc recover-key`. Accounts registered with older tooling are handled automatically (legacy-key fallback), and can be migrated once to the canonical key with [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Path B — EVM {#path-b-evm}

Standard Ethereum integration against `https://evm.qore.host` (chain ID **9801**) or your own node's port 8545.

* **Decimals:** native QOR is **18 decimals** on the EVM rail (1 uqor = 10¹² wei). Getting this wrong mis-credits deposits by a factor of 10¹².
* **Deposits:** scan blocks with `eth_getBlockByNumber` for native transfers to your addresses; confirm with `eth_getTransactionReceipt` (`status == 0x1`). Depositors' own EVM transactions are subject to the window rule too, so a user whose account has no registered key or open window cannot send a deposit from the EVM lane (they can use the Cosmos lane instead), and a transaction signed without a chain id (pre-EIP-155) is refused outright. A window may be scoped (`native_only`, `allowed_targets`), so an admitted deposit is always a native transfer or a call the window allows; still read the receipt rather than assuming.
* **Withdrawals:** standard secp256k1 / EIP-155 signing, **but only from an account with a registered ML-DSA-87 key and an open EVM authorisation window** (since v3.2.0; see [EVM authorisation window](/developer-guide/evm-development#evm-window) and the walkthrough in [Your First Transaction](/getting-started/first-transaction#evm-window)). A transaction outside a window is refused (codespace `pqc`, codes 26, 27 or 28). The window must be opened with a hybrid-signed Cosmos-lane transaction, so Path B does not remove the need for post-quantum signing; size `max-value` to cover the value plus the maximum fee (gas limit × max fee per gas) of every withdrawal you expect inside the window (for a hot wallet that sends plain QOR only, add `--native-only` when you open it), and watch `GET /qorechain/pqc/v1/evm_window/{address}` so the hot wallet never runs dry mid-batch. Opening a window advances the account's sequence, which is also its EVM nonce, so read the nonce after the window is open.
* **Anti-fake-deposit:** verify the receipt status, that the value moved is a **native** transfer (not an ERC-20 event you don't index), and confirm against your own node.
* **Address mapping:** the `0x` address and the `qor1` address are two encodings of the same account — funds are shared. See [EVM Development](/developer-guide/evm-development).

## Path C — SVM (Solana-compatible) {#path-c-svm}

:::caution SVM lane currently disabled
The SVM execution lane is **currently disabled network-wide for transaction submission** as of chain version v3.1.89 (22 August) — any transaction to it returns `code 11, "SVM module is disabled"`. Do **not** stand up a deposit/withdrawal rail on Path C until the lane reopens — this is a compile-time disable, not a runtime parameter, so it cannot be turned back on by a governance vote; it's expected to stay off until an external audit clears it. Use **Path A (Cosmos)** or **Path B (EVM)** instead. Read endpoints (e.g. `getBalance`) may still respond, but do not build deposit detection or withdrawal flows against SVM while transaction submission is disabled.
:::

As of v3.1.82 the SVM interface serves **native QOR** (see [Native QOR on the SVM Interface](/developer-guide/svm-development#native-qor)):

* **Balances:** `getBalance` returns lamports (÷ 10⁹ for QOR; 1 uqor = 1,000 lamports).
* **Deposits:** `getSignaturesForAddress` gives the transaction history for an address; System Program transfers move native QOR.
* Public endpoints (`https://svm.qore.host`, `https://svm-testnet.qore.host`) are **read-only**; submit transactions through your own node.

## Flow summary {#flow-summary}

| Operation | Path | Signing needed? |
|---|---|---|
| **Deposit** (user → platform) | Watch your synced node for transfers to your address (+ memo on Cosmos) | No — monitor only |
| **Withdrawal** (platform → user) | Build the transfer, sign offline, broadcast | Cosmos: hybrid PQC · EVM: standard secp256k1 inside a PQC-authorised window |
| **Balance / sweep** | REST / EVM / SVM balance query + transfer | Sign only for the sweep |

## Related

* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — node setup, downloads, snapshot
* [Running a Node](/developer-guide/running-a-node) — deployment, pruning, indexing
* [Post-Quantum Signing](/developer-guide/post-quantum-signing) — the FIPS-204 libraries behind hybrid withdrawals
* [Networks](/appendix/networks) — chain IDs, endpoints, decimals per interface
