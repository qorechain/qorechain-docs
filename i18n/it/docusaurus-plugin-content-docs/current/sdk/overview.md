---
slug: /sdk/overview
title: Panoramica dell'SDK QoreChain
sidebar_label: Panoramica
sidebar_position: 1
---

# QoreChain SDK

Il QoreChain SDK è il kit di sviluppo multilinguaggio ufficiale per creare
applicazioni decentralizzate su **QoreChain** — una rete Layer 1 a tripla VM
con firme ibride ML-DSA-87 (FIPS 204).

Questa documentazione spiega come installare l'SDK, connettersi alla rete,
leggere lo stato on-chain, derivare account, firmare e inviare transazioni e
lavorare con ciascuna delle macchine virtuali di QoreChain.

## Che cos'è QoreChain?

QoreChain è una blockchain Layer 1 con tre runtime di smart contract di prima
classe su un'unica chain:

- **QoreChain Native** — smart contract Wasm tramite il Cosmos SDK (il runtime CosmWasm).
- **QoreChain EVM Engine** — esecuzione compatibile con Ethereum (Solidity, viem,
  JSON-RPC standard).
- **SVM** — un runtime compatibile con Solana con un JSON-RPC in stile Solana.

Account, saldi e token sono condivisi tra i runtime e la chain include il modulo
IBC per l'interoperabilità cross-chain (al momento non è aperto alcun canale IBC
sulla mainnet; la testnet ha un canale `transfer` aperto verso una chain di test, verificato il 27 ottobre 2026).

