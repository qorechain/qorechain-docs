---
slug: /introduction/what-is-qorechain
title: Cos'è QoreChain?
sidebar_label: Cos'è QoreChain?
sidebar_position: 1
---

# Cos'è QoreChain?

QoreChain è la prima blockchain Layer 1 costruita con crittografia post-quantistica fin dal genesis, elaborazione delle transazioni AI-native e un runtime triple-VM che esegue programmi EVM, CosmWasm e SVM su un'unica chain. Anziché adattare a posteriori la resistenza quantistica a un protocollo esistente, QoreChain è stata progettata da zero per essere sicura contro avversari sia classici che quantistici, offrendo al contempo l'esperienza per gli sviluppatori e l'interoperabilità che ci si aspetta da una moderna blockchain general-purpose.

La mainnet (`qorechain-vladi`, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la versione della chain **v3.1.77**. Una testnet pubblica (`qorechain-diana`, EVM chain ID **9800**) viene eseguita in parallelo per lo staging e i test di integrazione. Il token nativo è **QOR** (visualizzazione) / **uqor** (base, 10^6), con prefissi Bech32 `qor` per gli account e `qorvaloper` per i validatori. La chain è costruita su Cosmos SDK v0.53.

## Innovazioni Principali

### 1. Crittografia Post-Quantistica

QoreChain utilizza ML-DSA-87 (Dilithium-5) standardizzato dal NIST per le firme digitali, ML-KEM-1024 per l'incapsulamento delle chiavi e SHAKE-256 come hash applicativo predefinito, fornendo sicurezza contro gli attacchi sia dei computer classici che di quelli quantistici. Le firme ibride sono ora **obbligatorie per impostazione predefinita** sul percorso delle transazioni cosmos: ogni transazione del percorso cosmos deve recare una firma Dilithium-5 (ML-DSA-87) come estensione di transazione *insieme* alla firma classica secp256k1 (ECDSA). Le transazioni cosmos solo classiche vengono rifiutate — il percorso di downgrade è chiuso (solo le gentx di genesis e le transazioni di registrazione/migrazione delle chiavi PQC sono esenti). Le transazioni EVM non ne sono interessate: utilizzano un percorso ante `eth_secp256k1` separato (il percorso del QoreChain EVM Engine) e non richiedono la firma ibrida. Restano disponibili tre modalità di applicazione controllate dalla governance (disabled, optional, required), ma l'impostazione predefinita corrente della rete è **required**. Un framework di agilità algoritmica garantisce che gli schemi di firma possano essere aggiornati tramite proposte di governance man mano che gli standard crittografici evolvono.

### 2. Elaborazione AI-Native

Un agente di apprendimento per rinforzo on-chain (PPO MLP con 73.733 parametri) esegue inferenza deterministica a virgola fissa direttamente nel ciclo di vita del blocco, regolando dinamicamente parametri di consenso come il tempo di blocco, i limiti di gas e i pesi dei pool di validatori. Questo livello di ottimizzazione è marchiato **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines). Il rilevamento statistico di anomalie con isolation forest e il punteggio di rischio multidimensionale valutano ogni transazione nella catena dell'ante handler, segnalando i pattern fraudolenti prima dell'esecuzione. L'ottimizzazione dinamica delle commissioni regola le commissioni base in base alle condizioni di rete in tempo reale. Tutta l'inferenza AI è completamente deterministica tra i validatori — input identici producono output identici senza alcuna dipendenza da oracoli esterni.

### 3. Runtime Triple-VM

QoreChain è l'unica Layer 1 che esegue nativamente tre macchine virtuali all'interno di un unico consenso:

* **EVM** — Piena compatibilità con Ethereum con pricing del gas EIP-1559 e JSON-RPC sulla porta 8545. Distribuisci contratti Solidity usando gli strumenti standard (Hardhat, Foundry, Remix).
* **CosmWasm** — Smart contract WebAssembly scritti in Rust con supporto completo del ciclo di vita (instantiate, execute, query, migrate).
* **SVM** — Distribuzione ed esecuzione di programmi BPF con un server JSON-RPC compatibile con Solana sulla porta 8899. I client e gli strumenti Solana esistenti funzionano immediatamente.

La messaggistica cross-VM consente a tutti e tre i runtime di comunicare: i contratti EVM chiamano CosmWasm tramite precompile, i contratti CosmWasm chiamano EVM tramite messaggi personalizzati e i programmi SVM partecipano tramite bridging asincrono basato su eventi.

### 4. Tokenomics a Offerta Fissa

Dieci distinti canali di burn (commissioni di transazione, penalità di governance, slashing, commissioni di bridge, deterrenza dello spam, eccedenza di epoca, burn manuali, callback dei contratti, commissioni cross-VM e burn di creazione dei rollup) alimentano un modulo centrale di contabilità dei burn. Le commissioni raccolte vengono suddivise **37% ai validatori, 30% bruciate permanentemente, 20% al tesoro, 10% agli staker e 3% ai light node**. Il meccanismo di staking di governance xQORE consente agli utenti di bloccare QOR per un peso di governance raddoppiato con ridistribuzione del rebase PvP — le penalità di uscita anticipata vengono ridistribuite ai detentori rimanenti, premiando la convinzione.

