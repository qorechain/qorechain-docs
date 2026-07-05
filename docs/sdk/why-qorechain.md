---
slug: /sdk/why
title: Why QoreChain SDK
sidebar_label: Why QoreChain SDK
sidebar_position: 2
---

# Why QoreChain SDK

The QoreChain SDK gives you everything a modern multi-chain SDK does — typed
messages for every module, typed queries, accounts for three VMs from one
mnemonic, auto-gas, error decoding, subscriptions, wallets, and a React kit.

But five capabilities are **only possible on QoreChain**, because they are built
on protocol features no other Layer 1 has: on-chain AI, three co-resident VMs
with a native bridge, mandatory post-quantum cryptography, one 20-byte identity
across all three VM lanes, and PQC-safe delegated spending for external wallet
keys. These are the reasons to build here.

---

## 1. AI pre-flight risk scoring

**Scan a transaction with on-chain AI before you broadcast it.**

QoreChain ships AI risk analysis as EVM precompiles. The SDK calls them for you
and returns gas plus a risk/anomaly verdict in a single call — so a wallet or
dApp can warn (or block) *before* signing.

```ts
import { createClient } from "@qorechain/sdk";
import { simulateWithRiskScore } from "@qorechain/evm";

const client = createClient({ network: "mainnet", endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(client.evm, {
  from: account.address,
  to: contractAddress,
  data: calldata,
  value: 0n,
});

console.log(preflight.gas);            // estimated gas
console.log(preflight.risk.level);     // on-chain risk level
console.log(preflight.anomaly.flagged);// anomalous pattern?
if (!preflight.safe) {
  // advisory verdict — set your own policy
  console.warn("Transaction flagged by on-chain AI risk scoring");
}
```

**Why it's unique:** the scoring runs *inside the chain* as a deterministic
precompile (`aiRiskScore` at `0x…0B01`, `aiAnomalyCheck` at `0x…0B02`). Other
networks can only bolt on off-chain, non-deterministic AI services. This is the
first SDK that AI-screens a transaction before it is signed, with an on-chain
result. See [AI pre-flight](/sdk/guides/ai-preflight).

---

## 2. Unified cross-VM calls — one account, three VMs, one transaction

**Call a contract on any VM, and batch calls across all three atomically.**

QoreChain runs CosmWasm, EVM, and SVM contracts on the same chain with a native
cross-VM bridge. The SDK exposes one interface to call any of them — and to pack
several cross-VM calls into a single, atomic transaction signed once.

```ts
import { createCrossVMClient } from "@qorechain/sdk";

const crossVM = createCrossVMClient(tx, { query: client.query });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → CosmWasm.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**Why it's unique:** QoreChain is the only L1 with three co-resident VMs and a
native bridge module (`crossvm` + the `CrossVMBridge` precompile). Single-VM
chains cannot express "one account, three VMs, one atomic transaction" — their
SDKs have nothing to wrap. Write once, call any VM. See
[Cross-VM calls](/sdk/guides/cross-vm).

---

## 3. Quantum-safe by default

**Make a signer post-quantum protected in one call.**

QoreChain enforces hybrid post-quantum signatures (ML-DSA-87 + classical) at the
protocol level. The SDK makes adopting them a one-liner: check, register, and
migrate to hybrid signing — with a React badge to show users they're protected.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Idempotent: registers the signer's ML-DSA-87 key on-chain if not already.
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair });
await hybrid.send(messages);
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key.
<QuantumSafeBadge address={account.address} />
```

**Why it's unique:** post-quantum cryptography is native and mandatory on
QoreChain, not an experiment. This is the first SDK where "quantum-safe by
default" is a single call plus a drop-in badge. See
[Quantum-safe](/sdk/guides/quantum-safe).

---

## 4. Unified eth-native accounts — one key, three addresses, one balance

**One `eth_secp256k1` key is one 20-byte identity on all three lanes.** (SDK
0.6.0, chain v3.1.83.)

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key spends on every lane (signHybridEth on the Native path).
```

**Why it's unique:** on multi-VM setups elsewhere, each runtime has its own
account space and funds get stranded per-lane. QoreChain renders one 20-byte
identity three ways with one shared balance — a wallet never "has funds on one
lane but not another". `connectPhantomUnified` even bootstraps this identity
non-custodially from a Phantom signature. See
[Unified accounts](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Authenticator lanes — delegated spending without giving up PQC

**A linked Phantom or MetaMask key spends from the canonical PQC-required
account, under limits, via a relayer.** (SDK 0.7.0, chain v3.1.85.)

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// The Phantom key signs a domain-separated digest; a relayer pays fees and
// broadcasts. The external key NEVER produces an ML-DSA co-signature.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount, // the PQC-required owner
  to: recipient,
  amount: "100uqor",
  nonce, // per-authenticator sequence
});
```

**Why it's unique:** every spend is bounded by an on-chain permission taxonomy,
`SpendingRule` limits, and an expiry — least-privilege and revocable — while
the account itself stays post-quantum protected. See
[Authenticators & delegated spending](/sdk/guides/authenticators).

---

## Everything else, too

Beyond the five differentiators, the SDK covers the full chain surface across
**TypeScript, Python, Go, Rust, and Java**: typed composers for every module
(including sidechains/paychains via `multilayer` and rollups via `rdk`), typed
queries, the tx lifecycle, subscriptions, browser wallets, and the
[`@qorechain/react`](/sdk/guides/react) hooks kit.

Ready to build? Start with the [Quickstart](/sdk/quickstart).
