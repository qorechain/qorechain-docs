---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Il Q-Day Guestbook è un libro degli ospiti on-chain sulla testnet EVM di QoreChain. Chiunque può firmarlo una volta per indirizzo con un messaggio di al massimo 140 caratteri. Ha due parti:

- **`contracts-app/`**: un contratto Solidity e un progetto Hardhat. Lo distribuisci e puoi firmare dal terminale.
- **`web/`**: una pagina web che si apre nel browser, collega il wallet QoreX, mostra la finestra EVM dell'account ed elenca in tempo reale le ultime firme.

Questa guida è scritta per chi inizia. Ogni comando è spiegato e ogni passaggio termina con ciò che dovresti vedere.

**Quanto tempo serve:** circa 35 minuti la prima volta: 20 per la parte del contratto, 15 per la pagina web.

## Cosa dimostra {#shows}

- **Una dApp nel browser che firma in modo ibrido senza saperlo.** La pagina è una normale app wagmi e RainbowKit. QoreX aggiunge la metà post-quantistica (ML-DSA-87) della firma, quindi la stessa transazione è protetta dalla chiave classica (secp256k1) e da una chiave post-quantistica.
- **La finestra EVM è visibile nell'interfaccia.** La pagina legge la finestra dell'account dalla catena e mostra se è attiva e quanti blocchi e transazioni restano.
- **Rifiuti leggibili.** Quando la catena rifiuta una scrittura, la pagina riconduce l'errore a una di quattro cause (nessuna chiave registrata, nessuna finestra, finestra esaurita, parametri non validi) e mostra la soluzione.
- **Firme ibride verificate on-chain.** Ogni firma che scrivi è una transazione che la catena ha accettato solo dopo aver controllato entrambe le firme.

## Prima di iniziare {#prerequisites}

Questa guida usa un account testnet usa e getta per la parte da terminale. Non usare mai un wallet reale né fondi reali. I QOR di testnet non hanno valore.

Ti serve un terminale. Su macOS apri **Terminal**. Su Windows apri **PowerShell** (oppure **Git Bash**, che arriva con Git). Su Linux apri un qualsiasi terminale. Installa questi tre strumenti. Se il comando di controllo stampa già una versione adeguata, salta l'installazione.

### Node.js 22 o successivo

Node.js esegue JavaScript sul tuo computer. Hardhat 3 richiede Node.js 22 o successivo.

