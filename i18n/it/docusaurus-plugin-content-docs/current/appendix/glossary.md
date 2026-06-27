---
slug: /appendix/glossary
title: Glossario
sidebar_label: Glossario
sidebar_position: 1
---

# Glossario

Riferimento alfabetico dei termini, abbreviazioni e acronimi utilizzati in tutta la documentazione di QoreChain.

---

**AMM** — Automated Market Maker (market maker automatizzato). Il modulo di liquidità on-chain nativo di QoreChain (`x/amm`) che fornisce pool a prodotto costante, swap e provisioning di liquidità direttamente a livello di protocollo, senza un deployment esterno di smart contract. Vedi [AMM](/architecture/amm).

**BPF** — Berkeley Packet Filter. Il formato bytecode usato dal runtime SVM per eseguire i programmi on-chain. I programmi vengono compilati in BPF prima del deployment.

**Chain License** — Un record di licenza on-chain gestito dal modulo `x/license`. Le chain license regolano l'accesso a specifiche capacità del protocollo e consentono agli operatori di registrare, verificare e gestire i diritti di licenza on-chain. Vedi [Licenze di chain](/architecture/chain-licensing).

**CLFB** — Cross-Layer Fee Balancing (bilanciamento delle commissioni tra livelli). Un meccanismo all'interno dell'architettura multilayer che regola dinamicamente le commissioni tra sidechain e paychain per mantenere l'equilibrio e prevenire la congestione su un singolo livello.

**CPI** — Cross-Program Invocation (invocazione tra programmi). Un meccanismo nel runtime SVM che consente a un programma distribuito di chiamare un altro programma all'interno dello stesso contesto di transazione.

**CPoS** — Classified Proof-of-Stake (proof-of-stake classificato). Il sistema di classificazione del consenso di QoreChain che raggruppa i validatori in tre pool (Emerald, Sapphire, Ruby) in base ai punteggi di reputazione. Ogni pool ha pesi distinti nell'algoritmo di selezione del proposer.

**DA** — Data Availability (disponibilità dei dati). La garanzia che i dati di transazione pubblicati sulla chain possano essere recuperati da qualsiasi nodo. Il modulo RDK fornisce DA nativa per i rollup, memorizzando i blob on-chain con periodi di conservazione configurabili.

**DPoS** — Delegated Proof-of-Stake (proof-of-stake delegato). Un meccanismo di consenso in cui i detentori di token delegano il proprio stake ai validatori che producono blocchi per loro conto. QoreChain estende il DPoS con una classificazione ponderata sulla reputazione (CPoS).

**EIP-1559** — Ethereum Improvement Proposal 1559. Un modello di commissione di transazione che usa una base fee (bruciata) più una priority fee (pagata ai validatori). QoreChain implementa una meccanica di commissioni in stile EIP-1559 nel suo QoreChain EVM Engine.

**HCS** — Hybrid Cryptographic Signatures (firme crittografiche ibride). Il sistema di doppia firma di QoreChain in cui le transazioni portano sia una firma classica (secp256k1/ECDSA) sia una firma post-quantistica (ML-DSA-87), fornendo sicurezza crittografica contro avversari sia classici sia quantistici.

**IBC** — Inter-Blockchain Communication (comunicazione tra blockchain). Un protocollo per lo scambio autenticato di messaggi tra blockchain indipendenti. QoreChain supporta i canali IBC per i trasferimenti di token cross-chain e il relay di dati.

**Light Node** — Un nodo a basso consumo di risorse che segue la chain e serve query leggere senza mantenere lo stato completo. I light node ricevono una quota dedicata del **3%** della suddivisione delle commissioni di protocollo, premiando i partecipanti che estendono la raggiungibilità della rete. Vedi [Light Node](/light-node/overview).

**MEV** — Maximal Extractable Value (valore massimo estraibile). Il profitto che può essere ottenuto riordinando, inserendo o censurando transazioni all'interno di un blocco. Il modulo FairBlock di QoreChain (cifratura tIBE) e la prioritizzazione delle TX su 5 corsie mitigano l'estrazione di MEV.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (livello di sicurezza 5). Lo schema di firma digitale post-quantistico standardizzato dal NIST usato da QoreChain per la firma di transazioni resistente ai quanti. Produce firme di 4.627 byte con chiavi pubbliche di 2.592 byte.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (livello di sicurezza 5). Uno schema di incapsulamento di chiavi post-quantistico standardizzato dal NIST disponibile nel registry degli algoritmi PQC di QoreChain per futuri canali di comunicazione cifrati.

**MLP** — Multi-Layer Perceptron (percettrone multistrato). Una classe di rete neurale usata da QCAI per il riconoscimento di pattern nel rilevamento di frodi e nello scoring di anomalie.

**PPO** — Proximal Policy Optimization. Un algoritmo di reinforcement learning usato da PRISM per ottimizzare i parametri della chain (dimensione dei blocchi, limiti di gas, dimensione del set di validatori) in base alle condizioni di rete osservate.

