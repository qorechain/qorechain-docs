---
slug: /developer-guide/evm-development
title: Sviluppo EVM
sidebar_label: Sviluppo EVM
sidebar_position: 2
---

# Sviluppo EVM

QoreChain esegue un ambiente di esecuzione completamente compatibile con EVM sul QoreChain EVM Engine, che consente di distribuire e interagire con smart contract Solidity utilizzando strumenti familiari. Il modulo EVM espone un'interfaccia JSON-RPC sulla **porta 8545** (WebSocket sulla **8546**) che supporta i flussi di lavoro di sviluppo Ethereum standard.

:::note
Gli esempi seguenti fanno riferimento alla mainnet **`qorechain-vladi`** (Chain ID EVM **9801**), attiva dal 29 giugno 2026, che esegue la release di nodo **v3.2.1** (regole di consenso dell'upgrade v3.2.0). Per la testnet **`qorechain-diana`** (v3.2.2), usa il Chain ID EVM **9800**. Gli esempi di codice usano `http://localhost:8545` per un nodo gestito da te; l'endpoint pubblico della mainnet è `https://evm.qore.host` e quello della testnet è `https://evm-testnet.qore.host`.
:::

:::caution Una transazione EVM richiede una chiave PQC registrata e una finestra di autorizzazione aperta
A partire dall'upgrade v3.2.0 (altezza 2,981,742 sulla mainnet, altezza 5,920,000 sulla testnet) la corsia EVM ammette una transazione solo da un account che abbia **(1) una chiave post-quantistica ML-DSA-87 registrata** e **(2) una finestra di autorizzazione EVM aperta** che abbia ancora spazio per essa. Firmi con strumenti ordinari (MetaMask, ethers.js, Hardhat, Foundry), ma senza una chiave registrata e una finestra aperta `eth_sendRawTransaction` viene rifiutato (codespace `pqc`, codici 26, 27 o 28). Le letture, `eth_call` e la stima del gas non richiedono né l'una né l'altra. Vedi [Finestra di autorizzazione EVM](#evm-window) qui sotto e la guida passo passo in [La tua prima transazione](/getting-started/first-transaction#evm-window).
:::

---

## Endpoint JSON-RPC

| Proprietà                | Valore                                     |
| ------------------------ | ------------------------------------------ |
| URL predefinito           | `http://localhost:8545`                    |
| URL WebSocket             | `ws://localhost:8546`                      |
| Namespace supportati      | `eth_`, `web3_`, `net_`, `txpool_`          |
| Chain ID (mainnet)        | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)        | `9800` (`qorechain-diana`)                 |
| Simbolo della valuta      | `QOR`                                      |

