---
slug: /appendix/version-history
title: Cronologia delle Versioni
sidebar_label: Cronologia delle Versioni
sidebar_position: 3
---

# Cronologia delle Versioni

Cronologia pubblica delle versioni di QoreChain. L'ultima release è la **v3.1.80**, in esecuzione sulla mainnet **`qorechain-vladi`** (EVM chain ID **9801**, attiva dal 7 giugno 2026). La testnet **`qorechain-diana`** (EVM chain ID **9800**) traccia le build pre-release.

:::note
Le voci sottostanti sono riepiloghi di alto livello delle capacità. Le voci `v1.x` precedenti sono conservate come documentazione storica della linea di release testnet che ha preceduto la mainnet.
:::

---

## v3.1.80 — Query degli Anchor di Stato Multilayer (Release Mainnet Corrente)

**Focus della release:** Anchor di settlement leggibili e verificabili offline per i rollup.

* **Query di lettura degli anchor** — Il servizio di query `x/multilayer` ora espone `Anchor` (l'ultimo anchor di stato per un layer) e `Anchors` (la cronologia degli anchor di un layer), così i client possono recuperare l'anchor di settlement di un layer e verificarlo in modo indipendente.
* **Gateway REST per multilayer** — Ogni query multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) è ora disponibile via REST oltre che via gRPC.
* **Ricevute di settlement quantum-safe sbloccate** — Ogni anchor porta una firma **ML-DSA-87 (Dilithium-5)** sui propri campi canonici, fornendo la base on-chain per la verifica offline delle ricevute di settlement del Rollup Development Kit.

## v3.1.79 — Auto-Provisioning dei Validatori per le Reti Bridge

**Focus della release:** Partecipazione chiavi in mano sulle reti connesse per i validatori in possesso di licenza.

* **Framework dei driver di rete** — Un framework di driver dichiarativo consente a un validatore QoreChain che detiene la licenza `validator_<chain>` (o `qcb_bridge`) pertinente di avere il client della rete esterna corrispondente sottoposto a provisioning, configurato ed eseguito sullo stesso nodo sotto l'orchestrazione di QoreChain — solo dopo che la licenza è stata attivata.
* **Driver per tutte le 37 reti bridge** — La copertura spazia su ogni rete connessa, classificata per modello di partecipazione (validatore permissionless, capped/elected/admission, full-node L2 e ruoli non-staking/trust-list). Lo stake e le chiavi di firma della rete esterna restano forniti dall'operatore per ciascuna rete; QoreChain fornisce il framework e il gate della licenza imposto.

## v3.1.78 — Prontezza Pre-Deploy

**Focus della release:** Wallet, bridge, IBC e licensing funzionano tutti al lancio — senza governance post-deploy.

