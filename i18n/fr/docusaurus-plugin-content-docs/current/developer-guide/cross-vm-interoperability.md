---
slug: /developer-guide/cross-vm-interoperability
title: Interopérabilité inter-VM
sidebar_label: Interopérabilité inter-VM
sidebar_position: 5
---

# Interopérabilité inter-VM

L'**architecture triple-VM** de QoreChain (EVM, CosmWasm, SVM) permet aux contrats intelligents de n'importe quelle machine virtuelle de communiquer avec les contrats de n'importe quelle autre VM. Le module `x/crossvm` fournit à la fois des chemins de messagerie synchrones et asynchrones.

:::note
Les points de terminaison ci-dessous pointent par défaut vers un nœud local. Sur le mainnet, utilisez les points de terminaison RPC de **`qorechain-vladi`** (RPC Cosmos **26657**, JSON-RPC EVM **8545**) ; le testnet est **`qorechain-diana`**.
:::

---

## Aperçu de l'architecture

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Chemin             | Direction       | Synchronisation           | Mécanisme                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Synchrone**  | EVM vers CosmWasm | Même transaction | Précompilé à `0x0000...0901`   |
| **Asynchrone** | CosmWasm vers EVM | Bloc suivant       | `MsgCrossVMCall` via EndBlocker |
| **Asynchrone** | SVM vers toute VM   | Bloc suivant       | `MsgCrossVMCall` via EndBlocker |
| **Asynchrone** | Toute VM vers SVM      | Bloc suivant       | `MsgCrossVMCall` via EndBlocker |

---

## Chemin synchrone (EVM vers CosmWasm)

Le chemin synchrone utilise un **précompilé** EVM à l'adresse `0x0000000000000000000000000000000000000901`. Cela permet aux contrats Solidity d'appeler des contrats CosmWasm et de recevoir une réponse au sein de la même transaction.

### Exemple Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMCaller {
    ICrossVM constant CROSSVM = ICrossVM(0x0000000000000000000000000000000000000901);

    function callCosmWasmContract(
        string memory cosmwasmAddr,
        string memory executeMsg,
        uint256 funds
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(cosmwasmAddr, executeMsg, funds);
        return CROSSVM.call(payload);
    }
}
```

Le précompilé exécute le contrat CosmWasm immédiatement et renvoie le résultat. Coût en gaz : **50 000 de base + coût d'exécution**.

---

## Chemin asynchrone

Toutes les autres directions inter-VM utilisent la file d'attente de messages asynchrone. Les messages sont soumis dans un bloc et traités par l'**EndBlocker** au bloc suivant.

### CLI

```bash
# CosmWasm to EVM
qorechaind tx crossvm call \
  --source-vm cosmwasm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '{"method":"transfer","params":["0xRecipient",100]}' \
  --from mykey \
  -y

# SVM to CosmWasm
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm cosmwasm \
  --target-contract qor1contractaddr... \
  --payload '{"execute":{"action":{}}}' \
  --from mykey \
  -y

# EVM to SVM (async)
qorechaind tx crossvm call \
  --source-vm evm \
  --target-vm svm \
  --target-contract <program-id-base58> \
  --payload '0a0b0c...' \
  --from mykey \
  -y
```

---

## Cycle de vie d'un message

Chaque message inter-VM transite par un ensemble défini d'états :

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| État         | Description                                               |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Message accepté dans la file d'attente                           |
| **Pending**   | En attente d'exécution au prochain passage de l'EndBlocker            |
| **Executed**  | Contrat cible appelé avec succès ; réponse enregistrée    |
| **Failed**    | L'exécution du contrat cible a échoué (revert) ; erreur enregistrée        |
| **Timed Out** | Le message a dépassé `queue_timeout_blocks` sans exécution |

---

## Paramètres

| Paramètre              | Valeur        | Description                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `max_message_size`     | 65 536 octets | Taille maximale de charge utile par message               |
| `max_queue_size`       | 1 000        | Nombre maximal de messages en attente dans la file          |
| `queue_timeout_blocks` | 100          | Blocs avant qu'un message non traité n'expire |

---

## Événements

Le module `x/crossvm` émet les événements suivants :

| Événement              | Attributs                                                          | Description                           |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Nouveau message inter-VM soumis        |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Message exécuté (succès ou échec) |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Message expiré sans exécution     |

Abonnez-vous aux événements via WebSocket :

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Interrogation des messages

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List all pending messages
qorechaind query crossvm pending

# List messages by sender
qorechaind query crossvm messages-by-sender <address>
```

### JSON-RPC

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### Format de réponse

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## Considérations de conception

**Atomicité :** Les appels synchrones (EVM vers CosmWasm via précompilé) sont atomiques — si l'un des deux côtés échoue (revert), l'ensemble de la transaction est annulé. Les appels asynchrones ne sont **pas atomiques** d'un bloc à l'autre ; concevez vos contrats pour gérer les états `Failed` et `Timed Out` avec élégance.

**Ordonnancement :** Les messages de la file sont traités en FIFO à chaque passage de l'EndBlocker. Il n'existe aucune garantie d'ordonnancement entre différentes VM sources.

**Encodage de la charge utile :** Le format de la charge utile dépend de la VM cible :

* **Cibles EVM :** appels de fonction encodés en ABI
* **Cibles CosmWasm :** messages execute encodés en JSON
* **Cibles SVM :** données d'instruction BPF encodées en hexadécimal

---

## Étapes suivantes

* [Précompilés EVM](/developer-guide/evm-precompiles) — Le précompilé CrossVM synchrone et autres précompilés personnalisés
* [Développement EVM](/developer-guide/evm-development) — Développement Solidity sur QoreChain
* [Développement CosmWasm](/developer-guide/cosmwasm-development) — Développement de contrats Rust/Wasm
* [Développement SVM](/developer-guide/svm-development) — Déploiement de programmes BPF
