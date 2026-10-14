---
slug: /dashboard/tools-hub
title: Hub degli strumenti
sidebar_label: Hub degli strumenti
sidebar_position: 11
---

# Hub degli strumenti

La pagina **Tools** raccoglie in un unico posto gli strumenti per operatori e sviluppatori di QoreChain, organizzati in sette schede, in questo ordine: **Information**, **Validator Application**, **Buy License**, **Light Node**, **Node Registration**, **Rollups** e **SDK**. La scheda **Information** è una panoramica di sola lettura dei programmi per validatori e light node — i tre modi di partecipare (validatore genesis, light node, delegatore), i livelli di licenza, le basi di staking e slashing, i requisiti hardware, chi gestisce il programma e una FAQ. Le altre schede sono riassunte di seguito, con l'indicazione di dove portano per la documentazione completa. La pagina Tools segue il selettore di rete nell'intestazione, perché le build pubblicate possono differire tra le reti.

Accedi per usare gli strumenti che registrano iscrizioni o inviano domande — vedi [Accedere](/dashboard/overview#sign-in).

## Light Node

Avviare un light node e unirsi al suo programma di ricompense sono due cose diverse, e la scheda Light Node le tiene separate invece di presentare un unico flusso di iscrizione:

1. **Ottieni il software — funziona già oggi.** Nessuna licenza, nessun controllo on-chain e nessuna approvazione richiesta; questo passaggio viene mostrato per primo indipendentemente dallo stato della tua licenza. La scheda legge il manifest live della rete e fornisce comandi pronti da copiare per un nodo QoreChain completo (scaricare e verificare il binario, inizializzare il nodo con il genesis, puntarlo verso i peer della rete ed eseguire uno state-sync invece di sincronizzare dal genesis). Un light node in sé richiede solo il binario `lightnode-sx` o `lightnode-ux` — vedi [Panoramica Light Node](/light-node/overview). Sotto i comandi, **Download the light node** elenca le build pubblicate con i relativi checksum sha256 — una **Desktop edition** (include la dashboard web) e una **Server edition** (headless, a riga di comando) su sei piattaforme; verifica il file rispetto al suo checksum prima di eseguirlo. Se non è pubblicata alcuna build per la rete selezionata, il pannello lo segnala.
2. **Verifica i requisiti della chain — Light node status.** Questo pannello legge i parametri live della chain (sono parametri di governance e possono cambiare senza che questa pagina venga modificata): lo stake delegato richiesto — il tuo totale su tutti i validatori a cui deleghi, non per singolo validatore (attualmente 1.000 QOR) —, la commissione di registrazione (attualmente 1 QOR), l'uptime necessario per le ricompense, la frequenza con cui è atteso un heartbeat (e la tolleranza concessa) e il numero massimo di light node. Puoi facoltativamente inserire un indirizzo operatore per vedere se vi è registrato un light node, se sta riportando in orario e le sue ricompense maturate.
3. **L'iscrizione alle ricompense non è ancora aperta.** Unirsi alla condivisione delle ricompense dei light node richiede una licenza `lightnode_operator` attiva concessa on-chain, lo stake delegato minimo e la commissione di registrazione. L'iscrizione in sé non è aperta (vedi [Stato del programma di ricompense](/light-node/overview#reward-program-status)), e l'acquisto di una licenza non la apre in anticipo, quindi al momento non c'è nulla a cui iscriversi; nel frattempo esegui e sincronizza il tuo nodo. L'uptime viene conteggiato a partire dal blocco in cui il tuo nodo si registra on-chain, non prima.
4. **Registrazione memorizzata.** Se il tuo account possiede una licenza registrata come attiva, questa scheda mostra anche un breve modulo — indirizzo operatore (`qor1…`), moniker, URL di endpoint pubblico e conferma dell'impegno di stake — e poi un riepilogo di quanto hai inviato. Quel modulo memorizza la tua richiesta di registrazione presso The Qore Trust sul Dashboard; **non** invia la transazione di registrazione on-chain e non controlla la chain. La registrazione on-chain si effettua dal nodo stesso con `lightnode-sx register` (vedi [Registrazione e licenze](/light-node/registration-and-licensing)) e riesce solo quando la chain mostra una concessione attiva, lo stake è già vincolato dal tuo indirizzo operatore e l'iscrizione è aperta.

Per il quadro completo, vedi [Panoramica Light Node](/light-node/overview) e [Registrazione e licenze](/light-node/registration-and-licensing).

## Node Registration

La scheda Node Registration memorizza una registrazione di validatore presso The Qore Trust sul Dashboard. Non crea essa stessa il validatore sulla chain; questo avviene dal tuo nodo (passaggi 1 e 5 qui sotto). Prerequisiti e passaggi:

1. **Registra prima la tua chiave PQC — dalla CLI, sul tuo nodo validatore.** Un validatore deve eseguire da sé la registrazione della chiave PQC — non avviene automaticamente — prima di richiedere o usare una licenza e prima di creare il validatore. Vedi [Gestire un validatore](/developer-guide/running-a-validator#pqc-key-registration) per il comando CLI.
2. **Conferma di essere autorizzato.** Il modulo richiede una licenza di validatore registrata come attiva nel tuo account. È la **chain** a decidere se `create-validator` viene accettato, e richiede la concessione operatore on-chain: una licenza acquistata tramite **Buy License** viene registrata sul nostro sistema, e la concessione on-chain è un passaggio separato, manuale, che segue. Controlla **Validator Readiness** (nella scheda Validator Application) per vedere cosa la chain riconosce al momento. Se non sei ancora autorizzato, questa scheda rimanda a **Buy License** — le licenze di validatore richiedono prima una [Validator Application](#validator-application) approvata.
3. **Compila il modulo di registrazione.** Fornisci il tuo indirizzo validatore o la consensus pubkey, un moniker, un tasso di commissione (entro l'intervallo consentito dalla tua licenza) e un endpoint pubblico facoltativo. Se le tue licenze includono catene cross-network, seleziona quali di esse questo validatore servirà.
4. **Conferma il requisito di self-stake.** La soglia di self-stake del validatore è fissa a 100.000 QOR — una costante a livello di protocollo, non un'impostazione modificabile — soggetta a un periodo di unbonding, con penalità (slashing) in caso di downtime o double-signing. Confermalo, poi invia per registrarti.
5. **Sincronizza e crea il validatore.** La registrazione qui memorizza il tuo validatore; devi comunque portare il tuo nodo alla tip corrente della catena e inviare tu stesso `create-validator`, con firma ibrida PQC-cofirmata come ogni transazione QoreChain — la chiave del passaggio 1 è ciò che rende valida quella firma.
6. **Conferma e vincola lo stake.** Un pannello di riepilogo mostra la registrazione (moniker, indirizzo validatore, commissione, intento di self-stake, catene cross-network, stato) e ti invita a vincolare il tuo self-stake per entrare nel set attivo dei validatori. Il bonding avviene sul tuo nodo con la transazione cofirmata in modalità post-quantum, non nel Dashboard.

Lo staking e la creazione di validatori avvengono solo sulla lane di transazione nativa di QoreChain — non esiste alcun percorso per registrare o vincolare un validatore tramite un wallet EVM collegato come MetaMask.

Vedi [Gestire un validatore](/developer-guide/running-a-validator) e [Staking e validatori](/dashboard/staking-and-validators).

## Rollups

Richiedi un rollup basato su QoreChain. Il modulo ti consente di assegnare un nome al rollup e di indicare la macchina virtuale (EVM, CosmWasm o SVM), il livello di disponibilità dei dati, il gas token, il modello di sequencer e la destinazione di settlement desiderati. L'invio memorizza una richiesta di provisioning che The Qore Trust esamina; non crea il rollup on-chain. Le opzioni sono più ampie di quanto il modulo rollup on-chain supporti attualmente. Per registrare tu stesso un rollup on-chain, vedi [Distribuzione di un rollup](/rollups/deploying-a-rollup); per i concetti, vedi [Panoramica Rollup](/rollups/overview).

## SDK

Un hub di quickstart e riferimento per sviluppare su QoreChain tramite codice. La sezione mostra i passaggi di installazione e snippet pronti da copiare per connettersi, derivare account nei tre runtime, leggere lo stato, inviare trasferimenti e firmare in modo quantum-safe, oltre a una tabella dei pacchetti per linguaggio e link al repository, agli esempi e all'explorer. Vedi [Panoramica QoreChain SDK](/sdk/overview) e [Installazione](/sdk/install).

## Validator Application {#validator-application}

Fai domanda per diventare un Genesis Validator:

1. **Inserisci i dati della tua entità.** Ragione sociale, paese/giurisdizione e un'email di contatto.
2. **Scegli il tier desiderato.** Seleziona dal catalogo dei tier di validatore (ogni tier elenca il numero di slot e il proprio set di funzionalità) — questo è il tier che intendi licenziare una volta approvato, non ancora un acquisto.
3. **Descrivi la tua infrastruttura.** La regione della tua infrastruttura e i dettagli su hardware/datacenter.
4. **Spiega la tua motivazione.** Una breve dichiarazione sull'esperienza del tuo team in ambito validatore/infrastruttura e sul perché desideri gestire un Genesis Validator QoreChain.
5. **Conferma la conformità e invia.** Conferma che è richiesta la verifica KYC/AML dell'entità richiedente e dei suoi beneficiari effettivi prima che venga concessa una licenza, poi invia.
6. **Monitora lo stato.** La scheda mostra la tua domanda come in revisione, approvata o non approvata con una motivazione (con la possibilità di rivedere e reinviare). Una volta che la tua domanda è in sospeso o approvata, un pannello **Validator Readiness** live verifica tre cose direttamente sulla catena, non su quanto hai acquistato: la registrazione della tua chiave PQC, il tuo self-bond (fisso a 100.000 QOR — solo saldo spendibile, i fondi in vesting non contano) e se la tua licenza operatore è stata effettivamente concessa on-chain ed è attualmente valida (non sospesa e non scaduta — le licenze scadono a una block height, e se la tip della catena non può essere letta una licenza in scadenza viene riportata come *impossibile verificare* anziché come valida). Ogni controllo riporta uno di tre stati — soddisfatto, non ancora soddisfatto, oppure *impossibile verificare* quando la catena non è raggiungibile — e una lettura fallita non viene mai mostrata come "non lo possiedi", perché questo ti manderebbe a rifare qualcosa che già possiedi. Una volta approvato, puoi procedere su **Buy License** per acquisire una licenza di validatore.

Vedi [Gestire un validatore](/developer-guide/running-a-validator).

## Buy License

Acquisisci le licenze necessarie per gestire l'infrastruttura di rete:

1. **Inserisci l'indirizzo da licenziare.** Il campo **QoreChain address** in alto è obbligatorio per ogni acquisto: digita l'indirizzo `qor1…` a cui la licenza deve essere concessa on-chain. Usa un indirizzo che controlli e che conserverai — la concessione vi è vincolata, e cambiarlo in seguito richiede l'intervento del supporto. Una licenza non può essere ordinata senza un indirizzo.
2. **Scegli una rete di pagamento.** Sotto **Pay with USDT on:** seleziona ERC-20, BEP-20 o TRC-20.
3. **Scegli cosa acquistare.** Una licenza light-node è disponibile per chiunque. Le licenze di validatore (nell'intero catalogo dei tier) si sbloccano solo dopo l'approvazione della tua [Validator Application](#validator-application). Gli add-on cross-network estendono una licenza di validatore a catene aggiuntive, con prezzo per catena all'anno — seleziona le catene desiderate, poi acquista.
4. **Completa il pagamento.** Ogni acquisto ti porta a un passaggio di pagamento che conferma l'importo e la rete e verifica il pagamento on-chain prima che la licenza venga registrata come pagata.
5. **Attendi la concessione on-chain, poi registrati.** Dopo il pagamento la licenza mostra **Paid — awaiting on-chain grant**. Le concessioni vengono emesse a mano, in batch, quindi non sono istantanee. Lo stato passa a **Active** solo dopo che la chain stessa ha confermato la concessione. La registrazione sulla chain controlla la chain, non i nostri registri, quindi registrarsi prima che la concessione arrivi verrà rifiutato. Quando il badge indica **Active**, torna su **Light Node** o **Node Registration** per la registrazione corrispondente.

:::note Licenze acquistate prima che l'indirizzo fosse obbligatorio
Se hai acquistato una licenza prima che l'indirizzo venisse raccolto, la scheda Buy License si apre con **This licence needs a QoreChain address** — inserisci l'indirizzo e seleziona **Save address**. Finché non viene salvato, la licenza non può essere concessa.
:::

Per il funzionamento della licenza in tutta la rete, vedi [Chain Licensing](/architecture/chain-licensing).
