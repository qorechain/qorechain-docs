---
slug: /build-before-qday/workshop-1
title: "Workshop 1: La tua prima transazione con firma ibrida"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: La tua prima transazione con firma ibrida

Questa guida ti porta da un computer senza nulla di installato a una transazione firmata con due chiavi contemporaneamente e verificata dalla testnet di QoreChain. Non devi essere uno sviluppatore. Ogni comando è spiegato in parole semplici, e ogni passaggio termina con ciò che dovresti vedere sullo schermo.

**Quanto tempo serve:** circa 30 minuti la prima volta, installazione degli strumenti compresa. Circa 10 minuti se gli strumenti sono già installati.

## Cosa costruiamo {#what-we-built}

Un progetto Solidity completo (un piccolo smart contract) creato con un solo comando, testato, distribuito sulla testnet di QoreChain, e poi una transazione firmata con **due chiavi contemporaneamente** e controllata dalla catena.

Cosa dimostra:

- **Firma ibrida.** La transazione porta una firma classica secp256k1 e una firma post-quantistica ML-DSA-87 (NIST FIPS 204). Entrambe devono essere valide.
- **Una transazione con firma ibrida verificata on-chain.** I validatori verificano entrambe le firme. Leggi la prova dall'endpoint REST pubblico (l'estensione `PQCHybridSignature` e l'evento `pqc_hybrid_verify`) e nell'explorer.
- **La finestra di autorizzazione EVM.** Una transazione Ethereum non può portare una firma post-quantistica. Quindi su QoreChain registri una sola volta la tua chiave ML-DSA-87 e apri una breve finestra, con un messaggio a firma ibrida, durante la quale le tue normali transazioni EVM vengono ammesse. Per approfondire l'idea vedi [Distribuire in 5 minuti](/getting-started/deploy-in-5-minutes).

È esattamente ciò che richiede il livello Quantum Pass.

## Parole usate in questa guida {#words}

| Parola | Significato in parole semplici |
| --- | --- |
| Terminale | La finestra dove scrivi i comandi. Terminal su macOS e Linux, PowerShell su Windows |
| Testnet | Una copia di prova di QoreChain. Le sue monete non hanno valore |
| QOR e uqor | QOR è la moneta. uqor è la sua unità più piccola. 1 QOR = 1.000.000 uqor |
| Transazione | Un'istruzione firmata inviata alla catena |
| Memo | Un breve testo allegato a una transazione |
| Chiave privata | Un segreto che firma per il tuo account. Chi lo possiede controlla l'account |
| Codice di recupero | Un secondo segreto (inizia con `QRC1`) da cui nasce la tua chiave post-quantistica |
| Hash | L'ID univoco di una transazione. Serve per ritrovare la transazione |
| Gas e commissione | Il piccolo prezzo, pagato in QOR, perché la catena elabori una transazione |

:::caution Solo un account testnet usa e getta
Usa una chiave creata per questo esercizio, che contenga solo QOR di prova. Non usare mai un wallet reale né fondi reali. Non inserire mai nel file `.env` la chiave o il codice di recupero di un account che contiene denaro vero, e non condividere né fare commit di `.env`.
:::

## Prima di iniziare {#prerequisites}

Ti servono un computer con macOS, Windows o Linux, un terminale e un browser web. Per questo tutorial installi due strumenti: **Node.js 22 o successivo** (Hardhat 3, lo strumento di progetto usato qui, richiede la versione 22) e **pnpm** (lo strumento che scarica le librerie del progetto). Uno strumento facoltativo, **jq**, serve solo a rendere più leggibile l'output di una verifica.

Apri prima un terminale. Su macOS apri **Terminal**. Su Windows apri **PowerShell**. Su Linux apri la tua app terminale.

### Node.js 22 o successivo {#install-node}

1. Controlla se ce l'hai già:

```bash
node -v
```

Deve stampare `v22` o un numero più alto. Se stampa `command not found` o una versione più vecchia, installa Node.js come indicato sotto.

2. Installalo per il tuo sistema:

