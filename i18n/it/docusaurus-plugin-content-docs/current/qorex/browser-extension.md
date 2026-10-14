---
slug: /qorex/browser-extension
title: Estensione Browser QoreX
sidebar_label: Estensione Browser
sidebar_position: 2
---

# Estensione Browser QoreX

L'**estensione browser** QoreX è il wallet desktop di QoreChain. È un **wallet autonomo** — crea o importa un wallet, detieni e invia QOR, e connettiti alle dApp — ed è l'elemento che permette a qualsiasi sito web di rilevare QoreX e trasformare ogni richiesta in un'approvazione esplicita e decodificata.

È **live e pubblica** su tre store.

## Installazione {#install}

| Browser | Installazione |
|---|---|
| **Chrome e browser basati su Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 o successivo) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 o successivo)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Quale versione è live dove {#versions}

Al **15 ottobre 2026**: **Chrome 0.3.6**, **Firefox 0.3.7** (una point release dopo la 0.3.6) e **Safari** all'interno dell'app macOS **QoreX Wallet** (**1.7.6**, che include l'estensione 0.3.6; il Mac App Store usa una propria numerazione `1.x`). Le revisioni degli store arrivano in momenti diversi, quindi uno store può servire per breve tempo una build più vecchia o più recente; la scheda dello store mostra sempre la sua versione attuale. Questa pagina descrive il set di funzionalità della 0.3.6. Vedi anche [Quale versione è live dove](/qorex/overview#versions).

Dalla 0.2.6 l'estensione ha acquisito: [più wallet con un'unica password](#wallets), un [account in stile Ethereum che aggiungi a mano](#coin60), [Claim & restake](#stake), un elenco **Unstaking in corso**, l'[aggiunta di un token tramite contratto](#custom-tokens), [Ricevi su qualsiasi rete](#receive), i [Siti connessi con Revoca](#connected-sites), la [finestra di accesso EVM](#evm-window), [`signAndBroadcast` per le dApp](#sign-and-broadcast) e schermate di approvazione che mostrano ogni messaggio, la commissione e la scadenza.

**La superficie dei permessi non è cambiata dalla 0.1.3** — vedi [Quali permessi richiede QoreX](#permissions).

:::note
Su Safari, le approvazioni si aprono in una scheda del browser anziché in una finestra popup — l'estensione è confezionata con il wrapper web-extension di Safari di Apple, a partire dalla stessa base di codice.
:::

## Crea o ripristina un wallet {#wallet}

Apri il popup e scegli:

- **Crea un nuovo wallet** — scegli una password (almeno 8 caratteri); QoreX genera una nuova recovery phrase di 24 parole sul tuo dispositivo (entropia a 256 bit), deriva la tua identità QoreChain e la sigilla nel vault sotto quella password (e, opzionalmente, una passkey — vedi [Sicurezza](#security)). Le 24 parole vengono mostrate **una sola volta** — annotale, spunta *Ho salvato la mia recovery phrase in un posto sicuro*, poi continua. Puoi mostrarle di nuovo in seguito con **Mostra recovery phrase** nel popup (password richiesta).
- **Importa una recovery phrase** — ripristina da una phrase esistente. Una phrase di meno di 24 parole ripristina normalmente i tuoi fondi, ma QoreX ti avvisa che la tua chiave post-quantistica ottiene allora solo la robustezza della phrase; per la piena robustezza, crea un nuovo wallet da 24 parole e spostaci i tuoi fondi.

:::danger Annota la phrase prima di continuare
Il vault dell'estensione esiste solo in questo browser. **Rimuovere l'estensione, cancellarne i dati o reimpostare il browser elimina le tue chiavi**, e nessuno — compresa QoreChain Association — può ripristinarle. Senza le tue 24 parole annotate, i tuoi fondi sono persi per sempre. Vedi [Fai il backup ora](/qorex/security-and-recovery#back-up-now).
:::

L'estensione conserva le proprie chiavi; non richiede l'app mobile. Le chiavi non lasciano mai il dispositivo.

## Più wallet e account {#wallets}

- **Wallet** (dalla 0.3.3) — la schermata **Wallet** del popup ("Wallet in questo browser") elenca ogni wallet in questo browser. Ognuno ha la propria recovery phrase; **un'unica password** li sblocca tutti, e il cambio modifica quale wallet QoreX mostra e con quale firma (nulla si sposta on-chain). **Aggiungi** un wallet creandone uno nuovo (la sua phrase viene mostrata una sola volta) o ripristinandone uno; la password viene richiesta una volta per ri-sigillare il vault. Aggiungere o rimuovere un wallet disattiva lo **sblocco con passkey** — riattivalo dalla schermata principale. Per rimuoverne uno, tocca *Rimuovi da questo browser* e inserisci la password; l'ultimo wallet non può essere rimosso da questa schermata. La rimozione elimina quella chiave dal browser — solo la sua recovery phrase la riporta indietro.
- **Account** (dalla 0.2.2) — **I tuoi account** crea e alterna più account dalla stessa phrase (fino a 20 per wallet; sono numerati e non possono essere rinominati). Ripristinare la phrase che hai annotato riporta l'**Account 1**; riaggiungi gli altri con **Aggiungi un account**. Il cambio account sposta tutto con sé: invio, staking, ricezione e il tuo @handle seguono l'account attivo.

### Account in stile Ethereum {#coin60}

Dalla 0.3.2, **Aggiungi un account Ethereum (coin 60)** (nella schermata **I tuoi account**) aggiunge l'account per una phrase usata per la prima volta in MetaMask o sulla Dashboard; vedi [Ripristinare una phrase da MetaMask o dalla Dashboard](/qorex/getting-started#restore-dashboard). Il suo indirizzo 0x è quello che MetaMask mostra per le stesse parole. Gli handle non sono offerti su di esso.

Portfolio, Q-Day Scanner, recovery sociale, Legacy Protocol, richieste di pagamento e collegamento dei dispositivi restano esclusivi dell'app mobile — vedi [QoreX Wallet](/qorex/overview#platform-availability).

## Il tuo account, saldo e @handle {#account}

La schermata principale del popup mostra il tuo indirizzo `qor1…` (tocca per copiare) e il tuo saldo QOR in tempo reale, così non devi aprire un block explorer per verificare nessuno dei due.

### Saldi in vesting (bloccati) {#vesting}

Se il tuo account detiene QOR in vesting (ad esempio un'allocazione TGE non ancora rilasciata), il saldo si divide in **disponibile ora** e **ancora bloccato**, e un invio che supera l'importo disponibile viene rifiutato prima di raggiungere la rete, invece di fallire on-chain dopo aver comunque pagato una commissione. QoreX deliberatamente **non** mostra una "prossima data di sblocco" qui: una vesting schedule può essere modificata dalla governance, quindi una data sulla scheda del saldo si leggerebbe come una promessa che QoreX non può garantire. La divisione disponibile-vs-bloccato è ciò che rimane accurato.

### Rivendica un @handle

Alcune versioni dell'estensione ti permettono di rivendicare un **@handle** unico (ad esempio `@liviu`) per l'indirizzo di questo account dal popup, allo stesso modo dell'app mobile; se il tuo popup non lo offre, rivendicalo dall'app mobile (la rivendicazione non è offerta sugli account in stile Ethereum). La rivendicazione viene firmata con la chiave dell'account e si lega a quell'indirizzo, così l'app mobile e la Dashboard possono risolverlo quando qualcuno ti invia fondi. Vedi [@handle](/qorex/account-and-dashboard#handle) per come gli handle sono legati agli indirizzi (non a un wallet nel suo insieme).

## Invia a un @handle {#handle-send}

Dalla 0.1.9 puoi pagare un @handle registrato direttamente, invece di cercare un indirizzo:

1. Apri il popup e tocca **Invia**.
2. Nel campo destinatario, digita `@` seguito dall'handle (ad esempio `@liviu`) invece di un indirizzo `qor1…`.
3. QoreX risolve l'handle e ti mostra l'**indirizzo risolto** prima che tu firmi qualsiasi cosa — controlla sempre che corrisponda a ciò che ti aspetti.
4. Inserisci l'importo e conferma.

La risoluzione viene verificata in due modi prima che QoreX la utilizzi: un'attestazione del registry controllata rispetto a una trust key integrata nell'estensione, e la firma del proprietario dell'handle sulla rivendicazione stessa. Una risposta che fallisce uno dei due controlli viene rifiutata del tutto — QoreX non ripiega mai sulla visualizzazione di un indirizzo non verificato. La prima volta che paghi un determinato handle, QoreX ricorda (fissa) l'indirizzo a cui si è risolto; se in seguito quell'handle si risolve a un indirizzo **diverso**, QoreX si ferma e ti mostra sia il vecchio che il nuovo indirizzo per intero, così puoi decidere se procedere. Questa memoria vive **per browser** — pagare lo stesso handle per la prima volta da un browser o computer diverso lo mostra come nuovo anche lì. È previsto, non un errore.

## Ricevi {#receive}

Tocca **Ricevi** nel popup per mostrare il tuo indirizzo `qor1…` come codice QR (con l'icona QoreChain incorporata) accanto a un pulsante di copia — scansionalo da un telefono o incolla direttamente l'indirizzo.

**Selettore di rete.** Ricevi può anche mostrare l'indirizzo per Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis e Celestia, ciascuno con un avviso "solo questa rete" (QoreChain resta per prima).

## Stake dall'estensione {#stake}

Dalla **0.2.2**, il popup ha una propria schermata **Stake** — un wallet creato solo nell'estensione non ha più bisogno dell'app mobile per guadagnare ricompense di staking.

1. Apri il popup e vai su **Stake**.
2. La schermata elenca i validatori attivi con la loro commissione, il tuo totale attualmente in staking e le ricompense in attesa di riscossione. I validatori che la rete ha messo in **jail** sono esclusi dall'elenco — delegare a uno di essi non è mai ciò che vuoi.
3. Per delegare, scegli un validatore e un importo, poi conferma. QoreX firma con la firma ibrida post-quantistica obbligatoria, allo stesso modo di un Invio. Mentre digiti, ti avvisa se l'importo lascerebbe meno della commissione di una transazione (non potresti fare unstake né riscuotere finché l'account non detiene di nuovo QOR). Con più account, scegli quale fa lo staking dal selettore di account nella schermata Stake.
4. **Claim** (riscossione) raccoglie le ricompense; **Claim & restake** le reinveste verso i validatori che le hanno generate in un'unica transazione. QoreX controlla prima che i tuoi QOR **sbloccati** possano pagare la commissione (viene pagata prima che arrivino le ricompense) e ti avvisa in caso contrario.
5. **Unstake** avvia il periodo di unbonding di 21 giorni e l'importo appare sotto **Unstaking in corso** con il tempo rimanente — vedi [Staking e Delega](/user-guide/staking-and-delegation).
6. **Sposta stake** sposta lo stake su uno o più validatori diversi (redelega) — senza attesa di unbonding, senza penalità, e le ricompense continuano a fluire. Vedi [Spostare lo stake tra validatori](/qorex/portfolio-and-staking#move-stake).

Lo staking, la delega e le ricompense avvengono esclusivamente sulla lane **Nativa**, mai tramite un precompile EVM.

### Approvare una richiesta di staking dalla Dashboard {#stake-dashboard}

La [Dashboard](/dashboard/staking-and-validators) di QoreChain compone le richieste di staking ma non può firmarle — la tua chiave non lascia mai il vault dell'estensione. Quando clicchi **Continua in QoreX** sulla Dashboard, la richiesta si apre nell'estensione perché tu la esamini (validatore e importo) e la approvi, esattamente come un Invio.

:::note Se una transazione viene mostrata come "downgraded" invece che riuscita
La Dashboard a volte mostra una transazione come **downgraded** invece di un successo netto. Significa che i tuoi fondi si sono spostati, ma il layer di firma post-quantistica non è stato trovato on-chain per quella transazione — non è qualcosa che hai fatto tu di sbagliato e non è qualcosa che puoi risolvere dal tuo lato. È un difetto dal nostro lato; ti preghiamo di segnalarlo al supporto così possiamo indagare. Il messaggio resta a schermo deliberatamente invece di sparire, così hai il tempo di leggerlo e segnalarlo.
:::

### Invio su reti esterne {#send-external}

Oltre a QOR sulla lane Nativa, il popup può inviare asset su reti esterne, tutte derivate dalla stessa recovery phrase (per le reti EVM mostra la **commissione di rete massima** — "Commissione di rete: al massimo …" — prima che tu confermi):

| Tipo | Reti | Token inclusi |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Voci ERC-20 (USDC e USDT su tutte le chain EVM, DAI su Ethereum) |
| SVM | Solana | Voci SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC via IBC; campo memo opzionale |

Prima che un trasferimento esterno venga inviato devi spuntare una presa d'atto esplicita: **"Le reti esterne accettano solo firme classiche — a differenza del tuo QOR, questo trasferimento NON è quantum-safe."** Le chain esterne non possono trasportare una firma post-quantistica, e QoreX non lo nasconde mai.

## Standard wallet supportati {#standards}

QoreX espone tre interfacce, tutte iniettate nella pagina come `window.qorex` (`{ evm, native, svm }`) e rilevabili tramite i contratti di rilevamento di [`@qorechain/connect`](/sdk/overview).

| Standard | Cos'è | Cosa significa per te come sviluppatore |
|---|---|---|
| **EIP-1193** | La JavaScript API del provider Ethereum (`request(...)`, eventi). | Il provider EVM di QoreX risponde alle richieste su account e rete — `eth_requestAccounts`, `eth_accounts`, `eth_chainId` e `wallet_switchEthereumChain` (qualsiasi altra chain restituisce il codice standard `4902`). **Non** firma né invia ancora transazioni o messaggi EVM: gli altri metodi restituiscono "EVM method … not yet supported". Usa MetaMask o un altro wallet EVM per le transazioni della lane EVM (che ora richiedono anche una [finestra di accesso EVM](#evm-window) aperta). |
| **EIP-6963** | Rilevamento multi-wallet dei provider (eventi announce / request). | QoreX si annuncia insieme a ogni altro wallet — **non sovrascrive mai `window.ethereum`** — così l'utente sceglie QoreX per ogni sito senza conflitti. |
| **Provider Nativo (in stile Keplr)** | `window.qorex.native`: `enable`, `getKey`, `signDirect` e `signAndBroadcast`, più un elenco `capabilities`. **Non** è un sostituto completo di Keplr — QoreX non crea l'alias `window.keplr` e non ha `getOfflineSigner`, `signAmino` né `sendTx`. | Per inviare una transazione QoreChain chiama **`signAndBroadcast`** (vedi [Inviare una transazione QoreChain](#sign-and-broadcast)): QoreX mostra i messaggi decodificati e la commissione, aggiunge la firma ibrida post-quantistica che solo il wallet può produrre, e trasmette. `signDirect` su QoreChain viene rifiutato a meno che la transazione non porti già un valido layer quantum-safe. |
| **Solana Wallet Standard** *(dalla 0.1.5)* | Rilevamento wallet nativo per le dApp Solana (`wallet-standard:register-wallet` / `app-ready`). | Le dApp Solana **rilevano automaticamente QoreX** — nessuna integrazione personalizzata. Funzionalità: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; chain `solana:mainnet`; transazioni sia `legacy` che `v0`. |

:::note Raggiungere direttamente la lane SVM
La stessa interfaccia è disponibile anche su `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Il rilevamento automatico Wallet-Standard e la lane SVM completamente implementata sono stati rilasciati nella **0.1.5** e sono live sia su Chrome che su Firefox (vedi [quale versione è live dove](#versions)).

Le approvazioni Solana mostrano **una riga per istruzione**, decodificata dove QoreX può: trasferimenti di SOL (destinatario e lamport), trasferimenti di token SPL, **"CONSENTI di SPENDERE i tuoi token"** (approve), **"CEDI il controllo dell'account"** (set authority) e chiusura di un token account — e riportano "istruzione che QoreX non può leggere" per tutto il resto, con il programma. Una richiesta che include un'istruzione approve o set authority è intitolata "vuole autorità sui tuoi token Solana — leggi ogni riga qui sotto". Le transazioni che non elencano il tuo wallet come firmatario vengono rifiutate, `signMessage` non firmerà byte che in realtà sono una transazione, e la firma è contrassegnata come **classica** — vedi [Firma post-quantistica](#pqc).
:::

## Monete e token {#custom-tokens}

La schermata **Monete e token** del popup ti permette di aggiungere un **token ERC-20 tramite il suo contratto**: scegli la rete, incolla l'indirizzo del contratto, **Verifica il contratto**. QoreX legge nome e decimali del token dal contratto stesso — e li rilegge in background quando lo aggiungi, invece di fidarsi del popup — poi li mostra con un promemoria che chiunque può creare un token con qualsiasi nome. Il token compare poi in **Invio su reti esterne**. Rifiuta token inclusi, duplicati, reti non EVM, indirizzi errati, contratti illeggibili e contratti che prendono in prestito il nome di un token incluso.

## Siti connessi {#connected-sites}

**Siti connessi** nel popup elenca ogni sito che questo wallet ha approvato — un sito può vedere l'indirizzo di questo wallet e chiederti di firmare. Tocca **Revoca** per rimuoverne uno. Le approvazioni sono conservate **per wallet**: un sito approvato per un wallet non può leggere l'indirizzo di un altro wallet dopo che hai cambiato.

## Finestra di accesso EVM {#evm-window}

La schermata **Finestra di accesso EVM** del popup apre e chiude la finestra che permette a un account di inviare sulla lane EVM di QoreChain (v3.2.0 e successive) — la stessa schermata dell'app. Vedi [Finestra di accesso EVM](/qorex/security-and-recovery#evm-window).

## Lingua {#language}

L'estensione parla le stesse dieci lingue dell'app mobile, della dashboard e del sito: inglese, rumeno, tedesco, spagnolo, francese, italiano, turco, arabo, giapponese e coreano. Per impostazione predefinita segue la lingua del **browser** (ricadendo sull'inglese per qualsiasi altra lingua) — nota che questa è una fonte diversa rispetto all'app mobile, che segue la lingua del **telefono**, quindi le due possono mostrare lingue diverse se il tuo telefono e il tuo browser sono impostati diversamente. Un selettore nella schermata principale del popup ti permette di sovrascrivere la lingua rilevata in qualsiasi momento; passare all'arabo ribalta immediatamente il popup da destra a sinistra, non solo il testo.

## Sicurezza e permessi {#security}

QoreX è costruito per essere verificabile, non solo per essere ritenuto affidabile:

- **Vault** — le tue chiavi sono sigillate con **AES-256-GCM**. Il percorso della password deriva la propria chiave con **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), così un blob del vault esfiltrato resiste al cracking su GPU/ASIC. (I blob legacy PBKDF2 restano apribili e si ri-sigillano in Argon2id al prossimo sblocco.)
- **Sblocco con passkey (opzionale, dalla 0.1.5)** — dove il tuo authenticator supporta l'estensione **WebAuthn PRF**, QoreX può sbloccare il vault a partire dall'output PRF a 32 byte della passkey invece di una password digitata. La tua password rimane sempre un fallback.

  :::note Dove appare lo sblocco con passkey
  QoreX rileva automaticamente WebAuthn e mostra l'opzione **Abilita sblocco con passkey** solo dove il browser la espone alle pagine dell'estensione — cioè **Chrome ed Edge**. Su **Firefox** l'opzione è nascosta, perché Firefox non espone WebAuthn alle pagine delle estensioni. Questo è previsto, non un bug.
  :::
- **Manifest V3 + CSP rigorosa** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Non c'è **nessun caricamento di codice remoto** dopo l'installazione e nessun `wasm-unsafe-eval`.
- **Nessun account, nessuna telemetria** — nessuna analisi, nessun tracciamento, nessun logging remoto, nessuna registrazione e nessuna email. La scheda di Firefox dichiara la raccolta dati come `none`.

### Quali permessi richiede QoreX, e perché {#permissions}

Questa sezione esiste perché la scheda di Firefox mostra il permesso **"Accedere ai tuoi dati per tutti i siti web"**, che può sembrare in contrasto con un wallet che non dichiara alcun host permission. Ecco la verità esatta e non modificata, tratta dal manifest.

Il `manifest.json` dell'estensione dichiara:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`permissions: ["storage"]`** — l'unico permesso API. Memorizza il vault cifrato e le tue approvazioni di connessione per-origine **localmente**, nello storage dell'estensione.
- **`host_permissions: []`** — QoreX non dichiara **nessun** host permission. Non richiede la capacità di effettuare richieste di rete cross-origin verso siti arbitrari per tuo conto.
- **`web_accessible_resources`** — permette alle pagine di caricare l'`inpage.js` di QoreX stessa, il piccolo script che espone il provider. `use_dynamic_url` gli assegna un indirizzo per sessione così che i siti non possano fare il fingerprint dell'estensione cercandola.
- **`content_scripts` con match `<all_urls>`** — questa è la ragione onesta per cui Firefox dice *"Accedere ai tuoi dati per tutti i siti web."* QoreX inietta un piccolo script provider (`content.js` → `inpage.js`) in **ogni pagina**. Un content script che gira su tutti i siti *può* tecnicamente leggere la pagina, e i browser descrivono questa capacità con quella dicitura esatta — che provenga da `host_permissions` o da un match di content script.

**Perché il content script gira ovunque.** Affinché **qualsiasi** dApp possa rilevare il wallet tramite EIP-6963 senza che tu debba prima concedere l'accesso per-sito. È così che funzionano MetaMask, Keplr, Phantom e ogni altro wallet iniettato: il provider iniettato deve essere presente prima che gli script della pagina vengano eseguiti (`document_start`), su qualsiasi sito tu visiti.

**Cosa fa quello script — e cosa non fa.** Fa solo da ponte per i messaggi del wallet (annuncia il provider, inoltra le richieste di connessione/firma al service worker, restituisce il risultato). Non legge il contenuto della pagina oltre a quelle richieste del wallet, non invia nulla a un server, né carica codice remoto — e non può recuperare dati arbitrari cross-origin perché non ci sono host permission. Tutto questo è verificabile: l'estensione è bloccata da CSP, non include analytics, e il pacchetto di Firefox include uno zip sorgente riproducibile.

## Connettere una dApp a QoreX {#connect}

Una dApp rileva QoreX tramite **EIP-6963**. Announce-and-request, poi usa il provider EIP-1193 restituito (che risponde solo alle richieste su account e rete — vedi la tabella sopra):

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

Per la lane **Nativa** di QoreChain, usa il provider su `window.qorex.native` (`enable`, `getKey`, `signAndBroadcast`, `signDirect`; leggi `capabilities` per vedere cosa supporta questa build). Il pacchetto di livello superiore [`@qorechain/connect`](/sdk/overview) racchiude questo rilevamento per te.

Le approvazioni sono **per-origine**: la prima connessione a un sito apre un popup di approvazione che mostra l'origine, l'approvazione rivela solo il tuo indirizzo pubblico, e l'approvazione di un sito non concede nulla a un altro. Le approvazioni sono conservate per wallet, persistono finché non le revochi sotto **Siti connessi**, e un sito può avere una richiesta in attesa (tre in tutto); cambiare wallet o bloccare risponde "no" alle richieste in attesa. Vedi [Cosa mostra la finestra di approvazione](/qorex/security-and-recovery#approvals).

### Bridge con la Dashboard (v0.1.5, esteso nella v0.2.2) {#dashboard-bridge}

La versione 0.1.5 aggiunge un bridge limitato esclusivamente a **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prova di pairing *Connect with QoreX* (il backend riverifica la firma), e `executeTransfer({ to, amountUqor, memo })` approva e trasmette un trasferimento QOR proposto dalla Dashboard, restituendo il `txHash`. Questi metodi vengono rifiutati su qualsiasi altra origine.

La **0.2.2** aggiunge `native:executeRequest`, che accetta un'intera richiesta proposta dalla Dashboard — incluso lo [staking](#stake-dashboard) — validata rispetto allo stesso parser condiviso che QoreX usa ovunque: viene rifiutata in caso di rete non corrispondente, origine estranea, indirizzo che non è il tuo, tipo di richiesta sconosciuto, oppure una richiesta di staking che porta un `toAddress` (le richieste di staking non ne hanno uno). I tipi di richiesta sono send, delegate, undelegate, redelegate e claim; una richiesta Connect ti permette di scegliere quale dei tuoi account collegare, e `listAccounts()` restituisce i tuoi account (sola lettura).

Poiché un indirizzo `qor1…` è ugualmente valido su mainnet e su testnet, una richiesta proposta dalla Dashboard indica quale rete ha come target, e QoreX rifiuta di agire su di essa se questa non corrisponde alla rete a cui l'estensione è attualmente connessa — non passerà mai da una rete all'altra per conto di una richiesta.

## Inviare una transazione QoreChain da una dApp: `signAndBroadcast` {#sign-and-broadcast}

Ogni transazione QoreChain da un account con una chiave post-quantistica registrata richiede una firma ibrida — secp256k1 **e** ML-DSA-87 — e solo il wallet detiene la chiave ML-DSA, quindi una pagina non può costruirla. Invia i messaggi; QoreX fa il resto: mostra i messaggi decodificati e la commissione, costruisce la transazione per l'account selezionato dall'utente, aggiunge la firma ibrida (registrando prima la chiave post-quantistica dell'account se è la sua prima transazione), trasmette e si risolve con il risultato. Disponibile dall'estensione **0.3.5** e dall'app **1.1.5** (ogni build degli store oggi).

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");            // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                        // must be the wallet's active network
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],  // protobuf bytes: Uint8Array, number[] or base64
  memo: "",                                          // optional, up to 256 bytes
  gasLimit: 300000,                                  // optional
});
// → { txHash, code, height?, shield }
```

- `chainId` deve coincidere con la rete attiva del wallet (`qorechain-vladi` su mainnet). Una dApp non può cambiare rete; solo l'utente può.
- Da 1 a 32 messaggi per chiamata; i byte dei messaggi vengono firmati esattamente come inviati.
- La commissione (`gasLimit` × il prezzo del gas della rete) viene mostrata prima dell'approvazione. Un rifiuto lancia `QoreX: signature rejected`.
- La gestione delle chiavi post-quantistiche (registrazione, migrazione, rotazione — anche dentro un `MsgExec` authz) viene rifiutata: il wallet gestisce da sé la chiave dell'account.

## Firma post-quantistica {#pqc}

Ogni trasferimento QOR che QoreX stessa avvia viene firmato con una **firma ibrida post-quantistica** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) insieme alla firma classica secp256k1 — usando la pipeline ibrida completa in `@qorechain/sdk`. **Non c'è alcun interruttore**: QoreChain la richiede e QoreX non invia mai un trasferimento QOR sulla lane Nativa senza di essa.

- **Firma Nativa avviata da una dApp** — usa [`signAndBroadcast`](#sign-and-broadcast): QoreX decodifica ogni messaggio, mostra la commissione e aggiunge da sé il layer quantum-safe. `signDirect` firma una transazione costruita dalla pagina e, su QoreChain, viene **rifiutato** a meno che quella transazione non porti già un valido layer quantum-safe (e rifiutato per gli account in stile Ethereum, che usano `signAndBroadcast`). QoreX non firma mai alla cieca: una richiesta che non può decodificare viene rifiutata, e non firma mai una transazione QoreChain solo classica.
- **Le firme classiche sono sempre etichettate** — i trasferimenti su reti esterne (ETH, BNB, Solana, …) non possono trasportare una firma post-quantistica; QoreX ti fa spuntare una presa d'atto esplicita e li contrassegna come classici invece di effettuare un downgrade silenzioso.

**Cosa significa questo per la dimensione delle transazioni.** ML-DSA-87 è una firma grande: la firma è di **4.627 byte** e la chiave pubblica di **2.592 byte** (fissate da FIPS-204). Una transazione QoreChain ibrida è quindi di diversi kilobyte più grande di una puramente classica. Se costruisci e trasmetti transazioni tu stesso, dimensiona i tuoi buffer e le stime delle commissioni per i byte aggiuntivi; il gas accounting di QoreChain già li prevede. Vedi [Firma Post-Quantistica](/developer-guide/post-quantum-signing) per i primitivi e il requisito di firma deterministica.
