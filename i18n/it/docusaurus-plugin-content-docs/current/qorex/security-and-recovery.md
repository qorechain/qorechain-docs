---
slug: /qorex/security-and-recovery
title: Sicurezza e recupero
sidebar_label: Sicurezza e recupero
sidebar_position: 5
---

# Sicurezza e recupero

Questa pagina spiega come QoreX protegge le tue chiavi e come puoi riavere il tuo wallet: la chiave ML-DSA-87, il recupero sociale, Legacy, il collegamento dei dispositivi, la finestra di accesso EVM, ciò che mostrano le approvazioni e il Q-Day Scanner. È per ogni utente di QoreX; la maggior parte degli strumenti di recupero si trova nell'app mobile.

## Innovazioni {#innovations}

- **Recupero sociale con share cifrate.** I guardian custodiscono share cifrate del tuo seed, sigillate con ML-KEM e suddivise 2 su 3. Un recupero esegue un timelock di 48 ore e ti avvisa; puoi annullarlo, e un annullamento può solo ritardare, mai spostare fondi. Il relay conserva soltanto buste opache.
- **Legacy.** Un dead-man's switch sovrapposto ai tuoi guardian, per un beneficiario che scegli tu.
- **Collegamento dei dispositivi.** Un codice usa e getta e un QR, mai sulla stessa schermata. Il QR da solo è testo cifrato dietro una derivazione della chiave memory-hard.
- **Chiave ML-DSA-87 deterministica.** Derivata dalle stesse 24 parole (`SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`), quindi la chiave non richiede un backup separato. Vedi [QoreSign](/qoresign/overview).
- **Accesso EVM delimitato.** Una transazione EVM viene ammessa solo mentre è aperta una finestra di accesso, limitata per numero di transazioni, valore e scadenza.
- **Approvazioni che rifiutano ciò che non sanno leggere.** Vedi [Cosa mostra la finestra di approvazione](#approvals).
- **Q-Day Scanner.** Un report di esposizione per qualsiasi indirizzo Bitcoin o Ethereum.

## Come usarlo e dove trovarlo {#how-to-use}

Tutto ciò che segue si trova in **Settings → Security** nell'app mobile. L'estensione del browser ha la finestra di accesso EVM, Connected sites e le approvazioni; il recupero sociale, Legacy, il collegamento dei dispositivi e il Q-Day Scanner sono solo su mobile. QoreX è gratuito e per tutto questo non serve alcun account; per i link agli store vedi la [panoramica](/qorex/overview#how-to-access).

La scheda Home mostra anche una card **Backup health** che continua ad avvisarti finché il recupero sociale non è configurato. La card tiene traccia solo del recupero sociale: non può sapere se hai annotato la tua frase di recupero, quindi fallo tu stesso (vedi sotto).

## Esegui subito il backup - nessuno può recuperare un wallet perso al posto tuo {#back-up-now}

:::danger Leggi questo prima di finanziare il tuo wallet
QoreX è **non-custodial**: le tue chiavi esistono solo sul tuo dispositivo, e QoreChain Association non ne possiede una copia, non ha una chiave master e non ha alcun modo di reimpostare o ripristinare il tuo wallet. **Non esiste una procedura di "password dimenticata", nessun ticket di assistenza e nessuna possibilità di intervento da parte del servizio clienti** - se perdi l'accesso alle tue chiavi senza avere un backup, i fondi sono persi, in modo permanente e irreversibile. Questo vale per ogni wallet non-custodial, non è una limitazione di QoreX, ma vale la pena dirlo chiaramente.

**Fai almeno una di queste cose - subito dopo aver creato il tuo wallet, non più tardi:**

1. **Scrivi la tua frase di recupero di 24 parole** e conservala offline e in un luogo durevole (non uno screenshot, non una nota sincronizzata sul cloud, non un messaggio a te stesso). È l'unica cosa in grado di ripristinare il tuo wallet su qualsiasi dispositivo, in qualsiasi momento - su mobile, mostrala da **Settings → Security → Reveal recovery phrase** (l'app **non** la mostra mentre crea il wallet, quindi devi andare a prenderla tu - fallo subito); nell'estensione viene mostrata una sola volta quando crei il wallet, e in qualsiasi momento da **Reveal recovery phrase** nel popup. Vedi [Ripristinare un wallet esistente](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Configura il [recupero sociale](#social-recovery)** con guardian di cui ti fidi. Questo ti permette di recuperare il tuo wallet anche se perdi la frase, senza che un singolo guardian possa mai accedere da solo ai tuoi fondi.

Fare entrambe le cose è l'opzione più sicura - la frase ti protegge se cambi dispositivo o l'app non è disponibile; i guardian ti proteggono se perdi la frase stessa.

**Disinstallare l'app elimina le tue chiavi da quel dispositivo.** Il vault dell'app mobile e il vault dell'estensione del browser vivono ciascuno solo sul dispositivo che li ha creati. Disinstallare l'app, ripristinare il telefono o rimuovere/cancellare l'estensione elimina quella copia - senza backup e senza un dispositivo collegato, il tuo wallet non può essere recuperato da nessuno, QoreChain inclusa. **Rimuovere un wallet da un telefono o da un browser** (Settings → Wallets → *Remove from this phone*, oppure *Remove from this browser* nell'estensione) elimina allo stesso modo la chiave di quel wallet dal dispositivo - i tuoi fondi restano on-chain, ma solo la sua frase di recupero può riportarlo indietro.
:::

