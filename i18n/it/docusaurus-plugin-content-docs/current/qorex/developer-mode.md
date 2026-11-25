---
slug: /qorex/developer-mode
title: Modalità sviluppatore
sidebar_label: Modalità sviluppatore
sidebar_position: 9
---

# Modalità sviluppatore

La modalità sviluppatore è un interruttore nelle **Impostazioni** di QoreX. È **disattivata per impostazione predefinita**. Quando è attiva, QoreX mostra un insieme di strumenti per chi sviluppa su **QORE**CHAIN: ispettori che leggono la rete, un posto per simulare e decodificare transazioni, strumenti per contratti e rollup, la firma offline e un modo per esaminare le transazioni proposte da agenti IA.

La modalità sviluppatore non cambia alcuna regola di firma. Tutto ciò che firma ti mostra comunque cosa firma e attende la tua approvazione, esattamente come prima.

## Innovazioni {#innovations}

- **Ogni strumento prima legge o fa rivedere.** Gli ispettori si limitano a leggere. Gli strumenti che possono firmare mostrano una revisione decodificata e attendono la tua approvazione.
- **Numeri esatti dalla rete.** Gli ispettori mostrano ciò che la chain stessa riporta: la sua versione, le sue funzionalità, le chiavi registrate del tuo account, la tua finestra EVM.
- **Errori in parole semplici.** Il decodificatore di errori trasforma un errore di rete grezzo in una frase e dice cosa fare dopo.
- **Gli agenti IA propongono, tu decidi.** Un agente può leggere ciò che consenti e proporre una transazione. QoreX la controlla e la simula, e tu la approvi o la rifiuti nella normale finestra di approvazione. Nessun agente può firmare.

## Come attivarla {#how-to-use}

- **App mobile (iPhone e Android):** apri **Impostazioni** e attiva **Modalità sviluppatore**. Nella barra inferiore compare una scheda **Sviluppo** con l'icona del codice (`</>`). Aprila per vedere gli strumenti. Disattivando di nuovo l'impostazione, la scheda si nasconde.
- **Estensione per browser:** nel popup, tocca sette volte il numero di versione in basso. Nel popup compare una sezione **Modalità sviluppatore**, con un pulsante **Strumenti per sviluppatori**. Il pulsante apre una pagina con gli stessi gruppi della scheda dell'app. La stessa sezione ha **Disattiva la modalità sviluppatore**.

La stessa sezione contiene il selettore di rete. L'app lo chiama **Usa la testnet (sviluppatori)** nelle Impostazioni, l'estensione **Passa alla testnet (diana)**. Vedi [Funzionalità della testnet](/qorex/testnet-features) per ciò che esiste solo sulla testnet.

Gli strumenti sono gli stessi sull'app e sull'estensione, tranne dove uno strumento indica diversamente. Sono raggruppati come segue.

## Ispeziona {#inspect}

Sola lettura, su mainnet e testnet. Nulla in queste schermate firma o invia.

### Ispettore di rete e capacità

Mostra su quale rete ti trovi e cosa supporta: il chain id, la versione del nodo, l'ultimo blocco, l'ultimo aggiornamento applicato e quello eventualmente programmato, le funzionalità di protocollo che la chain riporta (abilitate, in fase di preparazione o non abilitate), il chain id della lane EVM, se la lane SVM esegue o è chiusa, i parametri cross-VM e post-quantistici, e quanti canali IBC e rotte del bridge la rete elenca. Una seconda parte, **Questo wallet**, mostra la tua versione di QoreX, la build (app o estensione) e i metodi di firma e la modalità di simulazione che questa build usa.

Come usarlo: apri **Ispettore di rete e capacità**. Tocca **Aggiorna** per rileggere. Usa **Copia** accanto a un valore per copiarlo.

### Ispettore dell'account

Mostra l'account attivo: se è un account Cosmos (coin 118) o un account unificato (coin 60), la sua posizione e i suoi indici di derivazione, i suoi indirizzi su ogni lane (nativa `qor1...`, EVM `0x...`, chiave SVM) e le chiavi pubbliche. Vengono mostrate solo informazioni pubbliche; nulla di segreto esce dal vault.

