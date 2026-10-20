---
slug: /introduction/key-features
title: Funzionalità Principali
sidebar_label: Funzionalità Principali
sidebar_position: 3
---

# Funzionalità Principali

La tabella seguente elenca tutte le funzionalità principali di QoreChain, organizzate in base alla fase di rilascio in cui sono state introdotte. La mainnet (`qorechain-vladi`, EVM chain ID 9801), attiva dal 7 giugno 2026, esegue la **v3.2.3** fino all'altezza 3.742.566 e la **v3.2.4** da quel blocco; la testnet parallela (`qorechain-diana`, EVM chain ID 9800) esegue la v3.2.4 dal 19 ottobre 2026. La tabella [Stato delle funzionalità](#feature-status) al termine dell'elenco mostra cosa è attivo oggi sulle reti live.

| Funzionalità                    | Introdotta in       | Descrizione                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firme Ibride PQC (obbligatorie per impostazione predefinita) | v1.1.0 (Sicurezza)   | Firme doppie su ogni transazione cosmos-path: una firma classica secp256k1 (ECDSA) abbinata a ML-DSA-87 (Dilithium-5). A partire dalla v3.1.71 l'impostazione predefinita della rete è **obbligatoria** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — le transazioni cosmos solo classiche vengono rifiutate; sono esenti solo i gentx di genesi e le transazioni di registrazione/migrazione delle chiavi PQC. Le transazioni EVM mantengono la loro firma `eth_secp256k1` ma, dalla v3.2.0, sono ammesse solo da un account con una chiave ML-DSA-87 registrata e una [finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window) aperta. Restano disponibili tre modalità di applicazione controllate dalla governance (disabled / optional / required). |
| Hash SHAKE-256 Predefinito     | v1.1.0 (Sicurezza)   | Funzione XOF (extendable-output function) della famiglia SHA-3. A partire dalla v3.1.73, SHAKE-256 (tramite il pacchetto `qorehash`) è l'**hash predefinito dell'applicazione**, completando la baseline PQC (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Fornisce hashing a lunghezza variabile, output fisso a 32 byte, concatenazione dei nodi interni Merkle e hashing con separazione di dominio — tutto in puro Go, senza dipendenze FFI.                                                                                                                 |
| Interfacce TEE e FL      | v1.1.0 (Sicurezza)   | Specifiche di interfaccia (ancora senza implementazione) per l'attestazione Trusted Execution Environment (SGX, TDX, SEV-SNP, ARM CCA) e il coordinamento del Federated Learning (metodi di aggregazione FedAvg, FedProx, SCAFFOLD); entrambe sono previste per una release futura.                                                                |
| Consenso RL On-Chain (PRISM) | v1.0.0 (Genesis) | Un MLP a virgola fissa nativo in Go (73.733 parametri) è integrato nel ciclo di vita del blocco per l'inferenza PPO. PRISM è progettato per regolare il tempo di blocco, il prezzo del gas e i pesi dei pool; sulle reti live per ora si limita a osservare (non è caricata alcuna policy addestrata e i messaggi di controllo sono disabilitati). La matematica deterministica basata su serie di Taylor è progettata per dare risultati identici su tutti i validatori. Quattro modalità operative (shadow, conservative, autonomous, paused); entrambe le reti sono impostate su conservative. Protezione circuit breaker per la sicurezza. |
| PoS Composito a Tre Pool  | v1.0.0 (Genesis)    | Progettato così: i validatori vengono classificati in pool RPoS (ponderato per reputazione), DPoS (ponderato per delega) e PoS (standard) ogni 1.000 blocchi. Il sortition ponderato per pool diversificherebbe la produzione dei blocchi oltre la pura dominanza dello stake, e una curva di bonding personalizzata terrebbe conto dello stake auto-vincolato, della durata della fedeltà, della qualità della reputazione e della fase del protocollo. Implementato in `x/qca` ma **non ancora attivo nella produzione dei blocchi, nelle ricompense né nello slashing**; la proposta dei blocchi e lo slashing seguono attualmente le regole standard ponderate per stake. |
| Governance QDRW            | v1.0.0 (Genesis)    | Delega Quadratica con Ponderazione della Reputazione. Progettata in modo che il potere di voto utilizzi una funzione a radice quadrata smorzata da un moltiplicatore di reputazione sigmoide, prevenendo la cattura da parte delle whale e allo stesso tempo premiando la partecipazione onesta a lungo termine (un vantaggio di stake di 100x produce circa 10x di potere di voto; il possesso di xQORE raddoppia il peso del voto). Implementata ma **disabilitata sulle reti live** (`qdrw` è disattivato); le proposte vengono attualmente conteggiate sullo stake vincolato. |
| Motore di Burn                | v1.0.0 (Genesis)    | Dodici fonti di burn (commissioni di gas, creazione di contratti, commissioni dei servizi AI, commissioni del bridge, riacquisto del treasury, transazioni fallite, penalità xQORE, riacquisto automatizzato, il burn del TGE, creazione di rollup, traguardi sul numero di transazioni e AMM); sulla mainnet finora solo i canali delle commissioni di gas e delle transazioni fallite hanno registrato burn. Tutto ciò che confluisce nel fee collector, inclusa l'emissione di epoca, viene suddiviso **37% ai validatori, 30% bruciato in modo permanente, 20% al treasury, 10% agli staker e 3% ai light node**. |
| Staking xQORE              | v1.0.0 (Genesis)    | Non ancora attivo: le transazioni di lock e unlock del modulo non sono collegate alle reti live (vedi [Staking xQORE](/user-guide/xqore-staking)). Comportamento previsto: blocca QOR per coniare xQORE con un rapporto 1:1, ottenendo un peso di governance raddoppiato nei voti QDRW. Le penalità di uscita graduate (50% sotto i 30 giorni, 35% tra 30 e 90 giorni, 15% tra 90 e 180 giorni, 0% oltre i 180 giorni) vengono ridistribuite ai detentori rimanenti tramite rebase PvP — premiando la convinzione e penalizzando il capitale a breve termine. |
| Emissione con Tetto Massimo     | v1.0.0 (Genesis)    | Un percorso di offerta finita: 4.420.000.000 QOR alla genesi (80.000.000 QOR dei 4.500.000.000 previsti sono stati bruciati al TGE) più l'emissione di staking coniata da `x/inflation` sotto un limite cumulativo rigido di 590.000.000 QOR (86.000 QOR per epoca di 43.200 blocchi in modalità `fixed`, dalla proposta di governance 10 dell'ottobre 2026). I burn rimuovono definitivamente i token. Vedi [Tokenomics](/architecture/tokenomics#supply-and-emission). |
| Runtime EVM                | v1.0.0 (Genesis)    | Piena compatibilità con Ethereum grazie al gas pricing EIP-1559, JSON-RPC sulla porta 8545 (namespace `eth_`, `web3_`, `net_` e `txpool_`; il namespace `qor_` non è ancora servito) e supporto per gli strumenti standard (Hardhat, Foundry, Remix). Distribuisci e interagisci con contratti Solidity utilizzando i flussi di lavoro Ethereum esistenti; dalla v3.2.0 il mittente deve avere una chiave post-quantistica registrata e una [finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window) aperta. |
| Runtime QoreChain Native           | v1.0.0 (Genesis)    | Il nome che QoreChain dà al proprio runtime CosmWasm: un motore di smart contract WebAssembly per contratti basati su Rust. Supporto completo del ciclo di vita: instantiate, execute, query e migrate. I contratti vengono eseguiti in un ambiente Wasm sandbox con esecuzione deterministica. Il caricamento del codice e l'istanziazione sono attualmente **disabilitati** su entrambe le reti (impostazione di governance più circuit breaker). |
| Runtime SVM                | v1.0.0 (Genesis)    | Distribuzione ed esecuzione di programmi BPF tramite un executor basato su Rust. Il server JSON-RPC compatibile con Solana sulla porta 8899 supporta `getAccountInfo`, `getBalance`, `getSlot` e altro ancora. I metodi di lettura funzionano sugli endpoint pubblici; la lane delle transazioni SVM è attualmente **disabilitata** a livello di rete. |
| Bridge Cross-VM            | v1.0.0 (Genesis)    | Interoperabilità senza soluzione di continuità tra tutte e tre le VM. I contratti EVM chiamano QoreChain Native tramite precompile (non ancora attivo, vedi [Stato della rete](/developer-guide/evm-precompiles#network-status)); i contratti QoreChain Native chiamano EVM tramite messaggi personalizzati; i programmi SVM partecipano tramite bridging asincrono basato su eventi. Chiamate sincrone EVM-QoreChain Native e messaggistica asincrona SVM all'interno di un'unica chain. Il messaggio di chiamata cross-VM è attualmente disattivato sulla mainnet. |
| Connettività Cross-Chain   | v1.2.0 (Interoperabilità)    | Progettata per un massimo di otto controparti IBC (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) più **37 configurazioni di chain QCB (36 chain esterne più Injective tramite IBC)**. Attestazioni dei validatori firmate PQC, profondità di conferma per singola chain e limiti di volume circuit breaker. A ottobre 2026 tutte le 37 configurazioni di chain sono in stato `pending` e nessun canale IBC è aperto su nessuna delle due reti — **non live**. |
| Restaking BTC              | v1.2.0 (Interoperabilità)    | Fase di progettazione — le transazioni del modulo non sono abilitate sulle reti live. Integrazione con Babylon Protocol per garanzie di finalità Bitcoin. I validatori registrerebbero posizioni di staking BTC (minimo 100.000 satoshi). Le state root delle epoche di QoreChain verrebbero periodicamente sottoposte a checkpoint su Bitcoin tramite epoche Babylon relayed via IBC, fornendo un livello di finalità secondario supportato dall'hashrate BTC. |
| Account Abstraction        | v1.2.0 (Interoperabilità)    | Smart account programmabili a livello di protocollo (simile a ERC-4337). Tre tipi di account: multisig, social recovery e basati su sessione. Chiavi di sessione con permessi granulari e scadenza, regole di spesa giornaliere e per transazione a livello di account, e allowlist di denom con ambito limitato. Implementata ma attualmente **disattivata** su entrambe le reti (`abstractaccount.enabled = false`; consulta `GET /qorechain/abstractaccount/v1/config`). |
| Protezione MEV             | v1.2.0 (Interoperabilità)    | Framework FairBlock a crittografia threshold identity-based (tIBE) per mempool cifrate, progettato per mantenere le transazioni opache ai proposer di blocco fino all'inclusione. L'ante handler FairBlockDecorator è collegato; la decifratura threshold tIBE si attiva dopo la distribuzione della key ceremony. Attualmente **disabilitata** su entrambe le reti (`enabled = false`). |
| Gas Abstraction            | v1.2.0 (Interoperabilità)    | Progettata per consentire agli utenti di pagare le commissioni in un token non nativo accettato; la configurazione elenca `ibc/USDC` a un tasso di 1:1 e `ibc/ATOM` a 10:1. Nessun canale IBC è ancora aperto, quindi sulle reti non esiste alcun token di questo tipo e le commissioni sono attualmente pagate in QOR. |
| Prioritizzazione a 5 Corsie      | v1.2.0 (Interoperabilità)    | Le definizioni delle corsie (PQC, MEV, AI, Default, Free) esistono come configurazione, ma le corsie di spazio dei blocchi non sono applicate dalla mempool né dal gestore delle proposte live. |
| Liquidità On-Chain (AMM)   | v1.2.0 (Interoperabilità)    | Un market maker automatizzato nativo (`x/amm`) fornisce pool di liquidità on-chain e swap a livello di protocollo. Il modulo è attivo; non è ancora stato creato alcun pool. |
| Rollup RDK                | v1.3.0 (Rollup)    | Rollup Development Kit con quattro paradigmi di settlement (optimistic, zk, based, sovereign), cinque profili preimpostati (defi, gaming, nft, enterprise, custom), un DA router nativo con blob storage SHAKE-256 e pruning automatico, un ciclo di vita dell'escrow bancario con tasso di burn di creazione configurabile, auto-finalizzazione EndBlocker e configurazione assistita da PRISM tramite il modulo di consenso. Le funzionalità di rollup vengono fornite come framework host-chain; sulle reti live non è ancora stato creato alcun rollup. |
| Licenze della Chain            | v1.3.0 (Rollup)    | Il modulo `x/license` fornisce la licenza della chain in modo nativo al protocollo. |

## Stato delle funzionalità (ottobre 2026) {#feature-status}

Verificato sulle reti live il 20 ottobre 2026. «Live» significa che la funzionalità è attiva su mainnet (e, salvo diversa indicazione in una riga, su testnet); le descrizioni sopra indicano cosa ciascuna funzionalità è progettata per fare.

| Funzionalità | Stato sulle reti live |
| --- | --- |
| Firme ibride ML-DSA-87 + secp256k1 (lane Cosmos) | **Live**, obbligatorie (`hybrid_signature_mode = required`) |
| Finestra di autorizzazione EVM | **Live** dalla v3.2.0 (ambito opzionale dalla v3.2.3) |
| Staking con blocco temporale (`x/stakingtier`, facoltativo) | v3.2.4: live sulla testnet dal 19 ottobre 2026; sulla mainnet dall'altezza 3.742.566 |
| Runtime EVM, QoreChain Native, SVM | EVM **live**; caricamento del codice e istanziazione QoreChain Native **disabilitati** (impostazione di governance più circuit breaker); lane delle transazioni SVM **disabilitata** (le letture funzionano) |
| Motore di burn e suddivisione delle commissioni (37/30/20/10/3) | **Live**; solo i canali di burn delle commissioni di gas e delle transazioni fallite hanno registrato burn sulla mainnet |
| Emissione con tetto massimo (`x/inflation`) | **Live**, fissa a 86.000 QOR per epoca fino a un tetto di 590.000.000 QOR (mainnet) |
| Staking, slashing, governance | **Live** (moduli standard; vedi [Parametri della chain](/appendix/chain-parameters)) |
| Ricompense dei light node | Contabilizzazione delle ricompense **live**; registrazione **aperta** e subordinata a una licenza, nessun light node ancora registrato (vedi [stato](/light-node/overview#reward-program-status)) |
| AMM (`x/amm`) | Modulo **live**, nessun pool ancora creato |
| PRISM (`x/rlconsensus`) | **Solo osservazione** — nessuna policy caricata |
| CPoS a Tre Pool / QDRW (`x/qca`) | Implementati, **non collegati** alla produzione dei blocchi, alle ricompense né al conteggio |
| xQORE (`x/xqore`) | Solo contabilità — **ancora nessuna transazione di lock/unlock** |
| Smart account / wallet collegati (`x/abstractaccount`) | Implementati, **disattivati** (`enabled = false`) |
| Rollup Development Kit (`x/rdk`), multilayer | Moduli **live**, nessun rollup o layer ancora creato |
| Bridge cross-chain, IBC, restaking Babylon | **Pending** — tutte le 37 configurazioni di chain sono `pending`, nessun canale IBC aperto, nessuna transazione di restaking |
| Protezione MEV FairBlock | **Disabilitata** (`enabled = false`) |
| Precompile EVM, namespace JSON-RPC `qor_` | **Non attivi / non serviti** (l'elenco dei precompile attivi è vuoto) |

## Cronologia delle Versioni

<details>

<summary>v1.0.0 — Rilascio Genesis</summary>

Ha stabilito il protocollo di base con crittografia post-quantistica (Dilithium-5, ML-KEM-1024), il livello di consenso PRISM basato su reinforcement learning on-chain, il runtime a tripla VM (EVM, QoreChain Native, SVM) con messaggistica cross-VM, il motore di tokenomics (burn, xQORE, modulo di emissione), la selezione dei validatori PoS Composito a Tre Pool, la governance quadratica QDRW e la pipeline di elaborazione delle transazioni AI.

</details>

<details>

<summary>v1.1.0 — Rilascio di rafforzamento della sicurezza</summary>

Ha introdotto un'architettura di firma ibrida che abbina una firma classica secp256k1 (ECDSA) a ML-DSA-87, con tre modalità di applicazione controllate dalla governance, la base hash post-quantistica SHAKE-256 per la futura sostituzione dell'albero Merkle, e specifiche di interfaccia pronte per la produzione per l'attestazione TEE (SGX, TDX, SEV-SNP, ARM CCA) e il coordinamento del federated learning (FedAvg, FedProx, SCAFFOLD).

</details>

<details>

<summary>v1.2.0 — Rilascio di interoperabilità e UX</summary>

Ha aggiunto la connettività cross-chain (8 canali IBC + 37 configurazioni QCB che coprono 36 chain esterne, attualmente in stato testnet/pending), il restaking BTC tramite Babylon Protocol, l'account abstraction con chiavi di sessione e social recovery, il framework di protezione MEV FairBlock, l'astrazione del gas multi-token, la liquidità on-chain (`x/amm`) e la prioritizzazione dello spazio dei blocchi a 5 corsie.

</details>

<details>

<summary>v1.3.0 — Rilascio dell'ecosistema rollup</summary>

Ha rilasciato il Rollup Development Kit con quattro paradigmi di settlement (optimistic, zk, based, sovereign), cinque profili di distribuzione preimpostati (defi, gaming, nft, enterprise, custom), un DA router nativo, la gestione del ciclo di vita dell'escrow bancario, l'auto-finalizzazione guidata da EndBlocker, la configurazione dei rollup assistita da PRISM e la licenza della chain (`x/license`). Integrazione profonda con il modulo di architettura multilayer per la registrazione automatica delle sidechain e l'ancoraggio dello stato.

</details>

## Correlati

* [Cos'è QoreChain](/introduction/what-is-qorechain) — panoramica della piattaforma nel contesto.
* [Tokenomics](/architecture/tokenomics) — il modello economico alla base di QOR.
* [Bridge Architecture](/architecture/bridge-architecture) — connettività cross-chain e restaking BTC.
* [Panoramica dei Rollup](/rollups/overview) — il Rollup Development Kit e i paradigmi di settlement.
