---
slug: /qorex/overview
title: Wallet QoreX
sidebar_label: Panoramica
sidebar_position: 1
---

# Wallet QoreX

**QoreX** è il wallet ufficiale **non-custodial** per **QoreChain**, la Layer 1 quantum-safe (mainnet `qorechain-vladi`). Le tue chiavi private vengono generate e conservate **solo sul tuo dispositivo** — QoreChain Association non ha mai accesso ai tuoi fondi e le app non contengono **alcun analytics, alcun crash reporting e alcun SDK di tracciamento** — chiavi, passphrase di recupero, vault e approvazioni non lasciano mai il tuo dispositivo (vedi [Cosa invia QoreX in rete](#data-and-privacy)). Ogni trasferimento di QOR sul lane Native porta una **firma post-quantum ibrida** (ML-DSA-87, NIST FIPS-204, abbinata a secp256k1), così i tuoi fondi sono protetti sia da attaccanti classici sia quantistici.

QoreX è composto da due parti che lavorano insieme:

- **Estensione browser** — il wallet desktop, **live e pubblica su Chrome, Firefox e Safari (macOS)**. È un wallet a sé stante (crea/importa, detieni e invia QOR) e il connettore che permette a qualsiasi sito web di rilevare QoreX e trasformare ogni richiesta in un'approvazione esplicita. Vedi [Estensione browser](/qorex/browser-extension).
- **App mobile** (Android e iOS) — il wallet completo: crea/ripristina, invia e ricevi QOR quantum-safe, reti esterne, staking, portafoglio, recupero e un browser dApp integrato. **Su Google Play** per Android, e **sull'App Store** per iOS (vedi disponibilità qui sotto).

:::caution Esegui il backup della tua passphrase di recupero non appena crei un wallet
QoreX è non-custodial: QoreChain Association non può recuperare un wallet perso, reimpostarlo o ripristinarlo per te. **Disinstallare l'app, reimpostare il telefono o rimuovere l'estensione elimina le tue chiavi da quel dispositivo.** Annota la tua passphrase di recupero di 24 parole (l'app mobile non la mostra mentre crea il wallet — rivelala da **Impostazioni → Sicurezza → Rivela la passphrase di recupero**; l'estensione la mostra una sola volta alla creazione) e, se puoi, configura il [recupero sociale](/qorex/security-and-recovery#social-recovery). Vedi [Esegui il backup ora](/qorex/security-and-recovery#back-up-now).
:::

## Disponibilità per piattaforma {#platform-availability}

| Capacità | App mobile (Android e iOS) | Estensione browser |
|---|---|---|
| Creazione / importazione di un wallet | ✅ (l'app non mostra la passphrase quando crea il wallet — rivelala da Impostazioni → Sicurezza) | ✅ (a sé stante; la passphrase viene mostrata una sola volta alla creazione) |
| Più wallet, ciascuno con la propria passphrase di recupero | ✅ (Impostazioni → Wallet) | ✅ (**Wallet**, un'unica password per tutti) |
| Più account da un'unica passphrase di recupero | ✅ (fino a 20 per wallet) | ✅ |
| Account in stile Ethereum (coin 60), aggiunto a mano | ✅ | ✅ |
| Invio e ricezione di QOR (post-quantum) | ✅ | ✅ (Invia; Ricevi con QR) |
| Ricezione su qualsiasi rete supportata | ✅ | ✅ |
| Pagamento di un @handle | ✅ | ✅ |
| Rivendicazione di un @handle | ✅ (richiede un account con accesso effettuato) | — (l'estensione ti indirizza all'app) |
| Staking: delega, rimozione delega, spostamento dello stake, riscatto, riscatto e restake | ✅ | ✅ |
| Reti esterne (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + token) | ✅ | ✅ (invio dal popup) |
| Aggiunta di un token tramite contratto (reti EVM) | ✅ | ✅ |
| Finestra di accesso EVM | ✅ | ✅ |
| Lingua dell'interfaccia (10 lingue) | ✅ (segue il telefono) | ✅ (segue il browser) |
| Portfolio, Q-Day Scanner, Recupero sociale, Legacy | ✅ | — |
| Ricerca, tour al primo avvio, widget della schermata Home, notifiche push | ✅ | — |
| Connessioni dApp | ✅ (browser in-app, limitato alla sessione) | ✅ (qualsiasi sito web; **Siti connessi** con Revoca) |
| Swap | Solo Android, disattivato finché non c'è liquidità nei pool (non mostrato su iOS) | — |
| Accesso account e richieste di pagamento | ✅ | — |
| Collegamento multi-dispositivo | ✅ | — |
| Abbinamento dashboard | ✅ | ✅ (connessione + trasferimenti proposti, incl. staking) |

## Perché QoreX è diverso

- **Quantum-safe per impostazione predefinita** — i trasferimenti di QOR sul lane Native portano sempre una firma ibrida ML-DSA-87 + secp256k1. Tutto ciò che è classico (chain esterne) è chiaramente etichettato, mai in modo silenzioso.
- **Veramente non-custodial** — le chiavi sono generate on-device e risiedono in un vault hardware (Secure Enclave su iOS, StrongBox su Android) o in un vault cifrato (estensione). Non lasciano mai il tuo dispositivo.
- **Nessun analytics, nessun crash reporting, nessun SDK di tracciamento** in nessuna app QoreX. Alcuni extra opzionali comunicano con un server solo quando li attivi: l'accesso account (vedi [Account e Dashboard](/qorex/account-and-dashboard)) e le notifiche push, che registrano il tuo dispositivo e i tuoi indirizzi *pubblici* in modo che QoreX possa avvisarti quando arrivano QOR. Il wallet non dipende mai da nessuno dei due. L'elenco completo è in [Cosa invia QoreX in rete](#data-and-privacy).
- **Un saldo unificato** — il tuo QOR è un unico saldo su tutti i lane Native, EVM e SVM; QoreX lo mostra come una cifra unica.
- **Più percorsi di recupero** — una passphrase di recupero di 24 parole (sempre; su mobile, rivelala da Impostazioni → Sicurezza), recupero sociale opzionale con guardian e un timelock di 48 ore, eredità Legacy opzionale, e un comodo collegamento multi-dispositivo.

## Per iniziare

- Nuovo su QoreX? Inizia con [Per iniziare](/qorex/getting-started) per creare o ripristinare il tuo wallet.
- Poi impara a [Inviare e ricevere](/qorex/send-and-receive) QOR quantum-safe.
- Configura la tua rete di sicurezza in [Sicurezza e recupero](/qorex/security-and-recovery).
- Su desktop, installa l'[Estensione browser](/qorex/browser-extension).

## Download e disponibilità {#availability}

- **Estensione browser** — live e pubblica: installala da [Chrome Web Store, Firefox Add-ons, o Mac App Store (Safari)](/qorex/browser-extension#install). Installa sempre da una scheda ufficiale dello store.
- **App Android** — live in produzione su Google Play: https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 o successivo).
- **App iOS** — live sull'**App Store**: https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 o successivo).

## Quale versione è live dove {#versions}

La revisione degli store segue una propria tempistica, quindi ogni store serve la propria build, e Google Play e il Chrome Web Store al momento sono indietro rispetto agli altri. Questa è la versione corrente **su ciascuno store** al **20 ottobre 2026**:

| Store | Versione corrente | Nota |
|---|---|---|
| Apple App Store (iOS) | 1.1.7 | rilasciata il 15 ottobre |
| Google Play (Android) | 1.1.6 | la 1.1.7 è stata caricata ma non è ancora pubblica — la scheda pubblica mostra ancora la 1.1.6 |
| Chrome Web Store | 0.3.6 | serve ancora la 0.3.6 |
| Firefox Add-ons | 0.3.7 | |
| Safari (Mac App Store) | 1.7.7, con l'estensione 0.3.7 | il Mac App Store usa una propria numerazione `1.x` |

Gli store mostrano sempre la loro versione corrente, e uno store che serve ancora una build più vecchia si aggiornerà automaticamente. Le funzionalità qui sotto contrassegnate **1.1.7 / 0.3.7** sono live sugli store della tabella che già distribuiscono quella build (iOS, Firefox, Safari) e arrivano su Google Play e Chrome quando quelle schede vengono aggiornate. Questo manuale non descrive come disponibile nulla di più recente della 1.1.7 / 0.3.7.

Cosa hanno cambiato per te le build 1.1.7 / 0.3.7:

- **Le approvazioni rifiutano una richiesta i cui byte possono essere letti in due modi.** Se lo stesso campo compare due volte in una richiesta, una schermata e la chain potrebbero non concordare su ciò che viene firmato — per esempio una commissione o un importo mostrato in modo diverso da quello eseguito. QoreX ora rifiuta una richiesta di questo tipo invece di mostrarne una sola lettura. Vedi [Cosa mostra la finestra di approvazione](/qorex/security-and-recovery#approvals).
- **La scadenza dei permessi è mostrata al secondo**, e i voti di governance vengono decodificati e mostrati nella schermata di approvazione.
- **I siti sono identificati dall'origine che il browser stesso attesta**, non da ciò che una richiesta dichiara di sé.
- **Le ricerche degli @handle funzionano di nuovo nell'estensione.**
- **Rivendicare un @handle richiede un account con accesso effettuato e avviene nell'app**; l'estensione ti indirizza lì.
- **I nomi QoreChain che imitano quelli ufficiali sono riservati**, così un nuovo handle non può imitare il progetto o il suo staff.

Novità principali dalla 1.0.9 / 0.2.6:

- **Più wallet** sullo stesso telefono o browser, ciascuno con la propria passphrase di recupero, con cambio in un tocco — vedi [Più wallet](/qorex/getting-started#several-wallets).
- **Account in stile Ethereum (coin 60)**, aggiunto a mano, per le passphrase usate per la prima volta in MetaMask o sulla Dashboard — vedi [Ripristinare una passphrase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard).
- **Aggiunta di un token tramite contratto**, **Ricezione su qualsiasi rete**, **ricerca** globale, un **tour** al primo avvio, un **widget della schermata Home** e **notifiche push** all'arrivo di QOR (mobile) — vedi [Inviare e ricevere](/qorex/send-and-receive).
- **Riscatto e restake**, un controllo delle commissioni prima del riscatto, un elenco **Unstaking in corso** e avvisi prima di fare staking al punto da non poter più fare unstaking — vedi [Portfolio e staking](/qorex/portfolio-and-staking).
- Schermate di approvazione che mostrano ogni messaggio, la commissione, i limiti di spesa e la scadenza, e rifiutano ciò che QoreX non può visualizzare; **`signAndBroadcast`** per le dApp; **Siti connessi** con Revoca (estensione); la **finestra di accesso EVM** — vedi [Sicurezza e recupero](/qorex/security-and-recovery) e l'[Estensione browser](/qorex/browser-extension).
- Correzioni: un account con fondi poteva scomparire per un momento da «I tuoi account» (1.0.9); il tasto Indietro hardware di Android ora torna indietro di una schermata (1.1.1); la passphrase di recupero viene nascosta ai servizi non di accessibilità su Android 14 e successivi (1.1.6).

QoreX funziona sulla mainnet `qorechain-vladi`, che esegue la chain **v3.2.3** (attiva dal 7 giugno 2026) fino all'altezza 3.742.566 e la v3.2.4 da quel blocco. Formato di firma, indirizzi, decimali, memo e commissioni non cambiano in questi upgrade, quindi per essi non serve alcun aggiornamento di QoreX.

## Cosa invia QoreX in rete {#data-and-privacy}

QoreX non ha **alcun analytics, alcun crash reporting e alcun SDK di tracciamento**. Le tue chiavi, la tua passphrase di recupero, il vault e le tue approvazioni **non lasciano mai il dispositivo**. Le app comunicano comunque con la rete, come deve fare qualsiasi wallet; questo è l'elenco completo.

**Sempre (necessario per mostrare i saldi e inviare):**

- **Endpoint pubblici di QoreChain** (`api`, `rpc`, `evm` e `svm` su `qore.host`, e gli equivalenti `-testnet`) per saldi, cronologia e trasmissione. Queste richieste contengono il tuo indirizzo **pubblico** `qor1…`.
- **Consultazione del prezzo** — una richiesta per il prezzo di QOR, che **non contiene alcun indirizzo**.
- **Reti esterne che detieni o visualizzi** — servizi RPC/REST pubblici di terze parti per quella rete, che contengono il tuo indirizzo **pubblico** su quella rete.
- **Registro degli @handle** — contiene l'handle che cerchi, oppure un indirizzo pubblico.

**Solo se lo attivi:**

- **Notifiche push** (mobile) — disattivate finché non le abiliti. Il server riceve allora il token del tuo dispositivo e gli indirizzi pubblici `qor1…` del wallet in uso (fino a 10). Un dispositivo da cui il server non riceve notizie da 90 giorni viene dimenticato.
- **Recupero sociale** — il relay conserva **solo testo cifrato**.
- **Accesso** (email, oppure Apple o Google) — necessario per rivendicare un @handle, per collegarti alla Dashboard e per usare le richieste di pagamento.
- **Connessione alla Dashboard e indirizzi collegati** — invia una prova firmata che possiedi l'indirizzo.
- **Richieste di pagamento** — inviano l'handle del mittente, l'handle del destinatario, l'importo e la nota facoltativa.

**Il widget della schermata Home** non effettua alcuna richiesta propria ai server di QoreChain: l'app gli passa localmente il tuo indirizzo, il saldo e l'impostazione di privacy, e il widget aggiorna il saldo dall'endpoint REST pubblico di QoreChain.

In nessuna delle due app esistono **chat AI né servizio QCAI**.
