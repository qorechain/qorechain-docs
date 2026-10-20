---
slug: /developer-guide/cross-vm-interoperability
title: Interopérabilité inter-VM
sidebar_label: Interopérabilité inter-VM
sidebar_position: 5
---

# Interopérabilité inter-VM

L'**architecture triple-VM** de QoreChain (EVM, CosmWasm, SVM) est conçue pour permettre aux contrats intelligents de n'importe quelle machine virtuelle de communiquer avec les contrats de n'importe quelle autre VM. Le module `x/crossvm` fournit un message d'appel avec un chemin dans la même transaction et un chemin en file d'attente.

:::caution Ce qui fonctionne aujourd'hui
Les appels inter-VM ne sont disponibles que dans la mesure où leur lane cible l'est :

* `MsgCrossVMCall` est **désactivé sur le mainnet** par le coupe-circuit (`qorechaind query circuit disabled-list`) ; il est activé sur le testnet.
* La **lane SVM est désactivée** pour les transactions sur les deux réseaux, de sorte qu'une branche SVM ne peut pas s'exécuter.
* Le **téléversement et l'instanciation CosmWasm sont soumis à autorisation** sur les deux réseaux et le mainnet ne contient aucun code de contrat stocké ; il n'y a donc encore aucun contrat CosmWasm à appeler.
* Le **précompilé EVM synchrone n'est pas actif** (voir ci-dessous). Une version renforcée figure dans le binaire depuis la v3.2.3, mais aucun précompilé n'est activé sur l'un ou l'autre réseau.

Les routes REST du module (`/qorechain/crossvm/v1/...`) ne sont pas servies par la passerelle publique ; lisez les messages avec la CLI ou un client de requêtes gRPC/ABCI.
:::

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
| **Synchrone**  | EVM vers CosmWasm | Même transaction | Précompilé à `0x0000...0901` (pas encore actif, voir ci-dessous) |
| **Message, par défaut** | Toute VM vers toute autre VM | Même transaction | `MsgCrossVMCall` ; l'appel s'exécute immédiatement et un échec annule toute la transaction |
| **Message, en file d'attente**  | Toute VM vers toute autre VM | Bloc suivant (ou plus tard) | `MsgCrossVMCall` avec `async` activé ; le message attend dans la file |

---

## Chemin synchrone (EVM vers CosmWasm)

Le chemin synchrone utilise un **précompilé** EVM à l'adresse `0x0000000000000000000000000000000000000901`. Il est conçu pour permettre aux contrats Solidity d'appeler des contrats CosmWasm et de recevoir une réponse au sein de la même transaction.

:::warning Non actif sur le mainnet ni sur le testnet
Le précompilé du pont CrossVM n'est **pas actif** sur `qorechain-vladi` ni sur `qorechain-diana` : un appel à `0x…0901` réussit et renvoie des données vides. Le binaire v3.2.3 embarque une version renforcée (elle refuse un `STATICCALL`, impute son appel imbriqué au gas du cadre appelant et le consigne dans le journal afin qu'un revert EVM annule aussi le côté CosmWasm, n'atteint que des cibles CosmWasm figurant sur une liste d'autorisation, et respecte le coupe-circuit inter-VM), mais elle ne s'exécute qu'une fois qu'une mise à niveau approuvée par la gouvernance l'a ajoutée à la liste active. L'exemple ci-dessous montre uniquement la forme visée. Voir [Précompilés EVM : état du réseau](/developer-guide/evm-precompiles#network-status).
:::

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

Une fois actif, le précompilé exécute le contrat CosmWasm immédiatement et renvoie le résultat. Le nœud actuel décode les calldata sous la forme `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` ; l'ABI peut encore changer avant l'activation. Coût en gas : **50 000 de base + 4 par octet d'entrée + coût d'exécution**.

---

## Chemin par message (`MsgCrossVMCall`)

Les autres appels inter-VM utilisent la transaction `MsgCrossVMCall`. La chaîne détermine la lane source à partir de l'expéditeur ; le message ne porte donc que la VM cible, le contrat cible, la charge utile et d'éventuels fonds. Par défaut, l'appel s'exécute immédiatement dans la transaction, et toute la transaction est annulée si la cible échoue. Avec l'indicateur `async`, le message est au contraire mis en file d'attente et traité par la passe de file de fin de bloc du module lors d'un bloc ultérieur (voir le cycle de vie ci-dessous). Comme indiqué plus haut, ce message est désactivé sur le mainnet.

