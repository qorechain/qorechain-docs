---
slug: /qorex/browser-extension
title: Estensione per browser
sidebar_label: Estensione per browser
sidebar_position: 8
---

# Estensione per browser

L'**estensione per browser** di QoreX (Chrome e Firefox; una versione Safari è in arrivo con funzionalità identiche) è il **connettore per dApp** per desktop. Permette ai siti web di rilevare il tuo wallet e trasforma ogni richiesta in un'approvazione esplicita. Si abbina concettualmente all'app mobile e **non** include funzioni di staking, portafoglio o account: queste vivono nell'app.

## Configurazione

L'estensione si abbina a un wallet creato nell'**app mobile QoreX**. Se apri il popup prima dell'abbinamento, mostra **"No wallet yet — create one in the QoreX app."**

## Sblocco

Il popup richiede la tua **password del vault** (oppure una passkey nei browser che supportano le chiavi derivate da passkey). Il vault è cifrato con AES-256-GCM nello storage dell'estensione, si blocca automaticamente e ogni sblocco è esplicito.

## Connessione alle dApp

I siti web rilevano QoreX tramite **EIP-6963** (lo standard multi-wallet) e il contratto di connessione di QoreChain. QoreX **non sovrascrive mai** `window.ethereum` o `window.keplr`: compare **accanto** agli altri wallet e sei tu a scegliere quale wallet usare per ciascun sito.

1. Un sito richiede una connessione; il popup di approvazione mostra l'**origine**.
2. L'approvazione rivela solo il tuo **indirizzo pubblico** a quell'origine.
3. Le approvazioni sono **per origine**, persistono tra i riavvii del browser e l'approvazione di un sito non concede nulla a un altro.

## Firma

Ogni richiesta di firma apre una finestra di approvazione che mostra il **payload decodificato** — destinatario, importo, rete — mai un hash nudo.

- Per le transazioni QoreChain sul lane Native, l'estensione segnala che la **dApp fornisce il livello post-quantum** (il wallet firma la metà classica — lo stesso schema usato dai wallet affermati).
- Se una richiesta è **solo classica**, il popup mostra un avviso esplicito: **"⚠ This request is a classical signature — the app did not add a quantum-safe layer."**
- **Reject** è sempre a un clic e le richieste scadono da sole.

## Invio su reti esterne

Dal popup puoi inviare **ETH / BNB / POL / ARB / SOL** e token **ERC-20 / SPL** (le stesse derivazioni del seed dell'app). Devi confermare la nota sulla firma classica prima di inviare; un link al risultato apre il block explorer.

## Reti e postura di sicurezza

- **Rete attiva** — QoreChain **mainnet** per impostazione predefinita (chain `0x2649` sul lane EVM). La testnet resta supportata per le dApp che la richiedono e le richieste di firma cross-network vengono rifiutate.
- **Permessi** — l'estensione richiede **solo `storage`**. Il content script inietta soltanto le API del provider; non legge il contenuto della pagina oltre alle richieste del wallet, non c'è alcuna analitica e nessun codice remoto.
