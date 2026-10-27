---
slug: /introduction/what-is-qorechain
title: Cos'è QoreChain?
sidebar_label: Cos'è QoreChain?
sidebar_position: 1
---

# Cos'è QoreChain?

QoreChain è la prima blockchain Layer 1 costruita con crittografia post-quantistica fin dal genesis, elaborazione delle transazioni nativa per l'IA e un runtime a tripla VM che esegue programmi EVM, QoreChain Native (il runtime CosmWasm) e SVM su un'unica chain. Anziché innestare la resistenza quantistica su un protocollo esistente, QoreChain è stata progettata da zero per essere sicura contro avversari sia classici sia quantistici, offrendo al contempo l'esperienza di sviluppo e l'interoperabilità attese da una blockchain generalista moderna.

La mainnet (`qorechain-vladi`, EVM chain ID **9801**) è live dal 7 giugno 2026 ed esegue la versione della chain **v3.2.4** (applicata dalla proposta di governance 13 all'altezza 3.742.566 il 23 ottobre 2026). Una testnet pubblica (`qorechain-diana`, EVM chain ID **9800**, che esegue la v3.2.6 dal 27 ottobre 2026) opera in parallelo per lo staging e i test di integrazione. Il token nativo è **QOR** (visualizzazione) / **uqor** (unità base, 10^6), con prefissi Bech32 `qor` per gli account e `qorvaloper` per i validatori. La chain è costruita sul Cosmos SDK v0.53.

## Innovazioni principali

### 1. Crittografia post-quantistica

QoreChain utilizza ML-DSA-87 (Dilithium-5) standardizzato dal NIST per le firme digitali, ML-KEM-1024 per l'incapsulamento delle chiavi e SHAKE-256 come hash applicativo predefinito, fornendo sicurezza contro attacchi sia da computer classici sia quantistici. Le firme ibride sono ora **obbligatorie per impostazione predefinita** sul percorso di transazione cosmos: ogni transazione sul percorso cosmos deve portare una firma Dilithium-5 (ML-DSA-87) come estensione della transazione *insieme* alla firma classica secp256k1 (ECDSA). Le transazioni cosmos solo classiche vengono rifiutate — il percorso di downgrade è chiuso (sono esenti solo i gentx del genesis, le transazioni di registrazione/migrazione delle chiavi PQC e un unjail da un account operatore che non ha alcuna chiave registrata). La corsia EVM mantiene la firma standard `eth_secp256k1`, quindi gli strumenti Ethereum firmano senza modifiche, ma dalla v3.2.0 una transazione EVM viene ammessa solo da un account che abbia una chiave ML-DSA-87 registrata e una **finestra di autorizzazione EVM** aperta — un permesso limitato aperto con un messaggio della corsia Cosmos firmato in modalità post-quantistica (vedi [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window)). Una chiave classica da sola non può più spostare fondi sulla corsia EVM. Restano disponibili tre modalità di applicazione controllate dalla governance (disabilitata, opzionale, obbligatoria), ma l'impostazione predefinita attuale della rete è **obbligatoria**. Un framework di agilità algoritmica garantisce che gli schemi di firma possano essere aggiornati tramite proposte di governance man mano che gli standard crittografici evolvono.

### 2. Elaborazione nativa per l'IA

**PRISM** (Policy-driven Reinforcement-learning for Intelligent State Machines) è un livello di reinforcement learning on-chain — una rete di policy PPO a virgola fissa con 73.733 parametri e limiti di sicurezza con circuit breaker — integrato nel ciclo di vita del blocco. Attualmente funziona in modalità osservazione: le reti live registrano osservazioni e ricompense ogni 10 blocchi e non è caricata alcuna policy addestrata, quindi oggi nessun parametro di consenso viene regolato da PRISM. Il rilevamento statistico delle anomalie tramite isolation forest e il risk scoring multidimensionale valutano ogni transazione nella catena dell'ante handler, segnalando pattern fraudolenti prima dell'esecuzione. L'ottimizzazione dinamica delle fee regola le fee di base in base alle condizioni della rete in tempo reale. Tutta l'inferenza IA on-chain è progettata per essere pienamente deterministica tra i validatori — input identici producono output identici, senza alcuna dipendenza da oracoli esterni.

### 3. Runtime a tripla VM

QoreChain è l'unica Layer 1 che esegue nativamente tre macchine virtuali all'interno di un unico consenso:

* **EVM** — Piena compatibilità con Ethereum, con pricing del gas EIP-1559 e JSON-RPC sulla porta 8545. Distribuisci contratti Solidity utilizzando strumenti standard (Hardhat, Foundry, Remix).
* **QoreChain Native** — Smart contract WebAssembly scritti in Rust con pieno supporto del ciclo di vita (instantiate, execute, query, migrate).
* **SVM** — Distribuzione ed esecuzione di programmi BPF con un server JSON-RPC compatibile con Solana sulla porta 8899. I client e gli strumenti Solana esistenti funzionano immediatamente.

Il messaging cross-VM consente a tutti e tre i runtime di comunicare: i contratti EVM chiamano QoreChain Native tramite precompile (una volta attivato quel precompile), i contratti QoreChain Native chiamano EVM tramite messaggi personalizzati e i programmi SVM partecipano tramite bridging asincrono basato su eventi. Oggi solo il runtime EVM accetta transazioni sulle reti live: il caricamento e l'istanziazione di codice QoreChain Native sono disabilitati, la corsia di transazioni SVM è disabilitata, nessun precompile EVM è attivo sulla mainnet (la testnet ne ha tre attivi) e il messaggio di chiamata cross-VM è disattivato sulla mainnet.

### 4. Tokenomics a emissione limitata

Il motore di burn definisce **dodici fonti di burn** (fee di gas, creazione di contratti, fee dei servizi IA, fee del bridge, buyback del treasury, transazioni fallite, penalità xQORE, buyback automatizzato, il burn del TGE, creazione di rollup, traguardi sul numero di transazioni e AMM) che alimentano un modulo centrale di contabilità dei burn; sulla mainnet finora solo i canali delle fee di gas e delle transazioni fallite hanno registrato burn. Tutto ciò che entra nel fee collector viene suddiviso **37% ai validatori, 30% bruciato permanentemente, 20% al treasury, 10% agli staker e 3% ai light node**. La suddivisione si applica sia alle fee di transazione sia all'emissione di epoca. Il design di staking di governance xQORE consente agli utenti di bloccare QOR per un peso di governance raddoppiato, con le penalità di uscita anticipata redistribuite ai possessori rimanenti; le transazioni di lock e unlock non sono ancora collegate alle reti live.

QOR ha un **percorso di offerta finito**: **4.420.000.000 QOR** al genesis (4.500.000.000 QOR pianificati, di cui 80.000.000 QOR sono stati bruciati al token generation event prima del genesis), un'emissione di staking coniata entro un **tetto cumulativo rigido di 590.000.000 QOR** e il motore di burn, che rimuove permanentemente i token. Il modulo `x/inflation` conia una quantità fissa per epoca di 43.200 blocchi (86.000 QOR dalla proposta di governance 10 di ottobre 2026) fino al raggiungimento del tetto, dopodiché le ricompense provengono solo dalle fee di transazione. Consulta [Tokenomics](/architecture/tokenomics#supply-and-emission) per le cifre aggiornate e il programma.

### 5. Connettività cross-chain

QoreChain è progettata per connettersi a un ampio insieme di ecosistemi blockchain tramite due protocolli complementari: IBC nativo e il QoreChain Bridge (QCB). Il livello del bridge definisce **37 configurazioni di chain (36 chain esterne più Injective, raggiunta tramite IBC)** e fino a **8 controparti IBC**. Il livello cross-chain **non è live su nessuna delle due reti**: tutte e 37 le configurazioni di chain sono in stato `pending`, la mainnet non ha alcun canale IBC e la testnet ha un solo canale di test verso una chain di test. Le cifre seguenti descrivono la copertura target.

* **Fino a 8 controparti IBC** — Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon e Injective. Template di relayer preconfigurati con aggiornamenti del client, rilevamento di comportamenti scorretti e clearing automatico dei pacchetti.
* **37 configurazioni di chain QCB (36 chain esterne più Injective tramite IBC)** — ogni endpoint è progettato per includere validazione degli indirizzi per tipo, profondità di conferma configurabile, limiti di volume tramite circuit breaker e attestazioni dei validatori firmate con PQC. Le chain esterne target sono:
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

Cinque profili preimpostati (**defi, gaming, nft, enterprise, custom**) consentono la distribuzione con un clic, con modalità di settlement preconfigurate, block time, scelte di VM, backend DA e modelli di gas. Un router DA nativo fornisce storage di blob con commit SHAKE-256 con retention configurabile e pruning automatico. Il modulo di consenso PRISM fornisce metodi consultivi per la configurazione dei rollup assistita dall'IA. Finora non è stato creato alcun rollup sulle reti live.

### 7. Astrazione degli account e del gas

Gli smart account con tre tipi programmabili (multisig, recupero sociale, basato su sessione) supportano session key con permessi granulari e scadenza, regole di spesa per account e allowlist dei denom. Questo abilita pattern di UX del wallet impossibili con account standard: session key dApp per mobile, recupero sociale come tipo di account di prima classe e limiti di spesa programmabili. Le funzionalità di smart account e di wallet collegati sono implementate ma **disattivate sulla mainnet** (`abstractaccount.enabled = false`) e attive sulla testnet (consulta `GET /qorechain/abstractaccount/v1/config`). L'astrazione del gas è progettata per consentire agli utenti di pagare le fee in un token non nativo accettato (la configurazione elenca `ibc/USDC` e `ibc/ATOM`); nessun canale IBC è ancora aperto, quindi le fee vengono attualmente pagate in QOR.

## Ecosistema

QoreChain viene distribuita con **48 moduli di genesis, 20 dei quali specifici di QoreChain**, che coprono sicurezza (pqc), IA (ai, reputation, rlconsensus), consenso (qca), macchine virtuali (vm, svm, crossvm), tokenomics (burn, xqore, inflation), liquidità (amm), licenze (license), bridge (bridge, babylon, multilayer), estensioni di governance (abstractaccount, fairblock, gasabstraction) e rollup (rdk). Tra le aggiunte recenti figurano `x/amm` per l'AMM / liquidità on-chain e `x/license` per la licenza della chain. La chain segue un'architettura open-core — il livello di protocollo è interamente open source, con estensioni proprietarie opzionali per le distribuzioni enterprise.

## Correlati

* [Panoramica dell'architettura](/introduction/architecture-overview) — come i livelli si integrano end to end.
* [Funzionalità principali](/introduction/key-features) — i punti salienti delle capacità in sintesi.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — il consenso assistito dall'IA al centro del sistema.
* [Tokenomics](/architecture/tokenomics) — offerta, burn, rebase ed emissioni di QOR.
* [Quickstart](/getting-started/quickstart) — avvia un nodo locale e inizia a sviluppare.
