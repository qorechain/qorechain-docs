---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Il Q-Day Guestbook è un libro degli ospiti on chain sulla testnet EVM di QoreChain. Chiunque può firmarlo una volta per indirizzo con un messaggio di massimo 140 caratteri. Ha due parti: un contratto Solidity con un progetto Hardhat (`contracts-app/`) e una pagina web React (`web/`) che collega il wallet QoreX, mostra la finestra EVM dell'account ed elenca in tempo reale le firme più recenti.

## Cosa mostra {#shows}

- **Una dApp nel browser che firma in modo ibrido senza saperlo.** La pagina è una normale app wagmi e RainbowKit. QoreX aggiunge la metà ML-DSA-87 della firma, quindi la stessa transazione è protetta sia da secp256k1 sia da una chiave post-quantistica.
- **La finestra EVM è visibile nell'interfaccia.** La pagina legge dalla catena la finestra dell'account e mostra se è attiva e quanti blocchi e transazioni restano.
- **Rifiuti leggibili.** Quando la catena rifiuta una scrittura, `classifyEvmWindowRejection` riconduce l'errore a una di quattro cause (nessuna chiave registrata, nessuna finestra, finestra esaurita, parametri non validi) e la pagina mostra la soluzione.
- **Firme ibride verificate on chain.** Ogni firma che scrivi è una transazione che la catena ha accettato solo dopo aver controllato entrambe le firme (ML-DSA-87 e secp256k1).

## Prima di iniziare {#prerequisites}

Ti serve un terminale su macOS, Linux, oppure Windows con WSL o Git Bash, e questi strumenti:

| Strumento | Versione richiesta | Controlla con |
| --- | --- | --- |
| Git | qualsiasi versione recente | `git --version` |
| Node.js | 20.12 o più recente (consigliata 22 LTS) | `node --version` |
| pnpm | 9 o più recente | `pnpm --version` |

Installa Node.js da https://nodejs.org. Se `pnpm --version` fallisce, installa pnpm con `npm install -g pnpm` (oppure `corepack enable`) e ricontrolla.

