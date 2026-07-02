---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — Espace de noms eth_
sidebar_label: JSON-RPC — Espace de noms eth_
sidebar_position: 3
---

# JSON-RPC — Espace de noms eth_

QoreChain implémente une interface JSON-RPC entièrement compatible EVM, permettant aux outils Ethereum standard (MetaMask, Hardhat, Foundry, ethers.js, web3.js) d'interagir avec la chaîne sans modification.

## Connexion

| Transport | Adresse par défaut      |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
L'interface JSON-RPC EVM est servie par le mainnet **`qorechain-vladi`** (ID de chaîne EVM **9801**, hex `0x2649`, actif sur la version de chaîne **v3.1.82**) et le testnet **`qorechain-diana`** (ID de chaîne EVM **9800**, hex `0x2648`). Les adresses locales ci-dessus s'appliquent à un nœud que vous exécutez vous-même ; remplacez par le point de terminaison mainnet ou testnet de votre fournisseur pour un accès distant.
:::

## Espaces de noms pris en charge

| Espace de noms | Description                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Méthodes JSON-RPC Ethereum de base                                                                              |
| `web3_`   | Méthodes utilitaires (version du client, hachage)                                                               |
| `net_`    | Méthodes de statut réseau                                                                                       |
| `txpool_` | Inspection du pool de transactions                                                                              |
| `qor_`    | Extensions spécifiques à QoreChain (voir [Espace de noms qor_](/api-reference/json-rpc-qor_-namespace))         |

## Méthodes eth_

| Méthode                     | Paramètres                                       | Description                                          |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | aucun                                            | Renvoie le numéro du dernier bloc                    |
| `eth_getBalance`            | `address`, `blockNumber`                         | Renvoie le solde d'une adresse en wei               |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Renvoie le nonce (nombre de transactions) d'une adresse |
| `eth_sendRawTransaction`    | `signedTxData`                                   | Soumet une transaction signée pour diffusion         |
| `eth_call`                  | `callObject`, `blockNumber`                      | Exécute un appel en lecture seule sur l'EVM          |
| `eth_estimateGas`           | `callObject`                                     | Estime le gas requis pour une transaction            |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Renvoie les données d'un bloc par numéro             |
| `eth_getTransactionByHash`  | `txHash`                                         | Renvoie les données d'une transaction par hash        |
| `eth_getTransactionReceipt` | `txHash`                                         | Renvoie le reçu d'une transaction minée              |
| `eth_getLogs`               | `filterObject`                                   | Renvoie les logs correspondant à un filtre           |
| `eth_chainId`               | aucun                                            | Renvoie l'ID de chaîne (encodé en hex)              |
| `eth_gasPrice`              | aucun                                            | Renvoie le prix du gas actuel en wei                 |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Renvoie les données de frais historiques (EIP-1559)  |

## Méthodes web3_

| Méthode              | Paramètres   | Description                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | aucun        | Renvoie la chaîne de version du client    |
| `web3_sha3`          | `data` (hex) | Renvoie le hachage Keccak-256 de l'entrée |

## Méthodes net_

| Méthode         | Paramètres | Description                                  |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | aucun      | Renvoie l'ID du réseau                       |
| `net_listening` | aucun      | Renvoie `true` si le nœud est à l'écoute     |
| `net_peerCount` | aucun      | Renvoie le nombre de pairs connectés (hex)   |

## Configuration

Activez et configurez le serveur JSON-RPC dans `app.toml` :

```toml
[json-rpc]
# Enable the JSON-RPC server
enable = true

# HTTP server address
address = "0.0.0.0:8545"

# WebSocket server address
ws-address = "0.0.0.0:8546"

# Enabled API namespaces
api = "eth,web3,net,txpool,qor"

# Maximum number of logs returned by eth_getLogs
filter-cap = 10000

# Maximum gas for eth_call and eth_estimateGas
gas-cap = 25000000

# EVM execution timeout
evm-timeout = "5s"

# Transaction fee cap (in QOR)
txfee-cap = 1

# Maximum open WebSocket connections
max-open-connections = 0
```

## Exemples

### eth_blockNumber

Requête :

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'
```

Réponse :

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x53b35"
}
```

### eth_chainId

Requête :

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_chainId",
    "params": [],
    "id": 2
  }'
```

Réponse (mainnet `qorechain-vladi`, ID de chaîne 9801) :

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

Sur le testnet `qorechain-diana` (ID de chaîne 9800), cette méthode renvoie `"0x2648"`.

### eth_getBalance

Requête :

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28", "latest"],
    "id": 3
  }'
```

Réponse :

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": "0x56bc75e2d63100000"
}
```

## Connexion avec ethers.js

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get latest block
const block = await provider.getBlockNumber();
console.log("Latest block:", block);

// Get balance
const balance = await provider.getBalance("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28");
console.log("Balance:", ethers.formatEther(balance), "QOR");
```

:::info

- L'ID de chaîne est renvoyé sous forme de chaîne hex. Convertissez en décimal pour la configuration du portefeuille — `0x2649` correspond à **9801** (mainnet), `0x2648` à **9800** (testnet).
- La tarification du gas suit le modèle EIP-1559. Utilisez `eth_feeHistory` pour estimer les frais de base et les frais de priorité.
- Étiquettes de bloc acceptées : `"latest"`, `"earliest"`, `"pending"`, ou un numéro de bloc en hex.
- Limitations des filtres : `eth_getLogs` est plafonné à `filter-cap` résultats par requête (par défaut 10 000). Utilisez des plages de blocs plus étroites pour les grands ensembles de données.

:::