| Sistema | Installazione | Controllo |
| --- | --- | --- |
| macOS | `brew install node` (richiede [Homebrew](https://brew.sh)), oppure scarica da https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, oppure scarica da https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, apri un nuovo terminale, poi `nvm install 22` | `node --version` |

Cosa dovresti vedere: un numero che inizia con `v22` o più alto. Su Windows, dopo l'installazione chiudi e riapri PowerShell.

### pnpm

pnpm scarica le librerie di cui un progetto ha bisogno. Node.js non lo include, quindi installalo tu, su ogni sistema.

```sh
npm install -g pnpm
```

| Parte | Significato |
| --- | --- |
| `npm` | Lo strumento che arriva con Node.js. Installa altri strumenti. |
| `install` | Scarica e installa. |
| `-g` | Globale: installa per tutto il computer, non per una sola cartella. |
| `pnpm` | Lo strumento da installare. |

Controllalo con `pnpm --version`. Dovresti vedere un numero come `9.12.0` (9 o superiore). Se vedi `pnpm: command not found`, esegui il comando di installazione qui sopra e apri un nuovo terminale. Se macOS o Linux dicono `EACCES: permission denied`, usa `sudo npm install -g pnpm`.

### Git

| Sistema | Installazione | Controllo |
| --- | --- | --- |
| macOS | `xcode-select --install` oppure `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, oppure scarica da https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) oppure `sudo dnf install git` (Fedora) | `git --version` |

Cosa dovresti vedere: `git version 2.` e un numero.

## Wallet testnet {#wallet}

Questa guida usa due account, e sono diversi di proposito:

1. **Un account con file di chiavi** per la parte da terminale (passaggi da 3 a 6). La guida lo crea per te. Distribuisce il contratto.
2. **Un account QoreX** per la pagina web (passaggi 8 e 9). La pagina web firma con questo.

**QoreX sulla testnet.** [QoreX](/qorex/overview) è il wallet di QoreChain. Per la pagina web usi l'estensione del browser (vedi [Integrazioni QoreX](/developer-tools/qorex-integrations)). Installala nel browser che userai, poi:

- **Estensione del browser QoreX:** sbloccala, tocca 7 volte il numero di versione in basso, poi scegli **Switch to testnet (diana)**.
- **App QoreX sul telefono:** Impostazioni, poi **Use testnet (developers)**.
- Per la lane EVM scegli **Add an Ethereum account (coin 60)**. La pagina web richiede un account coin 60.

**Il faucet** distribuisce QOR di testnet gratuiti: https://dashboard.qorechain.io/faucet. Accedi, incolla un indirizzo, fai la richiesta. Ricevi 100 QOR ogni 24 ore per account.

**Sugli importi.** QOR è la moneta. `uqor` è il suo pezzo più piccolo: 1 QOR = 1.000.000 uqor. La prima transazione di un nuovo account registra la sua chiave post-quantistica, con una commissione una tantum di circa 0,09 QOR.

## Parte 1: il contratto {#contract}

### 1. Ottieni il codice {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**Cosa fa**

- `git clone <address>` scarica il progetto da GitHub in una nuova cartella `build-before-qday`.
- `cd <folder>` sposta il terminale nel progetto Guestbook. Ha due cartelle, `contracts-app` e `web`, che configuri separatamente.

**Cosa dovresti vedere:** `Cloning into 'build-before-qday'...`. **Quanto tempo:** pochi secondi.

### 2. Installa le librerie ed esegui i test {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**Cosa fa**

- `cd contracts-app` entra nella cartella del contratto.
- `pnpm install` scarica le librerie elencate in `package.json` (Hardhat e l'SDK QoreChain).
- `pnpm test` esegue i controlli del contratto su una catena finta dentro il tuo computer. Non servono chiave né account di rete. La prima esecuzione scarica il compilatore Solidity.

**Cosa dovresti vedere:** un elenco di pacchetti, `Done in` pochi secondi, poi `QDayGuestbook` con tre segni di spunta e `3 passing`. **Quanto tempo:** circa un minuto.

### 3. Crea il file di chiavi {#step-account}

Il progetto legge i suoi segreti da un file chiamato `.env`. Crealo a partire dal modello.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Cosa fa**

- `cp` (oppure `copy`) copia il modello `.env.example` in un nuovo file `.env`.

Il file `.env` è il tuo **file di chiavi**. Vive solo nella cartella `contracts-app`. **Non condividerlo mai, non farne mai il commit su Git e non riutilizzare mai queste chiavi per un wallet reale.** Il progetto ignora già `.env` in Git. Aprilo in un qualsiasi editor di testo (`open -e .env` su macOS, `notepad .env` su Windows, `nano .env` su Linux) e compila due valori.

**a. Una chiave privata usa e getta.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Cosa fa**

- `node -e "..."` esegue una riga di JavaScript. La riga genera 32 byte casuali e li stampa in esadecimale con `0x` davanti. Quella è una chiave privata.

**Cosa dovresti vedere:** una riga, `0x` e poi 64 lettere e cifre. Copiala in `.env` come `PRIVATE_KEY=0x...`, al posto del segnaposto fatto di soli zeri.

**b. Un codice di recupero post-quantistico.**

```sh
pnpm window recovery-code
```

**Cosa fa**

- `pnpm window` esegue lo script helper `scripts/window.ts`. La parola che segue è il comando.
- `recovery-code` stampa un nuovo codice casuale da cui nasce la chiave ML-DSA-87 dell'account.

**Cosa dovresti vedere:** una riga che inizia con `QRC1-`. Copiala in `.env` come `QORE_PQC_RECOVERY_CODE=QRC1-...`. Conserva lo stesso codice per questo account: un nuovo codice dà una chiave post-quantistica diversa.

Lascia vuoto `QORE_MNEMONIC` (una mnemonica è una frase di 12 o 24 parole che può sostituire i due valori qui sopra; usa l'uno o l'altra, non entrambi) e mantieni `QORE_NETWORK=testnet`, che dice all'helper di usare la rete di prova. Il tuo `.env` è simile a questo (sono mostrati dei segnaposto):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Salva il file.

### 4. Finanzia l'account {#step-faucet}

```sh
pnpm window status
```

**Cosa fa**

- Mostra il tuo account, se la sua chiave post-quantistica è registrata e se ha una finestra EVM.

**Cosa dovresti vedere:** `account:  0x...  (qor1...)`, poi `PQC key:  not registered` e `window:   none`. Copia l'indirizzo `qor1...`. Poi:

1. Apri https://dashboard.qorechain.io/faucet ed effettua l'accesso.
2. Assicurati che la pagina sia impostata su **Testnet**.
3. Incolla l'indirizzo `qor1...` e richiedi i QOR (100 QOR una volta ogni 24 ore per account).
4. Attendi circa 10 secondi. Cercando il tuo indirizzo su https://explore.qore.network (Testnet) vedi il saldo.

### 5. Registra la chiave, apri la finestra, distribuisci {#step-window}

```sh
pnpm window register
```

**Cosa fa**

- Invia la tua chiave pubblica ML-DSA-87 alla catena, una volta per account. È l'unico messaggio che la catena accetta senza una firma post-quantistica, perché sulla catena non c'è ancora alcuna chiave con cui confrontarla. Costa circa 0,09 QOR.

**Cosa dovresti vedere:** `registered: ` e un hash di transazione.

```sh
pnpm window open
```

**Cosa fa**

- Invia una transazione, firmata con entrambe le chiavi (ibrida), che apre una finestra di autorizzazione EVM. Finché è attiva, le tue normali transazioni EVM sono consentite. Per impostazione predefinita dura 600 blocchi e consente 5 transazioni.

**Cosa dovresti vedere:** `opened: ` e un hash di transazione, poi `window: 600 blocks, 5 txs, ...`. **Copia questo hash** per l'ultimo passaggio.

```sh
sleep 10
```

**Cosa fa**

- Attende 10 secondi (funziona anche in PowerShell e Git Bash). L'apertura della finestra cambia il contatore delle transazioni dell'account, e il comando successivo deve vedere il nuovo valore.

```sh
pnpm deploy:testnet
```

**Cosa fa**

- Esegue Hardhat Ignition, lo strumento che distribuisce i contratti, con il modulo `QDayGuestbook` sulla rete `qorechainTestnet` (chain id 9800, la testnet di QoreChain).
- Ti chiede di confermare. Scrivi `y` e premi Invio.

**Cosa dovresti vedere:** una riga che termina con `QDayGuestbookModule#QDayGuestbook` e l'indirizzo del tuo contratto `0x...`. **Copia questo indirizzo**: la pagina web ne ha bisogno. **Quanto tempo:** circa 30 secondi.

### 6. Firma dal terminale {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**Cosa fa**

- `pnpm sign "<message>"` scrive una voce nel guestbook. Il testo tra virgolette è il tuo messaggio, fino a 140 caratteri.
- `pnpm sign --read` legge soltanto: elenca le ultime voci e non invia nulla.

**Cosa dovresti vedere:** dopo il primo comando `tx: 0x...` e `status: success in block ...`. Dopo il secondo, `guestbook 0x...: 1 signatures` e il tuo messaggio con l'ora e il tuo indirizzo.

Ogni indirizzo può firmare una sola volta. Un secondo `pnpm sign` dallo stesso account viene rifiutato dal contratto con `AlreadySigned`.

## Parte 2: la pagina web {#web}

### 7. Installa e configura la pagina {#step-web}

Apri una seconda finestra di terminale nella stessa cartella del progetto, oppure torna indietro con `cd ..`. Poi:

```sh
cd web
pnpm install
```

**Cosa fa**

- Entra nella cartella web e scarica le sue librerie (React, wagmi, RainbowKit, Vite).

**Cosa dovresti vedere:** un elenco di pacchetti e `Done in` pochi secondi.

Crea il file delle impostazioni della pagina. macOS, Linux, Git Bash: `cp .env.example .env`. Windows PowerShell: `copy .env.example .env`. Apri `web/.env` in un editor e imposta l'indirizzo del contratto che hai copiato al passaggio 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Lascia vuoto `VITE_WALLETCONNECT_PROJECT_ID`. Serve solo se aggiungi un wallet WalletConnect in `src/wagmi.ts`.

### 8. Avvia la pagina e collega QoreX {#step-run}

```sh
pnpm dev
```

**Cosa fa**

- Avvia un piccolo server web sul tuo computer (Vite). La pagina si trova su `http://localhost:5174`. Il server inoltra anche le richieste che iniziano con `/lcd` al server REST pubblico della testnet. Il browser non può chiamare direttamente quel server (non invia intestazioni CORS), quindi questo proxy lo fa per la pagina.
- Il comando resta in esecuzione. Lascia aperto questo terminale. Premi `Ctrl+C` per fermarlo in seguito. Se modifichi `web/.env`, fermalo e riavvialo.

**Cosa dovresti vedere:** `VITE ... ready` e `Local: http://localhost:5174/`.

Ora, nel browser dove è installato QoreX:

1. Apri http://localhost:5174 .
2. Assicurati che QoreX sia sbloccato e passato alla testnet (vedi "Wallet testnet" sopra), con un account coin 60 che ha QOR dal faucet. Usa la forma `qor1...` del suo indirizzo nella pagina del faucet se QoreX mostra entrambe le forme.
3. Nella pagina, nella scheda 1, scegli **Connect QoreX** (il pulsante di connessione). Se QoreX non è elencato per primo, sceglilo dall'elenco dei wallet.
4. QoreX apre una finestra che chiede di connettersi. Approva.

**Cosa dovresti vedere:** la scheda 1 mostra il tuo account `0x...`, la catena `qorechain-diana EVM (9800)`, il tuo saldo e la finestra EVM: `no window open` per un account nuovo. La scheda 3 mostra `On chain now: 1 signatures` e la voce che hai scritto al passaggio 6. Se la riga della catena dice `wrong chain`, passa QoreX alla testnet.

### 9. Firma da QoreX {#step-sign}

1. Nella scheda 2, scrivi un messaggio (fino a 140 caratteri). La pagina mostra quanti ne hai usati.
2. Scegli **Sign**.
3. QoreX apre la sua richiesta di approvazione. Se il tuo account non ha ancora una chiave post-quantistica o una finestra, QoreX propone di registrare la chiave (una commissione una tantum di circa 0,09 QOR) e di aprire la finestra EVM nella stessa approvazione. Scegli di farlo.
4. Approva in QoreX. Il pulsante riporta `Approve in QoreX...` durante l'attesa.

**Cosa dovresti vedere:** una riga `tx 0x...` con un link all'explorer, prima `waiting for the block...`, poi `success in block ...`. La scheda 1 ora mostra la finestra EVM come `live` con i blocchi e le transazioni rimasti. La scheda 3 aggiunge il tuo messaggio in cima, dal più recente. Elenca fino a 20 voci e si aggiorna ogni pochi secondi. Se riprovi dallo stesso indirizzo, la scheda 2 dice `This address has already signed.`

### 10. Verifica on-chain {#step-explorer}

Usa l'hash di `pnpm window open` (passaggio 5). Per la pagina, QoreX apre la finestra anche con una propria transazione: chiedi a QoreX la sua cronologia oppure cerca il tuo indirizzo nell'explorer.

**a. Con la semplice richiesta web.** Sostituisci `<HASH>` con l'hash (rimuovi `<` e `>`).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Cosa fa**

- `curl <address>` chiede a un server pubblico di QoreChain il record di quella transazione e lo stampa. In Windows PowerShell scrivi `curl.exe` al posto di `curl`.

**Cosa dovresti vedere nella lunga risposta:**

- `"code": 0`, che significa che la transazione è riuscita.
- Un'estensione di tipo `PQCHybridSignature` con la firma ML-DSA-87, lunga 4.627 byte.
- Un evento `pqc_hybrid_verify` con `status` impostato su `verified`.

**b. Con l'explorer.** Apri https://explore.qore.network, porta il selettore di rete su **Testnet** e cerca l'hash della transazione (dal passaggio 5, 6 o 9), l'indirizzo del tuo account oppure l'indirizzo di `QDayGuestbook`. La transazione della finestra mostra una firma post-quantistica che la catena ha verificato.

## Cosa dovresti vedere alla fine {#result}

- `pnpm test` in `contracts-app` stampa `3 passing`.
- `pnpm window status` stampa `PQC key:  registered` e `window:   live` con i blocchi, le transazioni e il valore rimasti.
- `pnpm deploy:testnet` stampa l'indirizzo di `QDayGuestbook` (`0x...`).
- `pnpm sign "..."` stampa l'hash della transazione e `status: success in block ...`.
- La pagina mostra il tuo account, `qorechain-diana EVM (9800)`, il tuo saldo e la finestra come `live`. Dopo **Sign** e la tua approvazione vedi un link alla transazione e `success in block ...`.
- L'elenco in fondo mostra il numero di firme e le ultime voci, dalla più recente.
- Il controllo con `curl` mostra `"code": 0`, l'estensione `PQCHybridSignature` e `pqc_hybrid_verify` con `status` `verified`.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `pnpm: command not found` | pnpm non è installato. Node.js non lo include. | Esegui `npm install -g pnpm`, poi apri un nuovo terminale. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js è troppo vecchio. | Installa Node.js 22 o successivo. |
| `node: .env: not found` | In questa cartella non c'è alcun file `.env`. | Esegui il passaggio 3 in `contracts-app` e lancia i comandi da quella cartella. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` o `Set QORE_PQC_RECOVERY_CODE ...` | Un valore in `.env` è vuoto, è un segnaposto o contiene un errore di battitura. | Compila entrambi i valori come al passaggio 3 e salva. |
| `... does not exist on chain yet: send it some QOR first` | L'account non ha ancora QOR. | Usa il faucet (passaggio 4), attendi 10 secondi. |
| Il faucet dice che hai raggiunto il limite | Una richiesta ogni 24 ore per account. | Attendi, poi riprova. |
| `account has no PQC key and classical fallback is disabled` | È stata inviata una transazione prima di registrare la chiave. | Esegui `pnpm window register`, poi `pnpm window open`. In QoreX, approva la registrazione proposta con il tuo primo invio. |
| `EVM authorisation window exhausted` o `open an EVM window first` | La finestra ha esaurito i blocchi o le transazioni, oppure non è mai stata aperta. | Esegui `pnpm window open` (terminale) e attendi 10 secondi. Nella pagina, approva la nuova finestra quando QoreX la propone. |
| `HHE10402` dopo l'apertura della finestra | Il deploy è partito prima che il contatore delle transazioni dell'account si aggiornasse. | Attendi 10 secondi ed esegui di nuovo `pnpm deploy:testnet`. |
| `refused: ... (AlreadySigned)` | Questo indirizzo ha già firmato. | Ogni indirizzo firma una sola volta. Usa un altro account. |
| `refused: ... (BadLength)` | Il messaggio è vuoto o più lungo di 140 caratteri. | Usa da 1 a 140 caratteri. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign` non trova il contratto. | Completa il passaggio 5 in `contracts-app`. |
| La pagina non mostra voci e il pulsante **Sign** è grigio | `VITE_GUESTBOOK_ADDRESS` è vuoto in `web/.env`. | Incolla l'indirizzo del passaggio 5, poi ferma (`Ctrl+C`) e riavvia `pnpm dev`. |
| La pagina dice `wrong chain` | QoreX non è sulla testnet. | Passa QoreX alla testnet (diana), vedi "Wallet testnet". |
| QoreX non viene proposto quando scegli di connetterti | La pagina è stata aperta in un browser senza l'estensione QoreX, oppure l'estensione è bloccata. | Apri http://localhost:5174 nel browser con QoreX e sbloccalo. |
| La porta 5174 è già in uso | Un altro programma la usa. | Chiudilo, oppure usa l'altro indirizzo che Vite stampa. |
| `could not read` accanto alla finestra EVM, o errori CORS nella console del browser | La pagina ha chiamato direttamente il server REST, che non invia intestazioni CORS. | Chiama REST solo tramite il proxy `/lcd` del server di sviluppo, come fa questo progetto. Avvia la pagina con `pnpm dev`. |

## Il codice {#code}

Il contratto conserva le voci in un array e consente una firma per indirizzo:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX è il primo wallet nell'elenco dei connettori (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

La pagina mostra la finestra e spiega i rifiuti (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Pacchetti usati {#packages}

Contratti (`contracts-app/`):

| Pacchetto | Versione | Usato per |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Script helper della finestra, firma ibrida |
| `@qorechain/evm` | ^0.13.0 | Definizioni delle catene, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Trasmissione del messaggio della finestra |
| `hardhat` | ^3.21.1 | Compilazione, test, deploy con Ignition |
| `viem` | ^2.47.6 | Client Ethereum |
| `tsx` | ^4.19.0 | Esecuzione degli script TypeScript |
| `typescript` | ^5.6.3 | Controllo dei tipi |

Pagina web (`web/`):

| Pacchetto | Versione | Usato per |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Definizioni delle catene, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX come wallet RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Pulsante di connessione |
| `wagmi` | ^2.19.5 | Hook React per letture e scritture |
| `viem` | ^2.53.1 | Client Ethereum |
| `@tanstack/react-query` | ^5.59.0 | Recupero dati per la finestra e le letture della catena |
| `react`, `react-dom` | ^18.3.1 | Interfaccia |
| `vite` | ^5.4.0 | Server di sviluppo |
| `@vitejs/plugin-react` | ^4.3.0 | Supporto React per Vite |
| `typescript` | ^5.6.3 | Controllo dei tipi |

Sorgente: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
