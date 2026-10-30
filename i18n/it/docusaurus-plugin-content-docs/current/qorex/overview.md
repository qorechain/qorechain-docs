---
slug: /qorex/overview
title: Wallet QoreX
sidebar_label: Panoramica
sidebar_position: 1
---

# Wallet QoreX

**QoreX** è il wallet ufficiale **non-custodial** per **QoreChain** (mainnet `qorechain-vladi`). È pensato per chi vuole detenere, inviare, fare staking e ricevere QOR, pagare le persone tramite @handle, detenere asset su altre reti con la stessa frase di recupero e approvare ciò che i siti web chiedono al proprio wallet di firmare. Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo**. QoreChain Association non ha mai accesso ai tuoi fondi e le app non contengono **alcun analytics, alcun crash reporting e alcun SDK di tracciamento**. Chiavi, frase di recupero, vault e approvazioni non lasciano mai il tuo dispositivo (vedi [Cosa invia QoreX in rete](#data-and-privacy)). Ogni trasferimento nativo di QOR è firmato due volte: con una chiave classica e con ML-DSA-87 (FIPS 204).

QoreX è una famiglia di quattro build che lavorano insieme:

- **App mobile** (Android e iOS): il wallet completo, con recupero, staking, portfolio, un browser dApp integrato e il Q-Day Scanner. Vedi [Per iniziare](/qorex/getting-started) e [Browser dApp](/qorex/dapp-browser).
- **Estensione browser** (Chrome e browser basati su Chromium, Firefox): un wallet desktop a sé stante e il connettore che permette a qualsiasi sito web di rilevare QoreX e trasformare ogni richiesta in un'approvazione esplicita. Vedi [Estensione browser](/qorex/browser-extension).
- **Estensione Safari**: la stessa estensione, inclusa nell'app macOS **QoreX Wallet** sul Mac App Store.
- **Kit per sviluppatori**: sei pacchetti npm pubblici per le app che si integrano con QoreX. Vedi [Per gli sviluppatori](#developers).

:::caution Esegui il backup della tua frase di recupero non appena crei un wallet
QoreX è non-custodial: QoreChain Association non può recuperare un wallet perso, reimpostarlo o ripristinarlo per te. **Disinstallare l'app, reimpostare il telefono o rimuovere l'estensione elimina le tue chiavi da quel dispositivo.** Annota la tua frase di recupero di 24 parole (l'app mobile non la mostra mentre crea il wallet, quindi rivelala da **Impostazioni → Sicurezza → Rivela la frase di recupero**; l'estensione la mostra una sola volta alla creazione) e, se puoi, configura il [recupero sociale](/qorex/security-and-recovery#social-recovery). Vedi [Esegui il backup ora](/qorex/security-and-recovery#back-up-now).
:::

## Innovazioni {#innovations}

- **Lane nativa con firma ibrida.** Ogni trasferimento nativo di QOR è firmato due volte: con una chiave classica secp256k1 e con ML-DSA-87 (FIPS 204). La chain verifica entrambe. Tutto ciò che avviene su una rete esterna è solo classico, e QoreX lo indica come tale prima che tu confermi.
- **Una frase di recupero, una chiave ML-DSA-87, nessun secondo backup.** La chiave ML-DSA-87 è derivata in modo deterministico dalle stesse 24 parole: `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. La derivazione è pubblicata in [QoreSign](/qoresign/overview), quindi qualsiasi wallet compatibile deriva la stessa chiave.
- **Registrata automaticamente, poi verificata.** La chiave ML-DSA-87 viene registrata on-chain con la tua prima transazione (con una prova di possesso dalla chain v3.2.3 in poi). Dopo ogni trasmissione il wallet controlla che la transazione confermata porti il livello ML-DSA-87 e ti avvisa se non lo porta.
- **Approvazioni che rifiutano ciò che non sanno leggere.** Ogni messaggio, la commissione, i limiti di spesa e la scadenza vengono decodificati prima che tu firmi. Una richiesta che QoreX non sa decodificare, o i cui byte possono essere letti in due modi, viene rifiutata.
- **`signAndBroadcast` per le dApp.** Un sito web invia i messaggi; il wallet li mostra decodificati, aggiunge il livello ML-DSA-87 che solo il wallet può creare e trasmette. Una pagina non può produrre quel livello.
- **Finestre di accesso EVM.** Sopra la chain v3.2.0, una transazione EVM è ammessa solo mentre l'account ha una finestra aperta: un `MsgOpenEVMWindow` con firma ibrida, limitato per numero di transazioni, valore e scadenza. QoreX la apre, la mostra e la chiude.
- **Handle con pinning.** Un @handle è legato a un indirizzo `qor1…` da un'attestazione ed25519 del registro più la firma secp256k1 del proprietario stesso. QoreX fissa l'indirizzo che ha risolto per primo e segnala un cambiamento silenzioso.
- **Recupero che non richiede alcuna azienda.** Il recupero sociale divide il seed in share cifrate sigillate con ML-KEM (2 guardian su 3), con un timelock di 48 ore che ti avvisa; Legacy è un dead-man's switch sui tuoi guardian; il collegamento dei dispositivi sposta un wallet con un codice monouso e un QR inutile da solo. Vedi [Sicurezza e recupero](/qorex/security-and-recovery).
- **Ingombro ridotto.** L'estensione chiede al browser un solo permesso API, `storage`, e non include alcun codice di analytics o tracciamento. Le notifiche push comunicano al server solo i tuoi indirizzi pubblici e la notifica dice soltanto "QOR received".

## Come si usa {#how-to-use}

1. Installa QoreX da una scheda ufficiale dello store (vedi [Come accedere](#how-to-access)).
2. Crea un wallet o ripristinane uno: [Per iniziare](/qorex/getting-started) per l'app mobile, [Estensione browser](/qorex/browser-extension#wallet) per l'estensione.
3. Annota le 24 parole, poi invia e ricevi QOR: [Inviare e ricevere](/qorex/send-and-receive).
4. Fai staking: [Portfolio e staking](/qorex/portfolio-and-staking). Configura la tua rete di sicurezza: [Sicurezza e recupero](/qorex/security-and-recovery).
5. Per usare un sito web con QoreX, aprilo nell'estensione (desktop) o nel [Browser dApp](/qorex/dapp-browser) dell'app. Ogni connessione e ogni firma è un'approvazione che dai tu.

## Come accedere {#how-to-access}

- **Reti:** mainnet `qorechain-vladi` (predefinita) e testnet `qorechain-diana`. Su mobile, la testnet si attiva da **Impostazioni → Usa la testnet (sviluppatori)**.
- **Account necessario:** nessuno. L'accesso (email, Apple o Google) è facoltativo ed è necessario solo per rivendicare un @handle, collegarsi alla Dashboard e usare le richieste di pagamento.
- **Prerequisiti:** su mobile, uno sblocco del dispositivo (Face ID o Touch ID su iOS; una biometria di Classe 3 o un PIN di blocco schermo su Android), altrimenti i pulsanti di creazione e importazione restano disattivati. Nell'estensione, una password.
- **Costo:** QoreX è gratuito. Inviare, fare staking e aprire una finestra EVM comportano la normale commissione di rete (il minimo della rete è 0,1 uqor per gas).
- **Installa sempre da una scheda ufficiale:**

| Build | Dove | Minimo |
|---|---|---|
| App iOS | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| App Android | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | un browser Chromium |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## Dove è pubblicato {#where-published}

| Build | Scheda e nome del pacchetto | Versione corrente (27 ott 2026) | Link |
|---|---|---|---|
| App iOS | App Store, **QoreX** (id 6791256626) | 1.1.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| App Android | Google Play, `network.qore.qorex` | 1.1.9 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Estensione Chrome | Chrome Web Store, **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Estensione Firefox | Firefox Add-ons, `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Estensione Safari | Mac App Store, **QoreX Wallet** (id 6794132220) | app 1.7.8, estensione 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Kit per sviluppatori | sei pacchetti npm, vedi [Per gli sviluppatori](#developers) | 0.1.0 | [Integrazioni QoreX](/developer-tools/qorex-integrations) |

La revisione degli store segue una propria tempistica, quindi uno store può servire una build più vecchia di un altro; vedi [Quale versione è live dove](#versions). Il codice sorgente di QoreX non è pubblico.

## Limiti e problemi noti {#limits}

- **Nessuna promessa oltre ciò che è firmato.** La firma ibrida copre le transazioni della lane nativa. Le transazioni EVM portano solo una firma secp256k1 e sono ammesse solo mentre una finestra di accesso EVM è aperta. I trasferimenti SVM e su reti esterne sono solo classici.
- **Il provider EVM dell'estensione risponde solo alle query su account e rete.** Non firma ancora transazioni o messaggi EVM. La firma di messaggi (`signArbitrary`) non è disponibile.
- **Solo mobile:** Portfolio, Q-Day Scanner, recupero sociale, Legacy, richieste di pagamento, accesso e collegamento dei dispositivi.
- **Lo swap non è disponibile.** Resta disattivato finché non esiste liquidità nei pool e non è mostrato su iOS.
- **I signer collegati** (Phantom o MetaMask come chiave collegata con limiti di spesa) non sono ancora disponibili all'interno di QoreX.
- **La rotazione della chiave** per la tua chiave ML-DSA-87 non è ancora disponibile all'interno di QoreX.
- **Se il servizio degli handle non è raggiungibile,** il wallet ripiega sui semplici indirizzi; tutto il resto continua a funzionare.
- Un wallet perso, senza frase annotata e senza recupero sociale, non può essere recuperato da nessuno.

## Disponibilità per piattaforma {#platform-availability}

| Capacità | App mobile (Android e iOS) | Estensione browser |
|---|---|---|
| Creazione / importazione di un wallet | ✅ (l'app non mostra la frase quando crea il wallet - rivelala da Impostazioni → Sicurezza) | ✅ (a sé stante; la frase viene mostrata una sola volta alla creazione) |
| Più wallet, ciascuno con la propria frase di recupero | ✅ (Impostazioni → Wallet) | ✅ (**Wallet**, un'unica password per tutti) |
| Più account da un'unica frase di recupero | ✅ (fino a 20 per wallet) | ✅ |
| Account in stile Ethereum (coin 60), aggiunto a mano | ✅ | ✅ |
| Invio e ricezione di QOR (lane nativa con firma ibrida) | ✅ | ✅ (Invia; Ricevi con QR) |
| Ricezione su qualsiasi rete supportata | ✅ | ✅ |
| Pagamento di un @handle | ✅ | ✅ |
| Rivendicazione di un @handle | ✅ (richiede un account con accesso effettuato) | - (l'estensione ti indirizza all'app) |
| Staking: delega, rimozione delega, spostamento dello stake, riscatto, riscatto e restake | ✅ | ✅ |
| Reti esterne (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + token) | ✅ | ✅ (invio dal popup) |
| Aggiunta di un token tramite contratto (reti EVM) | ✅ | ✅ |
| Finestra di accesso EVM | ✅ | ✅ |
| Lingua dell'interfaccia (10 lingue) | ✅ (segue il telefono) | ✅ (segue il browser) |
| Portfolio, Q-Day Scanner, Recupero sociale, Legacy | ✅ | - |
| Ricerca, tour al primo avvio, widget della schermata Home, notifiche push | ✅ | - |
| Connessioni dApp | ✅ (browser in-app, limitato alla sessione) | ✅ (qualsiasi sito web; **Siti connessi** con Revoca) |
| Swap | Solo Android, disattivato finché non c'è liquidità nei pool (non mostrato su iOS) | - |
| Accesso account e richieste di pagamento | ✅ | - |
| Collegamento multi-dispositivo | ✅ | - |
| Abbinamento dashboard | ✅ | ✅ (connessione + trasferimenti proposti, incl. staking) |

## Per iniziare

- Nuovo su QoreX? Inizia con [Per iniziare](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [Inviare e ricevere](/qorex/send-and-receive) QOR sulla lane nativa con firma ibrida.
- Configura la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione browser](/qorex/browser-extension).

## Download e disponibilità {#availability}

Installa dalle schede ufficiali indicate in [Come accedere](#how-to-access). L'app Android richiede Android 7.0 o successivo, l'app iOS iOS 15.1 o successivo, l'estensione Firefox Firefox 140 o successivo e l'estensione Safari macOS 12 o successivo.

## Quale versione è live dove {#versions}

La revisione degli store segue una propria tempistica, quindi uno store può servire per un po' una build più vecchia di un altro. Questa è la versione corrente **su ciascuno store** al **27 ottobre 2026**:

| Store | Versione corrente | Nota |
|---|---|---|
| Apple App Store (iOS) | 1.1.8 | rilasciata il 21 ottobre |
| Google Play (Android) | 1.1.9 | |
| Chrome Web Store | 0.3.8 | |
| Firefox Add-ons | 0.3.9 | |
| Safari (Mac App Store) | 1.7.8, con l'estensione 0.3.8 | il Mac App Store usa una propria numerazione `1.x` |

Gli store mostrano sempre la loro versione corrente, e uno store che serve ancora una build più vecchia si aggiornerà automaticamente. Le build che uno store non ha ancora rilasciato non sono descritte in questo manuale come disponibili.

Cosa aggiungono le build 1.1.9 / 0.3.9 (oggi Android 1.1.9 e l'estensione Firefox 0.3.9; iOS, Chrome e Safari le includeranno quando i rispettivi store serviranno quelle build):

- **Blocchi di staking.** Blocca una parte del tuo stake per 3, 6 o 12 mesi. Il bonus mostrato è quello che il blocco garantisce oggi, entro il tetto della rete. Lo sblocco anticipato richiede una seconda conferma che indica il costo, e **Unstake** e **Sposta stake** sono limitati alla parte sbloccata. La tabella dei livelli è indicata come "fino a", con la cifra di oggi accanto. Vedi [Portfolio e staking](/qorex/portfolio-and-staking#staking-locks).
- **Memo dei trasferimenti IBC in parole semplici** nelle approvazioni.
- **Staking da account importati da MetaMask (coin 60)** nell'estensione.

Cosa hanno cambiato per te le build 1.1.8 / 0.3.8:

- **MetaMask su QoreChain, fin dalla prima pagina.** Apri, controlla e chiudi la finestra di accesso EVM di cui MetaMask ha bisogno, e vedi cosa gli resta.
- **Controlli delle firme più rigorosi.** QoreX verifica la firma ML-DSA-87 di un'app rispetto alla chiave registrata del tuo account e dice chiaramente se quella chiave è stata registrata da un altro wallet.
- **Correzioni per problemi di sicurezza segnalati.**

Cosa hanno cambiato per te le build 1.1.7 / 0.3.7 (incluse nella 1.1.8 / 0.3.8):

- **Le approvazioni rifiutano una richiesta i cui byte possono essere letti in due modi.** Se lo stesso campo compare due volte in una richiesta, una schermata e la chain potrebbero non concordare su ciò che viene firmato - per esempio una commissione o un importo mostrato in modo diverso da quello eseguito. QoreX ora rifiuta una richiesta di questo tipo invece di mostrarne una sola lettura. Vedi [Cosa mostra la finestra di approvazione](/qorex/security-and-recovery#approvals).
- **La scadenza dei permessi è mostrata al secondo**, e i voti di governance vengono decodificati e mostrati nella schermata di approvazione.
- **I siti sono identificati dall'origine che il browser stesso attesta**, non da ciò che una richiesta dichiara di sé.
- **Le ricerche degli @handle funzionano di nuovo nell'estensione.**
- **Rivendicare un @handle richiede un account con accesso effettuato e avviene nell'app**; l'estensione ti indirizza lì.
- **I nomi QoreChain che imitano quelli ufficiali sono riservati**, così un nuovo handle non può imitare il progetto o il suo staff.

Novità principali dalla 1.0.9 / 0.2.6:

- **Più wallet** sullo stesso telefono o browser, ciascuno con la propria frase di recupero, con cambio in un tocco - vedi [Più wallet](/qorex/getting-started#several-wallets).
- **Account in stile Ethereum (coin 60)**, aggiunto a mano, per le frasi usate per la prima volta in MetaMask o sulla Dashboard - vedi [Ripristinare una frase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard).
- **Aggiunta di un token tramite contratto**, **Ricezione su qualsiasi rete**, **ricerca** globale, un **tour** al primo avvio, un **widget della schermata Home** e **notifiche push** all'arrivo di QOR (mobile) - vedi [Inviare e ricevere](/qorex/send-and-receive).
- **Riscatto e restake**, un controllo delle commissioni prima del riscatto, un elenco **Unstaking in corso** e avvisi prima di fare staking al punto da non poter più fare unstaking - vedi [Portfolio e staking](/qorex/portfolio-and-staking).
- Schermate di approvazione che mostrano ogni messaggio, la commissione, i limiti di spesa e la scadenza, e rifiutano ciò che QoreX non può visualizzare; **`signAndBroadcast`** per le dApp; **Siti connessi** con Revoca (estensione); la **finestra di accesso EVM** - vedi [Sicurezza e recupero](/qorex/security-and-recovery) e l'[Estensione browser](/qorex/browser-extension).
- Correzioni: un account con fondi poteva scomparire per un momento da «I tuoi account» (1.0.9); il tasto Indietro hardware di Android ora torna indietro di una schermata (1.1.1); la frase di recupero viene nascosta ai servizi non di accessibilità su Android 14 e successivi (1.1.6).

QoreX funziona sulla mainnet `qorechain-vladi` (attiva dal 7 giugno 2026), che esegue la chain **v3.2.5** dal 29 ottobre 2026 (la v3.2.4 dal 23 ottobre 2026). Formato di firma, indirizzi, decimali, memo e commissioni non cambiano in questi upgrade, quindi per essi non serve alcun aggiornamento di QoreX.

## Per gli sviluppatori {#developers}

Per integrarti con QoreX dalla tua app, usa il kit per sviluppatori di QoreX: sei pacchetti npm, pubblicati alla versione 0.1.0. I comandi di installazione, gli esempi e i limiti sono in [Integrazioni QoreX](/developer-tools/qorex-integrations). Per il rilevamento del wallet e la firma in un'app web, vedi anche il [wallet adapter](/developer-tools/wallet-adapter) e, per il provider browser che QoreX inietta, l'[Estensione browser](/qorex/browser-extension#standards).

## Cosa invia QoreX in rete {#data-and-privacy}

QoreX non ha **alcun analytics, alcun crash reporting e alcun SDK di tracciamento**. Le tue chiavi, la tua frase di recupero, il vault e le tue approvazioni **non lasciano mai il dispositivo**. Le app comunicano comunque con la rete, come deve fare qualsiasi wallet; questo è l'elenco completo.

**Sempre (necessario per mostrare i saldi e inviare):**

- **Endpoint pubblici di QoreChain** (`api`, `rpc`, `evm` e `svm` su `qore.host`, e gli equivalenti `-testnet`) per saldi, cronologia e trasmissione. Queste richieste contengono il tuo indirizzo **pubblico** `qor1…`.
- **Consultazione del prezzo** - una richiesta per il prezzo di QOR, che **non contiene alcun indirizzo**.
- **Reti esterne che detieni o visualizzi** - servizi RPC/REST pubblici di terze parti per quella rete, che contengono il tuo indirizzo **pubblico** su quella rete.
- **Registro degli @handle** - contiene l'handle che cerchi, oppure un indirizzo pubblico.

**Solo se lo attivi:**

- **Notifiche push** (mobile) - disattivate finché non le abiliti. Il server riceve allora il token del tuo dispositivo e gli indirizzi pubblici `qor1…` del wallet in uso (fino a 10). Un dispositivo da cui il server non riceve notizie da 90 giorni viene dimenticato.
- **Recupero sociale** - il relay conserva **solo testo cifrato**.
- **Accesso** (email, oppure Apple o Google) - necessario per rivendicare un @handle, per collegarti alla Dashboard e per usare le richieste di pagamento.
- **Connessione alla Dashboard e indirizzi collegati** - invia una prova firmata che possiedi l'indirizzo.
- **Richieste di pagamento** - inviano l'handle del mittente, l'handle del destinatario, l'importo e la nota facoltativa.

**Il widget della schermata Home** non effettua alcuna richiesta propria ai server di QoreChain: l'app gli passa localmente il tuo indirizzo, il saldo e l'impostazione di privacy, e il widget aggiorna il saldo dall'endpoint REST pubblico di QoreChain.

In nessuna delle due app esistono **chat AI né servizio QCAI**.
