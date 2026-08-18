---
slug: /qorex/browser-extension
title: Estensione per browser QoreX
sidebar_label: Estensione per browser
sidebar_position: 2
---

# Estensione per browser QoreX

L'**estensione per browser** QoreX è il wallet QoreChain per desktop. È un **wallet autonomo** — crea o importa un wallet, custodisci e invia QOR, connettiti alle dApp — ed è il componente che permette a qualunque sito di rilevare QoreX e di trasformare ogni richiesta in un'approvazione esplicita e decodificata.

È **pubblica e disponibile** su tre store.

## Installazione {#install}

| Browser | Installazione |
|---|---|
| **Chrome e browser Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 o successivo)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Quale versione è attiva e dove {#versions}

Le revisioni degli store avvengono in momenti diversi, quindi al momento la versione pubblicata varia da browser a browser:

| Browser | Versione pubblicata |
|---|---|
| **Firefox** | **0.1.5** |
| **Chrome / Chromium** | **0.1.3** (0.1.5 inviata, in revisione) |
| **Safari (macOS)** | distribuita all'interno dell'app macOS **QoreX Wallet**, che usa una propria numerazione `1.x` — al momento il Mac App Store serve la **1.0**; la build che contiene l'estensione 0.1.5 è in revisione |

La **0.1.5** aggiunge il [rilevamento tramite Solana Wallet Standard](#standards), lo [sblocco con passkey](#security), una [corsia dApp SVM](#standards) pienamente implementata e il [ponte di connessione con la Dashboard](#dashboard-bridge). (La versione 0.1.4 non è mai stata pubblicata — le sue modifiche arrivano agli utenti con la 0.1.5.)

**La superficie dei permessi è identica nella 0.1.3 e nella 0.1.5** — vedi [Quali permessi chiede QoreX](#permissions).

:::note
Su Safari le approvazioni si aprono in una scheda del browser anziché in una finestra popup — l'estensione è impacchettata con il wrapper Apple per estensioni web Safari a partire dalla stessa base di codice.
:::

## Creare o ripristinare un wallet {#wallet}

Apri il popup e scegli:

- **Crea wallet** — genera sul tuo dispositivo una nuova frase di recupero di 24 parole (256 bit di entropia), deriva la tua identità QoreChain e la sigilla nel vault protetto da una password (e, facoltativamente, da una passkey — vedi [Sicurezza](#security)).
- **Importa wallet** — ripristina da una frase di 24 parole già esistente.

L'estensione custodisce le proprie chiavi; non richiede l'app mobile. Puoi anche esportare la tua frase mnemonica dal popup. Le chiavi non lasciano mai il dispositivo.

### Inviare su reti esterne {#send-external}

Oltre a QOR sulla corsia Native, il popup può inviare asset su reti esterne, tutte derivate dalla stessa frase di recupero:

| Tipo | Reti | Token inclusi |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum | voci ERC-20 (USDT, USDC, DAI dove applicabile) |
| SVM | Solana | voci SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | voce IBC (USDC su Osmosis); campo memo facoltativo |

Prima che un trasferimento esterno venga inviato devi spuntare una presa d'atto esplicita: **"Le reti esterne accettano solo firme classiche — a differenza dei tuoi QOR, questo trasferimento NON è quantum-safe."** Le chain esterne non possono trasportare una firma post-quantistica, e QoreX non lo nasconde mai.

## Standard di wallet supportati {#standards}

QoreX espone tre interfacce, tutte iniettate nella pagina come `window.qorex` (`{ evm, native, svm }`) e rilevabili tramite i contratti di detection di [`@qorechain/connect`](/sdk/overview).

| Standard | Che cos'è | Che cosa significa per te che sviluppi |
|---|---|---|
| **EIP-1193** | L'API JavaScript del provider Ethereum (`request(...)`, eventi). | Il tuo codice ethers.js / viem / web3.js già esistente dialoga con la corsia EVM di QoreX senza modifiche; i codici di errore numerici (per es. `4902`) vengono inoltrati alla lettera. |
| **EIP-6963** | Rilevamento di provider multi-wallet (eventi announce / request). | QoreX si annuncia accanto a ogni altro wallet — **non sovrascrive mai `window.ethereum`** — così l'utente sceglie QoreX sito per sito senza conflitti. |
| **`signDirect` in stile Keplr** | Un provider con la forma di un `OfflineDirectSigner` Cosmos su `window.qorex.native`. | Le dApp in stile Cosmos firmano le transazioni della **corsia Native** di QoreChain esattamente come farebbero con Keplr; il livello post-quantistico è già applicato (vedi [Firma post-quantistica](#pqc)). |
| **Solana Wallet Standard** *(dalla 0.1.5)* | Rilevamento nativo del wallet per le dApp Solana (`wallet-standard:register-wallet` / `app-ready`). | Le dApp Solana **rilevano QoreX automaticamente** — nessuna integrazione personalizzata. Funzionalità: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; chain `solana:mainnet`; transazioni sia `legacy` sia `v0`. |

:::note Raggiungere direttamente la corsia SVM
La stessa interfaccia è disponibile anche su `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Il rilevamento automatico Wallet-Standard e la corsia SVM pienamente implementata arrivano con la **0.1.5** — quindi oggi sono disponibili su **Firefox**, e su Chrome non appena la 0.1.5 supererà la revisione (vedi [quale versione è attiva e dove](#versions)).

Le approvazioni Solana mostrano il payload decodificato (destinatario e lamports per i trasferimenti System, e l'elenco dei programmi), rifiutano le transazioni che non indicano il tuo wallet come firmatario e contrassegnano la firma come **classica** — vedi [Firma post-quantistica](#pqc).
:::

## Sicurezza e permessi {#security}

QoreX è costruito per essere verificabile, non semplicemente per essere creduto sulla parola:

- **Vault** — le tue chiavi sono sigillate con **AES-256-GCM**. Il percorso con password deriva la propria chiave con **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), così un blob del vault esfiltrato resiste al cracking con GPU/ASIC. (I vecchi blob PBKDF2 restano apribili e vengono risigillati con Argon2id al primo sblocco successivo.)
- **Sblocco con passkey (facoltativo, dalla 0.1.5)** — dove il tuo autenticatore supporta l'estensione **WebAuthn PRF**, QoreX può sbloccare il vault a partire dall'output PRF di 32 byte della passkey anziché da una password digitata. La tua password resta sempre disponibile come riserva.

  :::note Dove compare lo sblocco con passkey
  QoreX rileva le funzionalità WebAuthn e mostra **Abilita sblocco con passkey** solo dove il browser le espone alle pagine dell'estensione — cioè su **Chrome ed Edge**. Su **Firefox** l'opzione è nascosta, perché Firefox non espone WebAuthn alle pagine delle estensioni. Combinato con il [disallineamento di versione](#versions), questo significa che oggi un utente Firefox ha Wallet Standard ma non lo sblocco con passkey, mentre un utente Chrome non ha né l'uno né l'altro finché la 0.1.5 non supererà la revisione. È il comportamento previsto, non un bug.
  :::
- **Manifest V3 + CSP rigorosa** — `script-src 'self'; object-src 'self'; base-uri 'self'`. **Non viene caricato alcun codice remoto** dopo l'installazione e non è presente `wasm-unsafe-eval`.
- **Nessun account, nessuna telemetria** — niente analytics, niente tracciamento, niente logging remoto, niente registrazione e niente email. La scheda su Firefox dichiara la raccolta dati come `none`.

### Quali permessi chiede QoreX, e perché {#permissions}

Questa sezione esiste perché la scheda su Firefox mostra il permesso **"Accedere ai tuoi dati per tutti i siti web"**, che può sembrare in contrasto con un wallet che non dichiara alcun permesso host. Ecco la verità esatta e non ritoccata, presa dal manifest.

Il file `manifest.json` dell'estensione dichiara:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — l'unico permesso di API. Memorizza il vault cifrato e le tue approvazioni di connessione per singola origine **in locale**, nello storage dell'estensione.
- **`host_permissions: []`** — QoreX **non** dichiara alcun permesso host. Non richiede la possibilità di effettuare richieste di rete cross-origin verso siti arbitrari per tuo conto.
- **`content_scripts` con corrispondenza `<all_urls>`** — è questa la ragione onesta per cui Firefox dice *"Accedere ai tuoi dati per tutti i siti web."* QoreX inietta un piccolo script provider (`content.js` → `inpage.js`) in **ogni pagina**. Uno script di contenuto che gira su tutti i siti *può* tecnicamente leggere la pagina, e i browser descrivono questa capacità proprio con quella formulazione — che derivi da `host_permissions` o da una corrispondenza di uno script di contenuto.

**Perché lo script di contenuto gira ovunque.** Perché **qualunque** dApp possa rilevare il wallet tramite EIP-6963 senza che tu debba prima concedere l'accesso sito per sito. È così che funzionano MetaMask, Keplr, Phantom e ogni altro wallet iniettato: il provider iniettato deve essere presente prima che vengano eseguiti gli script della pagina (`document_start`), su qualunque sito tu visiti.

**Che cosa fa quello script — e che cosa non fa.** Si limita a fare da ponte per i messaggi del wallet (annunciare il provider, inoltrare le richieste di connessione/firma al service worker, restituire il risultato). **Non** legge il contenuto della pagina oltre a quelle richieste del wallet, non invia nulla a un server e non carica codice remoto — e non può recuperare dati cross-origin arbitrari perché non ci sono permessi host. Tutto questo è verificabile: l'estensione è vincolata dalla CSP, non include analytics e il pacchetto per Firefox comprende uno zip dei sorgenti riproducibile.

## Connettere una dApp a QoreX {#connect}

Una dApp rileva la corsia EVM di QoreX tramite **EIP-6963**. Announce-and-request, poi si usa il provider EIP-1193 restituito:

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

Per la corsia **Native** di QoreChain, usa il provider in stile Keplr disponibile su `window.qorex.native` (`enable`, `getKey`, `signDirect`). Il pacchetto di più alto livello [`@qorechain/connect`](/sdk/overview) incapsula questo rilevamento al posto tuo.

Le approvazioni sono **per singola origine**: la prima connessione a un sito apre un popup di approvazione che mostra l'origine, l'approvazione rivela soltanto il tuo indirizzo pubblico e l'approvazione di un sito non concede nulla a un altro.

### Ponte con la Dashboard (v0.1.5) {#dashboard-bridge}

La versione 0.1.5 aggiunge un ponte limitato **esclusivamente a `dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prova di pairing *Connect with QoreX* (il backend riverifica la firma), mentre `executeTransfer({ to, amountUqor, memo })` approva e trasmette un trasferimento di QOR proposto dalla Dashboard, restituendo il `txHash`. Questi metodi vengono rifiutati su qualsiasi altra origine.

## Firma post-quantistica {#pqc}

Ogni trasferimento di QOR avviato da QoreX stesso è firmato con una **firma ibrida post-quantistica** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) accanto alla firma classica secp256k1 — usando l'intera pipeline ibrida di `@qorechain/sdk`. **Non esiste alcun interruttore**: QoreChain la richiede e QoreX non invia mai un trasferimento di QOR sulla corsia Native senza di essa.

- **Firma Native avviata da una dApp** — le dApp costruite sul flusso qorechain-connect applicano in anticipo l'estensione PQC (`/qorechain.pqc.v1.PQCHybridSignature`) nel corpo della transazione prima di chiamare `signDirect`; QoreX contribuisce con la metà classica e **rifiuta di firmare alla cieca**, decodificando il payload e segnalando se il livello PQC è presente.
- **Le richieste classiche sono sempre etichettate** — se una richiesta non porta con sé un livello PQC, oppure ha come destinazione una chain esterna (ETH/BNB/ecc., che non possono trasportare PQC), QoreX mostra un avviso esplicito invece di effettuare un declassamento silenzioso.

**Che cosa significa per la dimensione delle transazioni.** ML-DSA-87 produce una firma di grandi dimensioni: la firma occupa **4,627 byte** e la chiave pubblica **2,592 byte** (valori fissati da FIPS-204). Una transazione QoreChain ibrida è quindi più grande di diversi kilobyte rispetto a una puramente classica. Se costruisci e trasmetti transazioni per conto tuo, dimensiona i buffer e le stime delle commissioni tenendo conto dei byte aggiuntivi; la contabilizzazione del gas di QoreChain li mette già in conto. Vedi [Firma post-quantistica](/developer-guide/post-quantum-signing) per le primitive e il requisito di firma deterministica.
