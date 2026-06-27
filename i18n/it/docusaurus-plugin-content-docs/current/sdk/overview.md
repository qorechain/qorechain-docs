---
slug: /sdk/overview
title: Panoramica dell'SDK QoreChain
sidebar_label: Panoramica
sidebar_position: 1
---

# SDK QoreChain

L'SDK QoreChain è il kit ufficiale multilinguaggio per sviluppatori, pensato per
creare applicazioni decentralizzate su **QoreChain** — una rete Layer 1
quantum-safe con triplo VM.

Questa documentazione spiega come installare l'SDK, connettersi alla rete, leggere
lo stato on-chain, derivare account, firmare e inviare transazioni e lavorare con
ciascuna delle macchine virtuali di QoreChain.

## Cos'è QoreChain?

QoreChain è una blockchain Layer 1 con tre runtime di smart contract di prima
classe su un'unica chain:

- **CosmWasm** — smart contract Wasm tramite il Cosmos SDK.
- **QoreChain EVM Engine** — esecuzione compatibile con Ethereum (Solidity, viem,
  JSON-RPC standard).
- **SVM** — un runtime compatibile con Solana con un JSON-RPC in stile Solana.

Account, saldi e token sono condivisi tra i runtime, e la chain supporta IBC per
l'interoperabilità cross-chain.

### Quantum-safe per progettazione

QoreChain offre primitive di crittografia post-quantistica (PQC) basate su
**ML-DSA-87** (Dilithium-5, FIPS 204). Oltre alla firma classica secp256k1,
la chain supporta una postura di firma **ibrida** in cui una transazione porta
*sia* una firma classica *sia* una firma post-quantistica, così da rimanere valida
oggi sotto verifica classica acquisendo al contempo protezione post-quantistica.

L'SDK espone oggi la generazione di chiavi, la firma e la verifica ML-DSA-87, oltre
agli elementi costitutivi per le transazioni ibride. Vedi
[Account e firma PQC](/sdk/concepts/accounts-pqc) per i dettagli. Nessuna
dichiarazione di marketing qui — l'SDK espone esattamente le primitive che la chain
implementa.

## Cosa rende diverso questo SDK

Oltre alla piena parità multi-chain, tre funzionalità sono **possibili solo su
QoreChain**, perché sono costruite su caratteristiche di protocollo che nessun altro
Layer 1 possiede:

- **Punteggio di rischio AI pre-flight** — analizza una transazione con l'AI on-chain
  prima di trasmetterla. `simulateWithRiskScore` restituisce il gas più un verdetto
  di rischio/anomalia dai precompile deterministici dell'EVM, così un wallet o una
  dApp può avvisare (o bloccare) *prima* della firma. Vedi [AI pre-flight](/sdk/guides/ai-preflight).
- **Chiamate cross-VM unificate** — un account, tre VM, una transazione.
  `createCrossVMClient` chiama un contratto su qualsiasi VM e `callAtomic` impacchetta
  diverse chiamate cross-VM in un'unica transazione atomica firmata una sola volta. Vedi
  [Chiamate cross-VM](/sdk/guides/cross-vm).
- **DX quantum-safe** — rendi un signer protetto post-quantistico con un'unica
  chiamata idempotente (`ensurePqcRegistered` / `migrateToHybrid`), con un badge React
  pronto all'uso. Vedi [Quantum-safe](/sdk/guides/quantum-safe).

Un nuovo kit **`@qorechain/react`** (provider, hook, `ConnectButton`,
`QuantumSafeBadge`) rende la creazione di una dApp quantum-safe il percorso
predefinito — vedi la [guida al kit React](/sdk/guides/react). Per il quadro completo,
leggi [Perché l'SDK QoreChain](/sdk/why).

## La famiglia di SDK

L'SDK viene distribuito come una famiglia di pacchetti così da poter sviluppare nel
linguaggio che preferisci. Condividono gli stessi preset di rete, schemi di
derivazione, calcoli sulle denominazioni e superfici di lettura.

| Pacchetto | Linguaggio | Installazione | Stato |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Pubblicato (npm, v0.5.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (importa `qorsdk`) | Pubblicato (PyPI, v0.5.0) |
| `qorechain-sdk` (modulo Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Pubblicato (Go proxy, v0.5.0) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | Pubblicato (crates.io, v0.5.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | Pubblicato (Maven Central, v0.5.0) |
| `@qorechain/evm` | TypeScript (adapter EVM) | `npm i @qorechain/evm viem` | Pubblicato (npm, v0.5.0) |
| `@qorechain/svm` | TypeScript (adapter SVM) | `npm i @qorechain/svm @solana/web3.js` | Pubblicato (npm, v0.5.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Pubblicato (npm, v0.5.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Pubblicato (npm, v0.5.0) |

> La distribuzione Python si installa come `qorechain-sdk` ma **si importa come
> `qorsdk`**. Tutti i client sono pubblicati nei rispettivi registry — vedi
> [Installazione](/sdk/install) per i comandi specifici di ogni linguaggio.

Il core TypeScript (`@qorechain/sdk`) è la base degli esempi in questa
documentazione. I client Python, Go, Rust e Java raggiungono la **piena parità
native-chain** con TypeScript: preset di rete, utilità denom/indirizzi, derivazione
HD degli account (native/EVM/SVM), firma PQC (ML-DSA-87), compositori di messaggi
tipizzati per ogni modulo personalizzato oltre ai moduli Cosmos standard, client di
query tipizzati, l'intero ciclo di vita delle transazioni (auto-gas, decodifica degli
errori, tracciamento tx, ricerca block/tx), transazioni ibride post-quantistiche e
sottoscrizioni WebSocket. Tutti questi client sono **pubblicati**: TypeScript su npm
(`@qorechain/sdk` 0.5.0), Python su PyPI (`qorechain-sdk` 0.5.0, importa
`qorsdk`), Go sul module proxy (`.../packages/go` 0.5.0), Rust su
crates.io (`qorechain-sdk` 0.5.0) e Java su Maven Central
(`io.github.qorechain:qorechain-sdk` 0.5.0). Gli adapter di esecuzione EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`, entrambi 0.5.0), il kit `@qorechain/react`
(0.5.0) e la CLI di scaffolding `create-qorechain-dapp` sono solo TypeScript e
ugualmente pubblicati su npm.

La release v0.4 ha aggiunto i prelievi rollup (`MsgExecuteWithdrawal`, il percorso
di uscita L2→L1), client di query tipizzati per i moduli `multilayer`, `rdk` e `bridge`,
messaggi di amministrazione del bridge e helper di alto livello per sidechain/paychain e
rollup in tutti e cinque i linguaggi.

## Dove andare ora

- [Perché l'SDK QoreChain](/sdk/why) — le tre funzionalità uniche di QoreChain.
- [Installazione](/sdk/install) — istruzioni di installazione per ogni linguaggio.
- [Quickstart](/sdk/quickstart) — connettersi, leggere un saldo, inviare un trasferimento.
- [Concetti: Architettura](/sdk/concepts/architecture) — il modello triplo VM.
- [Concetti: Account e firma PQC](/sdk/concepts/accounts-pqc) — chiavi e
  firma post-quantistica.
- [Guide](/sdk/guides/evm) — tutorial per ogni VM.
- [Riferimento rete ed endpoint](/sdk/reference/network) — chain id, porte, token.
- [Esempi](/sdk/examples) — snippet eseguibili, pronti da copiare e incollare.
- [Riferimento rete ed endpoint](/sdk/reference/network) è disponibile anche in [Reti](/appendix/networks).
