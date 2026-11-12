---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Il Q-Day Counter è il più piccolo progetto EVM utile di QoreChain: un contratto Solidity che memorizza un numero, un progetto Hardhat che lo distribuisce sulla testnet `qorechain-diana` e un breve script che lo legge e lo incrementa. È il template `hardhat` di `create-qorechain-dapp`, con in più un piccolo script `interact`.

## Cosa mostra {#shows}

- **La firma ibrida fa parte del percorso di deploy.** Prima di qualsiasi transazione EVM, compreso il deploy di un contratto, l'account ha bisogno di una chiave ML-DSA-87 registrata e di una finestra di autorizzazione EVM attiva. La finestra si apre con un messaggio della lane nativa firmato sia con secp256k1 sia con ML-DSA-87 (ibrido), e la catena verifica entrambe le firme.
- **Una transazione firmata in modo ibrido, verificata on chain.** Il passo `pnpm window open` invia quella transazione. Puoi cercarla nell'explorer e vedere il verdetto della catena stessa.
- **I tuoi normali strumenti EVM continuano a funzionare.** Hardhat, Ignition e viem inviano normali transazioni Ethereum. La protezione post-quantistica sta nella finestra, quindi una chiave secp256k1 rubata da sola non può spendere dall'account.

Un computer quantistico abbastanza grande da rompere secp256k1 permetterebbe a un attaccante di falsificare le firme classiche. QoreChain richiede sull'account una seconda firma post-quantistica (ML-DSA-87, FIPS 204). Il Counter mostra l'intero ciclo di sviluppo con questa regola attiva: registrare la chiave, aprire una finestra, fare il deploy, chiamare, leggere.

## Prima di iniziare {#prerequisites}

Ti serve un terminale su macOS, Linux, oppure Windows con WSL o Git Bash, e questi strumenti:

| Strumento | Versione richiesta | Controlla con |
| --- | --- | --- |
| Git | qualsiasi versione recente | `git --version` |
| Node.js | 20.12 o più recente (consigliata 22 LTS) | `node --version` |
| pnpm | 9 o più recente | `pnpm --version` |

Installa Node.js da https://nodejs.org. Se `pnpm --version` fallisce, installa pnpm con `npm install -g pnpm` (oppure `corepack enable`) e ricontrolla.