Come usarlo: apri **Ispettore dell'account**, poi tocca **Mostra indirizzi e chiavi pubbliche** (QoreX potrebbe chiederti di sbloccare).

### Ispettore PQC

Mostra la chiave ML-DSA-87 registrata on-chain per il tuo account: l'algoritmo, l'altezza a cui è stata registrata, lo SHA-256 della chiave pubblica, la sua dimensione, se le regole della chain la accettano ancora e la sua prova di possesso. Può poi confrontare quella chiave con quella presente su questo dispositivo e dire se corrispondono (chiave canonica, una derivazione precedente o una rotazione numerata). Ha anche una tabella **Cosa protegge un'operazione**: per un invio nativo, una transazione EVM, una transazione SVM, un invio IBC e un invio su una chain esterna, quale firma è post-quantistica e quale è classica.

Come usarlo: apri **Ispettore PQC** per leggere la chiave on-chain, poi tocca **Confronta con la chiave di questo dispositivo** per eseguire il confronto. Se la chain rifiuta la chiave registrata, la schermata dice che va registrata di nuovo.

### Ispettore della finestra EVM

Mostra se per il tuo account è attiva una finestra EVM, le altezze e gli orari approssimativi di apertura e scadenza, quante transazioni e quanto valore sono stati usati e quanti restano, e cosa consente (solo trasferimenti di QOR, oppure chiamate e trasferimenti; i destinatari e i contratti consentiti). L'apertura e la chiusura delle finestre avvengono nella schermata della finestra EVM, non qui. Vedi [Sicurezza e recupero](/qorex/security-and-recovery#evm-window).

Come usarlo: apri **Ispettore della finestra EVM**. Se dice che non è stato possibile leggere una finestra, non significa che non ce ne sia nessuna.

## Transazioni {#transactions}

Mainnet e testnet, salvo dove uno strumento indica diversamente.

### Ispettore di transazioni

Incolla l'hash di una transazione (QoreChain, oppure EVM con `0x`) o una richiesta grezza: un SignDoc in JSON, un TxRaw in base64, un JSON di transazione EVM o una richiesta di una dApp. QoreX decodifica ogni messaggio, mostra chi firma, chi riceve, i fondi spostati, la commissione, il memo e i permessi richiesti, e dice se la firma post-quantistica è allegata. Per una transazione già sulla rete mostra anche il risultato, il gas usato e gli eventi. Un tipo di messaggio che QoreX non sa leggere viene mostrato come sconosciuto con i suoi byte grezzi; QoreX non tira a indovinare. Le richieste vengono lette sul tuo dispositivo e non vengono mai inviate.

Come usarlo: apri **Ispettore di transazioni**, incolla, tocca **Ispeziona**.

### Banco di simulazione

Incolla messaggi QoreChain in JSON, o una transazione EVM, e QoreX chiede alla rete cosa farebbe. Nulla viene firmato o inviato. Vedi se andrebbe a buon fine, il gas che userebbe e la commissione, l'eventuale commissione una tantum di registrazione della chiave post-quantistica, le variazioni di asset per il tuo account e un elenco di ciò che la simulazione non può mostrare (ad esempio lo stato interno di un contratto, o i passaggi cross-VM eseguiti in un blocco successivo). Gli errori di rete vengono decodificati in parole semplici, con un suggerimento su cosa fare, dal **Decodificatore di errori** integrato: incolla un log grezzo, un JSON di risultato o un messaggio di errore e tocca **Decodifica**.

Come usarlo: apri **Banco di simulazione**, scegli **Messaggi QoreChain** o **Transazione EVM**, incolla, tocca **Simula**.

### Commissioni e sponsorizzazione

Mostra il prezzo minimo del gas della chain, quanto QoreX paga per unità di gas, il costo delle azioni comuni (invio, stake, apertura di una finestra EVM, invio IBC), se la prossima transazione paga anche la registrazione una tantum della chiave, e le concessioni di commissioni che hai ricevuto e dato, con un verdetto per ciascuna: pagherebbe, oppure perché viene rifiutata (scaduta, esaurita, tipo di messaggio sbagliato). QoreX paga le proprie commissioni e non indica mai da sé un soggetto che le conceda.

