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

**Prüfen Sie eine Transaktion mit On-Chain-KI, bevor Sie sie broadcasten** (setzt
voraus, dass die KI-Precompiles im Zielnetzwerk aktiv sind, was in den öffentlichen
Netzwerken noch nicht der Fall ist).

QoreChain liefert KI-Risikoanalyse als EVM-Precompiles aus. Das SDK ruft sie für Sie
auf und liefert Gas plus ein Risiko-/Anomalie-Urteil in einem einzigen Aufruf — sodass
eine Wallet oder dApp *vor* dem Signieren warnen (oder blockieren) kann. Die
KI-Precompiles sind auf Mainnet und Testnet **noch nicht aktiv** (siehe
[EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status)).

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

**Warum das anders ist:** Die Bewertung ist so konzipiert, dass sie *innerhalb der
Chain* als deterministischer Precompile läuft (`aiRiskScore` unter `0x…0B01`,
`aiAnomalyCheck` unter `0x…0B02`) und nicht als Off-Chain-Dienst. Solange diese
Precompiles nicht aktiviert sind, werfen die obigen Helfer in den öffentlichen
Netzwerken einen Fehler (`returned no data ("0x")`; die drei aktiven Precompiles des Testnets sind die für PQC und Konsens, nicht diese). Siehe
[KI-Preflight](/sdk/guides/ai-preflight).

---

## 2. Vereinheitlichte Cross-VM-Aufrufe — ein Konto, drei VMs, eine Transaktion

**Rufen Sie einen Contract auf jeder beliebigen VM auf — und bündeln Sie Aufrufe über
alle drei VMs atomar.**

QoreChain betreibt QoreChain Native-, EVM- und SVM-Contracts auf derselben Chain mit einer
nativen Cross-VM-Bridge. Das SDK stellt eine einzige Schnittstelle bereit, um jeden
davon aufzurufen — und um mehrere Cross-VM-Aufrufe in eine einzige, atomare
Transaktion zu packen, die nur einmal signiert wird.

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

**Warum das anders ist:** QoreChain betreibt drei koresidente VMs mit einem nativen
Bridge-Modul (`crossvm`, plus der Precompile `CrossVMBridge`, sobald er aktiv ist; er ist in keinem der beiden Netzwerke bisher aktiv),
sodass eine einzige SDK-Schnittstelle alle drei ansprechen kann. Single-VM-Chains
haben nichts Vergleichbares, das sich kapseln ließe. Heute wird die Reichweite eines
Aufrufs durch die Lane begrenzt, die er anspricht: `MsgCrossVMCall` ist auf Mainnet
abgeschaltet, SVM-Transaktionen sind deaktiviert, und QoreChain Native-Upload und
-Instanziierung sind erlaubnispflichtig (die Instanziierung ist im Testnet offen). Siehe
[Cross-VM-Aufrufe](/sdk/guides/cross-vm).

---

## 3. Hybrides Signieren als Standard

**Registrieren Sie den ML-DSA-87-Schlüssel eines Signers mit einem einzigen Aufruf.**

QoreChain erzwingt hybride Post-Quanten-Signaturen (ML-DSA-87 + klassisch) auf
Protokollebene. Das SDK macht deren Einführung zum Einzeiler: prüfen, registrieren
und auf hybrides Signieren migrieren — mit einem React-Badge, das anzeigt, ob eine Adresse einen registrierten Schlüssel hat.

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

// Shows a status badge when the address has a registered PQC key
// (read over REST, so it works on the public endpoints from `@qorechain/react` 0.9.0 and later).
<QuantumSafeBadge address={account.address} />
```

**Warum das wichtig ist:** Post-Quanten-Kryptografie ist auf dem nativen Pfad von
QoreChain nativ und verpflichtend, kein Experiment, und das SDK reduziert ihre
Einführung auf einen Registrierungsaufruf plus einen hybriden Sendepfad. Die
Registrierung ist explizit: Es gibt keine automatische Registrierung bei der ersten
Transaktion. Siehe [Hybrides Signieren](/sdk/guides/quantum-safe).

---

## 4. Vereinheitlichte eth-native Konten — ein Schlüssel, drei Adressen, ein Guthaben

**Ein `eth_secp256k1`-Schlüssel ist eine einzige 20-Byte-Identität auf allen drei
Lanes.** (SDK 0.6.0, Chain v3.1.83.) Die SVM-Transaktions-Lane ist derzeit
netzwerkweit deaktiviert, und die EVM-Lane benötigt ein
[Autorisierungsfenster](/sdk/guides/evm#evm-window); das gemeinsame Guthaben und die
Adresszuordnung gelten unabhängig davon.

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key signs on every enabled lane (signHybridEth on the Native path).
```

**Warum das einzigartig ist:** Bei Multi-VM-Setups anderswo hat jede Runtime ihren
eigenen Kontenraum, und Gelder bleiben pro Lane gestrandet. QoreChain stellt eine
einzige 20-Byte-Identität auf drei Arten dar — mit einem gemeinsamen Guthaben. Eine
Wallet „hat nie Guthaben auf einer Lane, aber nicht auf einer anderen".
Eine externe Wallet wie Phantom lässt sich als begrenzter Authenticator mit
dieser Identität verknüpfen ([Authenticators](/sdk/guides/authenticators)). Siehe
[Vereinheitlichte Konten](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Authenticator-Lanes — delegiertes Spending, ohne PQC aufzugeben

**Ein verknüpfter Phantom- oder MetaMask-Schlüssel gibt Mittel vom kanonischen,
PQC-pflichtigen Konto aus — innerhalb von Limits, über einen Relayer.** (SDK 0.7.0,
Chain v3.1.85.)

:::caution Im Mainnet noch nicht verfügbar
Das Modul `abstractaccount` ist auf `qorechain-vladi` abgeschaltet
(`GET /qorechain/abstractaccount/v1/config` liefert `"enabled": false`), und ab
Chain v3.2.0 wird dieses Flag auf jedem Pfad durchgesetzt, sodass sich im Mainnet
kein Schlüssel verknüpfen lässt und die folgenden Lanes nicht genutzt werden können.
Das Modul ist im Testnet `qorechain-diana` aktiviert (geprüft am 27. Oktober 2026). Siehe den
[Authenticators-Leitfaden](/sdk/guides/authenticators).
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

**Warum das wichtig ist:** Sobald das Modul aktiviert ist, wird jede Ausgabe durch
eine On-Chain-Berechtigungstaxonomie, `SpendingRule`-Limits und ein Ablaufdatum
begrenzt — Least Privilege und widerrufbar — während das Konto selbst
post-quanten-geschützt bleibt. Siehe
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
