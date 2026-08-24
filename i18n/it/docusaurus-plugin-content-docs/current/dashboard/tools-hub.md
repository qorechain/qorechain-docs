---
slug: /dashboard/tools-hub
title: Hub degli strumenti
sidebar_label: Hub degli strumenti
sidebar_position: 11
---

# Hub degli strumenti

La pagina **Tools** raccoglie in un unico posto gli strumenti per operatori e sviluppatori di QoreChain, organizzati in schede. Da qui puoi registrare infrastrutture, distribuire un rollup, raggiungere l'SDK, fare domanda per diventare validatore e acquisire le licenze richieste da questi ruoli. Ogni sezione è riassunta di seguito, con l'indicazione di dove porta per la documentazione completa.

Collega il tuo wallet per usare gli strumenti che registrano infrastrutture o inviano domande — vedi [Panoramica e primi passi](/dashboard/overview#connect-your-wallet).

## Light Node

Avviare un light node e unirsi al suo programma di ricompense sono due cose diverse, e la scheda Light Node le tiene separate invece di presentare un unico flusso di iscrizione:

1. **Avvia il tuo nodo — funziona già oggi.** Nessuna licenza, nessun controllo on-chain e nessuna approvazione richiesta; questo passaggio viene mostrato per primo indipendentemente dallo stato della tua licenza. Legge il manifest live della rete e fornisce comandi pronti da copiare per scaricare e verificare il binario, inizializzare il nodo con il genesis, puntarlo verso i peer della rete ed eseguire uno state-sync invece di sincronizzare dal genesis.
2. **Verifica lo stato del tuo programma di ricompense.** Unirsi alla condivisione delle ricompense dei light node è un passaggio separato, vincolato on-chain: una licenza `lightnode_operator` attiva concessa on-chain, un importo minimo di QOR delegato — il tuo totale su tutti i validatori a cui deleghi, non per singolo validatore, letto in tempo reale dallo staking — e una piccola commissione di registrazione on-chain. **L'iscrizione non è ancora aperta**, e l'acquisto di una licenza non la apre in anticipo, quindi al momento non c'è nulla a cui iscriversi; questa scheda mostra il requisito come uno stato da verificare piuttosto che un modulo da inviare, finché non si apre.
3. **Registrati una volta che la tua licenza è stata concessa on-chain.** Una licenza acquistata tramite **Buy License** viene registrata prima sul nostro sistema — la concessione on-chain è un passaggio separato, e la registrazione viene rifiutata finché quella concessione non arriva (vedi la nota su Buy License più sotto). Una volta arrivata, questa scheda sostituisce il pannello di stato con un modulo di registrazione: il tuo indirizzo operatore (`qor1…`), un moniker e un URL di endpoint pubblico, oltre a una conferma dell'impegno di stake.
4. **Conferma e vincola lo stake.** Dopo l'invio, un pannello di riepilogo conferma la registrazione (moniker, indirizzo operatore, endpoint, intento di stake, stato) e ti invita a vincolare lo stake confermato dal tuo indirizzo operatore una volta aperta l'idoneità.

Per il quadro completo, vedi [Panoramica Light Node](/light-node/overview) e [Registrazione e licenze](/light-node/registration-and-licensing).

## Node Registration

La scheda Node Registration registra un nodo validatore on-chain:

1. **Registra prima la tua chiave PQC — dalla CLI, sul tuo nodo validatore.** Questo non avviene automaticamente come per la prima transazione di un account normale: un validatore deve eseguire da sé la registrazione della chiave PQC, prima di richiedere o usare una licenza e prima di creare il validatore. Vedi [Gestire un validatore](/developer-guide/running-a-validator#pqc-key-registration) per il comando CLI.
2. **Conferma di essere autorizzato.** È richiesta una licenza di validatore attiva prima di poterti registrare qui. Una licenza acquistata tramite **Buy License** viene registrata sul nostro sistema; la concessione on-chain è un passaggio separato, e la registrazione viene rifiutata finché quella concessione non arriva. Se non sei ancora autorizzato, questa scheda rimanda a **Buy License** — le licenze di validatore richiedono prima una [Validator Application](#validator-application) approvata.
3. **Compila il modulo di registrazione.** Fornisci il tuo indirizzo validatore o la consensus pubkey, un moniker, un tasso di commissione (entro l'intervallo consentito dalla tua licenza) e un endpoint pubblico facoltativo. Se le tue licenze includono catene cross-network, seleziona quali di esse questo validatore servirà.
4. **Conferma il requisito di self-stake.** La soglia di self-stake del validatore è fissa a 100.000 QOR — una costante a livello di protocollo, non un'impostazione modificabile — soggetta a un periodo di unbonding, con penalità (slashing) in caso di downtime o double-signing. Confermalo, poi invia per registrarti.
5. **Sincronizza e crea il validatore.** La registrazione qui memorizza il tuo validatore; devi comunque portare il tuo nodo alla tip corrente della catena e inviare tu stesso `create-validator`, con firma ibrida PQC-cofirmata come ogni transazione QoreChain — la chiave del passaggio 1 è ciò che rende valida quella firma.
6. **Conferma e vincola lo stake.** Un pannello di riepilogo mostra la registrazione (moniker, indirizzo validatore, commissione, intento di self-stake, catene cross-network, stato) e ti invita a vincolare il tuo self-stake per entrare nel set attivo dei validatori.

Lo staking e la creazione di validatori avvengono solo sulla lane di transazione nativa di QoreChain — non esiste alcun percorso per registrare o vincolare un validatore tramite un wallet EVM collegato come MetaMask.

Vedi [Gestire un validatore](/developer-guide/running-a-validator) e [Staking e validatori](/dashboard/staking-and-validators).

## Rollups

Distribuisci il tuo rollup basato su QoreChain. Il modulo di configurazione ti consente di assegnare un nome al rollup e di scegliere la sua macchina virtuale (EVM, CosmWasm o SVM), il livello di disponibilità dei dati, il gas token, il modello di sequencer e la destinazione di settlement. Dopo l'invio, il rollup viene predisposto in seguito a una revisione prima di entrare in funzione. Vedi [Panoramica Rollup](/rollups/overview) e [Distribuzione di un rollup](/rollups/deploying-a-rollup).

## SDK

Un hub di quickstart e riferimento per sviluppare su QoreChain tramite codice. La sezione mostra i passaggi di installazione e snippet pronti da copiare per connettersi, derivare account nei tre runtime, leggere lo stato, inviare trasferimenti e firmare in modo quantum-safe, oltre a una tabella dei pacchetti per linguaggio e link al repository, agli esempi e all'explorer. Vedi [Panoramica QoreChain SDK](/sdk/overview) e [Installazione](/sdk/install).

## Validator Application {#validator-application}

Fai domanda per diventare un Genesis Validator:

1. **Inserisci i dati della tua entità.** Ragione sociale, paese/giurisdizione e un'email di contatto.
2. **Scegli il tier desiderato.** Seleziona dal catalogo dei tier di validatore (ogni tier elenca il numero di slot e il proprio set di funzionalità) — questo è il tier che intendi licenziare una volta approvato, non ancora un acquisto.
3. **Descrivi la tua infrastruttura.** La regione della tua infrastruttura e i dettagli su hardware/datacenter.
4. **Spiega la tua motivazione.** Una breve dichiarazione sull'esperienza del tuo team in ambito validatore/infrastruttura e sul perché desideri gestire un Genesis Validator QoreChain.
5. **Conferma la conformità e invia.** Conferma che è richiesta la verifica KYC/AML dell'entità richiedente e dei suoi beneficiari effettivi prima che venga concessa una licenza, poi invia.
6. **Monitora lo stato.** La scheda mostra la tua domanda come in revisione, approvata o non approvata con una motivazione (con la possibilità di rivedere e reinviare). Una volta che la tua domanda è in sospeso o approvata, un pannello **Validator Readiness** live verifica tre cose direttamente sulla catena, non su quanto hai acquistato: la registrazione della tua chiave PQC, il tuo self-bond (fisso a 100.000 QOR — solo saldo spendibile, i fondi in vesting non contano) e se la tua licenza operatore è stata effettivamente concessa on-chain. Ogni controllo riporta uno di tre stati — soddisfatto, non ancora soddisfatto, oppure *impossibile verificare* quando la catena non è raggiungibile — e una lettura fallita non viene mai mostrata come "non lo possiedi", perché questo ti manderebbe a rifare qualcosa che già possiedi. Una volta approvato, puoi procedere su **Buy License** per acquisire una licenza di validatore.

Vedi [Gestire un validatore](/developer-guide/running-a-validator).

## Buy License

Acquisisci le licenze necessarie per gestire l'infrastruttura di rete:

1. **Inserisci l'indirizzo da licenziare.** Fornisci l'indirizzo `qor1…` a cui la licenza deve essere concessa on-chain — usa l'indirizzo con cui gestirai effettivamente il nodo, poiché è quello che la rete controlla.
2. **Scegli una rete di pagamento.** Seleziona USDT su ERC-20, BEP-20 o TRC-20.
3. **Scegli cosa acquistare.** Una licenza light-node è disponibile per chiunque. Le licenze di validatore (nell'intero catalogo dei tier) si sbloccano solo dopo l'approvazione della tua [Validator Application](#validator-application). Gli add-on cross-network estendono una licenza di validatore a catene aggiuntive, con prezzo per catena all'anno — seleziona le catene desiderate, poi acquista.
4. **Completa il pagamento.** Ogni acquisto ti porta a un passaggio di pagamento che conferma l'importo e la rete e verifica il pagamento on-chain prima che la licenza venga contrassegnata come attiva nei nostri registri.
5. **Attendi la concessione on-chain, poi registrati.** Una licenza mostrata come attiva qui è stata registrata sul nostro sistema — la concessione che la rende riconosciuta on-chain è un passaggio separato. La registrazione controlla la catena, non i nostri registri, quindi registrarsi prima che la concessione arrivi verrà rifiutato. Una volta confermata la concessione, torna su **Light Node** o **Node Registration** per completare la registrazione on-chain corrispondente.

Per il funzionamento della licenza in tutta la rete, vedi [Chain Licensing](/architecture/chain-licensing).