| Sistema | Come installare |
| --- | --- |
| macOS | Scarica l'installer da [nodejs.org/en/download](https://nodejs.org/en/download), oppure esegui `brew install node@22` se usi Homebrew |
| Windows | Esegui `winget install OpenJS.NodeJS.LTS` in PowerShell, oppure scarica l'installer da [nodejs.org/en/download](https://nodejs.org/en/download) |
| Linux | Esegui `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, chiudi e riapri il terminale, poi esegui `nvm install 22` |

3. Chiudi il terminale, aprine uno nuovo ed esegui di nuovo `node -v`.

**Cosa dovresti vedere:** un numero che inizia con `v22` o più alto, per esempio `v22.12.0`.

### pnpm {#install-pnpm}

1. Controlla se ce l'hai già:

```bash
pnpm -v
```

2. Se stampa `command not found` (oppure `pnpm: command not found`), installalo:

```bash
npm install -g pnpm
```

| Parte | Significato |
| --- | --- |
| `npm` | Lo strumento per i pacchetti che arriva con Node.js |
| `install` | Scarica e installa un programma |
| `-g` | Globale: installalo per tutto il computer, non per una sola cartella |
| `pnpm` | Il programma da installare |

Node.js installato con Homebrew non include pnpm. Per questo `pnpm: command not found` è comune su macOS: eseguire il comando qui sopra risolve il problema. Su Linux o macOS, se vedi un errore di permessi, esegui invece `corepack enable` e poi di nuovo `pnpm -v`.

3. Controlla di nuovo con `pnpm -v`.

**Cosa dovresti vedere:** un numero di versione, per esempio `9.12.0` o superiore.

### jq (facoltativo) {#install-jq}

`jq` trasforma una risposta lunga in una forma breve e leggibile. Si usa una sola volta, al passaggio 8.

| Sistema | Installazione | Controllo |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian e Ubuntu) | `jq --version` |

`curl`, usato al passaggio 8, è già presente su macOS, Linux e Windows 10 o successivo. In Windows PowerShell scrivi `curl.exe` al posto di `curl`.

## Il tuo wallet testnet e il faucet {#wallet}

Il progetto crea un proprio account usa e getta al passaggio 3, quindi non ti serve un wallet per completare questa guida. Ti serve però QOR di testnet in quell'account, e puoi anche configurare il wallet QoreX sulla testnet per usarlo con le app di esempio.

**QoreX sulla testnet (facoltativo qui, necessario per le app di esempio nel browser):**

1. Nell'**app QoreX**: apri **Impostazioni** e attiva **Use testnet (developers)**.
2. Nell'**estensione del browser QoreX**: sbloccala, tocca 7 volte il numero di versione in basso, poi scegli **Switch to testnet (diana)**.
3. Per tutto ciò che riguarda il lato Ethereum (EVM), scegli anche **Add an Ethereum account (coin 60)**. Ottieni così un account con un indirizzo `0x...` che funziona con gli strumenti Ethereum.

**Il faucet** è una macchina gratuita che distribuisce QOR di testnet. Lo usi al passaggio 4:

- Indirizzo: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). Prima effettui l'accesso.
- Importo: 100 QOR, una volta ogni 24 ore per account.
- La primissima transazione di un nuovo account registra la sua chiave post-quantistica ML-DSA-87. Costa una commissione una tantum di circa 0,09 QOR, quindi 100 QOR sono più che sufficienti.

I dettagli di rete usati in questa guida:

| Servizio | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM chain ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (passa a Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (accesso richiesto) |

## Passaggi {#steps}

### Passaggio 1: Controlla i tuoi strumenti {#step-1}

**Quanto tempo serve:** 1 minuto.

```bash
node -v
```

| Parte | Significato |
| --- | --- |
| `node` | Il programma Node.js |
| `-v` | Stampa la sua versione e termina |

```bash
pnpm -v
```

| Parte | Significato |
| --- | --- |
| `pnpm` | Lo strumento per i pacchetti |
| `-v` | Stampa la sua versione e termina |

**Cosa dovresti vedere:** `v22` o superiore per Node.js, e un numero di versione per pnpm. Altrimenti torna a "Prima di iniziare".

### Passaggio 2: Crea il progetto ed esegui i test {#step-2}

**Quanto tempo serve:** circa 1 minuto. Serve l'accesso a internet.

1. Crea il progetto in una nuova cartella. Nel terminale vai in una cartella dove tieni i tuoi progetti (per esempio la cartella Documenti), poi esegui:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

Cosa fa: scarica il creatore di progetti di QoreChain e costruisce un progetto già pronto chiamato `qday-demo` in una nuova cartella.

Parametri:

- `npx`: esegue un programma da internet senza installarlo in modo permanente.
- `create-qorechain-dapp@latest`: il creatore di progetti di QoreChain. `@latest` significa usa la versione più recente (questa guida è stata verificata con la 0.14.0).
- `qday-demo`: il nome della nuova cartella e del progetto. Puoi scegliere un altro nome.
- `-t hardhat`: `-t` significa template. Sceglie il template Hardhat: un progetto di contratti Solidity con test.
- `--network testnet`: con quale rete QoreChain dialoga il progetto. `testnet` è la rete di prova.
- `--package-manager pnpm`: quale strumento installa le librerie di cui il progetto ha bisogno.

**Cosa dovresti vedere:** un elenco di pacchetti installati e poi `Done! Created qday-demo`. Se chiede di installare `create-qorechain-dapp`, rispondi `y`.

2. Entra nella cartella del progetto:

```bash
cd qday-demo
```

Cosa fa: sposta il terminale nella nuova cartella. Tutti i comandi successivi si eseguono da qui.

Parametri:

- `cd`: cambia directory.
- `qday-demo`: la cartella in cui entrare.

3. Esegui i test:

```bash
pnpm test
```

Cosa fa: compila il contratto e verifica che funzioni, su una piccola catena simulata dentro il tuo computer. Non invia nulla alla vera testnet.

Parametri:

- `pnpm`: lo strumento per i pacchetti.
- `test`: il nome dello script da eseguire (elencato in `package.json`; esegue `hardhat test`).

**Cosa dovresti vedere:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. Guarda cosa hai ottenuto (facoltativo):

| File | Cos'è |
| --- | --- |
| `contracts/Counter.sol` | Lo smart contract: memorizza un numero e può aggiungere 1 |
| `ignition/modules/Counter.ts` | La ricetta che distribuisce il contratto |
| `scripts/window.ts` | L'helper dietro `pnpm window`: registra la tua chiave e apre la finestra di autorizzazione |
| `hardhat.config.ts` | Le impostazioni, compresa la rete `qorechainTestnet` (chain ID 9800) |
| `.env` | Il tuo file di impostazioni segrete. Lo compili al passaggio 3. Non condividerlo mai |

Altro sui template: [Scaffolder e CLI](/developer-tools/scaffolders-and-cli) e [Kit di sviluppo della catena](/developer-tools/chain-dev-sdk).

### Passaggio 3: Crea un account testnet usa e getta {#step-3}

**Quanto tempo serve:** 3 minuti.

L'account ha bisogno di due segreti: una **chiave privata** in stile Ethereum e un **codice di recupero** (inizia con `QRC1`) da cui nasce la chiave post-quantistica ML-DSA-87. Entrambi vanno nel file `.env` nella cartella del progetto. Il file resta privato sul tuo computer.

1. Crea una nuova chiave privata. Per prima cosa crea un piccolo file chiamato `make-key.mjs` dentro la cartella `qday-demo`, con questo contenuto (usa un qualsiasi editor di testo, come Blocco note, TextEdit in modalità testo semplice o nano):

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

Cosa fa questo file: genera una chiave privata casuale e la scrive nel tuo file `.env`, così non viene mai mostrata sullo schermo né copiata a mano.

2. Eseguilo:

```bash
node make-key.mjs
```

Cosa fa: esegue il piccolo file con Node.js.

Parametri:

- `node`: il programma Node.js.
- `make-key.mjs`: il file da eseguire.

**Cosa dovresti vedere:** `New private key saved in .env`. Eseguilo una sola volta: una seconda esecuzione crea un account diverso.

3. Crea un codice di recupero:

```bash
pnpm window recovery-code
```

Cosa fa: crea un nuovo codice di recupero e lo stampa.

Parametri:

- `pnpm window`: esegue l'helper della finestra del progetto (`scripts/window.ts`).
- `recovery-code`: l'azione: stampa un nuovo codice di recupero.

**Cosa dovresti vedere:** una lunga riga che inizia con `QRC1`, poi una nota su come conservarlo. Copia l'intera riga `QRC1...`.

4. Inserisci il codice in `.env`. Apri il file in un editor:

| Sistema | Comando |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

Trova la riga `QORE_PQC_RECOVERY_CODE=` e incolla il codice subito dopo il segno uguale, senza spazi e senza virgolette. Salva il file. Il risultato è simile a questo (sono mostrati dei segnaposto, i tuoi valori sono reali):

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

Cosa significa ogni riga:

- `PRIVATE_KEY`: il segreto che firma per la metà classica (secp256k1) del tuo account.
- `QORE_PQC_RECOVERY_CODE`: il segreto che genera la metà post-quantistica (ML-DSA-87).
- `QORE_NETWORK`: con quale rete dialoga l'helper. `testnet` è la rete di prova.

Lascia `.env` esattamente com'è. La stessa chiave e lo stesso codice ti danno ogni volta lo stesso account. Se perdi il file, ricomincia con un nuovo account. Non condividerlo mai e non farne mai il commit su git.

Preferisci una mnemonica (dodici parole)? Al posto della chiave e del codice, inserisci in `.env` `QORE_MNEMONIC="le tue dodici parole"`. Entrambe le chiavi derivano dalla stessa frase e non serve alcun codice di recupero. Usa una frase creata solo per questo esercizio.

5. Chiedi al progetto l'indirizzo del tuo nuovo account:

```bash
pnpm window status
```

Cosa fa: legge la catena pubblica e mostra il tuo account, la tua chiave post-quantistica e la tua finestra. Non cambia nulla.

Parametri:

- `pnpm window`: esegue l'helper della finestra.
- `status`: l'azione: mostra lo stato attuale.

**Cosa dovresti vedere:** tre righe (le tue mostrano indirizzi reali):

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copia l'indirizzo `qor1...`. È quello che darai al faucet. Entrambi gli indirizzi appartengono allo stesso account: `0x...` è la forma Ethereum e `qor1...` è la forma QoreChain.

### Passaggio 4: Ottieni QOR di testnet dal faucet {#step-4}

**Quanto tempo serve:** 2 minuti.

1. Apri il [faucet](https://dashboard.qorechain.io/faucet) nel browser ed effettua l'accesso.
2. Assicurati che la dashboard sia su **Testnet**.
3. Incolla il tuo indirizzo `qor1...`.
4. Seleziona **Request Tokens**.

**Cosa dovresti vedere:** una scheda con la scritta **Tokens Sent!** con 100 QOR (più alcuni token di prova del fest) e un link **View on Explorer**.

Il faucet paga una volta ogni 24 ore per account. Gli importi esatti sono su [Faucet](/dashboard/faucet). Ora controlla dal terminale:

```bash
pnpm window status
```

**Cosa dovresti vedere:** le stesse tre righe di prima. Il tuo account ora esiste sulla catena e può pagare le commissioni. Dice ancora che la chiave non è registrata. Questo viene dopo.

### Passaggio 5: Registra la tua chiave e apri la finestra {#step-5}

**Quanto tempo serve:** circa 2 minuti.

1. Registra la tua chiave ML-DSA-87. È un passaggio una tantum per ogni account:

```bash
pnpm window register
```

Per capire cosa fa la registrazione, leggi [Come la tua chiave post-quantistica viene legata al tuo account](/build-before-qday/key-binding).

Cosa fa: invia una transazione che dice alla catena quale chiave post-quantistica appartiene al tuo account. Costa una commissione una tantum di circa 0,09 QOR. La catena accetta questo unico messaggio firmato solo con la chiave classica, perché non c'è ancora alcuna chiave post-quantistica registrata.

Parametri:

- `pnpm window`: esegue l'helper della finestra.
- `register`: l'azione: registra la chiave.

**Cosa dovresti vedere:** `registered: <HASH>`. Se dice `The account already has a PQC key; nothing to do.`, va bene: prosegui.

2. Apri la finestra di autorizzazione:

```bash
pnpm window open
```

Cosa fa: invia una transazione a **firma ibrida** (entrambe le chiavi) che apre una breve finestra durante la quale le tue normali transazioni in stile Ethereum, come il deploy di un contratto, vengono ammesse.

Parametri:

- `pnpm window`: esegue l'helper della finestra.
- `open`: l'azione: apri una finestra. Per impostazione predefinita dura 600 blocchi e consente 5 transazioni. Puoi cambiarlo con `QORE_WINDOW_BLOCKS` e `QORE_WINDOW_TXS` in `.env`.

**Cosa dovresti vedere:** `opened: <HASH>`, poi una riga come `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. L'ultimo numero è il limite di spesa della finestra in uqor (3,75 QOR). Annota l'hash di `opened:`: lo verifichi al passaggio 8.