## Chiave ML-DSA-87 {#pqc-key}

La schermata **Security** mostra lo stato on-chain in tempo reale della tua chiave ML-DSA-87: **"Registers with your first transfer"** → **"Registered on-chain ✓"**. L'algoritmo è **ML-DSA-87** (deterministico, ibrido con secp256k1).

**Rotazione della chiave** - la rotazione della tua chiave ML-DSA-87 (un'operazione on-chain `MsgRotatePQCKey`) **non è ancora disponibile all'interno di QoreX**; arriverà con un successivo aggiornamento di gestione delle chiavi, richiederà una nuova conferma biometrica e **non è mai automatizzata**. I siti web non possono chiedere a QoreX di registrare, migrare o ruotare la tua chiave ML-DSA-87. La registrazione avviene da sola con il tuo primo trasferimento e non richiede nulla da parte tua - dalla v3.2.3 la chain accetta anche una *prova di possesso* opzionale insieme alla registrazione, che QoreX gestisce in modo invisibile nelle build attuali degli store. Vedi [Rotazione della chiave](/developer-guide/post-quantum-signing#key-rotation) per il meccanismo sottostante.

## Recupero sociale {#social-recovery}

Il recupero sociale permette a **guardian** fidati di aiutarti a ripristinare il tuo wallet senza mai vedere la tua frase di recupero.

- Il tuo seed viene suddiviso in **share cifrate** (sigillate con ML-KEM): tre per impostazione predefinita, di cui due qualsiasi possono aiutarti a recuperare (uno schema a soglia 2-of-3); una sola non può.
- Ogni guardian riceve una credenziale. La configurazione non scrive nulla di leggibile sul relay - solo buste opache e sigillate.
- Un recupero richiede l'approvazione della soglia di guardian, poi esegue un **timelock di 48 ore** e ti invia un **avviso di annullamento**, così che un tentativo malevolo possa essere fermato.

**Configuralo:** Home → **Set up recovery** (oppure Settings → Security → Social recovery) → **Create guardian credentials**. QoreX crea tre credenziali - *Guardian 1*, *Guardian 2* e un *Printable backup* - e **2 su 3** qualsiasi possono aiutarti a recuperare. Consegnane una a ciascuna persona o dispositivo di fiducia e conserva il backup stampabile in un luogo sicuro. L'avviso Backup health scompare una volta completata questa operazione.

**Approva il recupero di qualcun altro:** se sei un guardian per qualcuno, usa **Help recover** nella scheda Home per approvare la sua richiesta.

## Legacy Protocol {#legacy}

**Legacy Protocol** è un dead-man's switch sovrapposto ai tuoi guardian: i tuoi asset possono passare al beneficiario da te scelto se diventi irraggiungibile. È opzionale e si configura da Settings → Security.

## Collegare un nuovo dispositivo {#link-device}

Sposta il tuo wallet su un secondo telefono o tablet **senza server e senza digitare** le 24 parole:

1. **Nuovo dispositivo** → onboarding → **Link from another device**. Mostra un **codice di 10 caratteri** usa e getta e apre la fotocamera.
2. **Vecchio dispositivo** → Settings → Security → **Link a new device** → digita quel codice → conferma con la biometria. Appare un **codice QR** (il tuo seed sigillato con una chiave derivata dal codice: scrypt N=2¹⁷ → AES-256-GCM).
3. **Nuovo dispositivo** scansiona il QR → viene decifrato localmente → stesso wallet, stessi indirizzi.

**Perché la foto del QR non basta:** il codice e il QR non appaiono mai sulla stessa schermata. Una foto del solo QR è testo cifrato dietro una funzione di derivazione della chiave memory-hard, ed entrambi gli artefatti sono usa e getta e scompaiono con le schermate. Un codice errato dà un errore pulito - basta riprovare.

:::note
Il collegamento del dispositivo è una **comodità**, non un metodo di recupero. La tua frase di 24 parole e il recupero sociale sono le tue vere reti di sicurezza.
:::

## Finestra di accesso EVM {#evm-window}

Dalla chain **v3.2.0**, una transazione sulla **lane EVM** - per esempio una che firmi in MetaMask sulla rete EVM di QoreChain - viene ammessa solo da un account che ha una **chiave ML-DSA-87 registrata** *e* una **finestra di autorizzazione aperta** (un `MsgOpenEVMWindow` firmato in modo ibrido). La transazione EVM in sé porta soltanto una firma secp256k1. L'explorer etichetta una transazione di questo tipo come "Authorised by a PQC window". Aprire una finestra è un messaggio della lane QoreChain Native che MetaMask non può produrre, quindi è in QoreX che la apri. Gli invii di QoreX stesso usano la lane Native e non hanno mai bisogno di una finestra.

**Chi ne ha bisogno.** Una finestra serve per gli **account in stile Ethereum (coin 60)** - gli account che aggiungi con *Add an Ethereum account (coin 60)* per una frase usata per la prima volta in MetaMask (vedi [Ripristinare una frase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard)). MetaMask firma con una chiave Ethereum, che è la chiave di un account coin-60; nessuna chiave di MetaMask può inviare da un normale account coin-118 `qor1…`, quindi una finestra aperta su uno di essi non ottiene nulla e costa solo la commissione.

Aprila nell'app da **Settings → Security → EVM access window**, oppure con il pulsante **EVM access window** nel popup dell'estensione. Scegli tu:

| Campo | Significato | Limite |
|---|---|---|
| **How long (blocks, max 17280)** | per quanto tempo la finestra resta aperta | fino a 17.280 blocchi (circa 15 ore sulla mainnet) |
| **How many transactions (max 1000)** | quante transazioni EVM ammette | fino a 1.000 |
| **Spending cap, QOR - covers each amount sent PLUS its maximum fee** | il massimo che lascia passare | conta il valore **più** la commissione massima di ogni transazione |

Dalla v3.2.3 la chain supporta anche finestre più ristrette, con *ambito definito*; QoreX non offre una schermata per esse. I valori predefiniti sono 300 blocchi (circa 16 minuti sulla mainnet), 5 transazioni e 1 QOR. L'apertura costa una normale commissione di rete ed è firmata con la consueta firma ibrida (secp256k1 e ML-DSA-87), e una nuova finestra **sostituisce** qualsiasi finestra già aperta. Aprirla fa anche avanzare il nonce del tuo account, quindi apri la finestra **per prima**, poi invia da MetaMask - una transazione preparata in precedenza verrà rifiutata con "nonce too low". **Close the window** viene offerto solo mentre una finestra è attiva.

La schermata mostra uno di quattro stati: *Open for \{blocks\} more blocks · \{txs\} transactions · \{value\} QOR left*; *No window is open. MetaMask transactions from this account are refused.*; *That window has expired or is used up*; oppure *QoreX could not read the window from the network* - il che significa che QoreX non lo sa, **non** che non ne hai una. Se il tuo account non ha ancora una chiave ML-DSA-87, registrane una prima (il tuo primo trasferimento QoreX lo fa); una finestra non serve a nulla prima di allora.

:::caution Tienila piccola e breve
Una finestra permette a normali transazioni MetaMask di spostare i tuoi QOR **con una sola firma secp256k1**. Mantieni i limiti bassi - un tetto di spesa ridotto, poche transazioni, un tempo breve - e chiudi la finestra quando hai finito. Aprire una nuova finestra sostituisce la precedente, e il tetto conta ogni importo che invii **più** la sua commissione massima, quindi una transazione che supererebbe il tetto viene rifiutata.
:::

QoreX stesso non invia mai sulla lane EVM di QoreChain; usa MetaMask o un altro wallet EVM per quello, all'interno di una finestra aperta. (Inviare ETH, BNB e altri asset su *altre* reti da QoreX è una cosa diversa - vedi [Reti e token esterni](/qorex/send-and-receive#external-networks-tokens).)

## Cosa mostra la finestra di approvazione {#approvals}

Ogni firma prodotta da QoreX è approvata da te, e l'approvazione elenca esattamente ciò che stai firmando. QoreX mostra:

- un titolo e campi etichettati per **ogni messaggio** della richiesta, compresi i messaggi annidati in un **MsgExec** authz e i termini delle concessioni di permessi - e **rifiuta** tutto ciò che non riesce a mostrare ("QoreX cannot read this message … Approve only if you trust this site completely");
- la **commissione** (*Fee: \{amount\} · gas \{gas\}*), chi la paga ed eventuali fee grant - se la commissione non può essere letta, QoreX lo dice e ti avvisa di non approvare;
- il **limite, l'azione consentita e la scadenza** delle autorizzazioni di spesa e delle concessioni authz, con *UNLIMITED* e *NEVER* scritti per esteso; una scadenza è mostrata al secondo (`YYYY-MM-DD HH:MM:SS UTC`), e un voto di governance viene decodificato così da vedere su cosa stai votando. Tutto ciò che è illeggibile, illimitato o senza fine richiede un **secondo tocco** su Approve (*Tap again to approve*);
- l'account firmatario (*Signed by …*) quando ne hai più di uno;
- per una richiesta con un numero molto elevato di messaggi, i primi 50 e il conteggio dei restanti.

QoreX **rifiuta anche una richiesta i cui byte possono essere letti in due modi** (dalla 1.1.7 / 0.3.7). Una richiesta che ripete un campo che dovrebbe comparire una sola volta - per esempio una commissione o un importo raddoppiato - potrebbe essere mostrata in un modo ed eseguita in un altro, quindi QoreX non la mostra affatto per l'approvazione. Per i siti web, QoreX identifica il sito richiedente tramite l'origine che il browser stesso attesta, mai in base a ciò che la richiesta dichiara di sé.

Un cambio di wallet o di account, o il blocco del wallet, risponde "no" alle richieste in attesa; un sito può avere una richiesta in attesa, e in totale ne possono attendere tre. In alcune build i nomi dei campi nelle finestre di approvazione sono mostrati in inglese.

## La tua frase di recupero e gli strumenti di accessibilità {#phrase-privacy}

La schermata della frase di recupero richiede ogni volta una nuova biometria o un nuovo PIN del dispositivo, mostra le parole come una griglia numerata di sola lettura **senza pulsante di copia**, è bloccata per gli screenshot su Android ed è nascosta nel selettore di app. Su **Android 14 e successivi** le parole sono inoltre sottratte ai servizi di accessibilità che non sono veri strumenti di accessibilità (TalkBack e gli altri veri screen reader possono comunque leggerle). Su Android più vecchio e su iOS le parole sono nascoste per impostazione predefinita agli screen reader; se ti affidi a uno screen reader, tocca l'avviso su quella schermata per permettergli di leggerle. Mostra la frase solo quando nessuno può vedere il tuo schermo.

## dApp collegate {#connected-dapps}

Le connessioni alle dApp sono **per-origin**. Nell'app sono anche **legate alla sessione**: chiudendo il browser dApp integrato nell'app si revocano tutte le connessioni, quindi nulla resta connesso in background (la card **Connected dApps** in Settings → Security lo dice semplicemente). Nell'estensione del browser le connessioni persistono finché non le rimuovi - apri **Connected sites** nel popup per vedere ogni sito approvato da questo wallet e **Revoke** per revocarne uno qualsiasi.

## Firmatari collegati e limiti di spesa {#linked-signers}

Collegare una chiave esterna (Phantom o MetaMask) come **firmatario collegato** con propri limiti di spesa **non è ancora disponibile all'interno di QoreX** - Settings → Security mostra la card, con l'azione contrassegnata *coming*. Nulla è collegato al tuo wallet a meno che tu non l'abbia fatto da solo al di fuori di QoreX. La gestione delle chiavi non può mai essere delegata a una chiave collegata. Per il modello on-chain, vedi [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

Il **Q-Day Scanner** ti permette di inserire qualsiasi indirizzo - il tuo o quello di chiunque altro - e ottenere un report di esposizione per qualsiasi indirizzo Bitcoin o Ethereum. Lo raggiungi dai pulsanti rapidi della scheda Home.

## Il modello di sicurezza, in breve

1. **Non-custodial** - le chiavi vengono generate sul dispositivo, risiedono in vault supportati dall'hardware (mobile) o in un vault cifrato (estensione), e non lo lasciano mai.
2. **Niente senza consenso** - ogni connessione è per-origin, ogni firma è approvata individualmente (biometrica su mobile) e i payload vengono sempre decodificati prima della firma - ciò che QoreX non sa decodificare, lo rifiuta.
3. **Lane Native con firma ibrida.** Ogni trasferimento QOR nativo è firmato due volte: con una chiave classica e con ML-DSA-87 (FIPS 204). Qualsiasi elemento classico (reti esterne, EVM) è etichettato, mai silenzioso.
4. **Nessun analytics, nessun crash reporting, nessun SDK di tracciamento.** Chiavi, frase di recupero, vault e approvazioni non lasciano mai il dispositivo. L'accesso opzionale, le notifiche push e il recupero sociale usano un server solo quando li attivi; l'elenco completo di ciò che QoreX invia è in [Cosa invia QoreX in rete](/qorex/overview#data-and-privacy), ed è coperto dalla [QoreChain privacy policy](https://qorechain.io/privacy).
5. **Percorsi di recupero** - frase di 24 parole (sempre), recupero sociale con guardian + timelock di 48h (opzionale), eredità Legacy (opzionale), collegamento del dispositivo (comodità).

## Limiti e problemi noti {#limits}

- Il recupero sociale, Legacy, il collegamento dei dispositivi e il Q-Day Scanner sono solo su mobile.
- La rotazione della chiave ML-DSA-87 non è ancora disponibile all'interno di QoreX.
- I firmatari collegati con limiti di spesa non sono ancora disponibili all'interno di QoreX.
- QoreX non offre una schermata per le finestre EVM con ambito definito (la chain le supporta dalla v3.2.3).
- Il collegamento del dispositivo è una comodità, non un metodo di recupero. Un wallet perso, senza frase annotata e senza recupero sociale, non può essere recuperato da nessuno.
- La finestra di approvazione mostra alcuni nomi di campo in inglese in alcune build.
