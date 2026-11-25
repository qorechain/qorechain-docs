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
QoreX è non-custodial: QoreChain Association non può recuperare un wallet perso, reimpostarlo o ripristinarlo per te. **Disinstallare l'app, reimpostare il telefono o rimuovere l'estensione elimina le tue chiavi da quel dispositivo.** Annota la tua frase di recupero di 24 parole (l'app mobile non la mostra mentre crea il wallet, quindi rivelala da **Impostazioni → Sicurezza → Mostra la frase di recupero**; l'estensione la mostra una sola volta alla creazione) e, se puoi, configura il [recupero sociale](/qorex/security-and-recovery#social-recovery). Vedi [Esegui il backup ora](/qorex/security-and-recovery#back-up-now).
:::

## Innovazioni {#innovations}

- **Lane nativa con firma ibrida.** Ogni trasferimento nativo di QOR è firmato due volte: con una chiave classica secp256k1 e con ML-DSA-87 (FIPS 204). La chain verifica entrambe. Tutto ciò che avviene su una rete esterna è solo classico, e QoreX lo indica come tale prima che tu confermi.
- **Una frase di recupero, una chiave ML-DSA-87, nessun secondo backup.** La chiave ML-DSA-87 è derivata in modo deterministico dalle stesse 24 parole: `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. La derivazione è pubblicata in [QoreSign](/qoresign/overview), quindi qualsiasi wallet compatibile deriva la stessa chiave.
- **Registrata automaticamente, poi verificata.** La chiave ML-DSA-87 viene registrata on-chain con la tua prima transazione (con una prova di possesso dalla chain v3.2.3 in poi). Dopo ogni trasmissione il wallet controlla che la transazione confermata porti il livello ML-DSA-87 e ti avvisa se non lo porta.
- **Approvazioni che rifiutano ciò che non sanno leggere.** Ogni messaggio, la commissione, i limiti di spesa e la scadenza vengono decodificati prima che tu firmi. Una richiesta che QoreX non sa decodificare, o i cui byte possono essere letti in due modi, viene rifiutata.
- **`signAndBroadcast` per le dApp.** Un sito web invia i messaggi; il wallet li mostra decodificati, aggiunge il livello ML-DSA-87 che solo il wallet può creare e trasmette. Una pagina non può produrre quel livello.
- **Finestre di accesso EVM, più sicure per impostazione predefinita.** Sopra la chain v3.2.0, una transazione EVM è ammessa solo mentre l'account ha una finestra aperta: un `MsgOpenEVMWindow` con firma ibrida, limitato per numero di transazioni, valore e scadenza. QoreX la apre, la mostra e la chiude. Una finestra che apri tu è limitata a **Solo trasferimenti di QOR** a meno che tu non scelga **Qualsiasi contratto**, che ha un proprio avviso; una finestra aperta dice esattamente cosa ammette; e un'approvazione che apre una finestra per un sito nomina ogni contratto che la finestra consente e dice quando sostituisce quella aperta. Vedi [Sicurezza e recupero](/qorex/security-and-recovery#evm-window).
- **Handle con pinning.** Un @handle è legato a un indirizzo `qor1…` da un'attestazione ed25519 del registro più la firma secp256k1 del proprietario stesso. QoreX fissa l'indirizzo che ha risolto per primo e segnala un cambiamento silenzioso.
- **Recupero che non richiede alcuna azienda.** Il recupero sociale divide il seed in share cifrate sigillate con ML-KEM (2 guardian su 3), con un timelock di 48 ore che ti avvisa; Legacy è un dead-man's switch sui tuoi guardian; il collegamento dei dispositivi sposta un wallet con un codice monouso e un QR inutile da solo. Vedi [Sicurezza e recupero](/qorex/security-and-recovery).
- **Primo avvio con uno scopo.** Dopo il breve tour QoreX chiede **Cosa vuoi fare per prima cosa?** (ricevere denaro, inviare denaro o tenere al sicuro le mie cripto) e ti accompagna, concludendo con una breve verifica del backup. Vedi [Primo avvio](/qorex/getting-started#first-run).
- **Richieste di pagamento con link firmati.** Chiedi un importo e QoreX crea un link firmato dalla chiave del tuo account, così un destinatario o un importo modificato viene rilevato. Il QoreX di chi paga controlla la firma, la rete e l'eventuale @handle, poi mostra la normale revisione. Una richiesta viene contrassegnata come pagata solo quando la chain mostra il pagamento. Vedi [Inviare e ricevere](/qorex/send-and-receive).
- **Contatti e preferiti.** Nomi per gli indirizzi che paghi, conservati solo sul dispositivo. I preferiti sono chip a un tocco nel modulo di invio, **Ripeti pagamento** compila di nuovo il modulo (devi comunque controllarlo) e un indirizzo che somiglia soltanto a uno salvato viene segnalato.
- **La protezione del mio denaro.** Un'unica schermata che controlla, dal vivo, se il tuo backup è stato verificato, se il recupero è stato testato, i tuoi guardiani (app), i siti e le app collegati a te, le autorizzazioni che il tuo account ha dato sulla rete e le approvazioni ERC-20 sull'EVM di QoreChain (ciascuna con Revoca), e quali firme sono post-quantistiche su quale lane. Vedi [Sicurezza e recupero](/qorex/security-and-recovery).
- **Una cronologia chiara.** Ogni transazione risulta in attesa, confermata o fallita, letta dalla chain, per account, con un'esportazione in CSV sicura da aprire in un foglio di calcolo.
- **Un banner sullo stato della rete.** Se i blocchi smettono di arrivare, QoreX lo dice, usando gli orari dei blocchi della chain stessa. Non dice nulla mentre la rete funziona bene.
- **Cura della chiave post-quantistica.** Se il record della chiave post-quantistica di un account non può più firmare, QoreX propone di registrarla di nuovo (mai automaticamente, due tocchi). Puoi anche ruotare la chiave ML-DSA-87 dalla tua frase di recupero, e creare, cofirmare e inviare da un account **multisig** post-quantistico.
- **Modalità sviluppatore.** Un interruttore (disattivato per impostazione predefinita) che aggiunge 17 strumenti: ispettori, un simulatore di transazioni, la revisione di contratti e deploy, profili di rollup, firma offline e multisig, e un posto in cui gli agenti IA propongono transazioni che approvi tu. Nulla al suo interno cambia una regola di firma. Vedi [Modalità sviluppatore](/qorex/developer-mode).
- **Funzionalità di rete solo testnet.** L'invio a un'altra chain via IBC, una schermata del QoreChain Bridge e Solana su QoreChain esistono solo sulla testnet. Vedi [Funzionalità della testnet](/qorex/testnet-features).
- **Ingombro ridotto.** L'estensione chiede al browser un solo permesso API, `storage`, e non include alcun codice di analytics o tracciamento. Le notifiche push comunicano al server solo i tuoi indirizzi pubblici e la notifica dice soltanto "QOR received".

## Come si usa {#how-to-use}

1. Installa QoreX da una scheda ufficiale dello store (vedi [Come accedere](#how-to-access)).
2. Crea un wallet o ripristinane uno: [Per iniziare](/qorex/getting-started) per l'app mobile, [Estensione browser](/qorex/browser-extension#wallet) per l'estensione.
3. Annota le 24 parole, poi scegli **Cosa vuoi fare per prima cosa?** (ricevere, inviare o tenere al sicuro le mie cripto) e segui il percorso: [Primo avvio](/qorex/getting-started#first-run). Poi invia e ricevi QOR: [Inviare e ricevere](/qorex/send-and-receive).
4. Fai staking: [Portfolio e staking](/qorex/portfolio-and-staking). Configura la tua rete di sicurezza: [Sicurezza e recupero](/qorex/security-and-recovery).
5. Per usare un sito web con QoreX, aprilo nell'estensione (desktop) o nel [Browser dApp](/qorex/dapp-browser) dell'app. Ogni connessione e ogni firma è un'approvazione che dai tu.

## Come accedere {#how-to-access}

- **Reti:** mainnet `qorechain-vladi` (predefinita) e testnet `qorechain-diana`. Su mobile, la testnet si attiva da **Impostazioni → Usa la testnet (sviluppatori)**. Nell'estensione, attiva prima la Modalità sviluppatore (tocca sette volte il numero di versione in fondo al popup), poi scegli **Passa alla testnet (diana)**. Mentre sei sulla testnet, un banner giallo **TESTNET** compare in ogni schermata.
- **Account necessario:** nessuno. L'accesso (email, Apple o Google) è facoltativo ed è necessario solo per rivendicare un @handle, collegarsi alla Dashboard e usare le richieste di pagamento basate su account nell'app. I link di pagamento firmati non richiedono un account.
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

| Build | Scheda e nome del pacchetto | Versione corrente | Link |
|---|---|---|---|
| App iOS | App Store, **QoreX** (id 6791256626) | 1.2.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| App Android | Google Play, `network.qore.qorex` | 1.2.5 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Estensione Chrome | Chrome Web Store, **QoreX** | 0.4.4 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Estensione Firefox | Firefox Add-ons, `qorex` | 0.4.4 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Estensione Safari | Mac App Store, **QoreX Wallet** (id 6794132220) | app 1.8.2, estensione 0.4.4 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Kit per sviluppatori | sei pacchetti npm, vedi [Per gli sviluppatori](#developers) | 0.1.0 | [Integrazioni QoreX](/developer-tools/qorex-integrations) |

La revisione degli store segue una propria tempistica, quindi uno store può servire una build più vecchia di un altro; vedi [Quale versione è live dove](#versions). Il codice sorgente di QoreX non è pubblico.

## Limiti e problemi noti {#limits}

- **Nessuna promessa oltre ciò che è firmato.** La firma ibrida copre le transazioni della lane nativa. Le transazioni EVM portano solo una firma secp256k1 e sono ammesse solo mentre una finestra di accesso EVM è aperta (solo gli account aggiunti con **Aggiungi un conto Ethereum (coin 60)** possono inviare su quella lane). I trasferimenti SVM e su reti esterne sono solo classici.
- **Solo mobile:** Portfolio, Q-Day Scanner, recupero sociale, Legacy, accesso, rivendicazione di un @handle e collegamento dei dispositivi.
- **Lo swap non è disponibile.** Resta disattivato finché non esiste liquidità nei pool e non è mostrato su iOS.
- **I signer collegati** (Phantom o MetaMask come chiave collegata con limiti di spesa) non sono ancora disponibili all'interno di QoreX.
- **Solo testnet:** l'invio a un'altra chain via IBC, la schermata del QoreChain Bridge e Solana su QoreChain. Nessuna di queste è offerta sulla mainnet. Vedi [Funzionalità della testnet](/qorex/testnet-features).
- Gli **agenti IA** (Modalità sviluppatore) non possono firmare: possono solo proporre una transazione che approvi tu. Nell'estensione richiedono un programma di supporto sul tuo computer non ancora pubblicato, e non sono disponibili in Safari. Nell'app incolli una proposta o apri un link di proposta. Vedi [Modalità sviluppatore](/qorex/developer-mode).
- **Se il servizio degli handle non è raggiungibile,** il wallet ripiega sui semplici indirizzi; tutto il resto continua a funzionare.
- Un wallet perso, senza frase annotata e senza recupero sociale, non può essere recuperato da nessuno.

## Disponibilità per piattaforma {#platform-availability}

| Capacità | App mobile (Android e iOS) | Estensione browser |
|---|---|---|
| Creazione / importazione di un wallet | ✅ (l'app non mostra la frase quando crea il wallet - rivelala da Impostazioni → Sicurezza) | ✅ (a sé stante; la frase viene mostrata una sola volta alla creazione, poi una breve verifica del backup) |
| Primo avvio: **Cosa vuoi fare per prima cosa?** | ✅ (dopo il tour; riapribile dalle Impostazioni) | ✅ (dopo la creazione o l'importazione; riapribile dal popup) |
| Verifica del backup (un quiz su tre parole della tua frase) | ✅ | ✅ |
| Più wallet, ciascuno con la propria frase di recupero | ✅ (Impostazioni → Wallet) | ✅ (**Portafogli**, un'unica password per tutti) |
| Più account da un'unica frase di recupero | ✅ (fino a 20 per wallet) | ✅ |
| Account in stile Ethereum (coin 60), aggiunto a mano | ✅ | ✅ |
| Invio e ricezione di QOR (lane nativa con firma ibrida) | ✅ | ✅ (Invia con un passaggio di revisione; Ricevi parte dalla moneta) |
| Ricezione su qualsiasi rete supportata | ✅ | ✅ |
| Pagamento di un @handle | ✅ | ✅ |
| Rivendicazione di un @handle | ✅ (richiede un account con accesso effettuato) | - (l'estensione ti indirizza all'app) |
| Richieste di pagamento con link firmati, e pagamento di una richiesta | ✅ | ✅ |
| Contatti, preferiti e **Ripeti pagamento** | ✅ | ✅ |
| Cronologia per account (in attesa, confermata, fallita) ed esportazione CSV | ✅ (Attività) | ✅ (**Cronologia**) |
| **La protezione del mio denaro** | ✅ | ✅ |
| **Assistenza** (canali ufficiali) | ✅ | ✅ |
| Banner sullo stato della rete | ✅ | ✅ |
| Blocco automatico (predefinito 15 minuti) | ✅ (chiede di nuovo il dato biometrico o il PIN) | ✅ (chiede di nuovo la password) |
| Staking: delega, rimozione delega, spostamento dello stake, riscatto, riscatto e restake, blocchi, scelta di dove vanno le ricompense | ✅ | ✅ (una schermata per ciascuna) |
| Riparazione e rotazione della chiave post-quantistica | ✅ | ✅ |
| Account multisig post-quantistici | ✅ | ✅ |
| Reti esterne (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + token) | ✅ | ✅ (invio dal popup) |
| Aggiunta di un token tramite contratto (reti EVM) | ✅ | ✅ |
| Finestra di accesso EVM | ✅ | ✅ |
| Lingua dell'interfaccia (10 lingue) | ✅ (segue il telefono) | ✅ (segue il browser) |
| Portfolio, Q-Day Scanner, Recupero sociale, Legacy | ✅ | - |
| Ricerca, tour al primo avvio, widget della schermata Home, notifiche push | ✅ | - |
| Connessioni dApp | ✅ (browser in-app, revocabile per sito, siti preferiti e recenti) | ✅ (qualsiasi sito web; **Siti collegati** con Revoca) |
| Modalità sviluppatore (17 strumenti) | ✅ (una scheda **Sviluppo** nella barra inferiore) | ✅ (un solo pulsante **Strumenti per sviluppatori**) |
| Agenti IA che propongono transazioni (Modalità sviluppatore) | ✅ (incolla una proposta o apri un link di proposta) | serve un programma di supporto (non ancora pubblicato); non in Safari |
| Invio a un'altra chain (IBC), schermata del QoreChain Bridge, Solana su QoreChain | solo testnet | solo testnet |
| Swap | Solo Android, disattivato finché non c'è liquidità nei pool (non mostrato su iOS) | - |
| Accesso all'account | ✅ | - |
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

La revisione degli store segue una propria tempistica, quindi uno store può servire per un po' una build più vecchia di un altro. Questa è la versione corrente **su ciascuno store**:

| Store | Versione corrente | Nota |
|---|---|---|
| Apple App Store (iOS) | 1.2.5 | |
| Google Play (Android) | 1.2.5 | |
| Chrome Web Store | 0.4.4 | |
| Firefox Add-ons | 0.4.4 | |
| Safari (Mac App Store) | 1.8.2, con l'estensione 0.4.4 | il Mac App Store usa una propria numerazione `1.x` |

Gli store mostrano sempre la loro versione corrente, e uno store che serve ancora una build più vecchia si aggiornerà automaticamente. Le build che uno store non ha ancora rilasciato non sono descritte in questo manuale come disponibili.

### Cosa aggiungono le build 1.2.5 / 0.4.4 {#whats-new-125}

Per l'uso quotidiano (app ed estensione, mainnet e testnet salvo diversa indicazione):

- **Primo avvio con uno scopo.** Dopo il tour, **Cosa vuoi fare per prima cosa?** ti accompagna a ricevere, inviare o tenere al sicuro le tue cripto, con una breve verifica del backup. Si può saltare e riaprire. Vedi [Primo avvio](/qorex/getting-started#first-run).
- **Richieste di pagamento con link firmati**, e pagamento di una richiesta da un link. Una richiesta viene contrassegnata come pagata quando lo mostra la chain.
- **Contatti e preferiti**, con **Ripeti pagamento** e un avviso per gli indirizzi sosia.
- **Una cronologia più chiara**: in attesa, confermata o fallita, per account, con esportazione CSV.
- **La protezione del mio denaro**: backup, test di recupero, guardiani (app), siti collegati, autorizzazioni e approvazioni dei token con Revoca, e una spiegazione semplice di quali firme sono post-quantistiche su quale lane.
- **Finestre di accesso EVM più sicure.** Una finestra che apri tu è impostata per default su **Solo trasferimenti di QOR**; consentire qualsiasi contratto è una scelta separata con un avviso. Le approvazioni nominano ogni contratto che una finestra consente e dicono quando una nuova finestra sostituisce quella aperta. Quando un nodo non può verificare cosa fa una chiamata ai tuoi token, QoreX lo dice e chiede un secondo tocco.
- **Aiuto dentro l'app** (**Assistenza**): solo i canali ufficiali, più un promemoria che lo staff di QoreX non chiede mai la tua frase.
- **Un banner sullo stato della rete** quando i blocchi smettono di arrivare, e il **periodo di staking** (il tempo prima che i QOR ritirati dallo staking tornino a tua disposizione) viene letto dalla rete invece di essere un numero fisso.
- **Estensione: una richiesta di firma di un sito mentre QoreX è bloccato** apre la schermata della password e nomina il sito; dopo lo sblocco, la richiesta mostra la propria approvazione.
- **App: siti preferiti e recenti** nella pagina iniziale del browser dApp.
- **Cura della chiave post-quantistica**: **Registra di nuovo la chiave** per un record di chiave che non può più firmare (mai automaticamente, due tocchi), **Ruota la chiave post-quantistica** dalla tua frase di recupero e account multisig completi (creare, cofirmare tramite file o incollando, inviare).
- **Ricevi** offre anche i token che hai aggiunto tramite contratto, con l'indirizzo della loro rete.
- **Ricevi** per Cosmos Hub, Osmosis e Celestia mostra l'indirizzo da cui firmano i tuoi invii su quelle reti.
- **Modalità sviluppatore** con 17 strumenti. Vedi [Modalità sviluppatore](/qorex/developer-mode).
- **Solo testnet:** invio a un'altra chain via IBC, una schermata del QoreChain Bridge e Solana su QoreChain. Vedi [Funzionalità della testnet](/qorex/testnet-features).
- **Per i siti:** QoreX ora rifiuta, a qualsiasi sito, un'autorizzazione permanente (una concessione authz di `MsgGrant` o `MsgExec`) che permetterebbe a qualcun altro di agire come il tuo account. Vedi [Integrazione dApp](/qorex/dapp-integration).

Cosa hanno cambiato per te le build 1.2.4 / 0.4.3:

- **Sblocco dell'estensione.** Enter sblocca, il pulsante mostra che sta lavorando, **Password errata.** compare solo per una password sbagliata e ogni altro errore viene nominato.
- **Le chiamate ai contratti ricevono abbastanza gas.** La transazione CosmWasm o cross-VM di un sito viene simulata prima dell'approvazione, e una chiamata che il contratto rifiuterebbe viene respinta prima che tu la veda.
- **I prezzi del gas seguono la rete**, e una transazione oltre il limite di gas per transazione della rete viene rifiutata prima che venga firmato qualcosa.
- **Le approvazioni Solana** contrassegnano come illeggibile un'istruzione che QoreX non sa decodificare e chiedono un secondo tocco; un memo mostra il suo testo.
- **Una chiave post-quantistica che non può più firmare viene indicata come tale**, invece di "registrata da un altro wallet".
- **Un sito non può più chiudere la tua finestra EVM né cancellarne il consenso**; fai entrambe le cose dalle schermate di QoreX.
- **Il rendimento dello staking** è letto dal dato della chain stessa, e **l'uso della finestra EVM** compare nella Cronologia.
- **Firefox:** github.com si carica normalmente con QoreX installato.

Cosa hanno cambiato per te le build 1.2.3 / 0.4.2:

- **Ricevi parte dalla moneta.** Un elenco con ricerca con QOR per primo, poi la moneta propria di ogni rete e i token inclusi, ciascuno con la sua immagine. Scegliendone uno compaiono l'indirizzo e il codice QR di quella rete, con un avviso che nomina la moneta.
- **Agli account che non possono usare una finestra EVM viene detto cosa fare**, con un pulsante per **I tuoi conti**.
- **Le schermate di staking e della finestra EVM dicono quando la tua prima transazione registra anche la tua chiave.**

Cosa hanno cambiato per te le build 1.2.2 / 0.4.1:

- La pagina di QOR elenca ogni transazione dell'account, in entrata e in uscita, con **Mostra altri**.
- **L'invio funziona su BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche e Celestia** (e i loro token), come su Ethereum, Solana, Cosmos Hub e Osmosis.
- Le schermate di approvazione leggono le regole di spesa e i dati delle chiamate EVM, e offrono il messaggio completo. I messaggi che gestiscono le chiavi o l'autorità di un account possono essere firmati solo dalle schermate di QoreX.
- La revisione di un primo invio mostra la commissione una tantum di registrazione della chiave e il totale.

Cosa ha cambiato per te la build 1.2.1 (app): un link può aprire una pagina nel browser dApp (dopo la consueta richiesta biometrica), le schermate di approvazione mostrano il memo di una transazione e l'app dichiara ai siti le proprie capacità di firma. I link che iniziano con `qorex://` distribuiti dalla dashboard funzionano di nuovo.

Cosa hanno cambiato per te le build 1.2.0 / 0.4.0:

- **Blocco automatico** (1, 5, 15, 30, 60 o 240 minuti; predefinito 15) e un pulsante **Blocca** nell'estensione.
- **Una revisione prima di ogni trasferimento** nell'estensione, e un avviso quando un indirizzo somiglia soltanto a uno che hai già pagato.
- **Cronologia per account** con ogni tipo di transazione QoreChain.
- **Le schermate di staking** nell'estensione sono separate (Metti in staking QOR, Ritira dallo staking, Sposta lo stake, Riscuoti, Riscuoti e ridelega, Blocca per un bonus, Le ricompense vanno a), **Sposta lo stake** è in tre passaggi e intercetta gli spostamenti che la rete rifiuterebbe, e puoi **scegliere dove vanno le ricompense di staking** (un altro account dello stesso wallet).
- **Le dApp EVM firmano tramite QoreX** (`personal_sign`, typed data e transazioni), con il rischio decodificato di ogni richiesta e una simulazione prima della firma.
- **Gli ultimi valori noti** vengono mostrati, ed etichettati come tali, quando la rete non risponde.
- Un avviso quando la commissione è superiore al valore che sposti.

Cosa avevano aggiunto le build 1.1.9 / 0.3.9 (incluse in ogni build attuale):

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
- Schermate di approvazione che mostrano ogni messaggio, la commissione, i limiti di spesa e la scadenza, e rifiutano ciò che QoreX non può visualizzare; **`signAndBroadcast`** per le dApp; **Siti collegati** con Revoca (estensione); la **finestra di accesso EVM** - vedi [Sicurezza e recupero](/qorex/security-and-recovery) e l'[Estensione browser](/qorex/browser-extension).
- Correzioni: un account con fondi poteva scomparire per un momento da «I tuoi account» (1.0.9); il tasto Indietro hardware di Android ora torna indietro di una schermata (1.1.1); la frase di recupero viene nascosta ai servizi non di accessibilità su Android 14 e successivi (1.1.6).

QoreX funziona sulla mainnet `qorechain-vladi` (attiva dal 7 giugno 2026), che esegue la chain **v3.2.8** dal 18 novembre 2026 (la v3.2.7 dal 12 novembre 2026, la v3.2.6 dal 4 novembre 2026, la v3.2.5 dal 29 ottobre 2026, la v3.2.4 dal 23 ottobre 2026). Formato di firma, indirizzi, decimali e memo non cambiano in questi upgrade. QoreX 1.2.4 / 0.4.3 ha aggiunto la gestione delle regole della v3.2.8 (ambito della finestra EVM, limiti di gas e prezzo del gas della rete), quindi tieni QoreX aggiornato.

## Per gli sviluppatori {#developers}

Per collegare un sito web a QoreX (rilevamento del wallet, provider, firma, link ed errori), parti da [Integrazione dApp](/qorex/dapp-integration); gli strumenti integrati nel wallet per chi sviluppa sono in [Modalità sviluppatore](/qorex/developer-mode). Per integrarti con QoreX dalla tua app puoi usare anche il kit per sviluppatori di QoreX: sei pacchetti npm, pubblicati alla versione 0.1.0. I comandi di installazione, gli esempi e i limiti sono in [Integrazioni QoreX](/developer-tools/qorex-integrations). Per il rilevamento del wallet e la firma in un'app web, vedi anche il [wallet adapter](/developer-tools/wallet-adapter) e, per il provider browser che QoreX inietta, l'[Estensione browser](/qorex/browser-extension#standards).

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
- **Accesso** (email, oppure Apple o Google) - necessario per rivendicare un @handle, per collegarti alla Dashboard e per usare le richieste di pagamento basate su account nell'app.
- **Connessione alla Dashboard e indirizzi collegati** - invia una prova firmata che possiedi l'indirizzo.
- **Richieste di pagamento basate su account** (a un @handle, nell'app) - inviano l'handle del mittente, l'handle del destinatario, l'importo e la nota facoltativa. Un **link di pagamento firmato** viene creato e firmato sul tuo dispositivo; se è stato pagato viene letto dagli endpoint pubblici di QoreChain.
- **Q-Day Scanner su un indirizzo Bitcoin** - interroga un servizio gestito da terzi, che vede quell'indirizzo e il tuo indirizzo IP. QoreX ne indica il nome ed esegue la scansione solo dopo che hai accettato.

**Il widget della schermata Home** non effettua alcuna richiesta propria ai server di QoreChain: l'app gli passa localmente il tuo indirizzo, il saldo e l'impostazione di privacy, e il widget aggiorna il saldo dall'endpoint REST pubblico di QoreChain.

**Conservati solo sul dispositivo:** i contatti, i siti dApp preferiti e recenti della tua app (salvati senza la query o il fragment dell'indirizzo), l'esportazione della cronologia che crei, e il test di recupero e la verifica del backup (le parole che digiti non vengono conservate né inviate). Il banner sullo **stato della rete** legge l'ultimo blocco dagli endpoint pubblici di QoreChain, non da un servizio di stato separato.

In nessuna delle due app esistono **chat AI né servizio QCAI**. Lo strumento **Agenti IA** della Modalità sviluppatore consente a un assistente IA che esegui tu di proporre transazioni a QoreX; QoreX non contiene un proprio servizio IA, e nulla viene firmato senza la tua approvazione.
