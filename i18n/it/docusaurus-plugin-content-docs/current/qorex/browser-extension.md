---
slug: /qorex/browser-extension
title: Estensione Browser QoreX
sidebar_label: Estensione Browser
sidebar_position: 2
---

# Estensione Browser QoreX

L'**estensione browser** QoreX è il wallet desktop di QoreChain. È un **wallet autonomo** (crea o importa un wallet, detieni, invia e metti in staking QOR, e connettiti alle dApp) ed è l'elemento che permette a qualsiasi sito web di rilevare QoreX e trasformare ogni richiesta in un'approvazione esplicita e decodificata. È pensata per chiunque usi QoreChain da un browser desktop e per gli sviluppatori che vogliono che la loro web app funzioni con un wallet QoreChain.

È **live e pubblica** su tre store (Chrome, Firefox e Safari), tutti con l'estensione 0.4.5. Vedi [quale versione è live dove](#versions).

## Innovazioni {#innovations}

- **`signAndBroadcast`.** Una dApp invia i messaggi; il wallet mostra ogni messaggio decodificato e la commissione, poi aggiunge il layer ML-DSA-87 che solo il wallet può produrre, e trasmette. Una pagina non detiene mai la chiave ML-DSA-87.
- **`signDirect` controlla il layer rispetto alla chiave registrata.** Se una dApp allega da sé un layer ML-DSA-87, QoreX lo controlla rispetto alla chiave registrata on-chain per l'account prima che si apra qualsiasi finestra di approvazione. Se la transazione non porta alcun layer, lo aggiunge QoreX. `signAndBroadcast` resta il percorso più semplice (vedi [Inviare una transazione QoreChain](#sign-and-broadcast)).
- **Una superficie di permessi ridotta.** L'estensione dichiara `storage`, più (in Chrome e Firefox) `nativeMessaging` per lo strumento facoltativo Agenti IA della Modalità sviluppatore. Non ci sono host permission e non c'è alcun codice di analytics, di crash report o di tracciamento. Vedi [Quali permessi richiede QoreX](#permissions).

- **Vault sigillato.** Il vault è cifrato con AES-256-GCM sotto una chiave derivata dalla password (Argon2id). Dove il browser espone WebAuthn PRF (Chrome ed Edge), puoi sbloccare con una passkey; la password resta sempre un fallback.
- **Rilevamento senza prendere il controllo.** QoreX si annuncia con EIP-6963 (`rdns` `network.qore.qorex`) e con il Solana Wallet Standard. Non sovrascrive mai `window.ethereum` né `window.keplr`.
- **Approvazioni per-origine, identificate dal browser.** Il sito è l'origine che il browser stesso attesta, mai ciò che la richiesta dichiara. Una richiesta che ripete un campo in modo da poterlo leggere in due modi viene rifiutata.
- **Un wallet bloccato chiede la password, non di riprovare.** Una richiesta di firma di un sito fatta mentre QoreX è bloccato apre la schermata della password e nomina il sito; dopo lo sblocco, la richiesta mostra la propria approvazione. Nulla viene firmato senza la password.
- **Una revisione prima di ogni trasferimento.** Il modulo di invio porta a una schermata di revisione con il destinatario completo, le commissioni e gli avvisi, e solo dopo alla firma.
- **Cronologia con esportazione CSV**, per account, con ogni transazione in attesa, confermata o fallita secondo quanto riporta la chain.
- **Richieste di pagamento, contatti, La protezione del mio denaro e Assistenza** nel popup. Vedi [Richieste di pagamento](#pay-requests), [Contatti](#contacts) e [La protezione del mio denaro](#protection).
- **Modalità sviluppatore con 17 strumenti.** Un solo pulsante **Strumenti per sviluppatori** li apre tutti in una pagina dedicata. Vedi [Modalità sviluppatore](/qorex/developer-mode).

## Come usarla {#how-to-use}

1. Installa l'estensione (vedi [Come accedere](#how-to-access)) e apri il popup.
2. Scegli **Crea un nuovo portafoglio** (una password, poi 24 parole mostrate una sola volta) oppure **Importa una frase di recupero**. Vedi [Crea o ripristina un wallet](#wallet). Poi rispondi a **Cosa vuoi fare per prima cosa?** oppure salta il passaggio.
3. Usa **Invia**, **Ricevi**, **Metti in staking QOR**, **Cronologia** e **Monete e token** nel popup. Vedi [Inviare QOR](#send), [Cronologia](#history), [Stake dall'estensione](#stake) e [Invio su reti esterne](#send-external).
4. Apri una dApp. La prima connessione mostra un'approvazione con l'origine del sito; approvare rivela solo il tuo indirizzo pubblico. Revoca qualsiasi sito sotto [Siti collegati](#connected-sites).
5. Come sviluppatore, rileva QoreX con EIP-6963 e invia una transazione con `signAndBroadcast`. Vedi [Connettere una dApp a QoreX](#connect) e [Inviare una transazione QoreChain da una dApp](#sign-and-broadcast).

## Come accedere {#how-to-access}

Ti serve un browser desktop e nient'altro: nessun account, nessuna registrazione e nessuna app mobile. Le commissioni di rete si applicano quando invii o metti in staking (il minimo della rete è 0,1 uqor per gas). L'estensione segue la rete su cui è impostata; la mainnet `qorechain-vladi` è quella predefinita.

### Installazione {#install}

| Browser | Installazione |
|---|---|
| **Chrome e browser basati su Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 o successivo) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 o successivo)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Installa sempre da una di queste schede.

### Quale versione è live dove {#versions}

Versione attuale su ciascuno store:

| Store | Versione attuale |
|---|---|
| Chrome Web Store | 0.4.5 |
| Firefox Add-ons | 0.4.5 |
| Safari (Mac App Store, app macOS **QoreX Wallet**) | 1.8.2, che include l'estensione 0.4.5 (il Mac App Store usa una propria numerazione `1.x`) |

Le revisioni degli store arrivano in momenti diversi, quindi uno store può servire una build più vecchia di un altro; la scheda dello store mostra sempre la sua versione attuale. Vedi anche [Quale versione è live dove](/qorex/overview#versions).

L'estensione 0.4.x aggiunge il [blocco automatico](#unlock), una [revisione prima di ogni trasferimento](#send), la [Cronologia con esportazione CSV](#history), le [richieste di pagamento](#pay-requests), i [contatti](#contacts), [La protezione del mio denaro](#protection), la [riparazione, rotazione e multisig della chiave post-quantistica](#pqc-care), [schermate di staking](#stake) separate, una [schermata Ricevi che parte dalla moneta](#receive), la [firma EVM per le dApp](#standards), [finestre di accesso EVM più sicure](#evm-window) e gli [Strumenti per sviluppatori](#developer-tools). L'elenco completo per versione è in [Cosa aggiungono le build 1.2.5 / 0.4.5](/qorex/overview#whats-new-125) e negli elenchi che seguono.

Dalla 0.2.6 l'estensione ha acquisito anche: [più wallet con un'unica password](#wallets), un [account in stile Ethereum che aggiungi a mano](#coin60), [Claim & restake](#stake), un elenco **Uscite dallo staking in corso**, l'[aggiunta di un token tramite contratto](#custom-tokens), [Ricevi su qualsiasi rete](#receive), i [Siti collegati con Revoca](#connected-sites), la [finestra di accesso EVM](#evm-window), [`signAndBroadcast` per le dApp](#sign-and-broadcast) e schermate di approvazione che mostrano ogni messaggio, la commissione e la scadenza.

**La superficie dei permessi non è cambiata dalla 0.1.3.** Vedi [Quali permessi richiede QoreX](#permissions).

:::note
Su Safari, le approvazioni si aprono in una scheda del browser anziché in una finestra popup. L'estensione è confezionata con il wrapper web-extension di Safari di Apple a partire dalla stessa base di codice. Lo strumento **Agenti IA** della Modalità sviluppatore non è disponibile in Safari.
:::

## Crea o ripristina un wallet {#wallet}

Apri il popup e scegli:

- **Crea un nuovo portafoglio** - scegli una password (almeno 8 caratteri); QoreX genera una nuova recovery phrase di 24 parole sul tuo dispositivo (entropia a 256 bit), deriva la tua identità QoreChain e la sigilla nel vault sotto quella password (e, opzionalmente, una passkey - vedi [Sicurezza](#security)). Le 24 parole vengono mostrate **una sola volta** - annotale, spunta *Ho salvato la mia recovery phrase in un posto sicuro*, poi continua. Puoi mostrarle di nuovo in seguito con **Mostra la frase di recupero** nel popup (password richiesta).
- **Verifica il tuo backup** - subito dopo aver confermato di aver salvato la frase, QoreX ti chiede di digitare tre delle sue parole, in posizioni casuali, come le hai annotate. Se una non corrisponde, guarda il tuo foglio e riprova. Puoi scegliere **Verifica più tardi**; in seguito, **Verifica il mio backup** chiede la password e non mostra la frase, perché lo scopo è controllare la tua copia scritta.
- **Importa una frase di recupero** - ripristina da una phrase esistente. Una phrase di meno di 24 parole ripristina normalmente i tuoi fondi, ma QoreX ti avvisa che la tua chiave ML-DSA-87 ottiene allora solo la robustezza della phrase; per la piena robustezza, crea un nuovo wallet da 24 parole e spostaci i tuoi fondi.

:::danger Annota la phrase prima di continuare
Il vault dell'estensione esiste solo in questo browser. **Rimuovere l'estensione, cancellarne i dati o reimpostare il browser elimina le tue chiavi**, e nessuno - compresa QoreChain Association - può ripristinarle. Senza le tue 24 parole annotate, i tuoi fondi sono persi per sempre. Vedi [Fai il backup ora](/qorex/security-and-recovery#back-up-now).
:::

Dopo la creazione o l'importazione, QoreX chiede una volta **Cosa vuoi fare per prima cosa?** Nell'estensione, **Voglio ricevere denaro** ti guida attraverso la moneta, il suo indirizzo e un link di pagamento; **Voglio inviare denaro** attraverso il finanziamento del wallet, la nota sull'@handle (gli handle si rivendicano nell'app) e il tuo primo pagamento, con la commissione spiegata; **Voglio tenere al sicuro le mie cripto** mostra il tuo indirizzo di deposito e la verifica del backup. Tocca **Salta per ora** per passare oltre; **Cosa vuoi fare?** nella home del popup lo riapre.

L'estensione conserva le proprie chiavi; non richiede l'app mobile. Le chiavi non lasciano mai il dispositivo.

## Sblocco e blocco automatico {#unlock}

- **Sblocco** - digita la password e premi **Enter** oppure tocca **Sblocca**. Il pulsante mostra che sta lavorando (la chiave del vault è volutamente lenta da derivare). **Password errata.** compare solo per una password sbagliata; ogni altro errore viene nominato. Dove lo [sblocco con passkey](#security) è attivo, puoi usare **Sblocca con passkey**.
- **Blocco automatico** - nella home del popup, **Blocca automaticamente dopo** imposta per quanto tempo QoreX resta aperto senza utilizzo: 1, 5, 15, 30, 60 o 240 minuti (mostrati in minuti o ore). L'impostazione predefinita è 15 minuti.
- **Blocca** - il pulsante **Blocca** nella home del popup blocca subito; la schermata successiva chiede la password.
- **Un sito chiede mentre sei bloccato** - una richiesta di firma di un sito (nativa, EVM o Solana) apre QoreX sulla schermata della password, nominando il sito. Dopo lo sblocco, quella finestra si chiude e la richiesta mostra la propria approvazione. Se invece chiudi la finestra, la richiesta viene rifiutata e nulla viene firmato.

## Più wallet e account {#wallets}

- **Wallet** (dalla 0.3.3) - la schermata **Wallet** del popup ("Wallet in questo browser") elenca ogni wallet in questo browser. Ognuno ha la propria recovery phrase; **un'unica password** li sblocca tutti, e il cambio modifica quale wallet QoreX mostra e con quale firma (nulla si sposta on-chain). **Aggiungi** un wallet creandone uno nuovo (la sua phrase viene mostrata una sola volta) o ripristinandone uno; la password viene richiesta una volta per ri-sigillare il vault. Aggiungere o rimuovere un wallet disattiva lo **sblocco con passkey** - riattivalo dalla schermata principale. Per rimuoverne uno, tocca *Rimuovi da questo browser* e inserisci la password; l'ultimo wallet non può essere rimosso da questa schermata. La rimozione elimina quella chiave dal browser - solo la sua recovery phrase la riporta indietro.
- **Account** (dalla 0.2.2) - **I tuoi account** crea e alterna più account dalla stessa phrase (fino a 20 per wallet; sono numerati e non possono essere rinominati). Ripristinare la phrase che hai annotato riporta l'**Account 1**; riaggiungi gli altri con **Aggiungi un account**. Il cambio account sposta tutto con sé: invio, staking, ricezione e il tuo @handle seguono l'account attivo.

### Account in stile Ethereum {#coin60}

Dalla 0.3.2, **Aggiungi un account Ethereum (coin 60)** (nella schermata **I tuoi account**) aggiunge l'account per una phrase usata per la prima volta in MetaMask o sulla Dashboard; vedi [Ripristinare una phrase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard). Il suo indirizzo 0x è quello che MetaMask mostra per le stesse parole. Gli handle non sono offerti su di esso. Dall'estensione 0.3.9 puoi fare staking da questo account nell'estensione.

Portfolio, Q-Day Scanner, recovery sociale, Legacy Protocol, accesso all'account e collegamento dei dispositivi restano esclusivi dell'app mobile - vedi [QoreX Wallet](/qorex/overview#platform-availability).

## Il tuo account, saldo e @handle {#account}

La schermata principale del popup mostra il tuo indirizzo `qor1…` (tocca per copiare) e il tuo saldo QOR in tempo reale, così non devi aprire un block explorer per verificare nessuno dei due.

### Saldi in vesting (bloccati) {#vesting}

Se il tuo account detiene QOR in vesting (ad esempio un'allocazione TGE non ancora rilasciata), il saldo si divide in **disponibile ora** e **ancora bloccato**, e un invio che supera l'importo disponibile viene rifiutato prima di raggiungere la rete, invece di fallire on-chain dopo aver comunque pagato una commissione. QoreX deliberatamente **non** mostra una "prossima data di sblocco" qui: una vesting schedule può essere modificata dalla governance, quindi una data sulla scheda del saldo si leggerebbe come una promessa che QoreX non può garantire. La divisione disponibile-vs-bloccato è ciò che rimane accurato.

### Rivendica un @handle

Rivendicare un **@handle** unico (ad esempio `@liviu`) richiede un **account con accesso effettuato** e avviene **nell'app mobile**; l'estensione ti indirizza lì e non rivendica da sola gli handle. Una volta rivendicato, l'handle si lega a quell'indirizzo, così l'estensione lo risolve quando lo paghi e gli altri possono pagarti per nome. Vedi [@handle](/qorex/account-and-dashboard#handle) per come gli handle sono legati agli indirizzi (non a un wallet nel suo insieme).

## Inviare QOR {#send}

1. Apri il popup e tocca **Invia**.
2. Inserisci il destinatario (indirizzo `qor1…` o @handle), l'importo e un memo facoltativo. I [preferiti](#contacts) compaiono nel modulo come chip selezionabili con un tocco.
3. **Controlla il trasferimento.** La schermata di revisione mostra il destinatario per intero (e il nome del contatto, se è un contatto salvato), l'importo e il memo. Se questa è la prima transazione dell'account, mostra anche la commissione una tantum di registrazione della chiave ML-DSA-87 e il totale.
4. Leggi ogni avviso. QoreX ti dice quando è il primo pagamento a quell'indirizzo da questo wallet, quando l'indirizzo **somiglia soltanto** a uno che hai già pagato o salvato (confronta ogni carattere; serve un secondo tocco, **Tocca di nuovo per inviare comunque a questo indirizzo**) e quando la commissione di rete è superiore all'importo che stai inviando.
5. Tocca **Conferma e invia**. QoreX firma con la firma ibrida e invia.

Disponibile su mainnet e testnet. Una transazione oltre il limite di gas per transazione della rete viene rifiutata prima che qualcosa venga firmato.

## Invia a un @handle {#handle-send}

Dalla 0.1.9 puoi pagare un @handle registrato direttamente, invece di cercare un indirizzo (le ricerche erano interrotte da un difetto nelle versioni fino alla 0.3.6 e funzionano di nuovo dalla 0.3.7):

1. Apri il popup e tocca **Invia**.
2. Nel campo destinatario, digita `@` seguito dall'handle (ad esempio `@liviu`) invece di un indirizzo `qor1…`.
3. QoreX risolve l'handle e ti mostra l'**indirizzo risolto** prima che tu firmi qualsiasi cosa - controlla sempre che corrisponda a ciò che ti aspetti.
4. Inserisci l'importo, controlla la [schermata di revisione](#send) e conferma.

La risoluzione viene verificata in due modi prima che QoreX la utilizzi: un'attestazione del registry controllata rispetto a una trust key integrata nell'estensione, e la firma del proprietario dell'handle sulla rivendicazione stessa. Una risposta che fallisce uno dei due controlli viene rifiutata del tutto - QoreX non ripiega mai sulla visualizzazione di un indirizzo non verificato. La prima volta che paghi un determinato handle, QoreX ricorda (fissa) l'indirizzo a cui si è risolto; se in seguito quell'handle si risolve a un indirizzo **diverso**, QoreX si ferma e ti mostra sia il vecchio che il nuovo indirizzo per intero, così puoi decidere se procedere. Questa memoria vive **per browser** - pagare lo stesso handle per la prima volta da un browser o computer diverso lo mostra come nuovo anche lì. È previsto, non un errore.

## Ricevi {#receive}

Tocca **Ricevi** nel popup. La schermata **parte dalla moneta**:

1. **Scegli la moneta da ricevere** - un elenco con ricerca (**Cerca moneta o rete**) con QOR per primo, poi la moneta propria di ogni rete e i token inclusi, ciascuno con la sua immagine e quella della sua rete. Sono elencati anche i token che hai [aggiunto tramite contratto](#custom-tokens). Le immagini sono incluse nel wallet, quindi per mostrarle non viene scaricato nulla da terzi.
2. QoreX mostra l'indirizzo della rete di quella moneta come codice QR con un pulsante di copia, e un avviso che nomina la moneta: invia a questo indirizzo solo quella moneta, su quella rete. Dove un indirizzo vale su più reti (le reti EVM), indica quali.
3. **Scegli un'altra moneta** ti riporta all'elenco.

Le reti supportate sono QoreChain, Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis e Celestia. Un indirizzo per un'altra rete è derivato dalla tua frase di recupero, quindi può richiedere una conferma per essere mostrato. Per Cosmos Hub, Osmosis e Celestia, QoreX mostra l'indirizzo da cui firmano i tuoi invii su quelle reti.

## Cronologia {#history}

Tocca **Cronologia** nella home del popup per vedere cosa è successo sull'account:

- **Ogni tipo di transazione QoreChain**, non solo gli invii: inviato, ricevuto, messo in staking, ritirato dallo staking, stake spostato, ricompense riscosse, blocchi di staking, finestra EVM e modifiche alle chiavi, con importo e commissione. Una transazione EVM mostra anche quanto ha prelevato dalla [finestra di accesso EVM](#evm-window).
- **Stato, letto dalla chain.** Un trasferimento inviato da questo dispositivo che la cronologia della chain non mostra ancora è elencato come **In attesa: la rete non ha ancora confermato**. Se la rete non riesce a trovarlo, QoreX dice che potrebbe essere fallito, quindi controllalo prima di inviare di nuovo (puoi usare **Nascondi** sulla riga). Una transazione fallita è contrassegnata, con la commissione comunque pagata.
- **Per account** - con più account, scegli l'account in alto.
- **Ripeti pagamento** - compila di nuovo il modulo di invio a partire da un pagamento passato. Devi comunque controllarlo e confermarlo.
- **Esporta CSV** - il file viene creato sul tuo dispositivo, contiene solo la tua cronologia (nessuna frase, nessuna chiave) ed è reso sicuro da aprire in un foglio di calcolo.

Se la rete non è raggiungibile, QoreX dice che non è riuscito a caricare la cronologia; non la mostra mai come "nessuna transazione". Per ora la cronologia copre solo QoreChain. È disponibile su mainnet e testnet.

## Richieste di pagamento {#pay-requests}

Chiedi a qualcuno un importo in QOR con un link che non può essere modificato senza che si veda.

**Chiedere un pagamento:**

1. Apri **Richieste di pagamento** nella home del popup e crea una **Nuova richiesta**: l'importo in QOR, una nota facoltativa (fino a 140 caratteri) e, se ne hai uno, la scelta se mostrare il tuo @handle.
2. Tocca **Crea link**. QoreX firma la richiesta con la chiave del tuo account. Copia il link con **Copia link** e invialo a chi deve pagare.
3. **Le mie richieste** le elenca. **Controlla lo stato** legge la chain e mostra **Pagata** o **Non ancora pagata** (oppure che la rete non ha risposto). **Riusa il mese prossimo** crea una nuova richiesta da una precedente.

**Pagare una richiesta:**

1. Apri **Paga una richiesta**, incolla il link e tocca **Apri**.
2. QoreX controlla la firma, che il firmatario possieda l'indirizzo di ricezione, la rete esatta e l'eventuale @handle sulla richiesta. Un link modificato, un firmatario errato, una rete sconosciuta o una coin diversa da QOR vengono rifiutati. Se la richiesta è per l'altra rete, cambiala tu stesso; QoreX non lo farà.
3. Tocca **Paga**. Ottieni la normale [schermata di revisione](#send) prima che venga inviato qualcosa. Il pagamento porta nel memo il tag della richiesta, ed è così che il QoreX del richiedente lo trova on-chain.

Una richiesta firmata non richiede account né accesso. Una richiesta su testnet lo dice: i QOR di testnet non hanno valore. I formati dei link per sviluppatori sono in [Integrazione dApp](/qorex/dapp-integration).

## Contatti e preferiti {#contacts}

**Contatti** nella home del popup conserva i nomi degli indirizzi che paghi, **solo su questo dispositivo**.

- **Aggiungi contatto** - un nome e almeno un indirizzo: QoreChain (`qor1…`), EVM (`0x…`), Solana o Cosmos, e un @handle facoltativo. Contrassegnalo come **Preferito** per vederlo come chip a un tocco nel modulo di invio. **Pay &#123;name&#125;** apre il modulo già compilato. L'eliminazione richiede due tocchi. L'elenco contiene fino a 200 contatti.
- I **contatti @handle** mostrano se l'handle punta allo stesso indirizzo di quando lo hai pagato l'ultima volta, e ti avvisano se il suo indirizzo è **cambiato**.
- **Sosia** - un indirizzo che somiglia soltanto a uno che già conosci viene segnalato, mostrando entrambi perché tu possa confrontare ogni carattere.

Un contatto non è un controllo di sicurezza: ogni pagamento mostra comunque l'indirizzo completo da controllare.

## La protezione del mio denaro {#protection}

**La protezione del mio denaro** nella home del popup è un'unica schermata in cui ogni riga viene verificata quando la apri, sul tuo dispositivo e sulla rete. Una verifica che non può essere letta lo dice; non vale mai come "tutto a posto" o "nessuno".

- **Backup verificato** e **Recupero testato** - la data, oppure **Non ancora**. **Testa la mia frase di recupero** chiede tre parole della tua frase. Vengono confrontate sul tuo dispositivo; nulla di ciò che digiti viene conservato o inviato.
- **App con autorizzazioni** - i siti che possono vedere il tuo indirizzo e chiederti di firmare, con **Revoca**.
- **Autorizzazioni concesse sulla rete** - concessioni che permettono a un altro account di inviare per te (authz) o di spendere i tuoi QOR per le commissioni di rete (fee grant), prima quelle illimitate, con **Revoca**. La revoca mostra cosa stai per firmare e la commissione, poi confermi.
- **Approvazioni dei token sull'EVM di QoreChain** - tocca **Controlla le approvazioni dei token** (per leggerle serve una volta la tua frase). QoreX indica fin dove indietro ha controllato; riapri la schermata per continuare il controllo. **Revoca** invia `approve(spender, 0)` dopo aver aperto una finestra EVM di una sola transazione limitata al contratto del token. Solo un account in stile Ethereum (coin 60) può revocare qui.
- **Protezione post-quantistica, per canale** - in parole semplici: le transazioni native di QoreChain portano due firme (ML-DSA-87 e classica); le transazioni EVM sono firmate in modo classico e ammesse solo all'interno di una finestra che hai aperto con la tua firma post-quantistica; le altre reti accettano solo firme classiche.

I guardiani e il recupero sociale sono nell'app mobile. Vedi [Sicurezza e recupero](/qorex/security-and-recovery).

## Assistenza e stato della rete {#help-and-status}

- **Assistenza** nella home del popup elenca gli unici canali ufficiali: la [community Telegram](https://t.me/QorechainCommunity), [Discord](https://discord.gg/qorechain), la [pagina di aiuto](https://qorechain.io/help/qorex), l'email a team@qorechain.io e **Segnala una vulnerabilità**. Lo staff di QoreChain non chiede mai la tua frase di recupero, la password o le chiavi. **Mostra riepilogo** fornisce un riepilogo diagnostico facoltativo (versione dell'app, rete e codici di errore, senza frase, chiavi, indirizzi o saldi) da copiare solo se l'assistenza lo chiede.
- **Banner sullo stato della rete** - QoreX legge l'orario dell'ultimo blocco della chain. Se ha più di un minuto, un banner dice che la rete è lenta e quanto è vecchio il blocco; se la rete non è raggiungibile, dice che i saldi potrebbero non essere aggiornati. Non mostra nulla mentre la rete funziona bene.
- **Ultimi valori noti** - quando la rete non risponde, il popup mostra l'ultimo saldo e le ultime deleghe che ha letto e dice a quando risalgono.

## Stake dall'estensione {#stake}

Dalla **0.2.2**, il popup ha una propria schermata di staking - un wallet creato solo nell'estensione non ha bisogno dell'app mobile per guadagnare ricompense di staking. Apri **Metti in staking QOR** nella home del popup. Si apre un **menu** con una riga di spiegazione per ogni azione; ogni azione apre la propria schermata, con la propria riga di errore, e **Torna allo stake** riporta al menu.

| Schermata | Cosa fa |
|---|---|
| **Metti in staking QOR** | Scegli un validatore e un importo. I validatori attivi sono elencati con la loro commissione; quelli in **jail** sono esclusi. Mentre digiti, QoreX ti avvisa se l'importo lascerebbe meno della commissione di una transazione (non potresti fare unstake né riscuotere finché l'account non detiene di nuovo QOR). |
| **Ritira dallo staking** | Avvia l'unbonding. Il tempo prima che i QOR tornino a tua disposizione è **letto dalla rete**, e l'importo appare sotto **Uscite dallo staking in corso** con il tempo rimanente. |
| **Sposta lo stake** | Redelega senza attesa di unbonding, in tre passaggi: (1) il validatore **da** cui spostare (quelli da cui non puoi ancora uscire sono in grigio, con la data), (2) i validatori **a** cui spostare, (3) **quanto**, con **Max** e il percorso e la ripartizione mostrati prima che tu firmi. Uno spostamento che la rete rifiuterebbe viene intercettato prima. Vedi [Spostare lo stake tra validatori](/qorex/portfolio-and-staking#move-stake). |
| **Riscuoti** | Raccoglie le ricompense. Se la commissione è maggiore delle ricompense, il primo tocco ti avvisa. |
| **Riscuoti e ridelega** | Reinveste le ricompense verso i validatori che le hanno generate in un'unica transazione (fino a 127 validatori). QoreX controlla prima che i tuoi QOR **sbloccati** possano pagare la commissione, che viene pagata prima che arrivino le ricompense. |
| **Blocca per un bonus** | Blocca parte del tuo stake per 3, 6 o 12 mesi. Vedi [blocchi di staking](/qorex/portfolio-and-staking#staking-locks). |
| **Le ricompense vanno a** | Invia le future ricompense di staking a **un altro account dello stesso wallet**, e a nessun altro indirizzo. Mostra dove vanno ora le ricompense, nomina per intero il nuovo account al primo tocco e firma al secondo. Il tuo stake non si sposta. |

Sotto il menu, la scheda **Lo staking, in breve** riporta le ricompense guadagnate finora, quanto costa lo staking (commissione del validatore e commissioni di rete) e quando arrivano i QOR ritirati dallo staking. Con più account, scegli quale fa lo staking dal selettore di account. Ogni azione è firmata con la firma ibrida obbligatoria (secp256k1 e ML-DSA-87), allo stesso modo di un Invio, e la schermata dice quando la tua prima transazione registra anche la tua chiave. Il tasso annuo è letto dal dato della chain stessa. Lo staking, la delega e le ricompense avvengono esclusivamente sulla lane **Nativa**, mai tramite un precompile EVM - vedi [Staking e Delega](/user-guide/staking-and-delegation).

### Approvare una richiesta di staking dalla Dashboard {#stake-dashboard}

La [Dashboard](/dashboard/staking-and-validators) di QoreChain compone le richieste di staking ma non può firmarle - la tua chiave non lascia mai il vault dell'estensione. Quando clicchi **Continua in QoreX** sulla Dashboard, la richiesta si apre nell'estensione perché tu la esamini (validatore e importo) e la approvi, esattamente come un Invio.

:::note Se una transazione viene mostrata come "downgraded" invece che riuscita
La Dashboard a volte mostra una transazione come **downgraded** invece di un successo netto. Significa che i tuoi fondi si sono spostati, ma il layer di firma ML-DSA-87 non è stato trovato on-chain per quella transazione - non è qualcosa che hai fatto tu di sbagliato e non è qualcosa che puoi risolvere dal tuo lato. È un difetto dal nostro lato; ti preghiamo di segnalarlo al supporto così possiamo indagare. Il messaggio resta a schermo deliberatamente invece di sparire, così hai il tempo di leggerlo e segnalarlo.
:::

### Invio su reti esterne {#send-external}

Oltre a QOR sulla lane Nativa, la schermata **Invia su reti esterne** del popup invia asset su altre reti, tutte derivate dalla stessa frase di recupero. Tutte le reti qui sotto possono inviare e ricevere:

| Tipo | Reti | Token inclusi |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Voci ERC-20 (USDC e USDT su tutte le chain EVM, DAI su Ethereum) |
| SVM | Solana | Voci SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC via IBC; campo memo opzionale |

1. Scegli la moneta o il token, poi inserisci il destinatario e l'importo (e, sulle reti Cosmos, un memo facoltativo).
2. Spunta la presa d'atto. In inglese recita: **"External networks accept only classical signatures. Unlike your QOR, this transfer has NO ML-DSA-87 signature. I understand."** Le chain esterne non possono trasportare una firma ML-DSA-87, e QoreX non lo nasconde mai.
3. Sulle reti EVM il primo tocco calcola la **commissione di rete massima** ("Network fee: at most …"); il secondo invia esattamente con quel preventivo. Qualsiasi modifica annulla il preventivo. Se la commissione, pagata nella moneta che stai inviando, è superiore all'importo, vieni avvisato.
4. Un destinatario che somiglia soltanto a un indirizzo che hai già pagato su quella rete viene mostrato per intero e richiede un tocco in più.

## Standard wallet supportati {#standards}

QoreX espone tre interfacce, tutte iniettate nella pagina come `window.qorex` (`{ evm, native, svm }`) e rilevate tramite EIP-6963 e il Solana Wallet Standard. In una web app, il [wallet adapter](/developer-tools/wallet-adapter) racchiude questo rilevamento.

| Standard | Cos'è | Cosa significa per te come sviluppatore |
|---|---|---|
| **EIP-1193** | La JavaScript API del provider Ethereum (`request(...)`, eventi). | Oltre alle richieste su account e rete (`eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`), QoreX firma `personal_sign`, `eth_signTypedData_v4` ed `eth_sendTransaction` sulla lane EVM di QoreChain (chain id 9801, testnet 9800) e su Ethereum. Ogni approvazione dice, decodificato sul tuo dispositivo, cosa viene autorizzato, e dove può simula prima la transazione. Su QoreChain possono inviare solo gli account in stile Ethereum (coin 60), e una transazione richiede una [finestra di accesso EVM](#evm-window). Vedi [Integrazione dApp](/qorex/dapp-integration). |
| **EIP-6963** | Rilevamento multi-wallet dei provider (eventi announce / request). | QoreX si annuncia insieme a ogni altro wallet - **non sovrascrive mai `window.ethereum`** - così l'utente sceglie QoreX per ogni sito senza conflitti. |
| **Provider Nativo (in stile Keplr)** | `window.qorex.native`: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `getOfflineSigner` (per cosmjs, cosmos-kit e Interchain Kit), `signArbitrary` / `verifyArbitrary`, più un elenco `capabilities`. **Non** è un sostituto completo di Keplr: QoreX non crea l'alias `window.keplr`, e la firma amino e `sendTx` non sono disponibili. | Il modo più semplice di inviare una transazione QoreChain è **`signAndBroadcast`** (vedi [Inviare una transazione QoreChain](#sign-and-broadcast)): QoreX mostra i messaggi decodificati e la commissione, aggiunge il layer ML-DSA-87 che solo il wallet può produrre, e trasmette. Con `signDirect` o `getOfflineSigner`, QoreX controlla un layer allegato dalla tua pagina rispetto alla chiave registrata dell'account, oppure aggiunge da sé il layer quando non c'è. Vedi [Integrazione dApp](/qorex/dapp-integration). |
| **Solana Wallet Standard** *(dalla 0.1.5)* | Rilevamento wallet nativo per le dApp Solana (`wallet-standard:register-wallet` / `app-ready`). | Le dApp Solana **rilevano automaticamente QoreX** - nessuna integrazione personalizzata. Funzionalità: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; chain `solana:mainnet`; transazioni sia `legacy` che `v0`. |

:::note Raggiungere direttamente la lane SVM
La stessa interfaccia è disponibile anche su `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Il rilevamento automatico Wallet-Standard e la lane SVM completamente implementata sono stati rilasciati nella **0.1.5** e sono live sia su Chrome che su Firefox (vedi [quale versione è live dove](#versions)).

Le approvazioni Solana mostrano **una riga per istruzione**, decodificata dove QoreX può: trasferimenti di SOL (destinatario e lamport), trasferimenti di token SPL, **"ALLOW SPENDING of your tokens"** (approve), **"HAND OVER control of the account"** (set authority) e chiusura di un token account - e riportano "instruction QoreX cannot read" per tutto il resto, con il programma. Una richiesta che include un'istruzione approve o set authority è intitolata "wants authority over your Solana tokens - read every line below". Le transazioni che non elencano il tuo wallet come firmatario vengono rifiutate, `signMessage` non firmerà byte che in realtà sono una transazione, e la firma è contrassegnata come **classica**. Vedi [Firma ibrida](#pqc).
:::

## Monete e token {#custom-tokens}

La schermata **Monete e token** del popup ti permette di aggiungere un **token ERC-20 tramite il suo contratto**: scegli la rete, incolla l'indirizzo del contratto, **Controlla contratto**. QoreX legge nome e decimali del token dal contratto stesso - e li rilegge in background quando lo aggiungi, invece di fidarsi del popup - poi li mostra con un promemoria che chiunque può creare un token con qualsiasi nome. Il token compare poi in **Invia su reti esterne** e in [Ricevi](#receive). Rifiuta token inclusi, duplicati, reti non EVM, indirizzi errati, contratti illeggibili e contratti che prendono in prestito il nome di un token incluso.

## Siti collegati {#connected-sites}

**Siti collegati** nel popup elenca ogni sito che questo wallet ha approvato - un sito può vedere l'indirizzo di questo wallet e chiederti di firmare. Tocca **Revoca** per rimuoverne uno. Le approvazioni sono conservate **per wallet**: un sito approvato per un wallet non può leggere l'indirizzo di un altro wallet dopo che hai cambiato.

## Finestra di accesso EVM {#evm-window}

La schermata **Finestra di accesso EVM** del popup apre e chiude la finestra che permette a un account in stile Ethereum (coin 60) di inviare sulla lane EVM di QoreChain (v3.2.0 e successive), con gli stessi limiti dell'app: fino a 17,280 blocchi e 1,000 transazioni, e un tetto di spesa in QOR che conta tutti i QOR che escono dall'account, più ogni commissione massima. I token non vengono contati nel tetto.

1. Scegli per quanto tempo (blocchi), quante transazioni e il tetto di spesa.
2. Scegli **Cosa ammette la finestra**:
   - **Solo trasferimenti di QOR (consigliato)**, l'impostazione predefinita: nessuna chiamata a contratti, nessun nuovo contratto e nessun destinatario che sia un contratto;
   - **Qualsiasi contratto**: si può chiamare qualsiasi contratto, e la schermata avvisa che token, NFT e approvazioni spostati da un contratto non sono limitati dalla finestra. Se la rete non può limitare una finestra ai trasferimenti di QOR, QoreX ti chiede conferma prima di aprirne una per qualsiasi contratto; se rispondi di no, non viene aperto nulla.
3. Tocca **Apri la finestra**. La finestra aperta dice esattamente cosa ammette. **Chiudi la finestra** la termina.

Una finestra che hai aperto con **Solo trasferimenti di QOR** non consente a un sito di chiamare un contratto. La transazione di un sito può far sì che QoreX apra, dalla propria approvazione, una finestra esattamente per quella transazione; l'approvazione nomina ogni contratto che la finestra ammetterebbe e dice che sostituisce qualsiasi finestra aperta.

Un account coin-118 non può usare la lane EVM; la schermata elenca i tre passaggi da compiere e ha un pulsante per **I tuoi conti**. Solo le schermate del tuo wallet possono aprire, chiudere o cancellare una finestra; un sito non può. Vedi [Finestra di accesso EVM](/qorex/security-and-recovery#evm-window).

## Cura della chiave post-quantistica e multisig {#pqc-care}

**Registra di nuovo la chiave (riparazione).** Se il record della chiave post-quantistica dell'account sulla rete non può più firmare (è vuoto, solo classico o comunque inutilizzabile), la home del popup mostra una scheda. Toccando **Registra di nuovo la chiave** compare la commissione di rete; tocca di nuovo per registrare. QoreX non lo fa mai da sé. Se l'account ha una finestra EVM, la rete la chiude, quindi dopo aprine una nuova.

**Ruota la chiave post-quantistica.** Il pulsante **Ruota la chiave post-quantistica** sostituisce la chiave ML-DSA-87 dell'account sulla rete con la chiave successiva derivata dalla tua frase di recupero. Tocca due volte; la commissione è mostrata nel risultato. La rotazione ti protegge se è stata esposta solo la chiave post-quantistica; **non** aiuta se è stata esposta la tua frase di recupero. Dopo, gli altri wallet che usano la stessa frase non possono firmare per questo account finché non supportano le chiavi ruotate, e la rete chiude la finestra EVM dell'account. QoreX trova la chiave giusta quando ripristini dalla frase.

**Account multisig.** **Account multisig** gestisce account che richiedono la firma di più membri, con una firma post-quantistica di ciascun membro oltre a una classica. QoreX usa gli stessi file della riga di comando di QoreChain, così ogni membro può firmare in QoreX o dalla riga di comando.

1. **Crea un multisig** dagli indirizzi dei membri (ciascuno deve aver inviato almeno una transazione), dal numero di firme necessarie e da un nome facoltativo, oppure usa **Aggiungi un multisig esistente** incollandone la chiave.
2. La schermata mostra il saldo e lo stato della chiave di ciascun membro. Prima esegui **Prepara la registrazione** dell'insieme dei membri post-quantistici; finché non è registrato l'account non può inviare. Poi **Prepara un invio**.
3. Nell'estensione, i file vengono scaricati e aperti. **Turno 1:** i membri aggiungono le firme post-quantistiche; combinale. **Turno 2:** i membri concordati firmano in modo classico. Poi **Invia alla rete**.
4. La firma richiede due tocchi, e prima controlli cosa stai firmando. QoreX ti avvisa se la transazione registra un autenticatore, perché un autenticatore può spostare i fondi del multisig senza le firme degli altri membri.

## Strumenti per sviluppatori {#developer-tools}

La modalità sviluppatore è disattivata per impostazione predefinita. Per attivarla nell'estensione, tocca sette volte il **numero di versione** in fondo al popup. In fondo alla home del popup compare una sezione per sviluppatori con **Strumenti per sviluppatori** (il pulsante `</>`), **Passa alla testnet (diana)** (o **Torna alla mainnet**) e **Disattiva la modalità sviluppatore**.

**Strumenti per sviluppatori** apre una pagina con gli strumenti raggruppati in **Ispeziona**, **Transazioni**, **Contratti e rollup**, **Altre macchine virtuali** e **Firma e agenti**. Ci sono 17 strumenti, gli stessi dell'app; sulla testnet è elencato tra questi anche **Solana su QoreChain**. La modalità sviluppatore non cambia alcuna regola di firma: tutto ciò che firma mostra comunque cosa firma e attende la tua approvazione. Ogni strumento è descritto in [Modalità sviluppatore](/qorex/developer-mode).

Lo strumento **Agenti IA** consente a un assistente IA sul tuo computer di leggere ciò che permetti e **proporre** una transazione. QoreX controlla e simula ogni proposta, e tu la approvi o la rifiuti nella normale finestra di approvazione; nessun agente può firmare. Nell'estensione richiede un programma di supporto sul tuo computer che **non è ancora pubblicato**, e non è disponibile in Safari.

Solo sulla **testnet**, la home del popup offre anche l'invio a un'altra chain via IBC e la schermata del QoreChain Bridge; nessuno dei due è offerto sulla mainnet. Vedi [Funzionalità della testnet](/qorex/testnet-features).

## Lingua {#language}

L'estensione parla le stesse dieci lingue dell'app mobile, della dashboard e del sito: inglese, rumeno, tedesco, spagnolo, francese, italiano, turco, arabo, giapponese e coreano. Per impostazione predefinita segue la lingua del **browser** (ricadendo sull'inglese per qualsiasi altra lingua) - nota che questa è una fonte diversa rispetto all'app mobile, che segue la lingua del **telefono**, quindi le due possono mostrare lingue diverse se il tuo telefono e il tuo browser sono impostati diversamente. Un selettore nella schermata principale del popup ti permette di sovrascrivere la lingua rilevata in qualsiasi momento; passare all'arabo ribalta immediatamente il popup da destra a sinistra, non solo il testo.

## Sicurezza e permessi {#security}

QoreX è costruito per essere verificabile, non solo per essere ritenuto affidabile:

- **Vault** - le tue chiavi sono sigillate con **AES-256-GCM**. Il percorso della password deriva la propria chiave con **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), così un blob del vault copiato è lento da forzare su hardware GPU o ASIC. (I blob legacy PBKDF2 restano apribili e si ri-sigillano in Argon2id al prossimo sblocco.)
- **Sblocco con passkey (opzionale, dalla 0.1.5)** - dove il tuo authenticator supporta l'estensione **WebAuthn PRF**, QoreX può sbloccare il vault a partire dall'output PRF a 32 byte della passkey invece di una password digitata. La tua password rimane sempre un fallback.

  :::note Dove appare lo sblocco con passkey
  QoreX rileva automaticamente WebAuthn e mostra l'opzione **Attiva lo sblocco con passkey** solo dove il browser la espone alle pagine dell'estensione - cioè **Chrome ed Edge**. Su **Firefox** l'opzione è nascosta, perché Firefox non espone WebAuthn alle pagine delle estensioni. Questo è previsto, non un bug.
  :::
- **Blocco automatico** - QoreX si blocca da solo dopo un po' di inattività (15 minuti per impostazione predefinita) e ha un pulsante **Blocca**. Vedi [Sblocco e blocco automatico](#unlock).
- **Manifest V3 + CSP rigorosa** - `script-src 'self'; object-src 'self'; base-uri 'self'`. Non c'è **nessun caricamento di codice remoto** dopo l'installazione e nessun `wasm-unsafe-eval`.
- **Nessuna analisi, nessun report di crash, nessun SDK di tracciamento, nessuna registrazione** - l'estensione non richiede alcun account per detenere, inviare o mettere in staking QOR. Le tue chiavi, la recovery phrase, il vault e le approvazioni non lasciano mai il browser. Effettua però richieste di rete: verso gli endpoint pubblici di QoreChain per saldi, cronologia e trasmissione (queste portano il tuo indirizzo pubblico `qor1…`), una ricerca del prezzo (senza indirizzo), i servizi pubblici di qualsiasi rete esterna che detieni o consulti (il tuo indirizzo pubblico su quella rete) e il registro degli @handle (l'handle, o un indirizzo pubblico). Solo se usi l'[abbinamento con la Dashboard](#dashboard-bridge) invia una prova firmata che sei il proprietario dell'indirizzo. Vedi [Cosa invia QoreX sulla rete](/qorex/overview#data-and-privacy).

### Quali permessi richiede QoreX, e perché {#permissions}

Questa sezione esiste perché la scheda di Firefox mostra il permesso **"Accedere ai tuoi dati per tutti i siti web"**, che può sembrare in contrasto con un wallet che non dichiara alcun host permission. Ecco la verità esatta e non modificata, tratta dal manifest.

Il `manifest.json` dell'estensione dichiara:

```json
"permissions": ["storage", "nativeMessaging"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`storage`** - memorizza **localmente**, nello storage dell'estensione, il vault cifrato, le tue approvazioni di connessione per-origine e le impostazioni e gli elenchi del tuo wallet (come i contatti).
- **`nativeMessaging`** - nuovo nella 0.4.5, usato solo dallo strumento [Agenti IA](#developer-tools) della Modalità sviluppatore, per parlare con un programma di supporto sul tuo computer (non ancora pubblicato). QoreX apre quella connessione solo dopo che hai attivato **Consenti connessioni di agenti IA su questo computer** in quello strumento. Il pacchetto per **Safari** non dichiara questo permesso.
- **`host_permissions: []`** - QoreX non dichiara **nessun** host permission. Non richiede la capacità di effettuare richieste di rete cross-origin verso siti arbitrari per tuo conto.
- **`web_accessible_resources`** - permette alle pagine di caricare l'`inpage.js` di QoreX stessa, il piccolo script che espone il provider. `use_dynamic_url` gli assegna un indirizzo per sessione così che i siti non possano fare il fingerprint dell'estensione cercandola.
- **`content_scripts` con match `<all_urls>`** - questa è la ragione onesta per cui Firefox dice *"Accedere ai tuoi dati per tutti i siti web."* QoreX inietta un piccolo script provider (`content.js` → `inpage.js`) in **ogni pagina**. Un content script che gira su tutti i siti *può* tecnicamente leggere la pagina, e i browser descrivono questa capacità con quella dicitura esatta - che provenga da `host_permissions` o da un match di content script.

**Perché il content script gira ovunque.** Affinché **qualsiasi** dApp possa rilevare il wallet tramite EIP-6963 senza che tu debba prima concedere l'accesso per-sito. È così che funzionano MetaMask, Keplr, Phantom e ogni altro wallet iniettato: il provider iniettato deve essere presente prima che gli script della pagina vengano eseguiti (`document_start`), su qualsiasi sito tu visiti.

**Cosa fa quello script - e cosa non fa.** Fa solo da ponte per i messaggi del wallet (annuncia il provider, inoltra le richieste di connessione/firma al service worker, restituisce il risultato). Non legge il contenuto della pagina oltre a quelle richieste del wallet, non invia nulla a un server, né carica codice remoto - e non può recuperare dati arbitrari cross-origin perché non ci sono host permission. Tutto questo è verificabile: l'estensione è bloccata da CSP, non include analytics, e il suo manifest (qui sopra) è leggibile nel pacchetto installato.

## Connettere una dApp a QoreX {#connect}

Una dApp rileva QoreX tramite **EIP-6963** (annuncia la richiesta, sceglie il wallet il cui `rdns` è `network.qore.qorex`) e poi usa il provider EIP-1193 restituito; per la lane **Nativa** di QoreChain usa `window.qorex.native`, e legge `capabilities` per vedere cosa supporta questa build. QoreX non imposta mai `window.ethereum` né `window.keplr`. La guida completa per sviluppatori, con il codice, ha una pagina propria: [Integrare una dApp con QoreX](/qorex/dapp-integration) (vedi [Rilevare QoreX](/qorex/dapp-integration#detection) e [Connettersi](/qorex/dapp-integration#connect)). In una web app, il [wallet adapter](/developer-tools/wallet-adapter) racchiude per te questo rilevamento, e il [kit per sviluppatori QoreX](/developer-tools/qorex-integrations) copre l'integrazione lato app. (`@qorechain/connect` è deprecato; non avviare nuovo lavoro su di esso.)

Le approvazioni sono **per-origine**: la prima connessione a un sito apre un popup di approvazione che mostra l'origine, l'approvazione rivela solo il tuo indirizzo pubblico, e l'approvazione di un sito non concede nulla a un altro. Le approvazioni sono conservate per wallet, persistono finché non le revochi sotto **Siti collegati**, e un sito può avere una richiesta in attesa (tre in tutto); cambiare wallet o bloccare risponde "no" alle richieste in attesa. Dalla 0.4.5, una richiesta di firma di un sito fatta mentre QoreX è bloccato apre la schermata della password, nominando il sito, e mostra la propria approvazione dopo lo sblocco; chiudere la finestra la rifiuta. Vedi [Cosa mostra la finestra di approvazione](/qorex/security-and-recovery#approvals).

### Bridge con la Dashboard (v0.1.5, esteso nella v0.2.2) {#dashboard-bridge}

La versione 0.1.5 aggiunge un bridge limitato esclusivamente a **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prova di pairing *Connect with QoreX* (il backend riverifica la firma), e `executeTransfer({ to, amountUqor, memo })` approva e trasmette un trasferimento QOR proposto dalla Dashboard, restituendo il `txHash`. Questi metodi vengono rifiutati su qualsiasi altra origine.

La **0.2.2** aggiunge `native:executeRequest`, che accetta un'intera richiesta proposta dalla Dashboard - incluso lo [staking](#stake-dashboard) - validata rispetto allo stesso parser condiviso che QoreX usa ovunque: viene rifiutata in caso di rete non corrispondente, origine estranea, indirizzo che non è il tuo, tipo di richiesta sconosciuto, oppure una richiesta di staking che porta un `toAddress` (le richieste di staking non ne hanno uno). I tipi di richiesta sono send, delegate, undelegate, redelegate e claim; una richiesta Connect ti permette di scegliere quale dei tuoi account collegare, e `listAccounts()` restituisce i tuoi account (sola lettura).

Poiché un indirizzo `qor1…` è ugualmente valido su mainnet e su testnet, una richiesta proposta dalla Dashboard indica quale rete ha come target, e QoreX rifiuta di agire su di essa se questa non corrisponde alla rete a cui l'estensione è attualmente connessa - non passerà mai da una rete all'altra per conto di una richiesta.

## Inviare una transazione QoreChain da una dApp: `signAndBroadcast` {#sign-and-broadcast}

Ogni transazione QoreChain sulla lane nativa da un account con una chiave ML-DSA-87 registrata richiede una firma ibrida - secp256k1 **e** ML-DSA-87 - e solo il wallet detiene la chiave ML-DSA, quindi una pagina non può costruirla. Una dApp invia i messaggi con `window.qorex.native.signAndBroadcast({ chainId, messages, memo?, gasLimit? })`; QoreX mostra i messaggi decodificati e la commissione, costruisce la transazione per l'account che hai selezionato, aggiunge la firma ibrida (registrando prima la chiave ML-DSA-87 dell'account se è la sua prima transazione), trasmette e si risolve con `{ txHash, code, height?, shield }`. Disponibile dall'estensione **0.3.5**.

- La chain deve essere la rete attiva del wallet (`qorechain-vladi` su mainnet). Una dApp non può cambiare rete; solo tu puoi.
- Da 1 a 32 messaggi per chiamata; la commissione viene mostrata prima dell'approvazione; i messaggi riservati al wallet, come la gestione delle chiavi ML-DSA-87, vengono rifiutati.
- cosmjs, cosmos-kit e Interchain Kit funzionano tramite `getOfflineSigner` (dalla 0.4.0), dove QoreX aggiunge il layer ML-DSA-87 e la commissione che ne consegue.
- `signArbitrary` firma un messaggio con la chiave classica dell'account e con ML-DSA-87 (dalla 0.4.0).

Regole, gas, errori e gli esempi di codice completi sono in [Integrare una dApp con QoreX](/qorex/dapp-integration#sign-and-broadcast).

## Firma ibrida {#pqc}

Ogni trasferimento QOR nativo che QoreX stessa avvia viene firmato due volte: con una chiave classica secp256k1 e con **ML-DSA-87** (FIPS 204), usando la pipeline ibrida in `@qorechain/sdk`. **Non c'è alcun interruttore**: QoreChain la richiede e QoreX non invia mai un trasferimento QOR sulla lane Nativa senza di essa.

- **Firma Nativa avviata da una dApp** - usa [`signAndBroadcast`](#sign-and-broadcast): QoreX decodifica ogni messaggio, mostra la commissione e aggiunge da sé il layer ML-DSA-87. `signDirect` e i signer di cosmjs (`getOfflineSigner`) firmano una transazione costruita dalla pagina; quando non porta alcun layer ML-DSA-87, QoreX ne aggiunge uno, e un layer allegato dalla pagina viene controllato rispetto alla chiave registrata dell'account prima di qualsiasi finestra di approvazione (gli account importati da MetaMask usano `signAndBroadcast`). QoreX non firma mai alla cieca: una richiesta che non può decodificare viene rifiutata, e non firma mai una transazione QoreChain solo classica. Vedi [Integrare una dApp con QoreX](/qorex/dapp-integration#cosmjs).
- **Le firme classiche sono sempre etichettate** - i trasferimenti su reti esterne (ETH, BNB, Solana, …) non possono trasportare una firma ML-DSA-87; QoreX ti fa spuntare una presa d'atto esplicita e li contrassegna come classici invece di effettuare un downgrade silenzioso.

**Cosa significa questo per la dimensione delle transazioni.** ML-DSA-87 è una firma grande: la firma è di **4.627 byte** e la chiave pubblica di **2.592 byte** (fissate da FIPS-204). Una transazione QoreChain ibrida è quindi di diversi kilobyte più grande di una puramente classica. Se costruisci e trasmetti transazioni tu stesso, dimensiona i tuoi buffer e le stime delle commissioni per i byte aggiuntivi; il gas accounting di QoreChain già li prevede. Vedi [Firma Post-Quantistica](/developer-guide/post-quantum-signing) (la guida per sviluppatori) per i primitivi e il requisito di firma deterministica.

## Dove è pubblicata {#where-published}

| Store | Scheda | Versione attuale | Link |
|---|---|---|---|
| Chrome Web Store | **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox Add-ons | `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Mac App Store (Safari) | **QoreX Wallet**, app 1.8.2 | estensione 0.4.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |

Il codice sorgente di QoreX non è pubblico. Le schede degli store mostrano sempre la versione attuale.

## Limiti e problemi noti {#limits}

- **La firma EVM ha dei limiti.** Il provider firma `personal_sign`, `eth_signTypedData_v4` ed `eth_sendTransaction` (QoreChain, ed Ethereum per sito) e rifiuta gli altri metodi di firma. Su QoreChain possono inviare solo gli account importati da MetaMask, una transazione EVM richiede una finestra di autorizzazione (l'approvazione ne apre una per quella transazione) e porta solo una firma secp256k1. Vedi [Integrare una dApp con QoreX](/qorex/dapp-integration#evm).
- **`window.qorex.native` è in stile Keplr, non un sostituto completo di Keplr.** Non esiste un alias `window.keplr`. `signAmino` e `sendTx` sono assenti: Amino viene rifiutato con codice `4200`. `getOfflineSigner` e `signDirect` funzionano, e QoreX aggiunge il layer ML-DSA-87 quando la pagina non ne porta. `signArbitrary` e `verifyArbitrary` (firma di messaggi) funzionano dalla 0.4.0. Una dApp non può cambiare rete, e i messaggi riservati al wallet (gestione delle chiavi, regole di spesa, finestre EVM, certe concessioni) vengono rifiutati a qualsiasi sito.
- **Solo mobile:** Portfolio, Q-Day Scanner, recovery sociale, Legacy, accesso, collegamento dei dispositivi e rivendicazione di un @handle.
- **Nessuna schermata Swap** nell'estensione.
- Lo **sblocco con passkey** è offerto solo dove il browser espone WebAuthn alle pagine delle estensioni (Chrome ed Edge); su Firefox è nascosto.
- **Safari** apre le approvazioni in una scheda del browser anziché in un popup.
- Le **reti esterne** accettano solo firme classiche; QoreX ti fa riconoscere questo fatto prima di ogni trasferimento.
- **Solo testnet:** l'invio a un'altra chain via IBC, la schermata del QoreChain Bridge e Solana su QoreChain. Vedi [Funzionalità della testnet](/qorex/testnet-features).
- Gli **agenti IA** richiedono un programma di supporto non ancora pubblicato e non sono disponibili in Safari.
- La **cronologia** per ora copre solo QoreChain.
- Il vault dell'estensione esiste solo in questo browser. Rimuovere l'estensione, cancellarne i dati o reimpostare il browser elimina le tue chiavi; solo le tue 24 parole annotate le ripristinano.
