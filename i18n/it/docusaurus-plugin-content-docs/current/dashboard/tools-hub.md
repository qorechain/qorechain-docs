---
slug: /dashboard/tools-hub
title: Hub degli strumenti
sidebar_label: Nodes & Validators
sidebar_position: 11
---

# Nodes & Validators (Hub degli strumenti)

La pagina **Nodes & Validators** raccoglie in un unico posto gli strumenti per operatori e sviluppatori di QoreChain, in sei schede, in questo ordine: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration**, **Rollups** e **SDK**. La pagina segue il selettore di rete nell'intestazione: i controlli sulla chain, i download e lo stato dei nodi vengono letti dalla rete che hai selezionato. Le licenze sono in vendita **solo su mainnet**; su testnet ne richiedi una gratuita (vedi [Light Node](#light-node)).

Nella barra laterale della Dashboard la voce si chiama **Nodes & Validators** (prima si chiamava Tools; l'indirizzo è ancora `/tools`). Gli strumenti per sviluppatori, come lo stato delle chiavi PQC, un simulatore di transazioni e un playground di firma, si trovano nella pagina pubblica separata [Sviluppatori](/dashboard/developers).

L'intera pagina richiede un account con accesso effettuato, su entrambe le reti; senza accesso vedi una schermata "Authentication Required". Vedi [Accedere](/dashboard/overview#sign-in).

## Validator Program

Una panoramica di sola lettura del **QoreChain Validator Program**, il modo in cui i validatori entrano nella rete: cosa offre il programma (la concessione operatore on-chain, la delega da stake controllato dall'Association e uno stipendio in QOR per gli operatori indipendenti che rispettano i livelli di servizio), cosa richiede, il processo di selezione e una FAQ. I parametri di protocollo in questa scheda (tempo di unbonding, slashing, numero massimo di validatori) vengono letti live dalla chain; le regole del programma (il self-stake di 100.000 QOR, la fascia di commissione, lo stipendio) sono dell'Association e sono indicate come tali. I validatori non acquistano un pacchetto: fanno domanda e pagano una **quota di programma di $1,000** solo una volta selezionati.

## Validator Application {#validator-application}

Fai domanda per il Validator Program:

1. **Compila la domanda.** Nome dell'entità, giurisdizione ed email di contatto; l'**indirizzo operatore** (`qor1…`, l'account da cui eseguirai `create-validator`: la concessione operatore on-chain viene emessa a questo indirizzo); provider di hosting, regione e tipo; le reti che già gestisci; facoltativamente il tuo indirizzo di validatore testnet e l'infrastruttura pubblica che offri (RPC pubblico, snapshot, archivio); il percorso (standard, oppure global per i posti riservati); e l'accettazione dei termini del programma. Fare domanda è gratuito.
2. **Revisione e prova su testnet.** La domanda appare come **Submitted** mentre viene esaminata. Le domande che procedono gestiscono un validatore sulla testnet diana per una prova di 14 giorni, indicata come **Testnet trial**.
3. **Selezione e quota di programma.** Una domanda selezionata mostra **Selected** con un pulsante **Pay the $1,000 programme fee**. Il passaggio di pagamento funziona come per una licenza light node: scegli la rete (USDT su ERC-20, BEP-20 o TRC-20), paga l'importo esatto indicato, incolla l'hash della transazione e seleziona **Verify payment**; il pagamento viene poi verificato on-chain. La quota è legata all'indirizzo operatore indicato nella domanda; non può essere pagata per un altro indirizzo. Approvazione e pagamento sono sempre mostrati separatamente: una domanda può essere selezionata e non ancora pagata.
4. **La concessione operatore on-chain.** Dopo il pagamento l'Association emette on-chain la concessione `validator_operator` al tuo indirizzo operatore. Le concessioni su mainnet vengono firmate a mano, in batch, quindi non sono istantanee. La scheda mostra **Operator grant on chain** non appena la chain la registra, e **In the active set** una volta che il tuo validatore è vincolato (bonded).

Per le domande inviate, in prova su testnet, selezionate e con concessione, un pannello **Validator Readiness** (con un campo indirizzo, che segue la rete nell'intestazione) verifica direttamente sulla chain, per l'indirizzo operatore: una chiave post-quantum registrata, QOR spendibili sufficienti per il self-stake, la concessione operatore e se il validatore è vincolato. Esegui per tempo la [registrazione della chiave PQC](/developer-guide/running-a-validator#pqc-key-registration) sul tuo nodo: nessuno registra quella chiave al posto tuo.

Le domande approvate con la precedente offerta per validatori (prima di ottobre 2026) appaiono come **Earlier application**; l'Association contatta direttamente quei richiedenti.

## Light Node {#light-node}

Tutto ciò che serve a un operatore di light node, dalla licenza a un nodo registrato on-chain.

1. **Acquista la licenza (mainnet).** Una licenza light node costa **$50**, pagata in USDT su ERC-20, BEP-20 o TRC-20 e verificata on-chain. Prima di pagare, inserisci l'indirizzo `qor1…` a cui la licenza deve essere concessa; usa un account di cui possiedi le parole di recupero (le tue parole, Keplr o `qorechaind`), idealmente uno usato solo per il nodo. Con l'intestazione impostata su **testnet** non c'è nulla in vendita: la scheda dice "Nothing is sold on testnet" e offre invece una licenza gratuita in autonomia (vedi [Licenza testnet gratuita](#testnet-licence)).
2. **Attendi la concessione on-chain.** Dopo il pagamento la licenza mostra **Paid, awaiting on-chain grant**; passa ad **Active on chain** solo quando la chain conferma la concessione `lightnode_operator`. Le concessioni su mainnet vengono firmate a mano, in batch. "Pagata" e "concessa on-chain" sono fatti distinti: la scheda non mostra mai una licenza come attiva prima che la chain abbia la concessione.
3. **Installa e registra il nodo.** La scheda elenca le build pubblicate per la tua rete con i relativi checksum (server edition `lightnode-sx`, desktop edition `lightnode-ux`, su Linux, macOS e Windows) e i passaggi per la release corrente: imposta una passphrase per il keyring, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (aggiunge l'account a cui è destinata la licenza), `lightnode-sx register` (collega la chiave post-quantum del nodo e lo registra, aggiungendo `--delegate-to <qorvaloper…>` se l'indirizzo non ha lo stake richiesto), poi `lightnode-sx start` e `lightnode-sx status`. I passaggi vengono mostrati come attuali solo quando il manifest di release della rete pubblica una build che li supporta, e la scheda indica se la registrazione è aperta su quella rete.
4. **Avvisi per il tuo indirizzo.** La scheda avvisa quando l'indirizzo della licenza è uno dei tuoi wallet custodial della Dashboard (la Dashboard detiene quella chiave, quindi un nodo non può firmare con essa), e segnala quando l'indirizzo ha già una chiave post-quantum on-chain (il nodo la riutilizza se è stata derivata dalle tue parole di recupero, altrimenti rifiuta e raccomanda un account dedicato).
5. **Stato.** Un pannello legge la chain: i requisiti in vigore (commissione di registrazione, stake delegato, uptime, finestra di heartbeat, numero massimo di light node) e, per un indirizzo, se vi è registrato un light node e se sta riportando in orario. I suoi stati includono "Registered, waiting for its first heartbeat", "Rewards accrued" e un avviso quando il nodo è stato marcato come inattivo.

### Licenza testnet gratuita {#testnet-licence}

Sulla testnet (`qorechain-diana`) una licenza light node è gratuita e in autonomia. Con l'intestazione impostata su testnet, apri la scheda **Light Node**, inserisci il tuo indirizzo `qor1…` sotto **Free testnet licence** e seleziona **Request licence**. La richiesta appare come "Requested for …", poi "Granted to … You can register your node now."; se non è stato possibile firmare la concessione, la scheda lo indica e puoi richiederla di nuovo. Le concessioni vengono firmate automaticamente, normalmente entro pochi minuti. C'è una sola richiesta per account e una per indirizzo. La licenza mainnet è diversa: si acquista a $50 e la sua concessione viene fatta a mano, in batch.

Vedi [Panoramica Light Node](/light-node/overview) e [Registrazione e licenze](/light-node/registration-and-licensing).

:::note Licenze acquistate prima che l'indirizzo fosse obbligatorio
Se hai acquistato una licenza prima che l'indirizzo venisse raccolto, la scheda si apre con **This licence needs a QoreChain address**: inserisci l'indirizzo e seleziona **Save address**. Finché non viene salvato, la licenza non può essere concessa.
:::

## Node Registration

Memorizza i dati del tuo validatore presso l'Association. Non crea il validatore on-chain; lo fai tu dal tuo nodo con `create-validator`.

Il modulo si apre quando la chain mostra una concessione `validator_operator` attiva per il tuo indirizzo operatore e possiedi una domanda selezionata al Validator Program (o una licenza di validatore precedente al programma). Fornisci l'indirizzo operatore del validatore, un moniker, un tasso di commissione tra il 5% e il 20% e un endpoint pubblico facoltativo, poi conferma il self-stake di 100.000 QOR, il periodo di unbonding di 21 giorni e lo slashing.

I passaggi on-chain sono descritti in [Gestire un validatore](/developer-guide/running-a-validator): registra la tua chiave PQC, poi invia `create-validator` con almeno 100.000 QOR di self-stake, cofirmato PQC come ogni transazione QoreChain. Lo staking e la creazione di validatori avvengono solo sulla lane di transazione nativa di QoreChain; non esiste alcun percorso per registrare o vincolare un validatore tramite un wallet EVM collegato come MetaMask. Sotto il modulo, la scheda elenca anche ciò che serve a un nodo completo (binario di release, genesis, peer) dal manifest di release della rete, e può mostrare un banner "Joining is temporarily suspended" quando la rete non accetta nuovi validatori.

Vedi [Staking e validatori](/dashboard/staking-and-validators).

## Rollups

Richiedi un rollup basato su QoreChain (il modulo si intitola **Deploy a Rollup**). Ti consente di assegnare un nome al rollup e di indicare la macchina virtuale (EVM, QoreChain Native o SVM), il livello di disponibilità dei dati, il gas token, il modello di sequencer e la destinazione di settlement desiderati. Selezionando **Deploy rollup** si registra soltanto una richiesta di provisioning, elencata sotto il modulo con il suo stato; non crea il rollup on-chain. Le opzioni sono più ampie di quanto il modulo rollup on-chain supporti attualmente. Per registrare tu stesso un rollup on-chain, vedi [Distribuzione di un rollup](/rollups/deploying-a-rollup); per i concetti, vedi [Panoramica Rollup](/rollups/overview).

## SDK

Un hub statico di passaggi di installazione, snippet e link per sviluppare su QoreChain tramite codice (connettersi, derivare account, leggere lo stato, inviare trasferimenti, firmare con una firma ibrida ML-DSA-87 (FIPS 204)). Il suo contenuto non è mantenuto allineato alle release dell'SDK, quindi prendi versioni e comandi di installazione da [Installazione](/sdk/install) e dalla [Panoramica QoreChain SDK](/sdk/overview).

Per il funzionamento della licenza in tutta la rete, vedi [Chain Licensing](/architecture/chain-licensing).