Ti serve anche un account gratuito sulla [dashboard di QoreChain](https://dashboard.qorechain.io) per usare il faucet. In questa guida non usi mai un wallet reale: tutto ciò che segue usa un account testnet usa e getta, e i QOR di testnet non hanno alcun valore.

## Passo dopo passo {#steps}

### 1. Ottieni il codice {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. Installa le dipendenze {#step-install}

```sh
pnpm install
```

### 3. Esegui i test e la build {#step-test}

I test girano su una catena simulata locale. Non servono né una chiave né un account di rete.

```sh
pnpm test
pnpm build
```

Dovresti vedere `2 passing` per i test di `Counter`.

### 4. Crea il file della chiave testnet {#step-account}

Crea il file delle impostazioni dal template:

```sh
cp .env.example .env
```

Il file `.env` contiene una chiave usa e getta, quindi non farne mai il commit e non riutilizzare mai la chiave in nessun contesto reale. Apri `.env` in un editor qualsiasi. Compilerai due valori.

**a. Una chiave privata usa e getta.** Genera una chiave casuale da 32 byte:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copia il valore `0x...` stampato in `.env` come `PRIVATE_KEY=0x...`, sostituendo il segnaposto tutto a zero.

**b. Un codice di recupero post-quantistico.** La chiave ML-DSA-87 dell'account è derivata da un codice di recupero separato. Creane uno:

```sh
pnpm window recovery-code
```

Copia la riga `QRC1-...` stampata in `.env` come `QORE_PQC_RECOVERY_CODE=QRC1-...`. Conserva questo codice insieme alla chiave privata e riutilizza sempre lo stesso: un nuovo codice darebbe all'account una chiave ML-DSA-87 diversa.

Lascia vuoto `QORE_MNEMONIC` e mantieni `QORE_NETWORK=testnet`. Il tuo `.env` ora ha questo aspetto (sono mostrati i segnaposto):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. Mostra l'indirizzo del tuo account {#step-address}

```sh
pnpm window status
```

La prima riga stampa il tuo account come `0x...` e la sua forma `qor1...`. A questo punto indica anche che la chiave non è registrata e che non esiste alcuna finestra. Copia l'indirizzo `qor1...`.

### 6. Ricevi QOR di testnet dal faucet {#step-faucet}

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e richiedi i QOR (100 QOR una volta ogni 24 ore).
3. Attendi qualche secondo, poi esegui di nuovo `pnpm window status`. L'account ora esiste on chain.

### 7. Registra la chiave e apri la finestra {#step-window}

```sh
pnpm window register    # una volta: registra la tua chiave ML-DSA-87
pnpm window open        # firmata in modo ibrido: apre una finestra (600 blocchi, 5 transazioni)
sleep 10                # l'apertura della finestra fa avanzare il nonce dell'account
pnpm window status      # PQC key: registered, window: live
```

La registrazione è l'unico messaggio che la catena accetta firmato in modo classico, perché on chain non c'è ancora una chiave con cui confrontarlo. L'apertura della finestra è firmata in modo ibrido. Conserva l'hash della transazione stampato da `window open`: lo cercherai nell'ultimo passo.

### 8. Distribuisci il contratto {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, rispondi y quando chiede conferma
```

Il comando stampa l'indirizzo del `Counter` distribuito (`0x...`).

### 9. Leggi e incrementa {#step-interact}

```sh
pnpm interact           # legge count, increment(), rilegge, link all'explorer
pnpm interact --read    # solo lettura
```

### 10. Cercalo nell'explorer {#step-explorer}

1. Apri https://explore.qore.network e imposta il selettore di rete su **Testnet**.
2. Cerca l'hash stampato da `pnpm window open`. La transazione mostra una firma post-quantistica che la catena ha verificato.
3. Cerca l'hash della transazione `increment` stampato da `pnpm interact`, oppure l'indirizzo di `Counter` del passo 8, per vedere la chiamata al contratto.

L'[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) mostra lo stesso tipo di prova byte per byte.

## Cosa dovresti vedere {#result}

- `pnpm test` stampa `2 passing`.
- `pnpm window status` stampa l'account (`0x...` con la sua forma `qor1...`), `PQC key: registered` e `window: live` con i blocchi, le transazioni e il valore rimasti.
- `pnpm deploy:testnet` stampa l'indirizzo del `Counter` distribuito (`0x...`).
- `pnpm interact` stampa l'indirizzo del Counter, `count`, l'hash della transazione `increment`, `status: success` con il numero di blocco, il nuovo `count` e un link alla transazione nell'explorer.
- Nell'explorer (Testnet), la transazione `window open` è contrassegnata come verificata con entrambe le firme.

Se un passo fallisce, esegui prima `pnpm window status`: ti dice se manca la chiave o la finestra. Una transazione rifiutata dopo che la finestra è stata esaurita significa che devi aprirne una nuova con `pnpm window open`.

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

La parte firmata in modo ibrido di `scripts/window.ts` (il messaggio della finestra e il firmatario):

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

`acc` è l'account unificato derivato dal tuo materiale di chiavi e `net` è il record di rete per `QORE_NETWORK` (predefinito `testnet`, chain id `qorechain-diana`). La commissione usata dallo script è 100000 `uqor` con un limite di gas di 800000, perché le transazioni ibride sono grandi. La dimensione della finestra si può cambiare in `.env` con `QORE_WINDOW_BLOCKS` (predefinito 600), `QORE_WINDOW_TXS` (predefinito 5) e `QORE_WINDOW_MAX_UQOR`.

## Pacchetti usati {#packages}

| Pacchetto | Versione | Usato per |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Firma ibrida, registrazione della chiave PQC, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | Helper per la finestra EVM (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Trasmissione della transazione della lane nativa |
| `hardhat` | ^3.21.1 | Compilazione, test, deploy con Ignition |
| `viem` | ^2.47.6 | Lettura e scrittura del contratto |
| `tsx` | ^4.19.0 | Esecuzione degli script TypeScript |
| `typescript` | ^5.6.3 | Controllo dei tipi |

Puoi generare tu stesso lo stesso progetto con `npx create-qorechain-dapp my-app -t hardhat --network testnet`. Vedi [Scaffolder e CLI](/developer-tools/scaffolders-and-cli) e [Installare l'SDK](/sdk/install).

## Dettagli della rete {#networks}

| Voce | Valore |
| --- | --- |
| Rete | testnet `qorechain-diana` |
| EVM chain id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Sorgente: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
