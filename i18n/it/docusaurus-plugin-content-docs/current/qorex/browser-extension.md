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
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 o successivo)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Quale versione è live dove {#versions}

Le revisioni degli store arrivano in momenti diversi, quindi la versione pubblicata attualmente differisce per browser:

| Browser | Versione pubblicata |
|---|---|
| **Firefox** | **0.2.2** |
| **Chrome / Chromium** | **0.1.5** (0.1.9 inviata, ancora in revisione; la scheda è bloccata a nuovi invii finché quella revisione non si conclude, quindi la 0.2.2 non è ancora stata inviata lì) |
| **Safari (macOS)** | è distribuita all'interno dell'app macOS **QoreX Wallet**, che usa una propria numerazione `1.x` — il Mac App Store attualmente serve **1.3** (include l'estensione **0.2.2**) |

Le funzionalità più recenti potrebbero non essere ancora live nel tuo browser — controlla la tabella sopra prima di assumere che qualcosa descritto qui sia disponibile. Se la Dashboard ti dice che la tua estensione deve essere aggiornata, significa che quell'azione richiede una versione minima specifica (di solito la 0.2.2, per lo staking) — non che la tua build sia in generale vecchia.

**0.1.5** ha aggiunto il [rilevamento Solana Wallet Standard](#standards), lo [sblocco con passkey](#security), una [lane dApp SVM](#standards) completamente implementata e il [bridge di connessione con la Dashboard](#dashboard-bridge). (La versione 0.1.4 non è mai stata pubblicata — le sue modifiche raggiungono gli utenti con la 0.1.5.)

**0.1.6–0.1.9** hanno aggiunto, in ordine: invii con gestione del vesting che rifiutano onestamente quando i fondi non sono disponibili; l'indirizzo dell'account e il saldo in tempo reale mostrati direttamente nella schermata principale del popup; e, nella **0.1.9**, il [pagamento di un @handle](#handle-send) direttamente dalla schermata Invia, una [schermata Ricevi con codice QR dell'indirizzo](#receive), un [selettore di lingua](#language) (dieci lingue, in linea con il set dell'app mobile) e la rimozione di una confusa "prossima data di sblocco" dal [saldo in vesting](#vesting).

**0.2.2** ha aggiunto [lo staking, direttamente dall'estensione](#stake) — una propria schermata Stake (validatori con commissione, il tuo totale in staking, le ricompense in attesa, e delega / unstake / riscossione); [più account da un'unica recovery phrase](#wallet), come nell'app mobile; la correzione che permette al pulsante di staking della **Dashboard** di raggiungere davvero l'estensione (un wallet creato solo nell'estensione in precedenza non poteva fare staking tramite la Dashboard — vedi [Bridge con la Dashboard](#dashboard-bridge)); la rivendicazione funzionante di @handle dal browser; e il numero di build mostrato in fondo al popup.

**La superficie dei permessi non è cambiata dalla 0.1.3** — vedi [Quali permessi richiede QoreX](#permissions).

:::note
Su Safari, le approvazioni si aprono in una scheda del browser anziché in una finestra popup — l'estensione è confezionata con il wrapper web-extension di Safari di Apple, a partire dalla stessa base di codice.
:::

## Crea o ripristina un wallet {#wallet}

Apri il popup e scegli:

- **Crea wallet** — genera una nuova recovery phrase di 24 parole sul tuo dispositivo (entropia a 256 bit), deriva la tua identità QoreChain e la sigilla nel vault sotto una password (e, opzionalmente, una passkey — vedi [Sicurezza](#security)).
- **Importa wallet** — ripristina da una recovery phrase di 24 parole esistente.

L'estensione conserva le proprie chiavi; non richiede l'app mobile. Puoi anche esportare la tua mnemonic dal popup. Le chiavi non lasciano mai il dispositivo.

:::note Più account da un'unica phrase (dalla 0.2.2)
L'estensione può ora creare e alternare tra più account dalla stessa recovery phrase, come nell'app mobile — la phrase che hai già annotato ripristina ognuno di essi. Il cambio account sposta tutto con sé: invio, staking, ricezione e il tuo @handle seguono tutti l'account attivo in quel momento. Portfolio, Q-Day Scanner, recovery sociale, Legacy Protocol, richieste di pagamento e collegamento dei dispositivi restano esclusivi dell'app mobile — vedi [QoreX Wallet](/qorex/overview#platform-availability) per il confronto completo.
:::

## Il tuo account, saldo e @handle {#account}

La schermata principale del popup mostra il tuo indirizzo `qor1…` (tocca per copiare) e il tuo saldo QOR in tempo reale, così non devi aprire un block explorer per verificare nessuno dei due.

### Saldi in vesting (bloccati) {#vesting}

Se il tuo account detiene QOR in vesting (ad esempio un'allocazione TGE non ancora rilasciata), il saldo si divide in **disponibile ora** e **ancora bloccato**, e un invio che supera l'importo disponibile viene rifiutato prima di raggiungere la rete, invece di fallire on-chain dopo aver comunque pagato una commissione. QoreX deliberatamente **non** mostra una "prossima data di sblocco" qui: una vesting schedule può essere modificata dalla governance, quindi una data sulla scheda del saldo si leggerebbe come una promessa che QoreX non può garantire. La divisione disponibile-vs-bloccato è ciò che rimane accurato.

### Rivendica un @handle

Dal popup puoi rivendicare un **@handle** unico (ad esempio `@liviu`) per l'indirizzo di questo account, allo stesso modo dell'app mobile. La rivendicazione viene firmata con la chiave dell'account e si lega a quell'indirizzo, così l'app mobile e la Dashboard possono risolverlo quando qualcuno ti invia fondi. Vedi [@handle](/qorex/account-and-dashboard#handle) per come gli handle sono legati agli indirizzi (non a un wallet nel suo insieme).

## Invia a un @handle {#handle-send}

Dalla 0.1.9 puoi pagare un @handle registrato direttamente, invece di cercare un indirizzo:

1. Apri il popup e tocca **Invia**.
2. Nel campo destinatario, digita `@` seguito dall'handle (ad esempio `@liviu`) invece di un indirizzo `qor1…`.
3. QoreX risolve l'handle e ti mostra l'**indirizzo risolto** prima che tu firmi qualsiasi cosa — controlla sempre che corrisponda a ciò che ti aspetti.
4. Inserisci l'importo e conferma.

La risoluzione viene verificata in due modi prima che QoreX la utilizzi: un'attestazione del registry controllata rispetto a una trust key integrata nell'estensione, e la firma del proprietario dell'handle sulla rivendicazione stessa. Una risposta che fallisce uno dei due controlli viene rifiutata del tutto — QoreX non ripiega mai sulla visualizzazione di un indirizzo non verificato. La prima volta che paghi un determinato handle, QoreX ricorda (fissa) l'indirizzo a cui si è risolto; se in seguito quell'handle si risolve a un indirizzo **diverso**, QoreX si ferma e ti mostra sia il vecchio che il nuovo indirizzo per intero, così puoi decidere se procedere. Questa memoria vive **per browser** — pagare lo stesso handle per la prima volta da un browser o computer diverso lo mostra come nuovo anche lì. È previsto, non un errore.

## Ricevi {#receive}

Tocca **Ricevi** nel popup per mostrare il tuo indirizzo `qor1…` come codice QR (con l'icona QoreChain incorporata) accanto a un pulsante di copia — scansionalo da un telefono o incolla direttamente l'indirizzo.

## Stake dall'estensione {#stake}

Dalla **0.2.2**, il popup ha una propria schermata **Stake** — un wallet creato solo nell'estensione non ha più bisogno dell'app mobile per guadagnare ricompense di staking.

1. Apri il popup e vai su **Stake**.
2. La schermata elenca i validatori attivi con la loro commissione, il tuo totale attualmente in staking e le ricompense in attesa di riscossione. I validatori che la rete ha messo in **jail** sono esclusi dall'elenco — delegare a uno di essi non è mai ciò che vuoi.
3. Per delegare, scegli un validatore e un importo, poi conferma. QoreX firma con la firma ibrida post-quantistica obbligatoria, allo stesso modo di un Invio.
4. **Unstake** e **riscossione** funzionano dalla stessa schermata. L'unstake avvia il periodo di unbonding di 21 giorni — vedi [Staking e Delega](/user-guide/staking-and-delegation) per cosa significa.

Lo staking, la delega e le ricompense avvengono esclusivamente sulla lane **Nativa**, mai tramite un precompile EVM.

### Approvare una richiesta di staking dalla Dashboard {#stake-dashboard}

La [Dashboard](/dashboard/staking-and-validators) di QoreChain compone le richieste di staking ma non può firmarle — la tua chiave non lascia mai il vault dell'estensione. Quando clicchi **Continua in QoreX** sulla Dashboard, la richiesta si apre nell'estensione perché tu la esamini (validatore e importo) e la approvi, esattamente come un Invio. Questa connessione si era rotta nella 0.2.1 (l'estensione si segnalava come "troppo vecchia" anche quando era la build pubblicata più recente — il problema reale era un passaggio interno mancante, non una versione obsoleta); è stata corretta a partire dalla **0.2.2**. Se usi una build più vecchia, vedi [quale versione è live dove](#versions).

:::note Se una transazione viene mostrata come "downgraded" invece che riuscita
La Dashboard a volte mostra una transazione come **downgraded** invece di un successo netto. Significa che i tuoi fondi si sono spostati, ma il layer di firma post-quantistica non è stato trovato on-chain per quella transazione — non è qualcosa che hai fatto tu di sbagliato e non è qualcosa che puoi risolvere dal tuo lato. È un difetto dal nostro lato; ti preghiamo di segnalarlo al supporto così possiamo indagare. Il messaggio resta a schermo deliberatamente invece di sparire, così hai il tempo di leggerlo e segnalarlo.
:::

### Invio su reti esterne {#send-external}

Oltre a QOR sulla lane Nativa, il popup può inviare asset su reti esterne, tutte derivate dalla stessa recovery phrase:

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
| **EIP-1193** | La JavaScript API del provider Ethereum (`request(...)`, eventi). | Il tuo codice ethers.js / viem / web3.js esistente comunica con la lane EVM di QoreX senza modifiche; i codici di errore numerici (es. `4902`) vengono inoltrati testualmente. |
| **EIP-6963** | Rilevamento multi-wallet dei provider (eventi announce / request). | QoreX si annuncia insieme a ogni altro wallet — **non sovrascrive mai `window.ethereum`** — così l'utente sceglie QoreX per ogni sito senza conflitti. |
| **`signDirect` in stile Keplr** | Un provider a forma di `OfflineDirectSigner` Cosmos su `window.qorex.native`. | Le dApp in stile Cosmos firmano le transazioni della lane **Nativa** di QoreChain nello stesso modo in cui lo farebbero con Keplr; il layer post-quantistico è pre-applicato (vedi [Firma post-quantistica](#pqc)). |
| **Solana Wallet Standard** *(dalla 0.1.5)* | Rilevamento wallet nativo per le dApp Solana (`wallet-standard:register-wallet` / `app-ready`). | Le dApp Solana **rilevano automaticamente QoreX** — nessuna integrazione personalizzata. Funzionalità: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; chain `solana:mainnet`; transazioni sia `legacy` che `v0`. |

:::note Raggiungere direttamente la lane SVM
La stessa interfaccia è disponibile anche su `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Il rilevamento automatico Wallet-Standard e la lane SVM completamente implementata sono stati rilasciati nella **0.1.5** e sono live sia su Chrome che su Firefox (vedi [quale versione è live dove](#versions)).

Le approvazioni Solana mostrano il payload decodificato (destinatario e lamport per i trasferimenti System, e l'elenco dei programmi), rifiutano le transazioni che non elencano il tuo wallet come firmatario, e contrassegnano la firma come **classica** — vedi [Firma post-quantistica](#pqc).
:::

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
]
```

- **`permissions: ["storage"]`** — l'unico permesso API. Memorizza il vault cifrato e le tue approvazioni di connessione per-origine **localmente**, nello storage dell'estensione.
- **`host_permissions: []`** — QoreX non dichiara **nessun** host permission. Non richiede la capacità di effettuare richieste di rete cross-origin verso siti arbitrari per tuo conto.
- **`content_scripts` con match `<all_urls>`** — questa è la ragione onesta per cui Firefox dice *"Accedere ai tuoi dati per tutti i siti web."* QoreX inietta un piccolo script provider (`content.js` → `inpage.js`) in **ogni pagina**. Un content script che gira su tutti i siti *può* tecnicamente leggere la pagina, e i browser descrivono questa capacità con quella dicitura esatta — che provenga da `host_permissions` o da un match di content script.

**Perché il content script gira ovunque.** Affinché **qualsiasi** dApp possa rilevare il wallet tramite EIP-6963 senza che tu debba prima concedere l'accesso per-sito. È così che funzionano MetaMask, Keplr, Phantom e ogni altro wallet iniettato: il provider iniettato deve essere presente prima che gli script della pagina vengano eseguiti (`document_start`), su qualsiasi sito tu visiti.

**Cosa fa quello script — e cosa non fa.** Fa solo da ponte per i messaggi del wallet (annuncia il provider, inoltra le richieste di connessione/firma al service worker, restituisce il risultato). Non legge il contenuto della pagina oltre a quelle richieste del wallet, non invia nulla a un server, né carica codice remoto — e non può recuperare dati arbitrari cross-origin perché non ci sono host permission. Tutto questo è verificabile: l'estensione è bloccata da CSP, non include analytics, e il pacchetto di Firefox include uno zip sorgente riproducibile.

## Connettere una dApp a QoreX {#connect}

Una dApp rileva la lane EVM di QoreX tramite **EIP-6963**. Announce-and-request, poi usa il provider EIP-1193 restituito:

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

Per la lane **Nativa** di QoreChain, usa il provider in stile Keplr su `window.qorex.native` (`enable`, `getKey`, `signDirect`). Il pacchetto di livello superiore [`@qorechain/connect`](/sdk/overview) racchiude questo rilevamento per te.

Le approvazioni sono **per-origine**: la prima connessione a un sito apre un popup di approvazione che mostra l'origine, l'approvazione rivela solo il tuo indirizzo pubblico, e l'approvazione di un sito non concede nulla a un altro.

### Bridge con la Dashboard (v0.1.5, esteso nella v0.2.2) {#dashboard-bridge}

La versione 0.1.5 aggiunge un bridge limitato esclusivamente a **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prova di pairing *Connect with QoreX* (il backend riverifica la firma), e `executeTransfer({ to, amountUqor, memo })` approva e trasmette un trasferimento QOR proposto dalla Dashboard, restituendo il `txHash`. Questi metodi vengono rifiutati su qualsiasi altra origine.

La **0.2.2** aggiunge `native:executeRequest`, che accetta un'intera richiesta proposta dalla Dashboard — incluso lo [staking](#stake-dashboard) — validata rispetto allo stesso parser condiviso che QoreX usa ovunque: viene rifiutata in caso di rete non corrispondente, origine estranea, indirizzo che non è il tuo, tipo di richiesta sconosciuto, oppure una richiesta di staking che porta un `toAddress` (le richieste di staking non ne hanno uno).

Poiché un indirizzo `qor1…` è ugualmente valido su mainnet e su testnet, una richiesta proposta dalla Dashboard indica quale rete ha come target, e QoreX rifiuta di agire su di essa se questa non corrisponde alla rete a cui l'estensione è attualmente connessa — non passerà mai da una rete all'altra per conto di una richiesta.

## Firma post-quantistica {#pqc}

Ogni trasferimento QOR che QoreX stessa avvia viene firmato con una **firma ibrida post-quantistica** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) insieme alla firma classica secp256k1 — usando la pipeline ibrida completa in `@qorechain/sdk`. **Non c'è alcun interruttore**: QoreChain la richiede e QoreX non invia mai un trasferimento QOR sulla lane Nativa senza di essa.

- **Firma Nativa avviata da una dApp** — le dApp costruite sul flusso qorechain-connect pre-inseriscono l'estensione PQC (`/qorechain.pqc.v1.PQCHybridSignature`) nel corpo della transazione prima di chiamare `signDirect`; QoreX contribuisce la metà classica e **rifiuta di firmare alla cieca**, decodificando il payload e segnalando se il layer PQC è presente.
- **Le richieste classiche sono sempre etichettate** — se una richiesta non porta alcun layer PQC, o ha come target una chain esterna (ETH/BNB/ecc., che non può trasportare PQC), QoreX mostra un avviso esplicito invece di effettuare un downgrade silenzioso.

**Cosa significa questo per la dimensione delle transazioni.** ML-DSA-87 è una firma grande: la firma è di **4.627 byte** e la chiave pubblica di **2.592 byte** (fissate da FIPS-204). Una transazione QoreChain ibrida è quindi di diversi kilobyte più grande di una puramente classica. Se costruisci e trasmetti transazioni tu stesso, dimensiona i tuoi buffer e le stime delle commissioni per i byte aggiuntivi; il gas accounting di QoreChain già li prevede. Vedi [Firma Post-Quantistica](/developer-guide/post-quantum-signing) per i primitivi e il requisito di firma deterministica.
