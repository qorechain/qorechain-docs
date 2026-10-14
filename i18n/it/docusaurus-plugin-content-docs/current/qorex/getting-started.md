---
slug: /qorex/getting-started
title: Guida introduttiva a QoreX
sidebar_label: Guida introduttiva
sidebar_position: 2
---

# Guida introduttiva a QoreX

Questa pagina illustra l'installazione dell'**app mobile** e la creazione, il ripristino o il collegamento del tuo wallet. Per il wallet desktop, consulta [Estensione del browser](/qorex/browser-extension), disponibile su Chrome, Firefox e Safari.

:::note Disponibilità mobile
- **Android** — disponibile in produzione su Google Play (Android 7.0 o successivo): https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** — disponibile sull'App Store (iOS 15.1 o successivo): https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

## Prima di iniziare: proteggi il tuo dispositivo

Un wallet QoreX può essere creato o importato solo quando il dispositivo ha configurato un **fattore di sblocco forte**. Questo è ciò che protegge le tue chiavi nel vault hardware. È valido uno qualsiasi dei seguenti:

- **iOS** — Face ID o Touch ID.
- **Android** — un dato biometrico di Classe 3 (impronta digitale, iride o sblocco facciale 3D) **oppure** un blocco schermo del dispositivo (PIN, sequenza o password).

:::note Sblocco facciale 2D su Android
Lo sblocco facciale 2D basato su fotocamera (presente su alcuni dispositivi, ad esempio certi modelli Samsung) è considerato un dato biometrico *debole*. Se è l'unico disponibile, QoreX si affida al **PIN / sequenza** sottostante — e il pannello di sistema lo propone automaticamente, quindi resti comunque coperto.
:::

Se non è registrato alcun fattore forte, i pulsanti di creazione/importazione restano disattivati e la schermata spiega cosa attivare. Configura Face ID, un'impronta digitale o un blocco schermo nelle impostazioni di sistema, quindi torna a QoreX.

## Primo avvio

L'app si apre sulla schermata di onboarding **solo quando sul dispositivo non esiste alcun wallet**. Una volta creato un wallet, ogni avvio successivo va direttamente alla scheda Home (Wallet). La visualizzazione dei saldi non richiede alcun dato biometrico; **firmare una transazione lo richiede sempre**.

Hai tre modi per configurare il wallet:

### 1. Crea un nuovo wallet