3. Attendi circa 10 secondi. L'apertura della finestra ha fatto avanzare il contatore dell'account (il nonce), e Hardhat aspetta che la catena si assesti.

### Passaggio 6: Compila il contratto {#step-6}

**Quanto tempo serve:** pochi secondi.

```bash
pnpm build
```

Cosa fa: trasforma il contratto Solidity nella forma che la catena esegue.

Parametri:

- `pnpm`: lo strumento per i pacchetti.
- `build`: lo script da eseguire (esegue `hardhat build`).

**Cosa dovresti vedere:** `Compiled 1 Solidity file` oppure `No contracts to compile`. Vanno bene entrambi: il test del passaggio 2 lo ha già compilato.

### Passaggio 7: Distribuisci il contratto sulla testnet {#step-7}

**Quanto tempo serve:** circa 30 secondi.

```bash
pnpm deploy:testnet
```

Cosa fa: invia il contratto alla testnet di QoreChain con Hardhat Ignition, usando la finestra che hai aperto. È una normale transazione EVM.

Parametri:

- `pnpm`: lo strumento per i pacchetti.
- `deploy:testnet`: lo script da eseguire. Esegue `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet`: distribuisce la ricetta `Counter.ts` sulla rete chiamata `qorechainTestnet` (chain ID 9800).

