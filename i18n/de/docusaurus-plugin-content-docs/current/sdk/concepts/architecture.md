---
slug: /sdk/concepts/architecture
title: Architektur & Konzepte
sidebar_label: Architektur
sidebar_position: 1
---

# Architektur & Konzepte

QoreChain ist eine einzelne Layer-1-Chain, die drei Smart-Contract-Virtual-
Machines nebeneinander betreibt, mit gemeinsamen Konten und einem gemeinsamen
Token.

## Das Triple-VM-Modell

| VM | Verträge | Client-Oberfläche im SDK |
| --- | --- | --- |
| **CosmWasm** | Rust/Wasm-Verträge | `client.cosmwasm()` und die Helfer `queryContractSmart` / `execute` in `@qorechain/sdk` |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (ein viem-Adapter) |
| **SVM** | Solana-Programme | `@qorechain/svm` (ein `@solana/web3.js`-Adapter) |

Der native (Cosmos-)Layer übernimmt Bank-Transfers, Staking, Governance und das
`x/crossvm`-Modul, das Nachrichten zwischen den Laufzeiten routet.

## Lese-Oberflächen

Das SDK spricht über mehrere Endpunkte mit einem Node:

- **Cosmos REST (LCD)** — Bank-Guthaben, Konto-Informationen, Modul-Abfragen.
- **Consensus RPC** — für das Signieren/Broadcasten nativer Transaktionen und
  für den CosmWasm-Lese-Client.
- **EVM JSON-RPC** — standardmäßige `eth_*`-Aufrufe plus der QoreChain-`qor_*`-
  Namespace und die EVM-Precompiles.
- **SVM JSON-RPC** — Solana-kompatibles RPC für die SVM-Laufzeit.

Der `qor_*`-JSON-RPC-Namespace macht QoreChain-spezifische Lesevorgänge
zugänglich, etwa Tokenomics, PQC-Schlüsselstatus, Hybrid-Signatur-Modus,
VM-übergreifende Nachrichten und Netzwerkstatistiken. In TypeScript sind dies
typisierte Methoden auf `client.qor` (`QorClient`); dieselbe Oberfläche existiert
in den Python-, Go- und Rust-SDKs.

## Token & Denominationen

- Anzeige-Token: **QOR**.
- Basis-Denomination: **uqor**, mit **10^6** Basiseinheiten pro QOR.

Rechne mit Geld immer in Basiseinheiten. Das SDK bietet exakte Umrechnungen,
sodass du nie Präzision an Fließkomma verlierst:

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> Hinweis: Die EVM-Laufzeit stellt QOR mit 18 Dezimalstellen dar (die
> EVM-Konvention), was sich von der Cosmos-`uqor`-Basis von 10^6 unterscheidet.
> Der `@qorechain/evm`-Client verwendet für die Anzeige standardmäßig 18
> Dezimalstellen. Bestätige den Wert für dein Zielnetzwerk.

## Adressen

Dasselbe Schlüsselmaterial kann in drei Adressformaten ausgedrückt werden:

- **native** — bech32 mit dem Präfix `qor` (`qor1…`), Validatoren verwenden
  `qorvaloper`.
- **EVM** — `0x…`, EIP-55-checksummed.
- **SVM** — base58 des ed25519-Public-Keys.

Siehe [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc) für die
Ableitungspfade.

## Cross-VM

Das `x/crossvm`-Modul von QoreChain erlaubt Verträgen auf einer VM, Aktionen auf
einer anderen auszulösen. Der EVM→native-Pfad läuft on-chain über das
**Cross-VM-Bridge-Precompile** (`@qorechain/evm`), und das SDK bietet typisierte
REST-Lese-Helfer (`getCrossVmMessage`, `getPendingCrossVmMessages`,
`getCrossVmParams`) plus `client.qor.getCrossVMMessage(...)`, um den
Nachrichtenstatus zu verfolgen. Siehe den
[Cross-VM-Leitfaden](/sdk/guides/cross-vm).
