---
slug: /getting-started/wallet-setup
title: Configurazione del wallet
sidebar_label: Configurazione del wallet
sidebar_position: 2
---

# Configurazione del wallet

QoreChain supporta diversi tipi di wallet nei suoi ambienti di esecuzione nativo, EVM e SVM. Scegli il wallet più adatto al tuo caso d'uso.

:::note
I chain ID e gli endpoint RPC riportati di seguito si riferiscono alla testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026; i relativi valori di connessione del wallet sono documentati nella pagina separata **Connessione alla Mainnet**.
:::

## Keplr Wallet

Keplr è il wallet consigliato per le transazioni native di QoreChain, lo staking e la governance.

### Aggiungi QoreChain come chain personalizzata

Apri Keplr e vai su **Settings > Add Custom Chain**, quindi inserisci:

| Campo              | Valore                    |
| ------------------ | ------------------------- |
| Chain Name         | `QoreChain Diana Testnet` |
| Chain ID           | `qorechain-diana`         |
| RPC URL            | `http://localhost:26657`  |
| REST URL           | `http://localhost:1317`   |
| Bech32 Prefix      | `qor`                     |
| Coin Denom         | `QOR`                     |
| Coin Minimal Denom | `uqor`                    |
| Decimals           | `6`                       |

Dopo aver aggiunto la chain, Keplr genera un indirizzo `qor1...` per il tuo account. Usa questo indirizzo per ricevere token QOR di testnet.

## MetaMask (EVM)

MetaMask consente di interagire con l'ambiente di esecuzione EVM di QoreChain: distribuire contratti Solidity, gestire token ERC-20 e utilizzare i consueti strumenti di Ethereum.

### Aggiungi QoreChain come rete personalizzata

Apri MetaMask e vai su **Settings > Networks > Add Network**, quindi inserisci:

| Campo           | Valore                  |
| --------------- | ----------------------- |
| Network Name    | `QoreChain EVM`         |
| RPC URL         | `http://localhost:8545` |
| Chain ID        | `9800`                  |
| Currency Symbol | `QOR`                   |

Una volta connesso, puoi usare MetaMask per firmare transazioni EVM, interagire con smart contract distribuiti e gestire token ERC-20 su QoreChain.

### Registrazione della rete con una sola chiamata

Per le dApp, i pacchetti **`@qorechain/wallet-adapter`** e **`@qorechain/connect`** (pubblicati su npm, v0.1.0) registrano QoreChain nel wallet dell'utente con una sola chiamata, richiedendo a MetaMask di aggiungere la rete tramite EIP-3085 (con il corretto QOR nativo a **18 decimali** sul binario EVM) e configurando lo step del prezzo del gas di Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Wallet Solana (SVM)

L'ambiente di esecuzione SVM di QoreChain è compatibile con gli strumenti standard di Solana. Connetti qualsiasi wallet o libreria compatibile con Solana per interagire con i programmi SVM.

### Utilizzo di @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Questo consente la distribuzione e l'interazione con i programmi SVM in esecuzione su QoreChain.

## Wallet abilitati alla PQC (obbligatori sul percorso Cosmos)

QoreChain richiede la crittografia post-quantistica (PQC) ibrida sul percorso di transazione cosmos. A partire dalla versione attuale della chain (**v3.1.80**), il valore predefinito della rete è `hybrid_signature_mode = required` con `allow_classical_fallback = false`: pertanto **ogni transazione sul percorso cosmos deve includere una firma ML-DSA-87 (Dilithium-5) insieme alla firma standard secp256k1 (ECDSA)**. Le transazioni cosmos esclusivamente classiche provenienti da un account PQC vengono rifiutate.

:::caution Le transazioni cosmos richiedono l'estensione PQC ibrida
L'invio di una semplice transazione classica sul percorso cosmos verrà rifiutato. Devi allegare la firma Dilithium-5 come estensione di transazione `PQCHybridSignature`. Gli strumenti standard CosmJS / Keplr non producono questa estensione da soli: usa il comando CLI `qorechaind tx pqc cosign`, la firma ibrida dell'SDK di QoreChain (vedi sotto) oppure, per costruirla autonomamente nel codice, la libreria open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Le uniche eccezioni sono i gentx di genesi e le transazioni di registrazione/migrazione delle chiavi PQC.
:::

### Come funziona

I wallet allegano una firma PQC ML-DSA-87 come estensione di transazione insieme alla firma standard secp256k1 (ECDSA). La firma classica viene calcolata sui sign bytes che escludono l'estensione, in modo che rimanga valida per la verifica classica, mentre la firma PQC fornisce resistenza quantistica.

### Genera una chiave Dilithium-5

Genera una chiave post-quantistica per la firma ibrida:

```bash
qorechaind tx pqc gen-key
```

### Registrazione automatica

Quando includi una chiave pubblica PQC nella tua prima transazione, QoreChain la registra automaticamente on-chain. Non è necessario alcun passaggio di registrazione separato. (Le transazioni di registrazione/migrazione delle chiavi PQC sono esse stesse esenti dal requisito ibrido, in modo che un account possa effettuare il bootstrap della sua prima chiave.)

### Firma ibrida con l'SDK

L'SDK di QoreChain produce transazioni cosmos conformi tramite `buildHybridTx` con `includePqcPublicKey: true`, che allega l'estensione Dilithium-5 e incorpora la chiave pubblica per la registrazione automatica. Vedi [Account e firma PQC dell'SDK](/sdk/concepts/accounts-pqc).

### Modalità PQC

Le tre modalità di applicazione restano controllate dalla governance; il **valore predefinito attuale della rete è Required**:

| Modalità               | Descrizione                                                                      |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Disabled**           | La verifica PQC è disattivata. Solo firme standard.                             |
| **Optional**           | Le transazioni possono includere firme PQC. Se presenti, vengono verificate.    |
| **Required** (default) | Tutte le transazioni sul percorso cosmos devono includere una firma PQC valida. |

La modalità attiva è configurata a livello di chain e può essere aggiornata tramite la governance.

:::note EVM / MetaMask non interessati
Il flusso MetaMask (EVM) descritto sopra **non** è interessato dal requisito ibrido. Le transazioni EVM utilizzano un percorso ante `eth_secp256k1` separato e non necessitano mai dell'estensione PQC.
:::

## Wallet da riga di comando (CLI)

Il binario `qorechaind` include un sistema di gestione delle chiavi integrato per l'uso da riga di comando.

### Crea una nuova chiave

```bash
qorechaind keys add mykey
```

Questo genera una nuova coppia di chiavi e mostra la frase mnemonica. **Conserva la frase mnemonica in modo sicuro**: è l'unico modo per recuperare questa chiave.

### Visualizza il tuo indirizzo

```bash
qorechaind keys show mykey -a
```

Questo restituisce il tuo indirizzo bech32 `qor1...`.

### Elenca tutte le chiavi

```bash
qorechaind keys list
```

### Importa una chiave esistente

```bash
qorechaind keys add mykey --recover
```

Ti verrà richiesto di inserire la tua frase mnemonica.

## Prossimi passi

* [La tua prima transazione](/getting-started/first-transaction) — Invia token QOR utilizzando il tuo nuovo wallet
* [Connessione alla Testnet](/getting-started/connecting-to-testnet) — Unisciti alla testnet Diana attiva