Quando Hardhat chiede `Confirm deploy to network qorechainTestnet (9800)?`, scrivi `y` e premi Invio.

**Cosa dovresti vedere:** `[ CounterModule ] successfully deployed` e una riga `CounterModule#Counter - 0x...`. Lo `0x...` è l'indirizzo del tuo contratto. Se vedi `HHE10402`, esegui di nuovo lo stesso comando (vedi Risoluzione dei problemi).

### Passaggio 8: Verifica la firma ibrida on-chain {#step-6-verify}

**Quanto tempo serve:** 3 minuti.

La transazione `opened:` del passaggio 5 è stata firmata con entrambe le chiavi. Chiunque può controllarla dall'endpoint REST pubblico.

1. Sostituisci `<HASH>` con quell'hash (senza `<` e `>`) ed esegui:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Cosa fa: chiede al server pubblico della testnet il record completo della tua transazione.

Parametri:

- `curl`: un programma che scarica un indirizzo web.
- `-s`: silenzioso, così nasconde la barra di avanzamento e mostra solo la risposta.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: l'indirizzo REST della testnet, seguito dall'hash della tua transazione.

**Cosa dovresti vedere:** un lungo blocco di testo. Cerca tre cose:

1. `"code": 0` dentro `tx_response`. Il codice 0 significa successo.
2. L'estensione `PQCHybridSignature`, che contiene la firma ML-DSA-87: **4.627 byte**, accanto alla firma secp256k1 di 64 byte.
3. In `events`, un evento di tipo `pqc_hybrid_verify` con l'attributo `status` impostato su `verified`.

