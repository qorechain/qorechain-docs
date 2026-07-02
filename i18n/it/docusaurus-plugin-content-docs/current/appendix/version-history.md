---
slug: /appendix/version-history
title: Cronologia delle Versioni
sidebar_label: Cronologia delle Versioni
sidebar_position: 3
---

# Cronologia delle Versioni

Cronologia pubblica delle versioni di QoreChain. L'ultima release è la **v3.1.82**, in esecuzione sulla mainnet **`qorechain-vladi`** (chain ID EVM **9801**, attiva dal 7 giugno 2026). La testnet **`qorechain-diana`** (chain ID EVM **9800**) segue le build pre-release.

:::note
Le voci riportate di seguito sono riepiloghi di alto livello delle funzionalità. Le voci `v1.x` più datate sono conservate come registro storico della linea di release testnet che ha preceduto la mainnet.
:::

---

## v3.1.82 — QOR nativo su SVM attivo + abilitazione degli integratori (release mainnet corrente)

**Focus della release:** l'unificazione del QOR nativo su SVM operativa su entrambe le reti, più tutto ciò di cui un exchange o un integratore ha bisogno per connettersi.

* **Saldo QOR nativo unificato attivo su tutte e tre le interfacce** — L'unificazione SVM (v3.1.81) è confermata operativa su mainnet e testnet: lo stesso account detiene un unico saldo visibile come `uqor` (6 decimali) su Cosmos, in stile wei a 18 decimali sull'EVM e in lamports (9 decimali; 1 uqor = 1,000 lamports) sull'interfaccia compatibile con Solana.
* **Endpoint pubblici verificati** — Endpoint HTTPS pubblici per RPC di consenso, REST, JSON-RPC EVM e JSON-RPC SVM su entrambe le reti, oltre al [block explorer](https://explore.qore.network) pubblico. Vedi [Reti](/appendix/networks).
* **Download** — Bundle versionati dei binari del nodo, il genesis della mainnet e snapshot aggiornati dei dati della chain (con checksum SHA-256) pubblicati su [download.qore.host](https://download.qore.host).
* **Firma post-quantistica deterministica in tutto lo stack client** — `@qorechain/pqc` 0.1.1 firma ML-DSA-87 in modo deterministico (FIPS-204 §3.4) in tutti e sei i binding di linguaggio, in linea con ciò che la chain accetta; `@qorechain/wallet-adapter` 0.1.2 si basa su di esso per la firma di transazioni ibride.
* **Guida per gli integratori** — Nuova [Guida per Exchange e Integratori](/developer-guide/exchange-integration) che copre depositi, prelievi e operazioni sui nodi attraverso le tre interfacce.

## v3.1.81 — Unificazione del QOR Nativo su SVM

**Focus della release:** il QOR nativo come asset di prima classe sull'interfaccia compatibile con Solana.

* **QOR nativo su SVM** — Il runtime SVM ora espone direttamente il saldo QOR nativo dell'account (in lamports), invece di tracciare un saldo separato riservato all'SVM. `getBalance` e `getSignaturesForAddress` operano sui fondi nativi e i trasferimenti del System Program muovono QOR nativo.
* **Mappatura degli indirizzi SVM** — L'indirizzo SVM di un account è derivato dai suoi 20 byte di account (con padding a destra fino a 32 byte, codificati in base58), così gli indirizzi Cosmos, EVM e SVM di una stessa chiave fanno riferimento agli stessi fondi.

## v3.1.80 — Query degli Anchor di Stato Multilayer

**Focus della release:** anchor di settlement leggibili e verificabili offline per i rollup.

* **Query di lettura degli anchor** — Il servizio di query `x/multilayer` ora espone `Anchor` (l'ultimo state anchor di un layer) e `Anchors` (lo storico degli anchor di un layer), così i client possono recuperare l'anchor di settlement di un layer e verificarlo in modo indipendente.
* **Gateway REST per multilayer** — Ogni query multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) è ora disponibile via REST oltre che via gRPC.
* **Ricevute di settlement quantum-safe sbloccate** — Ogni anchor include una firma **ML-DSA-87 (Dilithium-5)** sui suoi campi canonici, fornendo la base on-chain per la verifica offline delle ricevute di settlement del Rollup Development Kit.

## v3.1.79 — Auto-Provisioning dei Validatori per le Reti Bridge

**Focus della release:** partecipazione chiavi in mano sulle reti connesse per i validatori con licenza.

* **Framework di driver di rete** — Un framework dichiarativo di driver consente a un validatore QoreChain in possesso della licenza `validator_<chain>` (o `qcb_bridge`) pertinente di avere il client della rete esterna corrispondente provisionato, configurato ed eseguito sullo stesso nodo sotto l'orchestrazione di QoreChain — solo una volta attivata la licenza.
* **Driver per tutte le 37 reti bridge** — La copertura abbraccia ogni rete connessa, classificata per modello di partecipazione (validatore permissionless, con limite/elezione/ammissione, full-node L2 e ruoli non-staking/trust-list). Le chiavi di stake e di firma delle reti esterne restano fornite dall'operatore per ciascuna rete; QoreChain fornisce il framework e il gate di licenza applicato.

## v3.1.78 — Prontezza Pre-Deploy

**Focus della release:** wallet, bridge, IBC e licensing funzionano tutti al lancio — senza governance post-deploy.

* **Attivazione trustless dei bridge post-deploy** — Una chiave `bridge_admin` (o un titolare di licenza `qcb_bridge`) può attivare il bridge di qualsiasi chain connessa con una singola transazione firmata (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — impostando indirizzo del contratto, conferme, architettura, stato, il verifier attivo e la trust root del verifier — senza proposta di governance né upgrade della chain.
* **Gate di licenza per le reti dei validatori** — L'orchestratore ora applica la licenza `validator_<chain>` / `qcb_bridge` (fail-closed) prima di avviare qualsiasi client di rete esterna.
* **Pacchetti di integrazione wallet** — `@qorechain/wallet-adapter` e `@qorechain/connect` pubblicati su npm (v0.1.0), con registrazione della rete in MetaMask con una sola chiamata (EIP-3085, QOR nativo a **18 decimali** sul binario EVM) e configurazione del gas price per Keplr.
* **Relayer IBC chiavi in mano** — Configurazione del relayer pronta all'uso e strumenti di bootstrap dei canali per le otto controparti IBC, così i canali si attivano post-deploy senza configurazioni su misura.

## v3.1.77 — Endpoint REST per Bridge e Burn

**Focus della release:** accesso REST in sola lettura per i moduli cross-chain e di supply.

* **Endpoint REST del bridge** — Endpoint di query HTTP in sola lettura per il modulo bridge, che espongono lo stato del bridge via REST standard oltre che via gRPC.
* **Endpoint REST del burn** — Endpoint di query HTTP in sola lettura per il modulo burn, che rendono interrogabili via REST standard i dati di distribuzione delle fee e di supply.

## v3.1.76 — Modernizzazione della Toolchain SVM

**Focus della release:** aggiornamento della compatibilità con la Solana Virtual Machine.

* **Supporto ai programmi della toolchain corrente** — Esecuzione SVM modernizzata in modo che i programmi compilati con la toolchain Solana corrente girino sul runtime SVM di QoreChain.

## v3.1.75 — JSON-RPC SVM Abilitato di Default

**Focus della release:** RPC compatibile con Solana pronto all'uso.

* **JSON-RPC compatibile con Solana** — Il server JSON-RPC SVM è ora abilitato di default (porta **8899**) e avviato automaticamente con il nodo, fornendo un'interfaccia RPC compatibile con Solana per gli strumenti SVM.

## v3.1.74 — Preset di Profilo per i Rollup

**Focus della release:** usabilità e settlement del Rollup Development Kit.

* **Applicazione dei preset di profilo** — La creazione di un rollup ora applica il preset del profilo selezionato (DeFi, gaming, NFT, enterprise o completamente custom), così i nuovi rollup ereditano impostazioni predefinite sensate per il loro caso d'uso.
* **Settlement ottimistico** — Il percorso di settlement ottimistico (invio dei batch e challenge) è operativo end-to-end.

## v3.1.73 — Baseline Hash Post-Quantistica

**Focus della release:** completamento della baseline crittografica post-quantistica predefinita.

* **SHAKE-256 come hash predefinito** — SHAKE-256 (famiglia SHA-3) è adottato come hash applicativo predefinito, completando la baseline post-quantistica predefinita composta da firme **ML-DSA-87 (Dilithium-5)**, incapsulamento di chiavi **ML-KEM-1024** e hashing **SHAKE-256**.

## v3.1.72 — Stabilità e Manutenzione

**Focus della release:** manutenzione ordinaria di stabilità e della pipeline di build.

* **Miglioramenti di stabilità** — Manutenzione interna di stabilità, dipendenze e pipeline di build senza modifiche di comportamento visibili all'esterno.

## v3.1.71 — Firme Ibride PQC Applicate di Default

**Focus della release:** sicurezza post-quantistica attiva di default sul percorso delle transazioni Cosmos.

* **Firme ibride richieste di default** — Le firme ibride post-quantistiche sono ora applicate di default sul percorso delle transazioni Cosmos: ogni transazione include una firma post-quantistica **ML-DSA-87 (Dilithium-5)** accanto alla firma classica **secp256k1**.
* **Enforcement controllato dalla governance** — La modalità di enforcement resta controllata dalla governance, con il valore predefinito impostato su **required**.

## v3.1.70 — Hardening di Produzione

**Focus della release:** hardening di produzione e ottimizzazione del consenso per la mainnet attiva.

* **Ottimizzazione del consenso PRISM** — Miglioramenti continui al layer di ottimizzazione tramite reinforcement learning PRISM per il tuning adattivo dei parametri in condizioni di rete reali, con controlli di sicurezza a circuit-breaker.
* **Prestazioni e stabilità** — Rifiniture di throughput, latenza e utilizzo delle risorse su validatori e full node.
* **Strumenti operativi** — Migliorata l'ergonomia di monitoraggio, query e gestione dei nodi per gli operatori della mainnet.
* **Allineamento alla Tokenomics v2.1** — Distribuzione delle fee e meccaniche di emissione allineate al modello economico a offerta fissa ed emissione finita.

## v3.0.0 — Genesis della Mainnet

**Focus della release:** lancio della mainnet ed evento di generazione del token.

* **Genesis della mainnet** — La mainnet di QoreChain (`qorechain-vladi`, chain ID EVM 9801) è stata lanciata il **7 giugno 2026**, con l'evento di generazione del token (TGE) al genesis.
* **Ripartizione delle fee a cinque vie** — Distribuzione delle fee di protocollo tra validatori, burn, treasury, staker e light node (**37 / 30 / 20 / 10 / 3**), con l'aggiunta di una quota dedicata ai light node.
* **AMM on-chain** — Modulo nativo di automated market maker (`x/amm`) per pool di liquidità e swap on-chain.
* **Licensing della chain** — Modulo di licenza on-chain (`x/license`) per registrare e gestire i diritti di protocollo.
* **Paradigmi di settlement consolidati** — Modalità di settlement dell'RDK finalizzate come optimistic, zk, based e sovereign.

## v1.4.0 — Espansione Pre-Mainnet

**Focus della release:** copertura cross-chain e stabilizzazione della release candidate in vista della mainnet.

* **Copertura cross-chain estesa** — Connettività IBC e bridge aggiuntiva verso un insieme più ampio di reti esterne.
* **Partecipazione dei light node** — Introdotti i light node e le fondamenta per le loro ricompense di quota fee.
* **Hardening della release candidate** — Test approfonditi, audit e stabilizzazione su tutti i moduli core in preparazione al genesis della mainnet.

## v1.3.0 — Rollup Development Kit

**Focus della release:** infrastruttura nativa per rollup destinata a deployment sovrani e a sicurezza condivisa.

* **Modulo x/rdk** — Rollup Development Kit completo con quattro paradigmi di settlement: optimistic, zk, based e sovereign
* **5 profili preset** — Template di rollup preconfigurati per casi d'uso DeFi, gaming, NFT, enterprise e completamente custom
* **Data availability nativa** — Layer DA on-chain con blob storage, gestione della retention e ciclo di vita del pruning
* **Auto-finalizzazione tramite EndBlocker** — Finalizzazione automatica dei batch alla scadenza della finestra di challenge, senza alcun intervento dell'operatore
* **Selezione del profilo assistita dall'AI** — Query `suggest-profile` che raccomanda una configurazione ottimale del rollup in base al caso d'uso previsto
* **Integrazione multilayer** — I rollup si registrano come layer nell'architettura multilayer, ereditando routing, ancoraggio e meccaniche di challenge
* **Ciclo di vita dell'escrow bancario** — Lo stake dell'operatore è tenuto in escrow durante l'operatività del rollup e rilasciato alla chiusura regolare o confiscato in caso di slashing

## v1.2.0 — IBC e Bridge

**Focus della release:** connettività cross-chain e astrazioni avanzate degli account.

* **25 connessioni cross-chain** — 8 canali IBC e 17 connessioni QoreChain Bridge (QCB) verso reti esterne
* **Modulo x/babylon** — Integrazione del restaking BTC che consente ai detentori di Bitcoin di partecipare alla sicurezza dello staking di QoreChain
* **Modulo x/abstractaccount** — Framework di smart account con regole di spesa programmabili, session key e logica di autenticazione personalizzata
* **Modulo x/fairblock** — Threshold Identity-Based Encryption (tIBE) per la cifratura delle transazioni resistente al MEV
* **Modulo x/gasabstraction** — Pagamento del gas multi-token con supporto per QOR nativo, USDC bridged via IBC e ATOM bridged via IBC
* **Prioritizzazione delle TX a 5 corsie** — Corsie di transazione ordinate per priorità: system, governance, staking, bridge e general
* **Configurazioni dei relayer IBC** — Setup dei relayer preconfigurati per tutti i canali IBC supportati
* **Integrazione bridge-to-burn** — Le fee dei bridge vengono instradate attraverso la distribuzione delle fee del modulo burn

## v1.1.0 — Firme Ibride PQC

**Focus della release:** sicurezza crittografica post-quantistica e agilità algoritmica.

* **Firme duali secp256k1 (ECDSA) + ML-DSA-87** — Ogni transazione include sia una firma classica sia una firma post-quantistica, verificate nella catena dell'AnteHandler
* **3 modalità di enforcement** — Enforcement configurabile delle firme ibride: off (modalità 0), permissive (modalità 1, PQC opzionale), mandatory (modalità 2, PQC obbligatoria)
* **Auto-registrazione** — Le chiavi pubbliche PQC vengono registrate automaticamente alla prima transazione ibrida, eliminando un passaggio di registrazione separato
* **Fondamenta di hash SHAKE-256** — Tutte le operazioni di hashing legate alla PQC usano SHAKE-256 (famiglia SHA-3) per la derivazione degli indirizzi resistente al quantum
* **Interfacce di attestazione TEE** — Supporto all'attestazione tramite Trusted Execution Environment per dimostrare l'integrità della generazione delle chiavi PQC
* **Framework di agilità algoritmica** — Registro di algoritmi pluggable che consente di aggiungere futuri algoritmi PQC via governance senza un upgrade della chain

## v1.0.0 — Genesis (Motore di Tokenomics)

**Focus della release:** lancio iniziale del protocollo con tokenomics complete, esecuzione multi-VM e operazioni assistite dall'AI.

* **Modulo x/burn** — Meccanismo di burn delle fee multicanale con distribuzione a quattro vie tra validatori, burn, treasury e staker
* **Modulo x/xqore** — Derivato di staking di governance con penalità di sblocco anticipato a livelli e ridistribuzione del rebase PvP
* **Modulo x/inflation** — Emissione basata su epoche con decadimento annuale, governata dal modello economico a emissione finita
* **Layer di consenso PRISM** — Ottimizzazione tramite reinforcement learning (PPO) per il tuning dinamico dei parametri della chain con controlli di sicurezza a circuit-breaker
* **CPoS a triplo pool** — Classified Proof-of-Stake con pool di validatori Emerald, Sapphire e Ruby pesati per punteggi di reputazione
* **Governance QDRW** — Sistema di Dynamic Reward Weighting che consente aggiustamenti approvati dalla governance alla distribuzione delle ricompense tra i pool
* **Runtime EVM + CosmWasm + SVM** — Tre ambienti di esecuzione concorrenti: il QoreChain EVM Engine, gli smart contract CosmWasm e la Solana Virtual Machine
* **Bridge cross-VM** — Passaggio di messaggi e trasferimenti di asset tra i runtime EVM, CosmWasm e SVM all'interno di un singolo blocco
* **Crittografia post-quantistica** — Firma resistente al quantum basata su una libreria PQC ad alte prestazioni
* **QCAI** — Analisi euristica on-chain con un sidecar off-chain opzionale per il rilevamento delle frodi, la stima delle fee e l'ottimizzazione della rete
* **Deployment containerizzato** — Deployment completo di testnet multi-validatore con servizio sidecar e block indexer
* **Block indexer** — Listener di blocchi con storage persistente per query storiche e analytics
