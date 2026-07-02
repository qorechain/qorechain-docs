---
slug: /developer-guide/evm-development
title: Sviluppo EVM
sidebar_label: Sviluppo EVM
sidebar_position: 2
---

# Sviluppo EVM

QoreChain esegue un ambiente di esecuzione completamente compatibile con EVM tramite QoreChain EVM Engine, permettendoti di distribuire e interagire con smart contract Solidity utilizzando strumenti familiari. Il modulo EVM espone un'interfaccia JSON-RPC sulla **porta 8545** (WebSocket sulla **8546**) che supporta i flussi di lavoro standard di sviluppo Ethereum.

:::note
Gli esempi qui sotto sono rivolti alla mainnet **`qorechain-vladi`** (EVM chain ID **9801**), attiva dal 7 giugno 2026 ed eseguita sulla versione di chain **v3.1.82**. Per la testnet **`qorechain-diana`**, usa l'EVM chain ID **9800**.
:::

---

## Endpoint JSON-RPC

| Proprietà            | Valore                                     |
| -------------------- | ------------------------------------------ |
| URL predefinito      | `http://localhost:8545`                    |
| URL WebSocket        | `ws://localhost:8546`                      |
| Namespace supportati | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Simbolo valuta       | `QOR`                                      |

Il namespace `qor_` fornisce metodi specifici di QoreChain. Vedi [Namespace personalizzato](#custom-qor_-namespace) qui sotto.

---

## Configurazione del wallet (MetaMask)

Aggiungi QoreChain come rete personalizzata in MetaMask:

| Campo              | Valore mainnet            | Valore testnet          |
| ------------------ | ------------------------- | ----------------------- |
| Network Name       | QoreChain (qorechain-vladi) | QoreChain Diana       |
| RPC URL            | `http://localhost:8545`   | `http://localhost:8545` |
| Chain ID           | `9801`                    | `9800`                  |
| Currency Symbol    | `QOR`                     | `QOR`                   |
| Block Explorer URL | *(usa l'explorer ufficiale della mainnet)* | *(lascia vuoto per la testnet locale)* |

---

## Hardhat

Installa Hardhat e configura il tuo `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Distribuisci un contratto:

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Esegui i test sull'EVM di QoreChain:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Crea e distribuisci un contratto con Foundry:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Modello del gas

QoreChain usa un modello di **base fee dinamica EIP-1559** per le transazioni EVM:

* La base fee si adatta a ogni blocco in base all'utilizzo
* Gli utenti possono impostare `maxFeePerGas` e `maxPriorityFeePerGas`
* Le priority fee vanno al proponente del blocco

### Ponte tra denominazioni

Il token nativo QOR ha **6 cifre decimali** (`uqor`), mentre l'EVM si aspetta **18 cifre decimali**. Il modulo `x/precisebank` gestisce la conversione in modo trasparente:

| Contesto      | Denominazione | Decimali | Esempio                |
| ------------- | ------------- | -------- | ---------------------- |
| Chain nativa  | `uqor`        | 6        | `1000000 uqor = 1 QOR` |
| EVM           | wei           | 18       | `1e18 wei = 1 QOR`     |

Questa conversione è trasparente: quando controlli un saldo tramite `eth_getBalance`, la risposta è denominata in wei a 18 decimali. Quando lo stesso account viene interrogato tramite il modulo bank nativo, il saldo appare in `uqor` a 6 decimali.

---

## Coppie di token ERC-20

Il modulo `x/erc20` fornisce la registrazione automatica di **coppie di token** tra le denominazioni native di Cosmos SDK e i contratti ERC-20:

* I token nativi possono essere usati all'interno dei contratti EVM come ERC-20
* I token ERC-20 distribuiti sull'EVM possono essere convertiti in denominazioni native
* La conversione è bidirezionale e gestita a livello di protocollo

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## Compatibilità tra PQC ed EVM

Le transazioni EVM usano firme **ECDSA classiche (secp256k1)** per la piena compatibilità con gli strumenti, i wallet e le librerie Ethereum esistenti. Questo garantisce che MetaMask, Hardhat, Foundry, ethers.js e tutti gli strumenti EVM standard funzionino senza modifiche.

Per la sicurezza post-quantistica all'interno dell'EVM:

* Usa il **precompile PQC Verify** (`0x0000...0A01`) per verificare on-chain le firme ML-DSA-87 da Solidity. Vedi [EVM Precompiles](/developer-guide/evm-precompiles).
* I **messaggi cross-VM** dall'EVM verso CosmWasm o SVM possono essere firmati con PQC a livello del layer di transazione di Cosmos SDK.
* Gli account possono opzionalmente registrare chiavi pubbliche PQC tramite `x/pqc` per una sicurezza ibrida.

---

## Namespace personalizzato `qor_` {#custom-qor_-namespace}

QoreChain estende il JSON-RPC con un namespace `qor_` per query specifiche della chain:

| Metodo                      | Descrizione                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | Verifica se un account ha una chiave pubblica PQC registrata      |
| `qor_getAIStats`            | Recupera le statistiche del motore AI (conteggi anomalie, distribuzione del rischio) |
| `qor_getCrossVMMessage`     | Interroga lo stato di un messaggio cross-VM tramite ID            |
| `qor_getPoolClassification` | Ottiene la classificazione del pool del validatore (RPoS/DPoS/PoS) |
| `qor_getReputationScore`    | Interroga il punteggio di reputazione di un validatore            |
| `qor_getAbstractAccount`    | Recupera la configurazione di un abstract account                 |

Esempio con `curl`:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Prossimi passi

* [EVM Precompiles](/developer-guide/evm-precompiles) — Accedi alle funzionalità PQC, AI e cross-VM da Solidity
* [Cross-VM Interoperability](/developer-guide/cross-vm-interoperability) — Chiama contratti CosmWasm e SVM dall'EVM
* [Account Abstraction](/developer-guide/account-abstraction) — Account programmabili con session key