* **Attivazione bridge post-deploy trustless** — Una chiave `bridge_admin` (o un titolare di licenza `qcb_bridge`) può attivare il bridge di qualsiasi chain connessa con una singola transazione firmata (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — impostando indirizzo del contratto, conferme, architettura, stato, il verifier attivo e il trust root del verifier — senza alcuna proposta di governance o upgrade della chain.
* **Gate della licenza validatore-rete** — L'orchestratore ora impone la licenza `validator_<chain>` / `qcb_bridge` (fail-closed) prima di avviare qualsiasi client di rete esterna.
* **Pacchetti di integrazione wallet** — `@qorechain/wallet-adapter` e `@qorechain/connect` pubblicati su npm (v0.1.0), aggiungendo la registrazione della rete MetaMask con una sola chiamata (EIP-3085, QOR nativo a **18 decimali** sul rail EVM) e la configurazione del prezzo del gas di Keplr.
* **Relayer IBC chiavi in mano** — Configurazione del relayer pronta all'uso e strumenti di channel-bootstrap per le otto controparti IBC, così i channel si attivano post-deploy senza setup su misura.

## v3.1.77 — Endpoint REST di Bridge e Burn

**Focus della release:** Accesso REST in sola lettura per i moduli cross-chain e di supply.

* **Endpoint REST del bridge** — Endpoint di query HTTP in sola lettura per il modulo bridge, che espongono lo stato del bridge via REST standard oltre che via gRPC.
* **Endpoint REST del burn** — Endpoint di query HTTP in sola lettura per il modulo burn, che rendono interrogabili via REST standard i dati di distribuzione delle fee e di supply.

## v3.1.76 — Modernizzazione della Toolchain SVM

**Focus della release:** Aggiornamento della compatibilità con la Solana Virtual Machine.

* **Supporto dei programmi della toolchain corrente** — Esecuzione SVM modernizzata così che i programmi compilati con la toolchain Solana corrente girino sul runtime SVM di QoreChain.

## v3.1.75 — SVM JSON-RPC per Default

**Focus della release:** RPC compatibile con Solana pronto all'uso.

* **JSON-RPC compatibile con Solana** — Il server SVM JSON-RPC è ora abilitato per default (porta **8899**) e avviato automaticamente con il nodo, fornendo un'interfaccia RPC compatibile con Solana per il tooling SVM.

## v3.1.74 — Preset di Profilo dei Rollup

**Focus della release:** Usabilità e settlement del Rollup Development Kit.

* **Applicazione dei preset di profilo** — La creazione del rollup ora applica il preset del profilo selezionato (DeFi, gaming, NFT, enterprise o completamente personalizzato), così i nuovi rollup ereditano impostazioni predefinite sensate per il loro caso d'uso.
* **Settlement ottimistico** — Il percorso di settlement ottimistico (invio batch e challenge) è operativo end to end.

## v3.1.73 — Baseline dell'Hash Post-Quantum

**Focus della release:** Completamento della baseline crittografica post-quantum di default.

* **Hash di default SHAKE-256** — SHAKE-256 (famiglia SHA-3) è adottato come hash applicativo di default, completando la baseline post-quantum di default composta da firme **ML-DSA-87 (Dilithium-5)**, key encapsulation **ML-KEM-1024** e hashing **SHAKE-256**.

## v3.1.72 — Stabilità e Manutenzione

**Focus della release:** Stabilità di routine e manutenzione della build-pipeline.

* **Miglioramenti della stabilità** — Manutenzione interna di stabilità, dipendenze e build-pipeline senza modifiche di comportamento visibili esternamente.

## v3.1.71 — Firme Ibride PQC Imposte per Default

**Focus della release:** Sicurezza post-quantum attiva per default sul percorso delle transazioni Cosmos.

* **Firme ibride richieste per default** — Le firme ibride post-quantum sono ora imposte per default sul percorso delle transazioni Cosmos: ogni transazione porta una firma post-quantum **ML-DSA-87 (Dilithium-5)** insieme alla firma classica **secp256k1**.
* **Imposizione controllata dalla governance** — La modalità di imposizione resta controllata dalla governance, con il default impostato su **required**.

## v3.1.70 — Hardening di Produzione

**Focus della release:** Hardening di produzione e ottimizzazione del consenso per la mainnet live.

* **Ottimizzazione del consenso PRISM** — Miglioramenti continui al livello di ottimizzazione a reinforcement learning di PRISM per il tuning adattivo dei parametri in condizioni di rete live, con controlli di sicurezza circuit-breaker.
* **Prestazioni e stabilità** — Affinamenti di throughput, latenza e utilizzo delle risorse su validatori e full node.
* **Strumenti operativi** — Migliorata l'ergonomia di monitoraggio, query e operazione dei nodi per gli operatori della mainnet.
* **Allineamento Tokenomics v2.1** — Distribuzione delle fee e meccaniche di emissione allineate al modello economico a supply fissa ed emissione finita.

## v3.0.0 — Genesis della Mainnet

**Focus della release:** Lancio della mainnet ed evento di generazione del token.

* **Genesis della mainnet** — La mainnet di QoreChain (`qorechain-vladi`, EVM chain ID 9801) è stata lanciata il **7 giugno 2026**, con l'evento di generazione del token (TGE) al genesis.
* **Suddivisione delle fee a cinque vie** — Distribuzione delle fee di protocollo tra validatori, burn, treasury, staker e light node (**37 / 30 / 20 / 10 / 3**), aggiungendo una quota dedicata ai light node.
* **AMM on-chain** — Modulo automated-market-maker nativo (`x/amm`) per pool di liquidità e swap on-chain.
* **Licensing della chain** — Modulo di licenza on-chain (`x/license`) per registrare e gestire i diritti di protocollo.
* **Paradigmi di settlement rafforzati** — Modalità di settlement RDK finalizzate come optimistic, zk, based e sovereign.

## v1.4.0 — Espansione Pre-Mainnet

**Focus della release:** Copertura cross-chain e stabilizzazione release-candidate in vista della mainnet.

* **Copertura cross-chain ampliata** — Ulteriore connettività IBC e bridge verso un insieme più ampio di reti esterne.
* **Partecipazione dei light node** — Introdotti i light node e le basi per le loro ricompense fee-share.
* **Hardening della release-candidate** — Test approfonditi, audit e stabilizzazione su tutti i moduli core in preparazione del genesis della mainnet.

## v1.3.0 — Rollup Development Kit

**Focus della release:** Infrastruttura di rollup nativa per deployment di rollup sovereign e a sicurezza condivisa.

* **Modulo x/rdk** — Rollup Development Kit completo con quattro paradigmi di settlement: optimistic, zk, based e sovereign
* **5 profili preset** — Template di rollup preconfigurati per casi d'uso DeFi, gaming, NFT, enterprise e completamente personalizzati
* **Data availability nativa** — Livello DA on-chain con blob storage, gestione della retention e ciclo di vita del pruning
* **Auto-finalizzazione EndBlocker** — Finalizzazione automatica del batch alla scadenza della finestra di challenge, senza alcun intervento dell'operatore
* **Selezione del profilo assistita da AI** — Query `suggest-profile` che raccomanda una configurazione di rollup ottimale in base al caso d'uso previsto
* **Integrazione multilayer** — I rollup si registrano come layer nell'architettura multilayer, ereditando le meccaniche di routing, anchoring e challenge
* **Ciclo di vita dell'escrow bancario** — Lo stake dell'operatore è tenuto in escrow durante l'operazione del rollup e rilasciato a chiusura pulita o confiscato in caso di slashing

## v1.2.0 — IBC e Bridge

**Focus della release:** Connettività cross-chain e astrazioni avanzate degli account.

* **25 connessioni cross-chain** — 8 channel IBC e 17 connessioni QoreChain Bridge (QCB) verso reti esterne
* **Modulo x/babylon** — Integrazione di restaking BTC che consente ai detentori di Bitcoin di partecipare alla sicurezza dello staking di QoreChain
* **Modulo x/abstractaccount** — Framework di smart account con regole di spesa programmabili, session key e logica di autenticazione personalizzata
* **Modulo x/fairblock** — Threshold Identity-Based Encryption (tIBE) per la cifratura delle transazioni resistente al MEV
* **Modulo x/gasabstraction** — Pagamento del gas multi-token con supporto per QOR nativo, USDC bridged via IBC e ATOM bridged via IBC
* **Prioritizzazione delle TX a 5 corsie** — Corsie di transazione ordinate per priorità: system, governance, staking, bridge e general
* **Configurazioni del relayer IBC** — Setup del relayer preconfigurati per tutti i channel IBC supportati
* **Integrazione bridge-to-burn** — Le fee del bridge sono instradate attraverso la distribuzione delle fee del modulo burn

## v1.1.0 — Firme Ibride PQC

**Focus della release:** Sicurezza crittografica post-quantum e agilità degli algoritmi.

* **Doppie firme secp256k1 (ECDSA) + ML-DSA-87** — Ogni transazione porta sia una firma classica che una post-quantum, verificate nella catena AnteHandler
* **3 modalità di imposizione** — Imposizione configurabile delle firme ibride: off (modalità 0), permissive (modalità 1, PQC opzionale), mandatory (modalità 2, PQC richiesto)
* **Auto-registrazione** — Le chiavi pubbliche PQC sono registrate automaticamente alla prima transazione ibrida, eliminando un passaggio di registrazione separato
* **Fondazione hash SHAKE-256** — Tutte le operazioni di hashing relative al PQC usano SHAKE-256 (famiglia SHA-3) per la derivazione degli indirizzi resistente ai computer quantistici
* **Interfacce di attestazione TEE** — Supporto all'attestazione Trusted Execution Environment per provare l'integrità della generazione delle chiavi PQC
* **Framework di agilità degli algoritmi** — Registro di algoritmi pluggable che consente di aggiungere futuri algoritmi PQC tramite governance senza un upgrade della chain

## v1.0.0 — Genesis (Motore di Tokenomics)

**Focus della release:** Lancio iniziale del protocollo con tokenomics completa, esecuzione multi-VM e operazioni assistite da AI.

* **Modulo x/burn** — Meccanismo di burn delle fee multi-canale con una distribuzione a quattro vie tra validatori, burn, treasury e staker
* **Modulo x/xqore** — Derivato di staking di governance con penalità di unlock anticipato a livelli e ridistribuzione rebase PvP
* **Modulo x/inflation** — Emissione basata su epoche con decadimento annuale, governata dal modello economico a emissione finita
* **Livello di consenso PRISM** — Ottimizzazione a reinforcement learning (PPO) per il tuning dinamico dei parametri della chain con controlli di sicurezza circuit-breaker
* **CPoS a triplo pool** — Classified Proof-of-Stake con pool di validatori Emerald, Sapphire e Ruby pesati in base ai punteggi di reputazione
* **Governance QDRW** — Sistema di Dynamic Reward Weighting che consente aggiustamenti approvati dalla governance alla distribuzione delle ricompense tra i pool
* **Runtime EVM + CosmWasm + SVM** — Tre ambienti di esecuzione concorrenti: il QoreChain EVM Engine, gli smart contract CosmWasm e la Solana Virtual Machine
* **Bridge cross-VM** — Passaggio di messaggi e trasferimenti di asset tra i runtime EVM, CosmWasm e SVM all'interno di un singolo blocco
* **Crittografia post-quantum** — Firma resistente ai computer quantistici supportata da una libreria PQC ad alte prestazioni
* **QCAI** — Analisi euristica on-chain con un sidecar off-chain opzionale per il rilevamento delle frodi, la stima delle fee e l'ottimizzazione della rete
* **Deployment containerizzato** — Deployment completo di una testnet multi-validatore con servizio sidecar e block indexer
* **Block indexer** — Block listener con archiviazione persistente per query storiche e analisi
