---
slug: /appendix/version-history
title: Cronologia delle versioni
sidebar_label: Cronologia delle versioni
sidebar_position: 3
---

# Cronologia delle versioni

Cronologia pubblica delle versioni di QoreChain. La release più recente è la **v3.1.77**, in esecuzione sulla mainnet **`qorechain-vladi`** (EVM chain ID **9801**, attiva dal 7 giugno 2026). La testnet **`qorechain-diana`** (EVM chain ID **9800**) traccia le build pre-release.

:::note
Le voci seguenti sono riepiloghi ad alto livello delle capacità. Le voci precedenti `v1.x` sono mantenute come registro storico della linea di release di testnet che ha preceduto la mainnet.
:::

---

## v3.1.77 — Release corrente della mainnet

**Focus della release:** accesso REST in sola lettura per i moduli cross-chain e di supply.

* **Endpoint REST del bridge** — Endpoint di query HTTP in sola lettura per il modulo bridge, che espongono lo stato del bridge tramite REST standard in aggiunta a gRPC.
* **Endpoint REST del burn** — Endpoint di query HTTP in sola lettura per il modulo burn, che rendono i dati di distribuzione delle commissioni e di supply interrogabili tramite REST standard.

## v3.1.76 — Modernizzazione della toolchain SVM

**Focus della release:** aggiornamento della compatibilità con la Solana Virtual Machine.

* **Supporto a programmi con toolchain corrente** — Esecuzione SVM modernizzata in modo che i programmi compilati con la toolchain Solana corrente vengano eseguiti sul runtime SVM di QoreChain.

## v3.1.75 — SVM JSON-RPC per impostazione predefinita

**Focus della release:** RPC compatibile con Solana pronto all'uso.

* **JSON-RPC compatibile con Solana** — Il server SVM JSON-RPC è ora abilitato per impostazione predefinita (porta **8899**) e avviato automaticamente con il nodo, fornendo un'interfaccia RPC compatibile con Solana per il tooling SVM.

## v3.1.74 — Preset dei profili di rollup

**Focus della release:** usabilità e settlement del Rollup Development Kit.

* **Applicazione dei preset dei profili** — La creazione di rollup ora applica il preset del profilo selezionato (DeFi, gaming, NFT, enterprise o completamente personalizzato), così i nuovi rollup ereditano valori predefiniti sensati per il loro caso d'uso.
* **Settlement optimistic** — Il percorso di settlement optimistic (invio batch e contestazione) è operativo end to end.

## v3.1.73 — Baseline di hash post-quantistico

**Focus della release:** completamento della baseline crittografica post-quantistica predefinita.

* **SHAKE-256 come hash predefinito** — SHAKE-256 (famiglia SHA-3) è adottato come hash applicativo predefinito, completando la baseline post-quantistica predefinita di firme **ML-DSA-87 (Dilithium-5)**, incapsulamento di chiavi **ML-KEM-1024** e hashing **SHAKE-256**.

## v3.1.72 — Stabilità e manutenzione

**Focus della release:** manutenzione ordinaria di stabilità e della build pipeline.

* **Miglioramenti di stabilità** — Manutenzione interna di stabilità, dipendenze e build pipeline senza modifiche di comportamento visibili esternamente.

## v3.1.71 — Firme ibride PQC applicate per impostazione predefinita

**Focus della release:** sicurezza post-quantistica attiva per impostazione predefinita sul percorso delle transazioni Cosmos.

* **Firme ibride richieste per impostazione predefinita** — Le firme ibride post-quantistiche sono ora applicate per impostazione predefinita sul percorso delle transazioni Cosmos: ogni transazione porta una firma post-quantistica **ML-DSA-87 (Dilithium-5)** insieme alla firma classica **secp256k1**.
* **Applicazione controllata dalla governance** — La modalità di applicazione resta controllata dalla governance, con il valore predefinito impostato su **richiesta**.

## v3.1.70 — Hardening per la produzione

