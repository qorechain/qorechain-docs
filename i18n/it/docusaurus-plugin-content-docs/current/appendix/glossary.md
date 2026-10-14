---
slug: /appendix/glossary
title: Glossario
sidebar_label: Glossario
sidebar_position: 1
---

# Glossario

Riferimento alfabetico dei termini, abbreviazioni e acronimi utilizzati in tutta la documentazione di QoreChain.

---

**AMM** — Automated Market Maker (market maker automatizzato). Il modulo di liquidità on-chain nativo di QoreChain (`x/amm`) che fornisce pool a prodotto costante, swap e provisioning di liquidità direttamente a livello di protocollo, senza un deployment di smart contract esterno. Vedi [AMM](/architecture/amm).

**Authorisation window (EVM)** (finestra di autorizzazione EVM) — Un'autorizzazione delimitata (blocchi, numero di transazioni, valore totale), aperta con un messaggio della lane Cosmos firmato in modo post-quantistico, entro cui una transazione della lane EVM deve rientrare dalla v3.2.0. Vedi [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).

**BPF** — Berkeley Packet Filter. Il formato bytecode usato dal runtime SVM per eseguire i programmi on-chain. I programmi vengono compilati in BPF prima del deployment.

**Chain License** — Un record di licenza on-chain gestito dal modulo `x/license`. Le chain license regolano l'accesso a specifiche capacità del protocollo e consentono agli operatori di registrare, verificare e gestire i diritti di licenza on-chain. Vedi [Licenze della chain](/architecture/chain-licensing).

**Circuit breaker** — Il meccanismo del Cosmos SDK che disattiva singoli tipi di messaggio a livello di rete; l'elenco attuale è consultabile su `/cosmos/circuit/v1/disable_list`. Vedi [Parametri della chain](/appendix/chain-parameters#circuit-breaker).

**CLFB** — Cross-Layer Fee Bundling (raggruppamento delle commissioni tra livelli). Un unico pagamento di commissione sul livello di origine che copre l'esecuzione sui livelli di un percorso cross-layer (il parametro `cross_layer_fee_bundling` di `x/multilayer`). Vedi [Architettura multilayer](/architecture/multilayer-architecture).

**CPI** — Cross-Program Invocation (invocazione tra programmi). Un meccanismo nel runtime SVM che consente a un programma distribuito di chiamare un altro programma all'interno dello stesso contesto di transazione.

**CPoS** — Composite Proof-of-Stake (proof-of-stake composito). Il design di classificazione del consenso di QoreChain che raggruppa i validatori in tre pool (RPoS, DPoS, PoS) in base a reputazione e delega. Ogni pool ha pesi distinti nell'algoritmo di selezione del proposer. Implementato in `x/qca` ma non ancora attivo nella produzione dei blocchi.

**DA** — Data Availability (disponibilità dei dati). La garanzia che i dati di transazione pubblicati sulla chain possano essere recuperati da qualsiasi nodo. Il modulo RDK fornisce DA nativa per i rollup, memorizzando i blob on-chain con periodi di conservazione configurabili.

**DPoS** — Delegated Proof-of-Stake (proof-of-stake delegato). Un meccanismo di consenso in cui i detentori di token delegano il proprio stake ai validatori che producono blocchi per loro conto.

**EIP-1559** — Ethereum Improvement Proposal 1559. Un modello di commissione di transazione che usa una base fee (bruciata) più una priority fee (pagata ai validatori). QoreChain implementa una meccanica di commissioni in stile EIP-1559 nel suo QoreChain EVM Engine.

**HCS** — Hierarchical Commitment Schemes (schemi di impegno gerarchici). Il meccanismo con cui sidechain, paychain e rollup ancorano periodicamente le proprie state root alla chain principale (vedi Architettura multilayer). Da non confondere con lo schema di firma ibrido secp256k1 + ML-DSA-87, che questa documentazione chiama *firma ibrida*.

