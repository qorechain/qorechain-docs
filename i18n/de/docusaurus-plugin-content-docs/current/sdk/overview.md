---
slug: /sdk/overview
title: QoreChain SDK – Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# QoreChain SDK

Das QoreChain SDK ist das offizielle, mehrsprachige Entwickler-Kit zum Erstellen
dezentraler Anwendungen auf **QoreChain** – einem quantensicheren Triple-VM-Layer-1-
Netzwerk.

Diese Dokumentation behandelt die Installation des SDK, die Verbindung zum Netzwerk,
das Auslesen des On-Chain-Zustands, das Ableiten von Konten, das Signieren und Senden
von Transaktionen sowie die Arbeit mit jeder der virtuellen Maschinen von QoreChain.

## Was ist QoreChain?

QoreChain ist eine Layer-1-Blockchain mit drei vollwertigen Smart-Contract-
Laufzeitumgebungen auf einer einzigen Chain:

- **CosmWasm** – Wasm-Smart-Contracts über das Cosmos SDK.
- **QoreChain EVM Engine** – Ethereum-kompatible Ausführung (Solidity, viem,
  standardmäßiges JSON-RPC).
- **SVM** – eine Solana-kompatible Laufzeitumgebung mit einem JSON-RPC im Solana-Stil.

Konten, Guthaben und Token werden von allen Laufzeitumgebungen gemeinsam genutzt, und
die Chain unterstützt IBC für die chainübergreifende Interoperabilität.

### Quantensicher von Grund auf

QoreChain bietet Post-Quanten-Kryptografie-Primitive (PQC) auf Basis von
**ML-DSA-87** (Dilithium-5, FIPS 204). Neben der klassischen secp256k1-Signierung
unterstützt die Chain eine **hybride** Signaturhaltung, bei der eine Transaktion
*sowohl* eine klassische Signatur *als auch* eine Post-Quanten-Signatur trägt, sodass
sie heute unter klassischer Verifizierung gültig bleibt und gleichzeitig
Post-Quanten-Schutz erhält.

Das SDK stellt heute schon ML-DSA-87-Schlüsselerzeugung, -Signierung und
-Verifizierung sowie die Bausteine für hybride Transaktionen bereit. Siehe
[Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) für Details. Keine
Marketing-Versprechen hier – das SDK stellt genau die Primitive bereit, die die Chain
implementiert.

## Was dieses SDK besonders macht

Über die vollständige Multi-Chain-Parität hinaus sind drei Fähigkeiten **nur auf
QoreChain möglich**, weil sie auf Protokollfunktionen aufbauen, die keine andere
Layer-1 besitzt:

- **KI-Pre-Flight-Risikobewertung** – scannen Sie eine Transaktion mit On-Chain-KI,
  bevor Sie sie übertragen. `simulateWithRiskScore` liefert Gas plus ein
  Risiko-/Anomalie-Urteil von deterministischen EVM-Precompiles, sodass eine Wallet
  oder dApp *vor* dem Signieren warnen (oder blockieren) kann. Siehe
  [KI-Pre-Flight](/sdk/guides/ai-preflight).
- **Einheitliche VM-übergreifende Aufrufe** – ein Konto, drei VMs, eine Transaktion.
  `createCrossVMClient` ruft einen Contract auf einer beliebigen VM auf, und
  `callAtomic` bündelt mehrere VM-übergreifende Aufrufe in einer einzigen atomaren,
  einmal signierten Transaktion. Siehe [VM-übergreifende Aufrufe](/sdk/guides/cross-vm).
- **Quantensichere DX** – machen Sie einen Signierer in einem einzigen idempotenten
  Aufruf post-quanten-geschützt (`ensurePqcRegistered` / `migrateToHybrid`), mit einem
  einsatzfertigen React-Badge. Siehe [Quantensicher](/sdk/guides/quantum-safe).

Ein neues **`@qorechain/react`**-Kit (Provider, Hooks, `ConnectButton`,
`QuantumSafeBadge`) macht das Erstellen einer quantensicheren dApp zum Standardweg –
siehe das [React-Kit-Handbuch](/sdk/guides/react). Für die vollständige Begründung lesen
Sie [Warum QoreChain SDK](/sdk/why).

## Die SDK-Familie

