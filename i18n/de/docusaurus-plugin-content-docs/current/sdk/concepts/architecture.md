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
- **EVM JSON-RPC** — standardmäßige `eth_*`-, `net_*`-, `web3_*`- und
  `txpool_*`-Aufrufe auf den öffentlichen Endpunkten. Der QoreChain-`qor_*`-
  Namespace und die EVM-Precompiles sind dort noch nicht verfügbar (siehe unten).
- **SVM JSON-RPC** — Solana-kompatibles RPC für die SVM-Laufzeit (auf den
  öffentlichen Endpunkten nur lesend; das Einreichen von SVM-Transaktionen ist
  netzwerkweit deaktiviert).

Auf Nodes, die ihn aktivieren, macht der `qor_*`-JSON-RPC-Namespace
QoreChain-spezifische Lesevorgänge zugänglich, etwa Tokenomics,
PQC-Schlüsselstatus, Hybrid-Signatur-Modus, VM-übergreifende Nachrichten und
Netzwerkstatistiken. In TypeScript sind dies typisierte Methoden auf
`client.qor` (`QorClient`); dieselbe Oberfläche existiert in den Python-, Go- und
Rust-SDKs. Verwende gegen die öffentlichen Endpunkte stattdessen die REST-Routen
(zum Beispiel `GET /qorechain/pqc/v1/account/{address}` für den
PQC-Schlüsselstatus und `GET /qorechain/burn/v1/stats` für Burn-Statistiken).

> **Noch nicht bereitgestellt:** Kein veröffentlichter Node-Build stellt den JSON-RPC-Namespace `qor_` bereit, daher liefert heute jeder `qor_*`-Aufruf auf jedem öffentlichen Endpunkt `-32601` (Methode nicht gefunden). Siehe [den `qor_`-Namespace](/api-reference/json-rpc-qor_-namespace).

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
**Cross-VM-Bridge-Precompile** (`@qorechain/evm`; auf den öffentlichen Netzwerken noch nicht aktiv), und das SDK bietet typisierte
REST-Lese-Helfer (`getCrossVmMessage`, `getPendingCrossVmMessages`,
`getCrossVmParams`) plus `client.qor.getCrossVmMessage(...)`, um den
Nachrichtenstatus zu verfolgen. Auf den öffentlichen Endpunkten werden die
REST-Helfer und `client.qor` nicht bereitgestellt; lies Nachrichten mit
`connectQueryClients(rpc).crossvm`. Siehe den
[Cross-VM-Leitfaden](/sdk/guides/cross-vm).