**Hybrid sign-bytes v2** (sign-bytes ibridi v2) — I byte con tag di dominio e vincolati alla chain che la chiave ML-DSA firma dalla v3.2.0. Vedi [Sicurezza post-quantistica](/architecture/post-quantum-security#sign-bytes-v2).

**IBC** — Inter-Blockchain Communication (comunicazione tra blockchain). Un protocollo per lo scambio autenticato di messaggi tra blockchain indipendenti. QoreChain supporta i canali IBC per i trasferimenti di token cross-chain e il relay di dati.

**Light Node** — Un client a basso consumo di risorse che segue la chain confrontando gli header dei blocchi con uno o più endpoint RPC, senza mantenere lo stato completo. Non serve query ad altri. La suddivisione delle commissioni di protocollo riserva una quota del **3%** al programma di ricompense dei light node, che non è ancora aperto alla registrazione. Vedi [Light Node](/light-node/overview) e lo [stato del programma di ricompense](/light-node/overview#reward-program-status).

**MEV** — Maximal Extractable Value (valore massimo estraibile). Il profitto che può essere ottenuto riordinando, inserendo o censurando transazioni all'interno di un blocco. Il modulo FairBlock di QoreChain (cifratura tIBE) è progettato per mitigare l'estrazione di MEV; non è ancora abilitato.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (livello di sicurezza 5). Lo schema di firma digitale post-quantistico standardizzato dal NIST usato da QoreChain per la firma di transazioni resistente ai quanti. Produce firme di 4.627 byte con chiavi pubbliche di 2.592 byte.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (livello di sicurezza 5). Uno schema di incapsulamento di chiavi post-quantistico standardizzato dal NIST disponibile nel registry degli algoritmi PQC di QoreChain per futuri canali di comunicazione cifrati.

**MLP** — Multi-Layer Perceptron (percettrone multistrato). Una classe di rete neurale usata da QCAI per il riconoscimento di pattern nel rilevamento di frodi e nello scoring di anomalie.

**PPO** — Proximal Policy Optimization. Un algoritmo di reinforcement learning usato da PRISM per ottimizzare i parametri della chain (tempo di blocco, prezzo del gas, pesi dei pool; la dimensione del set di validatori viene solo registrata nei log) in base alle condizioni di rete osservate. Sulle reti live non è caricata alcuna policy addestrata.

**PQC** — Post-Quantum Cryptography (crittografia post-quantistica). Algoritmi crittografici progettati per essere sicuri contro attacchi sia da computer classici sia da computer quantistici. QoreChain implementa la PQC tramite il suo modulo `x/pqc` con ML-DSA-87 come schema di firma principale.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. Il livello di ottimizzazione basato sul reinforcement learning incorporato nel Consensus Engine di QoreChain (tramite il modulo `x/rlconsensus`). PRISM osserva le metriche di rete ed è progettato per proporre aggiustamenti deterministici dei parametri di consenso sotto controlli di sicurezza di tipo circuit breaker; oggi funziona in modalità di osservazione. Vedi [PRISM Consensus Engine](/architecture/prism-consensus-engine).

**Protocol feature** (funzionalità di protocollo) — Un interruttore di comportamento che l'upgrade handler di una release attiva a una determinata altezza di blocco su ogni nodo (ad esempio `pqc-sign-bytes-v2`, `evm-pqc-authorisation-window`), in modo che la cronologia venga rieseguita invariata al di sotto di quell'altezza.

**PvP Rebase** — Player versus Player Rebase. Un meccanismo nel modulo xQORE in cui le penali dagli sblocchi anticipati vengono redistribuite proporzionalmente agli staker che restano bloccati, premiando l'impegno a lungo termine (non ancora collegato on-chain).

**QCAI** — QoreChain Artificial Intelligence. Il termine ombrello per il sottosistema di AI di QoreChain, che include il motore euristico on-chain (modulo `x/ai`) e il sidecar QCAI off-chain che fornisce capacità di inferenza avanzate.

**QCB** — QoreChain Bridge. Il protocollo di bridge nativo di QoreChain per connettersi a chain non IBC (ad es. Ethereum, Bitcoin, Solana, Avalanche). QCB usa una soglia di attestazione dei validatori (7 firme ML-DSA-87 su 10) per l'attestazione cross-chain. Vedi [Architettura del bridge](/architecture/bridge-architecture).

**QDRW** — Quadratic Delegation with Reputation Weighting (delega quadratica con ponderazione della reputazione). Una formula del potere di voto di governance (radice quadrata dello stake più xQORE ponderato, scalata da un moltiplicatore di reputazione). Implementata in `x/qca` ma disabilitata sulle reti live (`qdrw_enabled = false`).

**RDK** — Rollup Development Kit. Il framework nativo di QoreChain per il deployment e la gestione di rollup con quattro paradigmi di settlement (optimistic, zk, based, sovereign), cinque profili preimpostati e disponibilità dei dati integrata. Vedi [Panoramica dei Rollup](/rollups/overview).

**RL** — Reinforcement Learning (apprendimento per rinforzo). Un approccio di machine learning in cui un agente apprende le azioni ottimali per tentativi e ricompense. PRISM è progettato per usare l'RL per regolare i parametri della chain all'interno del Consensus Engine di QoreChain (oggi solo osservazione).

**RPoS** — Reputation Proof-of-Stake (proof-of-stake di reputazione). Il pool dei validatori al 70° percentile di reputazione o oltre, con almeno lo stake auto-vincolato mediano. I validatori guadagnano reputazione tramite uptime, partecipazione e contributi alla community.

**SHAKE-256** — Una funzione hash a lunghezza di output variabile della famiglia SHA-3. SHAKE-256 è l'hash predefinito dell'applicazione di QoreChain (il pacchetto `qorehash`) ed è usato per operazioni legate alla PQC come la derivazione di chiavi.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Un tipo di prova a conoscenza zero che può essere verificata rapidamente con una prova di piccole dimensioni. Supportato come paradigma di settlement nel modulo RDK per gli zk-rollup.

**STARK** — Scalable Transparent Argument of Knowledge. Un sistema di prove a conoscenza zero che non richiede un trusted setup ed è resistente ai quanti. Disponibile come sistema di prova alternativo per il settlement degli zk-rollup nell'RDK.

**Stranded staker share / reward-pool reserve** (quota di staker bloccata / riserva del pool di ricompense) — Importi registrati all'upgrade v3.2.0 che si muovono solo tramite voto di governance. Vedi [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

**SVM** — Solana Virtual Machine. Un ambiente di esecuzione ad alte prestazioni per i programmi BPF. QoreChain integra la SVM come uno dei tre runtime supportati insieme al QoreChain EVM Engine e a CosmWasm.

**TEE** — Trusted Execution Environment (ambiente di esecuzione fidato). Un'area sicura di un processore che garantisce che codice e dati siano protetti dall'accesso esterno. QoreChain definisce specifiche di interfaccia per l'attestazione TEE; non esiste ancora alcuna implementazione.

**tIBE** — Threshold Identity-Based Encryption (cifratura a soglia basata sull'identità). Uno schema crittografico in cui un messaggio può essere decifrato solo quando una soglia di parti collabora. Usato dal modulo FairBlock per cifrare il contenuto delle transazioni fino alla finalizzazione del blocco, impedendo l'estrazione di MEV.

**uqor** — La denominazione base del token QOR. 1 QOR = 1.000.000 uqor (10^6). Tutti gli importi on-chain, le commissioni e i valori di staking sono espressi in uqor.

**xQORE** — Il derivato di staking di governance di QOR. Gli utenti bloccano QOR per ricevere xQORE, che concede un potere di voto di governance maggiorato e ottiene ricompense di rebase PvP dalle penali di sblocco anticipato (comportamento previsto; le transazioni di lock e unlock non sono ancora collegate on-chain). Vedi [Tokenomics](/architecture/tokenomics#x-xqore).
