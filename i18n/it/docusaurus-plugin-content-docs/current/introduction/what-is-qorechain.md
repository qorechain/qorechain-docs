---
slug: /introduction/what-is-qorechain
title: Cos'è QoreChain?
sidebar_label: Cos'è QoreChain?
sidebar_position: 1
---

# Cos'è QoreChain?

QoreChain è la prima blockchain Layer 1 costruita con crittografia post-quantistica fin dal genesis, elaborazione delle transazioni nativa per l'IA e un runtime a tripla VM che esegue programmi EVM, CosmWasm e SVM su un'unica chain. Anziché innestare la resistenza quantistica su un protocollo esistente, QoreChain è stata progettata da zero per essere sicura contro avversari sia classici sia quantistici, offrendo al contempo l'esperienza di sviluppo e l'interoperabilità attese da una blockchain generalista moderna.

La mainnet (`qorechain-vladi`, EVM chain ID **9801**) è live dal 7 giugno 2026 ed esegue la versione della chain **v3.1.92**. Una testnet pubblica (`qorechain-diana`, EVM chain ID **9800**) opera in parallelo per lo staging e i test di integrazione. Il token nativo è **QOR** (visualizzazione) / **uqor** (unità base, 10^6), con prefissi Bech32 `qor` per gli account e `qorvaloper` per i validatori. La chain è costruita sul Cosmos SDK v0.53.

## Innovazioni principali

### 1. Crittografia post-quantistica

QoreChain utilizza ML-DSA-87 (Dilithium-5) standardizzato dal NIST per le firme digitali, ML-KEM-1024 per l'incapsulamento delle chiavi e SHAKE-256 come hash applicativo predefinito, fornendo sicurezza contro attacchi sia da computer classici sia quantistici. Le firme ibride sono ora **obbligatorie per impostazione predefinita** sul percorso di transazione cosmos: ogni transazione sul percorso cosmos deve portare una firma Dilithium-5 (ML-DSA-87) come estensione della transazione *insieme* alla firma classica secp256k1 (ECDSA). Le transazioni cosmos solo classiche vengono rifiutate — il percorso di downgrade è chiuso (sono esenti solo i gentx del genesis e le transazioni di registrazione/migrazione delle chiavi PQC). Le transazioni EVM non sono interessate: utilizzano un percorso ante separato `eth_secp256k1` (il percorso QoreChain EVM Engine) e non richiedono la firma ibrida. Restano disponibili tre modalità di applicazione controllate dalla governance (disabilitata, opzionale, obbligatoria), ma l'impostazione predefinita attuale della rete è **obbligatoria**. Un framework di agilità algoritmica garantisce che gli schemi di firma possano essere aggiornati tramite proposte di governance man mano che gli standard crittografici evolvono.

### 2. Elaborazione nativa per l'IA

Un agente di reinforcement learning on-chain (PPO MLP con 73.733 parametri) esegue inferenza deterministica a virgola fissa direttamente nel ciclo di vita del blocco, ottimizzando dinamicamente parametri di consenso come il block time, i limiti di gas e i pesi del pool dei validatori. Questo livello di ottimizzazione è chiamato **PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines). Il rilevamento statistico delle anomalie tramite isolation forest e il risk scoring multidimensionale valutano ogni transazione nella catena dell'ante handler, segnalando pattern fraudolenti prima dell'esecuzione. L'ottimizzazione dinamica delle fee regola le fee di base in base alle condizioni della rete in tempo reale. Tutta l'inferenza IA è pienamente deterministica tra i validatori — input identici producono output identici, senza alcuna dipendenza da oracoli esterni.

### 3. Runtime a tripla VM

QoreChain è l'unica Layer 1 che esegue nativamente tre macchine virtuali all'interno di un unico consenso:

* **EVM** — Piena compatibilità con Ethereum, con pricing del gas EIP-1559 e JSON-RPC sulla porta 8545. Distribuisci contratti Solidity utilizzando strumenti standard (Hardhat, Foundry, Remix).
* **CosmWasm** — Smart contract WebAssembly scritti in Rust con pieno supporto del ciclo di vita (instantiate, execute, query, migrate).
* **SVM** — Distribuzione ed esecuzione di programmi BPF con un server JSON-RPC compatibile con Solana sulla porta 8899. I client e gli strumenti Solana esistenti funzionano immediatamente.

Il messaging cross-VM consente a tutti e tre i runtime di comunicare: i contratti EVM chiamano CosmWasm tramite precompile, i contratti CosmWasm chiamano EVM tramite messaggi personalizzati e i programmi SVM partecipano tramite bridging asincrono basato su eventi.

### 4. Tokenomics a offerta fissa

Dieci canali di burn distinti (fee di transazione, penalità di governance, slashing, fee del bridge, deterrenza dello spam, eccesso di epoca, burn manuali, callback dei contratti, fee cross-VM e burn di creazione dei rollup) alimentano un modulo centrale di contabilità dei burn. Le fee raccolte sono suddivise **37% ai validatori, 30% bruciato permanentemente, 20% al treasury, 10% agli staker e 3% ai light node**. Il meccanismo di staking di governance xQORE consente agli utenti di bloccare QOR per un peso di governance raddoppiato con redistribuzione PvP tramite rebase — le penalità di uscita anticipata vengono redistribuite ai possessori rimanenti, premiando la convinzione.

QoreChain utilizza un modello a **offerta fissa**, con un budget di emissione finito anziché un'inflazione percentuale perpetua. L'offerta totale è fissata a **4.500.000.000 QOR**, di cui **80.000.000 (1,78%)** sono stati bruciati al TGE. Le ricompense di staking vengono pagate da un pool dedicato di **590.000.000 QOR** secondo un programma pluriennale:

