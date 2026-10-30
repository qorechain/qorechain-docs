---
slug: /getting-started/wallet-setup
title: Configurazione del wallet
sidebar_label: Configurazione del wallet
sidebar_position: 2
---

# Configurazione del wallet

QoreChain supporta diversi tipi di wallet nei suoi ambienti di esecuzione nativo, EVM e SVM. Scegli il wallet più adatto al tuo caso d'uso.

:::note
I valori riportati di seguito coprono sia la mainnet **`qorechain-vladi`** (chain ID EVM **9801**, attiva dal 7 giugno 2026, release v3.2.5 dal 29 ottobre 2026) sia la testnet **`qorechain-diana`** (chain ID EVM **9800**, release v3.2.6 dal 27 ottobre 2026). Gli endpoint pubblici di entrambe le reti sono elencati in [Reti](/appendix/networks#public-endpoints).
:::

## QoreX (consigliato) {#qorex}

**QoreX** è il wallet QoreChain ufficiale e non custodial — un'app mobile (Android, iOS) e un'estensione del browser (Chrome, Firefox, Safari su macOS). Firma ogni trasferimento della corsia Native con la firma ibrida post-quantistica obbligatoria, registra per te la tua chiave post-quantistica, supporta lo staking, gli @handle e le reti esterne, e si abbina alla Dashboard. Apre inoltre la [finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window) di cui hanno bisogno le transazioni MetaMask. Inizia dalla [guida a QoreX](/qorex/overview) e da [Primi passi](/qorex/getting-started).

## Wallet Keplr

Keplr può aggiungere QoreChain come chain personalizzata (vedi sotto) per visualizzare i saldi e ricevere fondi sulla corsia Native. Poiché QoreChain richiede una co-firma post-quantistica sulla corsia Native, invia, esegui lo staking e vota con un wallet compatibile con PQC come [QoreX](/qorex/overview) anziché con Keplr da solo.

### Aggiungere QoreChain come chain personalizzata

Apri Keplr e vai su **Settings > Add Custom Chain**, quindi inserisci:

| Campo              | Mainnet                    | Testnet                          |
| ------------------ | -------------------------- | -------------------------------- |
| Nome della chain    | `QoreChain`                | `QoreChain Diana Testnet`        |
| Chain ID            | `qorechain-vladi`          | `qorechain-diana`                |
| URL RPC             | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| URL REST            | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Prefisso Bech32     | `qor`                      | `qor`                            |
| Denominazione della moneta | `QOR`               | `QOR`                            |
| Denominazione minima della moneta | `uqor`       | `uqor`                           |
| Decimali            | `6`                        | `6`                              |
| Coin Type (BIP-44)  | `118`                      | `118`                            |

Dopo aver aggiunto la chain, Keplr genera un indirizzo `qor1...` per il tuo account.

:::caution Prezzo minimo del gas
Il prezzo minimo del gas della rete è **0.1uqor**. Se configuri i livelli di prezzo del gas di Keplr (ad es. tramite `suggestChain`), usa valori **pari o superiori a 0.1** (valori basso/medio/alto suggeriti: `0.1 / 0.15 / 0.25`) — le transazioni firmate sotto la soglia minima vengono rifiutate.
:::

## MetaMask (EVM)

MetaMask consente di interagire con l'ambiente di esecuzione EVM di QoreChain — distribuire contratti Solidity, gestire token ERC-20 e utilizzare i consueti strumenti Ethereum.

### Aggiungere QoreChain come rete personalizzata

Apri MetaMask e vai su **Settings > Networks > Add Network**, quindi inserisci:

| Campo              | Mainnet                   | Testnet                          |
| ------------------ | ------------------------- | -------------------------------- |
| Nome della rete       | `QoreChain`               | `QoreChain Diana Testnet`        |
| URL RPC               | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Chain ID              | `9801`                    | `9800`                           |
| Simbolo della valuta  | `QOR`                     | `QOR`                            |
| URL del block explorer | `https://explore.qore.network` | `https://explore.qore.network` |

Il QOR nativo ha **18 decimali** sull'interfaccia EVM (in stile wei). Una volta connesso, puoi usare MetaMask per firmare transazioni EVM, interagire con gli smart contract distribuiti e gestire token ERC-20 su QoreChain.

:::caution EVM / MetaMask richiede una chiave PQC e una finestra aperta
MetaMask firma ancora normalmente, ma la corsia EVM ammette transazioni solo da un account che abbia una chiave post-quantistica registrata e una **finestra di autorizzazione EVM** aperta (v3.2.0 e successive). Registra la tua chiave una sola volta, poi apri una finestra prima di una sessione di attività EVM — consulta [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window). MetaMask non può aprire la finestra da solo; aprila in [QoreX](/qorex/security-and-recovery#evm-window) o con la CLI. L'aggiunta della rete a MetaMask (sopra) resta invariata.
:::

### Registrazione della rete con una sola chiamata

Per le dApp, il pacchetto **`@qorechain/wallet-adapter`** (pubblicato su npm) registra QoreChain nel wallet dell'utente con una sola chiamata — chiedendo a MetaMask di aggiungere la rete tramite EIP-3085 (con il QOR nativo corretto a **18 decimali** sul binario EVM) — e fornisce `qoreChainInfo` per il suggerimento di chain di Keplr (incluso il livello di prezzo del gas):

```bash
npm install @qorechain/wallet-adapter
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// pass the EIP-1193 provider and the network parameters (rpcUrl is required)
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801,                       // 9800 for the testnet
  rpcUrl: "https://evm.qore.host",        // https://evm-testnet.qore.host for the testnet
  explorerUrl: "https://explore.qore.network",
  testnet: false,                         // true for the testnet
});
```

## Un account, tre indirizzi (account unificati) {#unified-accounts}

A partire dalla versione della chain **v3.1.83**, un account QoreChain è **un'unica identità a 20 byte con tre codifiche**: `qor1…` (Native), `0x…` (EVM) e una forma base58 (SVM). Possiede **un unico saldo** e — per gli account eth-native — **firma su tutte e tre le corsie con un'unica chiave**, inclusa la firma ibrida post-quantistica richiesta sul percorso Native.

Genera un wallet unificato in codice con `@qorechain/wallet-adapter`:

```js
import { generateQoreWallet } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();          // or walletFromMnemonic(mnemonic)
console.log(w.cosmos);                         // qor1...
console.log(w.evm);                            // 0x... (same identity)
console.log(w.svm);                            // base58 (same identity)
// Native-lane sends use signHybridEth (classical eth_secp256k1 + ML-DSA-87 hybrid); pass `rest` so the sign-bytes form is resolved.
```

I fondi inviati a una qualsiasi delle tre forme confluiscono nello stesso saldo.

## Wallet collegati: Phantom e MetaMask come chiavi di spesa {#linked-wallets}

:::caution Disattivato sulla mainnet, attivo sulla testnet
Le funzionalità di smart account e di wallet collegati sono implementate ma **disattivate sulla mainnet** (`abstractaccount.enabled = false`): lì la registrazione di un authenticator e l'esecuzione tramite uno di essi vengono rifiutate finché il flag è disattivato. Sulla testnet sono **attive** (`enabled = true`, verificato il 27 ottobre 2026), quindi puoi provare lì un flusso di collegamento. Controlla `GET /qorechain/abstractaccount/v1/config` sulla rete di destinazione prima di offrire un flusso di collegamento. La sezione seguente descrive il comportamento previsto.
:::

Progettato in modo che non sia necessario esporre la propria chiave radice per spendere da un account QoreChain in una dApp (introdotto nella versione della chain **v3.1.85**): una chiave **Phantom** (ed25519) o **MetaMask** (tramite il suo indirizzo Ethereum, via `personal_sign`) può essere **registrata come authenticator** sul tuo account — con permessi delimitati, limiti di spesa, una scadenza e revoca istantanea — e quindi autorizzare trasferimenti inoltrati dal backend della dApp. Consulta [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) per il modello completo e il codice, e la [guida agli authenticator dell'SDK](/sdk/guides/authenticators) per esempi end-to-end.

## Wallet Solana (SVM)

:::caution L'invio di transazioni SVM è attualmente disabilitato
La corsia di esecuzione SVM è **attualmente disabilitata a livello di rete per l'invio di transazioni** — non inviare transazioni tramite un wallet compatibile con Solana verso QoreChain in questo momento. La lettura di saldi/slot potrebbe ancora funzionare; consulta [SVM Development](/developer-guide/svm-development) per lo stato attuale.
:::

L'ambiente di esecuzione SVM di QoreChain è compatibile con gli strumenti Solana standard, e il **saldo di QOR nativo dell'account è visibile direttamente sull'interfaccia SVM** (in lamports, 9 decimali; 1 uqor = 1.000 lamports). Connetti qualsiasi wallet o libreria compatibile con Solana.

### Usare @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Gli endpoint SVM pubblici sono **di sola lettura**; l'invio di transazioni richiede un nodo proprio. Consulta [SVM Development](/developer-guide/svm-development) per i dettagli.

## Wallet con supporto PQC (obbligatorio sul percorso Cosmos)

QoreChain richiede la crittografia ibrida post-quantistica (PQC) sul percorso di transazione cosmos. Sulle reti attive (v3.2.x) il valore predefinito della rete è `hybrid_signature_mode = required` con `allow_classical_fallback = false` — quindi **ogni transazione sul percorso cosmos deve includere una firma ML-DSA-87 (Dilithium-5) accanto alla firma standard secp256k1 (ECDSA)**. Le transazioni cosmos con la sola firma classica provenienti da un account PQC vengono rifiutate.

:::caution Le tx Cosmos richiedono l'estensione ibrida PQC
L'invio di una semplice transazione classica sul percorso cosmos verrà rifiutato. Devi allegare la firma Dilithium-5 come estensione di transazione `PQCHybridSignature`. Gli strumenti standard CosmJS / Keplr non producono questa estensione da soli — usa il comando CLI `qorechaind tx pqc cosign`, la firma ibrida dell'SDK QoreChain (vedi sotto) oppure, per costruirla tu stesso in codice, la libreria open source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Le uniche esenzioni sono le gentx di genesi, le transazioni di registrazione/migrazione delle chiavi PQC e un unjail da un account operatore che non ha alcuna chiave registrata.
:::

### Come funziona

I wallet allegano una firma PQC ML-DSA-87 come estensione di transazione accanto alla firma standard secp256k1 (ECDSA). La firma classica viene calcolata su sign bytes che escludono l'estensione, così rimane valida per la verifica classica mentre la firma PQC fornisce la resistenza quantistica.

### Generare una chiave Dilithium-5

Genera una chiave post-quantistica per la firma ibrida:

```bash
qorechaind tx pqc gen-key mypqc
```

Il comando accetta un nome di chiave e memorizza la chiave in `~/.qorechaind/pqc/<name>.dilithium` (modalità `0600`, non cifrata). Richiede il binario di rilascio ufficiale `qorechaind`.

### Registrare la tua chiave (una sola volta) {#register-your-key}

Una chiave post-quantistica viene **registrata esplicitamente**, una sola volta per account, con una transazione di registrazione della chiave. Quell'unica transazione (e la migrazione della chiave) può essere firmata in modo classico così che un account nuovo di zecca possa inizializzarsi; dopo di essa, ogni transazione della corsia Cosmos deve includere la firma ibrida.

```bash
# register the public key printed by gen-key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-vladi --gas 600000 --fees 60000uqor
```

Dalla v3.2.3 puoi allegare una prova di possesso opzionale registrando con `qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key mypqc --from mykey ...`; la chain rifiuta inoltre chiavi deboli, degeneri o già utilizzate. Esegui il backup del file della chiave PQC con la stessa cura con cui conservi la tua mnemonica. (Una chiave può essere ri-derivata dalla mnemonica con `qorechaind tx pqc recover-key` e sostituita con `tx pqc rotate-key`.) QoreX e l'SDK QoreChain registrano la chiave per te. Consulta [Prima transazione](/getting-started/first-transaction#register-pqc-key) per un invio firmato completo.

### Firma ibrida con l'SDK

L'SDK QoreChain produce transazioni conformi della corsia Cosmos tramite `buildHybridTx`, che allega l'estensione Dilithium-5. La chiave dell'account deve essere già registrata (vedi sopra). Consulta [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).

### Modalità PQC

Le tre modalità di applicazione restano controllate dalla governance; il **valore predefinito attuale della rete è Required**:

| Modalità               | Descrizione                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| **Disabled**           | La verifica PQC è disattivata. Solo firme standard.                     |
| **Optional**           | Le transazioni possono includere firme PQC. Se presenti, vengono verificate. |
| **Required** (predefinita) | Tutte le transazioni sul percorso cosmos devono includere una firma PQC valida. |

La modalità attiva è configurata a livello di chain e può essere aggiornata tramite governance.

:::caution EVM / MetaMask richiede una chiave PQC e una finestra aperta
Il flusso MetaMask (EVM) descritto sopra non porta l'estensione ibrida, ma dalla v3.2.0 la corsia EVM ammette transazioni solo da un account con una chiave post-quantistica registrata e una **finestra di autorizzazione EVM** aperta. Consulta [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).
:::

## Wallet da CLI

Il binario `qorechaind` include un sistema integrato di gestione delle chiavi per l'uso da riga di comando.

### Creare una nuova chiave

```bash
qorechaind keys add mykey
```

Questo comando genera una nuova coppia di chiavi e mostra la frase mnemonica. **Conserva la mnemonica in modo sicuro** — è l'unico modo per recuperare questa chiave.

### Visualizzare il tuo indirizzo

```bash
qorechaind keys show mykey -a
```

Questo comando restituisce il tuo indirizzo bech32 `qor1...`.

### Elencare tutte le chiavi

```bash
qorechaind keys list
```

### Importare una chiave esistente

```bash
qorechaind keys add mykey --recover
```

Ti verrà chiesto di inserire la tua frase mnemonica.

## Prossimi passi

* [La tua prima transazione](/getting-started/first-transaction) — Invia token QOR con il tuo nuovo wallet
* [Connettersi alla testnet](/getting-started/connecting-to-testnet) — Unisciti alla testnet Diana attiva
