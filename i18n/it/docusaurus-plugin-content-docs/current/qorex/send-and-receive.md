---
slug: /qorex/send-and-receive
title: Invia e ricevi
sidebar_label: Invia e ricevi
sidebar_position: 3
---

# Invia e ricevi

La scheda Home (Wallet) è il tuo punto di partenza. Mostra un **badge di rete** (MAINNET per impostazione predefinita, oppure TESTNET se hai attivato l'opzione per sviluppatori), il tuo **saldo totale** (tocca per nascondere/mostrare) e le azioni principali: **Send · Receive · Swap · Stake** (**Swap** non è mostrato su iOS). La tua lista asset mostra **QOR** (Native + post-quantistico 🛡, un saldo unificato tra le lane Native/EVM/SVM) e **All networks** (una vista unificata su ETH, BNB, POL, ARB e le altre [reti esterne](#external-networks-tokens) supportate da QoreX).

## Invia QOR quantum-safe

1. Tocca **Send**.
2. Inserisci il destinatario come indirizzo `qor1…` **oppure** come **@handle**. Un handle viene risolto e verificato crittograficamente (firma del registro + firma del proprietario + pinning trust-on-first-use); se la chiave di un handle cambia silenziosamente, QoreX mostra un avviso esplicito.
3. Inserisci l'importo. L'anteprima mostra il destinatario, l'importo, la **Network fee** e lo stato **Shield** — il livello di protezione post-quantistica della firma.
4. Conferma con l'approvazione **biometrica**. QoreX firma il trasferimento con la firma ibrida post-quantistica obbligatoria (ML-DSA-87 + secp256k1) e lo trasmette sulla lane Native.

Nella prima schermata, la casella di compilazione rapida (**Ask QoreX**) ti permette di digitare una richiesta semplice come "send 50 QOR to @maria" e compila il modulo per te. È un semplice lettore di testo che funziona **interamente sul tuo dispositivo** — nulla di ciò che digiti lì viene inviato altrove, e non è un assistente AI (QoreX non ne ha). Controlli comunque tutto e confermi con la biometria come al solito; se non riesce a leggere ciò che hai digitato, lo dice e compili il modulo a mano. I destinatari recenti compaiono come chip.

QoreChain non registra da sola la tua chiave post-quantistica — lo fa QoreX per te nell'ambito del tuo **primo** trasferimento (una piccola commissione di rete una tantum), e puoi vederne lo stato in [Sicurezza e recupero](/qorex/security-and-recovery#pqc-key). In QoreX non è necessario alcun passaggio separato.

### Inviare a un @handle, passo dopo passo {#handle-send}

1. Apri **Send** e digita `@` seguito dall'handle (ad esempio `@liviu`) nel campo destinatario al posto di un indirizzo.
2. QoreX cerca l'handle e ti mostra l'**indirizzo `qor1…` risolto** prima che tu confermi qualsiasi cosa. (Rivendicare il tuo handle richiede un account con accesso effettuato e si fa nell'app — vedi [@handle](/qorex/account-and-dashboard#handle).)
3. Controlla l'indirizzo risolto, inserisci l'importo e conferma come al solito.

QoreX accetta solo una risoluzione che superi **entrambi** i controlli che esegue: un'attestazione del registro verificata rispetto a una chiave di fiducia fissata nell'app, e la firma del proprietario dell'handle stesso sulla dichiarazione. Il mancato superamento di uno dei due controlli genera un errore, senza ricadere su un indirizzo non verificato. La prima volta che paghi un determinato handle, QoreX memorizza l'indirizzo a cui è stato risolto; se l'indirizzo di quell'handle dovesse mai cambiare, QoreX si ferma prima di firmare e mostra l'indirizzo vecchio e quello nuovo affiancati, così puoi decidere se procedere. Questa memoria è **per dispositivo** — pagare lo stesso handle per la prima volta da un altro telefono o da un'installazione nuova lo mostra come nuovo anche lì, il che è previsto e non un errore. L'estensione del browser risolve e paga gli handle allo stesso modo (la sua memoria è **per browser**, quindi un browser o un computer diverso lo vede come nuovo) — vedi [Inviare a un @handle](/qorex/browser-extension#handle-send).

### Invio di QOR in vesting (bloccati) {#vesting}

Se parte del tuo saldo è ancora in **vesting** — ad esempio un'allocazione TGE non ancora rilasciata — il tuo totale viene suddiviso in **disponibile ora** e **ancora bloccato**. Puoi inviare solo la parte disponibile; QoreX rifiuta autonomamente un tentativo di spesa eccessiva, invece di lasciare che sia la rete a rifiutarlo dopo aver comunque addebitato una commissione. La parte bloccata diventa spendibile gradualmente man mano che il piano di vesting la sblocca. Questa suddivisione è mostrata ovunque compaia il tuo saldo — Home, Send e i dettagli dell'asset.

## Ricevi {#receive}

Tocca **Receive**. QoreChain è selezionata per prima — il tuo indirizzo `qor1…` (e il tuo @handle, se ne hai uno) come codice QR con l'icona QoreChain, più **Copy** e **Share**. Tutto ciò che viene inviato a questo indirizzo arriva con protezione quantum-safe.

Per ricevere su un'altra rete, usa il selettore **Network** in alto: Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis e Celestia mostrano ciascuna **il proprio indirizzo** e l'avviso *«Invia a questo indirizzo solo \{coin\} o token su \{network\}. Le monete inviate da un'altra rete possono andare perse.»* Tutte le reti EVM condividono un unico indirizzo `0x…`. I tuoi indirizzi EVM e Solana sono derivati dalla tua recovery phrase, quindi QoreX chiede una conferma biometrica (**Show the address**) prima di mostrarli. Le altre reti non possono portare firme post-quantistiche — vedi [Reti esterne](#external-networks-tokens).

Nell'estensione del browser, **Receive** ha lo stesso selettore di rete.

## Coin e token {#coins-and-tokens}

Una coin senza riga non ha un indirizzo su cui riceverla. Per vedere una coin o un token in **Portfolio** *prima* di possederne, apri Portfolio → **+ Coin or token** e attivala (nell'estensione: **Coins and tokens**). Una coin fissata a zero apre **Receive** sulla sua rete quando viene toccata. Settings → **Coins and networks** elenca tutto ciò che il wallet può detenere oggi.

**Aggiungere un token tramite contratto** (solo reti EVM):

1. Portfolio → **+ Coin or token** → **Add a token by contract** (estensione: **Coins and tokens** → *Add a token by contract*).
2. Scegli la **Network**, incolla il **Contract address (0x…)** e tocca **Check contract**.
3. QoreX legge il simbolo e i decimali dal contratto stesso e mostra *«Il contratto dice: \{symbol\} · \{decimals\} decimali»*. Chiunque può creare un token e dargli un nome qualsiasi — QoreX non ne garantisce l'autenticità, quindi assicurati che sia il contratto che intendevi.
4. Tocca **Add \{symbol\}**. Viene contrassegnato come *Added by you* e può essere inviato come i token inclusi. Rimuovilo quando vuoi.

QoreX rifiuta un token già incluso, uno che hai già aggiunto, una rete non EVM, un indirizzo errato, un contratto che non risponde come un token e un contratto che usa il nome di un token che QoreX fornisce già su quella rete (probabile copia).

## Richiedi un pagamento

Tocca **Request** (richiede l'[accesso](/qorex/account-and-dashboard#sign-in)) per creare una richiesta di pagamento — un importo più una nota facoltativa — come codice QR o link. Chiunque lo scansioni vede il trasferimento precompilato.

## Reti e token esterni {#external-networks-tokens}

Da **All networks** (o Send-external) puoi inviare in modo nativo **ETH, BNB, POL, AVAX e SOL**, oltre a ETH su **Arbitrum, Base e OP Mainnet**, e **ATOM, OSMO e TIA** su Cosmos, oltre a token **ERC-20**, **SPL** e **IBC** — USDC e USDT sulle chain EVM e su Solana, DAI su Ethereum e Noble USDC via IBC — tutti derivati dalla stessa recovery phrase (ETH usa `m/44'/60'`, SOL usa il suo percorso standard e SPL usa gli associated token account).

:::caution Le chain esterne sono solo classiche
Le altre blockchain non possono portare firme post-quantistiche. Quando invii su una rete esterna, QoreX lo dichiara esplicitamente (il trasferimento usa una firma classica e lo **Shield** mostra il downgrade). Il tuo **QOR** resta sempre sulla lane Native protetta. Gli invii esterni basati su Cosmos supportano una nota facoltativa. Per le reti EVM QoreX mostra anche la **commissione di rete massima** prima che tu confermi — «Network fee: al massimo \{fee\}. Controllala prima di confermare.» — e firma esattamente con quel valore.
:::

## Swap

La scheda **Swap** è collegata all'AMM on-chain di QoreChain ma resta disabilitata — il pulsante mostra **"Swap — coming with pool liquidity"** — finché la liquidità e il feature flag remoto non la attivano. Quando ciò accade si attiva automaticamente; **non è necessario alcun aggiornamento dell'app**.

:::note iOS
La scheda Swap non compare affatto nella build dell'App Store — Apple considera uno scambio di token in-app un servizio regolamentato. Swap resta disponibile (una volta abilitato) solo su Android. L'estensione del browser non ha una schermata Swap.
:::

## Extra della schermata Home {#home-extras}

- **Widget della schermata Home** (Android e iPhone) — aggiungi **QoreX** dal selettore widget del tuo telefono. Mostra il tuo saldo QOR per l'account in uso, mostra dei puntini al posto dell'importo mentre la modalità privacy è attiva, si aggiorna da solo circa ogni 30 minuti e apre l'app quando viene toccato. Il widget non effettua alcuna richiesta propria ai server di QoreChain: l'app gli passa sul dispositivo il tuo indirizzo, il saldo e l'impostazione di privacy, e il widget legge il saldo dall'endpoint REST pubblico di QoreChain (che vede solo il tuo indirizzo pubblico). Chiunque possa vedere la tua schermata Home può vedere il widget, quindi attiva la modalità privacy (tocca il tuo saldo) se per te è importante.
- **Notifiche push** (mobile, mainnet) — la campanella in Home → **Notifications** ha un interruttore **Push notifications**: *«Ricevi una notifica quando arrivano QOR, anche con l'app chiusa. Il nostro server osserva solo i tuoi indirizzi pubblici; Apple e Google non vedono né importo né indirizzo.»* Il testo della notifica è semplicemente "QOR received". Le push sono **disattivate finché non le attivi**. Quando sono attive, il server conserva il token del tuo dispositivo e gli indirizzi pubblici `qor1…` del wallet in uso (fino a 10); disattivare l'interruttore rimuove il tuo dispositivo dal server, e un dispositivo da cui il server non riceve notizie da 90 giorni viene dimenticato. Vedi [Cosa invia QoreX sulla rete](/qorex/overview#data-and-privacy). Se le notifiche per QoreX sono disattivate nelle impostazioni del telefono, attivale prima lì. La consegna è stata testata end to end su Android; su iPhone, consideralo un servizio best effort e continua a controllare l'elenco **Notifications** nell'app.
- **Ricerca e tour** — vedi [Orientarsi](/qorex/getting-started#find-your-way).

## Prossimi passi

- [Portafoglio e staking](/qorex/portfolio-and-staking) — visualizza la tua allocazione e guadagna ricompense.
- [Sicurezza e recupero](/qorex/security-and-recovery) — proteggi e recupera il tuo wallet.
