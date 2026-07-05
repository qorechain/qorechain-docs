---
slug: /sdk/overview
title: QoreChain SDK – Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# QoreChain SDK

Das QoreChain SDK ist das offizielle, mehrsprachige Entwickler-Kit zum Erstellen
dezentraler Anwendungen auf **QoreChain** — einem quantensicheren
Layer-1-Netzwerk mit drei virtuellen Maschinen.

Diese Dokumentation beschreibt, wie Sie das SDK installieren, sich mit dem
Netzwerk verbinden, On-Chain-Zustand lesen, Konten ableiten, Transaktionen
signieren und senden und mit jeder der virtuellen Maschinen von QoreChain
arbeiten.

## Was ist QoreChain?

QoreChain ist eine Layer-1-Blockchain mit drei vollwertigen
Smart-Contract-Laufzeitumgebungen auf einer einzigen Chain:

- **CosmWasm** — Wasm-Smart-Contracts über das Cosmos SDK.
- **QoreChain EVM Engine** — Ethereum-kompatible Ausführung (Solidity, viem,
  Standard-JSON-RPC).
- **SVM** — eine Solana-kompatible Laufzeitumgebung mit einem JSON-RPC im
  Solana-Stil.

Konten, Guthaben und Token werden über die Laufzeitumgebungen hinweg geteilt,
und die Chain unterstützt IBC für Cross-Chain-Interoperabilität.

### Quantensicher von Grund auf

QoreChain stellt Post-Quanten-Kryptografie-Primitive (PQC) auf Basis von
**ML-DSA-87** (Dilithium-5, FIPS 204) bereit. Neben klassischem
secp256k1-Signieren unterstützt die Chain eine **hybride** Signatur-Strategie,
bei der eine Transaktion *sowohl* eine klassische Signatur als auch eine
Post-Quanten-Signatur trägt — sie bleibt damit heute unter klassischer
Verifikation gültig und erhält zugleich Post-Quanten-Schutz.

Das SDK stellt bereits heute ML-DSA-87-Schlüsselerzeugung, -Signierung und
-Verifikation bereit, dazu die Bausteine für hybride Transaktionen. Details
finden Sie unter [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc). Keine
Marketing-Versprechen — das SDK stellt exakt die Primitive bereit, die die
Chain implementiert.

## Was dieses SDK besonders macht

Über die vollständige Multi-Chain-Parität hinaus sind drei Fähigkeiten **nur
auf QoreChain möglich**, weil sie auf Protokollfunktionen aufbauen, die keine
andere Layer 1 besitzt:

- **KI-Preflight-Risikobewertung** — prüfen Sie eine Transaktion mit
  On-Chain-KI, bevor Sie sie broadcasten. `simulateWithRiskScore` liefert Gas
  plus ein Risiko-/Anomalie-Urteil aus deterministischen EVM-Precompiles,
  sodass eine Wallet oder dApp *vor* dem Signieren warnen (oder blockieren)
  kann. Siehe [KI-Preflight](/sdk/guides/ai-preflight).
- **Vereinheitlichte Cross-VM-Aufrufe** — ein Konto, drei VMs, eine
  Transaktion. `createCrossVMClient` ruft einen Contract auf jeder beliebigen
  VM auf, und `callAtomic` bündelt mehrere Cross-VM-Aufrufe in einer einzigen,
  einmal signierten atomaren Transaktion. Siehe
  [Cross-VM-Aufrufe](/sdk/guides/cross-vm).
- **Quantensichere DX** — machen Sie einen Signer mit einem einzigen
  idempotenten Aufruf post-quanten-geschützt (`ensurePqcRegistered` /
  `migrateToHybrid`), inklusive eines Drop-in-React-Badges. Siehe
  [Quantensicher](/sdk/guides/quantum-safe).

Zwei weitere Fähigkeiten auf Chain-Ebene kamen mit 0.6.0 und 0.7.0 hinzu:

- **Vereinheitlichte eth-native Konten** — ein `eth_secp256k1`-Schlüssel ist
  eine 20-Byte-Identität, dargestellt als `qor1…`, `0x…` und eine
  SVM-Base58-Adresse, die alle ein gemeinsames Guthaben teilen. Siehe
  [Vereinheitlichte Konten](/sdk/concepts/accounts-pqc#unified-accounts).
- **Authenticator-Lanes** — verknüpfen Sie einen Phantom- oder
  MetaMask-Schlüssel mit dem kanonischen PQC-pflichtigen Konto und lassen Sie
  ihn über einen Relayer ausgeben — nach dem Least-Privilege-Prinzip, mit
  Ausgabenlimits und jederzeit widerrufbar. Siehe
  [Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators).

Ein neues **`@qorechain/react`**-Kit (Provider, Hooks, `ConnectButton`,
`QuantumSafeBadge`) macht den Bau einer quantensicheren dApp zum Standardweg —
siehe den [React-Kit-Guide](/sdk/guides/react). Die vollständige Argumentation
finden Sie unter [Warum QoreChain SDK](/sdk/why).

## Die SDK-Familie

Das SDK erscheint als Paketfamilie, sodass Sie in der Sprache Ihrer Wahl
entwickeln können. Alle Pakete teilen dieselben Netzwerk-Presets,
Ableitungsschemata, Denominations-Arithmetik und Lese-Schnittstellen.

| Paket | Sprache | Installation | Status |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Veröffentlicht (npm, v0.7.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (Import `qorsdk`) | Veröffentlicht (PyPI, v0.7.0) |
| `qorechain-sdk` (Go-Modul) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Veröffentlicht (Go-Proxy, Tag `packages/go/v0.7.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (Import `qorechain`) | Veröffentlicht (crates.io, letzte veröffentlichte Version; 0.7.0 aus dem Repo) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.7.0` | Veröffentlicht (Maven Central, v0.7.0) |
| `@qorechain/evm` | TypeScript (EVM-Adapter) | `npm i @qorechain/evm viem` | Veröffentlicht (npm, v0.7.0) |
| `@qorechain/svm` | TypeScript (SVM-Adapter) | `npm i @qorechain/svm @solana/web3.js` | Veröffentlicht (npm, v0.7.0) |
| `@qorechain/react` | TypeScript (React-Kit) | `npm i @qorechain/react` | Veröffentlicht (npm, v0.7.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Veröffentlicht (npm, v0.7.0) |

> Die Python-Distribution wird als `qorechain-sdk` installiert, aber **als
> `qorsdk` importiert**. Alle Clients sind in ihren Registries veröffentlicht —
> die Befehle pro Sprache finden Sie unter [Installation](/sdk/install).

Der TypeScript-Kern (`@qorechain/sdk`) ist die Grundlage für die Beispiele in
dieser Dokumentation. Die Python-, Go-, Rust- und Java-Clients erreichen
**vollständige Native-Chain-Parität** mit TypeScript: Netzwerk-Presets,
Denom-/Adress-Utilities, HD-Kontoableitung (Native/EVM/SVM), PQC-Signierung
(ML-DSA-87), typisierte Message-Composer für jedes Custom-Modul sowie die
Standard-Cosmos-Module, typisierte Query-Clients, den kompletten
Transaktionslebenszyklus (Auto-Gas, Fehlerdecodierung, Tx-Tracking,
Block-/Tx-Suche), hybride Post-Quanten-Transaktionen und
WebSocket-Subscriptions. Alle diese Clients sind **veröffentlicht**: TypeScript
auf npm (`@qorechain/sdk` 0.7.0), Python auf PyPI (`qorechain-sdk` 0.7.0,
Import `qorsdk`), Go auf dem Modul-Proxy (Tag `packages/go/v0.7.0`), Rust auf
crates.io (`qorechain-sdk`, letzte veröffentlichte Version — die
Veröffentlichung des 0.7.0-Crates steht noch aus, installieren Sie daher von
crates.io oder aus dem Repo) und Java auf Maven Central
(`io.github.qorechain:qorechain-sdk` 0.7.0). Die
EVM-/SVM-Ausführungsadapter (`@qorechain/evm`, `@qorechain/svm`, beide 0.7.0),
das `@qorechain/react`-Kit (0.7.0) und die
`create-qorechain-dapp`-Scaffolding-CLI (0.7.0) sind reine TypeScript-Pakete
und ebenfalls auf npm veröffentlicht.

## Neu in 0.6 und 0.7

**0.6.0 — vereinheitlichte eth-native Konten (Chain v3.1.83).** Ein
`eth_secp256k1`-Schlüssel ist eine 20-Byte-Identität, dargestellt in allen drei
Adresskodierungen, mit einem gemeinsamen ausgabefähigen Guthaben auf jeder
Lane:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

Native-Lane-Signierung mit demselben Schlüssel erfolgt über `signClassicalEth`
/ `signHybridEth`, und `connectPhantomUnified` leitet ein nicht-verwahrtes
vereinheitlichtes Konto aus einer deterministischen Phantom-Signatur ab. Das
Legacy-`deriveNativeAccount` mit Coin-Type 118 bleibt unverändert. Siehe
[Vereinheitlichte Konten](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — konsenskritischer Fix.** Die `PQCHybridSignature`-Tx-Body-Extension
wird jetzt protobuf-kodiert (zuvor war sie JSON-kodiert und wurde bei CheckTx
abgelehnt). Hybride Transaktionen, die mit SDK ≤ 0.6.0 gebaut wurden, werden
**on-chain abgelehnt** — bitte upgraden.

**0.7.0 — Authenticator-Lanes (Chain v3.1.85).** Ein verknüpfter Phantom-
(ed25519) oder MetaMask-Schlüssel (secp256k1, über die 20-Byte-Adresse) kann
über einen Relayer vom kanonischen PQC-pflichtigen Konto ausgeben — nach dem
Least-Privilege-Prinzip, mit Ausgabenlimits und widerrufbar: Composer für
`MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`, byte-exakte Helfer
`evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes`, die
`permissionSchema`-Query, decodierte Fehlercodes und TypeScript-Wallet-Builder
(`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …). Vollständiger
Walkthrough mit kopierbaren Beispielen:
[Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators).

## Nächste Schritte

- [Warum QoreChain SDK](/sdk/why) — die fünf Fähigkeiten, die es nur auf
  QoreChain gibt.
- [Installation](/sdk/install) — Installationsanleitungen pro Sprache.
- [Quickstart](/sdk/quickstart) — verbinden, ein Guthaben lesen, einen Transfer
  senden.
- [Konzepte: Architektur](/sdk/concepts/architecture) — das Triple-VM-Modell.
- [Konzepte: Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) — Schlüssel
  und Post-Quanten-Signierung.
- [Guides](/sdk/guides/evm) — How-tos pro VM.
- [Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators) —
  verknüpfte Phantom-/MetaMask-Schlüssel, die über einen Relayer ausgeben.
- [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network) — Chain-ID, Ports,
  Token.
- [Beispiele](/sdk/examples) — lauffähige, kopierbare Snippets.
- Die [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network) ist außerdem
  unter [Netzwerke](/appendix/networks) verlinkt.