### CLI

`tx crossvm call` prend la VM cible (`evm`, `cosmwasm` ou `svm`) et le contrat cible comme arguments positionnels, avec la charge utile en hexadécimal. La CLI ne demande pas la VM source : la chaîne déduit la lane de l'appelant à partir de l'état et ignore le champ déclaré (la CLI renseigne une valeur de substitution afin que le message passe sa propre validation) :

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Autres options : `--funds <coins>` (cibles CosmWasm uniquement) et `--async` pour mettre l'appel en file d'attente au lieu de l'exécuter immédiatement. Signez et diffusez `tx.json` avec `tx pqc cosign` (voir [Signature post-quantique](/developer-guide/post-quantum-signing)) ; le plancher de frais est de 0.1 uqor par gas. Un appel vers la propre lane de l'appelant est refusé (depuis la v3.2.3).

:::caution Désactivé sur le mainnet
`MsgCrossVMCall` est désactivé sur le mainnet par le coupe-circuit ; la commande ne peut donc pas y aboutir aujourd'hui. (Les binaires de release antérieurs à la v3.2.3 construisaient en outre un message qui échouait à sa propre validation parce que la VM source était vide ; le binaire v3.2.3 corrige ce point.) Sur le testnet, le message est activé, mais ses cibles CosmWasm et SVM ne sont pas utilisables (voir ci-dessus) ; seule une cible EVM est donc atteignable.
:::

---

## Cycle de vie d'un message

Chaque message inter-VM en file d'attente transite par un ensemble défini d'états :

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

Depuis la v3.2.3, un appel en file d'attente qui échoue est annulé dans son intégralité : seul son enregistrement `Failed` subsiste, et les fonds joints à un appel CosmWasm en échec ne sont plus transférés au contrat. Tant que le module est désactivé, ou que `MsgCrossVMCall` est désactivé par le coupe-circuit, la file n'est **pas exécutée** : les messages en file restent en attente et expirent à leur délai, sauf si l'interrupteur est levé avant.

---

## Paramètres

| Paramètre              | Valeur        | Description                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | Interrupteur au niveau du module (le message d'appel lui-même est désactivé séparément sur le mainnet) |
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

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **Pas encore servi :** aucune version publiée du nœud ne sert l'espace de noms JSON-RPC `qor_` ; cet appel renvoie donc `-32601` (méthode introuvable) sur tous les points de terminaison publics aujourd'hui. Voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace).

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

**Atomicité :** Les appels synchrones (EVM vers CosmWasm via précompilé) sont conçus pour être atomiques : si l'un des deux côtés échoue (revert), l'ensemble de la transaction est annulé. Le précompilé actuel ne le garantit pas encore, ce qui est l'une des raisons pour lesquelles il n'est pas actif (voir ci-dessus). Les appels asynchrones ne sont **pas atomiques** d'un bloc à l'autre ; concevez vos contrats pour gérer les états `Failed` et `Timed Out` avec élégance.

**Ordonnancement :** Les messages de la file sont traités en FIFO à chaque passage de l'EndBlocker. Il n'existe aucune garantie d'ordonnancement entre différentes VM sources.

**Encodage de la charge utile :** Le format de la charge utile dépend de la VM cible :

* **Cibles EVM :** appels de fonction encodés en ABI
* **Cibles CosmWasm :** messages execute encodés en JSON
* **Cibles SVM :** données d'instruction BPF encodées en hexadécimal

---

## Étapes suivantes

* [Précompilés EVM](/developer-guide/evm-precompiles) — État du précompilé CrossVM synchrone et des autres précompilés prévus
* [Développement EVM](/developer-guide/evm-development) — Développement Solidity sur QoreChain
* [Développement CosmWasm](/developer-guide/cosmwasm-development) — Développement de contrats Rust/Wasm
* [Développement SVM](/developer-guide/svm-development) — Déploiement de programmes BPF
