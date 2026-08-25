---
slug: /dashboard/staking-and-validators
title: Staking e validatori
sidebar_label: Staking e validatori
sidebar_position: 8
---

# Staking e validatori

La pagina **Validators** (`/validators`) consente di consultare i validatori della rete — è un visualizzatore di sola lettura, senza connessione al wallet e senza alcun pulsante di delega. Le azioni di staking vere e proprie (delega, revoca della delega, riscossione) si trovano invece nella pagina **Wallet**, nelle schede **Stake / Delegate** e **Rewards**, una volta collegato lì il tuo wallet QoreX. Delegare aiuta a proteggere la rete e fa maturare ricompense di staking. Per i concetti alla base di delega e ricompense, vedi [Staking e delega](/user-guide/staking-and-delegation).

Lo staking su QoreChain è firmato in modo post-quantistico, quindi il dashboard non detiene mai una chiave in grado di firmare una delega. Ogni azione di staking descritta di seguito funziona allo stesso modo: componi la richiesta sul dashboard (quale validatore, quanto), poi la approvi e la firmi **nel tuo wallet QoreX collegato** — l'app, oppure l'estensione del browser dalla **versione 0.2.2 in poi** (vedi [dove è disponibile quale versione](/qorex/overview#platform-availability); su una build dell'estensione più vecchia il Dashboard ti chiederà di aggiornare invece di fallire silenziosamente) — esattamente come nel [flusso di invio](/dashboard/wallet#mainnet). Il dashboard invia solo i parametri tramite un link `qorex://tx?...`; QoreX ricostruisce, firma e trasmette la transazione vera e propria. Collega prima il tuo wallet — vedi [Usare il Wallet su mainnet](/dashboard/wallet#mainnet).

Staking, delega e validazione avvengono esclusivamente sulla lane nativa (Cosmos), con la firma post-quantistica ibrida — mai tramite un precompile EVM. Si tratta di una proprietà di sicurezza permanente, non di una lacuna temporanea: la lane EVM esegue un unico ante decorator, quindi i controlli su licenza del validatore, self-bond minimo e requisito PQC presenti nell'ante della lane nativa verrebbero tutti aggirati se lo staking fosse esposto lì. Un indirizzo collegato tramite MetaMask può inviare e ricevere QOR (vedi [Usare il Wallet su mainnet](/dashboard/wallet#mainnet)), ma non può fare staking — solo un indirizzo collegato tramite QoreX può farlo.

## Consultare i validatori

La pagina si apre con schede riepilogative per il numero di validatori attivi, il totale di QOR vincolato (bonded), la commissione media e l'uptime medio. Sotto si trova l'elenco dei validatori. Ogni riga di un validatore mostra:

- Un **rango** e il **moniker** (nome) del validatore, con il suo indirizzo e un pulsante di copia.
- **Potere di voto** — lo stake vincolato del validatore e la sua quota sul totale.
- **Commissione** — la percentuale che il validatore trattiene dalle ricompense.
- **APY** — la stima del rendimento annuo per chi delega.
- **Stato** — ad esempio attivo o jailed (in stato di penalità).
- Dettagli operativi: regione, uptime, blocchi proposti, versione del software e ultimo avvistamento.

Un campo di ricerca filtra l'elenco per nome o indirizzo del validatore.

Questa pagina serve solo a confrontare i validatori. Per delegare effettivamente a uno di essi, vai alla pagina **Wallet** — vedi sotto.

## Scegliere un validatore

Nello scegliere un validatore a cui delegare, considera:

- **Commissione** — un tasso più basso lascia più ricompense a te, ma gli operatori sostenibili hanno bisogno di una quota ragionevole.
- **Uptime e stato** — preferisci validatori attivi con un uptime solido; un validatore jailed non sta guadagnando nulla. Un validatore finisce in jail quando manca la firma su più del 5% dei blocchi in una finestra di 10.000 blocchi (circa sei ore) — non guadagna nulla, né per te né per sé stesso, finché non risolve il problema ed esce dallo stato di jail (unjail).
- **Potere di voto** — distribuire lo stake tra più validatori favorisce la decentralizzazione. Nel pannello Delegate, i validatori sono elencati partendo dal più piccolo proprio per questo motivo.

## Delegare, ridelegare, revocare la delega e riscuotere le ricompense

Tutte e quattro le azioni si trovano nella pagina **Wallet** (`/dashboard/wallet`), non nella pagina Validators. Apri il wallet, collega QoreX se non l'hai già fatto (vedi [Usare il Wallet su mainnet](/dashboard/wallet#mainnet)), poi usa la scheda **Stake / Delegate** per delegare e revocare la delega, e la scheda **Rewards** per riscuotere.

### Delegare {#delegate}

1. Nella pagina **Wallet**, seleziona la scheda **Stake / Delegate**.
2. Nel pannello **Delegate QOR**, controlla il riquadro informativo in alto — mostra il totale attualmente vincolato a confronto con la soglia di stake per il light node, e se la raggiungi già. Questa soglia viene verificata sul tuo **stake totale delegato su tutti i validatori combinati**, non per singolo validatore, quindi un'eventuale mancanza può essere colmata suddividendola tra più validatori — non esiste un modo per "delegare a un light node" direttamente, poiché la delega punta sempre a un validatore e l'idoneità al light node è un controllo separato sul tuo totale.
3. Apri il menu a tendina **Validator** e scegline uno. I validatori sono elencati partendo dallo stake più piccolo.
4. Inserisci un **Amount (QOR)**.
5. Leggi la nota sotto il campo dell'importo: la revoca del vincolo (unbonding) richiede 21 giorni, e una volta vincolato il QOR non può essere spostato né venduto fino al termine di quel periodo.
6. Se il pannello mostra un avviso che questo indirizzo non ha QOR spendibile sufficiente a coprire la commissione, invia prima un po' di QOR spendibile a quell'indirizzo — le monete in vesting o vincolate non possono pagare la commissione. Il pulsante **Continue in QoreX** resta disabilitato finché ciò non viene risolto.
7. Fai clic su **Continue in QoreX** (mostra **Preparing…** mentre la richiesta viene creata).
8. Il pannello ora mostra **Approve it in QoreX** con un link **Open QoreX** e un ID di richiesta. QoreX ti mostrerà il validatore e l'importo prima della firma — non viene inviato nulla finché non lo approvi lì.
9. Apri QoreX (il link/deeplink lo fa per te) e approva la delega. QoreX costruisce, firma e trasmette la transazione; il dashboard non vede mai la tua chiave.

### Ridelegare {#redelegate}

Il contratto di richiesta sottostante supporta già lo spostamento diretto di un bond da un validatore a un altro (`redelegate`, con un validatore di origine e uno di destinazione che devono essere diversi) — con lo stesso schema non-custodiale, firmato tramite QoreX, di delega e revoca della delega. Al momento della stesura di questo documento, tuttavia, il dashboard non espone ancora un pannello Redelegate dedicato né un pulsante per questa operazione.

Finché quel pannello non viene rilasciato, sposta uno stake verso un validatore diverso in due passaggi usando i flussi presenti su questa pagina:

1. **[Revoca la delega](#undelegate)** dell'importo dal validatore che vuoi lasciare.
2. Attendi il periodo di unbonding indicato in quel flusso — il QOR non è spostabile né produce rendimento durante questo periodo.
3. Una volta che il QOR svincolato torna spendibile, **[delegalo](#delegate)** al nuovo validatore.

Questo richiede più tempo di una ridelega diretta (nessuna ricompensa da bonding durante la finestra di unbonding di 21 giorni), quindi consideralo un percorso temporaneo, non quello previsto. Vale anche la pena sapere, dal punto di vista delle commissioni, che una ridelega diretta è normalmente la più costosa tra queste operazioni di staking, e che il passaggio di revoca della delega in questa soluzione temporanea costa già sensibilmente di più di una semplice delega presa da sola — la chain misura il gas per operazione anziché applicare una tariffa fissa, e scrivere una voce nella coda di unbonding comporta un lavoro extra reale. Delegare da solo resta il più economico dei tre.

### Revocare la delega {#undelegate}

Uscire da una delega è ora disponibile sul dashboard — per un certo periodo era possibile delegare ma non revocare la delega da qui, quindi se ricordi che mancasse, è per questo.

:::caution Periodo di unbonding di 21 giorni
Il QOR con delega revocata non arriva oggi stesso. Rimane prima in un **periodo di unbonding di 21 giorni**, durante il quale non produce ricompense e non può essere spostato né venduto. Il pannello lo dichiara due volte apposta — una come sottotitolo, un'altra proprio sopra il pulsante di conferma — perché chi arriva su questa schermata di fretta (un mercato in calo, un validatore jailed) è esattamente chi ha più bisogno di vederlo prima di firmare.
:::

1. Nella pagina **Wallet**, seleziona la scheda **Stake / Delegate** e scorri fino al pannello **Unbond QOR**, sotto Delegate. Il suo sottotitolo ripete già l'avviso sui 21 giorni di unbonding sopra descritto.
2. Se da questo indirizzo non hai deleghe attive, il pannello lo segnala e si ferma qui.
3. Apri il menu a tendina **Unbond from** e scegli la delega da ridurre — elenca solo i validatori a cui sei effettivamente delegato, ciascuno con l'importo vincolato indicato.
4. Inserisci un **Amount (QOR)** da svincolare, oppure fai clic su **Unbond all `<amount>` QOR** per inserire automaticamente l'intero importo vincolato per quel validatore.
5. Se inserisci un importo superiore a quello vincolato su quel validatore, il pannello te lo segnala e blocca l'invio.
6. Subito sopra il pulsante di conferma, l'avviso compare una seconda volta: il QOR arriva tra 21 giorni, non oggi, e non produce nulla fino ad allora. Si tratta di una ripetizione intenzionale, non di un errore di battitura nella documentazione — leggilo di nuovo prima di procedere.
7. Se l'indirizzo non può coprire la commissione (le monete vincolate non possono pagarla — serve prima un po' di QOR spendibile su questo indirizzo), il pannello te lo segnala e disabilita il pulsante.
8. Fai clic su **Continue in QoreX** (**Preparing…** mentre la richiesta viene creata).
9. Il pannello mostra **Approve it in QoreX** con un link **Open QoreX** e un ID di richiesta — QoreX mostra il validatore e l'importo prima che tu firmi.
10. Apri QoreX e approva. Firma e trasmette la revoca della delega; il QOR torna spendibile solo al termine del periodo di unbonding di 21 giorni.

### Riscuotere le ricompense {#claim}

1. Nella pagina **Wallet**, seleziona la scheda **Rewards**.
2. Il pannello **Staking rewards** legge le ricompense maturate su ogni validatore a cui sei delegato. Se da questo indirizzo non hai nulla in stake, lo segnala e non c'è nulla da riscuotere.
3. Altrimenti mostra il totale in attesa di riscossione, più una riga per validatore con l'importo maturato lì. Le ricompense maturano in modo continuo e non vengono mai perse aspettando — non c'è alcuna scadenza.
4. Fai clic su **Claim in QoreX**. Si tratta di una riscossione totale: preleva le ricompense maturate da tutti i validatori mostrati, in un'unica richiesta — non esiste un pulsante di riscossione per singolo validatore.
5. Approva la riscossione in QoreX (tramite il link **Open QoreX**) per firmarla e trasmetterla.

:::note Periodo di unbonding
Il QOR con delega revocata attraversa un periodo di unbonding di 21 giorni prima di tornare spendibile, durante il quale non produce ricompense. Vedi [Staking e delega](/user-guide/staking-and-delegation) per i dettagli.
:::

## Correlati

- [Staking e delega](/user-guide/staking-and-delegation) — concetti completi sullo staking.
- [Usare il Wallet su mainnet](/dashboard/wallet#mainnet) — collega QoreX prima di fare staking.
- [Explorer Validators](/dashboard/explorer#validators) — consulta i validatori senza wallet.
- [Tools Hub](/dashboard/tools-hub) — candidati a gestire un tuo validatore.