2. Per stampare solo quell'evento (serve `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Cosa fa: scarica lo stesso record e lo passa a `jq`, che conserva solo l'evento di verifica.

Parametri:

- `|`: invia l'output del primo comando al secondo.
- `jq`: il programma filtro.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: scorre l'elenco degli eventi e tiene quelli il cui tipo è `pqc_hybrid_verify`.

**Cosa dovresti vedere:** un piccolo blocco di testo con `"status"` impostato su `"verified"`.

3. Guardala nell'explorer:
   1. Apri [explore.qore.network](https://explore.qore.network).
   2. Porta il selettore di rete su **Testnet**.
   3. Cerca l'hash.

**Cosa dovresti vedere:** la pagina della transazione mostra la sicurezza della firma come resistente ai computer quantistici, verificata on-chain, con l'algoritmo ML-DSA-87 (FIPS 204).

Questa è la prova: i validatori hanno controllato entrambe le firme. Questa è la tua transazione Quantum Pass.

## Cosa dovresti vedere, in sintesi {#what-you-should-see}

| Dove | Cosa |
| --- | --- |
| Dopo il passaggio 2 | `Done! Created qday-demo` e `2 passing` |
| Dopo il passaggio 3 | Un indirizzo `qor1...` e un indirizzo `0x...` da `pnpm window status`, con la chiave non registrata |
| Dopo il passaggio 4 | **Tokens Sent!** sul faucet |
| Dopo il passaggio 5 | `registered: <HASH>`, poi `opened: <HASH>` e la riga della finestra |
| Dopo il passaggio 7 | `CounterModule#Counter - 0x...` |
| Dopo il passaggio 8 | `code` 0, una firma ML-DSA-87 di 4.627 byte e `pqc_hybrid_verify` con `status` `verified`, nell'output REST e nell'explorer su Testnet |

## Pacchetti usati {#published}

Dichiarati nel `package.json` generato:

| Pacchetto | Registro | Versione |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

Lo scaffolder installa anche i plugin Hardhat toolbox, Ignition e keystore elencati nel `package.json` generato.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `HHE10402` o "wait for confirmations" subito dopo l'apertura della finestra | L'apertura della finestra ha fatto avanzare il nonce dell'account | Esegui di nuovo `pnpm deploy:testnet` |
| "EVM authorisation window exhausted" o "no window" | La finestra ha esaurito le transazioni o i blocchi, oppure è limitata a un altro contratto (una finestra limitata a un altro contratto blocca un deploy) | Esegui `pnpm window open` per aprire una nuova finestra, attendi circa 10 secondi, poi distribuisci di nuovo |
| "account has no PQC key and classical fallback is disabled" | L'account non ha registrato una chiave ML-DSA-87 | Esegui prima `pnpm window register`, poi `pnpm window open` |
| "does not exist on chain yet" | L'account non ha ancora QOR | Ottieni QOR dal faucet (passaggio 4) |
| "Rate Limit Reached" sul faucet, oppure nessun token dopo 30 secondi | Una richiesta ogni 24 ore per account e per indirizzo, e le richieste sono servite una alla volta | Attendi qualche secondo e riprova, oppure attendi che passino le 24 ore. Una sola richiesta ogni 24 ore |
| `pnpm: command not found` | pnpm non è installato. Node.js installato con Homebrew non lo include | Esegui `npm install -g pnpm`, poi apri un nuovo terminale |
| `pnpm window` si ferma con un messaggio su un codice di recupero mancante | `.env` ha `PRIVATE_KEY` senza `QORE_PQC_RECOVERY_CODE` | Esegui `pnpm window recovery-code` e incolla il codice in `.env` (passaggio 3), oppure usa `QORE_MNEMONIC` |
| "QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code" | Un errore di battitura, uno spazio o una virgoletta nell'incollare | Incolla di nuovo il codice senza spazi né virgolette |
| "registered, but NOT this key" in `pnpm window status` | In precedenza è stato usato un codice di recupero diverso per questo account | Rimetti in `.env` il codice di recupero originale, oppure ricomincia con un nuovo account |
| Errori CORS in un'app nel browser | Un browser blocca le chiamate verso un indirizzo della catena che non autorizza la tua pagina | Usa il percorso proxy `/lcd` del template per le chiamate REST dal browser, invece di chiamare direttamente l'indirizzo della catena |
| Hardhat si rifiuta di partire | Node.js è più vecchio della versione 22 | Installa Node.js 22 o successivo (vedi "Prima di iniziare") ed esegui di nuovo `pnpm install` |
| `curl` mostra `tx not found` subito dopo il passaggio | Il blocco non è ancora definitivo | Attendi 10 secondi ed esegui di nuovo il comando |
| `curl` non funziona in Windows PowerShell | Lì `curl` è un comando diverso | Scrivi `curl.exe` al posto di `curl` |

## Le app di esempio {#example-apps}

Lo stesso flusso, da diversi linguaggi e front end. Ognuna firma in modo ibrido. Sono tutte nel repository pubblico [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), cartella `workshop-1`. Per ottenerle ti serve Git (controlla con `git --version`; installalo da [git-scm.com](https://git-scm.com/downloads)), poi esegui:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Cosa fa: scarica una copia di tutte le app di esempio e entra nella cartella `workshop-1`.

Parametri:

- `git clone <address>`: copia un progetto da internet sul tuo computer.
- `cd build-before-qday/workshop-1`: entra nella cartella che contiene le sei app.

Ogni pagina di app è una guida completa dall'inizio alla fine, con ciò che serve installare e ciò che ti aspetta.

| App | Linguaggio | Pagina |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

I kit dietro queste app sono elencati in [Kit](/build-before-qday/workshop-1/kits). Per usare il wallet QoreX con una dApp nel browser, vedi [QoreX](/qorex/overview).
