---
slug: /appendix/version-history
title: Cronologia delle Versioni
sidebar_label: Cronologia delle Versioni
sidebar_position: 3
---

# Cronologia delle Versioni

Cronologia pubblica delle versioni di QoreChain. La mainnet **`qorechain-vladi`** (chain ID EVM **9801**, attiva dal 7 giugno 2026) esegue la **v3.2.4** (applicata dalla proposta di governance 13 all'altezza 3.742.566 il 23 ottobre 2026; la release precedente, la v3.2.3, è stata applicata all'altezza 3.662.051 il 20 ottobre 2026). La testnet **`qorechain-diana`** (chain ID EVM **9800**) esegue la **v3.2.4** dall'altezza 8.337.253 (19 ottobre 2026).

:::note
Le voci riportate di seguito sono riepiloghi di alto livello delle funzionalità. Le voci `v1.x` più datate sono conservate come registro storico della linea di release testnet che ha preceduto la mainnet. Il manifest di release ([Connessione alla Mainnet](/getting-started/connecting-to-mainnet)) viene promosso separatamente dal tagging e può essere in ritardo rispetto a un tag di un certo periodo — verificalo direttamente per sapere cosa scarica realmente una nuova installazione.
:::

## Cronologia della governance della mainnet {#governance-timeline}

Proposte che hanno modificato la mainnet in esecuzione dal 14 ottobre 2026. Tutte e sette sono proposte accelerate (periodo di votazione di un giorno); le proposte da 7 a 13 sono passate con tutto lo stake bonded votante a favore. L'elenco completo è disponibile su `GET /cosmos/gov/v1/proposals` all'indirizzo `https://api.qore.host`.

