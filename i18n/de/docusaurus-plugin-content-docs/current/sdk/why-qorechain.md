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

Doch drei Fähigkeiten sind **nur auf QoreChain möglich**, weil sie auf
Protokollfunktionen aufbauen, die kein anderes Layer 1 besitzt: On-Chain-KI, drei koresidente VMs
mit einer nativen Bridge und verpflichtende Post-Quanten-Kryptografie. Das sind die
Gründe, hier zu bauen.

---

## 1. KI-Pre-Flight-Risikobewertung

**Scannen Sie eine Transaktion mit On-Chain-KI, bevor Sie sie senden.**

QoreChain liefert KI-Risikoanalyse als EVM-Precompiles aus. Das SDK ruft sie für Sie auf
und gibt Gas sowie ein Risiko-/Anomalie-Urteil in einem einzigen Aufruf zurück — sodass ein Wallet oder
eine dApp warnen (oder blockieren) kann, *bevor* signiert wird.

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

**Warum es einzigartig ist:** Die Bewertung läuft *innerhalb der Chain* als deterministisches
Precompile (`aiRiskScore` bei `0x…0B01`, `aiAnomalyCheck` bei `0x…0B02`). Andere
Netzwerke können nur Off-Chain-, nicht-deterministische KI-Dienste anflanschen. Dies ist das
erste SDK, das eine Transaktion per KI prüft, bevor sie signiert wird, mit einem On-Chain-Ergebnis.
Siehe [KI-Pre-Flight](/sdk/guides/ai-preflight).

---

## 2. Vereinheitlichte Cross-VM-Aufrufe — ein Konto, drei VMs, eine Transaktion

**Rufen Sie einen Contract auf einer beliebigen VM auf und bündeln Sie Aufrufe über alle drei hinweg atomar.**

QoreChain betreibt CosmWasm-, EVM- und SVM-Contracts auf derselben Chain mit einer nativen
Cross-VM-Bridge. Das SDK stellt eine einzige Schnittstelle bereit, um jeden von ihnen aufzurufen — und um
mehrere Cross-VM-Aufrufe in eine einzige, atomare Transaktion zu packen, die einmal signiert wird.

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

**Warum es einzigartig ist:** QoreChain ist das einzige L1 mit drei koresidenten VMs und einem
nativen Bridge-Modul (`crossvm` + dem `CrossVMBridge`-Precompile). Single-VM-Chains
können „ein Konto, drei VMs, eine atomare Transaktion" nicht ausdrücken — ihre
SDKs haben nichts zu kapseln. Einmal schreiben, jede VM aufrufen. Siehe
[Cross-VM-Aufrufe](/sdk/guides/cross-vm).

---

## 3. Quantensicher standardmäßig

**Machen Sie einen Signer in einem Aufruf post-quanten-geschützt.**

QoreChain erzwingt hybride Post-Quanten-Signaturen (ML-DSA-87 + klassisch) auf
Protokollebene. Das SDK macht ihre Einführung zu einer Einzeiler: Prüfen, registrieren und
zu hybrider Signierung migrieren — mit einem React-Badge, das Nutzern zeigt, dass sie geschützt sind.

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

**Warum es einzigartig ist:** Post-Quanten-Kryptografie ist auf QoreChain nativ und verpflichtend,
kein Experiment. Dies ist das erste SDK, bei dem „quantensicher standardmäßig" ein einziger
Aufruf plus ein Drop-in-Badge ist. Siehe
[Quantensicher](/sdk/guides/quantum-safe).

---

## Alles andere auch

Über die drei Alleinstellungsmerkmale hinaus deckt das SDK die gesamte Chain-Oberfläche über
**TypeScript, Python, Go, Rust und Java** ab: typisierte Composer für jedes Modul
(einschließlich Sidechains/Paychains via `multilayer` und Rollups via `rdk`), typisierte
Abfragen, den Tx-Lebenszyklus, Subscriptions, Browser-Wallets und das
[`@qorechain/react`](/sdk/guides/react)-Hooks-Kit.

Bereit zu bauen? Beginnen Sie mit dem [Schnellstart](/sdk/quickstart).
