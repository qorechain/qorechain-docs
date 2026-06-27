---
slug: /sdk/concepts/architecture
title: Architettura & Concetti
sidebar_label: Architettura
sidebar_position: 1
---

# Architettura & concetti

QoreChain è una singola chain Layer 1 che esegue tre virtual machine per smart contract
affiancate, con account condivisi e un token condiviso.

## Il modello triple-VM

| VM | Contratti | Superficie client nell'SDK |
| --- | --- | --- |
| **CosmWasm** | Contratti Rust/Wasm | `client.cosmwasm()` e gli helper `queryContractSmart` / `execute` in `@qorechain/sdk` |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (un adapter viem) |
| **SVM** | Programmi Solana | `@qorechain/svm` (un adapter `@solana/web3.js`) |

Il layer nativo (Cosmos) gestisce i bank transfer, lo staking, la governance e il
modulo `x/crossvm` che instrada i messaggi tra i runtime.

## Superfici di lettura

L'SDK comunica con un nodo attraverso diversi endpoint:

- **Cosmos REST (LCD)** — saldi bank, info account, query dei moduli.
- **Consensus RPC** — usato per firmare/trasmettere transazioni native e per
  il read client CosmWasm.
- **EVM JSON-RPC** — chiamate `eth_*` standard più il namespace QoreChain `qor_*`
  e i precompile EVM.
- **SVM JSON-RPC** — RPC compatibile con Solana per il runtime SVM.

Il namespace JSON-RPC `qor_*` espone letture specifiche di QoreChain come
tokenomics, stato delle chiavi PQC, modalità di firma ibrida, messaggi cross-VM e
statistiche di rete. In TypeScript questi sono metodi tipizzati su `client.qor`
(`QorClient`); la stessa superficie esiste negli SDK Python, Go e Rust.

## Token & denominazioni

- Token di visualizzazione: **QOR**.
- Denominazione base: **uqor**, con **10^6** unità base per QOR.

Esegui sempre i calcoli monetari in unità base. L'SDK fornisce conversioni esatte così non
perdi mai precisione a causa della virgola mobile:

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> Nota: il runtime EVM rappresenta QOR con 18 decimali (la convenzione EVM),
> che è distinta dalla base Cosmos `uqor` di 10^6. Il client `@qorechain/evm`
> usa per default 18 decimali per la visualizzazione. Verifica il valore per la tua
> rete di destinazione.

## Indirizzi

Lo stesso materiale di chiave può essere espresso in tre formati di indirizzo:

- **native** — bech32 con il prefisso `qor` (`qor1…`), i validator usano
  `qorvaloper`.
- **EVM** — `0x…`, con checksum EIP-55.
- **SVM** — base58 della chiave pubblica ed25519.

Vedi [Account & firma PQC](/sdk/concepts/accounts-pqc) per i percorsi di derivazione.

## Cross-VM

Il modulo `x/crossvm` di QoreChain permette ai contratti su una VM di attivare azioni su
un'altra. Il percorso EVM→native viene eseguito on-chain attraverso il **precompile del bridge
cross-VM** (`@qorechain/evm`), e l'SDK fornisce helper di lettura REST tipizzati
(`getCrossVmMessage`, `getPendingCrossVmMessages`, `getCrossVmParams`) più
`client.qor.getCrossVMMessage(...)` per tracciare lo stato dei messaggi. Vedi la
[guida cross-VM](/sdk/guides/cross-vm).
