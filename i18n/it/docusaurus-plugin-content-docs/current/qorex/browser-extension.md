---
slug: /qorex/browser-extension
title: Estensione per browser
sidebar_label: Estensione per browser
sidebar_position: 8
---

# Estensione per browser

L'**estensione per browser** di QoreX è il **connettore per dApp** su desktop. Funziona su **Chrome e Firefox**, e una build per **Safari** viene distribuita dalla stessa base di codice (impacchettata con il wrapper per estensioni web Safari di Apple — su Safari le approvazioni si aprono in una scheda del browser anziché in una finestra popup). Consente ai siti web di rilevare il tuo wallet e trasforma ogni richiesta in un'approvazione esplicita. Si abbina concettualmente all'app mobile e **non** include funzionalità di staking, portafoglio o account — queste risiedono nell'app.

## Configurazione

L'estensione si abbina a un wallet creato nell'**app mobile QoreX**. Se apri il popup prima di aver eseguito l'abbinamento, mostra **"Nessun wallet ancora — creane uno nell'app QoreX."**

## Sblocco

Il popup richiede la **password del vault** (o una passkey nei browser che supportano le chiavi derivate da passkey). Il vault è cifrato con AES-256-GCM nell'archivio dell'estensione, si blocca automaticamente e ogni sblocco è esplicito.

## Connessione alle dApp

I siti web rilevano QoreX tramite **EIP-6963** (lo standard multi-wallet) e il contratto di connessione di QoreChain. QoreX **non sovrascrive mai** `window.ethereum` o `window.keplr` — appare **accanto** agli altri wallet, e tu scegli quale wallet usare per ciascun sito.

1. Un sito richiede una connessione; il popup di approvazione mostra l'**origine**.
2. L'approvazione rivela solo il tuo **indirizzo pubblico** a quell'origine.
3. Le approvazioni sono **per origine**, persistono ai riavvii del browser, e l'approvazione di un sito non concede nulla a un altro.

## Firma

Ogni richiesta di firma apre una finestra di approvazione che mostra il **payload decodificato** — destinatario, importo, rete — mai un hash nudo.

- Per le transazioni QoreChain sulla lane Native, l'estensione segnala che la **dApp fornisce il livello post-quantistico** (il wallet firma la metà classica — lo stesso schema usato dai wallet consolidati).
- Se una richiesta è **solo classica**, il popup mostra un avviso esplicito: **"⚠ Questa richiesta è una firma classica — l'app non ha aggiunto un livello resistente ai computer quantistici."**
- **Rifiuta** è sempre a un clic, e le richieste scadono da sole.

## Invio su reti esterne

Dal popup puoi inviare **ETH / BNB / POL / ARB / SOL** e token **ERC-20 / SPL** (le stesse derivazioni dal seed dell'app). Devi confermare la nota sulla firma classica prima di inviare; un link al risultato apre il block explorer.

## Reti e postura di sicurezza

- **Rete attiva** — QoreChain **mainnet** per impostazione predefinita (chain `0x2649` sulla lane EVM). La testnet resta supportata per le dApp che la richiedono, e le richieste di firma tra reti diverse vengono rifiutate.
- **Autorizzazioni** — l'estensione richiede **solo `storage`**. Il content script inietta unicamente le API del provider; non legge il contenuto della pagina oltre alle richieste del wallet, e non c'è alcuna analisi statistica né codice remoto.
