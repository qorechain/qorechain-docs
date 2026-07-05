---
slug: /appendix/version-history
title: Cronologia delle Versioni
sidebar_label: Cronologia delle Versioni
sidebar_position: 3
---

# Cronologia delle Versioni

Cronologia pubblica delle versioni di QoreChain. L'ultima release è la **v3.1.85**, in esecuzione sulla mainnet **`qorechain-vladi`** (chain ID EVM **9801**, attiva dal 7 giugno 2026). La testnet **`qorechain-diana`** (chain ID EVM **9800**) segue le build pre-release.

:::note
Le voci riportate di seguito sono riepiloghi di alto livello delle funzionalità. Le voci `v1.x` più datate sono conservate come registro storico della linea di release testnet che ha preceduto la mainnet.
:::

---

## v3.1.85 — Spesa delegata tramite wallet collegati (release corrente)

**Focus della release:** una chiave di wallet esterno collegata (Phantom, MetaMask) può ora **spendere** dall'unico account canonico post-quantistico — con permessi a privilegio minimo, limiti di spesa e revoca istantanea.

* **Corsie di esecuzione per authenticator** — Due nuovi messaggi permettono a un authenticator registrato di autorizzare trasferimenti dall'account canonico senza la presenza del titolare dell'account: **`MsgExecuteEVM`** (una chiamata/trasferimento EVM dall'indirizzo `0x…` dell'account) e **`MsgExecuteCosmos`** (un invio bank sulla corsia Native). Un **relayer** invia e paga l'envelope — la sua firma ibrida PQC soddisfa i requisiti della transazione — mentre la firma dell'authenticator su sign bytes con separazione di dominio e protezione anti-replay costituisce l'autorizzazione. La chiave esterna non necessita mai di una co-firma ML-DSA.
* **MetaMask come authenticator** — Gli authenticator secp256k1 possono ora essere registrati tramite il loro **indirizzo Ethereum a 20 byte** e verificati via **EIP-191 `personal_sign`** (oltre alla forma a chiave compressa da 33 byte), così un normale account MetaMask può essere collegato e spendere entro i limiti.
* **Enforcement su tutte e tre le corsie** — Gli scope dei permessi e i limiti di valore **SpendingRule** (per transazione + massimali giornalieri) sono applicati sulle corsie Native, EVM e SVM; i messaggi di gestione delle chiavi non sono mai delegabili. Codici di errore distinti consentono ai wallet di mostrare il messaggio corretto: `5` limite di spesa superato, `6` authenticator scaduto, `10` permesso negato, `11` replay rifiutato.
* **Query dello schema dei permessi** — `GET /qorechain/abstractaccount/v1/permission_schema` (anche gRPC/CLI) restituisce la tassonomia canonica dei permessi (11 permessi), la mappa messaggio→permesso e l'elenco dei messaggi non delegabili, così i wallet convalidano gli scope senza hardcoding.
* **Rotazione della chiave PQC nello stesso algoritmo** — Il nuovo **`MsgRotatePQCKey`** ruota la chiave ML-DSA-87 di un account all'interno dello stesso algoritmo (con doppia firma della vecchia e della nuova chiave), consentendo la migrazione delle chiavi con derivazione legacy alla derivazione canonica vincolata all'indirizzo e il ritiro di una chiave compromessa. Nuovi comandi CLI: `tx pqc rotate-key` e `tx pqc recover-key` (recupero deterministico della chiave da una mnemonica).
* **Transazioni con chiave root invariate** — Le modifiche sono additive; i normali flussi di wallet, exchange e Keplr restano invariati. Gli operatori di nodi devono trovarsi sulla **v3.1.85** entro l'altezza di upgrade della rete.

## v3.1.84 — Permessi degli authenticator e limiti di spesa

**Focus della release:** il modello di permessi alla base della spesa delegata.