QoreChain utilizza un modello a **offerta fissa** con un budget di emissione finito anziché un'inflazione percentuale perpetua. L'offerta totale è fissata a **4.500.000.000 QOR**, di cui **80.000.000 (1,78%)** sono stati bruciati al TGE. Le ricompense di staking vengono pagate da un pool dedicato di **590.000.000 QOR** su un calendario pluriennale:

| Periodo | APY obiettivo | Budget di emissione |
| --- | --- | --- |
| Anno 1 | 8–12% | 127.500.000 QOR |
| Anno 2 | 6–10% | 106.250.000 QOR |
| Anni 3–4 | 5–8% | 85.000.000 QOR all'anno |
| Anno 5+ | Determinato dalla governance | ~186.000.000 QOR rimanenti |

Combinato con i dieci canali di burn, il design a offerta fissa converge verso un comportamento net-deflazionistico man mano che il volume delle transazioni cresce.

### 5. Connettività Cross-Chain

QoreChain è progettata per connettersi a un'ampia gamma di ecosistemi blockchain tramite due protocolli complementari: IBC nativo e il QoreChain Bridge (QCB). Il livello di bridge definisce **37 configurazioni di chain QCB (incluso QoreChain stesso come loopback nativo)** più **8 canali IBC** — coprendo in totale **36 chain esterne**. Il livello cross-chain è attualmente in **stato di testnet / pending e non è ancora in produzione**; le cifre seguenti descrivono la copertura prevista.

* **8 canali IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon e Injective. Template di relayer preconfigurati con aggiornamenti dei client, rilevamento di comportamenti scorretti e pulizia automatica dei pacchetti.
* **37 configurazioni QCB (36 chain esterne + loopback QoreChain)** — ogni endpoint è progettato per includere la convalida degli indirizzi per tipo, la profondità di conferma configurabile, i limiti di volume con circuit breaker e le attestazioni dei validatori firmate con PQC. Le chain esterne previste sono:
  * **Baseline (10):** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **Famiglia EVM (14):** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **Non-EVM (5):** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **Pending (7):** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

L'architettura copre ogni tipo di chain principale — EVM, Solana (SVM), basate su Move (Sui, Aptos), Cosmos/IBC, UTXO e altre famiglie non-EVM — per fornire un'ampia interoperabilità in tutto l'ecosistema.

### 6. Rollup Development Kit

Il modulo `x/rdk` è un framework nativo a livello di protocollo per distribuire rollup specifici per applicazione direttamente sulla host chain QoreChain. Il supporto ai rollup è fornito come framework della host chain; le affermazioni specifiche di deployment devono essere considerate come capacità previste. Sono supportati quattro paradigmi di settlement:

* **Optimistic** — Prove di frode con una finestra di sfida di 7 giorni, auto-finalizzate dall'EndBlocker.
* **ZK (Zero-Knowledge)** — Prove SNARK o STARK con finalità istantanea alla verifica.
* **Based** — Transazioni sequenziate da L1 con finalità in circa 2 blocchi host.
* **Sovereign** — Chain indipendenti che utilizzano QoreChain esclusivamente per la disponibilità dei dati.

Cinque profili preconfigurati (**defi, gaming, nft, enterprise, custom**) consentono un deployment con un clic con modalità di settlement, tempi di blocco, scelte di VM, backend DA e modelli di gas preconfigurati. Un router DA nativo fornisce l'archiviazione di blob con commit SHA-256 con retention configurabile e pruning automatico. Il modulo di consenso PRISM fornisce metodi di advisory per la configurazione dei rollup assistita dall'AI.

### 7. Account e Gas Abstraction

Gli smart account con tre tipi programmabili (multisig, social recovery, basati su sessione) supportano session key con permessi granulari e scadenza, regole di spesa per account e allowlist di denom. Questo abilita pattern di UX del wallet impossibili con gli account standard: session key dApp per mobile, social recovery come tipo di account di prima classe e limiti di spesa programmabili applicati al consenso. La gas abstraction elimina l'obbligo di detenere QOR nativo per le commissioni — gli utenti possono pagare con qualsiasi token accettato trasferito via IBC, come USDC o ATOM.

## Ecosistema

QoreChain include **45+ moduli di genesis, inclusi 20+ moduli personalizzati**, coprendo la sicurezza (pqc), l'AI (ai, reputation, rlconsensus), il consenso (qca), le macchine virtuali (vm, svm, crossvm), la tokenomics (burn, xqore, inflation), la liquidità (amm), il licensing (license), i bridge (bridge, babylon, multilayer), le estensioni di governance (abstractaccount, fairblock, gasabstraction) e i rollup (rdk). Le aggiunte recenti includono `x/amm` per l'AMM / liquidità on-chain e `x/license` per il licensing della chain. La chain segue un'architettura open-core — il livello di protocollo è completamente open source, con estensioni proprietarie opzionali per i deployment enterprise.

## Correlati

* [Panoramica dell'Architettura](/introduction/architecture-overview) — come i livelli si incastrano end-to-end.
* [Funzionalità Principali](/introduction/key-features) — gli highlight delle capacità in sintesi.
* [Motore di Consenso PRISM](/architecture/prism-consensus-engine) — il consenso assistito dall'AI al centro.
* [Tokenomics](/architecture/tokenomics) — offerta di QOR, burn, rebase ed emissioni.
* [Quickstart](/getting-started/quickstart) — avvia un nodo locale e inizia a sviluppare.