**Focus della release:** hardening per la produzione e ottimizzazione del consenso per la mainnet attiva.

* **Ottimizzazione del consenso PRISM** — Miglioramenti continui al livello di ottimizzazione basato sul reinforcement learning PRISM per la regolazione adattiva dei parametri in condizioni di rete reali, con controlli di sicurezza con circuit breaker.
* **Prestazioni e stabilità** — Affinamenti di throughput, latenza e utilizzo delle risorse su validatori e nodi completi.
* **Tooling operativo** — Migliore ergonomia di monitoraggio, query e operazione dei nodi per gli operatori di mainnet.
* **Allineamento a tokenomics v2.1** — Meccaniche di distribuzione delle commissioni ed emissione allineate al modello economico a offerta fissa ed emissione finita.

## v3.0.0 — Genesis della mainnet

**Focus della release:** lancio della mainnet ed evento di generazione del token.

* **Genesis della mainnet** — La mainnet di QoreChain (`qorechain-vladi`, EVM chain ID 9801) è stata lanciata il **7 giugno 2026**, con l'evento di generazione del token (TGE) al genesis.
* **Suddivisione delle commissioni a cinque vie** — Distribuzione delle commissioni di protocollo tra validatori, burn, treasury, staker e light node (**37 / 30 / 20 / 10 / 3**), aggiungendo una quota dedicata ai light node.
* **AMM on-chain** — Modulo nativo di market maker automatizzato (`x/amm`) per pool di liquidità e swap on-chain.
* **Licenze di chain** — Modulo di licenza on-chain (`x/license`) per registrare e gestire i diritti di protocollo.
* **Paradigmi di settlement consolidati** — Modalità di settlement dell'RDK finalizzate come optimistic, zk, based e sovereign.

## v1.4.0 — Espansione pre-mainnet

**Focus della release:** copertura cross-chain e stabilizzazione della release candidate in vista della mainnet.

* **Copertura cross-chain ampliata** — Connettività IBC e bridge aggiuntiva verso un insieme più ampio di reti esterne.
* **Partecipazione dei light node** — Introdotti i light node e le basi per i loro reward di quota delle commissioni.
* **Hardening della release candidate** — Test estensivi, audit e stabilizzazione su tutti i moduli core in preparazione del genesis della mainnet.

## v1.3.0 — Rollup Development Kit

**Focus della release:** infrastruttura nativa per rollup per deployment di rollup sovrani e a sicurezza condivisa.

* **Modulo x/rdk** — Rollup Development Kit completo con quattro paradigmi di settlement: optimistic, zk, based e sovereign
* **5 profili preimpostati** — Template di rollup preconfigurati per DeFi, gaming, NFT, enterprise e casi d'uso completamente personalizzati
* **Disponibilità dei dati nativa** — Livello DA on-chain con storage dei blob, gestione della conservazione e ciclo di vita di potatura
* **Finalizzazione automatica nell'EndBlocker** — Finalizzazione automatica dei batch alla scadenza della finestra di contestazione, senza intervento dell'operatore
* **Selezione del profilo assistita dall'AI** — Query `suggest-profile` che raccomanda una configurazione di rollup ottimale in base al caso d'uso previsto
* **Integrazione multilayer** — I rollup si registrano come livelli nell'architettura multilayer, ereditando le meccaniche di routing, ancoraggio e contestazione
* **Ciclo di vita dell'escrow bank** — Lo stake dell'operatore è tenuto in escrow durante l'operazione del rollup e rilasciato al termine pulito o confiscato in caso di slashing

## v1.2.0 — IBC e bridge

**Focus della release:** connettività cross-chain e astrazioni di account avanzate.

