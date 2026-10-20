---
slug: /api-reference/json-rpc-eth_-namespace
title: JSON-RPC — Espace de noms eth_
sidebar_label: JSON-RPC — Espace de noms eth_
sidebar_position: 3
---

# JSON-RPC — Espace de noms eth_

QoreChain implémente une interface JSON-RPC compatible EVM, de sorte que les outils Ethereum standards (MetaMask, Hardhat, Foundry, ethers.js, web3.js) peuvent lire l'état de la chaîne et estimer le gas sans modification. **L'envoi d'une transaction depuis le lane EVM nécessite une étape supplémentaire** depuis la version de chaîne v3.2.0 : le compte émetteur doit disposer d'une clé post-quantique enregistrée et d'une fenêtre d'autorisation EVM ouverte (voir [Envoi de transactions](#sending-transactions)).

## Connexion

| Transport | Adresse par défaut      |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

:::note
L'interface JSON-RPC EVM est servie par le mainnet **`qorechain-vladi`** (chain ID EVM **9801**, hexadécimal `0x2649`, version de nœud **v3.2.3**, en production depuis le 7 juin 2026) et le testnet **`qorechain-diana`** (chain ID EVM **9800**, hexadécimal `0x2648`, version de nœud **v3.2.4**, testnet uniquement). Les adresses locales ci-dessus s'appliquent à un nœud que vous exécutez vous-même. Les points de terminaison HTTP publics sont `https://evm.qore.host` (mainnet) et `https://evm-testnet.qore.host` (testnet), listés dans [Réseaux](/appendix/networks#public-endpoints). Le seul WebSocket EVM public est celui du testnet (`wss://evm-ws-testnet.qore.host`) ; il n'existe pas de WebSocket EVM public pour le mainnet.
:::

## Espaces de noms pris en charge

| Espace de noms | Description                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `eth_`    | Méthodes JSON-RPC Ethereum de base                                                                                 |
| `web3_`   | Méthodes utilitaires (version du client, hachage)                                                                      |
| `net_`    | Méthodes de statut réseau                                                                                         |
| `txpool_` | Inspection du pool de transactions                                                                                    |
| `rpc_`    | Introspection du serveur (`rpc_modules`)                                                                           |

## Méthodes eth_

| Méthode                      | Paramètres                                       | Description                                          |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `eth_blockNumber`           | aucun                                             | Renvoie le dernier numéro de bloc                      |
| `eth_getBalance`            | `address`, `blockNumber`                         | Renvoie le solde d'une adresse en wei             |
| `eth_getTransactionCount`   | `address`, `blockNumber`                         | Renvoie le nonce (nombre de transactions) d'une adresse |
| `eth_sendRawTransaction`    | `signedTxData`                                   | Soumet une transaction signée pour diffusion           |
| `eth_call`                  | `callObject`, `blockNumber`                      | Exécute un appel en lecture seule sur l'EVM             |
| `eth_estimateGas`           | `callObject`                                     | Estime le gas requis pour une transaction         |
| `eth_getBlockByNumber`      | `blockNumber`, `fullTx` (bool)                   | Renvoie les données d'un bloc par numéro                      |
| `eth_getTransactionByHash`  | `txHash`                                         | Renvoie les données d'une transaction par hachage             |
| `eth_getTransactionReceipt` | `txHash`                                         | Renvoie le reçu d'une transaction minée          |
| `eth_getLogs`               | `filterObject`                                   | Renvoie les journaux correspondant à un filtre                    |
| `eth_chainId`               | aucun                                             | Renvoie l'ID de chaîne (encodé en hexadécimal)                   |
| `eth_gasPrice`              | aucun                                             | Renvoie le prix du gas actuel en wei                 |
| `eth_feeHistory`            | `blockCount`, `newestBlock`, `rewardPercentiles` | Renvoie l'historique des frais (EIP-1559)               |
| `eth_getBlockByHash`        | `blockHash`, `fullTx` (bool)                     | Renvoie les données d'un bloc par hachage                      |
| `eth_getCode`               | `address`, `blockNumber`                         | Renvoie le bytecode d'un contrat                      |
| `eth_getStorageAt`          | `address`, `slot`, `blockNumber`                 | Renvoie un emplacement de stockage                      |
| `eth_getBlockReceipts`      | `blockNumber`                                    | Renvoie tous les reçus d'un bloc                      |
| `eth_getProof`              | `address`, `storageKeys`, `blockNumber`          | Renvoie une preuve de compte                          |
| `eth_createAccessList`      | `callObject`, `blockNumber`                      | Construit une liste d'accès pour un appel                     |
| `eth_maxPriorityFeePerGas`  | aucun                                             | Renvoie les frais de priorité suggérés (wei)             |
| `eth_syncing`               | aucun                                             | Renvoie `false` lorsque le nœud est à jour               |
| `eth_newFilter`, `eth_newBlockFilter`, `eth_getFilterChanges` | objet de filtre / ID de filtre | Filtres par interrogation                              |

## Méthodes web3_

| Méthode               | Paramètres   | Description                              |
| -------------------- | ------------ | ---------------------------------------- |
| `web3_clientVersion` | aucun         | Renvoie la chaîne de version du client        |
| `web3_sha3`          | `data` (hex) | Renvoie le hachage Keccak-256 de l'entrée |

## Méthodes txpool_

| Méthode           | Paramètres | Description                                                         |
| ---------------- | ---------- | ------------------------------------------------------------------- |
| `txpool_status`  | aucun       | Renvoie le nombre de transactions en attente et en file d'attente               |
| `txpool_content` | aucun       | Renvoie les transactions en attente et en file d'attente (absent des points de terminaison publics) |
| `txpool_inspect` | aucun       | Renvoie un résumé du pool (absent des points de terminaison publics)               |

## Méthodes net_

| Méthode          | Paramètres | Description                                 |
| --------------- | ---------- | ------------------------------------------- |
| `net_version`   | aucun       | Renvoie l'ID du réseau                      |
| `net_listening` | aucun       | Renvoie `true` si le nœud est à l'écoute     |
| `net_peerCount` | aucun       | Renvoie le nombre de pairs connectés (hex) |

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

# Enabled API namespaces (a node initialised by v3.2.3 or later defaults to "eth,net,web3";
# txpool is opt-in because it publishes the node's pending transactions)
api = "eth,web3,net,txpool"

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

## Limites des points de terminaison publics {#public-limits}

:::note
- `eth_getLogs` accepte au plus **10 000 blocs** entre `fromBlock` et `toBlock`. Une plage plus large renvoie `{"code":-32000,"message":"maximum [from, to] blocks distance: 10000"}`. Interrogez par fenêtres de 10 000 blocs ou moins. Le paramètre distinct `filter-cap` limite le nombre de journaux renvoyés.
- `txpool_status` fonctionne sur les points de terminaison publics. `txpool_content` et `txpool_inspect` sont désactivés à la fois sur le point de terminaison mainnet public et sur le point de terminaison testnet public (ils fonctionnent sur un nœud que vous exécutez vous-même, avec `txpool` dans sa liste `api`).
- Les méthodes `debug_*` et `eth_signTransaction` ne sont pas disponibles.
- `eth_subscribe` nécessite une connexion WebSocket. Via HTTP, il renvoie `-32601 notifications not supported`. Voir [Événements WebSocket](/api-reference/websocket-events).
- L'état aux hauteurs anciennes est élagué sur les points de terminaison publics ; un `eth_call` sur un bloc historique lointain peut donc échouer avec une erreur de version d'état.
- Si un script reçoit `403 Forbidden`, définissez un en-tête `User-Agent` explicite ; l'agent `urllib` par défaut de Python est bloqué, tandis que les clients `requests`, `curl`, Node et Go fonctionnent tels quels.
:::

## Envoi de transactions {#sending-transactions}

:::caution Le lane EVM exige une clé PQC et une fenêtre ouverte
Depuis la version de chaîne v3.2.0, le lane EVM n'admet une transaction (`MsgEthereumTx`, y compris les déploiements de contrats) que d'un compte disposant d'une **clé post-quantique enregistrée** et d'une **fenêtre d'autorisation EVM ouverte**. Un wallet EVM classique qui n'a pas effectué cette configuration ne peut pas soumettre de transactions : le nœud les refuse avec une erreur du module `pqc` (codes 26, 27 ou 28) au lieu de les inclure. La lecture des soldes, `eth_call` et l'estimation du gas ne nécessitent aucune fenêtre. Depuis la v3.2.2, une transaction signée **sans chain id** (pré-EIP-155) est également refusée, et depuis la v3.2.3, une fenêtre peut être limitée aux simples transferts de QOR (`native_only`) ou à une liste de destinataires (`allowed_targets`) ; une transaction hors de ce périmètre est refusée avec le code 27.

Vérifiez un compte avant d'envoyer :

- `GET /qorechain/pqc/v1/account/{address}` (`found: true` signifie qu'une clé est enregistrée)
- `GET /qorechain/pqc/v1/evm_window/{address}` (`live: true` signifie qu'une fenêtre admet actuellement des transactions)

Les deux sont décrits dans [Points de terminaison REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module) (la réponse de la fenêtre indique aussi `native_only` et `allowed_targets`). Une fenêtre s'ouvre avec une transaction QoreChain (`MsgOpenEVMWindow`, limitée à 17 280 blocs et 1 000 transactions au plus, plus un plafond de valeur), et non avec une transaction Ethereum. Voir [Développement EVM](/developer-guide/evm-development) pour une vue d'ensemble du lane.
:::

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
  "result": "0x37f559"
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

Réponse (mainnet `qorechain-vladi`, chain ID 9801) :

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": "0x2649"
}
```

Sur le testnet `qorechain-diana` (chain ID 9800), cette méthode renvoie `"0x2648"`.

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

- L'ID de chaîne est renvoyé sous forme de chaîne hexadécimale. Convertissez-le en décimal pour la configuration du portefeuille — `0x2649` correspond à **9801** (mainnet), `0x2648` correspond à **9800** (testnet).
- La tarification du gas suit le modèle EIP-1559. Utilisez `eth_feeHistory` pour estimer les frais de base et les frais de priorité.
- Tags de bloc acceptés : `"latest"`, `"earliest"`, `"pending"`, ou un numéro de bloc hexadécimal.
- Limitations de filtrage : `eth_getLogs` est plafonné à `filter-cap` résultats par requête (10 000 par défaut), et les points de terminaison publics rejettent les plages de plus de 10 000 blocs. Utilisez des plages de blocs plus étroites pour les jeux de données volumineux.

:::
