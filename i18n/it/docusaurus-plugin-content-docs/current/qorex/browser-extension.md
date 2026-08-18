---
slug: /qorex/browser-extension
title: Estensione per browser QoreX
sidebar_label: Estensione per browser
sidebar_position: 2
---

# Estensione per browser QoreX

L'**estensione per browser** QoreX è il wallet QoreChain per desktop. È un **wallet autonomo** — crea o importa un wallet, conserva e invia QOR, e connettiti alle dApp — ed è il componente che permette a qualsiasi sito web di individuare QoreX e trasformare ogni richiesta in un'approvazione esplicita e decodificata.

È **attiva e pubblica** su tre store.

## Installazione {#install}

| Browser | Installazione |
|---|---|
| **Chrome e browser Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 10.14 o successivo)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

La build pubblica attuale è la **0.1.3**. La versione **0.1.5** è in fase di distribuzione ora; aggiunge il [bridge di connessione alla Dashboard](#dashboard-bridge). La superficie dei permessi resta invariata tra queste versioni.

:::note
Su Safari, le approvazioni si aprono in una scheda del browser anziché in una finestra popup — l'estensione è impacchettata con il wrapper per web-extension di Safari di Apple a partire dalla stessa base di codice.
:::

## Crea o ripristina un wallet {#wallet}

Apri il popup e scegli:

- **Crea wallet** — genera una nuova frase di recupero di 24 parole sul tuo dispositivo (entropia a 256 bit), deriva la tua identità QoreChain e la sigilla nel vault sotto una password (e, facoltativamente, una passkey — vedi [Sicurezza](#security)).
- **Importa wallet** — ripristina da una frase esistente di 24 parole.

L'estensione conserva le proprie chiavi; non richiede l'app mobile. Puoi anche esportare la tua mnemonica dal popup. Le chiavi non lasciano mai il dispositivo.

## Standard di wallet supportati {#standards}

QoreX espone tre interfacce, tutte iniettate nella pagina come `window.qorex` (`{ evm, native, svm }`) e individuate tramite i contratti di rilevamento di [`@qorechain/connect`](/sdk/overview).

| Standard | Che cos'è | Cosa significa per te come sviluppatore |
|---|---|---|
| **EIP-1193** | L'API JavaScript del provider Ethereum (`request(...)`, eventi). | Il tuo codice ethers.js / viem / web3.js esistente comunica con la lane EVM di QoreX senza modifiche; i codici di errore numerici (ad es. `4902`) vengono inoltrati identici. |
| **EIP-6963** | Rilevamento provider multi-wallet (eventi announce / request). | QoreX si annuncia accanto a ogni altro wallet — **non sovrascrive mai `window.ethereum`** — così l'utente sceglie QoreX per ogni sito senza conflitti. |
| **`signDirect` in stile Keplr** | Un provider a forma di `OfflineDirectSigner` di tipo Cosmos su `window.qorex.native`. | Le dApp in stile Cosmos firmano le transazioni della **lane Native** di QoreChain nello stesso modo in cui farebbero con Keplr; lo strato post-quantistico è pre-applicato (vedi [Firma post-quantistica](#pqc)). |

:::note SVM (compatibile con Solana)
Un provider SVM è esposto su `window.qorex.svm` con `connect` / `signAndSendTransaction` / `signMessage`. QoreX **non** si registra ancora tramite il protocollo di rilevamento **Wallet Standard** di Solana, quindi le dApp Solana che si basano sull'auto-rilevamento Wallet-Standard non rileveranno QoreX automaticamente — per ora raggiungilo direttamente tramite `window.qorex.svm`.
:::

## Sicurezza e permessi {#security}

QoreX è costruito per essere verificabile, non solo affidabile:

- **Vault** — le tue chiavi sono sigillate con **AES-256-GCM**. Il percorso con password deriva la sua chiave con **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), così un blob del vault esfiltrato resiste al cracking tramite GPU/ASIC. (I blob PBKDF2 legacy restano apribili e vengono risigillati ad Argon2id al successivo sblocco.)
- **Sblocco con passkey (facoltativo)** — dove il tuo autenticatore supporta l'estensione **WebAuthn PRF**, QoreX può sbloccare il vault dall'output PRF di 32 byte della passkey anziché da una password digitata.
- **Manifest V3 + CSP rigorosa** — `script-src 'self'; object-src 'self'; base-uri 'self'`. **Non** c'è alcun caricamento di codice remoto dopo l'installazione e nessun `wasm-unsafe-eval`.
- **Nessun account, nessuna telemetria** — nessuna analisi, nessun tracciamento, nessun logging remoto, nessuna registrazione e nessuna email. La scheda su Firefox dichiara la raccolta dati come `none`.

### Quali permessi richiede QoreX, e perché {#permissions}

Questa sezione esiste perché la scheda su Firefox espone il permesso **"Accesso ai tuoi dati per tutti i siti web"**, che può sembrare in contrasto con un wallet che non dichiara alcun permesso host. Ecco la verità esatta e non modificata dal manifest.

Il `manifest.json` dell'estensione dichiara:

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
]
```

- **`permissions: ["storage"]`** — l'unico permesso API. Memorizza il vault cifrato e le tue approvazioni di connessione per-origine **localmente**, nell'archivio dell'estensione.
- **`host_permissions: []`** — QoreX **non** dichiara alcun permesso host. Non richiede la capacità di effettuare richieste di rete cross-origine verso siti arbitrari per tuo conto.
- **`content_scripts` corrisponde a `<all_urls>`** — questo è il motivo onesto per cui Firefox dice *"Accesso ai tuoi dati per tutti i siti web."* QoreX inietta un piccolo script provider (`content.js` → `inpage.js`) in **ogni pagina**. Uno script di contenuto che gira su tutti i siti *può* tecnicamente leggere la pagina, e i browser descrivono quella capacità con quell'esatta formulazione — che provenga da `host_permissions` o da una corrispondenza di content-script.

**Perché lo script di contenuto gira ovunque.** Affinché **qualsiasi** dApp possa individuare il wallet tramite EIP-6963 senza che tu debba prima concedere l'accesso per sito. È così che funzionano MetaMask, Keplr, Phantom e ogni altro wallet iniettato: il provider iniettato deve essere presente prima che vengano eseguiti gli script della pagina (`document_start`), su qualunque sito visiti.

**Cosa fa quello script — e cosa non fa.** Fa solo da ponte per i messaggi del wallet (annunciare il provider, inoltrare le richieste di connessione/firma al service worker, restituire il risultato). **Non** legge il contenuto della pagina oltre a quelle richieste del wallet, non invia nulla a un server, né carica codice remoto — e non può recuperare dati cross-origine arbitrari perché non ci sono permessi host. Tutto ciò è verificabile: l'estensione è bloccata da CSP, non spedisce alcuna analisi e il pacchetto Firefox include uno zip del codice sorgente riproducibile.

## Connetti una dApp a QoreX {#connect}

Una dApp individua la lane EVM di QoreX tramite **EIP-6963**. Announce-and-request, poi usa il provider EIP-1193 restituito:

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

Per la lane **Native** di QoreChain, usa il provider in stile Keplr su `window.qorex.native` (`enable`, `getKey`, `signDirect`). Il pacchetto di livello superiore [`@qorechain/connect`](/sdk/overview) racchiude questo rilevamento per te.

Le approvazioni sono **per-origine**: la prima connessione a un sito apre un popup di approvazione che mostra l'origine, l'approvazione rivela solo il tuo indirizzo pubblico e l'approvazione di un sito non concede nulla a un altro.

### Bridge della Dashboard (v0.1.5) {#dashboard-bridge}

La versione 0.1.5 aggiunge un bridge circoscritto **solo a `dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` firma la prova di accoppiamento *Connect with QoreX* (il backend riverifica la firma), e `executeTransfer({ to, amountUqor, memo })` approva e trasmette un trasferimento QOR proposto dalla Dashboard, restituendo il `txHash`. Questi metodi vengono rifiutati su qualsiasi altra origine.

## Firma post-quantistica {#pqc}

Ogni trasferimento QOR che QoreX stesso avvia è firmato con una **firma post-quantistica ibrida** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) insieme alla classica firma secp256k1 — usando l'intera pipeline ibrida in `@qorechain/sdk`. **Non c'è alcun interruttore**: QoreChain la richiede e QoreX non invia mai un trasferimento QOR della lane Native senza di essa.

- **Firma Native avviata da dApp** — le dApp costruite sul flusso qorechain-connect pre-inseriscono l'estensione PQC (`/qorechain.pqc.v1.PQCHybridSignature`) nel corpo della transazione prima di chiamare `signDirect`; QoreX contribuisce con la metà classica e **rifiuta di firmare alla cieca**, decodificando il payload e segnalando se lo strato PQC è presente.
- **Le richieste classiche sono sempre etichettate** — se una richiesta non porta alcuno strato PQC, o punta a una catena esterna (ETH/BNB/ecc., che non possono trasportare PQC), QoreX mostra un avviso esplicito anziché declassare silenziosamente.

**Cosa significa questo per la dimensione della transazione.** ML-DSA-87 è una firma di grandi dimensioni: la firma è di **4,627 bytes** e la chiave pubblica di **2,592 bytes** (fissate da FIPS-204). Una transazione QoreChain ibrida è quindi di diversi kilobyte più grande di una puramente classica. Se costruisci e trasmetti transazioni per conto tuo, dimensiona i tuoi buffer e le stime di commissione per i byte aggiuntivi; la contabilità del gas di QoreChain li prevede già. Vedi [Firma post-quantistica](/developer-guide/post-quantum-signing) per le primitive e il requisito di firma deterministica.