Das SDK wird als Familie von Paketen ausgeliefert, sodass Sie in der Sprache Ihrer
Wahl entwickeln können. Sie teilen sich dieselben Netzwerk-Voreinstellungen,
Ableitungsschemata, Denominations-Rechenlogik und Leseflächen.

| Paket | Sprache | Installation | Status |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Veröffentlicht (npm, v0.5.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (Import `qorsdk`) | Veröffentlicht (PyPI, v0.5.0) |
| `qorechain-sdk` (Go-Modul) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Veröffentlicht (Go-Proxy, v0.5.0) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | Veröffentlicht (crates.io, v0.5.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | Veröffentlicht (Maven Central, v0.5.0) |
| `@qorechain/evm` | TypeScript (EVM-Adapter) | `npm i @qorechain/evm viem` | Veröffentlicht (npm, v0.5.0) |
| `@qorechain/svm` | TypeScript (SVM-Adapter) | `npm i @qorechain/svm @solana/web3.js` | Veröffentlicht (npm, v0.5.0) |
| `@qorechain/react` | TypeScript (React-Kit) | `npm i @qorechain/react` | Veröffentlicht (npm, v0.5.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Veröffentlicht (npm, v0.5.0) |

> Die Python-Distribution wird als `qorechain-sdk` installiert, **importiert aber als
> `qorsdk`**. Alle Clients sind in ihren jeweiligen Registries veröffentlicht – siehe
> [Installation](/sdk/install) für die sprachspezifischen Befehle.

Der TypeScript-Kern (`@qorechain/sdk`) ist die Grundlage für die Beispiele in dieser
Dokumentation. Die Python-, Go-, Rust- und Java-Clients erreichen **vollständige
nativ-chain-Parität** mit TypeScript: Netzwerk-Voreinstellungen, Denom-/Adress-
Hilfsfunktionen, HD-Kontenableitung (nativ/EVM/SVM), PQC-Signierung (ML-DSA-87),
typisierte Nachrichten-Composer für jedes benutzerdefinierte Modul plus die
standardmäßigen Cosmos-Module, typisierte Query-Clients, den vollständigen
Transaktionslebenszyklus (Auto-Gas, Fehlerdekodierung, Tx-Tracking,
Block-/Tx-Suche), hybride Post-Quanten-Transaktionen sowie WebSocket-
Subscriptions. Alle diese Clients sind **veröffentlicht**: TypeScript auf npm
(`@qorechain/sdk` 0.5.0), Python auf PyPI (`qorechain-sdk` 0.5.0, Import
`qorsdk`), Go auf den Modul-Proxy (`.../packages/go` 0.5.0), Rust auf
crates.io (`qorechain-sdk` 0.5.0) und Java auf Maven Central
(`io.github.qorechain:qorechain-sdk` 0.5.0). Die EVM-/SVM-Ausführungsadapter
(`@qorechain/evm`, `@qorechain/svm`, beide 0.5.0), das `@qorechain/react`-Kit
(0.5.0) und die `create-qorechain-dapp`-Scaffolding-CLI sind nur in TypeScript
verfügbar und ebenfalls auf npm veröffentlicht.

Das Release v0.4 fügte Rollup-Auszahlungen (`MsgExecuteWithdrawal`, den L2→L1-
Exit-Pfad), typisierte Query-Clients für die Module `multilayer`, `rdk` und `bridge`,
Bridge-Admin-Nachrichten sowie High-Level-Sidechain-/Paychain- und Rollup-Helfer
über alle fünf Sprachen hinweg hinzu.

## Wie es weitergeht

- [Warum QoreChain SDK](/sdk/why) – die drei für QoreChain einzigartigen Fähigkeiten.
- [Installation](/sdk/install) – sprachspezifische Installationsanweisungen.
- [Quickstart](/sdk/quickstart) – verbinden, ein Guthaben lesen, einen Transfer senden.
- [Konzepte: Architektur](/sdk/concepts/architecture) – das Triple-VM-Modell.
- [Konzepte: Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) – Schlüssel und
  Post-Quanten-Signierung.
- [Handbücher](/sdk/guides/evm) – Anleitungen pro VM.
- [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network) – Chain-ID, Ports, Token.
- [Beispiele](/sdk/examples) – ausführbare, kopierfertige Snippets.
- [Netzwerk- & Endpunkt-Referenz](/sdk/reference/network) wird auch unter [Netzwerke](/appendix/networks) bereitgestellt.