:::note Cosa funziona oggi sulle reti attive (mainnet v3.2.5, testnet v3.2.6)
**Funziona:** le letture su ogni corsia, le transazioni Native firmate in modo ibrido, gli account
unificati, le transazioni EVM all'interno di una
[finestra di autorizzazione](/sdk/guides/evm#evm-window) e le letture SVM.
**Non ancora disponibile:** i precompilati EVM sulla mainnet (nessuno è attivo lì; la
testnet ne ha tre attivi, verifica PQC, stato chiave PQC e parametri di consenso, e
la coppia AI e il bridge cross-VM sono inattivi su entrambe), il namespace JSON-RPC `qor_`, le transazioni SVM, le chiamate cross-VM su mainnet (`MsgCrossVMCall` è
disattivato dal circuit breaker), il caricamento e l'istanziazione QoreChain Native per gli
account ordinari (sulla testnet l'istanziazione è aperta e il caricamento no), i flussi authenticator /
account astratto sulla mainnet (modulo disattivato lì, abilitato sulla
testnet), xQORE e l'astrazione del gas. Ogni guida ripete l'avvertenza dove si
applica. Verificato rispetto agli endpoint attivi il 27 ottobre 2026.

L'SDK pubblicato (0.10.0, 26 ottobre 2026) firma nella forma che entrambe le reti verificano
(sign-bytes ibridi v2, risolti dallo stato della chain), e il formato di firma,
gli indirizzi, i decimali, i memo e le commissioni non sono cambiati nella v3.2.3, v3.2.4 né v3.2.5 (la mainnet esegue la v3.2.5 dal 29 ottobre 2026;
la testnet esegue la v3.2.6, applicata il 27 ottobre). Include
il lato client delle successive regole post-quantistiche (la prova di possesso alla registrazione
della chiave, le finestre EVM con ambito limitato, i messaggi di consenso EIP-7702) e della v3.2.4 (tier di staking,
il nonce dell'authenticator, gli interruttori delle funzionalità del protocollo); le versioni precedenti alla 0.9.0
non portano il primo gruppo, vedi [Versioni precedenti alla 0.9.0](/sdk/install#before-090)
e [Cosa aggiunge la 0.10.0](/sdk/install#whats-new-0100).

Firma per wallet e backend: vedi [QoreSign](/qoresign/overview).
:::

### Firma ibrida ML-DSA-87

QoreChain fornisce primitive di crittografia post-quantistica (PQC) basate su
**ML-DSA-87** (Dilithium-5, FIPS 204). Accanto alla firma classica secp256k1,
la chain supporta una modalità di firma **ibrida** in cui una transazione porta
con sé *sia* una firma classica *sia* una firma post-quantistica, restando così
valida oggi con la verifica classica e guadagnando al contempo la protezione
post-quantistica.

L'SDK espone già oggi la generazione di chiavi, la firma e la verifica
ML-DSA-87, oltre ai mattoni fondamentali per le transazioni ibride. Sulle reti
attive una transazione sulla corsia Native **deve** essere firmata in modo ibrido e la chiave
ML-DSA-87 dell'account deve essere registrata prima. Consulta
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
  I precompilati AI non sono ancora attivi su mainnet né su testnet. Vedi [AI pre-flight](/sdk/guides/ai-preflight).
- **Chiamate cross-VM unificate** — un account, tre VM, una transazione.
  `createCrossVMClient` chiama un contratto su qualsiasi VM e `callAtomic`
  raggruppa più chiamate cross-VM in un'unica transazione atomica firmata una
  sola volta. Vedi [Chiamate cross-VM](/sdk/guides/cross-vm).
- **DX della firma ibrida** — registra la chiave ML-DSA-87 di un signer con una
  sola chiamata idempotente (`ensurePqcRegistered` / `migrateToHybrid`), con un
  badge React pronto all'uso. Vedi [Firma ibrida](/sdk/guides/quantum-safe).

Altre due funzionalità a livello di chain sono arrivate nelle versioni 0.6.0 e
0.7.0 (la seconda non è ancora utilizzabile sulle reti attive, vedi sotto):

- **Account eth-native unificati** — una chiave `eth_secp256k1` è un'unica
  identità di 20 byte resa come `qor1…`, `0x…` e un indirizzo SVM base58, tutti
  con un unico saldo condiviso. Vedi
  [Account unificati](/sdk/concepts/accounts-pqc#unified-accounts).
- **Corsie authenticator** — collega una chiave Phantom o MetaMask all'account
  canonico che richiede PQC e lasciala spendere tramite un relayer secondo
  termini a privilegio minimo, con limiti di spesa e revocabili. Il modulo
  `abstractaccount` che le sostiene è oggi disattivato sulla mainnet e abilitato sulla testnet. Vedi
  [Authenticator e spesa delegata](/sdk/guides/authenticators).

Un nuovo kit **`@qorechain/react`** (provider, hook, `ConnectButton`,
`QuantumSafeBadge`) rende la costruzione di una dApp con firma ibrida ML-DSA-87 il percorso
predefinito — vedi la [guida al kit React](/sdk/guides/react). Per
l'argomentazione completa, leggi [Perché QoreChain SDK](/sdk/why).

## La famiglia SDK

L'SDK è distribuito come una famiglia di pacchetti, così puoi sviluppare nel
linguaggio che preferisci. Condividono gli stessi preset di rete, schemi di
derivazione, aritmetica delle denominazioni e superfici di lettura.

| Pacchetto | Linguaggio | Installazione | Stato |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Pubblicato (npm, v0.10.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Pubblicato (PyPI, v0.10.0) |
| `qorechain-sdk` (modulo Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Pubblicato (proxy Go, tag `packages/go/v0.10.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | Pubblicato (crates.io, v0.10.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.10.0` | Pubblicato (Maven Central, v0.10.0) |
| `@qorechain/evm` | TypeScript (adapter EVM) | `npm i @qorechain/evm viem` | Pubblicato (npm, v0.8.0) |
| `@qorechain/svm` | TypeScript (adapter SVM) | `npm i @qorechain/svm @solana/web3.js` | Pubblicato (npm, v0.8.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Pubblicato (npm, v0.10.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Pubblicato (npm, v0.10.0) |

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
(`@qorechain/sdk` 0.10.0), Python su PyPI (`qorechain-sdk` 0.10.0, import
`qorsdk`), Go sul module proxy (tag `packages/go/v0.10.0`), Rust su
crates.io (`qorechain-sdk` 0.10.0) e Java su Maven Central
(`io.github.qorechain:qorechain-sdk` 0.10.0). Gli adapter di esecuzione EVM/SVM
(`@qorechain/evm`, `@qorechain/svm`, entrambi 0.8.0), il kit `@qorechain/react`
(0.10.0) e la CLI di scaffolding `create-qorechain-dapp` (0.10.0) sono solo
TypeScript e anch'essi pubblicati su npm. Vedi
[Installazione](/sdk/install#related-packages) per i pacchetti complementari.

## Novità nelle versioni 0.6, 0.7, 0.8, 0.9 e 0.10

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
`signClassicalEth` / `signHybridEth`, e una chiave Phantom o MetaMask si collega all'account come authenticator
(la derivazione da una firma Phantom è stata rimossa nella 0.8.0). Il legacy
`deriveNativeAccount` con coin-type 118 resta invariato. Vedi
[Account unificati](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — correzione critica per il consenso.** L'estensione del tx-body
`PQCHybridSignature` è ora codificata in protobuf (era codificata in JSON e
veniva rifiutata a CheckTx). Le transazioni ibride costruite con SDK ≤ 0.6.0
vengono **rifiutate on-chain** — esegui l'aggiornamento.

**0.7.0 — corsie authenticator (chain v3.1.85).** Il modulo `abstractaccount`
che le sostiene è attualmente disattivato sulla mainnet e abilitato sulla testnet (vedi la
[guida agli Authenticator](/sdk/guides/authenticators)). Una chiave collegata Phantom
(ed25519) o MetaMask (secp256k1, tramite indirizzo di 20 byte) può spendere
dall'account canonico che richiede PQC attraverso un relayer, secondo termini a
privilegio minimo, con limiti di spesa e revocabili: compositori
`MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`, helper byte-exact
`evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes`, la query
`permissionSchema`, codici di errore decodificati e builder TypeScript per
wallet (`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`, …).
Guida completa con esempi pronti da copiare e incollare:
[Authenticator e spesa delegata](/sdk/guides/authenticators).

**0.8.0 – 0.8.3 — sign-bytes ibridi v2 e finestra di autorizzazione EVM (chain
v3.2.0).** La metà post-quantistica di una transazione ibrida viene ora firmata nella forma
che la rete di destinazione verifica (v1 o v2, `signBytesVersion: "auto" | "v1" | "v2"`).
Entrambe le reti pubbliche sono su v2, quindi serve l'SDK **0.8.1 o successivo** per
operare su mainnet (usa la release corrente). **0.8.2** aggiunge `openEvmWindowMsg`, `closeEvmWindowMsg`,
`fetchEvmWindow` e `classifyEvmWindowRejection` per la
[finestra di autorizzazione](/sdk/guides/evm#evm-window) della corsia EVM.
**0.8.0** ha rimosso gli helper di account basati sulla firma del wallet (`connectPhantomUnified` e
`unifiedAccountFromPhantomSignature`, rimossi nella 0.8.0), applica controlli rigorosi sulle dimensioni ML-DSA-87
in ogni linguaggio e aggiunge il flag `async` e i dati restituiti dal callee
alle chiamate cross-VM. **0.8.3** corregge la ricerca delle tx, le race condition degli hook React, la sequenza di
`migrate_to_hybrid` in Python e la derivazione PQC canonica indipendente dalla forma dell'indirizzo
(`derivePqcCanonical`, `canonicalAccount`). Vedi
[Note di aggiornamento](/sdk/install#upgrade).

**0.9.0 — supporto client per la chain v3.2.2 e v3.2.3.** Il `TxClient` TypeScript
firma in modo ibrido quando passi la coppia di chiavi dell'account
(`client.connectTx(signer, { pqcKeypair })`), così `bankSend` e i client rollup,
multilayer e cross-VM dell'SDK funzionano sulle reti pubbliche. `ensurePqcRegistered`
controlla prima via REST la chiave registrata, rifiuta di registrare una seconda chiave
diversa e allega da sé la prova di possesso una volta che la rete ha applicato la
v3.2.3. Nuovi builder coprono le finestre EVM con ambito limitato (`nativeOnly`, `allowedTargets`) e
i messaggi di consenso EIP-7702, e `derivePqcCanonical(address, mnemonic)` fornisce una
chiave recuperabile dalla mnemonic in ogni linguaggio. La route dell'account PQC è
la `/qorechain/pqc/v1/account/{address}` al singolare, i fallimenti all'interno di un blocco mantengono
il loro codespace e `create-qorechain-dapp` genera i progetti sull'SDK corrente. Vedi
[Cosa ha aggiunto la 0.9.0](/sdk/install#whats-new-090).

**0.10.0 — supporto client per la chain v3.2.4.** Composer e letture dei tier di staking
(`lockDelegation`, `unlockEarly`, `claimBonus`, `fetchStakingTierParams`,
`fetchStakingLocks`), `fetchAuthNonce` per la sequenza successiva di una chiave collegata,
`fetchProtocolFeatures` / `isProtocolFeatureEnabled` per le regole di consenso che una
rete applica per nome, `possessionProven` nello stato PQC e
`ibcTimeoutTimestamp`. `ensurePqcRegistered` ora confronta la chiave registrata
invece di fidarsi di uno stato privo di essa, e un rifiuto della chain che arriva come
testo durante la simulazione delle commissioni è nominato in ogni linguaggio. Vedi
[Cosa aggiunge la 0.10.0](/sdk/install#whats-new-0100).

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