**PQC** — Post-Quantum Cryptography (crittografia post-quantistica). Algoritmi crittografici progettati per essere sicuri contro attacchi sia da computer classici sia da computer quantistici. QoreChain implementa la PQC tramite il suo modulo `x/pqc` con ML-DSA-87 come schema di firma primario.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. Il livello di ottimizzazione basato sul reinforcement learning incorporato nel Consensus Engine di QoreChain (tramite il modulo `x/rlconsensus`). PRISM osserva le metriche di rete e propone aggiustamenti deterministici dei parametri di consenso sotto controlli di sicurezza con circuit breaker. Vedi [PRISM Consensus Engine](/architecture/prism-consensus-engine).

**PvP Rebase** — Player versus Player Rebase. Un meccanismo nel modulo xQORE in cui le penali dagli sblocchi anticipati vengono redistribuite proporzionalmente agli staker che restano bloccati, premiando l'impegno a lungo termine.

**QCAI** — QoreChain Artificial Intelligence. Il termine ombrello per il sottosistema di AI di QoreChain, che include il motore euristico on-chain (modulo `x/ai`) e il sidecar QCAI off-chain che fornisce capacità di inferenza avanzate.

**QCB** — QoreChain Bridge. Il protocollo di bridge nativo di QoreChain per connettersi a chain non IBC (ad es. Ethereum, Bitcoin, Solana, Avalanche). QCB usa un set di validatori federato per l'attestazione cross-chain. Vedi [Architettura del bridge](/architecture/bridge-architecture).

**QDRW** — QoreChain Dynamic Reward Weighting (ponderazione dinamica dei reward). Un meccanismo di governance che consente a PRISM (con approvazione della governance) di regolare dinamicamente i pesi di distribuzione dei reward tra i pool di validatori, ottimizzando per le metriche di salute della rete.

**RDK** — Rollup Development Kit. Il framework nativo di QoreChain per il deployment e la gestione di rollup con quattro paradigmi di settlement (optimistic, zk, based, sovereign), cinque profili preimpostati e disponibilità dei dati integrata. Vedi [Panoramica dei rollup](/rollups/overview).

**RL** — Reinforcement Learning (apprendimento per rinforzo). Un approccio di machine learning in cui un agente apprende le azioni ottimali attraverso tentativi e ricompense. PRISM usa l'RL per regolare dinamicamente i parametri della chain all'interno del Consensus Engine di QoreChain.

**RPoS** — Reputation-based Proof-of-Stake (proof-of-stake basato sulla reputazione). Il modello di consenso complessivo che combina la delega DPoS con lo scoring di reputazione. I validatori guadagnano reputazione attraverso uptime, partecipazione e contributi alla comunità, che influenzano la frequenza di proposta dei loro blocchi.

**SHAKE-256** — Una funzione di hash con lunghezza di output variabile della famiglia SHA-3. QoreChain usa SHAKE-256 come funzione di hash fondamentale per le operazioni relative alla PQC, inclusa la derivazione delle chiavi e il calcolo degli indirizzi.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Un tipo di prova a conoscenza zero che può essere verificata rapidamente con una dimensione di prova ridotta. Supportato come paradigma di settlement nel modulo RDK per gli zk-rollup.

**STARK** — Scalable Transparent Argument of Knowledge. Un sistema di prova a conoscenza zero che non richiede un trusted setup ed è resistente ai quanti. Disponibile come sistema di prova alternativo per il settlement degli zk-rollup nell'RDK.

**SVM** — Solana Virtual Machine. Un ambiente di esecuzione ad alte prestazioni per programmi BPF. QoreChain integra la SVM come uno dei tre runtime supportati insieme al QoreChain EVM Engine e a CosmWasm.

**TEE** — Trusted Execution Environment (ambiente di esecuzione fidato). Un'area sicura di un processore che garantisce che codice e dati siano protetti dall'accesso esterno. Il modulo PQC di QoreChain supporta l'attestazione TEE per le prove di generazione delle chiavi.

**tIBE** — Threshold Identity-Based Encryption (cifratura basata sull'identità a soglia). Uno schema crittografico in cui un messaggio può essere decifrato solo quando una soglia di parti collabora. Usato dal modulo FairBlock per cifrare i contenuti delle transazioni fino alla finalizzazione del blocco, prevenendo l'estrazione di MEV.

**uqor** — La denominazione base del token QOR. 1 QOR = 1.000.000 uqor (10^6). Tutti gli importi, le commissioni e i valori di staking on-chain sono denominati in uqor.

**xQORE** — Il derivato di staking di governance del QOR. Gli utenti bloccano QOR per ricevere xQORE, che conferisce un potere di voto di governance potenziato e guadagna reward PvP rebase dalle penali per sblocco anticipato. Vedi [Tokenomics](/architecture/tokenomics).
