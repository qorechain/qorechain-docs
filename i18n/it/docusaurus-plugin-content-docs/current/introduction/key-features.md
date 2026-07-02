---
slug: /introduction/key-features
title: Funzionalità Principali
sidebar_label: Funzionalità Principali
sidebar_position: 3
---

# Funzionalità Principali

La tabella seguente elenca tutte le principali funzionalità di QoreChain, organizzate in base alla fase di rilascio in cui sono state introdotte. La versione corrente della chain è **v3.1.82**, con la mainnet (`qorechain-vladi`, EVM chain ID 9801) attiva dal 7 giugno 2026 e una testnet parallela (`qorechain-diana`, EVM chain ID 9800).

| Funzionalità               | Introdotta in       | Descrizione                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firme Ibride PQC (obbligatorie per impostazione predefinita) | v1.1.0 (Sicurezza)   | Firme duali su ogni transazione del percorso cosmos: una firma classica secp256k1 (ECDSA) abbinata a ML-DSA-87 (Dilithium-5). A partire da v3.1.71 l'impostazione predefinita della rete è **required** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) — le transazioni cosmos solo classiche vengono rifiutate; solo le gentx di genesis e le transazioni di registrazione/migrazione delle chiavi PQC sono esenti. Le transazioni EVM utilizzano un percorso `eth_secp256k1` separato e non ne sono interessate. Restano disponibili tre modalità di applicazione controllate dalla governance (disabled / optional / required). Onboarding fluido del wallet tramite auto-registrazione dell'estensione TX. |
| Hash Predefinito SHAKE-256 | v1.1.0 (Sicurezza)   | Funzione a output estendibile (XOF) della famiglia SHA-3. A partire da v3.1.73, SHAKE-256 (tramite il pacchetto `qorehash`) è l'**hash applicativo predefinito**, completando la baseline PQC (Dilithium-5 + ML-KEM-1024 + SHAKE-256). Fornisce hashing a lunghezza variabile, output fisso di 32 byte, concatenazione dei nodi interni di Merkle e hashing con separazione di dominio — tutto in puro Go senza dipendenze FFI. |
| Interfacce TEE e FL        | v1.1.0 (Sicurezza)   | Specifiche di interfaccia di livello produttivo per l'attestazione del Trusted Execution Environment (SGX, TDX, SEV-SNP, ARM CCA) e il coordinamento del Federated Learning (metodi di aggregazione FedAvg, FedProx, SCAFFOLD). Abilita l'inferenza AI in enclave hardware e l'addestramento distribuito di modelli che preserva la privacy con garanzie crittografiche. |
| Consenso RL On-Chain (PRISM) | v1.0.0 (Genesis) | Un MLP a virgola fissa nativo in Go (73.733 parametri) esegue l'inferenza PPO direttamente nel ciclo di vita del blocco. Il livello di ottimizzazione PRISM regola dinamicamente il tempo di blocco, i limiti di gas e i pesi dei pool di validatori senza oracoli esterni. La matematica deterministica con serie di Taylor garantisce risultati identici su tutti i validatori. Quattro modalità operative: shadow, conservative, autonomous e paused. Protezione con circuit breaker per la sicurezza. |
| Triple-Pool Composite PoS  | v1.0.0 (Genesis)    | I validatori vengono classificati in pool RPoS (pesati per reputazione), DPoS (pesati per delega) e PoS (standard) ogni 1.000 blocchi sul QoreChain Consensus Engine. Il sorteggio pesato per pool diversifica la produzione dei blocchi oltre la pura dominanza dello stake. La bonding curve personalizzata tiene conto dello stake auto-vincolato, della durata della fedeltà, della qualità della reputazione e della fase del protocollo. |
| Governance QDRW            | v1.0.0 (Genesis)    | Quadratic Delegation with Reputation Weighting. Il potere di voto utilizza una funzione radice quadrata smorzata da un moltiplicatore di reputazione sigmoideo, prevenendo la cattura da parte delle whale e premiando al contempo la partecipazione onesta a lungo termine. Un vantaggio di stake di 100x produce circa 10x di potere di voto. Le partecipazioni xQORE raddoppiano il peso di voto. |
| Burn Engine                | v1.0.0 (Genesis)    | Dieci distinti canali di burn: commissioni di transazione, penalità di governance, slashing, commissioni di bridge, deterrenza dello spam, eccedenza di epoca, burn manuali, callback dei contratti, commissioni cross-VM e burn di creazione dei rollup. Le commissioni raccolte vengono suddivise **37% ai validatori, 30% bruciate permanentemente, 20% al tesoro, 10% agli staker e 3% ai light node**. |
| Staking xQORE              | v1.0.0 (Genesis)    | Blocca QOR per coniare xQORE con un rapporto 1:1 per un peso di governance raddoppiato nelle votazioni QDRW. Le penalità di uscita graduate (50% sotto i 30 giorni, 35% tra 30 e 90 giorni, 15% tra 90 e 180 giorni, 0% dopo 180 giorni) vengono ridistribuite ai detentori rimanenti tramite il rebase PvP — premiando la convinzione e penalizzando il capitale a breve termine. |
| Emissioni a Offerta Fissa  | v1.0.0 (Genesis)    | Un'offerta totale fissa di 4.500.000.000 QOR (80.000.000 bruciati al TGE) con un budget finito di ricompense di staking di 590.000.000 QOR: Anno 1 con APY 8–12% (127.500.000 QOR), Anno 2 con APY 6–10% (106.250.000 QOR), Anni 3–4 con APY 5–8% (85.000.000 QOR all'anno) e Anno 5+ determinato dalla governance (~186.000.000 QOR rimanenti). Combinato con il burn engine, QOR converge verso un comportamento net-deflazionistico man mano che il volume delle transazioni aumenta. |
| Runtime EVM                | v1.0.0 (Genesis)    | Piena compatibilità con Ethereum con pricing del gas EIP-1559, JSON-RPC sulla porta 8545 (namespace `eth_`, `web3_`, `net_`, `txpool_`, `qor_`) e supporto degli strumenti standard (Hardhat, Foundry, Remix). Distribuisci e interagisci con contratti Solidity usando i flussi di lavoro Ethereum esistenti. |
| Runtime CosmWasm           | v1.0.0 (Genesis)    | Motore di smart contract WebAssembly per contratti basati su Rust. Supporto completo del ciclo di vita: instantiate, execute, query e migrate. I contratti vengono eseguiti in un ambiente Wasm in sandbox con esecuzione deterministica. |
| Runtime SVM                | v1.0.0 (Genesis)    | Distribuzione ed esecuzione di programmi BPF tramite un esecutore basato su Rust. Il server JSON-RPC compatibile con Solana sulla porta 8899 supporta `getAccountInfo`, `getBalance`, `getSlot` e altro ancora. I client e gli strumenti Solana esistenti funzionano senza modifiche. |
| Bridge Cross-VM            | v1.0.0 (Genesis)    | Interoperabilità fluida tra tutte e tre le VM. I contratti EVM chiamano CosmWasm tramite precompile; i contratti CosmWasm chiamano EVM tramite messaggi personalizzati; i programmi SVM partecipano tramite bridging asincrono basato su eventi. Chiamate sincrone EVM-CosmWasm e messaggistica SVM asincrona all'interno di un'unica chain. |
| Connettività Cross-Chain   | v1.2.0 (Interop)    | Otto canali IBC (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective) più **37 configurazioni QCB che coprono 36 chain esterne** (incluso QoreChain stesso come loopback nativo). Attestazioni dei validatori firmate con PQC, profondità di conferma per chain e limiti di volume con circuit breaker. Attualmente in stato di testnet / pending — non ancora in produzione. |
| Restaking BTC              | v1.2.0 (Interop)    | Integrazione del Babylon Protocol per le garanzie di finalità di Bitcoin. I validatori registrano posizioni di staking BTC (minimo 100.000 satoshi). Le radici di stato delle epoche di QoreChain vengono periodicamente sottoposte a checkpoint su Bitcoin tramite epoche Babylon trasmesse via IBC, fornendo un livello di finalità secondario supportato dall'hashrate BTC. |
| Account Abstraction        | v1.2.0 (Interop)    | Smart account programmabili a livello di protocollo (simili a ERC-4337). Tre tipi di account: multisig, social recovery e basati su sessione. Session key con permessi granulari e scadenza, regole di spesa giornaliere per account e per transazione, allowlist di denom con ambito definito e applicazione automatica delle regole al consenso. |
| Protezione MEV             | v1.2.0 (Interop)    | Framework FairBlock di crittografia basata sull'identità con soglia (tIBE) per mempool cifrati. Le transazioni sono crittograficamente opache ai proponenti dei blocchi fino a dopo l'inclusione, eliminando il front-running e gli attacchi sandwich. L'ante handler FairBlockDecorator è collegato e pronto; la decifratura a soglia tIBE si attiva dopo il deployment della cerimonia delle chiavi. |
| Gas Abstraction            | v1.2.0 (Interop)    | Il pagamento del gas multi-token elimina l'obbligo di detenere QOR nativo per le commissioni di transazione. Gli utenti possono pagare con token accettati trasferiti via IBC: ibc/USDC a un tasso 1:1 e ibc/ATOM a un tasso 10:1. Il GasAbstractionDecorator convalida e converte i denom di commissione non nativi prima della deduzione standard delle commissioni. |
| Prioritizzazione a 5 Corsie | v1.2.0 (Interop)    | Lo spazio dei blocchi è partizionato staticamente in cinque corsie di priorità: PQC (priorità 100, 15% dello spazio), MEV (90, 20%), AI (80, 15%), Default (50, 40%) e Free (10, 10%). Le transazioni critiche per la sicurezza non possono mai essere soffocate dal traffico standard ad alto volume. |
| Liquidità On-Chain (AMM)   | v1.2.0 (Interop)    | Il market maker automatizzato nativo (`x/amm`) fornisce pool di liquidità on-chain e swap a livello di protocollo. |
| Rollup RDK                 | v1.3.0 (Rollup)    | Rollup Development Kit con quattro paradigmi di settlement (optimistic, zk, based, sovereign), cinque profili preconfigurati (defi, gaming, nft, enterprise, custom), router DA nativo con archiviazione blob SHA-256 e pruning automatico, ciclo di vita dell'escrow bancario con tasso di burn di creazione configurabile, auto-finalizzazione nell'EndBlocker e configurazione assistita da PRISM tramite il modulo di consenso. Le capacità di rollup sono fornite come framework della host chain. |
| Licensing della Chain      | v1.3.0 (Rollup)    | Il modulo `x/license` fornisce il licensing della chain nativo a livello di protocollo. |

