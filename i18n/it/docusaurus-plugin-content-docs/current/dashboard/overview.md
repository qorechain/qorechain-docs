---
slug: /dashboard/overview
title: Panoramica della Dashboard e Guida introduttiva
sidebar_label: Panoramica e Guida introduttiva
sidebar_position: 1
---

# Panoramica della Dashboard e Guida introduttiva

La Dashboard di QoreChain all'indirizzo **[dashboard.qorechain.io](https://dashboard.qorechain.io)** è l'applicazione web ufficiale per usare QoreChain da un browser. Un solo account e un solo selettore di rete ti danno l'explorer, una vista wallet, un faucet di testnet, una schermata di swap con token di test, le quest, gli strumenti di contratto con AI, gli strumenti per nodi e validatori e una pagina per sviluppatori. È pensata per chi vuole provare la rete senza installare nulla e per chi sviluppa e vuole fare controlli rapidi mentre lavora. Non si installa nulla: funziona nel tuo browser.

Questa sezione è una guida pratica per l'utente: cosa fa ogni pagina, come aprirla e quali sono i suoi limiti.

## Innovazioni {#innovations}

- **Un solo selettore imposta la rete per ogni pagina.** Il controllo **Testnet / Mainnet** nell'intestazione memorizza la tua scelta nel browser e ricarica la pagina, così server e browser leggono la stessa rete. La mainnet è l'impostazione predefinita.
- **La mainnet è non-custodial.** La Dashboard non detiene mai chiavi di mainnet e non firma mai una transazione di mainnet. Invia a QoreX soltanto i parametri di un invio o di un'azione di staking, e QoreX ricostruisce, mostra, firma (firma ibrida ML-DSA-87) e trasmette la transazione. La Dashboard viene a conoscere solo l'hash della transazione.
- **Le viste di mainnet richiedono un account; la testnet è aperta.** Su mainnet, le statistiche della home, il Wallet, il Trade e la panoramica dell'Explorer verificano l'accesso sul server. Un visitatore non autenticato vede «Sign in to view mainnet».
- **Una presa d'atto dei fondi reali, una volta per browser.** Prima della prima vista di mainnet del Wallet, del Trade, della panoramica dell'Explorer o delle statistiche della home, una card intitolata «You're entering QoreChain Mainnet» elenca quattro punti: la Dashboard è non-custodial, le transazioni sono definitive e irreversibili, esiste il rischio di perdita totale e nulla qui è consulenza finanziaria, e i QOR di testnet non sono mai scambiabili. L'accettazione viene memorizzata nel tuo browser, non sul tuo account.
- **Un account, tre codifiche.** Lo stesso account viene mostrato come indirizzo `qor1...`, come indirizzo `0x...` e come indirizzo SVM base58, e la Dashboard legge saldo e cronologia una sola volta, tramite `qor1...`.

## Come usarla {#how-to-use}

### Il layout

**Intestazione.** Il selettore di rete, poi **Sign In** oppure un menu del profilo (Profile, Edit Profile, Theme, Language, Rewards, Referral, Docs, Log out).

**Barra laterale desktop, in ordine:**

| Voce | Pagina | Cos'è |
| --- | --- | --- |
| **Discover** | `/` | Home: pulsanti principali **Create Smart Contract** ed **Explore Network**, contatori «Dashboard Overview», elenchi dei contratti creati, degli ultimi audit pubblici e dei migliori contributori, e un «Developer Toolkit» con **Start Generating**, **New Audit** e **Claim Tokens**. |
| **Public Sale** | `/public-sale` | I partecipanti esistenti vedono la propria allocazione, la tempistica di vesting e il claim. |
| **Wallet** | [Wallet](/dashboard/wallet) | Saldo, cronologia, ricezione e (su mainnet) invio e staking tramite QoreX. |
| **Faucet** | [Faucet](/dashboard/faucet) | Token di testnet gratuiti. |
| **Explorer** | [Explorer](/dashboard/explorer) | Blocchi, transazioni, indirizzi e validatori. |
| **Trade** | [Trade](/dashboard/trade) | Schermata di swap con token di test. |
| Gruppo **Earn** | [Quests](/dashboard/quests) | Quests, Leaderboard, Badges. |
| **Games** | [Quests](/dashboard/quests#games) | La QoreChain Arcade. |
| Gruppo **Build** | [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Nodes & Validators](/dashboard/tools-hub) (`/tools`), [Developers](/dashboard/developers) | Strumenti per i contratti, la pagina per gli operatori (cinque schede: Validator Program, Validator Application, Light Node, Node Registration, Rollups) e la pagina pubblica per gli sviluppatori (sei schede: SDKs, PQ key status, Simulator, Signing playground, QoreX test wallet, AI agents (MCP)). La voce Nodes & Validators era etichettata «Tools»; la sua scheda SDK è passata a Developers. |
| **FAQ** | `/faq` | Aiuto nell'app. Alcune parti sono obsolete; questo manuale è il riferimento. |

La pagina [Validators](/dashboard/validators) (`/validators`) non ha un link nella barra laterale; aprila tramite l'indirizzo.

**Mobile.** Una barra inferiore (Discover, Wallet, Faucet, poi Explorer, Trade, Quests) più un menu a ventaglio centrale con il resto.

### Accedi {#sign-in}

La Dashboard ha due livelli: un **account Dashboard** con cui accedi e il **wallet** che colleghi a esso. Navigare non richiede mai un wallet.

- **Reindirizzamento alla pagina di accesso prima del caricamento della pagina:** Profile, [Wallet](/dashboard/wallet), Rewards, Referral, [Quests](/dashboard/quests), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), Connection, Contracts, Public Sale e ogni pagina di contratto salvato `/smart-contract-creator/<id>`.
- **Mostra una schermata «Authentication Required» quando non hai effettuato l'accesso:** [Nodes & Validators](/dashboard/tools-hub), [Validators](/dashboard/validators), FAQ, [AI Audit](/dashboard/contract-auditor), Badges, Leaderboard e Games.
- **Aperte senza account:** la home Discover, le pagine di dettaglio dell'[Explorer](/dashboard/explorer) (transazione, blocco, indirizzo, validatori) su entrambe le reti, la panoramica dell'Explorer su testnet, la pagina iniziale dello [Smart Contract Creator](/dashboard/smart-contract-creator) (una generazione gratuita), l'elenco degli audit in `/audits` e i report di audit pubblici, e la pagina [Developers](/dashboard/developers).
- **Mainnet senza aver effettuato l'accesso:** le pagine che mostrano dati di mainnet (contatori della home, Wallet, Trade, panoramica dell'Explorer) mostrano «Sign in to view mainnet» e un pulsante **Sign In**.

