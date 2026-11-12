---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Il Q-Day Counter è il più piccolo progetto EVM utile su QoreChain. È un contratto Solidity che memorizza un numero, un progetto Hardhat che lo porta sulla testnet `qorechain-diana`, e un breve script che legge il numero e gli aggiunge uno.

Questa guida è scritta per chi inizia. Non devi conoscere Solidity né gli strumenti blockchain. Ogni comando è spiegato, e ogni passaggio termina con ciò che dovresti vedere.

**Quanto tempo serve:** circa 25 minuti la prima volta, in gran parte per installare gli strumenti e attendere il faucet.

## Cosa dimostra {#shows}

- **La firma ibrida fa parte del percorso di deploy.** Prima di qualsiasi transazione EVM, compreso il deploy di un contratto, l'account ha bisogno di una chiave post-quantistica registrata (ML-DSA-87) e di una finestra di autorizzazione EVM attiva. La finestra viene aperta da una transazione firmata due volte, con la chiave classica (secp256k1) e con la chiave post-quantistica. Questa è una firma ibrida. La catena controlla entrambe.
- **Una transazione a firma ibrida che puoi verificare.** Il passaggio `pnpm window open` invia quella transazione. Puoi cercarla nell'explorer e vedere il verdetto della catena stessa.
- **I tuoi normali strumenti EVM continuano a funzionare.** Hardhat e viem inviano normali transazioni Ethereum. La protezione post-quantistica sta nella finestra, quindi una chiave secp256k1 rubata da sola non può spendere dall'account.

Un computer quantistico abbastanza grande da rompere secp256k1 potrebbe falsificare le firme classiche. QoreChain richiede una seconda firma (ML-DSA-87, standard FIPS 204) che un computer del genere non può falsificare. Il Counter mostra l'intero ciclo di lavoro dello sviluppatore con questa regola attiva: registra la chiave, apri una finestra, distribuisci, chiama, leggi.

## Prima di iniziare {#prerequisites}

Questa guida usa un account testnet usa e getta. Non usare mai un wallet reale né fondi reali. I QOR di testnet non hanno valore.

Ti serve un terminale. Su macOS apri **Terminal**. Su Windows apri **PowerShell** (oppure **Git Bash**, che arriva con Git). Su Linux apri un qualsiasi terminale. Poi installa questi tre strumenti. Se il comando di controllo stampa già una versione adeguata, salta l'installazione.

### Node.js 22 o successivo

Node.js esegue JavaScript sul tuo computer. Hardhat 3 richiede Node.js 22 o successivo.