* **Tassonomia canonica dei permessi** — Undici permessi (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`) con una mappa messaggio→permesso fail-closed: un tipo di messaggio non mappato viene negato, e i messaggi di gestione delle chiavi non possono mai essere delegati.
* **Enforcement delle SpendingRule** — Massimali di spesa per transazione e giornalieri (UTC) con elenchi di denom consentiti, applicati e registrati per ciascuna coppia (account, authenticator).
* **Autorizzazione sulla corsia SVM** — Le azioni autorizzate da una chiave a schema esterno (ad es. Phantom ed25519) sulla corsia SVM passano attraverso lo stesso gate di autorizzazione centrale.

## v3.1.83 — Firma con account unificato su tutte e tre le interfacce

**Focus della release:** una chiave, un account — un'unica identità unificata che ora può **firmare**, e non soltanto detenere un saldo, sulle interfacce Cosmos, EVM e SVM.

* **Una chiave firma su ogni corsia** — Un account creato eth-native (indirizzo = keccak della sua chiave pubblica secp256k1) ora firma anche le transazioni della corsia Cosmos con lo schema `eth_secp256k1`, oltre alle transazioni EVM. Le sue forme `qor1…` (Cosmos), `0x…` (EVM) e Solana-VM (base58) sono un'unica identità a 20 byte che **detiene un solo saldo** e **spende su tutte e tre le corsie** — incluse le transazioni Cosmos ibride post-quantistiche (ML-DSA-87).
* **Firma post-quantistica invariata** — L'account unificato continua a registrare la propria chiave ML-DSA-87 e a includere la firma ibrida FIPS-204 richiesta dalla chain; la parte classica è `eth_secp256k1` (keccak) invece dello schema coinType-118. Gli account coinType-118 esistenti non sono interessati.
* **Rolling upgrade neutro rispetto al consenso** — Distribuito come rolling upgrade del binario su entrambe le reti, **senza re-genesis e senza halt della chain**. Saldi degli account, storico e genesis restano invariati.
* **Tooling client** — `@qorechain/wallet-adapter` 0.1.5 aggiunge la firma Cosmos eth-native (`signClassicalEth` / `signHybridEth`), la generazione unificata dei 3 indirizzi e `walletFromSeed` (deriva l'account canonico da un qualunque seed di 32 byte — ad es. una firma Phantom); `@qorechain/chain-bridge` acquisisce un percorso di firma `eth_secp256k1`.

:::caution Operatori di nodi — upgrade obbligatorio
I full node devono eseguire la **v3.1.83+**. Un nodo precedente alla 3.1.83 non è in grado di decodificare una transazione eth-native (`eth_secp256k1`) e smetterà di sincronizzarsi non appena una di esse compare in un blocco. Scarica il bundle corrente da [download.qore.host](https://download.qore.host).
:::

## v3.1.82 — QOR nativo su SVM live + abilitazione degli integratori

**Focus della release:** l'unificazione del QOR nativo su SVM in esecuzione su entrambe le reti, più tutto ciò che serve a un exchange o a un integratore per connettersi.

* **Saldo QOR nativo unificato live su tutte e tre le interfacce** — L'unificazione SVM (v3.1.81) è confermata live su mainnet e testnet: lo stesso account detiene un unico saldo visibile come `uqor` (6 decimali) su Cosmos, in stile wei a 18 decimali sull'EVM e in lamports (9 decimali; 1 uqor = 1.000 lamports) sull'interfaccia compatibile con Solana.
* **Endpoint pubblici verificati** — Endpoint HTTPS pubblici per RPC di consenso, REST, JSON-RPC EVM e JSON-RPC SVM su entrambe le reti, oltre al [block explorer](https://explore.qore.network) pubblico. Vedi [Reti](/appendix/networks).
* **Download** — Bundle versionati dei binari dei nodi, la genesis della mainnet e snapshot aggiornati dei dati della chain (con checksum SHA-256) pubblicati su [download.qore.host](https://download.qore.host).
* **Firma post-quantistica deterministica in tutto lo stack client** — `@qorechain/pqc` 0.1.1 firma ML-DSA-87 in modo deterministico (FIPS-204 §3.4) in tutti e sei i binding di linguaggio, in linea con ciò che la chain accetta; `@qorechain/wallet-adapter` 0.1.2 vi si appoggia per la firma delle transazioni ibride.
* **Guida per integratori** — Nuova [Guida per exchange e integratori](/developer-guide/exchange-integration) che copre depositi, prelievi e operazioni dei nodi sulle tre interfacce.

## v3.1.81 — Unificazione del QOR nativo su SVM

**Focus della release:** il QOR nativo come asset di prima classe sull'interfaccia compatibile con Solana.

* **QOR nativo su SVM** — Il runtime SVM ora espone direttamente il saldo QOR nativo dell'account (in lamports), invece di tracciare un saldo separato riservato all'SVM. `getBalance` e `getSignaturesForAddress` operano sui fondi nativi, e i trasferimenti del System Program muovono QOR nativo.
* **Mappatura degli indirizzi SVM** — L'indirizzo SVM di un account è derivato dai suoi 20 byte di account (riempiti a destra fino a 32 byte, codificati in base58), così gli indirizzi Cosmos, EVM e SVM di una stessa chiave fanno riferimento agli stessi fondi.

## v3.1.80 — Query degli anchor di stato multilayer

**Focus della release:** anchor di settlement leggibili e verificabili offline per i rollup.

* **Query di lettura degli anchor** — Il servizio di query `x/multilayer` ora espone `Anchor` (l'anchor di stato più recente per un layer) e `Anchors` (lo storico degli anchor di un layer), così i client possono recuperare l'anchor di settlement di un layer e verificarlo in modo indipendente.
* **Gateway REST per multilayer** — Ogni query multilayer (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) è ora disponibile via REST oltre che via gRPC.
* **Ricevute di settlement quantum-safe sbloccate** — Ogni anchor include una firma **ML-DSA-87 (Dilithium-5)** sui suoi campi canonici, fornendo la base on-chain per la verifica offline delle ricevute di settlement del Rollup Development Kit.

## v3.1.79 — Auto-provisioning dei validatori per le reti bridge

**Focus della release:** partecipazione chiavi in mano sulle reti connesse per i validatori con licenza.

* **Framework di driver di rete** — Un framework di driver dichiarativo consente a un validatore QoreChain in possesso della licenza `validator_<chain>` (o `qcb_bridge`) pertinente di avere il client della rete esterna corrispondente provisionato, configurato ed eseguito sullo stesso nodo sotto l'orchestrazione di QoreChain — solo dopo l'attivazione della licenza.
* **Driver per tutte le 37 reti bridge** — La copertura si estende a ogni rete connessa, classificata per modello di partecipazione (validatore permissionless, con cap/elezione/ammissione, full-node L2 e ruoli non-staking/trust-list). Lo stake e le chiavi di firma della rete esterna restano forniti dall'operatore per ciascuna rete; QoreChain fornisce il framework e il gate di licenza applicato.

## v3.1.78 — Prontezza pre-deploy

**Focus della release:** wallet, bridge, IBC e licensing tutti funzionanti al lancio — senza governance post-deploy.

* **Attivazione trustless dei bridge post-deploy** — Una chiave `bridge_admin` (o un titolare della licenza `qcb_bridge`) può attivare il bridge di qualsiasi chain connessa con un'unica transazione firmata (`tx bridge update-chain-config` / `set-verifier-bootstrap`) — impostando indirizzo del contratto, conferme, architettura, stato, il verifier attivo e la trust root del verifier — senza proposta di governance né upgrade della chain.
* **Gate di licenza per le reti dei validatori** — L'orchestratore ora applica (fail-closed) la licenza `validator_<chain>` / `qcb_bridge` prima di avviare qualsiasi client di rete esterna.
* **Pacchetti di integrazione wallet** — `@qorechain/wallet-adapter` e `@qorechain/connect` pubblicati su npm (v0.1.0), con registrazione della rete su MetaMask in una sola chiamata (EIP-3085, QOR nativo a **18 decimali** sul binario EVM) e configurazione del gas price per Keplr.
* **Relayer IBC chiavi in mano** — Configurazione del relayer pronta all'uso e tooling di bootstrap dei canali per le otto controparti IBC, così i canali si attivano post-deploy senza configurazioni ad hoc.

## v3.1.77 — Endpoint REST per bridge e burn

**Focus della release:** accesso REST in sola lettura per i moduli cross-chain e di supply.

* **Endpoint REST del bridge** — Endpoint di query HTTP in sola lettura per il modulo bridge, che espongono lo stato del bridge via REST standard oltre che via gRPC.
* **Endpoint REST del burn** — Endpoint di query HTTP in sola lettura per il modulo burn, che rendono interrogabili via REST standard i dati di distribuzione delle fee e di supply.

## v3.1.76 — Modernizzazione della toolchain SVM

**Focus della release:** aggiornamento della compatibilità con la Solana Virtual Machine.

* **Supporto ai programmi con toolchain corrente** — Esecuzione SVM modernizzata affinché i programmi compilati con la toolchain Solana corrente girino sul runtime SVM di QoreChain.

## v3.1.75 — JSON-RPC SVM di default

**Focus della release:** RPC compatibile con Solana pronto all'uso.

* **JSON-RPC compatibile con Solana** — Il server JSON-RPC SVM è ora abilitato di default (porta **8899**) e avviato automaticamente con il nodo, fornendo un'interfaccia RPC compatibile con Solana per il tooling SVM.

## v3.1.74 — Preset di profilo per i rollup

**Focus della release:** usabilità e settlement del Rollup Development Kit.

* **Applicazione dei preset di profilo** — La creazione di un rollup ora applica il preset del profilo selezionato (DeFi, gaming, NFT, enterprise o completamente custom), così i nuovi rollup ereditano default sensati per il loro caso d'uso.
* **Settlement ottimistico** — Il percorso di settlement ottimistico (invio dei batch e challenge) è operativo end-to-end.

## v3.1.73 — Baseline di hash post-quantistica

**Focus della release:** completamento della baseline crittografica post-quantistica di default.

* **SHAKE-256 come hash di default** — SHAKE-256 (famiglia SHA-3) è adottato come hash applicativo di default, completando la baseline post-quantistica di default composta da firme **ML-DSA-87 (Dilithium-5)**, incapsulamento di chiave **ML-KEM-1024** e hashing **SHAKE-256**.

## v3.1.72 — Stabilità e manutenzione

**Focus della release:** manutenzione ordinaria di stabilità e della pipeline di build.

* **Miglioramenti di stabilità** — Manutenzione interna di stabilità, dipendenze e pipeline di build, senza cambiamenti di comportamento visibili all'esterno.

## v3.1.71 — Firme ibride PQC applicate di default

**Focus della release:** sicurezza post-quantistica attiva di default sul percorso di transazione Cosmos.

* **Firme ibride richieste di default** — Le firme ibride post-quantistiche sono ora applicate di default sul percorso di transazione Cosmos: ogni transazione include una firma post-quantistica **ML-DSA-87 (Dilithium-5)** accanto alla firma classica **secp256k1**.
* **Enforcement controllato dalla governance** — La modalità di enforcement resta controllata dalla governance, con il default impostato su **required**.

## v3.1.70 — Hardening di produzione

**Focus della release:** hardening di produzione e ottimizzazione del consenso per la mainnet live.

* **Ottimizzazione del consenso PRISM** — Miglioramenti continui al layer di ottimizzazione a reinforcement learning PRISM per il tuning adattivo dei parametri in condizioni di rete live, con controlli di sicurezza a circuit-breaker.
* **Prestazioni e stabilità** — Affinamenti di throughput, latenza e utilizzo delle risorse su validatori e full node.
* **Tooling operativo** — Miglioramenti a monitoraggio, query ed ergonomia operativa dei nodi per gli operatori mainnet.
* **Allineamento a Tokenomics v2.1** — Distribuzione delle fee e meccaniche di emissione allineate al modello economico a supply fissa ed emissione finita.

## v3.0.0 — Genesis della mainnet

**Focus della release:** lancio della mainnet ed evento di generazione del token.

* **Genesis della mainnet** — La mainnet QoreChain (`qorechain-vladi`, chain ID EVM 9801) è stata lanciata il **7 giugno 2026**, con il token generation event (TGE) alla genesis.
* **Ripartizione delle fee a cinque vie** — Distribuzione delle fee di protocollo tra validatori, burn, treasury, staker e light node (**37 / 30 / 20 / 10 / 3**), con l'aggiunta di una quota dedicata ai light node.
* **AMM on-chain** — Modulo nativo di automated market maker (`x/amm`) per pool di liquidità e swap on-chain.
* **Licensing on-chain** — Modulo di licenze on-chain (`x/license`) per registrare e gestire i diritti di protocollo.
* **Paradigmi di settlement consolidati** — Le modalità di settlement dell'RDK finalizzate come optimistic, zk, based e sovereign.

## v1.4.0 — Espansione pre-mainnet

**Focus della release:** copertura cross-chain e stabilizzazione della release candidate in vista della mainnet.

* **Copertura cross-chain estesa** — Connettività IBC e bridge aggiuntiva verso un insieme più ampio di reti esterne.
* **Partecipazione dei light node** — Introdotti i light node e le fondamenta per le loro ricompense da quota di fee.
* **Hardening della release candidate** — Test estensivi, audit e stabilizzazione di tutti i moduli core in preparazione della genesis della mainnet.

## v1.3.0 — Rollup Development Kit

**Focus della release:** infrastruttura nativa per rollup per deployment di rollup sovrani e a sicurezza condivisa.

* **Modulo x/rdk** — Rollup Development Kit completo con quattro paradigmi di settlement: optimistic, zk, based e sovereign
* **5 profili preset** — Template di rollup preconfigurati per casi d'uso DeFi, gaming, NFT, enterprise e completamente custom
* **Data availability nativa** — Layer di DA on-chain con archiviazione blob, gestione della retention e ciclo di vita del pruning
* **Auto-finalizzazione via EndBlocker** — Finalizzazione automatica dei batch alla scadenza della finestra di challenge, senza alcun intervento dell'operatore
* **Selezione del profilo assistita da AI** — Query `suggest-profile` che raccomanda una configurazione ottimale del rollup in base al caso d'uso previsto
* **Integrazione multilayer** — I rollup si registrano come layer nell'architettura multilayer, ereditando le meccaniche di routing, anchoring e challenge
* **Ciclo di vita dell'escrow bancario** — Lo stake dell'operatore è tenuto in escrow durante l'operatività del rollup e rilasciato allo spegnimento pulito o confiscato in caso di slashing

## v1.2.0 — IBC e bridge

**Focus della release:** connettività cross-chain e astrazioni avanzate degli account.

* **25 connessioni cross-chain** — 8 canali IBC e 17 connessioni QoreChain Bridge (QCB) verso reti esterne
* **Modulo x/babylon** — Integrazione di restaking BTC che consente ai detentori di Bitcoin di partecipare alla sicurezza dello staking di QoreChain
* **Modulo x/abstractaccount** — Framework di smart account con regole di spesa programmabili, session key e logica di autenticazione personalizzata
* **Modulo x/fairblock** — Threshold Identity-Based Encryption (tIBE) per la cifratura delle transazioni resistente al MEV
* **Modulo x/gasabstraction** — Pagamento del gas multi-token con supporto per QOR nativo, USDC via bridge IBC e ATOM via bridge IBC
* **Prioritizzazione delle TX a 5 corsie** — Corsie di transazione ordinate per priorità: system, governance, staking, bridge e general
* **Configurazioni di relayer IBC** — Setup di relayer preconfigurati per tutti i canali IBC supportati
* **Integrazione bridge-burn** — Le fee dei bridge sono instradate attraverso la distribuzione delle fee del modulo burn

## v1.1.0 — Firme ibride PQC

**Focus della release:** sicurezza crittografica post-quantistica e agilità algoritmica.

* **Doppie firme secp256k1 (ECDSA) + ML-DSA-87** — Ogni transazione include sia una firma classica sia una post-quantistica, verificate nella catena dell'AnteHandler
* **3 modalità di enforcement** — Enforcement configurabile delle firme ibride: off (modalità 0), permissive (modalità 1, PQC opzionale), mandatory (modalità 2, PQC obbligatoria)
* **Auto-registrazione** — Le chiavi pubbliche PQC vengono registrate automaticamente alla prima transazione ibrida, eliminando un passaggio di registrazione separato
* **Fondamento di hash SHAKE-256** — Tutte le operazioni di hashing legate alla PQC usano SHAKE-256 (famiglia SHA-3) per una derivazione degli indirizzi resistente al quantistico
* **Interfacce di attestazione TEE** — Supporto all'attestazione in Trusted Execution Environment per dimostrare l'integrità della generazione delle chiavi PQC
* **Framework di agilità algoritmica** — Registro di algoritmi pluggable che consente di aggiungere futuri algoritmi PQC tramite governance senza upgrade della chain

## v1.0.0 — Genesis (motore di tokenomics)

**Focus della release:** lancio iniziale del protocollo con tokenomics completa, esecuzione multi-VM e operazioni assistite da AI.

* **Modulo x/burn** — Meccanismo di burn delle fee multicanale con distribuzione a quattro vie tra validatori, burn, treasury e staker
* **Modulo x/xqore** — Derivato di staking di governance con penalità di sblocco anticipato a livelli e redistribuzione del rebase in modalità PvP
* **Modulo x/inflation** — Emissione basata su epoche con decadimento annuale, governata dal modello economico a emissione finita
* **Layer di consenso PRISM** — Ottimizzazione a reinforcement learning (PPO) per il tuning dinamico dei parametri della chain con controlli di sicurezza a circuit-breaker
* **CPoS a triplo pool** — Classified Proof-of-Stake con pool di validatori Emerald, Sapphire e Ruby ponderati per punteggio di reputazione
* **Governance QDRW** — Sistema di Dynamic Reward Weighting che consente aggiustamenti approvati dalla governance della distribuzione delle ricompense tra i pool
* **Runtime EVM + CosmWasm + SVM** — Tre ambienti di esecuzione concorrenti: il QoreChain EVM Engine, gli smart contract CosmWasm e la Solana Virtual Machine
* **Bridge cross-VM** — Passaggio di messaggi e trasferimenti di asset tra i runtime EVM, CosmWasm e SVM all'interno di un singolo blocco
* **Crittografia post-quantistica** — Firma resistente al quantistico basata su una libreria PQC ad alte prestazioni
* **QCAI** — Analisi euristica on-chain con sidecar off-chain opzionale per rilevamento delle frodi, stima delle fee e ottimizzazione della rete
* **Deployment containerizzato** — Deployment completo di testnet multi-validatore con servizio sidecar e block indexer
* **Block indexer** — Listener dei blocchi con archiviazione persistente per query storiche e analytics
