---
slug: /qorex/send-and-receive
title: Invia e ricevi
sidebar_label: Invia e ricevi
sidebar_position: 3
---

# Invia e ricevi

Questa pagina tratta l'invio e la ricezione di QOR, il pagamento a un @handle, le richieste di pagamento, i contatti, la cronologia delle transazioni, la detenzione di asset su altre reti e gli extra della schermata Home. È pensata per chi usa l'app mobile QoreX (l'estensione ha le stesse schermate Invia e Ricevi, vedi [Estensione del browser](/qorex/browser-extension)). Dove qualcosa è diverso tra l'app, l'estensione del browser e l'estensione Safari, il testo lo indica.

## Innovazioni {#innovations}

- **Richieste di pagamento firmate.** Una richiesta è un link firmato con la chiave del tuo account. Chi paga vede QoreX controllare la firma, la rete esatta e l'eventuale @handle prima che compaia la normale revisione, così un importo o un destinatario modificato emerge invece di passare inosservato. Vedi [Richieste di pagamento](#payment-requests).
- **Stato letto dalla chain.** Un trasferimento è *in attesa*, *confermato* o *fallito* perché lo dice la rete, e una richiesta di pagamento viene contrassegnata come *pagata* solo quando la chain mostra un pagamento corrispondente. Vedi [Cronologia](#history).
- **Segnalazione degli indirizzi sosia.** Un indirizzo che somiglia soltanto a uno che già conosci viene segnalato prima dell'invio. Vedi [Contatti e preferiti](#contacts).
- **Avvisi sulle commissioni in parole semplici.** QoreX ti dice quando la commissione è superiore all'importo che invii, e al primo invio mostra la commissione una tantum di registrazione della chiave e il totale.

La scheda Home (Wallet) è il tuo punto di partenza. Mostra un **badge di rete** (MAINNET per impostazione predefinita, oppure TESTNET se hai attivato l'opzione per sviluppatori), il tuo **saldo totale** (tocca per nascondere/mostrare) e le azioni principali: **Invia · Ricevi · Scambia · Stake** (**Swap** non è mostrato su iOS). La tua lista asset mostra **QOR** (un saldo unificato tra le lane Native, EVM e SVM, inviato sulla lane nativa con firma ibrida) e **Tutte le reti** (una vista unificata su ETH, BNB, POL, ARB e le altre [reti esterne](#external-networks-tokens) supportate da QoreX).

## Invia QOR sulla lane nativa con firma ibrida

1. Tocca **Invia**.
2. Inserisci il destinatario come indirizzo `qor1…` **oppure** come **@handle**. Un handle viene risolto e verificato crittograficamente (firma del registro + firma del proprietario + pinning trust-on-first-use); se la chiave di un handle cambia silenziosamente, QoreX mostra un avviso esplicito.
3. Inserisci l'importo. L'anteprima mostra il destinatario, l'importo, la **Commissione di rete** e lo stato della firma (se il trasferimento porta il livello ML-DSA-87).
4. Conferma con l'approvazione **biometrica**. Ogni trasferimento nativo di QOR viene firmato due volte: con una chiave classica e con ML-DSA-87 (FIPS 204). QoreX firma con quella firma ibrida obbligatoria e trasmette sulla lane nativa. Dopo la trasmissione verifica che la transazione confermata porti il livello ML-DSA-87 e ti avvisa se non lo porta.

Nella prima schermata, la casella di compilazione rapida (**Chiedi a QoreX**) ti permette di digitare una richiesta semplice come "send 50 QOR to @maria" e compila il modulo per te. È un semplice lettore di testo che funziona **interamente sul tuo dispositivo** - nulla di ciò che digiti lì viene inviato altrove, e non è un assistente AI (QoreX non ne ha). Controlli comunque tutto e confermi con la biometria come al solito; se non riesce a leggere ciò che hai digitato, lo dice e compili il modulo a mano. I contatti preferiti e i destinatari recenti compaiono come chip selezionabili con un tocco (vedi [Contatti e preferiti](#contacts)).

QoreChain non registra da sola la tua chiave ML-DSA-87. Lo fa QoreX per te nell'ambito del tuo **primo** trasferimento (una piccola commissione di rete una tantum), e puoi vederne lo stato in [Sicurezza e recupero](/qorex/security-and-recovery#pqc-key). In QoreX non è necessario alcun passaggio separato.

**La revisione di un primo invio mostra subito il costo.** Oltre all'importo e alla **Commissione di rete**, la revisione elenca la *Registrazione una tantum della chiave ML-DSA-87* con la sua commissione e poi il totale delle commissioni (**Total fees**), così non ci sono sorprese dopo la conferma. Gli invii successivi dallo stesso account mostrano solo la commissione di rete.

**Commissione superiore all'importo.** Se la commissione di rete è superiore all'importo che stai inviando, la revisione lo segnala (*"The network fee ... is larger than the amount you are sending ..."*) a titolo di cautela. Non blocca mai l'invio. QoreX lo mostra per gli invii nativi di QOR e per la coin propria di una rete esterna quando la commissione è quotata in quella coin. La riscossione delle ricompense di staking ha lo stesso controllo, vedi [Portfolio e staking](/qorex/portfolio-and-staking#claim).

### Inviare a un @handle, passo dopo passo {#handle-send}

1. Apri **Invia** e digita `@` seguito dall'handle (ad esempio `@liviu`) nel campo destinatario al posto di un indirizzo.
2. QoreX cerca l'handle e ti mostra l'**indirizzo `qor1…` risolto** prima che tu confermi qualsiasi cosa. (Rivendicare il tuo handle richiede un account con accesso effettuato e si fa nell'app - vedi [@handle](/qorex/account-and-dashboard#handle).)
3. Controlla l'indirizzo risolto, inserisci l'importo e conferma come al solito.

QoreX accetta solo una risoluzione che superi **entrambi** i controlli che esegue: un'attestazione del registro verificata rispetto a una chiave di fiducia fissata nell'app, e la firma del proprietario dell'handle stesso sulla dichiarazione. Il mancato superamento di uno dei due controlli genera un errore, senza ricadere su un indirizzo non verificato. La prima volta che paghi un determinato handle, QoreX memorizza l'indirizzo a cui è stato risolto; se l'indirizzo di quell'handle dovesse mai cambiare, QoreX si ferma prima di firmare e mostra l'indirizzo vecchio e quello nuovo affiancati, così puoi decidere se procedere. Questa memoria è **per dispositivo** - pagare lo stesso handle per la prima volta da un altro telefono o da un'installazione nuova lo mostra come nuovo anche lì, il che è previsto e non un errore. L'estensione del browser risolve e paga gli handle allo stesso modo (la sua memoria è **per browser**, quindi un browser o un computer diverso lo vede come nuovo) - vedi [Inviare a un @handle](/qorex/browser-extension#handle-send).

### Invio di QOR in vesting (bloccati) {#vesting}

Se parte del tuo saldo è ancora in **vesting** - ad esempio un'allocazione TGE non ancora rilasciata - il tuo totale viene suddiviso in **disponibile ora** e **ancora bloccato**. Puoi inviare solo la parte disponibile; QoreX rifiuta autonomamente un tentativo di spesa eccessiva, invece di lasciare che sia la rete a rifiutarlo dopo aver comunque addebitato una commissione. La parte bloccata diventa spendibile gradualmente man mano che il piano di vesting la sblocca. Questa suddivisione è mostrata ovunque compaia il tuo saldo - Home, Invia e i dettagli dell'asset.

## Ricevi {#receive}

Tocca **Ricevi**. La schermata parte dalla moneta: un **elenco con ricerca** (*Scegli la moneta da ricevere*, casella di ricerca *Cerca moneta o rete*) con **QOR per primo**, poi la moneta propria di ogni rete supportata e i token inclusi, ciascuno con la sua immagine e quella della sua rete. Se nulla corrisponde alla ricerca, l'elenco dice *Nessuna moneta corrisponde.* Le immagini sono incluse in QoreX, quindi per disegnare l'elenco non viene scaricato nulla da terzi.

- **QOR** mostra il tuo indirizzo `qor1...` (e il tuo @handle, se ne hai uno) come codice QR con l'icona QoreChain, più **Copia** e **Condividi**. Tutto ciò che viene inviato a questo indirizzo arriva sulla lane nativa, dove ogni trasferimento porta una firma classica e una firma ML-DSA-87.
- **Qualsiasi altra moneta o token** mostra l'indirizzo di quella rete e l'avviso *"Invia a questo indirizzo solo \{coin\} su \{network\}. Le monete inviate su un'altra rete possono andare perse."* L'avviso nomina la moneta che hai scelto. Usa **Scegli un'altra moneta** per tornare all'elenco.
- **Reti coperte:** Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis e Celestia. Tutte le reti EVM condividono un unico indirizzo `0x...`. I tuoi indirizzi EVM e Solana sono derivati dalla tua frase di recupero, quindi QoreX chiede una conferma biometrica (**Mostra l'indirizzo**) prima di mostrarli. Le altre reti non possono portare firme ML-DSA-87. Vedi [Reti esterne](#external-networks-tokens).
- **Anche i token personalizzati sono nell'elenco.** Un token che hai aggiunto tramite indirizzo del contratto (o, su Solana, tramite indirizzo del mint) è offerto in Ricevi con l'indirizzo della sua rete, come un token incluso. Vedi [Coin e token](#coins-and-tokens).
- **Indirizzi di Cosmos Hub, Osmosis e Celestia.** L'indirizzo mostrato è quello con cui firmano i tuoi invii da quella rete (la tua chiave coin-118). Le build precedenti potevano mostrare un indirizzo diverso per un account coin-60 o seguire l'account attivo; il problema è risolto, e l'invio ricontrolla l'indirizzo prima di firmare.

L'estensione e l'estensione Safari hanno lo stesso elenco di monete in **Ricevi**.

## Coin e token {#coins-and-tokens}

Una coin senza riga non ha un indirizzo su cui riceverla. Per vedere una coin o un token in **Portfolio** *prima* di possederne, apri Portfolio → **+ Moneta o token** e attivala (nell'estensione: **Monete e token**). Una coin fissata a zero apre **Ricevi** sulla sua rete quando viene toccata. Impostazioni → **Monete e reti** elenca tutto ciò che il wallet può detenere oggi.

**Aggiungere un token tramite contratto** (solo reti EVM):

1. Portfolio → **+ Moneta o token** → **Aggiungi un token tramite contratto** (estensione: **Monete e token** → *Aggiungi un token tramite contratto*).
2. Scegli la **Rete**, incolla l'**Indirizzo del contratto (0x…)** e tocca **Controlla contratto**.
3. QoreX legge il simbolo e i decimali dal contratto stesso e mostra *"Il contratto dice: \{symbol\} · \{decimals\} decimali"*. Chiunque può creare un token e dargli un nome qualsiasi - QoreX non ne garantisce l'autenticità, quindi assicurati che sia il contratto che intendevi.
4. Tocca **Add \{symbol\}**. Viene contrassegnato come *Aggiunto da te* e può essere inviato come i token inclusi. Rimuovilo quando vuoi.

Una volta aggiunto, il token compare anche in [Ricevi](#receive).

QoreX rifiuta un token già incluso, uno che hai già aggiunto, una rete non EVM, un indirizzo errato, un contratto che non risponde come un token e un contratto che usa il nome di un token che QoreX fornisce già su quella rete (probabile copia).

## Richieste di pagamento {#payment-requests}

Chiedi a qualcuno un importo in QOR con un link firmato da condividere o copiare. Funziona nell'app, nell'estensione e nell'estensione Safari, su mainnet e su testnet, e **non** richiede l'accesso a QoreX.

**Creare una richiesta**

1. Apri **Richieste di pagamento** (app: Impostazioni; estensione: un pulsante nella schermata iniziale).
2. Tocca **Nuova richiesta**, inserisci l'**Importo (QOR)** e una **Nota** facoltativa (al massimo 140 caratteri). Se hai un @handle puoi spuntare *Show my @handle on the request*.
3. Tocca **Crea link**. QoreX firma la richiesta con la chiave del tuo account e mostra *"La tua richiesta è pronta. Chiunque può pagarla, in QoreX o in un altro wallet."*
4. **Condividi link** o **Copia link**.

Il link è firmato con la chiave del tuo account, quindi un importo o un indirizzo modificato viene rilevato. La chiave deve appartenere all'indirizzo che riceve: nessun altro può rifirmare a tuo nome un link alterato. La firma è solo un controllo di integrità del link; il pagamento stesso viene firmato normalmente da chi paga, con la firma ibrida sulla lane nativa. Il formato del link è `qorex://pay?v=1&...` e nomina la rete esatta (mainnet o testnet).

Il pulsante **Richiedi** nella Home dell'app chiede a un determinato utente di QoreX tramite il suo @handle (richiede l'[accesso](/qorex/account-and-dashboard#sign-in) e un tuo @handle). Una volta creata, anche quella richiesta può essere condivisa come link firmato.

**Pagare una richiesta**

1. Apri il link su un telefono con QoreX, oppure vai su **Paga una richiesta** e usa **Incolla un link di pagamento** (anche nell'estensione), poi **Apri**.
2. QoreX controlla la firma, la rete e l'eventuale @handle *prima* di mostrare qualcosa da pagare. Poi mostra il destinatario, l'importo, la nota e il tag memo, e segue la normale revisione. Confermi come per qualsiasi invio.
3. I messaggi che potresti vedere: *"Firma verificata: la richiesta è invariata da quando è stata firmata."*, oppure un rifiuto come *"Questo link è stato modificato dopo la firma. Non pagarlo."*, *"Questo link non è stato firmato dal proprietario dell'indirizzo che riceve. Non pagarlo."* o *"Questa richiesta è per \{network\}. Cambia rete in QoreX per pagarla."*
4. Se il link porta un @handle, QoreX lo controlla rispetto al registro degli handle: verificato, primo pagamento, *ora punta a un indirizzo diverso da prima* (controlla con la persona prima di pagare), oppure non punta a questo indirizzo (non pagare se non sei sicuro). Un avviso sull'handle richiede una seconda conferma.

Per ora QoreX paga le richieste solo in QOR. Una richiesta su testnet dice *"Richiesta su testnet. I QOR di testnet non hanno valore."*

**Seguire e riutilizzare**

**Le mie richieste** elenca le richieste che hai creato. Ognuna mostra **Pagata** o **Non ancora pagata**, letto dalla chain: QoreX cerca un pagamento corrispondente (il tag memo sul trasferimento), e la richiesta viene contrassegnata come pagata solo quando la chain lo mostra. Se la rete non risponde dice *Stato sconosciuto: la rete non ha risposto*, mai un'ipotesi. **Controlla lo stato** chiede di nuovo. **Riusa il mese prossimo** crea una nuova richiesta con gli stessi dettagli e un nuovo id. Con un @handle vedi anche **Richieste a me** e **Richieste inviate tramite @handle**.

## Contatti e preferiti {#contacts}

I **Contatti** (app: Impostazioni; estensione: un pulsante nella schermata iniziale) sono nomi per gli indirizzi che paghi. Sono conservati **solo su questo dispositivo**. Un contatto ha un nome, fino a un indirizzo per rete (QoreChain, EVM, Solana, Cosmos) e un @handle facoltativo; l'elenco ne contiene fino a 200.

- **Preferiti.** Spunta *Preferito (mostrato nella schermata di invio)* e il contatto compare come chip a un tocco sopra il campo destinatario. Un chip compila soltanto il modulo: devi comunque controllare e confermare.
- **Ripeti pagamento.** Su un pagamento passato (app: la schermata di dettaglio; estensione: la riga della cronologia), **Ripeti pagamento** compila di nuovo il modulo di invio con lo stesso destinatario, importo e memo. Controlli e confermi sempre prima che venga inviato qualcosa.
- **Segnalazione degli indirizzi sosia.** Un contatto non è un controllo di sicurezza, e QoreX lo dice. Quando un indirizzo che stai per pagare *somiglia soltanto* a uno che già conosci (stessi primi e ultimi caratteri, un trucco che i truffatori usano inserendo indirizzi sosia nella tua cronologia), la revisione avvisa *"Careful: this address only LOOKS LIKE one you already know"* e mostra l'indirizzo noto per confrontarlo carattere per carattere. Serve un secondo tocco (estensione) o una presa d'atto del rischio (app). Il confronto avviene con i contatti salvati, i tuoi account e gli indirizzi che hai pagato.
- **Un contatto salvato è nominato nella revisione** (*Saved contact: \{name\}*). Un @handle salvato mostra anche se il suo indirizzo è lo stesso di quando lo hai pagato l'ultima volta, se è nuovo o se è **cambiato**.

## Cronologia {#history}

La Cronologia mostra ogni transazione QoreChain di un account, non solo gli invii: ricevute, messa in staking, ritiro dallo staking, spostamento dello stake, ricompense riscosse, blocchi, bonus, finestre EVM, indirizzo delle ricompense e registrazione della chiave ML-DSA-87, con l'importo, la commissione e le transazioni fallite contrassegnate come *Fallita (la commissione è stata comunque pagata)*. Il badge ibrido compare solo su una transazione verificata dalla chain stessa. Le reti esterne non sono ancora nella Cronologia.

- **Dove.** App: **Attività**, con un selettore dell'account, e un link **Cronologia** su ogni account in **I tuoi account**. Estensione: **Cronologia** nella schermata iniziale, con un selettore dell'account.
- **In attesa, confermata, fallita.** Un trasferimento appena inviato mostra **In attesa: la rete non ha ancora confermato** finché la chain non lo conosce. Una transazione che la chain non ha visto dopo alcuni minuti risulta *Non trovata sulla rete: potrebbe non essere andata a buon fine. Controlla la transazione prima di inviare di nuovo.* Non viene mai mostrata come inviata per ipotesi. **Nascondi** rimuove una riga di questo tipo.
- **Per account.** Ogni account del wallet ha la propria Cronologia.
- **Esporta CSV.** **Esporta CSV** scrive la cronologia dell'account in un file **su questo dispositivo**. Contiene solo la tua cronologia: nessuna frase, nessuna chiave. Le colonne sono fisse e in inglese, e ogni cella che un foglio di calcolo potrebbe leggere come formula (un indirizzo o un memo che inizia con `=`, `+`, `-` o `@`) viene preceduta da un prefisso così da aprirsi come testo.
- **Lo spam è nascosto.** I trasferimenti in entrata sotto 0.1 QOR il cui memo contiene un link o un dominio sono nascosti da Attività e dalle notifiche, con una riga come *"\{n\} likely spam transfers hidden"* e **Mostrali**. I trasferimenti a valore zero sono nascosti. Un memo con un link porta un avviso nel dettaglio della transazione: QoreChain e QoreX non ti chiedono mai di visitare un link inviato con un trasferimento.
- **Nodi con blocchi eliminati.** Se un nodo non conserva più i blocchi vecchi, QoreX chiede una pagina più piccola finché il nodo non risponde, e lo dice quando la rete non è raggiungibile. In quel caso non mostra più un elenco vuoto.

La **pagina QOR** (tocca QOR nella Home) elenca ogni transazione dell'account, in entrata e in uscita, con **Mostra altri** in basso.

## Reti e token esterni {#external-networks-tokens}

L'invio è attivo per ogni rete elencata da QoreX: Ethereum, BNB Smart Chain, Polygon, Arbitrum One, Base, OP Mainnet, Avalanche C-Chain, Solana, Cosmos Hub, Osmosis e Celestia, con i loro token. BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche e Celestia funzionano di nuovo dopo essere stati per un periodo solo in ricezione. Gli invii nativi su Arbitrum usano la stima del gas della rete stessa.

Da **Tutte le reti** (o Send-external) puoi inviare in modo nativo **ETH, BNB, POL, AVAX e SOL**, oltre a ETH su **Arbitrum, Base e OP Mainnet**, e **ATOM, OSMO e TIA** su Cosmos, oltre a token **ERC-20**, **SPL** e **IBC** - USDC e USDT sulle chain EVM e su Solana, DAI su Ethereum e Noble USDC via IBC - tutti derivati dalla stessa frase di recupero (ETH usa `m/44'/60'`, SOL usa il suo percorso standard e SPL usa gli associated token account).

:::caution Le chain esterne sono solo classiche
Le altre blockchain non possono portare firme ML-DSA-87. Quando invii su una rete esterna, QoreX lo dichiara esplicitamente (il trasferimento usa una firma classica e la riga della firma lo contrassegna come classico). Il tuo **QOR** resta sulla lane nativa con firma ibrida. Gli invii esterni basati su Cosmos supportano una nota facoltativa. Per le reti EVM QoreX mostra anche la **commissione di rete massima** prima che tu confermi - "Commissione di rete: al massimo \{fee\}. Controllala prima di confermare." - e firma esattamente con quel valore.
:::

## Swap

La scheda **Swap** è collegata all'AMM on-chain di QoreChain ma resta disabilitata - il pulsante mostra **"Swap - coming with pool liquidity"** - finché la liquidità e il feature flag remoto non la attivano. Quando ciò accade si attiva automaticamente; **non è necessario alcun aggiornamento dell'app**.

:::note iOS
La scheda Swap non compare affatto nella build dell'App Store - Apple considera uno scambio di token in-app un servizio regolamentato. Swap resta disponibile (una volta abilitato) solo su Android. L'estensione del browser non ha una schermata Swap.
:::

## Extra della schermata Home {#home-extras}

- **Widget della schermata Home** (Android e iPhone) - aggiungi **QoreX** dal selettore widget del tuo telefono. Mostra il tuo saldo QOR per l'account in uso, mostra dei puntini al posto dell'importo mentre la modalità privacy è attiva, si aggiorna da solo circa ogni 30 minuti e apre l'app quando viene toccato. Il widget non effettua alcuna richiesta propria ai server di QoreChain: l'app gli passa sul dispositivo il tuo indirizzo, il saldo e l'impostazione di privacy, e il widget legge il saldo dall'endpoint REST pubblico di QoreChain (che vede solo il tuo indirizzo pubblico). Chiunque possa vedere la tua schermata Home può vedere il widget, quindi attiva la modalità privacy (tocca il tuo saldo) se per te è importante.
- **Notifiche push** (mobile, mainnet) - la campanella in Home → **Notifiche** ha un interruttore **Notifiche push**: *"Ricevi una notifica quando arrivano QOR, anche con l'app chiusa. Il nostro server osserva solo i tuoi indirizzi pubblici; Apple e Google non vedono importi né indirizzi."* Il testo della notifica è semplicemente "QOR ricevuti". Le push sono **disattivate finché non le attivi**. Quando sono attive, il server conserva il token del tuo dispositivo e gli indirizzi pubblici `qor1…` del wallet in uso (fino a 10); disattivare l'interruttore rimuove il tuo dispositivo dal server, e un dispositivo da cui il server non riceve notizie da 90 giorni viene dimenticato. Vedi [Cosa invia QoreX sulla rete](/qorex/overview#data-and-privacy). Se le notifiche per QoreX sono disattivate nelle impostazioni del telefono, attivale prima lì. La consegna è stata testata end to end su Android; su iPhone, consideralo un servizio best effort e continua a controllare l'elenco **Notifiche** nell'app.
- **Ricerca e tour** - vedi [Orientarsi](/qorex/getting-started#find-your-way).

## Prossimi passi

- [Portafoglio e staking](/qorex/portfolio-and-staking) - visualizza la tua allocazione e guadagna ricompense.
- [Sicurezza e recupero](/qorex/security-and-recovery) - proteggi e recupera il tuo wallet.

## Limiti e problemi noti {#limits}

- I trasferimenti su reti esterne (EVM, Solana, Cosmos) sono solo classici. I trasferimenti SVM ed EVM non sono coperti dalla firma ibrida.
- Lo swap non è disponibile: è disattivato finché non esiste liquidità nei pool e non è mostrato su iOS.
- Rivendicare un @handle richiede un account con accesso effettuato e avviene nell'app mobile. Gli account in stile Ethereum (coin 60) non hanno un handle. Se il servizio degli handle non è raggiungibile, puoi comunque pagare tramite l'indirizzo `qor1…`.
- Le richieste di pagamento si pagano solo in QOR. Chiedere tramite @handle (per vedere le richieste inviate a un handle) richiede un @handle rivendicato.
- La cronologia per ora copre solo QoreChain; le altre reti seguiranno.
- Le notifiche push sono solo per la mainnet, e su iPhone best effort.
- I QOR in vesting non possono pagare le commissioni; si può inviare solo la parte disponibile.
