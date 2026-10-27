---
slug: /dashboard/tools-hub
title: Nodes & Validators
sidebar_label: Nodes & Validators
sidebar_position: 11
---

# Nodes & Validators

La pagina **Nodes & Validators** (barra laterale gruppo **Build**, indirizzo `/tools`; prima del 27 ottobre 2026 si chiamava Tools e Tools Hub) è la pagina per gli operatori della Dashboard. Ha cinque schede, in questo ordine: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration** e **Rollups**. È pensata per chi vuole gestire un validatore o un light node, o richiedere un rollup applicativo. La scheda SDK si è spostata nella pagina pubblica [Sviluppatori](/dashboard/developers), che contiene anche gli strumenti per chi costruisce (stato delle chiavi PQC, simulatore, signing playground, QoreX test wallet).

## Innovazioni {#innovations}

- **I controlli sulla chain provengono dalla chain.** Il pannello **Validator Readiness** verifica quattro cose sulla rete selezionata: una chiave ML-DSA-87 registrata, QOR spendibili per il self-stake (vesting escluso), la concessione operatore on-chain e se il validatore è vincolato (bonded). Il pannello **Light node status** legge i requisiti in vigore (commissione di registrazione, stake delegato, uptime, finestra di heartbeat, numero massimo di light node) e lo stato di registrazione e di heartbeat dell'indirizzo.
- **"Pagata" e "concessa on-chain" sono fatti distinti.** Una licenza pagata mostra **Paid, awaiting on-chain grant** finché la chain non conferma la concessione, poi **Active on chain**. La scheda non mostra mai una licenza come attiva prima che la chain abbia la concessione.
- **Le regole di protocollo e quelle di programma sono etichettate separatamente.** Ogni riga di parametro indica se proviene dal protocollo (letta dalla chain) o dal programma (applicata dall'Association).
- **Una licenza light node testnet in autonomia.** Inserisci un indirizzo `qor1...` sotto **Free testnet licence** e seleziona **Request licence**; la concessione viene firmata automaticamente, di solito entro pochi minuti. Le concessioni su mainnet restano manuali.
- **I passaggi per il nodo seguono il manifest di release della rete.** I download (server edition `lightnode-sx`, desktop edition `lightnode-ux`, per piattaforma, con checksum SHA-256), l'apertura della registrazione e l'attualità dei passaggi provengono tutti dal manifest.

## Come si usa {#how-to-use}

Prerequisito per ogni scheda: accedere. Le schede seguono il selettore di rete nell'intestazione (i controlli sulla chain, i download e lo stato dei nodi vengono letti dalla rete selezionata). Senza accesso, la pagina mostra "Authentication Required". Vedi [Accedere](/dashboard/overview#sign-in).

### Validator Program {#validator-program}

Una panoramica di sola lettura del **QoreChain Validator Program**, il modo in cui i validatori entrano nella rete: cosa offre il programma (la concessione operatore on-chain, la delega da stake controllato dall'Association e uno stipendio in QOR per gli operatori indipendenti che rispettano i livelli di servizio), cosa richiede, il processo di selezione e una FAQ. Ha i pulsanti **Apply** e **Ask a question**. I parametri di protocollo (tempo di unbonding, slashing, numero massimo di validatori) vengono letti live dalla chain; le regole del programma (il self-stake di 100.000 QOR, la fascia di commissione, lo stipendio) sono dell'Association e sono indicate come tali. I validatori non acquistano un pacchetto: fanno domanda e pagano una **quota di programma di $1,000** solo una volta selezionati. Per gli importi dello stipendio vedi la scheda stessa.

### Validator Application {#validator-application}

1. **Compila la domanda.** Nome dell'entità, giurisdizione ed email di contatto; l'**indirizzo operatore** (`qor1...`, l'account da cui eseguirai `create-validator`; la concessione operatore on-chain viene emessa a questo indirizzo); provider di hosting, regione e tipo; le reti che già gestisci; facoltativamente il tuo indirizzo di validatore testnet (`qorvaloper1...`) e l'infrastruttura pubblica che offri (RPC pubblico, snapshot, archivio); il percorso (Standard, oppure Global per i posti riservati); e l'accettazione dei termini del programma. Seleziona **Submit application**. Fare domanda è gratuito.
2. **Revisione e prova su testnet.** La domanda appare come **Application submitted**, poi, per le domande che procedono, **Testnet trial** (una prova di 14 giorni con un validatore su `qorechain-diana`). Una domanda respinta riporta **Not selected**, con **Apply again**.
3. **Selezione e quota di programma.** Una domanda selezionata mostra **Selected** con un pulsante **Pay the $1,000 programme fee**. Scegli la rete (USDT su ERC-20, BEP-20 o TRC-20), paga l'importo esatto indicato, incolla l'hash della transazione e seleziona **Verify payment**; il pagamento viene verificato on-chain. La quota è legata all'indirizzo operatore indicato nella domanda e non può essere pagata per un altro indirizzo. Approvazione e pagamento sono mostrati separatamente: una domanda può essere selezionata e non ancora pagata. Dopo il pagamento la scheda riporta "Programme fee paid".
4. **La concessione operatore on-chain.** Dopo il pagamento l'Association emette on-chain la concessione `validator_operator` al tuo indirizzo operatore. Le concessioni su mainnet vengono firmate a mano, in batch, quindi non sono istantanee. La scheda mostra **Operator grant on chain** non appena la chain la registra, e **In the active set** una volta che il tuo validatore è vincolato (bonded).
5. **Readiness.** Per le domande inviate, in prova, selezionate e con concessione, il pannello **Validator Readiness** (con un campo indirizzo) verifica sulla chain l'indirizzo operatore. Esegui per tempo la [registrazione della chiave PQC](/developer-guide/running-a-validator#pqc-key-registration) sul tuo nodo: nessuno registra quella chiave al posto tuo.

Le domande approvate con la precedente offerta per validatori (prima di ottobre 2026) appaiono come **Earlier application**; l'Association contatta direttamente quei richiedenti.

### Light Node {#light-node}

Tutto ciò che serve a un operatore di light node, dalla licenza a un nodo registrato.

1. **Acquista la licenza (mainnet).** Una licenza light node costa **$50**, pagata in USDT su ERC-20, BEP-20 o TRC-20 e verificata on-chain. Inserisci l'indirizzo `qor1...` a cui la licenza deve essere concessa, scegli la rete USDT e seleziona **Buy for $50**; usa un account di cui possiedi le parole di recupero (le tue parole, Keplr o `qorechaind`), idealmente uno usato solo per il nodo. Dopo il pagamento la scheda riporta **Payment received** e segue la concessione on-chain. Più sotto sono elencati **Your past orders**.
2. **Attendi la concessione on-chain.** La licenza mostra **Paid, awaiting on-chain grant**, poi **Active on chain** quando la chain conferma la concessione `lightnode_operator`. Le concessioni su mainnet vengono firmate a mano, in batch.
3. **Installa e registra il nodo.** La scheda elenca le build pubblicate per la tua rete con i relativi checksum e i passaggi per la release corrente: imposta una passphrase per il keyring, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (aggiunge l'account a cui è destinata la licenza), `lightnode-sx register` (collega la chiave post-quantistica del nodo e lo registra; aggiungi `--delegate-to <qorvaloper...>` se l'indirizzo non ha lo stake richiesto), poi `lightnode-sx start` e `lightnode-sx status`. I passaggi vengono mostrati come attuali solo quando il manifest di release della rete pubblica una build che li supporta, e la scheda indica se la registrazione è aperta.
4. **Avvisi per il tuo indirizzo.** La scheda avvisa quando l'indirizzo della licenza è uno dei tuoi wallet custodial della Dashboard ("This address cannot run a node": la Dashboard detiene quella chiave), e segnala quando l'indirizzo ha già una chiave post-quantistica on-chain (il nodo la riutilizza se è stata derivata dalle tue parole di recupero, altrimenti rifiuta e raccomanda un account dedicato).
5. **Stato.** Un pannello mostra i requisiti in vigore e se un light node è registrato e sta riportando in orario. I suoi stati includono "Registered, waiting for its first heartbeat", "Rewards accrued" e un avviso quando il nodo è stato marcato come inattivo.

#### Licenza testnet gratuita {#testnet-licence}

Sulla testnet (`qorechain-diana`) non si vende nulla ("Nothing is sold on testnet") e una licenza light node è gratuita e in autonomia:

1. Imposta l'intestazione su **Testnet** e apri la scheda **Light Node**.
2. Sotto **Free testnet licence**, inserisci il tuo indirizzo `qor1...` e seleziona **Request licence**.
3. La richiesta appare come "Requested for ...", poi "Granted to ... You can register your node now." Se non è stato possibile firmare la concessione, la scheda lo indica e puoi richiederla di nuovo.

Le concessioni vengono firmate automaticamente, di solito entro pochi minuti. C'è una sola richiesta per account e una per indirizzo. **Esempio minimo:** Testnet, **Light Node**, **Request licence**, attendi "Granted to ...", poi esegui `lightnode-sx onboard` fino a `register`.

Vedi [Panoramica Light Node](/light-node/overview) e [Registrazione e licenze](/light-node/registration-and-licensing).

:::note Licenze acquistate prima che l'indirizzo fosse obbligatorio
Se hai acquistato una licenza prima che l'indirizzo venisse raccolto, la scheda si apre con **This licence needs a QoreChain address**: inserisci l'indirizzo e seleziona **Save address**. Finché non viene salvato, la licenza non può essere concessa.
:::

### Node Registration {#node-registration}

Memorizza i dati del tuo validatore presso l'Association. Non crea il validatore on-chain; lo fai tu dal tuo nodo con `create-validator`. La scheda è bloccata finché la concessione non è on-chain.

Il modulo si apre quando la chain mostra una concessione `validator_operator` attiva per il tuo indirizzo operatore e possiedi una domanda selezionata al Validator Program (o una licenza di validatore precedente al programma). Fornisci l'indirizzo operatore, un **Moniker**, una **Commission** tra il 5% e il 20% e un endpoint facoltativo, spunta la conferma (il self-stake di 100.000 QOR, il periodo di unbonding di 21 giorni e lo slashing) e seleziona **Register validator**.

I passaggi on-chain sono descritti in [Gestire un validatore](/developer-guide/running-a-validator): registra la tua chiave PQC, poi invia `create-validator` con almeno 100.000 QOR di self-stake, cofirmato PQC come ogni transazione QoreChain. Lo staking e la creazione di validatori avvengono solo sulla lane di transazione nativa; non esiste alcun percorso per registrare o vincolare un validatore tramite un wallet EVM collegato come MetaMask. Sotto il modulo, la scheda elenca ciò che serve a un nodo completo (binario di release, genesis, peer) dal manifest di release, e può mostrare un banner "Joining is temporarily suspended" quando la rete non accetta nuovi validatori. Vedi [Staking e validatori](/dashboard/staking-and-validators).

### Rollups {#rollups}

La scheda si intitola **Request a Rollup**. Compila il modulo: un nome, la macchina virtuale (EVM, QoreChain Native o SVM), il livello di disponibilità dei dati (QoreChain DA, Celestia o EigenDA), il gas token, il sequencer (Shared sequencer, Dedicated (single) o Decentralized) e la destinazione di settlement (QoreChain mainnet o Ethereum), poi seleziona **Request deployment**. Questo registra soltanto una richiesta, elencata sotto il modulo con il suo stato; in questo passaggio non viene creato nulla on-chain. Le opzioni sono più ampie di quanto il modulo rollup on-chain supporti attualmente. Per registrare tu stesso un rollup on-chain, vedi [Distribuzione di un rollup](/rollups/deploying-a-rollup); per i concetti, vedi [Panoramica Rollup](/rollups/overview).

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/tools](https://dashboard.qorechain.io/tools), oppure **Nodes & Validators** nel gruppo **Build** della barra laterale.
- **Accesso:** richiesto per l'intera pagina, su entrambe le reti.
- **Rete:** segui l'intestazione. L'acquisto della licenza da $50 è solo mainnet; la licenza gratuita è solo testnet.
- **Costi:** fare domanda è gratuito; la quota di programma per i validatori è di $1,000 e si paga solo dopo la selezione; una licenza light node mainnet costa $50; la licenza testnet è gratuita.
- **Wallet:** un account di cui possiedi le parole di recupero per il nodo; non serve alcun wallet per leggere le schede.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Reti |
| --- | --- | --- |
| Nodes & Validators | `dashboard.qorechain.io/tools` | Mainnet e testnet, interruttore nell'intestazione |
| Download dei nodi e checksum | La scheda Light Node | Per manifest di release della rete |
| SDK e strumenti per chi costruisce | [Sviluppatori](/dashboard/developers) | Entrambe |

## Limiti e problemi noti {#limits}

- **Le concessioni su mainnet sono manuali,** firmate in batch, quindi una licenza pagata resta in "Paid, awaiting on-chain grant". Le concessioni su testnet sono automatiche.
- **Una sola richiesta gratuita su testnet** per account e per indirizzo.
- **Rollups è un modulo di richiesta su entrambe le reti;** non crea nulla on-chain.
- **L'ingresso come validatore può essere sospeso** (il banner "Joining is temporarily suspended").
- **I dati di ricezione USDT e gli eventuali importi dello stipendio** sono mostrati solo all'interno delle schede al momento del pagamento o della domanda.

Per il funzionamento della licenza in tutta la rete, vedi [Chain Licensing](/architecture/chain-licensing).