* **25 connessioni cross-chain** — 8 canali IBC e 17 connessioni QoreChain Bridge (QCB) verso reti esterne
* **Modulo x/babylon** — Integrazione di restaking BTC che consente ai detentori di Bitcoin di partecipare alla sicurezza dello staking di QoreChain
* **Modulo x/abstractaccount** — Framework di smart account con regole di spesa programmabili, session key e logica di autenticazione personalizzata
* **Modulo x/fairblock** — Threshold Identity-Based Encryption (tIBE) per la cifratura delle transazioni resistente al MEV
* **Modulo x/gasabstraction** — Pagamento del gas multi-token che supporta QOR nativo, USDC trasferito via IBC e ATOM trasferito via IBC
* **Prioritizzazione delle TX su 5 corsie** — Corsie di transazione ordinate per priorità: sistema, governance, staking, bridge e generale
* **Configurazioni dei relayer IBC** — Setup di relayer preconfigurati per tutti i canali IBC supportati
* **Integrazione bridge-to-burn** — Le commissioni del bridge sono instradate attraverso la distribuzione delle commissioni del modulo burn

## v1.1.0 — Firme ibride PQC

**Focus della release:** sicurezza crittografica post-quantistica e agilità degli algoritmi.

* **Doppie firme secp256k1 (ECDSA) + ML-DSA-87** — Ogni transazione porta sia una firma classica sia una post-quantistica, verificate nella catena dell'AnteHandler
* **3 modalità di applicazione** — Applicazione configurabile delle firme ibride: off (modalità 0), permissiva (modalità 1, PQC opzionale), obbligatoria (modalità 2, PQC richiesta)
* **Auto-registrazione** — Le chiavi pubbliche PQC vengono registrate automaticamente alla prima transazione ibrida, eliminando un passaggio di registrazione separato
* **Fondamento di hash SHAKE-256** — Tutte le operazioni di hashing relative alla PQC usano SHAKE-256 (famiglia SHA-3) per la derivazione degli indirizzi resistente ai quanti
* **Interfacce di attestazione TEE** — Supporto all'attestazione del Trusted Execution Environment per provare l'integrità della generazione delle chiavi PQC
* **Framework di agilità degli algoritmi** — Registry degli algoritmi modulare che consente di aggiungere futuri algoritmi PQC tramite governance senza un upgrade della chain

## v1.0.0 — Genesis (motore di tokenomics)

**Focus della release:** lancio iniziale del protocollo con tokenomics completa, esecuzione multi-VM e operazioni assistite dall'AI.

* **Modulo x/burn** — Meccanismo di burn delle commissioni multi-canale con una distribuzione a quattro vie tra validatori, burn, treasury e staker
* **Modulo x/xqore** — Derivato di staking di governance con penali per sblocco anticipato a livelli e redistribuzione PvP rebase
* **Modulo x/inflation** — Emissione basata su epoche con decadimento annuale, governata dal modello economico a emissione finita
* **Livello di consenso PRISM** — Ottimizzazione basata sul reinforcement learning (PPO) per la regolazione dinamica dei parametri della chain con controlli di sicurezza con circuit breaker
* **CPoS a tripla pool** — Classified Proof-of-Stake con i pool di validatori Emerald, Sapphire e Ruby ponderati per punteggi di reputazione
* **Governance QDRW** — Sistema di Ponderazione Dinamica dei Reward che consente aggiustamenti approvati dalla governance alla distribuzione dei reward tra i pool
* **Runtime EVM + CosmWasm + SVM** — Tre ambienti di esecuzione concorrenti: il QoreChain EVM Engine, gli smart contract CosmWasm e la Solana Virtual Machine
* **Bridge cross-VM** — Scambio di messaggi e trasferimenti di asset tra i runtime EVM, CosmWasm e SVM all'interno di un singolo blocco
* **Crittografia post-quantistica** — Firma resistente ai quanti supportata da una libreria PQC ad alte prestazioni
* **QCAI** — Analisi euristica on-chain con un sidecar off-chain opzionale per il rilevamento di frodi, la stima delle commissioni e l'ottimizzazione della rete
* **Deployment containerizzato** — Deployment completo di testnet multi-validatore con servizio sidecar e indicizzatore di blocchi
* **Indicizzatore di blocchi** — Listener di blocchi con storage persistente per query storiche e analisi