Ti serve anche un account gratuito sulla [dashboard di QoreChain](https://dashboard.qorechain.io) per il faucet e, per la parte nel browser, il wallet QoreX (l'estensione per un browser desktop, oppure l'app). Vedi [QoreX Integrations](/developer-tools/qorex-integrations) e la [panoramica di QoreX](/qorex/overview). Nei passi sui contratti non usi mai un wallet reale: usi un account testnet usa e getta. I QOR di testnet non hanno alcun valore.

## Passo dopo passo {#steps}

### 1. Ottieni il codice {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

Il progetto ha due cartelle che configuri separatamente.

### 2. Contratti: installa e testa {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

Dovresti vedere `3 passing` per i test di `QDayGuestbook`. Girano su una catena simulata locale e non richiedono alcuna chiave.

### 3. Contratti: crea il file della chiave testnet {#step-account}

```sh
cp .env.example .env
```

Il file `.env` contiene una chiave usa e getta, quindi non farne mai il commit e non riutilizzare mai la chiave in nessun contesto reale. Apri `.env` in un editor qualsiasi e compila due valori.

**a. Una chiave privata usa e getta.** Genera una chiave casuale da 32 byte:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copia il valore `0x...` stampato in `.env` come `PRIVATE_KEY=0x...`, sostituendo il segnaposto tutto a zero.

**b. Un codice di recupero post-quantistico.** La chiave ML-DSA-87 dell'account è derivata da un codice di recupero separato. Creane uno:

```sh
pnpm window recovery-code
```

Copia la riga `QRC1-...` stampata in `.env` come `QORE_PQC_RECOVERY_CODE=QRC1-...`. Riutilizza sempre lo stesso codice: un nuovo codice darebbe all'account una chiave ML-DSA-87 diversa.

Lascia vuoto `QORE_MNEMONIC` e mantieni `QORE_NETWORK=testnet`. Il tuo `.env` ora ha questo aspetto (sono mostrati i segnaposto):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. Contratti: finanzia l'account {#step-faucet}

```sh
pnpm window status
```

La prima riga stampa il tuo account come `0x...` e la sua forma `qor1...`. Copia l'indirizzo `qor1...`, poi:

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla l'indirizzo `qor1...` e richiedi i QOR (100 QOR una volta ogni 24 ore).
3. Attendi qualche secondo ed esegui di nuovo `pnpm window status`.

### 5. Contratti: registra la chiave, apri la finestra, fai il deploy {#step-window}

```sh
pnpm window register        # una volta: registra la tua chiave ML-DSA-87
pnpm window open            # firmata in modo ibrido: apre una finestra (600 blocchi, 5 transazioni)
sleep 10                    # l'apertura della finestra fa avanzare il nonce dell'account
pnpm deploy:testnet         # Hardhat Ignition, rispondi y quando chiede conferma
```

`pnpm deploy:testnet` stampa l'indirizzo di `QDayGuestbook` distribuito (`0x...`). Copialo. La registrazione è l'unico messaggio che la catena accetta firmato in modo classico, perché on chain non c'è ancora una chiave con cui confrontarlo. L'apertura della finestra è firmata in modo ibrido; conserva l'hash della transazione che stampa.

### 6. Contratti: firma dalla riga di comando {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # scrive una voce
pnpm sign --read                     # elenca le voci più recenti
```

Ogni indirizzo può firmare una volta, quindi un secondo `pnpm sign` dallo stesso account viene rifiutato dal contratto.

### 7. Pagina web: installa e configura {#step-web}

Apri un secondo terminale nella stessa cartella del progetto (oppure torna indietro con `cd ..`), poi:

```sh
cd web
pnpm install
cp .env.example .env
```

Apri `web/.env` e imposta l'indirizzo che hai copiato al passo 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Lascia vuoto `VITE_WALLETCONNECT_PROJECT_ID`: serve solo se aggiungi a `src/wagmi.ts` un wallet basato su WalletConnect.

### 8. Pagina web: avviala {#step-run}

```sh
pnpm dev
```

Apri http://localhost:5174 nel browser in cui è installato QoreX. La pagina legge la catena tramite l'RPC EVM. Legge la finestra EVM tramite REST attraverso il proxy Vite `/lcd`, perché l'endpoint REST pubblico non invia intestazioni CORS. L'elenco delle firme in fondo mostra già la voce che hai scritto al passo 6.

### 9. Firma da QoreX {#step-sign}

1. Installa QoreX e passalo alla testnet. Per il cambio di rete vedi [Deploy in 5 minuti](/getting-started/deploy-in-5-minutes#step-testnet).
2. In QoreX usa un account coin-60 (Ethereum) con una chiave ML-DSA-87 registrata, e finanzialo dal [faucet](/dashboard/faucet) (incolla il suo indirizzo dopo aver effettuato l'accesso).
3. Nella pagina scegli **Connect QoreX**, scrivi un messaggio e scegli **Sign**. QoreX propone di aprire la finestra EVM nella propria approvazione se non ce n'è una aperta.
4. Approva in QoreX.

### 10. Cercalo nell'explorer {#step-explorer}

Apri https://explore.qore.network e imposta il selettore di rete su **Testnet**. Cerca l'hash della transazione del passo 6 o 9, l'hash di `pnpm window open` oppure l'indirizzo di `QDayGuestbook`. La transazione della finestra mostra una firma post-quantistica che la catena ha verificato.

## Cosa dovresti vedere {#result}

- `pnpm test` in `contracts-app` stampa `3 passing`.
- `pnpm window status` stampa `PQC key: registered` e `window: live` con i blocchi e le transazioni rimasti.
- `pnpm deploy:testnet` stampa l'indirizzo di `QDayGuestbook` (`0x...`).
- `pnpm sign "..."` stampa l'hash della transazione e `status: success in block ...`.
- Nella pagina, il passo 1 mostra il tuo account `0x...`, la catena `qorechain-diana EVM (9800)`, il tuo saldo e la finestra EVM come `live` con i blocchi e le transazioni rimasti.
- Dopo aver scelto **Sign** e approvato in QoreX, compare un link alla transazione nell'explorer, poi `success in block ...`.
- L'elenco in fondo mostra il numero di firme on chain e le voci più recenti (fino a 20), dalla più nuova, aggiornato ogni pochi secondi.
- Un secondo tentativo dallo stesso indirizzo mostra che l'indirizzo ha già firmato.

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
| `@qorechain/sdk` | ^0.13.0 | Script helper per la finestra, firma ibrida |
| `@qorechain/evm` | ^0.13.0 | Definizioni della catena, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Trasmissione del messaggio della finestra |
| `hardhat` | ^3.21.1 | Compilazione, test, deploy con Ignition |
| `viem` | ^2.47.6 | Client Ethereum |
| `tsx` | ^4.19.0 | Esecuzione degli script TypeScript |
| `typescript` | ^5.6.3 | Controllo dei tipi |

Pagina web (`web/`):

| Pacchetto | Versione | Usato per |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Definizioni della catena, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX come wallet RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Pulsante di connessione |
| `wagmi` | ^2.19.5 | Hook React per letture e scritture |
| `viem` | ^2.53.1 | Client Ethereum |
| `@tanstack/react-query` | ^5.59.0 | Recupero dei dati per la finestra e le letture dalla catena |
| `react`, `react-dom` | ^18.3.1 | Interfaccia |
| `vite` | ^5.4.0 | Server di sviluppo |
| `@vitejs/plugin-react` | ^4.3.0 | Supporto React per Vite |
| `typescript` | ^5.6.3 | Controllo dei tipi |

Sorgente: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