## Cronologia delle Versioni

<details>

<summary>v1.0.0 — Rilascio Genesis</summary>

Ha stabilito il protocollo principale con crittografia post-quantistica (Dilithium-5, ML-KEM-1024), il livello di consenso ad apprendimento per rinforzo on-chain PRISM, il runtime triple-VM (EVM, CosmWasm, SVM) con messaggistica cross-VM, il motore di tokenomics a offerta fissa (burn, xQORE, budget di emissione finito), la selezione dei validatori Triple-Pool Composite PoS, la governance quadratica QDRW e la pipeline di elaborazione AI delle transazioni.

</details>

<details>

<summary>v1.1.0 — Rilascio di rafforzamento della sicurezza</summary>

Ha introdotto l'architettura di firma ibrida che abbina una firma classica secp256k1 (ECDSA) a ML-DSA-87, con tre modalità di applicazione controllate dalla governance, la base di hash post-quantistico SHAKE-256 per la futura sostituzione dell'albero di Merkle e specifiche di interfaccia di livello produttivo per l'attestazione TEE (SGX, TDX, SEV-SNP, ARM CCA) e il coordinamento del federated learning (FedAvg, FedProx, SCAFFOLD).

</details>

<details>

<summary>v1.2.0 — Rilascio di interoperabilità e UX</summary>

