---
slug: /qorex/security-and-recovery
title: Sicurezza e recupero
sidebar_label: Sicurezza e recupero
sidebar_position: 5
---

# Sicurezza e recupero

Tutto ciò che riguarda la protezione e il recupero del tuo wallet si trova in **Settings → Security dashboard**. Anche la scheda Home mostra una card **Backup health** che continua ad avvisarti finché il recupero sociale non è configurato.

## Esegui subito il backup — nessuno può recuperare un wallet perso al posto tuo {#back-up-now}

:::danger Leggi questo prima di finanziare il tuo wallet
QoreX è **non-custodial**: le tue chiavi esistono solo sul tuo dispositivo, e QoreChain Association non ne possiede una copia, non ha una chiave master e non ha alcun modo di reimpostare o ripristinare il tuo wallet. **Non esiste una procedura di "password dimenticata", nessun ticket di assistenza e nessuna possibilità di intervento da parte del servizio clienti** — se perdi l'accesso alle tue chiavi senza avere un backup, i fondi sono persi, in modo permanente e irreversibile. Questo vale per ogni wallet non-custodial, non è una limitazione di QoreX, ma vale la pena dirlo chiaramente.

**Fai almeno una di queste cose — subito dopo aver creato il tuo wallet, non più tardi:**

1. **Scrivi la tua frase di recupero di 24 parole** e conservala offline e in un luogo durevole (non uno screenshot, non una nota sincronizzata sul cloud, non un messaggio a te stesso). È l'unica cosa in grado di ripristinare il tuo wallet su qualsiasi dispositivo, in qualsiasi momento.
2. **Configura il [recupero sociale](#social-recovery)** con guardian di cui ti fidi. Questo ti permette di recuperare il tuo wallet anche se perdi la frase, senza che un singolo guardian possa mai accedere da solo ai tuoi fondi.

Fare entrambe le cose è l'opzione più sicura — la frase ti protegge se cambi dispositivo o l'app non è disponibile; i guardian ti proteggono se perdi la frase stessa.

**Disinstallare l'app elimina le tue chiavi da quel dispositivo.** Il vault dell'app mobile e il vault dell'estensione del browser vivono ciascuno solo sul dispositivo che li ha creati. Disinstallare l'app, ripristinare il telefono o rimuovere/cancellare l'estensione elimina quella copia — senza backup e senza un dispositivo collegato, il tuo wallet non può essere recuperato da nessuno, QoreChain inclusa.
:::

## Chiave post-quantistica {#pqc-key}

La Security dashboard mostra lo stato on-chain in tempo reale della tua chiave post-quantistica: **"Registers with your first transfer"** → **"Registered on-chain ✓"**. L'algoritmo è **ML-DSA-87** (deterministico, ibrido con secp256k1).

**Rotazione della chiave** — la rotazione della tua chiave post-quantistica (un'operazione on-chain `MsgRotatePQCKey`) richiede una nuova cerimonia biometrica e **non è mai automatizzata**. Vedi [Key rotation](/developer-guide/post-quantum-signing#key-rotation) per il meccanismo sottostante.

## Recupero sociale {#social-recovery}

Il recupero sociale permette a **guardian** fidati di aiutarti a ripristinare il tuo wallet senza mai vedere la tua frase di recupero.

- Il tuo seed viene suddiviso in **share sigillate con ML-KEM** distribuite ai guardian secondo uno schema a **soglia** (t-of-n): un numero qualsiasi di *t* dei tuoi *n* guardian può aiutarti a recuperare, ma un numero inferiore no.
- Ogni guardian riceve una credenziale. La configurazione non scrive nulla di leggibile sul relay — solo buste opache e sigillate.
- Un recupero richiede l'approvazione della soglia di guardian, poi esegue un **timelock di 48 ore** e ti invia un **avviso di annullamento**, così che un tentativo malevolo possa essere fermato.

**Configuralo:** Security dashboard → Social recovery → scegli i tuoi guardian e la soglia. L'avviso Backup health scompare una volta completata questa operazione.

**Approva il recupero di qualcun altro:** se sei un guardian per qualcuno, usa **Help recover** nella scheda Home per approvare la sua richiesta.

## Legacy Protocol {#legacy}

**Legacy Protocol** è l'eredità quantum-safe: un dead-man's switch sovrapposto ai tuoi guardian, così che i tuoi asset possano passare ai beneficiari da te scelti se diventi irraggiungibile. È opzionale e si configura dalla Security dashboard.

## Collegare un nuovo dispositivo {#link-device}

Sposta il tuo wallet su un secondo telefono o tablet **senza server e senza digitare** le 24 parole:

1. **Nuovo dispositivo** → onboarding → **Link from another device**. Mostra un **codice di 10 caratteri** usa e getta e apre la fotocamera.
2. **Vecchio dispositivo** → Settings → Security → **Link a new device** → digita quel codice → conferma con la biometria. Appare un **codice QR** (il tuo seed sigillato con una chiave derivata dal codice: scrypt N=2¹⁷ → AES-256-GCM).
3. **Nuovo dispositivo** scansiona il QR → viene decifrato localmente → stesso wallet, stessi indirizzi.

**Perché è sicuro:** il codice e il QR non appaiono mai sulla stessa schermata. Una foto del solo QR è testo cifrato dietro una funzione di derivazione della chiave memory-hard, ed entrambi gli artefatti sono usa e getta e scompaiono con le schermate. Un codice errato dà un errore pulito — basta riprovare.

:::note
Il collegamento del dispositivo è una **comodità**, non un metodo di recupero. La tua frase di 24 parole e il recupero sociale sono le tue vere reti di sicurezza.
:::

## dApp collegate {#connected-dapps}

Le connessioni alle dApp sono **per-origin** e **legate alla sessione**: chiudendo il browser dApp integrato nell'app si revocano tutte le connessioni. Puoi rivedere e disconnettere le connessioni attive nella Security dashboard.

## Firmatari collegati e limiti di spesa {#linked-signers}

Quando colleghi chiavi esterne (Phantom / MetaMask) tramite la [Dashboard](/qorex/account-and-dashboard#dashboard), ognuna riceve **permessi con ambito definito** e una **SpendingRule** che viene applicata **on-chain**, non solo nell'interfaccia. La gestione delle chiavi non può mai essere delegata a una chiave collegata. Vedi [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) per il modello on-chain. La dashboard mostra sempre la verità on-chain corrente.

## Q-Day Scanner {#q-day-scanner}

Il **Q-Day Scanner** ti permette di inserire qualsiasi indirizzo — il tuo o quello di chiunque altro — e ottenere un report di esposizione quantistica: quali fondi risiedono su chiavi solo classiche e quali sono già protetti in modo post-quantistico. Lo raggiungi dai pulsanti rapidi della scheda Home.

## Il modello di sicurezza, in breve

1. **Non-custodial** — le chiavi vengono generate sul dispositivo, risiedono in vault supportati dall'hardware (mobile) o in un vault cifrato (estensione), e non lo lasciano mai.
2. **Niente senza consenso** — ogni connessione è per-origin, ogni firma è approvata individualmente (biometrica su mobile) e i payload vengono sempre decodificati prima della firma.
3. **Quantum-safe per impostazione predefinita** — i trasferimenti QOR sulla Native-lane portano sempre ML-DSA-87 + secp256k1; qualsiasi elemento classico è etichettato, mai silenzioso.
4. **Nessuna raccolta di dati** — nessuna analisi, tracciamento o pubblicità. L'accesso opzionale all'account è coperto dalla [QoreChain privacy policy](https://qorechain.io/privacy).
5. **Percorsi di recupero** — frase di 24 parole (sempre), recupero sociale con guardian + timelock di 48h (opzionale), eredità Legacy (opzionale), collegamento del dispositivo (comodità).
