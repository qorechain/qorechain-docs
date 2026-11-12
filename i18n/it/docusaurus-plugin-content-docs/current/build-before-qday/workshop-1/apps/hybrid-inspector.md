---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

L'Hybrid Inspector è una piccola pagina web (costruita con React) che mostra com'è fatta una firma ibrida di QoreChain sulla testnet `qorechain-diana`. Colleghi il wallet QoreX, invii una transazione che QoreX firma sia con secp256k1 sia con ML-DSA-87, e la pagina la apre e la mostra pezzo per pezzo: la firma classica, la firma post-quantistica e il verdetto della catena stessa. Puoi anche incollare l'hash di qualsiasi transazione della testnet.

**Quanto ci vuole:** circa 20 minuti, installazioni comprese. Dopo, la pagina parte in pochi secondi.

## Cosa mostra {#what-it-shows}

- **Firma ibrida ML-DSA-87 + secp256k1 da una pagina web.** La pagina passa a QoreX un messaggio codificato con `qorexSignAndBroadcast`. QoreX firma con entrambe le chiavi e trasmette.
- **Una transazione firmata in modo ibrido, verificata on chain.** La pagina legge l'evento `pqc_hybrid_verify` della catena per quella transazione. Quell'evento è la catena che dichiara di aver controllato la firma post-quantistica.
- **Le dimensioni si vedono.** La firma classica è di 64 byte. La firma ML-DSA-87 (FIPS 204) è di 4.627 byte e viaggia nell'estensione `PQCHybridSignature` della transazione.

## Passo dopo passo {#steps}

Lavori nel tuo terminale e nel tuo browser. Usa solo un account di testnet usa e getta. Il QOR di testnet non ha alcun valore. Non usare mai un wallet reale né fondi reali qui.

### 1. Prima di iniziare: installa gli strumenti {#install}

Servono quattro cose: un browser basato su Chromium (Chrome, Edge o Brave), **Git** (scarica il codice), **Node.js** (esegue gli strumenti della pagina) e **pnpm** (installa le librerie della pagina). Usa Node.js 22 o successivo. La pagina funziona anche da Node.js 20, ma 22 è la scelta sicura per tutte le app del workshop.

**macOS**

| Strumento | Come installarlo | Come verificarlo |
| --- | --- | --- |
| Git | `xcode-select --install` (oppure `brew install git`) | `git --version` |
| Node.js 22+ | Scarica l'installer LTS da https://nodejs.org, oppure esegui `brew install node` | `node --version` (deve mostrare v22 o superiore) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (usa PowerShell)

| Strumento | Come installarlo | Come verificarlo |
| --- | --- | --- |
| Git | Scarica da https://git-scm.com/download/win | `git --version` |
| Node.js 22+ | Scarica l'installer LTS da https://nodejs.org (oppure `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian o Ubuntu)**

| Strumento | Come installarlo | Come verificarlo |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | Segui https://nodejs.org/en/download (scegli Linux, poi la versione LTS) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Attenzione:** Node.js installato con Homebrew non include pnpm. Se vedi `pnpm: command not found`, esegui `npm install -g pnpm`, poi apri un nuovo terminale.

**Cosa dovresti vedere:** ogni comando di verifica stampa un numero di versione. `node --version` inizia con `v22` o un numero più alto.

### 2. Prima di iniziare: QoreX sulla testnet {#qorex}

QoreX è il wallet ufficiale di QoreChain. Questa pagina richiede l'**estensione del browser QoreX** nel browser in cui apri la pagina. Installala dallo store del tuo browser. Vedi [Integrazioni QoreX](/developer-tools/qorex-integrations) e il [browser dApp](/qorex/dapp-browser).

Usa un **nuovo account usa e getta** creato solo per questo esercizio. QoreX mostra una frase di recupero quando crea l'account. Scrivila su carta, tienila privata e non riutilizzarla mai sulla mainnet.

Passa QoreX alla testnet:

- **Estensione del browser:** sbloccala, tocca 7 volte il numero di versione in basso, poi scegli **Switch to testnet (diana)**.
- **App QoreX:** apri Impostazioni e attiva **Use testnet (developers)**. (La pagina gira in un browser desktop, quindi per questo tutorial usi l'estensione.)

Vedi [Deploy in 5 minuti](/getting-started/deploy-in-5-minutes#step-testnet) per approfondire il passaggio alla testnet. Copia l'indirizzo del tuo account (inizia con `qor1...`).

Per questa pagina non ti serve un account Ethereum (coin 60), perché invia un pagamento QoreChain Native.

### 3. Ottieni QOR di testnet dal faucet {#faucet}

Il faucet è un sito web che invia QOR di testnet gratuiti a un indirizzo.

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e fai la richiesta. Il faucet eroga **100 QOR ogni 24 ore per account**.

**Importi:** l'unità che leggi è il **QOR**. La catena conta in **uqor**, l'unità più piccola. 1 QOR = 1.000.000 uqor. La pagina chiede QOR e fa la conversione per te.

**Da sapere:** la primissima transazione di un nuovo account registra on chain la sua chiave post-quantistica ML-DSA-87. È una commissione una tantum di circa 0,09 QOR. QoreX lo fa per te al primo invio.

### 4. Scarica il codice {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| Parte | Significato |
| --- | --- |
| `git clone <indirizzo>` | Scarica da GitHub una copia completa delle app di esempio in una nuova cartella chiamata `build-before-qday`. |
| `cd <cartella>` | Sposta il terminale nella cartella dell'Hybrid Inspector. Tutti i comandi successivi si eseguono da qui. |

**Cosa dovresti vedere:** `Cloning into 'build-before-qday'...`. Esegui `ls` per controllare: vedi `package.json`, `src`, `index.html` e `vite.config.ts`.

### 5. Installa le librerie {#install-libs}

```sh
pnpm install
```

**Cosa fa:** `pnpm` scarica le librerie di cui la pagina ha bisogno (elencate in `package.json`) in una cartella chiamata `node_modules`. Lo esegui una sola volta per progetto.

| Parte | Significato |
| --- | --- |
| `pnpm` | Lo strumento che installa le librerie. |
| `install` | Legge `package.json` e installa tutto ciò che elenca, alle versioni indicate in `pnpm-lock.yaml`. |

**Quanto ci vuole:** meno di un minuto.

**Cosa dovresti vedere:** una barra di avanzamento e poi `Done in` con un tempo.

### 6. Controlla che compili {#build}

```sh
pnpm build
```

**Cosa fa:** esegue lo script chiamato `build` di `package.json`. Quello script è `tsc --noEmit && vite build`.

| Parte | Significato |
| --- | --- |
| `pnpm build` | Esegue lo script `build` del progetto. |
| `tsc --noEmit` | Il controllo di TypeScript. Cerca errori nel codice e non scrive alcun file. |
| `vite build` | Vite impacchetta la pagina in un piccolo sito web nella cartella `dist`. |

**Cosa dovresti vedere:** `transforming...`, poi righe come `dist/index.html`, e infine `built in` con un tempo (ben sotto il secondo).

### 7. Avvia la pagina {#run}

```sh
pnpm dev
```

**Cosa fa:** esegue lo script `dev`, che avvia un piccolo server web sul tuo computer così puoi usare la pagina nel browser. Lascia aperto questo terminale mentre lavori. Premi Ctrl+C per fermarlo.

**Cosa dovresti vedere:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

Apri http://localhost:5173 nel browser in cui è installato QoreX. Se la porta 5173 è occupata, Vite stampa l'altra porta. Usa l'indirizzo che stampa.

Per ispezionare direttamente una transazione, aggiungi `?tx=<HASH>` all'indirizzo: `http://localhost:5173?tx=<HASH>`.

**Perché la pagina chiama `/lcd`:** il servizio REST pubblico della testnet non invia header CORS, quindi una pagina del browser non può chiamarlo direttamente. Il server di sviluppo inoltra ogni chiamata da `/lcd` a `https://api-testnet.qore.host`. La pagina funziona solo sulla testnet e non serve alcun file `.env`.

### 8. Collega, invia e verifica {#connect-send}

1. **Collega.** Fai clic su **Connect QoreX**. QoreX ti chiede di autorizzare la pagina. Approva. La pagina mostra il tuo indirizzo (`qor1...`), il tuo saldo di testnet e se è registrata una chiave ML-DSA-87. Dice "not registered yet" finché non fai il primo invio.
2. **Compila il modulo di invio.**

| Campo | Significato |
| --- | --- |
| To | L'indirizzo del destinatario (`qor1...`). Per impostazione predefinita è compilato con il tuo stesso indirizzo, e va bene così. |
| Amount (QOR) | Quanto inviare, in QOR. `1` significa 1 QOR = 1.000.000 uqor. |
| Memo | Un breve testo allegato alla transazione e salvato on chain. Chiunque può leggerlo, quindi non scrivere nulla di privato. |

3. **Invia.** Fai clic su **Sign with QoreX and send**. QoreX mostra cosa stai firmando e chiede l'approvazione. Approva. Aspetta il blocco (qualche secondo).
4. **Ispeziona.** La pagina ispeziona la transazione in automatico. Puoi anche incollare l'hash di qualsiasi transazione di testnet di 64 caratteri nel passaggio 3 della pagina e fare clic su **Inspect**.

**Cosa dovresti vedere:** una riga `QoreX: code 0, shield ..., tx <hash>`, poi la scheda di ispezione descritta in "Cosa dovresti vedere" più sotto. Copia l'hash della transazione.

### 9. Verificalo in un secondo modo, senza la pagina {#verify-curl}

Puoi chiedere direttamente alla catena. Ti serve solo `curl`, incluso in macOS e nella maggior parte dei sistemi Linux. In PowerShell su Windows usa `curl.exe`. Lo strumento `jq` è facoltativo e rende la risposta più leggibile (`brew install jq` su macOS, `sudo apt install -y jq` su Linux, `winget install jqlang.jq` su Windows).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Parte | Significato |
| --- | --- |
| `curl -s <indirizzo>` | Scarica la risposta dal servizio REST della testnet. `-s` nasconde la barra di avanzamento. |
| `<HASH>` | L'hash della tua transazione, dal passaggio 8. |
| `\| jq '...'` | Estrae tre valori. Senza `jq`, togli questa parte e leggi il testo completo. |

**Cosa dovresti vedere:**

- `code` è `0`: la transazione è riuscita.
- Un'estensione `PQCHybridSignature` (tipo `/qorechain.pqc.v1.PQCHybridSignature`) con una `pqc_signature`. Il suo testo base64 è lungo 6.172 caratteri, cioè 4.627 byte di firma ML-DSA-87.
- In `tx_response.events`, un evento di tipo `pqc_hybrid_verify` con l'attributo `status` impostato su `verified`.

**Nell'explorer:** apri https://explore.qore.network, passa a **Testnet** e cerca l'hash della tua transazione.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `pnpm: command not found` | pnpm non è installato. Node.js di Homebrew non lo include. | Esegui `npm install -g pnpm`, poi apri un nuovo terminale. |
| `node --version` mostra v18 o inferiore | Node.js è troppo vecchio. | Installa Node.js 22 o successivo (passaggio 1). |
| La pagina dice `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` | L'estensione manca, è bloccata, oppure il browser non è basato su Chromium. | Installa e sblocca QoreX in Chrome, Edge o Brave. Passa alla testnet, poi ricarica la pagina. |
| Il faucet dice che hai raggiunto il limite di richieste | Una richiesta ogni 24 ore per account. | Aspetta 24 ore, oppure usa un secondo account usa e getta. |
| `account has no PQC key and classical fallback is disabled` | La chiave post-quantistica non è ancora registrata. | Fai un invio da QoreX (registra la chiave al primo invio, circa 0,09 QOR). Assicurati prima di avere QOR dal faucet. |
| `EVM authorisation window exhausted` | Riguarda l'app Hardhat, non questa pagina. | In quell'app, apri una nuova finestra con `pnpm window open`. |
| `HHE10402` dopo l'apertura della finestra | Riguarda l'app Hardhat. La finestra ha bisogno di qualche secondo. | Esegui di nuovo il deploy. |
| Errore CORS nella console del browser | La pagina ha chiamato direttamente il servizio REST. | Usa il proxy `/lcd` del server di sviluppo (`pnpm dev`) e apri la pagina su `http://localhost:5173`. Non aprire `dist/index.html` come file. |
| `Enter an amount in QOR, for example 1.` | L'importo è vuoto, zero o non è un numero. | Scrivi un numero, per esempio `1`. |
| `A transaction hash is 64 hex characters.` | L'hash incollato è sbagliato o tagliato. | Incolla tutti i 64 caratteri. |
| `Transaction not found on qorechain-diana` | L'hash appartiene a un'altra rete, oppure il blocco non è ancora finale. | Aspetta 10 secondi e riprova. Controlla che QoreX sia sulla testnet. |
| La porta 5173 è già in uso | Un altro programma la usa. | Vite sceglie la porta successiva e la stampa. Apri quell'indirizzo. |

## Il codice {#code}

Collegare e inviare:

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Leggere la prova dalla catena:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes` è un piccolo codificatore protobuf in `src/App.tsx` per il messaggio bancario `MsgSend`, perché QoreX riceve il messaggio già codificato. La pagina segna una transazione come verificata in modo ibrido quando il suo codice è 0, un evento `pqc_hybrid_verify` ha stato `verified` e la firma post-quantistica è di 4.627 byte.

## Cosa dovresti vedere {#result}

- L'intestazione mostra `qorechain-diana (testnet)` e un'altezza di blocco che continua a crescere.
- Dopo il collegamento: il tuo indirizzo, il saldo e lo stato della chiave.
- Dopo l'invio: l'hash della transazione e il codice di risultato, poi la scheda di ispezione con il memo, il tipo di messaggio, la firma classica di 64 byte, la firma ML-DSA-87 di 4.627 byte con i suoi primi byte in esadecimale, il nome dell'algoritmo `ML-DSA-87 (FIPS 204)` e il verdetto `pqc_hybrid_verify`.
- Sull'explorer: apri https://explore.qore.network, passa a **Testnet** e cerca l'hash della tua transazione.

## Pacchetti usati {#packages}

| Pacchetto | Versione | Usato per |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (fissata) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Elencato come dipendenza; la pagina stessa usa semplici chiamate REST |
| `react`, `react-dom` | ^18.3.1 | Interfaccia |
| `@vitejs/plugin-react` | ^4.3.0 | Plugin React per Vite |
| `vite` | ^5.4.0 | Server di sviluppo e build |
| `typescript` | ^5.6.3 | Controllo dei tipi |

## Codice sorgente {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
