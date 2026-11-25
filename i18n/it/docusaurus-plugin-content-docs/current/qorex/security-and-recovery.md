---
slug: /qorex/security-and-recovery
title: Sicurezza e recupero
sidebar_label: Sicurezza e recupero
sidebar_position: 5
---

# Sicurezza e recupero

Questa pagina spiega come QoreX protegge le tue chiavi e come puoi riavere il tuo wallet: il controllo di protezione in un'unica schermata, la chiave ML-DSA-87 e la sua cura, gli account multisig, il recupero sociale, Legacy, il collegamento dei dispositivi, la finestra di accesso EVM, ciò che mostrano le approvazioni, il blocco automatico, il Q-Day Scanner e dove ricevere aiuto. È per ogni utente di QoreX; la maggior parte degli strumenti di recupero si trova nell'app mobile, e il testo indica dove qualcosa è diverso nell'estensione per browser o Safari.

## Innovazioni {#innovations}

- **La protezione del mio denaro.** Un'unica schermata che controlla, dal vivo, il tuo backup, i siti collegati, le autorizzazioni che hai dato on-chain e le approvazioni dei token, e ti permette di revocare. Vedi [La protezione del mio denaro](#protection).
- **Cura della chiave post-quantistica.** Ruota la chiave ML-DSA-87 dalla tua frase di recupero, ripara un record che non può più firmare e gestisci un multisig post-quantistico. Vedi [Ruotare la chiave](#pqc-rotation), [Riparazione](#pqc-repair) e [Account multisig](#multisig).
- **Recupero sociale con share cifrate e un kit di recupero.** I guardian custodiscono share sigillate con ML-KEM, suddivise 2 su 3, e hanno bisogno del tuo kit di recupero per ripristinare il wallet. Un recupero esegue un timelock di 48 ore e ti avvisa; puoi annullarlo, e un annullamento può solo ritardare, mai spostare fondi.
- **Legacy.** Un dead-man's switch sovrapposto ai tuoi guardian, per un beneficiario che scegli tu.
- **Collegamento dei dispositivi.** Un codice usa e getta e un QR, mai sulla stessa schermata. Il QR da solo è testo cifrato dietro una derivazione della chiave memory-hard.
- **Chiave ML-DSA-87 deterministica.** Derivata dalla tua frase di recupero (la prima chiave è `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, e le chiavi ruotate sono derivate dalla stessa frase), quindi la chiave non richiede un backup separato. Vedi [QoreSign](/qoresign/overview).
- **Accesso EVM delimitato.** Una transazione EVM viene ammessa solo mentre è aperta una finestra di accesso, limitata per numero di transazioni, valore e scadenza, e una finestra che apri tu ammette solo trasferimenti di QOR, a meno che tu non scelga diversamente.
- **Approvazioni che rifiutano ciò che non sanno leggere.** Vedi [Cosa mostra la finestra di approvazione](#approvals).
- **Q-Day Scanner.** Un report di esposizione per qualsiasi indirizzo Bitcoin o Ethereum.

## Come usarlo e dove trovarlo {#how-to-use}

La maggior parte di quanto segue si trova in **Impostazioni → Sicurezza** nell'app mobile; **La protezione del mio denaro** e **Assistenza** sono in **Impostazioni**. Nelle estensioni per browser e Safari, la schermata iniziale del popup ha pulsanti per la finestra di accesso EVM, **Siti collegati**, **Mostra la frase di recupero**, **Ruota la chiave post-quantistica**, **Account multisig**, **La protezione del mio denaro** e **Assistenza**, oltre all'impostazione del blocco automatico. Il recupero sociale, Legacy, il collegamento dei dispositivi e il Q-Day Scanner sono solo su mobile. QoreX è gratuito e per tutto questo non serve alcun account; per i link agli store vedi la [panoramica](/qorex/overview#how-to-access).

La scheda Home mostra anche una card **Backup health** che continua ad avvisarti finché il recupero sociale non è configurato. La card tiene traccia solo del recupero sociale: non può sapere se hai annotato la tua frase di recupero, quindi fallo tu stesso (vedi sotto).

## La protezione del mio denaro {#protection}

Un'unica schermata che risponde a «il mio denaro è al sicuro, e chi può agire per me?». App: **Impostazioni → La protezione del mio denaro**. Estensione e Safari: **La protezione del mio denaro** nella schermata iniziale del popup. Ogni riga viene verificata quando la apri, su questo dispositivo e sulla rete; nulla viene dato per scontato. Quando qualcosa non può essere letto, QoreX dice *«Impossibile leggerlo adesso. Non significa che non ce ne siano.»*

| Riga | Cosa controlla | Cosa puoi fare |
|---|---|---|
| **Backup verificato** e **Recupero testato** | se hai dimostrato di possedere la tua frase di recupero, e quando | **Testa la mia frase di recupero**: digita tre parole della frase. È una prova a vuoto: vengono confrontate su questo dispositivo, nulla di ciò che digiti viene conservato o inviato, e nulla viene ripristinato o modificato. Le parole sbagliate non registrano nulla |
| **Guardiani (recupero sociale)** | se i guardian sono configurati, quanti sono e quanti ne servono | configurali in [Recupero sociale](#social-recovery) |
| **App con autorizzazioni** | i siti che possono vedere il tuo indirizzo e chiederti di firmare (nell'app, i siti del browser dApp integrato; nell'estensione, i siti collegati) | **Revoca** qualsiasi sito |
| **Autorizzazioni concesse sulla rete** | **concessioni authz** e **fee grant** permanenti che il tuo account ha dato ad altri, lette dalla chain, prima quelle illimitate, con le date di fine | **Revoca**: QoreX mostra una revisione con la commissione di rete, poi firma la rimozione con la tua firma ibrida |
| **Approvazioni di token ERC-20** | gli spender autorizzati a spostare i tuoi token sull'**EVM di QoreChain** | **Revoca**, che invia `approve(spender, 0)` |

**Sulle approvazioni dei token.** Nell'app, tocca **Controlla le approvazioni dei token**; la lettura usa l'indirizzo Ethereum di questo wallet, che richiede una volta la tua frase. Vengono lette a intervalli accettati dal nodo, quindi la schermata può dire *«Approvazioni di token controllate fino al blocco \{from\}. Potrebbero esisterne di più vecchie: riapri questa schermata per continuare il controllo.»* Per revocare, QoreX apre prima una **finestra EVM di una sola transazione**, firmata con la tua chiave post-quantistica e limitata al contratto del token, poi invia la transazione EVM, firmata con la tua chiave classica. Solo un account in stile Ethereum (coin 60) può inviare sull'EVM di QoreChain, quindi un account coin-118 non può revocare qui un'approvazione EVM, e QoreX lo dice.

**Protezione post-quantistica, per lane.** La schermata spiega in modo semplice quali firme proteggono cosa:

- **QoreChain (nativo):** ogni transazione porta due firme, una post-quantistica (ML-DSA-87) e una classica, e la rete le controlla entrambe.
- **QoreChain EVM:** le transazioni EVM sono firmate in modo classico, come in ogni wallet EVM. La rete le ammette solo all'interno di una [finestra](#evm-window) che hai aperto con la tua firma post-quantistica, entro i limiti che hai scelto.
- **Altre reti (Ethereum, Solana, Cosmos):** accettano solo firme classiche. QoreX non può aggiungervi una protezione post-quantistica.

## Esegui subito il backup - nessuno può recuperare un wallet perso al posto tuo {#back-up-now}

:::danger Leggi questo prima di finanziare il tuo wallet
QoreX è **non-custodial**: le tue chiavi esistono solo sul tuo dispositivo, e QoreChain Association non ne possiede una copia, non ha una chiave master e non ha alcun modo di reimpostare o ripristinare il tuo wallet. **Non esiste una procedura di "password dimenticata", nessun ticket di assistenza e nessuna possibilità di intervento da parte del servizio clienti** - se perdi l'accesso alle tue chiavi senza avere un backup, i fondi sono persi, in modo permanente e irreversibile. Questo vale per ogni wallet non-custodial, non è una limitazione di QoreX, ma vale la pena dirlo chiaramente.

**Fai almeno una di queste cose - subito dopo aver creato il tuo wallet, non più tardi:**

1. **Scrivi la tua frase di recupero di 24 parole** e conservala offline e in un luogo durevole (non uno screenshot, non una nota sincronizzata sul cloud, non un messaggio a te stesso). È l'unica cosa in grado di ripristinare il tuo wallet su qualsiasi dispositivo, in qualsiasi momento - su mobile, mostrala da **Impostazioni → Sicurezza → Mostra la frase di recupero** (l'app **non** la mostra mentre crea il wallet, quindi devi andare a prenderla tu - fallo subito); nell'estensione viene mostrata una sola volta quando crei il wallet, e in qualsiasi momento da **Mostra la frase di recupero** nel popup. Vedi [Ripristinare un wallet esistente](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Configura il [recupero sociale](#social-recovery)** con guardian di cui ti fidi. Questo ti permette di recuperare il tuo wallet anche se perdi la frase, senza che un singolo guardian possa mai accedere da solo ai tuoi fondi.

Fare entrambe le cose è l'opzione più sicura - la frase ti protegge se cambi dispositivo o l'app non è disponibile; i guardian ti proteggono se perdi la frase stessa.

**Disinstallare l'app elimina le tue chiavi da quel dispositivo.** Il vault dell'app mobile e il vault dell'estensione del browser vivono ciascuno solo sul dispositivo che li ha creati. Disinstallare l'app, ripristinare il telefono o rimuovere/cancellare l'estensione elimina quella copia - senza backup e senza un dispositivo collegato, il tuo wallet non può essere recuperato da nessuno, QoreChain inclusa. **Rimuovere un wallet da un telefono o da un browser** (Impostazioni → Wallet → *Remove from this phone*, oppure *Remove from this browser* nell'estensione) elimina allo stesso modo la chiave di quel wallet dal dispositivo - i tuoi fondi restano on-chain, ma solo la sua frase di recupero può riportarlo indietro.
:::

## Chiave ML-DSA-87 {#pqc-key}

La schermata **Sicurezza** mostra lo stato on-chain in tempo reale della tua chiave ML-DSA-87: **"Si registra al primo trasferimento"** → **"Registrata on-chain ✓"**. L'algoritmo è **ML-DSA-87** (deterministico, ibrido con secp256k1).

I siti web non possono chiedere a QoreX di registrare, migrare o ruotare la tua chiave ML-DSA-87. La registrazione avviene da sola con il tuo primo trasferimento e non richiede nulla da parte tua - dalla v3.2.3 la chain accetta anche una *prova di possesso* opzionale insieme alla registrazione, che QoreX gestisce in modo invisibile nelle build attuali degli store. Puoi anche [ruotare la chiave](#pqc-rotation) tu stesso, o [riparare](#pqc-repair) un record che non può più firmare. Vedi [Rotazione della chiave](/developer-guide/post-quantum-signing#key-rotation) per il meccanismo sottostante.

### Riparare una chiave che non può più firmare {#pqc-repair}

In rari casi il record della chiave che la rete conserva per il tuo account è **vuoto, solo classico o degenere**, quindi dall'account non si può inviare nulla. QoreX distingue i due casi: una chiave registrata da **un altro wallet** viene segnalata come tale, mentre un record che **non può più firmare** ottiene una scheda di riparazione nella schermata **Home** (app) o nella schermata iniziale del popup (estensione e Safari).

1. Leggi la scheda: *«La chiave post-quantistica di questo account sulla rete non può più firmare, quindi da questo account non si può inviare nulla. Registrare di nuovo la chiave risolve il problema.»* Mostra la commissione di rete, **0.09 QOR**, e dice che se l'account ha una finestra EVM, la rete la chiude (dopo aprine una nuova).
2. Tocca **Registra di nuovo la chiave**.
3. Tocca di nuovo (*Tocca di nuovo per registrare (commissione 0.09 QOR)*). Nell'app, conferma con la biometria.

La riparazione **non è mai automatica**: servono sempre due tocchi. Invia solo la registrazione della chiave, firmata con la tua chiave classica. Dopo, QoreX dice *«La chiave è di nuovo registrata. Questo account può di nuovo inviare.»*

### Ruotare la chiave post-quantistica {#pqc-rotation}

**Ruota la chiave post-quantistica** sostituisce la chiave ML-DSA-87 dell'account sulla rete con la **chiave successiva derivata dalla tua frase di recupero**. App: **Impostazioni → Sicurezza → Ruota la chiave post-quantistica**. Estensione e Safari: il pulsante **Ruota la chiave post-quantistica** nella schermata iniziale del popup. Tocca, poi tocca di nuovo per confermare (*Tocca di nuovo per ruotare la chiave*); l'app chiede anche la biometria. La transazione è firmata sia dalla chiave attuale sia da quella nuova, e la commissione di rete, presa da una simulazione, è mostrata nel risultato.

- **Protegge da** una chiave post-quantistica trapelata.
- **Non protegge da** una frase di recupero trapelata. Chi ha la tua frase può derivare ciascuna di queste chiavi. In quel caso, sposta i fondi su un nuovo wallet con una nuova frase.
- **Gli altri wallet che usano la stessa frase** non possono firmare per questo account finché non supportano le chiavi ruotate.
- **La rete chiude la finestra EVM dell'account.** Aprine una nuova se ti serve.
- **Il ripristino funziona ancora.** QoreX cerca tra le chiavi che la tua frase può derivare quella che la rete conserva, quindi un wallet ripristinato firma con la chiave ruotata.

La rotazione non è mai automatica, e i siti web non possono richiederla.

## Account multisig {#multisig}

Un **account multisig** richiede la firma di più membri. QoreX supporta il multisig post-quantistico su mainnet e testnet, usando **gli stessi file della riga di comando di QoreChain**, così ogni membro può firmare in QoreX o con lo strumento da riga di comando. App: **Impostazioni → Sicurezza → Account multisig**. Estensione e Safari: **Account multisig** nella schermata iniziale del popup.

**Crearne o aggiungerne uno**

1. **Crea un multisig:** inserisci gli indirizzi dei membri (`qor1...`), uno per riga, il numero di firme necessarie (la soglia) e un nome facoltativo, poi **Salva**. Ogni membro deve aver inviato almeno una transazione.
2. Oppure **Aggiungi un multisig esistente:** incolla la chiave multisig (l'output di `keys show <name> -p` della riga di comando, o una chiave condivisa da QoreX). **Condividi la chiave multisig** la invia agli altri membri.

**Controllarne lo stato.** La schermata dell'account mostra il saldo, se l'**insieme post-quantistico dei membri** è registrato (e la sua versione), se l'account in uso è un membro e, per ogni membro, se la sua chiave è pronta, mancante, non più in grado di firmare, registrata senza prova o non verificabile. Finché l'insieme dei membri non è registrato, l'account non può inviare.

**Firmare in due turni**

1. **Prepara la registrazione** (prima, una sola volta) o **Prepara un invio**. QoreX ricava il gas da una simulazione e crea un file. Nell'estensione e in Safari il file viene **scaricato**; nell'app viene **condiviso come testo**. Invialo agli altri membri.
2. **Turno 1.** Ogni membro post-quantistico apre il file (**Apri file dei membri**), lo controlla e sceglie **Firma come membro post-quantistico**. Nell'app i membri **incollano** il testo ricevuto; nell'estensione aprono il file.
3. **Combina** le firme dei membri.
4. **Turno 2.** Si scelgono i membri che firmano in modo classico (esattamente il numero della soglia, la stessa scelta per tutti), e ciascuno controlla e sceglie **Firma in modo classico**. Combina di nuovo.
5. **Invia alla rete.**

Ogni passaggio di firma mostra prima cosa stai firmando e richiede **due tocchi**; l'app chiede anche la biometria. Se una transazione dovesse registrare un **autenticatore**, QoreX ti avvisa: un autenticatore può spostare i fondi del multisig senza le firme degli altri membri. Per firmare offline da un file altri tipi di transazione, vedi l'area di lavoro offline e multisig in [Modalità sviluppatore](/qorex/developer-mode).

## Recupero sociale {#social-recovery}

Il recupero sociale permette a **guardian** fidati di aiutarti a ripristinare il tuo wallet senza mai vedere la tua frase di recupero.

- Il tuo seed viene suddiviso in **share cifrate** (sigillate con ML-KEM): tre per impostazione predefinita, di cui due qualsiasi possono aiutarti a recuperare (uno schema a soglia 2-of-3); una sola non può.
- Ogni guardian riceve una credenziale.
- **Il kit di recupero.** La copia cifrata del tuo seed è il tuo **kit di recupero** (inizia con `qorexkit1:`), che conservi tu. I guardian da soli non possono ripristinare il wallet: serve anche questo kit, e il kit da solo è inutile senza di loro. Le nuove configurazioni inviano al servizio di recupero solo il numero di guardian e la soglia. Vedi [Kit di recupero](#recovery-kit).
- Un recupero richiede l'approvazione della soglia di guardian, poi esegue un **timelock di 48 ore** e ti invia un **avviso di annullamento**, così che un tentativo malevolo possa essere fermato.

**Configuralo:** Home → **Configura il recupero** (oppure Impostazioni → Sicurezza → Recupero sociale) → **Crea le credenziali dei garanti**. QoreX crea tre credenziali - *Guardian 1*, *Guardian 2* e un *Printable backup* - e **2 su 3** qualsiasi possono aiutarti a recuperare. Consegnane una a ciascuna persona o dispositivo di fiducia e conserva il backup stampabile in un luogo sicuro. Poi salva il kit di recupero, come descritto sotto. L'avviso **Stato del backup** scompare una volta completata la configurazione.

### Kit di recupero {#recovery-kit}

Alla fine della configurazione QoreX mostra il tuo **kit di recupero**. Usa **Copia il kit di recupero** o **Condividi o salva**, e conserva una copia in un posto che controlli e **non solo su questo telefono** (un gestore di password, una nota, una stampa). Devi spuntare *Ho salvato il kit di recupero fuori da questo telefono* prima che **Fatto** funzioni. Per recuperare, incolla l'**ID di recupero o kit di recupero**.

Se hai configurato il recupero sociale con una versione precedente, QoreX può dirti che una copia cifrata del tuo kit è ancora sul servizio di recupero. Salva il kit, poi scegli **Elimina la copia dal relay**. Le credenziali dei tuoi guardian continuano a funzionare. Dopo la rimozione, solo tu hai il kit.

**Approva il recupero di qualcun altro:** se sei un guardian per qualcuno, usa **Aiuta a recuperare** nella scheda Home per approvare la sua richiesta.

## Legacy Protocol {#legacy}

**Legacy Protocol** è un dead-man's switch sovrapposto ai tuoi guardian: i tuoi asset possono passare al beneficiario da te scelto se diventi irraggiungibile. È opzionale e si configura da Impostazioni → Sicurezza.

## Collegare un nuovo dispositivo {#link-device}

Sposta il tuo wallet su un secondo telefono o tablet **senza server e senza digitare** le 24 parole:

1. **Nuovo dispositivo** → onboarding → **Collega da un altro dispositivo**. Mostra un **codice di 10 caratteri** usa e getta e apre la fotocamera.
2. **Vecchio dispositivo** → Impostazioni → Sicurezza → **Collega un nuovo dispositivo** → digita quel codice → conferma con la biometria. Appare un **codice QR** (il tuo seed sigillato con una chiave derivata dal codice: scrypt N=2¹⁷ → AES-256-GCM).
3. **Nuovo dispositivo** scansiona il QR → viene decifrato localmente → stesso wallet, stessi indirizzi.

**Perché la foto del QR non basta:** il codice e il QR non appaiono mai sulla stessa schermata. Una foto del solo QR è testo cifrato dietro una funzione di derivazione della chiave memory-hard, ed entrambi gli artefatti sono usa e getta e scompaiono con le schermate. Un codice errato dà un errore pulito - basta riprovare.

:::note
Il collegamento del dispositivo è una **comodità**, non un metodo di recupero. La tua frase di 24 parole e il recupero sociale sono le tue vere reti di sicurezza.
:::

## Finestra di accesso EVM {#evm-window}

Dalla chain **v3.2.0**, una transazione sulla **lane EVM** - per esempio una che firmi in MetaMask sulla rete EVM di QoreChain - viene ammessa solo da un account che ha una **chiave ML-DSA-87 registrata** *e* una **finestra di autorizzazione aperta** (un `MsgOpenEVMWindow` firmato in modo ibrido). La transazione EVM in sé porta soltanto una firma secp256k1. L'explorer etichetta una transazione di questo tipo come "Authorised by a PQC window". Aprire una finestra è un messaggio della lane QoreChain Native che MetaMask non può produrre, quindi è in QoreX che la apri. Gli invii di QoreX stesso usano la lane Native e non hanno mai bisogno di una finestra.

**Chi ne ha bisogno.** Una finestra serve per gli **account in stile Ethereum (coin 60)** - gli account che aggiungi con *Add an Ethereum account (coin 60)* per una frase usata per la prima volta in MetaMask (vedi [Ripristinare una frase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard)). MetaMask firma con una chiave Ethereum, che è la chiave di un account coin-60; nessuna chiave di MetaMask può inviare da un normale account coin-118 `qor1…`, quindi una finestra aperta su uno di essi non ottiene nulla e costa solo la commissione.

Se sei su un account che non può usare una finestra, la schermata elenca i passaggi da compiere e ha un pulsante per **I tuoi conti**.

Una finestra può essere aperta in due modi: **la apri tu** (sotto), oppure [QoreX ne apre una per una singola transazione](#per-transaction-windows) quando un sito ti chiede di approvarla.

Aprila nell'app da **Impostazioni → Sicurezza → Finestra di accesso EVM**, oppure con il pulsante **Finestra di accesso EVM** nel popup dell'estensione. Prima scegli **Cosa ammette la finestra**:

- **Solo trasferimenti di QOR** (predefinito, consigliato): nessuna chiamata a contratti, nessun nuovo contratto, nessun destinatario che sia un contratto.
- **Qualsiasi contratto:** una scelta separata, con un avviso: *«Si può chiamare qualsiasi contratto. Il tetto conta solo i QOR: token, NFT e approvazioni spostati da un contratto non sono limitati dalla finestra.»*

Se la rete non può limitare una finestra ai trasferimenti di QOR, QoreX lo dice e chiede se aprirla invece per qualsiasi contratto. Nulla si apre finché non dici sì esattamente a questo.

Poi scegli:

| Campo | Significato | Limite |
|---|---|---|
| **Per quanto (blocchi, max 17280)** | per quanto tempo la finestra resta aperta | fino a 17,280 blocchi (circa 15 ore sulla mainnet) |
| **Quante transazioni (max 1000)** | quante transazioni EVM ammette | fino a 1,000 |
| **Spending cap, QOR** | il massimo di QOR che lascia uscire | conta **tutti i QOR che escono da questo account, più ogni commissione massima**; i token non vengono contati |

In questa schermata non puoi indicare contratti specifici; le finestre limitate a contratti specifici vengono aperte da QoreX per una singola transazione (sotto). I valori predefiniti sono 300 blocchi (circa 16 minuti sulla mainnet), 5 transazioni e 1 QOR. L'apertura costa una normale commissione di rete ed è firmata con la consueta firma ibrida (secp256k1 e ML-DSA-87), e una nuova finestra **sostituisce** qualsiasi finestra già aperta. Aprirla fa anche avanzare il nonce del tuo account, quindi apri la finestra **per prima**, poi invia da MetaMask - una transazione preparata in precedenza verrà rifiutata con "nonce too low". **Chiudi la finestra** viene offerto solo mentre una finestra è attiva.

**Una finestra aperta dice esattamente cosa ammette:** *Ammette: solo trasferimenti di QOR*, *Ammette: qualsiasi contratto (i token non contano nel tetto)*, oppure *Ammette: solo \{targets\}*. Nell'ultimo caso QoreX aggiunge che **un contratto elencato può comunque agire per l'account**, anche spostare token che detiene o ha approvato loro, e che il limite di QOR non lo copre.

La schermata mostra uno di quattro stati: *Aperta per altri \{blocks\} blocchi · \{txs\} transazioni · \{value\} QOR rimasti*; *Nessuna finestra aperta. Le transazioni MetaMask da questo account vengono rifiutate.*; *Quella finestra è scaduta o esaurita*; oppure *QoreX non è riuscito a leggere la finestra dalla rete* - il che significa che QoreX non lo sa, **non** che non ne hai una. Se il tuo account non ha ancora una chiave ML-DSA-87, registrane una prima (il tuo primo trasferimento QoreX lo fa); una finestra non serve a nulla prima di allora.

:::caution Tienila piccola e breve
Una finestra permette a normali transazioni MetaMask di spostare i tuoi QOR **con una sola firma secp256k1**. Mantieni i limiti bassi - un tetto di spesa ridotto, poche transazioni, un tempo breve - scegli **Solo trasferimenti di QOR** a meno che non ti serva un contratto, e chiudi la finestra quando hai finito. Il tetto copre tutti i QOR che escono dall'account, inclusa la commissione massima, quindi una transazione che supererebbe il tetto viene rifiutata. Non copre i token.
:::

### Finestre per una singola transazione {#per-transaction-windows}

Quando un sito chiede a QoreX di inviare una transazione EVM su QoreChain e nessuna finestra aperta la copre, l'approvazione ne apre una **esattamente per quella transazione**, firmata con la tua chiave ibrida ML-DSA-87:

- una transazione, fino al valore **più la commissione massima**, per circa dieci minuti;
- limitata ai contratti che chiama, dove la rete lo supporta;
- l'approvazione **nomina ogni contratto** che la finestra ammetterebbe (inclusi i contratti che di recente ti hanno fatto firmare un permit) e dice che **sostituisce qualsiasi finestra che hai aperta**;
- il limite in QOR copre tutti i QOR che escono dall'account, commissione massima inclusa, e un contratto elencato può comunque agire per l'account (spostare token che detiene o ha approvato, o QOR detenuti da altri contratti);
- se la rete non accetta una finestra limitata a dei contratti, QoreX **chiede una seconda volta** prima di aprirne una senza quel limite. Rispondendo di no non viene aperto né inviato nulla.

Allo stesso modo, una firma di typed data che un contratto su QoreChain controlla (un permit) apre una breve finestra che elenca quel contratto. Nella cronologia delle transazioni, una transazione EVM mostra quanto ha usato della finestra. Vedi [Integrazione dApp](/qorex/dapp-integration) per il punto di vista dello sviluppatore. Se usi MetaMask o un altro wallet EVM con un'app che chiama contratti, scegli **Qualsiasi contratto** quando apri tu la finestra. Un'app che invia le proprie transazioni tramite QoreX non richiede finestre aperte in anticipo. Come la finestra manuale, questo vale per gli account in stile Ethereum (coin 60).

(Inviare ETH, BNB e altri asset su *altre* reti da QoreX è una cosa diversa - vedi [Reti e token esterni](/qorex/send-and-receive#external-networks-tokens).)

## Cosa mostra la finestra di approvazione {#approvals}

Ogni firma prodotta da QoreX è approvata da te, e l'approvazione elenca esattamente ciò che stai firmando. QoreX mostra:

- un titolo e campi etichettati per **ogni messaggio** della richiesta, compresi i messaggi annidati in un **MsgExec** authz e i termini delle concessioni di permessi - e **rifiuta** tutto ciò che non riesce a mostrare ("QoreX cannot read this message … Approve only if you trust this site completely");
- la **commissione** (*Fee: \{amount\} · gas \{gas\}*), chi la paga ed eventuali fee grant - se la commissione non può essere letta, QoreX lo dice e ti avvisa di non approvare;
- il **limite, l'azione consentita e la scadenza** delle autorizzazioni di spesa e delle concessioni authz, con *UNLIMITED* e *NEVER* scritti per esteso; una scadenza è mostrata al secondo (`YYYY-MM-DD HH:MM:SS UTC`). Leggi con attenzione l'azione consentita: un'autorizzazione di fee i cui messaggi consentiti includono `MsgExec` (un `AllowedMsgAllowance`) copre qualsiasi messaggio che il beneficiario può eseguire tramite essa, e una concessione authz generica copre qualunque tipo di messaggio nomini. Un voto di governance viene decodificato così da vedere su cosa stai votando. Tutto ciò che è illeggibile, illimitato o senza fine richiede un **secondo tocco** su Approve (*Tap again to approve*);
- l'account firmatario (*Signed by …*) quando ne hai più di uno;
- per una richiesta con un numero molto elevato di messaggi, i primi 50 e il conteggio dei restanti.

Per le richieste **EVM**, QoreX decodifica la transazione o i typed data (trasferimento, approvazione con *UNLIMITED* scritto per esteso, permit e altro) e tratta chiamate e tipi sconosciuti come ad alto rischio, con un secondo tocco. Simula dove la rete lo consente. Il nodo EVM di QoreChain può solo verificare che una chiamata con dati non fallirebbe, quindi l'approvazione dice allora *«Cosa fa ai tuoi token non è stato verificato. Approva solo se ti fidi di questo sito.»* e richiede un secondo tocco. Anche una transazione che fallirebbe, o che non può essere simulata, richiede un secondo tocco. Le richieste native che chiamano un contratto vengono simulate prima dell'approvazione, e una chiamata che il contratto rifiuterebbe viene respinta con il motivo della chain. Le schermate di approvazione mostrano il memo e permettono di aprire il messaggio completo.

QoreX **rifiuta anche una richiesta i cui byte possono essere letti in due modi** (dalla 1.1.7 / 0.3.7). Una richiesta che ripete un campo che dovrebbe comparire una sola volta - per esempio una commissione o un importo raddoppiato - potrebbe essere mostrata in un modo ed eseguita in un altro, quindi QoreX non la mostra affatto per l'approvazione. Per i siti web, QoreX identifica il sito richiedente tramite l'origine che il browser stesso attesta, mai in base a ciò che la richiesta dichiara di sé.

Un cambio di wallet o di account, o il blocco del wallet, risponde "no" alle richieste in attesa; un sito può avere una richiesta in attesa, e in totale ne possono attendere tre. In alcune build i nomi dei campi nelle finestre di approvazione sono mostrati in inglese.

### Cosa un sito non può mai richiedere {#never-requested}

Queste azioni sono disponibili **solo dalle schermate di QoreX**. QoreX le rifiuta a qualsiasi sito web, qualunque cosa il sito dica:

- la gestione delle chiavi post-quantistiche (registrare, migrare, ruotare);
- autenticatori (firmatari collegati) e regole di spesa;
- aprire, chiudere o cancellare una finestra di accesso EVM;
- i messaggi di finestra e di inoltro di Solana su QoreChain;
- un'autorizzazione (authz) che permetterebbe a qualcuno di **concedere** ulteriori autorizzazioni o di **eseguire** messaggi come il tuo account. Una tale concessione permetterebbe al destinatario di agire come te. QoreX la rifiuta direttamente, avvolta in `MsgExec` a qualsiasi profondità, o come concessione generica.

## Indirizzi sosia {#look-alike}

I truffatori inviano piccoli importi da indirizzi che iniziano e finiscono come uno che usi, sperando che tu copi quello sbagliato. QoreX confronta un destinatario con gli indirizzi che conosci (contatti salvati, i tuoi account e gli indirizzi che hai pagato), su QoreChain e sulle reti esterne, e segnala prima dell'invio un indirizzo che **somiglia soltanto** a uno di essi. Anche il probabile spam con un link nel memo è nascosto dalla Cronologia. Vedi [Contatti e preferiti](/qorex/send-and-receive#contacts) e [Cronologia](/qorex/send-and-receive#history).

## Blocco automatico {#auto-lock}

QoreX si blocca da solo dopo un po' di inattività. Scegli **1, 5, 15, 30, 60 minuti o 4 ore** in **Blocca automaticamente dopo**; il valore predefinito è **15 minuti**. App: Impostazioni → Sicurezza; trascorso l'intervallo, QoreX chiede di nuovo la biometria prima di mostrare qualsiasi cosa. Estensione e Safari: l'impostazione è nella schermata iniziale del popup, accanto al pulsante **Blocca**; trascorso l'intervallo inserisci di nuovo la password.

## La tua frase di recupero e gli strumenti di accessibilità {#phrase-privacy}

La schermata della frase di recupero richiede ogni volta una nuova biometria o un nuovo PIN del dispositivo, mostra le parole come una griglia numerata di sola lettura **senza pulsante di copia**, è bloccata per gli screenshot su Android ed è nascosta nel selettore di app. Su **Android 14 e successivi** le parole sono inoltre sottratte ai servizi di accessibilità che non sono veri strumenti di accessibilità (TalkBack e gli altri veri screen reader possono comunque leggerle). Su Android più vecchio e su iOS le parole sono nascoste per impostazione predefinita agli screen reader; se ti affidi a uno screen reader, tocca l'avviso su quella schermata per permettergli di leggerle. Mostra la frase solo quando nessuno può vedere il tuo schermo.

## dApp collegate {#connected-dapps}

Le connessioni alle dApp sono **per-origin** e durano finché non le rimuovi. Nell'app sono salvate **su questo dispositivo, per wallet** (solo l'indirizzo del sito); vedile e revocale in [La protezione del mio denaro](#protection). Nell'estensione per browser e in Safari, apri **Siti collegati** nel popup per vedere ogni sito approvato da questo wallet e usa **Revoca** per revocarne uno qualsiasi.

## Firmatari collegati e limiti di spesa {#linked-signers}

Collegare una chiave esterna (Phantom o MetaMask) come **firmatario collegato** con propri limiti di spesa **non è ancora disponibile all'interno di QoreX** - Impostazioni → Sicurezza mostra la card, con l'azione contrassegnata *coming*. Nulla è collegato al tuo wallet a meno che tu non l'abbia fatto da solo al di fuori di QoreX. La gestione delle chiavi non può mai essere delegata a una chiave collegata. Per il modello on-chain, vedi [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

Il **Q-Day Scanner** ti permette di inserire qualsiasi indirizzo - il tuo o quello di chiunque altro - e ottenere un report di esposizione per qualsiasi indirizzo Bitcoin o Ethereum. Lo raggiungi dai pulsanti rapidi della scheda Home. Per controllare un indirizzo **Bitcoin**, QoreX deve interrogare blockstream.info, un servizio gestito da terzi, che vede l'indirizzo e il tuo indirizzo IP. Lo scanner ne indica il nome ed esegue la scansione solo dopo che hai accettato.

## Aiuto e assistenza {#support}

App: **Impostazioni → Assistenza**. Estensione e Safari: **Assistenza** nella schermata iniziale del popup. La schermata elenca gli **unici canali ufficiali**, con ogni indirizzo completo mostrato perché tu possa confrontarlo:

- Community Telegram: [https://t.me/QorechainCommunity](https://t.me/QorechainCommunity)
- Discord: [https://discord.gg/qorechain](https://discord.gg/qorechain)
- Pagina di aiuto: [https://qorechain.io/help/qorex](https://qorechain.io/help/qorex)
- E-mail: team@qorechain.io
- Segnala una vulnerabilità: [https://qorechain.io/security](https://qorechain.io/security)

:::danger Lo staff di QoreX non chiede mai la tua frase di recupero
*«Il team QoreChain non ti chiederà MAI la frase di recupero, la password o le chiavi. Chi lo fa è un truffatore.»* Vale anche per l'assistenza di QoreX.
:::

La stessa schermata ha un **riepilogo diagnostico** facoltativo da copiare **solo se l'assistenza lo chiede**. Contiene la versione dell'app, la rete e i codici di errore: nessuna frase, nessuna chiave, nessun indirizzo, nessun saldo.

## Il modello di sicurezza, in breve

1. **Non-custodial** - le chiavi vengono generate sul dispositivo, risiedono in vault supportati dall'hardware (mobile) o in un vault cifrato (estensione), e non lo lasciano mai.
2. **Niente senza consenso** - ogni connessione è per-origin, ogni firma è approvata individualmente (biometrica su mobile) e i payload vengono decodificati prima della firma. Ciò che QoreX non sa leggere viene rifiutato, oppure chiaramente contrassegnato e trattenuto dietro un secondo tocco.
3. **Lane Native con firma ibrida.** Ogni trasferimento QOR nativo è firmato due volte: con una chiave classica e con ML-DSA-87 (FIPS 204). Qualsiasi elemento classico (reti esterne, EVM) è etichettato, mai silenzioso.
4. **Nessun analytics, nessun crash reporting, nessun SDK di tracciamento.** Chiavi, frase di recupero, vault e approvazioni non lasciano mai il dispositivo. L'accesso opzionale, le notifiche push e il recupero sociale usano un server solo quando li attivi; l'elenco completo di ciò che QoreX invia è in [Cosa invia QoreX in rete](/qorex/overview#data-and-privacy), ed è coperto dalla [QoreChain privacy policy](https://qorechain.io/privacy).
5. **Percorsi di recupero** - frase di 24 parole (sempre), recupero sociale con guardian + timelock di 48h (opzionale), eredità Legacy (opzionale), collegamento del dispositivo (comodità).

## Limiti e problemi noti {#limits}

- Il recupero sociale, Legacy, il collegamento dei dispositivi e il Q-Day Scanner sono solo su mobile.
- La rotazione della chiave post-quantistica protegge da una chiave post-quantistica trapelata, non da una frase di recupero trapelata. Gli altri wallet con la stessa frase non possono firmare per un account ruotato finché non supportano le chiavi ruotate.
- I firmatari collegati con limiti di spesa non sono ancora disponibili all'interno di QoreX.
- La schermata manuale della finestra EVM offre solo "Solo trasferimenti di QOR" o "Qualsiasi contratto". Il tetto in QOR di una finestra non limita mai i token.
- Le approvazioni dei token vengono controllate solo sull'EVM di QoreChain, e per revocarle serve un account coin-60.
- Il collegamento del dispositivo è una comodità, non un metodo di recupero. Un wallet perso, senza frase annotata e senza recupero sociale, non può essere recuperato da nessuno.
- La finestra di approvazione mostra alcuni nomi di campo in inglese in alcune build.