Come usarlo: apri **Commissioni e sponsorizzazione**; legge i dati all'apertura.

### Area di lavoro testnet

Strumenti per sviluppare sulla testnet, che non toccano mai la mainnet:

- **Account solo testnet.** Un account creato dalla tua frase di recupero che QoreX non lascia mai firmare sulla mainnet e nasconde mentre la mainnet è attiva. Tocca **Crea un account solo testnet**.
- **Faucet.** Copia il tuo indirizzo di testnet e tocca **Apri il faucet della testnet**. Il faucet si trova sulla dashboard e per usarlo devi accedere lì. Vedi [Funzionalità della testnet](/qorex/testnet-features#get-test-qor).
- **Reimposta le connessioni.** **Reimposta tutte le connessioni** disconnette ogni sito, rifiuta ogni richiesta ancora in attesa e dimentica i contratti per cui i siti ti hanno fatto firmare di recente. Tocca due volte per confermare.

Disponibilità: la schermata si apre su entrambe le reti; gli account solo testnet e il faucet sono per la testnet.

### Registro delle richieste

Elenca cosa hanno chiesto i siti, cosa hai deciso e cosa ha risposto la rete. È conservato solo sul tuo dispositivo, e solo mentre la modalità sviluppatore è attiva, per un massimo di 500 voci e 7 giorni. Non registra mai la tua frase di recupero, le chiavi o le password, né ciò che è stato firmato (solo il tipo e un hash). Puoi conservarlo dopo la chiusura del browser, cancellarlo, oppure usare **Esporta un file di debug** per allegarlo a una segnalazione di bug; prima di essere scritto, il file viene controllato alla ricerca di frasi e chiavi.

Come usarlo: apri **Registro delle richieste**. Attiva prima la modalità sviluppatore, altrimenti non viene registrato nulla.

## Contratti e rollup {#contracts}

### Interazione con i contratti

Chiama contratti EVM, CosmWasm (QoreChain Native) e SVM con il tuo account. Le letture sono gratuite; tutto ciò che cambia lo stato passa dalla stessa approvazione di una richiesta dApp, che la simula e aggiunge la firma post-quantistica.

Come usarlo:

1. Apri **Interazione con i contratti** e scegli il **Tipo di contratto**.
2. EVM: inserisci l'indirizzo del contratto e carica la sua **ABI (JSON)**. Ogni funzione diventa un modulo tipizzato, contrassegnato come read, write o payable. QoreX rifiuta un valore per una funzione che non può ricevere QOR.
3. CosmWasm: inserisci l'indirizzo del contratto, facoltativamente carica uno schema da `cosmwasm-schema`, scrivi il **Messaggio (JSON)** e, se serve, i fondi (scritti come `1000uqor`). Usa **Interroga** per leggere, oppure **Verifica l'esecuzione** per vedere esattamente cosa verrà firmato.
4. SVM (solo testnet): inserisci l'id del programma e carica un **IDL Anchor (JSON)**. QoreX firma la transazione Solana con la tua chiave Solana e la inoltra con il tuo account QoreChain.
5. Tocca **Simula** per vedere cosa la rete dice che farebbe la chiamata, poi **Verifica e firma** (oppure **Continua all'approvazione**) e approva nella finestra di approvazione.

Puoi salvare i contratti per rete, esportarli come file e importarli di nuovo. Un pannello **Info contratto** mostra l'id del codice, il creatore, l'etichetta e l'admin di un contratto CosmWasm.

### Approvazione del deploy

Approva un deploy preparato dal tuo strumento da riga di comando, dall'IDE o da un agente. QoreX calcola da sé l'hash del codice, decodifica gli argomenti del costruttore e controlla chi può aggiornare il contratto prima che qualcosa venga firmato. Rifiuta se l'hash dichiarato dallo strumento non corrisponde ai byte. Avvisa in caso di pattern proxy aggiornabili, di un admin o di un'autorità di aggiornamento che non è il tuo account, e di un contratto senza admin che non potrà mai essere migrato. Gestisce il deploy di contratti EVM e i contratti CosmWasm istanziati da un codice già memorizzato. QoreX non carica codice CosmWasm, e il deploy di programmi SVM non è supportato in questa versione. I caricamenti di codice su una rete che li fa passare dalla governance non possono essere firmati da un wallet.

Come usarlo: apri **Approvazione del deploy**, incolla il JSON della richiesta di deploy prodotto dal tuo strumento (tocca **Mostra il formato** per vederlo), tocca **Verifica**, leggi la revisione, poi **Approva e firma**.

### Profili di rollup e appchain

Aggiungi un rollup o un'appchain costruiti con il QoreChain RDK. QoreX interroga dal vivo il relativo nodo prima di conservare il profilo e mostra ogni controllo: chain id REST e RPC, prefisso degli indirizzi, chain id EVM e il rollup su QoreChain. Un profilo può regolare sulla mainnet o sulla testnet. Mentre un profilo è attivo, ogni schermata di revisione chiede quale rete firma, e la firma per un nodo che non conferma il proprio chain id viene rifiutata.

Come usarlo: apri **Profili di rollup e appchain**, tocca **Aggiungi un profilo**, compila nome, chain id ed endpoint, poi **Verifica e aggiungi**. Usa **Rendi attivo** o **Smetti di usare** per passare da uno all'altro, e **Verifica di nuovo** in qualsiasi momento.

## Altre macchine virtuali {#other-vms}

### Solana su QoreChain (solo testnet)

La lane SVM sulla **testnet** di QoreChain: finestre SVM e inoltro di una transazione Solana firmata. Questo strumento è visibile solo mentre la testnet è attiva; sulla mainnet la lane SVM non è aperta e nulla di quanto descritto qui può essere usato. Dettagli e passaggi sono in [Funzionalità della testnet](/qorex/testnet-features#solana-on-qorechain).

### Chiamata cross-VM

Componi una chiamata dal tuo account a un contratto su un'altra lane di esecuzione di QoreChain stessa (EVM, CosmWasm o SVM). Nulla esce da QoreChain: non è un bridge verso un'altra chain. Il modulo chiede la lane di destinazione, il contratto o il programma, il payload e, solo per CosmWasm, i QOR da allegare.

Scegli **Quando viene eseguita**, e QoreX lo dice chiaramente:

- **Ora, dentro questa transazione (atomica):** avviene tutto o niente.
- **In coda per un blocco successivo (non atomica):** viene eseguita in un blocco successivo. Se fallisce o scade, ciò che questa transazione ha fatto resta fatto.

Come usarlo: apri **Chiamata cross-VM**, compila il modulo, tocca **Simula** per vedere i passaggi e la commissione, poi **Firma e invia**. QoreX firma solo chiamate che ha simulato. Se sulla rete le chiamate cross-VM sono disattivate, la schermata lo dice e non offre nulla da firmare. Oggi sulla mainnet le chiamate cross-VM sono chiuse, quindi lì aspettati quel messaggio.

### Segui una chiamata cross-VM

Incolla l'hash di una transazione (QoreChain, oppure `0x` per EVM) e QoreX ne legge i tratti cross-VM. Un tratto in coda risulta in attesa, eseguito, fallito o scaduto. I tratti di una transazione EVM sono stati eseguiti dentro la transazione stessa e vengono letti dal suo risultato. I record in coda conclusi vengono eliminati dalla rete dopo un po', e il tracker lo dice quando il record non c'è più.

Come usarlo: apri **Segui una chiamata cross-VM**, incolla l'hash, tocca **Segui**.

## Firma e agenti {#signing-and-agents}

### Permessi e sessioni

Elenca tutto ciò che il tuo account ha consentito di fare ad altri indirizzi, con i limiti che la chain stessa applica, e ti permette di revocare ciascuna voce: **Autorizzazioni**, **Concessioni di commissioni**, **Chiavi collegate** e **Finestre di accesso**. Per ognuna vedi cosa può fare, il suo limite e quando scade (o che non scade mai). **Revoca** invia la transazione di revoca; **Chiudi finestra** chiude una finestra EVM.

Con **Nuova sessione** puoi anche dare a un'app o a un altro indirizzo una sessione limitata: chiamare solo i contratti elencati, inviare fino a un importo stabilito, fare stake con validatori scelti oppure votare e riscuotere ricompense, per un certo numero di giorni, eventualmente pagandone le commissioni fino a un limite. Un'**Anteprima** dice esattamente cosa potrà fare il beneficiario, ed elenca separatamente ciò che la chain non applica, per il quale QoreX ti chiederà conferma ogni volta.

### Area di lavoro offline e multisig {#multisig}

Prepara qualsiasi transazione come file nel formato da riga di comando della chain, controlla ogni firma in un file multisig, oppure firma su un dispositivo e trasmetti da un altro.

- **Firma offline:** prepara una transazione su un dispositivo online (parti da un modello come invio, delega o chiamata a un contratto, oppure incolla i messaggi), porta il file o il codice QR al QoreX che custodisce la chiave, controlla, **Firma**, poi **Invia alla rete** da uno qualsiasi dei due dispositivi.
- **Verifica le firme:** apri la transazione ed eventuali file di firma. Per ogni membro del multisig QoreX mostra se ha una chiave post-quantistica registrata e se il turno 1 (post-quantistico) e il turno 2 (classico) sono validi, obsoleti, non validi o mancanti, e quale turno manca ancora.

La revisione mostra sempre il memo e ogni coin della commissione, e QoreX firma solo i byte che hai controllato. Rifiuta una commissione in una coin diversa da QOR, una commissione molto superiore al prezzo del gas alto della rete, e una commissione pagata o concessa da un altro account. Se il file cambia dopo la tua revisione, devi riaprirlo e ricontrollarlo. QoreX non trasmette una transazione senza la sua firma ML-DSA-87.

## Agenti IA {#ai-agents}

Gli agenti IA (il tuo assistente IA, o uno strumento che esegui) possono leggere gli account che scegli e **proporre** una transazione. Non possono firmare. Il modello è questo:

1. Decidi quali account un agente può vedere e per quali può proporre. Puoi sospendere o revocare un agente in qualsiasi momento, e l'elenco **Attività** mostra cosa ha fatto.
2. QoreX controlla ogni proposta e la simula sulla rete. Una proposta che QoreX non sa leggere, o che secondo la rete fallirebbe, non ti viene mostrata.
3. Vedi la proposta nella normale finestra di approvazione, contrassegnata come proposta da un agente IA e non da un sito web, e la approvi o la rifiuti. Nulla viene firmato finché non approvi.

QoreX non firma mai i tipi di richiesta che nessun soggetto esterno può fare, chiunque li proponga. Un limite di proposte all'ora ferma le raffiche, e solo una proposta alla volta resta in attesa.

Come usarlo:

- **App mobile:** attiva la modalità sviluppatore, apri **Agenti IA**, poi incolla il JSON della proposta del tuo agente e tocca **Controlla la proposta**, oppure apri un link `qorex://propose`. QoreX non può verificare chi ha scritto una proposta incollata o un link, e lo dice. Controllala e approvala o rifiutala.
- **Estensione per browser (Chrome, Edge, Brave, Firefox):** un agente si collega tramite un programma di supporto sul tuo computer che usa il Model Context Protocol. Quel programma non è ancora pubblicato, quindi il lato estensione non può ancora essere usato dal pubblico. Quando lo sarà, attiverai **Consenti connessioni di agenti IA su questo computer**, abbinerai l'agente con un codice monouso che scade in 5 minuti e ne sceglierai gli account.
- **Safari:** non disponibile. Safari non può collegare QoreX a programmi sul tuo computer.

## Limiti {#limits}

- La modalità sviluppatore è per chi sviluppa. Se ti limiti a inviare, ricevere e fare staking, non ti serve.
- Uno strumento che dipende dalla rete (gli ispettori, il simulatore, i tracker) dice che non è stato possibile leggere quando la rete non è raggiungibile. Non significa che lì non ci sia nulla.
- Gli strumenti SVM e il compositore cross-VM dipendono da ciò che la rete consente. Oggi sulla mainnet SVM e chiamate cross-VM sono chiusi.
- Nell'estensione per browser serve il tocco sul numero di versione per far apparire l'interruttore; l'app lo ha nelle Impostazioni.