1. Tocca **Crea un nuovo wallet**.
2. QoreX genera una **frase di recupero di 24 parole** sul tuo dispositivo (entropia a 256 bit), la sigilla direttamente nel vault protetto dall'hardware e vincolato ai dati biometrici, e deriva la tua identità QoreChain — coin type 118, un indirizzo `qor1…` (i tuoi account ETH e SOL derivano dallo stesso seed). **L'app non ti mostra la frase mentre crea il wallet.**
3. **Rivela la frase e scrivila subito:** apri **Impostazioni → Sicurezza → Rivela la frase di recupero**, conferma con i dati biometrici o con il PIN del dispositivo e copia le 24 parole su carta, in ordine. Conservale offline. Questa frase è l'**unico** modo per recuperare il tuo wallet se perdi il dispositivo.
4. Se vuoi, configura il [recupero sociale](/qorex/security-and-recovery#social-recovery). Nota che la scheda **Stato del backup** nella Home tiene traccia solo del recupero sociale — non può sapere se hai scritto la frase, quindi non te lo ricorderà.

:::danger Esegui subito il passaggio 3 — nell'app nulla te lo ricorderà
Poiché dopo la creazione del wallet l'app passa direttamente alla Home, è facile proseguire senza aver mai scritto la frase. **Fallo prima di ricevere o inviare qualsiasi cosa.** Se perdi o disinstalli l'app, o perdi il telefono, senza la frase scritta o un [recupero sociale](/qorex/security-and-recovery#social-recovery) configurato, nessuno — inclusa QoreChain Association — potrà recuperare i tuoi fondi.
:::

:::caution La tua frase di recupero è tutto
Chiunque possieda le tue 24 parole controlla i tuoi fondi, e nessuno — inclusa QoreChain Association — può recuperarli per te. Non digitare mai la tua frase su un sito web, non condividerla e non conservarla in uno screenshot o in una nota su cloud. **Disinstallare QoreX elimina le chiavi memorizzate su quel dispositivo** — senza la tua frase scritta (o il [recupero sociale](/qorex/security-and-recovery#social-recovery) configurato in anticipo), una disinstallazione significa perdita permanente dell'accesso. Esegui il backup prima di finanziare il wallet, non dopo.
:::

### 2. Ripristina un wallet esistente {#2-restore-an-existing-wallet}

1. Tocca **Ripristina wallet esistente**.
2. Scegli **Frase di recupero** (se hai scritto le tue 24 parole) oppure **Recupero sociale** (se hai configurato dei guardiani e non hai più la frase — vedi [Recupero sociale](/qorex/security-and-recovery#social-recovery)).
3. Per il percorso con la frase di recupero: digita le tue 24 parole in ordine. QoreX normalizza maiuscole/minuscole e spazi superflui, verifica la frase e ti segnala chiaramente se una parola non è corretta, invece di mostrare un errore generico.
4. QoreX ri-deriva gli stessi indirizzi — il tuo wallet appare identico su qualsiasi dispositivo.

:::note Gli account aggiuntivi tornano uno alla volta
Il ripristino dalla frase riporta l'**Account 1**. Se nel vecchio wallet usavi più account, tocca **Aggiungi un account** (Impostazioni → I tuoi account) per recuperare i successivi — derivano dalla stessa frase, quindi riappaiono agli stessi indirizzi. Gli account in stile Ethereum si aggiungono con **Aggiungi un account Ethereum (coin 60)**; vedi [Ripristinare una frase da MetaMask o dalla Dashboard](#restore-dashboard). Aggiungili nello stesso ordine in cui li avevi creati nel vecchio wallet: gli account sono numerati per slot, e un ordine diverso su un nuovo dispositivo può dare un account diverso in uno slot.
:::

### 3. Collega da un altro dispositivo

Se hai già QoreX su un altro telefono o tablet, puoi trasferire il wallet **senza server e senza digitare nulla** — vedi [Collega un nuovo dispositivo](/qorex/security-and-recovery#link-device). Scegli **Collega da un altro dispositivo** sul nuovo dispositivo per iniziare.

## Più wallet su un solo dispositivo {#several-wallets}

Ogni wallet ha la **propria frase di recupero**. Puoi tenerne diversi su un solo telefono — ad esempio il tuo wallet principale e uno ripristinato da un altro servizio — e passare dall'uno all'altro con un tocco.

- **Mobile:** Impostazioni → **Wallet** elenca i wallet presenti su questo telefono. Tocca un wallet per renderlo attivo — l'intera app passa a quello (nulla si sposta on-chain). **Aggiungi un wallet** ti permette di crearne uno nuovo, ripristinarne uno dalla sua frase di recupero o collegarne uno da un altro dispositivo; i wallet che hai già restano. Ripristinare una frase già presente sul telefono equivale a passare a quel wallet.
- **Estensione:** la schermata **Wallet** del popup fa lo stesso, con **una sola password** per tutti. Aggiungere o rimuovere un wallet richiede la password una volta, per risigillare il vault, e disattiva lo sblocco con passkey (riattivalo dalla schermata iniziale).
- **Rimuovere un wallet** (*Rimuovi da questo telefono* / *Rimuovi da questo browser*) elimina la chiave di quel wallet dal dispositivo. I tuoi fondi restano on-chain, ma solo la sua frase di recupero può riportarlo — scrivila prima.

## Ripristinare una frase da MetaMask o dalla Dashboard {#restore-dashboard}

Per impostazione predefinita QoreX deriva il tuo indirizzo `qor1…` da una frase di recupero sul coin type **118**. Una frase usata per la prima volta in MetaMask — o in un wallet creato sulla Dashboard di QoreChain — mantiene i suoi QOR a un indirizzo **in stile Ethereum** (coin type **60**), quindi ripristinarla mostra un **Account 1** vuoto. Non è andato perso nulla; aggiungi l'account in stile Ethereum:

1. Aggiorna QoreX alla versione attuale dal tuo store.
2. **Aggiungi un wallet** (Impostazioni → Wallet → *Aggiungi un wallet* → *Ripristina wallet esistente*) e inserisci la frase. Il tuo wallet esistente resta dov'è. Nell'estensione: **Wallet** → ripristina.
3. Apri Impostazioni → **I tuoi account** e tocca **Aggiungi un account Ethereum (coin 60)**. Il primo tocco aggiunge l'account all'indice 0 — lo stesso indirizzo `0x…` che MetaMask mostra per quelle parole, e la stessa chiave del tuo indirizzo QoreChain `qor1…` per quell'account. I tuoi QOR sono lì.
4. Passa a quell'account (è etichettato *Ethereum · coin 60*). Da lì puoi inviare, fare staking e riscuotere. Il primo invio registra anche la chiave post-quantistica di quell'account, il che comporta una piccola commissione una tantum.

Un account in stile Ethereum non ha un @handle (gli handle si rivendicano su un account QoreChain `qor1…` al coin type 118), e i siti web firmano con esso tramite `signAndBroadcast` anziché `signDirect`. Ogni tocco su **Aggiungi un account Ethereum (coin 60)** aggiunge l'indice successivo.

## Orientarsi {#find-your-way}

- **Ricerca** — la lente in alto nella Home cerca schermate («stake»), monete («USDC»), persone (un @handle o un indirizzo), memo e l'inizio di un hash di transazione; digitando un @handle o un indirizzo `qor1…` viene proposto direttamente **Invia QOR a …**.
- **Tour** — la prima volta che un wallet si apre sulla Home, cinque brevi schede spiegano cosa fa QoreX e dove si trovano le cose. Viene eseguito una sola volta; rivedilo da Impostazioni → **Rifai il tour**.

## Facoltativo: rivendica un @handle

Dopo la creazione del wallet puoi rivendicare un **@handle** univoco (ad esempio `@liviu`) in modo che le persone possano inviarti fondi usando il tuo nome invece di un indirizzo `qor1…`. Questo è facoltativo e può essere saltato — il tuo wallet non dipende mai da esso. (Nell'estensione del browser, alcune versioni non offrono la rivendicazione; se il popup non la propone, rivendica dall'app mobile.) Un handle è associato a un indirizzo specifico piuttosto che al wallet nel suo insieme, il che diventa rilevante quando hai più di un account — vedi [Più account da una sola frase](/qorex/account-and-dashboard#accounts) e [@handle](/qorex/account-and-dashboard#handle).

## Lingua

QoreX è disponibile in dieci lingue — inglese, rumeno, tedesco, spagnolo, francese, italiano, turco, arabo, giapponese e coreano — e segue automaticamente la lingua del telefono, ripiegando sull'inglese per tutto il resto. Puoi sostituire la lingua rilevata in qualsiasi momento da **Impostazioni → Lingua**; scegliendo l'arabo l'interfaccia passa anche alla modalità da destra a sinistra.

## Prossimi passi

- [Invia e ricevi](/qorex/send-and-receive) — effettua il tuo primo trasferimento quantum-safe.
- [Sicurezza e recupero](/qorex/security-and-recovery) — configura il recupero sociale per non restare mai bloccato fuori dal wallet.
- [Portfolio e staking](/qorex/portfolio-and-staking) — monitora gli asset e guadagna ricompense di staking.