### Seleziona la tua rete {#select-network}

L'intestazione mostra la rete su cui ti trovi e ti permette di cambiarla. La scelta viene ricordata nel tuo browser.

| Rete | Chain ID | Quando usarla |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Rete live (attiva dal 7 giugno 2026, con la chain v3.2.4 dal 23 ottobre 2026) per valore reale. Non-custodial: colleghi il tuo wallet personale. |
| **Testnet** | `qorechain-diana` | Ambiente gratuito (con la chain v3.2.6 dal 27 ottobre 2026) con un wallet di test gestito dalla Dashboard e il [Faucet](/dashboard/faucet). |

Il token nativo è **QOR** (denominazione base `uqor`, 1 QOR = 10^6 uqor). Se sei alle prime armi, inizia su testnet, richiedi token dal Faucet e prova un primo trasferimento prima di passare a mainnet.

Alcune pagine ignorano il selettore: il Faucet paga sempre su testnet, [Trade](/dashboard/trade) mostra sempre contenuti di testnet, e Quests, Badges, Leaderboard, Games, Public Sale e FAQ non dipendono dalla rete.

### Collega il tuo wallet {#connect-your-wallet}

- **La mainnet è non-custodial.** Collega **QoreX** (il wallet ufficiale di QoreChain, estensione o app), **Keplr** o **MetaMask**. L'invio e lo staking sul rail Native richiedono QoreX, poiché gli account QoreChain firmano con una firma ibrida post-quantistica che oggi solo QoreX produce. Keplr si collega per visualizzare e ricevere sul rail Native. MetaMask si collega sul rail EVM; per inviare da lì servono anche la chiave post-quantistica dell'account e una finestra EVM aperta, che si apre da QoreX (vedi [Inviare con MetaMask](/dashboard/wallet#send-metamask)).
- **La testnet è custodial.** La Dashboard gestisce per te un wallet di test, quindi non c'è nulla da installare e nessun valore reale a rischio.

#### Collegati con QoreX (consigliato) {#connect-qorex}

1. Apri [dashboard.qorechain.io](https://dashboard.qorechain.io) e assicurati che l'intestazione mostri **Mainnet**.
2. Se è la tua prima visita a una pagina di mainnet in questo browser, accetta la [presa d'atto del rischio una tantum](#risk-acknowledgement).
3. Apri **Wallet** (devi aver effettuato l'accesso) e seleziona **Connect with QoreX** sulla card **QoreX wallet**.
4. Se l'estensione del browser QoreX viene rilevata e non è salvato alcun metodo, la Dashboard chiede «How do you want to connect?» con **Browser extension** e **QoreX app**. La scelta viene salvata. Se non viene rilevata alcuna estensione, passa direttamente al flusso dell'app.
   - **Browser extension:** il popup dell'estensione mostra `dashboard.qorechain.io` come sito richiedente. Approvalo; questo firma una prova una tantum che possiedi il tuo indirizzo `qor1...`. Nessun fondo viene spostato.
   - **QoreX app:** la Dashboard mostra un codice QR e **Open QoreX**. Scansionalo o toccalo, esamina la richiesta di associazione in QoreX e approvala con il tuo dato biometrico. La Dashboard esegue il polling («Waiting for approval in QoreX...») e termina da sola.
   - Un link **Use a different method** compare solo mentre un'associazione è in sospeso.
5. Una volta approvato, la Dashboard mostra il tuo indirizzo `qor1...` e sblocca le azioni che richiedono una firma.

Consulta [Wallet](/dashboard/wallet#mainnet) per la procedura completa di collegamento e invio, e la pagina [Account & Dashboard](/qorex/account-and-dashboard#dashboard) della documentazione di QoreX per la visuale lato wallet dello stesso abbinamento.

#### Collegati con Keplr o MetaMask

1. Con l'intestazione su **Mainnet** e la presa d'atto accettata, apri **Wallet**.
2. Sotto **or connect another wallet**, seleziona **Connect Keplr** o **Connect MetaMask**.
3. Approva la connessione nel tuo wallet. Se il tuo wallet non conosce ancora QoreChain, vedi [Aggiungi QoreChain al tuo wallet](/dashboard/wallet#add-network).

Una volta collegato, la pagina Wallet mostra il tuo indirizzo con il relativo saldo e la cronologia. Consulta [Wallet Setup](/getting-started/wallet-setup) per le indicazioni sulla configurazione iniziale.

### Presa d'atto del rischio una tantum {#risk-acknowledgement}

La card di presa d'atto compare prima della prima vista di mainnet di **Wallet**, **Trade**, **panoramica dell'Explorer** o **statistiche della home** in un browser. Non è richiesta per ogni pagina di mainnet: le pagine di dettaglio dell'Explorer, il Creator e le altre pagine si aprono senza di essa. Accettala una volta per browser; cancellando i dati del browser compare di nuovo.

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io](https://dashboard.qorechain.io), in qualsiasi browser aggiornato. Nessuna installazione.
- **Account:** accesso con email o con un provider di identità supportato nella pagina di accesso. Le pagine che lo richiedono sono elencate in [Accedi](#sign-in).
- **Reti:** mainnet `qorechain-vladi` e testnet `qorechain-diana`, con il selettore nell'intestazione. La mainnet è l'impostazione predefinita.
- **Wallet:** nessuno per navigare. QoreX per gli invii e lo staking su mainnet, Keplr o MetaMask per visualizzare e ricevere. Su testnet la Dashboard crea per te un wallet di test.
- **Costo:** la Dashboard è gratuita. Le azioni on-chain pagano la commissione di rete (soglia minima 0,1 uqor per gas). Alcune voci a pagamento sono descritte nelle rispettive pagine (la licenza light node e la quota del programma validatori in [Nodes & Validators](/dashboard/tools-hub)).
- **Early-access gate:** nessuno oggi. Le pagine di mainnet richiedono solo l'accesso (dove indicato sopra) e la presa d'atto una tantum.

## Dove è pubblicata {#where-published}

| Superficie | Indirizzo | Reti | Accesso |
| --- | --- | --- | --- |
| Dashboard | [dashboard.qorechain.io](https://dashboard.qorechain.io) | Mainnet e testnet | Per pagina, vedi [Accedi](#sign-in) |
| Explorer autonomo | [explore.qore.network](https://explore.qore.network) (un'app separata, vedi [Explorer](/dashboard/explorer#standalone-explorer)) | Mainnet e testnet | Nessuno |
| Endpoint pubblici | `rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`, con varianti `*-testnet` | Mainnet e testnet | Nessuno |

Pagine di questa sezione: [Explorer](/dashboard/explorer), [Wallet](/dashboard/wallet), [Trade](/dashboard/trade), [Bridge](/dashboard/bridge), [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Staking & Validators](/dashboard/staking-and-validators), [Validators](/dashboard/validators), [Faucet](/dashboard/faucet), [Quests, Badges, Leaderboard e Games](/dashboard/quests), [Nodes & Validators](/dashboard/tools-hub) e [Developers](/dashboard/developers).

## Limiti e problemi noti {#limits}

- **Non esiste una schermata Bridge.** Vedi [Bridge](/dashboard/bridge).
- **Trade non segue il selettore di rete.** Mostra contenuti di testnet anche con l'intestazione su Mainnet. Vedi [Trade](/dashboard/trade).
- **Le FAQ nell'app sono una breve pagina di aiuto.** Dove differiscono da questo manuale, segui questo manuale.
- **Non ancora attivi:** il Transaction inspector nella pagina Developers e il server MCP (la pagina Developers indica che non è pubblicato).
- **Restrizioni della mainnet.** Staking, invio e deploy di contratti su mainnet sono descritti pagina per pagina; diversi flussi (deploy Native o SVM, redelegation, staking con blocco temporale) non sono offerti sulla Dashboard.
- **La testnet non ha valore reale.** Non inviare mai QOR reali a un indirizzo di testnet: i formati sono identici. Vedi [Wallet](/dashboard/wallet#testnet).

:::tip Nuovo su QoreChain?
Segui [Connecting to Testnet](/getting-started/connecting-to-testnet) e [Your First Transaction](/getting-started/first-transaction) per fare pratica rapidamente, poi torna qui per esplorare il resto della Dashboard.
:::