| Sistema | Installazione | Controllo |
| --- | --- | --- |
| macOS | `brew install node` (richiede [Homebrew](https://brew.sh)), oppure scarica da https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, oppure scarica da https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, apri un nuovo terminale, poi `nvm install 22` | `node --version` |

Cosa dovresti vedere: un numero che inizia con `v22` o più alto, come `v22.12.0`. Su Windows, dopo l'installazione chiudi e riapri PowerShell.

### pnpm

pnpm scarica le librerie di cui un progetto ha bisogno. Non arriva con l'installazione di Node.js, quindi lo aggiungi tu, su ogni sistema.

```sh
npm install -g pnpm
```

| Parte | Significato |
| --- | --- |
| `npm` | Lo strumento che arriva con Node.js. Installa altri strumenti. |
| `install` | Scarica e installa. |
| `-g` | Globale: installa per tutto il computer, non per una sola cartella. |
| `pnpm` | Lo strumento da installare. |

Controllalo con `pnpm --version`. Dovresti vedere un numero come `9.12.0` (9 o superiore). Se vedi `pnpm: command not found`, hai saltato questo passaggio: esegui il comando di installazione qui sopra, poi apri un nuovo terminale.

Se Linux o macOS dicono `EACCES: permission denied`, esegui invece `sudo npm install -g pnpm`.

### Git

Git scarica il progetto da GitHub.

| Sistema | Installazione | Controllo |
| --- | --- | --- |
| macOS | `xcode-select --install` oppure `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, oppure scarica da https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) oppure `sudo dnf install git` (Fedora) | `git --version` |

Cosa dovresti vedere: `git version 2.` e un numero.

## Un wallet testnet {#wallet}

Ti serve un account testnet con un po' di QOR. Questa guida ne crea uno per te nei prossimi passaggi (un file di chiavi). Per il Counter non ti serve QoreX. Se in seguito vuoi vedere lo stesso account in un wallet, usa [QoreX](/qorex/overview) sulla testnet:

- **App QoreX:** Impostazioni, poi **Use testnet (developers)**.
- **Estensione del browser QoreX:** sbloccala, tocca 7 volte il numero di versione in basso, poi scegli **Switch to testnet (diana)**.
- Per la lane EVM, scegli **Add an Ethereum account (coin 60)**.

Il faucet distribuisce QOR di testnet gratuiti: https://dashboard.qorechain.io/faucet. Effettui l'accesso, incolli un indirizzo e fai la richiesta. Ricevi 100 QOR ogni 24 ore per account.

**Sugli importi.** QOR è la moneta. `uqor` è il suo pezzo più piccolo: 1 QOR = 1.000.000 uqor. Le commissioni sulla catena sono espresse in `uqor`. La prima transazione di un nuovo account registra la sua chiave post-quantistica, con una commissione una tantum di circa 0,09 QOR.

## Passo dopo passo {#steps}

### 1. Ottieni il codice {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**Cosa fa**

- `git clone <address>` scarica una copia del progetto da GitHub in una nuova cartella chiamata `build-before-qday`.
- `cd <folder>` sposta il terminale nella cartella del progetto Counter. Ogni comando successivo si esegue da qui.

**Cosa dovresti vedere:** `Cloning into 'build-before-qday'...` e poi il prompt nella nuova cartella. **Quanto tempo:** pochi secondi.

Facoltativo: se preferisci costruire il progetto da zero, come nel workshop dal vivo, vedi [Costruisci lo stesso progetto da zero](#scaffold) alla fine dei passaggi.

### 2. Installa le librerie {#step-install}

```sh
pnpm install
```

**Cosa fa**

- `pnpm install` legge l'elenco delle librerie in `package.json` e le scarica in una cartella `node_modules` (Hardhat, l'SDK QoreChain e altro).

**Cosa dovresti vedere:** un elenco di pacchetti con segni `+` e `Done in` pochi secondi. **Quanto tempo:** meno di un minuto.

### 3. Esegui i test e la compilazione {#step-test}

```sh
pnpm test
```

**Cosa fa**

- `pnpm test` esegue i controlli del progetto su una catena finta dentro il tuo computer. Non servono chiave, rete né QOR. La prima esecuzione scarica anche il compilatore Solidity, quindi serve internet.

**Cosa dovresti vedere:** `Counter`, due righe con un segno di spunta (`starts at the constructor value`, `increments and emits CountChanged`) e `2 passing`.

```sh
pnpm build
```

**Cosa fa**

- `pnpm build` trasforma il contratto Solidity in codice macchina (lo compila). Dopo `pnpm test` stampa `No contracts to compile`, che va bene: il test lo ha già compilato.

### 4. Crea il file delle impostazioni {#step-account}

Il progetto legge i tuoi segreti da un file chiamato `.env`. Crealo a partire dal modello.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Cosa fa**

- `cp` (oppure `copy`) copia il file modello `.env.example` in un nuovo file `.env`.

Il file `.env` è il tuo **file di chiavi**. Vive solo in questa cartella di progetto. Contiene una chiave usa e getta. **Non condividerlo mai, non farne mai il commit su Git e non riutilizzare mai queste chiavi per un wallet reale.** Il progetto ignora già `.env` in Git. Aprilo in un qualsiasi editor di testo (`open -e .env` su macOS, `notepad .env` su Windows, `nano .env` su Linux). Compilerai due valori.

**a. Una chiave privata usa e getta.** Generane una casuale:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Cosa fa**

- `node -e "..."` esegue una riga di JavaScript.
- La riga genera 32 byte casuali e li stampa in esadecimale con `0x` davanti. Quella è una chiave privata.

**Cosa dovresti vedere:** una riga, `0x` seguito da 64 lettere e cifre. Copiala in `.env` come `PRIVATE_KEY=0x...`, al posto del segnaposto fatto di soli zeri.

**b. Un codice di recupero post-quantistico.** La chiave ML-DSA-87 dell'account nasce da un secondo segreto, il codice di recupero.

```sh
pnpm window recovery-code
```

**Cosa fa**

- `pnpm window` esegue lo script helper `scripts/window.ts`. La parola che segue è il comando.
- `recovery-code` stampa un nuovo codice di recupero casuale.

**Cosa dovresti vedere:** una riga che inizia con `QRC1-`, poi un breve promemoria. Copia la riga `QRC1-...` in `.env` come `QORE_PQC_RECOVERY_CODE=QRC1-...`. Conserva lo stesso codice per questo account: un nuovo codice dà all'account una chiave post-quantistica diversa.

Lascia vuoto `QORE_MNEMONIC`. (Una mnemonica è una frase di 12 o 24 parole che può sostituire i due valori qui sopra. Usa l'uno o l'altra, non entrambi.) Mantieni `QORE_NETWORK=testnet`, che dice all'helper di dialogare con la rete di prova. Il tuo `.env` è simile a questo, con dei segnaposto:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Salva il file.

### 5. Mostra l'indirizzo del tuo account {#step-address}

```sh
pnpm window status
```

**Cosa fa**

- `status` mostra il tuo account, se la sua chiave post-quantistica è registrata e se hai una finestra EVM.

**Cosa dovresti vedere:** tre righe. La prima è `account:  0x...  (qor1...)`. Il tuo account ha due indirizzi: `0x...` per l'EVM e `qor1...` per la lane nativa. Appartengono allo stesso account. Le altre due righe dicono `PQC key:  not registered` e `window:   none`. È normale: l'account è nuovo. Copia l'indirizzo `qor1...` dalla prima riga.

### 6. Ottieni QOR di testnet dal faucet {#step-faucet}

1. Apri https://dashboard.qorechain.io/faucet ed effettua l'accesso.
2. Assicurati che la pagina sia impostata su **Testnet**.
3. Incolla il tuo indirizzo `qor1...` e richiedi i QOR. Ne ricevi 100 una volta ogni 24 ore per account.
4. Attendi circa 10 secondi, poi esegui di nuovo `pnpm window status`.

**Cosa dovresti vedere:** le stesse tre righe di prima: la chiave risulta ancora `not registered` e non c'è alcuna finestra. L'account ora contiene QOR. Se vuoi una prova, apri https://explore.qore.network (Testnet) e cerca il tuo indirizzo `qor1...`.

### 7. Registra la chiave e apri la finestra {#step-window}

```sh
pnpm window register
```

**Cosa fa**

- `register` invia alla catena la chiave pubblica ML-DSA-87 dell'account. Lo fai una volta per account. È l'unico messaggio che la catena accetta senza una firma post-quantistica, perché sulla catena non c'è ancora alcuna chiave con cui confrontarla. Costa circa 0,09 QOR.

**Cosa dovresti vedere:** `registered: ` seguito da un hash di transazione (64 caratteri).

```sh
pnpm window open
```

**Cosa fa**

- `open` invia una transazione, firmata con entrambe le chiavi (ibrida), che apre una finestra di autorizzazione EVM. Finché la finestra è attiva, le tue normali transazioni EVM sono consentite. Per impostazione predefinita dura 600 blocchi e consente 5 transazioni. Puoi cambiarlo con `QORE_WINDOW_BLOCKS` e `QORE_WINDOW_TXS` in `.env`.

**Cosa dovresti vedere:** `opened: ` seguito da un hash di transazione, poi `window: 600 blocks, 5 txs, ... uqor (value plus fees)`. **Copia questo hash.** Lo controllerai al passaggio 10.

Ora attendi circa 10 secondi. L'apertura della finestra cambia il contatore delle transazioni dell'account, e il comando successivo deve vedere il nuovo valore.

```sh
sleep 10
pnpm window status
```

**Cosa fa**

- `sleep 10` attende 10 secondi (funziona anche in PowerShell e Git Bash).
- `status` mostra il risultato.

**Cosa dovresti vedere:** `PQC key:  registered` e `window:   live; ... blocks, ... txs, ... uqor left`.

### 8. Distribuisci il contratto {#step-deploy}

```sh
pnpm deploy:testnet
```

**Cosa fa**

- Esegue Hardhat Ignition, lo strumento che distribuisce i contratti, con il modulo `Counter` sulla rete `qorechainTestnet` (chain id 9800, la testnet di QoreChain).
- Ti chiede di confermare. Scrivi `y` e premi Invio.

**Cosa dovresti vedere:** una domanda di conferma sul deploy su `qorechainTestnet` (9800), poi, dopo il tuo `y`, una riga che termina con `CounterModule#Counter` e l'indirizzo del tuo contratto `0x...`. Quello è l'indirizzo del tuo contratto. **Quanto tempo:** circa 30 secondi.

### 9. Leggi e incrementa {#step-interact}

```sh
pnpm interact
```

**Cosa fa**

- Legge il numero memorizzato, chiama `increment()` (aggiunge uno), poi lo legge di nuovo. La chiamata usa una delle 5 transazioni della tua finestra.

**Cosa dovresti vedere:** `Counter 0x... on qorechain-diana EVM (9800)`, `count: 0`, `increment tx: 0x...`, `status: success in block ...`, `count: 1` e un link all'explorer.

```sh
pnpm interact --read
```

**Cosa fa**

- `--read` significa sola lettura: mostra il numero e non invia nulla.

**Cosa dovresti vedere:** l'indirizzo del Counter e `count: 1`.

### 10. Verifica la transazione ibrida {#step-explorer}

La transazione di `pnpm window open` è la tua prova che la catena ha controllato una firma post-quantistica. Controllala in due modi.

**a. Con la semplice richiesta web.** Sostituisci `<HASH>` con l'hash del passaggio 7. Rimuovi `<` e `>`.

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Cosa fa**

- `curl <address>` chiede a un server pubblico di QoreChain il record di quella transazione e lo stampa. In Windows PowerShell, scrivi `curl.exe` al posto di `curl`.
- `api-testnet.qore.host` è il server pubblico della testnet. `<HASH>` è la transazione che vuoi.

**Cosa dovresti vedere nella lunga risposta:**

- `"code": 0`, che significa che la transazione è riuscita.
- Un'estensione di tipo `PQCHybridSignature` che contiene la firma ML-DSA-87, lunga 4.627 byte.
- Un evento `pqc_hybrid_verify` con l'attributo `status` impostato su `verified`.

**b. Con l'explorer.**

1. Apri https://explore.qore.network e porta il selettore di rete su **Testnet**.
2. Cerca l'hash di `pnpm window open`. La pagina mostra una firma post-quantistica che la catena ha verificato.
3. Cerca l'hash di `increment tx` del passaggio 9, oppure l'indirizzo del tuo Counter, per vedere la chiamata al contratto.

L'[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) mostra lo stesso tipo di prova byte per byte.

## Costruisci lo stesso progetto da zero {#scaffold}

Il workshop dal vivo parte da una cartella vuota. Questo comando crea lo stesso progetto Hardhat (senza lo script `interact`, che esiste solo nella copia scaricata). Eseguilo in una cartella dove tieni i tuoi progetti, al posto del passaggio 1.

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| Parte | Significato |
| --- | --- |
| `npx` | Esegue uno strumento direttamente da internet, senza installarlo. |
| `create-qorechain-dapp@latest` | Il creatore di progetti di QoreChain, versione più recente. |
| `qday-demo` | Il nome della nuova cartella. |
| `-t hardhat` | Quale template di progetto usare: un progetto Hardhat 3 con un contratto, i test e l'helper della finestra. |
| `--network testnet` | Con quale rete QoreChain dialoga il progetto: la rete di prova, non quella reale. |
| `--package-manager pnpm` | Quale strumento installa le librerie. |

**Cosa dovresti vedere:** un elenco di pacchetti installati, poi `Done! Created qday-demo`. Le librerie sono già installate e un file `.env` esiste già, quindi puoi saltare il passaggio 2 e la copia del passaggio 4. Continua con `pnpm test` (passaggio 3), poi 4a e 4b (compila il `.env`) e i passaggi da 5 a 8. **Quanto tempo:** circa 30 secondi.

## Cosa dovresti vedere alla fine {#result}

- `pnpm test` stampa `2 passing`.
- `pnpm window status` stampa `PQC key:  registered` e `window:   live` con i blocchi, le transazioni e il valore rimasti.
- `pnpm deploy:testnet` stampa l'indirizzo del `Counter` distribuito (`0x...`).
- `pnpm interact` stampa `count` che passa da 0 a 1, `status: success` e un link all'explorer.
- Il controllo con `curl` mostra `"code": 0`, l'estensione `PQCHybridSignature` e l'evento `pqc_hybrid_verify` con `status` `verified`. L'explorer (Testnet) segna la stessa transazione come verificata.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `pnpm: command not found` | pnpm non è installato. Node.js non lo include. | Esegui `npm install -g pnpm`, poi apri un nuovo terminale. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js è troppo vecchio. | Installa Node.js 22 o successivo e controlla `node --version`. |
| `node: .env: not found` | In questa cartella non c'è alcun file `.env`. | Esegui il passaggio 4 e lancia il comando dalla cartella del progetto. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | Il file `.env` manca, oppure `PRIVATE_KEY` è ancora il segnaposto o contiene un errore di battitura. | Rifai il passaggio 4. Salva il file. Lancia il comando dalla cartella del progetto. |
| `Set QORE_PQC_RECOVERY_CODE in .env` o `not a valid QRC1 recovery code` | Il codice di recupero è vuoto o contiene un errore di battitura. | Esegui `pnpm window recovery-code` e incolla l'intera riga `QRC1-...`. |
| `... does not exist on chain yet: send it some QOR first` (su `register` o `open`) | L'account non ha ancora QOR. | Richiedi QOR al faucet (passaggio 6) e attendi 10 secondi. |
| Il faucet dice che hai raggiunto il limite | Una richiesta ogni 24 ore per account. | Attendi, poi riprova. Oppure usa un secondo account usa e getta. |
| `account has no PQC key and classical fallback is disabled` | Hai inviato una transazione prima di registrare la chiave. | Esegui `pnpm window register`, poi `pnpm window open`. |
| `EVM authorisation window exhausted` (o il suggerimento `open an EVM window first`) | La finestra ha esaurito i blocchi o le transazioni, oppure non è mai stata aperta. | Esegui `pnpm window open`, attendi 10 secondi, riprova. |
| `HHE10402` dopo l'apertura della finestra | Il deploy è partito prima che il contatore delle transazioni dell'account si aggiornasse. | Attendi 10 secondi ed esegui di nuovo `pnpm deploy:testnet`. |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | `pnpm interact` non trova il contratto. | Completa il passaggio 8 in questa cartella. |
| `PQC key: registered, but NOT this key` | Il codice di recupero in `.env` è diverso da quello usato alla registrazione. | Rimetti il codice di recupero originale. Un codice diverso genera una chiave diversa. |
| Errori CORS in un'app nel browser | Il server REST pubblico non invia intestazioni CORS, quindi un browser lo blocca. | Usa il proxy `/lcd` del template, come fa la [pagina web del Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook). |

## Il codice {#code}

Il contratto (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

La parte a firma ibrida di `scripts/window.ts` (il messaggio della finestra e il firmatario):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` è l'account creato dal tuo materiale di chiavi, e `net` è il record di rete per `QORE_NETWORK` (predefinito `testnet`, chain id `qorechain-diana`). La commissione usata dallo script è di 100000 `uqor` (0,1 QOR) con un limite di gas di 800000, perché le transazioni ibride sono grandi.

## Pacchetti usati {#packages}

| Pacchetto | Versione | Usato per |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Firma ibrida, registrazione della chiave PQC, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | Helper della finestra EVM (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Trasmissione della transazione sulla lane nativa |
| `hardhat` | ^3.21.1 | Compilazione, test, deploy con Ignition |
| `viem` | ^2.47.6 | Lettura e scrittura del contratto |
| `tsx` | ^4.19.0 | Esecuzione degli script TypeScript |
| `typescript` | ^5.6.3 | Controllo dei tipi |

Vedi [Scaffolder e CLI](/developer-tools/scaffolders-and-cli) e [Installare l'SDK](/sdk/install).

## Dettagli di rete {#networks}

| Voce | Valore |
| --- | --- |
| Rete | testnet `qorechain-diana` |
| EVM chain id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Sorgente: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
