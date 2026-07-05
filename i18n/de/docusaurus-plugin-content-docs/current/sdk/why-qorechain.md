---
slug: /sdk/why
title: Warum QoreChain SDK
sidebar_label: Warum QoreChain SDK
sidebar_position: 2
---

# Warum QoreChain SDK

Das QoreChain SDK bietet alles, was ein modernes Multi-Chain-SDK leistet — typisierte
Nachrichten für jedes Modul, typisierte Abfragen, Konten für drei VMs aus einer
einzigen Mnemonik, automatisches Gas, Fehlerdekodierung, Subscriptions, Wallets und ein React-Kit.

Doch fünf Fähigkeiten sind **nur auf QoreChain möglich**, weil sie auf
Protokollfunktionen aufbauen, die kein anderes Layer 1 besitzt: On-Chain-KI, drei
koresidente VMs mit einer nativen Bridge, verpflichtende Post-Quanten-Kryptografie,
eine einzige 20-Byte-Identität über alle drei VM-Lanes hinweg und PQC-sicheres
delegiertes Spending für externe Wallet-Schlüssel. Das sind die Gründe, hier zu bauen.

---

## 1. KI-Preflight-Risikobewertung

**Prüfen Sie eine Transaktion mit On-Chain-KI, bevor Sie sie broadcasten.**

QoreChain liefert KI-Risikoanalyse als EVM-Precompiles aus. Das SDK ruft sie für Sie
auf und liefert Gas plus ein Risiko-/Anomalie-Urteil in einem einzigen Aufruf — sodass
eine Wallet oder dApp *vor* dem Signieren warnen (oder blockieren) kann.

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

**Warum das einzigartig ist:** Die Bewertung läuft *innerhalb der Chain* als
deterministischer Precompile (`aiRiskScore` unter `0x…0B01`, `aiAnomalyCheck` unter
`0x…0B02`). Andere Netzwerke können nur externe, nicht-deterministische KI-Dienste
anflanschen. Dies ist das erste SDK, das eine Transaktion vor dem Signieren per KI
prüft — mit einem On-Chain-Ergebnis. Siehe [KI-Preflight](/sdk/guides/ai-preflight).

---

## 2. Vereinheitlichte Cross-VM-Aufrufe — ein Konto, drei VMs, eine Transaktion

**Rufen Sie einen Contract auf jeder beliebigen VM auf — und bündeln Sie Aufrufe über
alle drei VMs atomar.**

QoreChain betreibt CosmWasm-, EVM- und SVM-Contracts auf derselben Chain mit einer
nativen Cross-VM-Bridge. Das SDK stellt eine einzige Schnittstelle bereit, um jeden
davon aufzurufen — und um mehrere Cross-VM-Aufrufe in eine einzige, atomare
Transaktion zu packen, die nur einmal signiert wird.

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

**Warum das einzigartig ist:** QoreChain ist das einzige L1 mit drei koresidenten VMs
und einem nativen Bridge-Modul (`crossvm` + der Precompile `CrossVMBridge`).
Single-VM-Chains können „ein Konto, drei VMs, eine atomare Transaktion" nicht
ausdrücken — ihre SDKs haben nichts, das sie kapseln könnten. Einmal schreiben, jede
VM aufrufen. Siehe [Cross-VM-Aufrufe](/sdk/guides/cross-vm).

---

## 3. Quantensicher als Standard

**Machen Sie einen Signer mit einem einzigen Aufruf post-quanten-geschützt.**

QoreChain erzwingt hybride Post-Quanten-Signaturen (ML-DSA-87 + klassisch) auf
Protokollebene. Das SDK macht deren Einführung zum Einzeiler: prüfen, registrieren
und auf hybrides Signieren migrieren — mit einem React-Badge, das Nutzern zeigt, dass
sie geschützt sind.

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

**Warum das einzigartig ist:** Post-Quanten-Kryptografie ist auf QoreChain nativ und
verpflichtend, kein Experiment. Dies ist das erste SDK, in dem „quantensicher als
Standard" ein einziger Aufruf plus ein Drop-in-Badge ist. Siehe
[Quantensicherheit](/sdk/guides/quantum-safe).

---

## 4. Vereinheitlichte eth-native Konten — ein Schlüssel, drei Adressen, ein Guthaben

**Ein `eth_secp256k1`-Schlüssel ist eine einzige 20-Byte-Identität auf allen drei
Lanes.** (SDK 0.6.0, Chain v3.1.83.)

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key spends on every lane (signHybridEth on the Native path).
```

**Warum das einzigartig ist:** Bei Multi-VM-Setups anderswo hat jede Runtime ihren
eigenen Kontenraum, und Gelder bleiben pro Lane gestrandet. QoreChain stellt eine
einzige 20-Byte-Identität auf drei Arten dar — mit einem gemeinsamen Guthaben. Eine
Wallet „hat nie Guthaben auf einer Lane, aber nicht auf einer anderen".
`connectPhantomUnified` bootstrapt diese Identität sogar non-custodial aus einer
Phantom-Signatur. Siehe
[Vereinheitlichte Konten](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Authenticator-Lanes — delegiertes Spending, ohne PQC aufzugeben

**Ein verknüpfter Phantom- oder MetaMask-Schlüssel gibt Mittel vom kanonischen,
PQC-pflichtigen Konto aus — innerhalb von Limits, über einen Relayer.** (SDK 0.7.0,
Chain v3.1.85.)

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

**Warum das einzigartig ist:** Jede Ausgabe wird durch eine
On-Chain-Berechtigungstaxonomie, `SpendingRule`-Limits und ein Ablaufdatum begrenzt —
Least Privilege und widerrufbar — während das Konto selbst post-quanten-geschützt
bleibt. Siehe
[Authenticators & delegiertes Spending](/sdk/guides/authenticators).

---

## Und alles andere auch

Über die fünf Alleinstellungsmerkmale hinaus deckt das SDK die gesamte
Chain-Oberfläche in **TypeScript, Python, Go, Rust und Java** ab: typisierte Composer
für jedes Modul (einschließlich Sidechains/Paychains über `multilayer` und Rollups
über `rdk`), typisierte Abfragen, den Transaktionslebenszyklus, Subscriptions,
Browser-Wallets und das Hooks-Kit
[`@qorechain/react`](/sdk/guides/react).

Bereit zu bauen? Starten Sie mit dem [Quickstart](/sdk/quickstart).