| Proposta | Cosa fa | Votazione | Esito |
| --- | --- | --- | --- |
| 7 | Applica la v3.2.2 all'altezza 3.556.788 | 14–15 ottobre 2026 (termina alle 21:24 UTC) | Approvata; applicata il 16 ottobre 2026 |
| 8 | Rilascia la riserva dei light node (3.156.983,796395 QOR) alla fondazione | 18–19 ottobre 2026 (termina alle 19:15 UTC) | Approvata |
| 9 | Rilascia la quota degli staker rimasta bloccata (6.693.045,921330 QOR) alla fondazione | 18–19 ottobre 2026 (termina alle 19:15 UTC) | Approvata |
| 10 | Emissione: imposta l'emissione fissa a 86.000 QOR per epoca e il cap cumulativo a 590.000.000 QOR (durata dell'epoca invariata; la prima epoca da 86.000 QOR inizia al blocco 3.672.000) | 18–19 ottobre 2026 (termina alle 19:15 UTC) | Approvata |
| 11 | Applica la v3.2.3 all'altezza 3.662.051 | 18–19 ottobre 2026 (termina alle 19:15 UTC) | Approvata; applicata il 20 ottobre 2026 |
| 12 | Rilascia alla fondazione la quota corretta degli staker rimasta bloccata (3.807.496,785528 QOR, ricalcolata all'altezza della v3.2.3) | dal 20 ottobre 2026 alle 20:01 UTC al 21 ottobre 2026 alle 20:01 UTC | Approvata |
| 13 | Upgrade coordinato alla v3.2.4 all'altezza 3.742.566: staking opzionale con blocco temporale, limite di ricompensa dei light node contato dalla registrazione, un flag di possesso per le chiavi post-quantistiche, prova di possesso per i validatori del bridge, la finestra di challenge dell'RDK in tempo di blocco e hardening locale al nodo | dal 20 ottobre 2026 alle 21:18 UTC al 21 ottobre 2026 alle 21:18 UTC | Approvata; applicata il 23 ottobre 2026 all'altezza 3.742.566 |

Vedi [Tokenomics](/architecture/tokenomics#stranded-and-reserve) per il significato delle release e [Governance](/user-guide/governance) per come votare.

---

## v3.2.4 — Finestra di registrazione dei light node e staking opzionale con blocco temporale (mainnet)

**Focus della release:** la release attuale su entrambe le reti. È stata eseguita prima sulla testnet `qorechain-diana`: la proposta di governance della testnet 13 l'ha applicata all'altezza **8.337.253** (19 ottobre 2026). Sulla mainnet la proposta di governance 13 l'ha applicata all'altezza **3.742.566** il 23 ottobre 2026: i nodi sono rimasti sulla v3.2.3 fino a quel blocco, si sono fermati lì e sono ripartiti sulla v3.2.4, e la firma delle transazioni non cambia. I manifest della mainnet e della testnet impostano entrambi `minCompatible` a 3.2.4, quindi un nodo che si unisce a una delle due reti ora ha bisogno della v3.2.4. Ogni funzionalità qui sotto è attiva su entrambe le reti.

* **Finestra di registrazione dei light node.** Il limite di ricompensa di un light node parte dal più recente tra il settlement precedente e la registrazione del nodo stesso, così una nuova registrazione non incassa un importo accumulato prima del suo ingresso.
* **Staking opzionale con blocco temporale (`x/stakingtier`, un nuovo modulo).** Un delegante può bloccare una parte di una delega per 3, 6 o 12 mesi; la parte bloccata non può essere undelegata né ridelegata, e uno sblocco anticipato è consentito con una penalità che viene bruciata. Il blocco minimo è di 10 QOR. Vedi [Staking e delega](/user-guide/staking-and-delegation#time-locked-staking).
* **Nuova modalità di emissione.** `x/inflation` acquisisce una terza modalità di emissione, `target_apy`, con un parametro `target_apy_bps` (`0` su entrambe le reti; la modalità in vigore sulla mainnet è ancora `fixed`). Cambiare la modalità di emissione di una rete è una decisione di governance separata; la modalità in vigore è mostrata in `/qorechain/inflation/v1/params`.
* **Flag `possession_proven`** sui record degli account post-quantistici; la prova di possesso per le chiavi degli account resta opzionale.
* **Prova di possesso dei validatori del bridge.** La registrazione di un validatore del bridge richiede una prova di possesso e una chiave che nessun altro validatore del bridge utilizzi.
* **Finestra di challenge dell'RDK in tempo di blocco.** La finestra di challenge ottimistica è contata in tempo di blocco anziché in un numero di blocchi da esso derivato.
* **Hardening locale al nodo** (limiti alle richieste JSON-RPC, budget dei chunk di state-sync, pre-controlli sulla registrazione delle chiavi) e nuove query (`protocol_features`, `auth_nonce` e i campi aggiuntivi del pool di ricompense dei light node, come `monthly_cap_active`).

## v3.2.3 — Secondo batch di sicurezza di ottobre

**Focus della release:** il secondo batch di hardening di ottobre, applicato sulla mainnet dalla proposta di governance 11 all'altezza **3.662.051** (20 ottobre 2026, 16:01 UTC); applicato in precedenza sulla testnet all'altezza 8.003.746 (15 ottobre). L'upgrade attiva 52 funzionalità del protocollo a quell'altezza; formato di firma, indirizzi, decimali, memo e fee restano invariati.

* **Integrità delle chiavi post-quantistiche.** Chiavi deboli, degeneri e già utilizzate vengono rifiutate alla registrazione; la manutenzione delle chiavi ibride è irrigidita; i messaggi di gestione delle chiavi post-quantistiche non possono più essere eseguiti tramite authz; un account non può rimuovere il proprio ultimo algoritmo di firma. La registrazione (`MsgRegisterPQCKeyV2`, `tx pqc register-key-v2 ... --pqc-key <name>`) accetta una **prova di possesso opzionale**, verificata quando presente.
* **Finestre EVM con ambito limitato.** `MsgOpenEVMWindow` accetta i campi opzionali `native_only` (solo trasferimenti semplici di QOR nativo) e `allowed_targets` (fino a 16 destinatari) che restringono una finestra. Vedi [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).
* **Ledger di escrow dei rollup** per l'RDK, una **coda cross-VM atomica** con hardening dei precompile e **autorizzazione canonica dello stake**.
* **Creazione del vesting solo verso sé stessi.** La creazione di un account di vesting può finanziare solo l'account del creatore (i tre messaggi di vesting restano inoltre disattivati sul circuit breaker).
* **Correzioni economiche.** L'anno di emissione è derivato dalla durata dell'epoca; il lavoro di end-block dell'AMM è limitato; i record di burn vengono potati; la quota degli staker rimasta bloccata registrata è stata ricalcolata all'altezza dell'upgrade da 0 a 3.807.496,79 QOR (vedi [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Limite mensile dei light node.** Il limite di ricompensa per nodo è ora espresso su base mensile: 2.000 QOR per nodo ogni 30 giorni, in proporzione al tempo di blocco e all'uptime.
* **Authority delle licenze governabile.** Un nuovo `MsgUpdateAuthority` consente alla governance di sostituire l'authority che concede le licenze.
* **Le build pubbliche rifiutano le reti pubbliche.** Un binario compilato dall'albero dei sorgenti pubblico si arresta se viene puntato a una rete live.
* **Nuove route di lettura.** I parametri e il record di epoca di `x/inflation` sono serviti via REST sulla mainnet (`/qorechain/inflation/v1/params`, `/epoch_info`).

## v3.2.2 — Aggiornamento delle dipendenze e primo batch di sicurezza di ottobre (mainnet)

**Focus della release:** un upgrade coordinato applicato sulla mainnet dalla proposta di governance 7 all'altezza **3.556.788** (16 ottobre 2026, 17:59 UTC); applicato sulla testnet all'altezza 6.905.034 (2 ottobre). Il formato di firma è invariato.

* **Dipendenze.** Cosmos SDK v0.53.8, motore di consenso v0.38.26 e ibc-go v10.7.
* **26 funzionalità del protocollo** si attivano all'altezza di upgrade, tra cui: la delega EIP-7702 richiede un consenso post-quantistico (`MsgAuthorizeEVMDelegation`, annullato da `MsgClearEVMDelegation` o `MsgCloseEVMWindow`); i limiti dei multisig sono applicati nell'esecuzione dei blocchi; l'ammissione dei validatori è controllata su ogni percorso; controlli di integrità dell'AMM; gli account di modulo non possono essere rivendicati tramite l'EVM; le transazioni pre-EIP-155 vengono rifiutate; la registrazione delle chiavi post-quantistiche convalida la chiave classica; il messaggio di anchor dell'RDK e del multilayer passa a una seconda forma (v2); e viene applicato il canale di burn delle transazioni fallite.

## v3.2.1 — Hardening dei nodi

**Focus della release:** una release di sicurezza locale al nodo per la mainnet (14 ottobre 2026): **nessuna altezza di upgrade, nessuna modifica del consenso e nessuna votazione di governance**. I nodi sulla v3.2.0 continuano a seguire la chain.

* Irrigidisce i limiti di risorse dell'API pubblica, pone dei limiti all'EVM JSON-RPC e al mempool, e propaga via gossip le transazioni EVM promosse.
* Fissa l'EVM chain ID nella configurazione del nodo e lo confronta con il chain ID di Cosmos; gli operatori devono impostare `evm-chain-id = 9801` in `app.toml` (un valore diverso viene registrato nei log come errore).
* Aggiorna la dipendenza del motore di consenso; mantieni l'orologio di sistema sincronizzato via NTP (uno scostamento superiore a 60 secondi arresta il nodo).
* Consigliata a ogni operatore; `minCompatible` nel manifest della mainnet era 3.2.0 all'epoca.

La v3.2.1 è stata applicata nodo per nodo e non ha un'altezza di upgrade; è stata superata sulla mainnet dalla v3.2.2 (16 ottobre), dalla v3.2.3 (20 ottobre) e dalla v3.2.4 (23 ottobre).

## v3.2.0 — Finestra di autorizzazione EVM e correzioni contabili

**Focus della release:** rendere il requisito post-quantistico effettivo su ogni corsia e chiudere due lacune contabili. Applicata sulla mainnet dalla proposta di governance n. 6 all'altezza **2.981.742** (25 settembre 2026, 12:07 UTC); applicata sulla testnet all'altezza 5.920.000.

* **Finestra di autorizzazione EVM (breaking per i wallet EVM).** Una transazione EVM è ora ammessa solo da un account che abbia una chiave ML-DSA-87 registrata **e** una finestra aperta. La finestra viene aperta con un messaggio della corsia Cosmos (`MsgOpenEVMWindow`, firmato post-quantistico) ed è limitata da blocchi (≤ 17.280), transazioni (≤ 1.000) e valore totale (valore trasferito più la fee massima di ciascuna transazione); `MsgCloseEVMWindow` la revoca. La firma Ethereum standard resta invariata all'interno di una finestra. La corsia EVM, che era stata disattivata sulla mainnet tramite il circuit breaker dal 16 settembre, è stata riaperta nello stesso blocco in cui la regola è entrata in vigore. Vedi [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).
* **Firma ibrida v2.** Le firme post-quantistiche sono ora calcolate su sign-bytes con tag di dominio e vincolati alla chain; la prima forma viene rifiutata dall'altezza di upgrade. I client consultano i piani di upgrade applicati del nodo per scegliere la forma; la CLI (`--sign-bytes auto`), l'SDK 0.8.x e wallet-adapter 0.2.x lo fanno. I payload di migrazione delle chiavi e di attestazione del bridge sono passati allo stesso schema. Vedi [Sicurezza post-quantistica](/architecture/post-quantum-security#sign-bytes-v2).
* **Quota degli staker pagata.** La quota del 10 % degli staker nella ripartizione delle fee veniva depositata dove non copriva alcun credito; da questo upgrade viene pagata come normale ricompensa di staking. L'importo già accumulato (6.693.045,92 QOR sulla mainnet) è registrato on-chain (`GET /qorechain/burn/v1/stranded_rewards`) e poteva essere spostato solo da un voto di governance (`MsgReleaseStrandedRewards`); la governance lo ha rilasciato a ottobre 2026 (vedi la [cronologia della governance](#governance-timeline) e [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Riserva delle ricompense dei light node.** La quota del 3 % dei light node accumulata mentre nessun nodo era idoneo (3.156.009,33 QOR sulla mainnet) è registrata come riserva (`GET /qorechain/lightnode/v1/reward_pool`), esclusa dalla distribuzione e spostabile solo dalla governance (rilasciata a ottobre 2026); in seguito la distribuzione paga solo quanto accumulato dall'esecuzione precedente, con un limite per nodo. La registrazione dei light node era ancora chiusa con questa release e da allora è stata aperta (vedi [Light Node](/light-node/overview#reward-program-status)).
* **Il limite di transazioni per mittente** è ora applicato (600 transazioni ogni 30 blocchi per mittente, in modo che i relayer possano operare).
* **La mappa delle versioni dei moduli dell'upgrade** ora elenca tutti i moduli (48), correggendo una lacuna che avrebbe interessato le migrazioni successive.
* Inoltre: account di modulo del bridge e payload di attestazione rafforzati, blocchi proposti convalidati, settlement dei rollup limitato al sequencer del rollup con escrow per rollup e un burn di creazione effettivo, stake del creatore multilayer bloccato alla registrazione e restituito alla dismissione, flag `enabled` dello smart account applicato su ogni percorso, e percorsi di ammissione dei validatori e di creazione del vesting chiusi all'annidamento authz.

## v3.1.96 + v3.1.97 — Blocco degli accessi QoreChain Native

**Focus della release:** chiudere l'upload e l'istanziazione permissionless del codice contratto, a seguito di un advisory di sicurezza a livello di settore per CosmWasm, il runtime su cui si basa QoreChain Native.

* **L'upload e l'istanziazione dei contratti richiedono ora un permesso esplicito.** `code_upload_access` e `instantiate_default_permission` sono impostati su `Nobody` sia su mainnet sia su testnet — verificato live, indipendentemente da quale dei due tag un dato nodo stia eseguendo, poiché si tratta di un parametro on-chain e non di qualcosa che solo i binari più recenti applicano. Vedi [Sviluppo QoreChain Native](/developer-guide/cosmwasm-development) per capire cosa significa questo se stai sviluppando un contratto. I contratti già istanziati non sono interessati — `execute` e `query` funzionano come prima. Su entrambe le reti i tre messaggi QoreChain Native di upload e istanziazione sono inoltre disattivati sul circuit breaker.
* **Build di release a indirizzo di posizione indipendente (PIE)**, secondo le linee guida di hardening dello stesso advisory, così l'indirizzo di memoria che un exploit dovrebbe indovinare viene randomizzato per ogni processo. I binari con linking dinamico hanno richiesto un solo flag di build; verificato che non rompe lo stato.

## v3.1.95 — Hardening EVM Cosmos

**Focus della release:** aggiornamento di sicurezza rolling alla libreria di contabilità dei saldi EVM.

* **Hardening dell'overflow** — Un percorso di aggiornamento dei saldi EVM ora fallisce in modo sicuro invece di eseguire un wrap silenzioso in una condizione di overflow estremo. Distribuito come aggiornamento rolling che non rompe il consenso — non è stata richiesta alcuna votazione di governance né un halt coordinato ad una determinata altezza.

## v3.1.94 — Cap di emissione e hardening dei messaggi amministrativi

**Focus della release:** allineare l'emissione delle ricompense di staking alle reali condizioni della rete, e irrigidire i controlli di autorizzazione sui messaggi amministrativi privilegiati.

* **Cap di emissione** — Una proposta di governance, approvata con il pieno supporto dello stake bonded e applicata all'altezza 2.122.074 (26 agosto 2026), ha sostituito il programma di emissione a decadimento originale con un importo fisso per epoca sotto un cap cumulativo rigido. Il programma originale era stato calibrato per una rete molto più matura e completamente bonded; rispetto allo stake bonded reale stava erogando molto più velocemente del previsto. L'importo per epoca e il cap sono stati aumentati dalla proposta di governance 10 il 19 ottobre 2026. Vedi [Tokenomics](/architecture/tokenomics#staking-reward-schedule) per i numeri attuali.
* **Hardening dei messaggi amministrativi** — Un insieme di messaggi amministrativi privilegiati, protetti da authority, ora verifica il firmatario rispetto all'indirizzo proprio del modulo di governance, invece di fidarsi di un valore trasportato nel messaggio stesso.
* Include inoltre la correzione di affidabilità dell'onboarding dei nodi della v3.1.92, per qualsiasi nodo che effettui l'upgrade direttamente a questa release.

## v3.1.92 — Affidabilità della sincronizzazione dei nodi

**Focus della release:** onboarding dei nodi più affidabile da snapshot e dall'archivio della chain pubblicato.

* **Correzione della sincronizzazione da snapshot e archivio** — Risolto un problema per cui un nodo che si ripristinava da uno snapshot di state-sync o dall'archivio della chain pubblicato poteva non riuscire a completare la sincronizzazione oltre determinati blocchi storici. L'onboarding tramite entrambi i percorsi ora si completa in modo affidabile.

## v3.1.90 — Conteggio dell'uptime dei light node

**Focus della release:** l'uptime misurato per l'idoneità alle ricompense dei light node ora si accumula in modo coerente nel tempo.

* **Uptime ad accumulo progressivo** — L'uptime rilevante per l'idoneità alle ricompense di un light node viene ora calcolato accumulando in avanti il numero atteso di heartbeat a partire dalla sua registrazione, in base all'intervallo di heartbeat in vigore in ciascun momento, anziché ricalcolando l'intera cronologia secondo l'intervallo attualmente in vigore. Una modifica di governance all'intervallo di heartbeat influisce quindi sull'uptime solo da quel momento in avanti, e non rivaluta mai retroattivamente le prestazioni passate di un nodo.

## v3.1.86 — Salvaguardia del recupero dei validatori

**Focus della release:** un validatore non può più restare bloccato in modo permanente nel recupero da una jail per downtime.

* **Correzione del blocco da jail** — Un account operatore di validatore senza chiave post-quantistica registrata può ora sempre inviare `MsgUnjail` per recuperare da una jail per downtime, anche quando l'enforcement delle firme ibride è impostato su required con il fallback classico disabilitato. In precedenza, un simile account non aveva alcun percorso di recupero, poiché l'unjailing stesso richiedeva l'invio di una transazione che gli era impedito di inviare.
* **Snapshot di state-sync** — La generazione di snapshot è abilitata su tutta la rete, permettendo a nuovi validatori e full node di unirsi rapidamente tramite state sync invece che tramite un replay storico completo.

## v3.1.85 — Spesa delegata tramite wallet collegati

**Focus della release:** una chiave di wallet esterno collegata (Phantom, MetaMask) può ora **spendere** dall'unico account canonico post-quantistico — con permessi a privilegio minimo, limiti di spesa e revoca istantanea.

* **Corsie di esecuzione per authenticator** — Due nuovi messaggi permettono a un authenticator registrato di autorizzare trasferimenti dall'account canonico senza la presenza del titolare dell'account: **`MsgExecuteEVM`** (una chiamata/trasferimento EVM dall'indirizzo `0x…` dell'account) e **`MsgExecuteCosmos`** (un invio bank sulla corsia Native). Un **relayer** invia e paga l'envelope — la sua firma ibrida PQC soddisfa i requisiti della transazione — mentre la firma dell'authenticator su sign bytes con separazione di dominio e protezione anti-replay costituisce l'autorizzazione. La chiave esterna non necessita mai di una co-firma ML-DSA.
* **MetaMask come authenticator** — Gli authenticator secp256k1 possono ora essere registrati tramite il loro **indirizzo Ethereum a 20 byte** e verificati via **EIP-191 `personal_sign`** (oltre alla forma a chiave compressa da 33 byte), così un normale account MetaMask può essere collegato e spendere entro i limiti.
* **Enforcement su tutte e tre le corsie** — Gli scope dei permessi e i limiti di valore **SpendingRule** (per transazione + massimali giornalieri) sono applicati sulle corsie Native, EVM e SVM; i messaggi di gestione delle chiavi non sono mai delegabili. Codici di errore distinti consentono ai wallet di mostrare il messaggio corretto: `5` limite di spesa superato, `6` authenticator scaduto, `10` permesso negato, `11` replay rifiutato.
* **Query dello schema dei permessi** — `GET /qorechain/abstractaccount/v1/permission_schema` (anche gRPC/CLI) restituisce la tassonomia canonica dei permessi (11 permessi), la mappa messaggio→permesso e l'elenco dei messaggi non delegabili, così i wallet convalidano gli scope senza hardcoding.
* **Rotazione della chiave PQC nello stesso algoritmo** — Il nuovo **`MsgRotatePQCKey`** ruota la chiave ML-DSA-87 di un account all'interno dello stesso algoritmo (con doppia firma della vecchia e della nuova chiave), consentendo la migrazione delle chiavi con derivazione legacy alla derivazione canonica vincolata all'indirizzo e il ritiro di una chiave compromessa. Nuovi comandi CLI: `tx pqc rotate-key` e `tx pqc recover-key` (recupero deterministico della chiave da una mnemonica).
* **Transazioni con chiave root invariate** — Le modifiche sono additive; i normali flussi di wallet ed exchange restano invariati. Gli operatori di nodi devono trovarsi sulla **v3.1.85** entro l'altezza di upgrade della rete.
* **Stato attuale** — Le funzionalità di smart account e di wallet collegato sono implementate ma attualmente **disattivate** su entrambe le reti (`abstractaccount.enabled = false`); dalla v3.2.0 ogni percorso degli authenticator viene rifiutato finché il flag è disattivato. Controlla `GET /qorechain/abstractaccount/v1/config` prima di proporre un flusso di collegamento.

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
* **Allineamento a Tokenomics v2.1** — Distribuzione delle fee e meccaniche di emissione allineate al modello economico a supply fissa ed emissione finita (in seguito affinato dal cap di emissione della v3.1.94).

## v3.0.0 — Genesis della mainnet

**Focus della release:** lancio della mainnet ed evento di generazione del token.

* **Genesis della mainnet** — La mainnet QoreChain (`qorechain-vladi`, chain ID EVM 9801) è attiva dal **7 giugno 2026**, con il token generation event (TGE) alla genesis.
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

* *(Progettato; il layer cross-chain è ancora in sospeso — vedi [Architettura del bridge](/architecture/bridge-architecture).)* **25 connessioni cross-chain** — 8 canali IBC e 17 connessioni QoreChain Bridge (QCB) verso reti esterne
* **Modulo x/babylon** — Integrazione di restaking BTC che consente ai detentori di Bitcoin di partecipare alla sicurezza dello staking di QoreChain
* **Modulo x/abstractaccount** — Framework di smart account con regole di spesa programmabili, session key e logica di autenticazione personalizzata
* **Modulo x/fairblock** — Threshold Identity-Based Encryption (tIBE) per la cifratura delle transazioni resistente al MEV
* **Modulo x/gasabstraction** — Progetto del pagamento del gas multi-token con supporto per QOR nativo, USDC via bridge IBC e ATOM via bridge IBC (nessun canale IBC è ancora aperto)
* **Prioritizzazione delle TX a 5 corsie** — Definizioni delle corsie per la prioritizzazione dello spazio nei blocchi (solo configurazione; non applicata dal mempool live)
* **Configurazioni di relayer IBC** — Setup di relayer preconfigurati per tutti i canali IBC supportati
* **Integrazione bridge-burn** — Le fee dei bridge sono instradate attraverso la distribuzione delle fee del modulo burn

## v1.1.0 — Firme ibride PQC

**Focus della release:** sicurezza crittografica post-quantistica e agilità algoritmica.

* **Doppie firme secp256k1 (ECDSA) + ML-DSA-87** — Ogni transazione include sia una firma classica sia una post-quantistica, verificate nella catena dell'AnteHandler
* **3 modalità di enforcement** — Enforcement configurabile delle firme ibride: off (modalità 0), permissive (modalità 1, PQC opzionale), mandatory (modalità 2, PQC obbligatoria)
* **Registrazione della chiave** — Le prime build registravano automaticamente una chiave pubblica PQC alla prima transazione ibrida; quel comportamento è stato rimosso e ora una chiave si registra esplicitamente con `MsgRegisterPQCKey` (vedi [Prima transazione](/getting-started/first-transaction#register-pqc-key))
* **Fondamento di hash SHAKE-256** — Tutte le operazioni di hashing legate alla PQC usano SHAKE-256 (famiglia SHA-3) per una derivazione degli indirizzi resistente al quantistico
* **Interfacce di attestazione TEE** — Supporto all'attestazione in Trusted Execution Environment per dimostrare l'integrità della generazione delle chiavi PQC
* **Framework di agilità algoritmica** — Registro di algoritmi pluggable che consente di aggiungere futuri algoritmi PQC tramite governance senza upgrade della chain

## v1.0.0 — Genesis (motore di tokenomics)

**Focus della release:** lancio iniziale del protocollo con tokenomics completa, esecuzione multi-VM e operazioni assistite da AI.

* **Modulo x/burn** — Meccanismo di burn delle fee multicanale con distribuzione a quattro vie tra validatori, burn, treasury e staker
* **Modulo x/xqore** — Derivato di staking di governance con penalità di sblocco anticipato a livelli e redistribuzione del rebase in modalità PvP
* **Modulo x/inflation** — Emissione basata su epoche con decadimento annuale (sostituita nella v3.1.94 da un importo fisso per epoca sotto un cap cumulativo rigido)
* **Layer di consenso PRISM** — Ottimizzazione a reinforcement learning (PPO) per il tuning dinamico dei parametri della chain con controlli di sicurezza a circuit-breaker
* **CPoS a triplo pool** — Composite Proof-of-Stake con pool di validatori RPoS, DPoS e PoS ponderati per punteggio di reputazione (implementato in `x/qca`; non ancora collegato alla produzione dei blocchi)
* **Governance QDRW** — Formula del potere di voto Quadratic Delegation with Reputation Weighting (implementata; disabilitata sulle reti live)
* **Runtime EVM + QoreChain Native + SVM** — Tre ambienti di esecuzione concorrenti: il QoreChain EVM Engine, gli smart contract QoreChain Native e la Solana Virtual Machine
* **Bridge cross-VM** — Passaggio di messaggi e trasferimenti di asset tra i runtime EVM, QoreChain Native e SVM all'interno di un singolo blocco
* **Crittografia post-quantistica** — Firma resistente al quantistico basata su una libreria PQC ad alte prestazioni
* **QCAI** — Analisi euristica on-chain con sidecar off-chain opzionale per rilevamento delle frodi, stima delle fee e ottimizzazione della rete
* **Deployment containerizzato** — Deployment completo di testnet multi-validatore con servizio sidecar e block indexer
* **Block indexer** — Listener dei blocchi con archiviazione persistente per query storiche e analytics