| Periodo | APY target | Budget di emissione |
| --- | --- | --- |
| Anno 1 | 8–12% | 127.500.000 QOR |
| Anno 2 | 6–10% | 106.250.000 QOR |
| Anni 3–4 | 5–8% | 85.000.000 QOR all'anno |
| Anno 5+ | Determinato dalla governance | ~186.000.000 QOR rimanenti |

Combinato con i dieci canali di burn, il design a offerta fissa converge verso un comportamento netto deflazionistico man mano che il volume delle transazioni cresce.

### 5. Connettività cross-chain

QoreChain è progettata per connettersi a un ampio insieme di ecosistemi blockchain tramite due protocolli complementari: IBC nativo e il QoreChain Bridge (QCB). Il livello del bridge definisce **37 configurazioni di chain QCB (incluso QoreChain stessa come loopback nativo)** più **8 canali IBC** — che coprono in totale **36 chain esterne**. Il livello cross-chain si trova attualmente in stato di **testnet / in attesa e non è ancora in produzione**; le cifre seguenti descrivono la copertura target.

* **8 canali IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon e Injective. Template di relayer preconfigurati con aggiornamenti del client, rilevamento di comportamenti scorretti e clearing automatico dei pacchetti.
* **37 configurazioni QCB (36 chain esterne + loopback QoreChain)** — ogni endpoint è progettato per includere validazione degli indirizzi per tipo, profondità di conferma configurabile, limiti di volume tramite circuit breaker e attestazioni dei validatori firmate con PQC. Le chain esterne target sono:
  * **Baseline (10):** Ethereum, Solana, TON, BSC, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui
  * **Famiglia EVM (14):** zkSync Era, Linea, Scroll, Blast, Mantle, Hyperliquid, Berachain, Sonic, Sei, Monad, Plasma, Filecoin FVM, Cronos, Kaia
  * **Non-EVM (5):** Starknet, XRP Ledger, Stellar, Hedera, Algorand
  * **In attesa (7):** NEAR, Bitcoin, Cardano, Polkadot, Tezos, Tron, Aptos

L'architettura copre ogni principale tipo di chain — EVM, Solana (SVM), basate su Move (Sui, Aptos), Cosmos/IBC, UTXO e altre famiglie non-EVM — per offrire un'ampia interoperabilità in tutto l'ecosistema.

### 6. Rollup Development Kit

Il modulo `x/rdk` è un framework nativo del protocollo per distribuire rollup specifici per applicazione direttamente sulla host chain di QoreChain. Il supporto ai rollup viene fornito come framework a livello di host chain; le affermazioni specifiche sulla distribuzione vanno considerate come capacità target. Sono supportati quattro paradigmi di settlement:

* **Optimistic** — Fraud proof con una finestra di contestazione di 7 giorni, finalizzati automaticamente dall'EndBlocker.
* **ZK (Zero-Knowledge)** — Proof SNARK o STARK con finalità istantanea al momento della verifica.
* **Based** — Transazioni sequenziate su L1 con finalità in circa 2 blocchi dell'host.
* **Sovereign** — Chain indipendenti che utilizzano QoreChain esclusivamente per la disponibilità dei dati.

Cinque profili preimpostati (**defi, gaming, nft, enterprise, custom**) consentono la distribuzione con un clic, con modalità di settlement preconfigurate, block time, scelte di VM, backend DA e modelli di gas. Un router DA nativo fornisce storage di blob con commit SHA-256 con retention configurabile e pruning automatico. Il modulo di consenso PRISM fornisce metodi consultivi per la configurazione dei rollup assistita dall'IA.

### 7. Astrazione degli account e del gas

Gli smart account con tre tipi programmabili (multisig, recupero sociale, basato su sessione) supportano session key con permessi granulari e scadenza, regole di spesa per account e allowlist dei denom. Questo abilita pattern di UX del wallet impossibili con account standard: session key dApp per mobile, recupero sociale come tipo di account di prima classe e limiti di spesa programmabili applicati a livello di consenso. L'astrazione del gas elimina l'obbligo di possedere QOR nativo per le fee — gli utenti possono pagare in qualsiasi token accettato trasferito via IBC, come USDC o ATOM.

## Ecosistema

QoreChain viene distribuita con **45+ moduli di genesis, inclusi 20+ moduli personalizzati**, che coprono sicurezza (pqc), IA (ai, reputation, rlconsensus), consenso (qca), macchine virtuali (vm, svm, crossvm), tokenomics (burn, xqore, inflation), liquidità (amm), licenze (license), bridge (bridge, babylon, multilayer), estensioni di governance (abstractaccount, fairblock, gasabstraction) e rollup (rdk). Tra le aggiunte recenti figurano `x/amm` per l'AMM / liquidità on-chain e `x/license` per la licenza della chain. La chain segue un'architettura open-core — il livello di protocollo è interamente open source, con estensioni proprietarie opzionali per le distribuzioni enterprise.

## Correlati

* [Panoramica dell'architettura](/introduction/architecture-overview) — come i livelli si integrano end to end.
* [Funzionalità principali](/introduction/key-features) — i punti salienti delle capacità in sintesi.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — il consenso assistito dall'IA al centro del sistema.
* [Tokenomics](/architecture/tokenomics) — offerta, burn, rebase ed emissioni di QOR.
* [Quickstart](/getting-started/quickstart) — avvia un nodo locale e inizia a sviluppare.
