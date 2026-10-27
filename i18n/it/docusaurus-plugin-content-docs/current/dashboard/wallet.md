---
slug: /dashboard/wallet
title: Portafoglio
sidebar_label: Portafoglio
sidebar_position: 3
---

# Wallet

La pagina **Wallet** è il luogo in cui visualizzi il tuo saldo e la cronologia delle transazioni, ricevi QOR e (su mainnet) componi invii e azioni di staking. È pensata per chiunque detenga QOR e voglia un unico posto dove vedere un account su tutti e tre i rail. Il funzionamento dipende dalla rete:

- **La mainnet è non custodiale.** Il Dashboard non conserva le chiavi della mainnet. Colleghi il tuo wallet (**QoreX**, **Keplr** o **MetaMask**) e la pagina legge dalla chain il tuo saldo e la tua cronologia reali. Gli invii e lo staking sul rail Native vengono composti nella pagina e firmati in **QoreX**, perché gli account QoreChain firmano con una firma ibrida post-quantistica che QoreX produce. Keplr si collega per visualizzare e ricevere. MetaMask si collega sul rail EVM; inviare da lì richiede una chiave post-quantistica registrata e una finestra di autorizzazione EVM aperta, aperta da QoreX (vedi [Inviare con MetaMask](#send-metamask)).
- **La testnet è custodiale.** Il Dashboard crea e conserva wallet di test per il tuo account, così puoi inviare e ricevere QOR di test senza installare nulla. Per i wallet della testnet non c'è nessuna schermata di staking.

## Innovazioni {#innovations}

- **Un account, tre codifiche.** La pagina ricava le forme `qor1...`, `0x...` e SVM base58 dello stesso account e legge saldo e cronologia una sola volta, tramite `qor1...`. Le righe della cronologia riportano un badge Native, EVM o SVM.
- **Il Dashboard non firma mai su mainnet.** Per un invio, una delega, una revoca di delega o un claim passa a QoreX solo i parametri e la rete, mai una transazione già preparata. QoreX ricostruisce la transazione, la mostra per intero, la firma con la firma ibrida ML-DSA-87 e la trasmette. Il Dashboard apprende soltanto l'hash della transazione.
- **Pinning dell'@handle.** L'indirizzo di un handle risolto viene ricordato solo in questo browser e solo dopo che lo hai confermato. Se in seguito l'handle si risolve in un indirizzo diverso, il flusso si ferma e mostra entrambi gli indirizzi per intero.
- **Verifica della commissione prima dello staking.** La pagina legge dalla chain i QOR spendibili (esclusi quelli in vesting) e lo stato della chiave ML-DSA-87 dell'account, e mantiene Submit disattivato se la commissione non può essere pagata.
- **L'avviso sull'indirizzo di test si trova dove copi.** "Test address, never send real QOR here." compare accanto all'indirizzo, in My Wallets e in Receive, perché gli indirizzi testnet e mainnet sono identici nell'aspetto.
- **Esportazione della frase di recupero con verifica.** Su testnet, rivelare una frase richiede un nuovo accesso, le 24 parole restano visibili per 60 secondi e il backup viene considerato confermato solo dopo che digiti le parole 3, 5 e 9.

## Come si usa {#how-to-use}

### Un account, tre codifiche {#one-account-three-encodings}

Un account QoreChain è un'unica identità scritta in tre modi, uno per ogni rail di esecuzione:

| Rail | Codifica | Aspetto |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | ad es. `5Gv7...` |

Tutte e tre le codifiche puntano allo **stesso account e allo stesso saldo**. I fondi ricevuti su qualsiasi rail confluiscono in un unico saldo, e il Dashboard indicizza saldo e cronologia tramite la codifica `qor1`, quindi l'attività di ogni rail appare insieme.

### Usare il Wallet su mainnet {#mainnet}

Prerequisiti: aver effettuato l'accesso, intestazione su **Mainnet**, [dichiarazione una tantum](/dashboard/overview#risk-acknowledgement) accettata e, per inviare o fare staking, l'app o l'estensione QoreX.

1. Apri **Wallet**. Se non è ancora collegato nessun wallet, una scheda "Connect your wallet" mostra la scheda **QoreX wallet** con **Connect with QoreX** e, sotto di essa, alla voce "or connect another wallet", **Connect Keplr** e **Connect MetaMask**.
2. Collega un wallet (passaggi sotto). Phantom non può essere collegato qui; vedi [Firmatari collegati](#linked-signers).
3. La pagina carica dalla chain il tuo saldo e la cronologia reali.

Una volta collegato, la pagina ha sei schede: **Wallet**, **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** e **Connect Wallets**.

- **Wallet:** una riga **Viewing** di chip dei wallet (solo quando è collegato più di un wallet), **Total Balance**, **Receive** e **Assets & Activity** con le ultime 10 transazioni.
- **Send from QoreX, Stake / Delegate, Rewards:** funzionano tramite QoreX anche se sono collegati anche Keplr o MetaMask. I passaggi dello staking sono in [Staking e validatori](/dashboard/staking-and-validators).
- **Details:** i tuoi indirizzi Native, EVM e SVM, e **Linked addresses** (rinomina, imposta come predefinito, controllabile in QoreX o in sola osservazione).
- **Connect Wallets:** i wallet collegati (fai clic su uno per visualizzarlo, X per scollegarlo), gli account QoreX non collegati con **Link this account**, **+ QoreX**, **+ Keplr**, **+ MetaMask** e il pannello [Aggiungere QoreChain al tuo wallet](#add-network).

Se il tuo wallet non ha ancora QoreChain configurata, aggiungila prima, vedi [Aggiungere QoreChain al tuo wallet](#add-network).

#### Collegati con QoreX, estensione browser {#connect-qorex-extension}

1. Nella pagina Wallet, trova la scheda **QoreX wallet** e seleziona **Connect with QoreX**.
2. Poiché l'estensione QoreX viene rilevata, il Dashboard chiede come vuoi collegarti. Seleziona **Browser extension**.
3. L'estensione apre un popup di approvazione che mostra `dashboard.qorechain.io` come sito richiedente.
4. Approva. Questo firma una prova una tantum che possiedi il tuo indirizzo `qor1...`; nessun fondo si muove e non viene concesso nessun altro permesso.
5. Il popup si chiude e il Dashboard mostra **Connected: qor1...**. La scelta viene salvata, quindi il prossimo collegamento su questo browser la riutilizza senza chiedere. Un link **Use a different method** compare solo mentre un pairing è in sospeso.

Puoi collegare più di un indirizzo QoreX allo stesso account Dashboard (ad esempio uno da un'estensione Firefox e uno da Chrome, oppure un telefono e un laptop). Seleziona **Add another wallet** per ripetere il flusso; a ogni indirizzo collegato può essere assegnata un'etichetta e uno viene contrassegnato come predefinito per l'invio, entrambi dalla scheda **Connect Wallets**.

**Passare da un wallet all'altro nella scheda Wallet.** Con più di un wallet collegato, la riga di chip **Viewing** ti permette di cambiare di chi vedi saldo e cronologia senza lasciare la scheda. La riga è nascosta quando è collegato un solo wallet.

**Account nella tua estensione QoreX non ancora collegati.** Una stessa frase di recupero può derivare più account, e crearne uno in QoreX non lo comunica al Dashboard. Quando l'estensione può elencare i propri account, le schede **Wallet**, **Details** e **Connect Wallets** mostrano una scheda del tipo "2 accounts in your QoreX extension are not linked here", con il saldo di ciascun account (e quanta parte è in staking e non può essere inviata). Seleziona **Link this account** per abbinarlo; il collegamento non concede alcun controllo sulle tue chiavi. Se la tua versione di QoreX non può scegliere quale account dimostrare, da qui può essere collegato solo l'account attivo.

#### Collegati con QoreX, app mobile {#connect-qorex-app}

1. Nella pagina Wallet, seleziona **Connect with QoreX** sulla scheda **QoreX wallet**.
2. Se appare il selettore, seleziona **QoreX app** (se non viene rilevata nessuna estensione, il Dashboard passa direttamente a questo flusso).
3. Il Dashboard mostra un codice QR e **Open QoreX**, ed esegue il polling ("Waiting for approval in QoreX...").
4. Sul tuo telefono, scansiona il codice QR in QoreX, oppure tocca **Open QoreX** se stai navigando dallo stesso telefono (apre l'app tramite il suo link `qorex://connect`).
5. QoreX mostra la richiesta di pairing con l'origine del Dashboard. Approva con Face ID, Touch ID o PIN.
6. Entro un paio di secondi il Dashboard mostra **Connected: qor1...**.

#### Collegati con Keplr {#connect-keplr}

Keplr si collega per visualizzare il tuo saldo e la cronologia sul rail Native e per ricevere. L'invio e lo staking usano QoreX.

1. Nella pagina Wallet, seleziona **Connect Keplr**.
2. Se QoreChain non è configurata in Keplr, il Dashboard attiva il prompt `suggestChain` di Keplr. Rivedi il chain ID e gli endpoint e seleziona **Approve**.
3. Scegli l'account e approva la connessione.
4. Il Dashboard legge il tuo indirizzo `qor1...` e carica il tuo saldo e la cronologia.

Phantom non può essere collegato come wallet nella pagina Wallet della mainnet. Gli indirizzi Phantom collegati in precedenza compaiono ancora in **Connected wallets**; per collegare una chiave Phantom come firmatario, vedi [Firmatari collegati (Phantom)](#linked-signers).

#### Collegati con MetaMask {#connect-metamask}

1. Nella pagina Wallet, seleziona **Connect MetaMask**.
2. Se la rete EVM di QoreChain non è ancora stata aggiunta, MetaMask mostra il proprio prompt **Add network** (EIP-3085) con chain ID, URL RPC e simbolo precompilati. Seleziona **Approve**, poi **Switch network**.
3. Seleziona l'account e **Connect**.
4. Il Dashboard legge il tuo indirizzo `0x...` e carica il tuo saldo e la cronologia.

### Inviare su mainnet {#send-mainnet}

Ogni invio viene composto sul Dashboard ma finalizzato nel tuo wallet. Sul **rail Native** quel wallet è sempre **QoreX**. Sul **rail EVM**, MetaMask firma, a condizione che l'account abbia già una chiave post-quantistica e una finestra EVM aperta (vedi [Inviare con MetaMask](#send-metamask)).

:::caution Fondi reali, trasferimenti irreversibili
Le transazioni sulla mainnet sono irreversibili. Verifica sempre due volte il destinatario prima di approvare.
:::

:::note Saldi in vesting
Se parte del tuo saldo è ancora in vesting, conta ai fini di quanto puoi delegare, ma non può pagare una commissione di transazione. Per questo ti serve QOR spendibile a parte, anche per registrare una chiave post-quantistica. Un wallet finanziato solo con il proprio importo in vesting può delegare ma non può inviare.
:::

#### Invia con QoreX, passo per passo

1. Nella scheda **Send from QoreX**, scegli facoltativamente **Send from** (quando hai collegato più di un wallet QoreX), poi inserisci il destinatario (un indirizzo `qor1...` o un `@handle`), l'**Amount (QOR)** e un **Memo** facoltativo.
2. Seleziona **Continue in QoreX**.
3. Approva, in uno di questi modi:
   - **Estensione browser:** seleziona **Approve in browser extension**. Il popup dell'estensione mostra il trasferimento decodificato per intero (destinatario e importo). Approva con lo sblocco proprio della tua estensione. L'estensione firma con la firma ibrida post-quantistica e trasmette direttamente alla chain.
   - **App mobile:** scansiona il codice QR con QoreX, oppure seleziona **Open in QoreX** (una richiesta `qorex://tx`) sullo stesso telefono. QoreX decodifica la richiesta, mostra destinatario e importo, e approvi con la tua conferma biometrica. QoreX firma e trasmette.
4. La pagina mostra "Transfer confirmed" con l'hash della transazione (aprilo nell'[Explorer](/dashboard/explorer)), poi **New transfer**. Nel percorso dell'app il Dashboard esegue il polling del risultato.

**Esempio minimo:** Connect with QoreX (app, scansiona il codice QR), poi Send from QoreX con un destinatario `qor1...` e importo 1, seleziona **Continue in QoreX** e approva in QoreX.

#### Inviare a un @handle

Il campo destinatario accetta anche un `@handle`. Ciò che accade dopo dipende dal fatto che tu abbia già pagato quell'handle da questo browser in precedenza:

- **Prima volta:** l'indirizzo risolto viene mostrato per intero con "First time sending to @handle from this browser. Check the address before you continue:", e devi confermarlo prima che venga usato. L'indirizzo viene memorizzato (pinnato) solo dopo la conferma.
- **Stesso indirizzo di prima:** passa con una conferma leggera.
- **Un indirizzo diverso da prima:** il flusso si ferma. Sia l'indirizzo precedente sia quello nuovo vengono mostrati per intero, con un avviso esplicito che l'indirizzo è cambiato, e un pulsante in stile secondario per procedere comunque.

Il pin vive solo nel tuo browser, quindi un computer diverso o un browser ripulito mostra di nuovo "prima volta". Gli handle sono lunghi da 3 a 20 caratteri (`a-z`, `0-9`, `_`) e appartengono a un solo indirizzo. Se la ricerca degli handle è temporaneamente non disponibile, il campo lo segnala e puoi comunque inviare a un indirizzo `qor1...`.

#### Invia con MetaMask {#send-metamask}

:::caution Dalla chain v3.2.0, MetaMask da solo non può inviare su mainnet
Il percorso EVM ammette una transazione solo da un account che detiene una chiave post-quantistica registrata e ha una **finestra di autorizzazione EVM aperta**: un permesso limitato nel tempo, nel numero e nel valore, aperto con un messaggio che porta una firma ibrida ML-DSA-87 (FIPS 204). MetaMask non può produrre quel messaggio. Senza una finestra la chain rifiuta la transazione (errori tipici: nessuna finestra, finestra esaurita, nessuna chiave post-quantistica).
:::

1. In **QoreX**, registra la chiave post-quantistica dell'account se non ne ha una (il tuo primo trasferimento QoreX da quell'account lo fa), poi apri una finestra di autorizzazione EVM, vedi [Finestra di accesso EVM](/qorex/security-and-recovery#evm-window). Questo vale per l'**account in stile Ethereum (coin 60)** che condivide la chiave di MetaMask: aggiungilo in QoreX con **Add an Ethereum account (coin 60)** usando la stessa frase di recupero ([come](/qorex/getting-started#restore-dashboard)). Nessuna chiave di MetaMask può inviare da un normale account coin-118 `qor1...`.
2. Una finestra è limitata in blocchi (al massimo 17.280, circa 15 ore su mainnet), nel numero di transazioni (al massimo 1.000) e da un tetto di spesa in QOR che conta ogni importo **più** la sua commissione massima. Mantieni i limiti contenuti: mentre una finestra è aperta, le transazioni di MetaMask muovono QOR senza una firma post-quantistica. Aprire una nuova finestra sostituisce la precedente e fa avanzare il nonce dell'account, quindi aprila **prima** di inviare da MetaMask (una transazione preparata in precedenza fallisce con "nonce too low"). Dalla v3.2.3 la chain supporta anche finestre più ristrette e con ambito definito; QoreX non offre ancora una schermata per esse.
3. Apri MetaMask e verifica che sia impostato sulla rete EVM di QoreChain.
4. Seleziona **Send** all'interno di MetaMask, inserisci l'indirizzo `0x...` del destinatario e l'importo, rivedi il gas e conferma.
5. Tornato sul Dashboard, la transazione appare nella tua cronologia una volta che è sulla chain (aggiorna se serve).

Ogni transazione consuma una parte della finestra; quando viene raggiunto il limite di tempo, di numero di transazioni o di valore, apri una nuova finestra in QoreX, e chiudi la finestra quando hai finito.

### Ricevere {#receive-mainnet}

1. Seleziona **Receive**.
2. Scegli un rail con il selettore: **Native QOR**, **EVM** o **SVM**.
3. La finestra modale mostra il tuo indirizzo in quella codifica con un codice QR e un pulsante di copia.
4. Solo sul rail Native, **Payment Request Options** (importo, memo) costruiscono un link `qorechain:` che puoi copiare.

Qualunque rail usi il mittente, i fondi arrivano sullo stesso account.

### Leggere la cronologia delle transazioni {#history}

Su mainnet l'elenco **Assets & Activity** mostra le **ultime 10** transazioni. Ogni riga ha:

- un **badge del rail** (Native, EVM o SVM);
- **Sent** o **Received** per i normali trasferimenti, e un'etichetta descrittiva per le altre attività (ad esempio *PQC key registration* o un'azione su contratto);
- l'importo, l'ora, uno stato **Confirmed** o **Failed** e un hash che puoi aprire nell'[Explorer](/dashboard/explorer). Per l'attività più vecchia, apri il tuo indirizzo nell'Explorer.

### Usare il Wallet su testnet {#testnet}

Su testnet (`qorechain-diana`) il Dashboard gestisce i wallet di test per te. La testnet non ha né il collegamento QoreX né una schermata di staking.

**Prima visita:** crea un wallet, oppure importa una frase di 24 parole.

**Scheda principale:** l'etichetta del wallet, l'indirizzo con un pulsante di copia, **Total Balance**, **Send**, **Receive** e **My Wallets**, un indicatore dell'ultimo aggiornamento con refresh, e **Assets & Activity** con una scheda **Transaction history** e una scheda **Tokens**.

La scheda **Tokens** elenca solo i token emessi tramite i deployment del Dashboard. I token di test del fest provenienti dal [Faucet](/dashboard/faucet#fest-tokens) non compaiono mai lì; verificali con una query del saldo bank o con l'[Explorer](/dashboard/explorer).

:::caution Gli indirizzi testnet sono identici a quelli mainnet
Testnet e mainnet usano lo stesso formato `qor1...`, quindi un indirizzo testnet può essere incollato in un modulo di prelievo o in un altro wallet senza alcun avviso, e i QOR reali inviati a esso arrivano sulla **mainnet**, a quell'indirizzo, dove questa pagina testnet non può mostrarli. Non inviare mai QOR reali a un indirizzo testnet. Il Dashboard ripete l'avviso accanto all'indirizzo nella pagina Wallet, in **My Wallets** e in **Receive**. Se hai già inviato QOR reali a un indirizzo testnet, contatta il supporto e non cercare di spostarli da solo.
:::

#### Invia QOR (testnet)

1. Seleziona **Send**.
2. Scegli un **Asset** (QOR, oppure un token emesso tramite il Dashboard).
3. Inserisci il **Recipient Address** (mentre digiti vengono suggeriti contatti salvati e indirizzi recenti) e l'**Amount** (oppure **MAX**), più un **Memo** facoltativo.
4. Seleziona **Review Transaction**, controlla i dettagli e la commissione stimata, poi **Confirm & Send**.
5. Ricevi una conferma con l'hash, e ti viene proposto "Save this address?" così il destinatario viene conservato come contatto.

**Esempio minimo:** passa a Testnet, crea un wallet, fai il claim dal [Faucet](/dashboard/faucet), poi invia 1 QOR a un altro indirizzo.

#### Ricevi QOR (testnet)

1. Seleziona **Receive**.
2. Condividi l'indirizzo o il codice QR, oppure copia l'indirizzo.
3. Facoltativamente compila **Payment Request Options** (importo, memo) per generare un link di pagamento; usa **Copy Link** o **Save Image**.

#### Gestire i tuoi wallet di test

**My Wallets** apre il tuo elenco di indirizzi: passa da un wallet all'altro, creane, importane o rimuovine uno. Il wallet attivo è quello usato per le azioni firmate su testnet in tutto il Dashboard.

#### Eseguire il backup o esportare la frase di recupero di un wallet di test {#reveal-recovery-phrase}

Su testnet il Dashboard gestisce i tuoi wallet, ma puoi esportare la frase di recupero di 24 parole di un wallet per importarla in un wallet self-custody come QoreX.

1. Nella pagina **Wallet** della testnet, trova la scheda **Recovery phrase**. Elenca i tuoi wallet gestiti dal Dashboard con il loro saldo **mainnet** (prima i wallet con fondi), così puoi scegliere quello che detiene i tuoi token.
2. Seleziona **Reveal**, leggi l'avviso ("Reveal the phrase for ...?") e seleziona **Continue**.
3. Accedi di nuovo quando richiesto (è richiesto un nuovo controllo della password; il Dashboard non vede mai la tua password). Torni automaticamente al wallet.
4. Le 24 parole vengono mostrate per 60 secondi, con un pulsante **Copy phrase**. Scrivile e conservale offline. Il conto alla rovescia si ferma mentre spunti la casella di conferma o scrivi nei campi di verifica.
5. Spunta **I have written down my recovery phrase and stored it somewhere safe**, digita le parole **3**, **5** e **9** (contrassegnate *Required*) e seleziona **Confirm backup**. Vedi "Recovery phrase saved".
6. Se esci con **Hide without confirming** (o il timer scade), la scheda mostra "Backup not confirmed" e offre **Reveal again and confirm**.

Chiunque abbia queste 24 parole controlla il wallet. QoreChain non può mai recuperarle né reimpostarle per te, e il supporto non te le chiederà mai.

### Aggiungere QoreChain al tuo wallet {#add-network}

Il pannello **Add QoreChain to your wallet** (su mainnet si trova nella scheda **Connect Wallets** e sotto i pulsanti di connessione finché non è collegato un wallet; su testnet in fondo alla pagina) ha quattro schede:

| Scheda | Cosa ottieni | Pulsanti |
| --- | --- | --- |
| **Native (Cosmos) wallets** | Endpoint RPC e REST e il chain ID, ciascuno con un pulsante di copia. | **Add to Keplr**, **Add to Cosmostation** (l'etichetta segue il wallet rilevato) |
| **EVM wallets** | Parametri di rete EIP-3085. | **Add to EVM wallet** (oppure **Add to MetaMask / Rabby**, in base ai wallet rilevati) |
| **SVM wallets** | L'URL RPC SVM per le impostazioni RPC personalizzate. | **Copy SVM RPC URL** |
| **Mobile wallets (WalletConnect)** | Un pairing WalletConnect v2. | **Create pairing QR** |

1. Trova il pannello e scegli la scheda che corrisponde al rail del tuo wallet.
2. Seleziona il pulsante di aggiunta, oppure copia gli endpoint e il chain ID nel modulo di aggiunta rete del tuo wallet.
3. Approva la nuova rete nel tuo wallet.

Gli endpoint pubblici sono `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) e `svm.qore.host` (RPC SVM), con varianti `*-testnet` (ad esempio `rpc-testnet.qore.host`). Chain ID: mainnet `qorechain-vladi` (EVM chain ID `9801`), testnet `qorechain-diana` (EVM chain ID `9800`).

### Firmatari collegati (Phantom) {#linked-signers}

La scheda **SVM wallets** ti permette anche di collegare una chiave Phantom al tuo account come **firmatario collegato**: un autenticatore revocabile e limitato nel tempo (30 giorni), non un wallet primario separato. Seleziona **Connect Phantom**, poi **Register authenticator**. La registrazione deve essere firmata da **Keplr** (per questo il Dashboard ha bisogno di Keplr collegato), e Phantom non diventa mai una propria identità.

:::caution La disponibilità della registrazione differisce a seconda della rete
Le funzionalità di smart account e di wallet collegati della chain sono attivate sulla testnet e disattivate sulla mainnet (`GET /qorechain/abstractaccount/v1/config` restituisce `enabled: true` sulla testnet e `enabled: false` sulla mainnet, verificato il 27 ottobre 2026). Sulla mainnet la chain rifiuta le nuove registrazioni di firmatari collegati; considera lì la scheda un'anteprima.
:::

:::caution Un firmatario collegato è un'autorità reale sull'account
Il permesso che concedi decide su quale percorso la chiave può agire, non quanto può muovere, e una registrazione resta valida per 30 giorni. Collega solo una chiave di cui ti fidi quanto dell'account stesso, e revocala quando non ti serve più.
:::

Per il modello di permessi e limiti di spesa, vedi [Firmatari collegati e limiti di spesa](/qorex/security-and-recovery#linked-signers) nella documentazione di QoreX.

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet). È richiesto l'accesso: se non hai effettuato l'accesso, la pagina reindirizza alla schermata di accesso.
- **Rete:** l'interruttore nell'intestazione decide quale vista ottieni (mainnet non custodiale, testnet custodiale). Su mainnet accetta prima la dichiarazione una tantum.
- **Wallet:** nessuno necessario su testnet. Su mainnet usa QoreX (app o estensione) per inviare e fare staking; Keplr o MetaMask per visualizzare e ricevere.
- **Costi:** nessuno dal Dashboard. Le transazioni on-chain pagano la commissione di rete (minimo 0.1 uqor per gas).
- **Fondi:** QOR di testnet dal [Faucet](/dashboard/faucet). I QOR di mainnet devono già trovarsi nel tuo account.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Reti | Note |
| --- | --- | --- | --- |
| Pagina Wallet | `dashboard.qorechain.io/wallet` | Mainnet (non custodiale) e testnet (custodiale) | Accesso richiesto |
| Collegamento e invio QoreX | App ed estensione QoreX (vedi [QoreX](/qorex/overview)) | Solo mainnet | I flussi QoreX del Dashboard sono fissati sulla mainnet |
| Pannello di aggiunta rete | Nella pagina Wallet | Entrambe | Anche nella panoramica dell'[Explorer](/dashboard/explorer) |

## Limiti e problemi noti {#limits}

- **La testnet non ha né interfaccia di staking né collegamento QoreX.** Lo staking e la scheda Rewards sono solo per la mainnet.
- **La cronologia della mainnet è costituita dalle ultime 10 transazioni.** Apri l'indirizzo nell'Explorer per vederne di più.
- **Keplr e MetaMask:** Keplr può visualizzare e ricevere; MetaMask può visualizzare e ricevere, e invia dall'interno di MetaMask una volta aperta una finestra EVM. Nessuno dei due invia o fa staking sul rail Native dal Dashboard.
- **Phantom** non può essere collegato; gli indirizzi Phantom collegati in precedenza sono ancora elencati.
- **La registrazione dei firmatari collegati** funziona su testnet ed è disattivata su mainnet; richiede la firma di Keplr.
- **Non presenti nel Dashboard:** la redelegazione (eseguila in QoreX), una schermata di staking con blocco temporale e un elenco di token su mainnet.
- **La scheda Tokens su testnet** mostra solo i token emessi dal Dashboard, non i token del fest.

## Correlati

- [Operazioni sui token](/user-guide/token-operations) - i concetti dietro i trasferimenti e le denominazioni di QOR.
- [Staking e validatori](/dashboard/staking-and-validators) - delega, revoca la delega e fai il claim dalla pagina Wallet.
- [Trade](/dashboard/trade) - la schermata di swap dei token di test.