Ha aggiunto la connettività cross-chain (8 canali IBC + 37 configurazioni QCB che coprono 36 chain esterne, attualmente in testnet/pending), il restaking BTC tramite Babylon Protocol, l'astrazione di smart account con session key e social recovery, il framework di protezione MEV FairBlock, l'astrazione del gas multi-token, la liquidità on-chain (`x/amm`) e la prioritizzazione dello spazio dei blocchi a 5 corsie.

</details>

<details>

<summary>v1.3.0 — Rilascio dell'ecosistema rollup</summary>

Ha rilasciato il Rollup Development Kit con quattro paradigmi di settlement (optimistic, zk, based, sovereign), cinque profili di deployment preconfigurati (defi, gaming, nft, enterprise, custom), un router DA nativo, la gestione del ciclo di vita dell'escrow bancario, l'auto-finalizzazione guidata dall'EndBlocker, la configurazione dei rollup assistita da PRISM e il licensing della chain (`x/license`). Profonda integrazione con il modulo di architettura multilayer per la registrazione automatica delle sidechain e l'ancoraggio dello stato.

</details>

## Correlati

* [Cos'è QoreChain](/introduction/what-is-qorechain) — la panoramica della piattaforma nel suo contesto.
* [Tokenomics](/architecture/tokenomics) — il modello economico dietro QOR.
* [Architettura del Bridge](/architecture/bridge-architecture) — connettività cross-chain e restaking BTC.
* [Panoramica dei Rollup](/rollups/overview) — il Rollup Development Kit e i paradigmi di settlement.
