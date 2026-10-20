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

**Scan a transaction with on-chain AI before you broadcast it** (requires the AI
precompiles to be active on the target network, which they are not on the public
networks yet).

QoreChain builds AI risk analysis into EVM precompiles. The SDK calls them for
you and returns gas plus a risk/anomaly verdict in a single call, so a wallet or
dApp can warn (or block) *before* signing. The AI precompiles are **not active
yet** on mainnet or testnet (see
[EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status)).

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({ endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(publicClient, {
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

**Why it's different:** the scoring is designed to run *inside the chain* as a
deterministic precompile (`aiRiskScore` at `0x…0B01`, `aiAnomalyCheck` at
`0x…0B02`), not as an off-chain service. Until those precompiles are activated, the
helpers above throw on the public networks (`returned no data ("0x")`). See
[AI pre-flight](/sdk/guides/ai-preflight).

---

## 2. Unified cross-VM calls — one account, three VMs, one transaction

**Call a contract on any VM, and batch calls across all three atomically.**

QoreChain runs QoreChain Native, EVM, and SVM contracts on the same chain with a native
cross-VM bridge. The SDK exposes one interface to call any of them — and to pack
several cross-VM calls into a single, atomic transaction signed once.

```ts
import { connectQueryClients, createCrossVMClient } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const crossVM = createCrossVMClient(tx, { query: connectQueryClients(rpcClient).crossvm });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → QoreChain Native.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**Why it's different:** QoreChain runs three co-resident VMs with a native bridge
module (`crossvm`, plus the `CrossVMBridge` precompile once it is active), so one
SDK interface can address all three. Single-VM chains have nothing equivalent to
wrap. Today the reach of a call is limited by the lane it targets: `MsgCrossVMCall`
is switched off on mainnet, SVM transactions are disabled, and QoreChain Native upload and
instantiate are permissioned. See [Cross-VM calls](/sdk/guides/cross-vm).

---

## 3. Quantum-safe by default

**Make a signer post-quantum protected in one call.**

QoreChain enforces hybrid post-quantum signatures (ML-DSA-87 + classical) at the
protocol level. The SDK makes adopting them a one-liner: check, register, and
migrate to hybrid signing — with a React badge to show users they're protected.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Registers the signer's ML-DSA-87 key on-chain unless the chain already has it:
// it reads the status over REST first and never registers blind.
const rest = "https://api.qore.host";
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair, rest });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair, rest });
await hybrid.signAndBroadcastHybrid({
  registry, signer, messages, fee, chainId, accountNumber, sequence,
  rest: "https://api.qore.host", // resolves the v1/v2 PQC sign-bytes form
  transport,
});
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key
// (read over REST, so it works on the public endpoints from `@qorechain/react` 0.9.0).
<QuantumSafeBadge address={account.address} />
```

**Why it matters:** post-quantum cryptography is native and mandatory on
QoreChain's Native path, not an experiment, and the SDK reduces adopting it to a
register call plus a hybrid send path. Registration is explicit: there is no
auto-registration on the first transaction. See
[Quantum-safe](/sdk/guides/quantum-safe).

---

## 4. Unified eth-native accounts — one key, three addresses, one balance

**One `eth_secp256k1` key is one 20-byte identity on all three lanes.** (SDK
0.6.0, chain v3.1.83.) The SVM transaction lane is disabled network-wide today, and
the EVM lane needs an
[authorization window](/sdk/guides/evm#evm-window); the shared balance and
address mapping hold regardless.

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key signs on every enabled lane (signHybridEth on the Native path).
```

**Why it's unique:** on multi-VM setups elsewhere, each runtime has its own
account space and funds get stranded per-lane. QoreChain renders one 20-byte
identity three ways with one shared balance — a wallet never "has funds on one
lane but not another". An external wallet such as Phantom can be linked to that identity as a
limited authenticator ([Authenticators](/sdk/guides/authenticators)). See
[Unified accounts](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Authenticator lanes — delegated spending without giving up PQC

**A linked Phantom or MetaMask key spends from the canonical PQC-required
account, under limits, via a relayer.** (SDK 0.7.0, chain v3.1.85.)

:::caution Not available on the live networks yet
The `abstractaccount` module is switched off on `qorechain-vladi` and
`qorechain-diana` (`GET /qorechain/abstractaccount/v1/config` returns
`"enabled": false`), and from chain v3.2.0 that flag is enforced on every path, so a
key cannot be linked and the lanes below cannot be used. See the
[Authenticators guide](/sdk/guides/authenticators).
:::

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

**Why it matters:** once the module is enabled, every spend is bounded by an on-chain permission taxonomy,
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