Le letture specifiche di QoreChain sono servite tramite REST (`api.qore.host`); il namespace JSON-RPC `qor_` descritto [più sotto](#custom-qor_-namespace) **non è abilitato** sugli endpoint pubblici né nella configurazione predefinita del nodo.

---

## Configurazione del wallet (MetaMask)

Aggiungi QoreChain come rete personalizzata in MetaMask:

| Campo                    | Valore Mainnet               | Valore Testnet           |
| ------------------------ | ----------------------------- | ------------------------- |
| Nome rete                | QoreChain (qorechain-vladi)  | QoreChain Diana           |
| URL RPC                  | `https://evm.qore.host`       | `https://evm-testnet.qore.host` |
| Chain ID                 | `9801`                        | `9800`                    |
| Simbolo valuta           | `QOR`                         | `QOR`                     |
| URL Block Explorer       | `https://explore.qore.network` | *(facoltativo)* |

L'invio da MetaMask richiede inoltre una chiave PQC registrata e una [finestra di autorizzazione EVM](#evm-window) aperta sull'account.

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

Distribuisci un contratto (l'account che effettua il deploy richiede una chiave PQC registrata e una [finestra di autorizzazione](#evm-window) aperta; un deploy conta come una transazione EVM nella finestra):

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

QoreChain utilizza un modello a **base fee dinamica EIP-1559** per le transazioni EVM:

* La base fee si adegua per ogni blocco in base all'utilizzo
* Gli utenti possono impostare `maxFeePerGas` e `maxPriorityFeePerGas`
* Le priority fee vanno al proponente del blocco

### Ponte di denominazione

Il token nativo QOR ha **6 cifre decimali** (`uqor`), mentre l'EVM prevede **18 cifre decimali**. Il modulo `x/precisebank` gestisce la conversione in modo trasparente:

| Contesto        | Denominazione | Decimali | Esempio                |
| ---------------- | ------------- | -------- | ----------------------- |
| Chain nativa      | `uqor`        | 6        | `1000000 uqor = 1 QOR` |
| EVM               | wei           | 18       | `1e18 wei = 1 QOR`      |

Questa conversione è trasparente: quando controlli un saldo tramite `eth_getBalance`, la risposta è denominata in wei a 18 decimali. Quando lo stesso account viene interrogato tramite il modulo bank nativo, il saldo appare in `uqor` a 6 decimali.

---

## Coppie di token ERC-20

Il modulo `x/erc20` fornisce **coppie di token** tra le denominazioni native Cosmos SDK e i contratti ERC-20:

* I token nativi possono essere usati all'interno dei contratti EVM come ERC-20
* I token ERC-20 distribuiti sull'EVM possono essere convertiti in denominazioni native
* La conversione è bidirezionale e viene gestita a livello di protocollo

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Queste sono transazioni della corsia Cosmos: sulle reti live richiedono anche la cofirma post-quantistica ibrida (costruisci con `--generate-only`, poi `qorechaind tx pqc cosign`; vedi [Firma post-quantistica](/developer-guide/post-quantum-signing)). Le coppie di token vengono registrate secondo una policy con permessi e sulla mainnet non ne esiste ancora nessuna.

---

## Compatibilità PQC ed EVM

Le transazioni EVM sono firmate con **ECDSA classico (secp256k1)**, quindi MetaMask, Hardhat, Foundry, ethers.js e gli altri strumenti standard le costruiscono e le firmano senza modifiche. Ciò che è cambiato con la **v3.2.0** è l'*ammissione*: una transazione viene accettata solo se il mittente possiede una chiave post-quantistica registrata e una finestra di autorizzazione attiva (sezione successiva). La registrazione di una chiave e l'apertura di una finestra sono transazioni della corsia Cosmos e richiedono la firma ibrida (ML-DSA-87 + secp256k1).

Per la sicurezza post-quantistica all'interno dei contratti:

* Il **precompilato PQC Verify** (`0x0000...0A01`) verificherà on-chain le firme ML-DSA-87 da Solidity una volta attivato; **non è ancora attivo** né sulla mainnet né sulla testnet. Vedi [Precompilati EVM: stato della rete](/developer-guide/evm-precompiles#network-status).
* I **messaggi cross-VM** dall'EVM verso CosmWasm o SVM sono transazioni della corsia Cosmos e portano la firma ibrida come tutte le altre; vedi [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability) per la loro disponibilità attuale.

---

## Finestra di autorizzazione EVM {#evm-window}

Una firma post-quantistica non può viaggiare *insieme* a una transazione Ethereum (wallet come MetaMask non possono allegare una seconda firma), quindi viaggia *in anticipo*. L'account apre una finestra delimitata con il messaggio della corsia Cosmos `MsgOpenEVMWindow`; la corsia EVM ammette poi solo le transazioni coperte da una finestra attiva. Una chiave classica rubata da sola non può aprire una finestra, quindi può muovere soltanto ciò che una finestra già aperta consente.

| Limite      | Intervallo         | Significato |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | Per quanto tempo la finestra resta aperta, contato in blocchi a partire dal blocco che la apre |
| `max-txs`   | 1 – 1,000          | Quante transazioni EVM ammette |
| `max-value` | maggiore di 0, in `uqor` | Uscita totale che ammette: valore trasferito **più** la commissione massima che ogni transazione potrebbe pagare (gas limit × max fee per gas), convertita in `uqor` e arrotondata per eccesso |

Il limite che si esaurisce per primo chiude la finestra. Ogni campo è obbligatorio; aprire una finestra ne sostituisce una esistente; una transazione ammessa e poi fallita consuma comunque il suo slot e il suo budget di valore; i deploy di contratti contano come qualsiasi altra transazione. `blocks` è un conteggio di blocchi, non una durata: 17,280 blocchi equivalgono a circa 15 ore sulla mainnet (circa 3,2 s per blocco) e a circa 5 ore sulla testnet (circa 1,0 s per blocco).

**Passaggi** (la guida completa è in [La tua prima transazione](/getting-started/first-transaction#evm-window)):

1. Registra una volta la tua chiave ML-DSA-87 (`tx pqc register-key-v2` oppure `register-key`, con `--gas 600000 --fees 60000uqor`; questa singola transazione è esentata dal requisito ibrido, così un nuovo account può fare il bootstrap). Vedi [Firma post-quantistica](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Apri una finestra. È una transazione della corsia Cosmos, quindi producila non firmata e cofirmala con la tua chiave ML-DSA (`max-value` accetta `uqor` o `qor`; `1000qor` equivale a 1.000 QOR):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
   ```

3. Controlla cosa resta: `qorechaind query pqc evm-window <address>` oppure `GET /qorechain/pqc/v1/evm_window/{address}` (risponde `found: false` quando non ce n'è nessuna).
4. Invia le tue transazioni EVM normalmente. L'apertura di una finestra è una transazione della corsia Cosmos e fa avanzare la sequence dell'account, che è anche il suo nonce EVM, quindi leggi il nonce **dopo** che la finestra è aperta e firma solo allora.

Chiudi una finestra in anticipo con `qorechaind tx pqc close-evm-window` (stesso schema `--generate-only` e `cosign`), ad esempio se sospetti che la chiave classica sia esposta: tutto ciò che la finestra ammetteva ancora viene rifiutato dal blocco successivo.

| Rifiuto (codespace `pqc`) | Significato |
| ------------------------- | ------- |
| code 26 | Nessuna finestra aperta per il mittente, oppure il mittente non ha una chiave PQC registrata |
| code 27 | La finestra è scaduta o esaurita (il messaggio indica quale limite) |
| code 28 | Limiti della finestra non validi all'apertura, oppure nessuna chiave registrata in quel momento |

Con l'SDK TypeScript (0.8.2 e successivi): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` e `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`).

---

## Namespace personalizzato `qor_` {#custom-qor_-namespace}

QoreChain estende il JSON-RPC con un namespace `qor_` per le query specifiche della chain:

:::warning Non ancora servito
Nessuna build di nodo rilasciata serve ancora il namespace `qor_`: `rpc_modules` sugli endpoint pubblici elenca solo `eth`, `net`, `rpc`, `txpool` e `web3`, e ogni metodo qui sotto restituisce `-32601` (metodo non trovato) su mainnet, testnet e nodi self-hosted con la configurazione predefinita (`eth`, `net`, `web3`, `txpool`). Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace) per lo stato e le alternative REST (ad esempio `GET /qorechain/pqc/v1/account/{address}` per lo stato della chiave PQC).
:::

| Metodo                       | Descrizione                                                        |
| ----------------------------- | ------------------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | Verifica se un account ha una chiave pubblica PQC registrata        |
| `qor_getAIStats`              | Recupera le statistiche del motore AI (conteggio anomalie, distribuzione del rischio) |
| `qor_getCrossVMMessage`       | Interroga lo stato di un messaggio cross-VM tramite ID              |
| `qor_getPoolClassification`   | Ottiene la classificazione del pool del validatore (RPoS/DPoS/PoS)  |
| `qor_getReputationScore`      | Interroga il punteggio di reputazione di un validatore              |
| `qor_getAbstractAccount`      | Recupera la configurazione dell'account astratto                    |

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

* [Precompile EVM](/developer-guide/evm-precompiles) — Riferimento per le interfacce precompile riservate (non ancora attive sulle reti pubbliche)
* [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability) — Chiamate cross-VM e loro disponibilità attuale
* [Account Abstraction](/developer-guide/account-abstraction) — Authenticator dei wallet collegati e regole di spesa (modulo attualmente disattivato)
