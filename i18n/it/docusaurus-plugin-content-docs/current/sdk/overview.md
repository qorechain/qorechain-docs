---
slug: /sdk/overview
title: Panoramica dell'SDK QoreChain
sidebar_label: Panoramica
sidebar_position: 1
---

# QoreChain SDK

Il QoreChain SDK è il kit di sviluppo multi-linguaggio ufficiale per creare
applicazioni decentralizzate su **QoreChain** — una rete Layer 1 quantum-safe
con tripla VM.

Questa documentazione spiega come installare l'SDK, connettersi alla rete,
leggere lo stato on-chain, derivare account, firmare e inviare transazioni e
lavorare con ciascuna delle macchine virtuali di QoreChain.

## Che cos'è QoreChain?

QoreChain è una blockchain Layer 1 con tre runtime di smart contract di prima
classe su un'unica chain:

- **CosmWasm** — smart contract Wasm tramite il Cosmos SDK.
- **QoreChain EVM Engine** — esecuzione compatibile con Ethereum (Solidity, viem,
  JSON-RPC standard).
- **SVM** — un runtime compatibile con Solana con un JSON-RPC in stile Solana.

Account, saldi e token sono condivisi tra i runtime e la chain supporta IBC per
l'interoperabilità cross-chain.

### Quantum-safe fin dalla progettazione

QoreChain fornisce primitive di crittografia post-quantistica (PQC) basate su
**ML-DSA-87** (Dilithium-5, FIPS 204). Accanto alla firma classica secp256k1,
la chain supporta una modalità di firma **ibrida** in cui una transazione porta
con sé *sia* una firma classica *sia* una firma post-quantistica, restando così
valida oggi con la verifica classica e guadagnando al contempo la protezione
post-quantistica.

L'SDK espone già oggi la generazione di chiavi, la firma e la verifica
ML-DSA-87, oltre ai mattoni fondamentali per le transazioni ibride. Consulta
[Account e firma PQC](/sdk/concepts/accounts-pqc) per i dettagli. Nessuna
affermazione di marketing qui — l'SDK espone esattamente le primitive che la
chain implementa.

## Cosa rende diverso questo SDK

Oltre alla piena parità multi-chain, tre funzionalità sono **possibili solo su
QoreChain**, perché sono costruite su caratteristiche di protocollo che nessun
altro Layer 1 possiede:

- **Valutazione del rischio AI pre-volo** — analizza una transazione con l'AI
  on-chain prima di trasmetterla. `simulateWithRiskScore` restituisce il gas più
  un verdetto di rischio/anomalia proveniente da precompile EVM deterministici,
  così un wallet o una dApp può avvisare (o bloccare) *prima* della firma.
  Vedi [AI pre-flight](/sdk/guides/ai-preflight).
- **Chiamate cross-VM unificate** — un account, tre VM, una transazione.
  `createCrossVMClient` chiama un contratto su qualsiasi VM e `callAtomic`
  raggruppa più chiamate cross-VM in un'unica transazione atomica firmata una
  sola volta. Vedi [Chiamate cross-VM](/sdk/guides/cross-vm).
- **DX quantum-safe** — rendi un signer protetto post-quantum con una sola
  chiamata idempotente (`ensurePqcRegistered` / `migrateToHybrid`), con un badge
  React pronto all'uso. Vedi [Quantum-safe](/sdk/guides/quantum-safe).

Altre due funzionalità a livello di chain sono arrivate nelle versioni 0.6.0 e
0.7.0:

- **Account eth-native unificati** — una chiave `eth_secp256k1` è un'unica
  identità di 20 byte resa come `qor1…`, `0x…` e un indirizzo SVM base58, tutti
  con un unico saldo condiviso. Vedi
  [Account unificati](/sdk/concepts/accounts-pqc#unified-accounts).
- **Corsie authenticator** — collega una chiave Phantom o MetaMask all'account
  canonico che richiede PQC e lasciala spendere tramite un relayer secondo
  termini a privilegio minimo, con limiti di spesa e revocabili. Vedi
  [Authenticator e spesa delegata](/sdk/guides/authenticators).

Un nuovo kit **`@qorechain/react`** (provider, hook, `ConnectButton`,
`QuantumSafeBadge`) rende la costruzione di una dApp quantum-safe il percorso
predefinito — vedi la [guida al kit React](/sdk/guides/react). Per
l'argomentazione completa, leggi [Perché QoreChain SDK](/sdk/why).

## La famiglia SDK

L'SDK è distribuito come una famiglia di pacchetti, così puoi sviluppare nel
linguaggio che preferisci. Condividono gli stessi preset di rete, schemi di
derivazione, aritmetica delle denominazioni e superfici di lettura.

| Pacchetto | Linguaggio | Installazione | Stato |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Pubblicato (npm, v0.7.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Pubblicato (PyPI, v0.7.0) |
| `qorechain-sdk` (modulo Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Pubblicato (proxy Go, tag `packages/go/v0.7.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | Pubblicato (crates.io, ultima versione pubblicata; 0.7.0 dal repository) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.7.0` | Pubblicato (Maven Central, v0.7.0) |
| `@qorechain/evm` | TypeScript (adapter EVM) | `npm i @qorechain/evm viem` | Pubblicato (npm, v0.7.0) |
| `@qorechain/svm` | TypeScript (adapter SVM) | `npm i @qorechain/svm @solana/web3.js` | Pubblicato (npm, v0.7.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Pubblicato (npm, v0.7.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Pubblicato (npm, v0.7.0) |

> La distribuzione Python si installa come `qorechain-sdk` ma **si importa come
> `qorsdk`**. Tutti i client sono pubblicati sui rispettivi registri — vedi
> [Installazione](/sdk/install) per i comandi specifici per linguaggio.

Il core TypeScript (`@qorechain/sdk`) è la base degli esempi in questa
documentazione. I client Python, Go, Rust e Java raggiungono la **piena parità
native-chain** con TypeScript: preset di rete, utilità per denom/indirizzi,
derivazione HD degli account (native/EVM/SVM), firma PQC (ML-DSA-87),
compositori di messaggi tipizzati per ogni modulo personalizzato oltre ai
moduli Cosmos standard, client di query tipizzati, il ciclo di vita completo
delle transazioni (auto-gas, decodifica degli errori, tracciamento delle tx,
ricerca di blocchi/tx), transazioni post-quantistiche ibride e sottoscrizioni
WebSocket. Tutti questi client sono **pubblicati**: TypeScript su npm
(`@qorechain/sdk` 0.7.0), Python su PyPI (`qorechain-sdk` 0.7.0, import
`qorsdk`), Go sul module proxy (tag `packages/go/v0.7.0`), Rust su
crates.io (`qorechain-sdk`, ultima versione pubblicata — la pubblicazione del
crate 0.7.0 è in sospeso, quindi installa da crates.io o dal repository) e Java
su Maven Central (`io.github.qorechain:qorechain-sdk` 0.7.0). Gli adapter di
esecuzione EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, entrambi 0.7.0), il kit
`@qorechain/react` (0.7.0) e la CLI di scaffolding `create-qorechain-dapp`
(0.7.0) sono solo TypeScript e anch'essi pubblicati su npm.

## Novità nelle versioni 0.6 e 0.7

**0.6.0 — account eth-native unificati (chain v3.1.83).** Una chiave
`eth_secp256k1` è un'unica identità di 20 byte resa in tutte e tre le codifiche
di indirizzo, con un unico saldo spendibile su ogni corsia:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

La firma sulla corsia Native con la stessa chiave avviene con
`signClassicalEth` / `signHybridEth`, e `connectPhantomUnified` deriva un
account unificato non-custodial da una firma Phantom deterministica. Il legacy
`deriveNativeAccount` con coin-type 118 resta invariato. Vedi
[Account unificati](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — correzione critica per il consenso.** L'estensione del tx-body
`PQCHybridSignature` è ora codificata in protobuf (era codificata in JSON e
veniva rifiutata a CheckTx). Le transazioni ibride costruite con SDK ≤ 0.6.0
vengono **rifiutate on-chain** — esegui l'aggiornamento.

**0.7.0 — corsie authenticator (chain v3.1.85).** Una chiave collegata Phantom
(ed25519) o MetaMask (secp256k1, tramite indirizzo di 20 byte) può spendere
dall'account canonico che richiede PQC attraverso un relayer, secondo termini a
privilegio minimo, con limiti di spesa e revocabili: compositori
`MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`, helper byte-exact
`evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes`, la query
`permissionSchema`, codici di errore decodificati e builder TypeScript per
wallet (`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …).
Guida completa con esempi pronti da copiare e incollare:
[Authenticator e spesa delegata](/sdk/guides/authenticators).

## Dove andare adesso

- [Perché QoreChain SDK](/sdk/why) — le cinque funzionalità uniche di QoreChain.
- [Installazione](/sdk/install) — istruzioni di installazione per linguaggio.
- [Quickstart](/sdk/quickstart) — connettiti, leggi un saldo, invia un trasferimento.
- [Concetti: Architettura](/sdk/concepts/architecture) — il modello a tripla VM.
- [Concetti: Account e firma PQC](/sdk/concepts/accounts-pqc) — chiavi e firma
  post-quantistica.
- [Guide](/sdk/guides/evm) — guide pratiche per ciascuna VM.
- [Authenticator e spesa delegata](/sdk/guides/authenticators) — chiavi
  Phantom/MetaMask collegate che spendono tramite un relayer.
- [Riferimento rete ed endpoint](/sdk/reference/network) — chain id, porte, token.
- [Esempi](/sdk/examples) — snippet eseguibili e pronti da copiare e incollare.
- Il [riferimento rete ed endpoint](/sdk/reference/network) è disponibile anche in [Reti](/appendix/networks).
