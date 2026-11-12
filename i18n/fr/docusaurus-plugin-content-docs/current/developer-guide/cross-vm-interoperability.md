---
slug: /developer-guide/cross-vm-interoperability
title: Interopérabilité inter-VM
sidebar_label: Interopérabilité inter-VM
sidebar_position: 5
---

# Interopérabilité inter-VM

L'**architecture triple-VM** de QoreChain (EVM, QoreChain Native, SVM) est conçue pour permettre aux contrats intelligents de n'importe quelle machine virtuelle de communiquer avec les contrats de n'importe quelle autre VM. Le module `x/crossvm` fournit un message d'appel avec un chemin dans la même transaction et un chemin en file d'attente.

:::caution Ce qui fonctionne aujourd'hui
Les appels inter-VM ne sont disponibles que dans la mesure où leur lane cible l'est :

* `MsgCrossVMCall` est **désactivé sur le mainnet** par le coupe-circuit (`qorechaind query circuit disabled-list`) ; il est activé sur le testnet.
* La **lane SVM est désactivée** pour les transactions sur les deux réseaux, de sorte qu'une branche SVM ne peut pas s'exécuter.
* Le **téléversement QoreChain Native est soumis à autorisation** sur les deux réseaux et **l'instanciation est soumise à autorisation sur le mainnet**, qui ne contient aucun code de contrat stocké ; il n'y a donc encore aucun contrat QoreChain Native à appeler sur le mainnet. Sur le testnet, la gouvernance a stocké quelques contrats revus que n'importe quel compte peut instancier (voir [Développement QoreChain Native](/developer-guide/cosmwasm-development)) ; une cible QoreChain Native peut donc y exister.
* Le **précompilé EVM synchrone n'est pas actif sur le mainnet** et est **actif sur le testnet** avec une liste d'autorisation de contrats QoreChain Native examinés (lu le 7 novembre 2026 ; un appel en lecture seule via ce précompilé a été exécuté après la mise à niveau v3.2.7, voir ci-dessous). Une version renforcée figure dans le binaire depuis la v3.2.3. (Le 27 octobre 2026, la gouvernance du testnet a activé trois autres précompilés, PQC Verify, PQC Key Status et PRISM Consensus Params, et le pont CrossVM a rejoint la liste du testnet au 4 novembre ; le mainnet n'en a aucun d'actif.)

Sur le mainnet, les routes REST du module (`/qorechain/crossvm/v1/...`) ne sont pas servies par la passerelle publique (`501`) ; lisez les messages avec la CLI ou un client de requêtes gRPC/ABCI.
:::

:::note
Les points de terminaison ci-dessous pointent par défaut vers un nœud local. Sur le mainnet, utilisez les points de terminaison RPC de **`qorechain-vladi`** (RPC Cosmos **26657**, JSON-RPC EVM **8545**) ; le testnet est **`qorechain-diana`**.
:::

---

## Aperçu de l'architecture

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Chemin             | Direction       | Synchronisation           | Mécanisme                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Synchrone**  | EVM vers QoreChain Native | Même transaction | Précompilé à `0x0000...0901` (actif sur le testnet, pas sur le mainnet ; voir ci-dessous) |
| **Message, par défaut** | Toute VM vers toute autre VM | Même transaction | `MsgCrossVMCall` ; l'appel s'exécute immédiatement et un échec annule toute la transaction |
| **Message, en file d'attente**  | Toute VM vers toute autre VM | Bloc suivant (ou plus tard) | `MsgCrossVMCall` avec `async` activé ; le message attend dans la file |

---

## Chemin synchrone (EVM vers QoreChain Native) {#synchronous-path-evm-to-qorechain-native}

Le chemin synchrone utilise un **précompilé** EVM à l'adresse `0x0000000000000000000000000000000000000901`. Il est conçu pour permettre aux contrats Solidity d'appeler des contrats QoreChain Native et de recevoir une réponse au sein de la même transaction.

:::warning Non actif sur le mainnet ; actif sur le testnet avec une liste d'autorisation
Le précompilé du pont CrossVM n'est **pas actif** sur `qorechain-vladi` : un appel à `0x…0901` y réussit et renvoie des données vides. Sur `qorechain-diana`, la liste `active_static_precompiles` contient `0x…0901` (lu le 7 novembre 2026) ; un `eth_call` en lecture seule via ce précompilé a été exécuté le 7 novembre 2026, après la mise à niveau v3.2.7 (résultats ci-dessous). Le binaire v3.2.3 embarque une version renforcée (elle refuse un `STATICCALL`, impute son appel imbriqué au gas du cadre appelant et le consigne dans le journal afin qu'un revert EVM annule aussi le côté QoreChain Native, n'atteint que des cibles QoreChain Native figurant sur une liste d'autorisation, et respecte le coupe-circuit inter-VM), mais elle ne s'exécute que là où une proposition approuvée par la gouvernance l'a ajoutée à la liste active (le testnet jusqu'ici, pas le mainnet). Sur le mainnet, le précompilé et les appels inter-VM restent désactivés, même après une mise à niveau v3.2.7 (qui n'a pas encore de date), jusqu'à une décision de gouvernance distincte. L'exemple ci-dessous est la disposition que le nœud décode ; il ne peut pas s'exécuter sur le mainnet tant que le précompilé n'y est pas actif. Sur le testnet, il peut être appelé, dans les limites de la liste d'autorisation (section suivante). Voir [Précompilés EVM : état du réseau](/developer-guide/evm-precompiles#network-status).
:::

### Exemple Solidity

Le nœud décode l'entrée du précompilé comme un sélecteur de 4 octets suivi des arguments encodés en ABI de `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (sélecteur `0x3c11078c`). `targetVM` vaut `1` pour un contrat QoreChain Native (QoreChain Native est le runtime CosmWasm ; `0` désigne l'EVM, que le pont renforcé refuse comme cible). `targetContract` est l'adresse bech32 du contrat sous forme de chaîne, et `payload` est le message d'exécution du contrat sous forme d'octets JSON UTF-8. Le précompilé renvoie les octets de réponse bruts de la cible.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

C'est la disposition que le nœud décode ; c'est la même que celle que construit l'encodeur `@qorechain/rdk`, et le contrat ci-dessus correspond au modèle de départ de [Multi-VM](/rollups/multi-vm). Des fonds ne peuvent pas être joints via le précompilé (le chemin par message `MsgCrossVMCall` accepte `--funds`). L'exemple ne peut rien faire aujourd'hui sur le mainnet, car le précompilé n'y est pas actif. Sur le testnet, il fonctionne dans les limites de la liste d'autorisation décrite ci-après ; le contrat d'exemple lui-même n'a pas été déployé pour cette page, l'appel ci-dessous a été fait directement avec `eth_call`.

Là où le précompilé est actif, il exécute le contrat QoreChain Native immédiatement et renvoie le résultat. (L'assistant `encodeCrossVmCalldata` de `@qorechain/rdk`, disponible à partir de la 0.6.0 et dans l'actuelle 0.8.0, construit les calldata ; voir [Multi-VM](/rollups/multi-vm).) Coût en gas : **50 000 de base + 4 par octet d'entrée + coût d'exécution**.

### Comportement sur le testnet (liste d'autorisation, vérifié le 7 novembre 2026) {#testnet-allowlist}

Sur `qorechain-diana` (version de nœud v3.2.8 depuis le 12 novembre 2026), le précompilé n'atteint que les contrats QoreChain Native figurant sur la liste d'autorisation du pont. `GET /qorechain/crossvm/v1/params` les liste dans `bridge_allowed_targets` (trois entrées le 7 novembre 2026, écrites `cosmwasm:qor1...`), à côté de `enabled` `true`, `max_message_size` 65536, `max_queue_size` 1000 et `queue_timeout_blocks` 100. Deux requêtes `eth_call` en lecture seule vers `0x…0901` avec `executeCrossVMCall(1, target, 0x7b7d)` ont été exécutées le 7 novembre 2026 :

* **Cible hors de la liste d'autorisation :** revert avec `cross-VM bridge call refused: target cosmwasm:qor1... is not allowlisted`.
* **Cible sur la liste d'autorisation :** l'appel atteint le contrat (le nœud renvoie l'erreur propre au contrat pour le message `{}` vide : `Error parsing into type cw20::msg::Cw20ExecuteMsg`). Cela montre que la route fonctionne ; aucune transaction inter-VM modifiant l'état n'a été envoyée via le précompilé pour cette page.

Sur le mainnet, le précompilé (`0x…0901`) et les appels inter-VM restent **désactivés** (coupe-circuit) même après la mise à niveau v3.2.7, jusqu'à une décision de gouvernance distincte.

### Ce que la v3.2.7 change pour les appels inter-VM (testnet uniquement pour l'instant) {#v327}

Ces changements s'appliquent sur le testnet depuis le 6 novembre 2026 et ne sont **pas encore sur le mainnet** (la mise à niveau n'a pas de date) :

* Un appel qui échoue dans la VM cible échoue désormais proprement : c'est l'échec de cet appel, et la file continue avec le message suivant.
* Les cibles mal formées sont refusées à la soumission avec le code 5 dans le codespace `crossvm`.
* Un appel inter-VM ne peut plus cibler une adresse de précompilé EVM.

---

## Chemin par message (`MsgCrossVMCall`)

Les autres appels inter-VM utilisent la transaction `MsgCrossVMCall`. La chaîne détermine la lane source à partir de l'expéditeur ; le message ne porte donc que la VM cible, le contrat cible, la charge utile et d'éventuels fonds. Par défaut, l'appel s'exécute immédiatement dans la transaction, et toute la transaction est annulée si la cible échoue. Avec l'indicateur `async`, le message est au contraire mis en file d'attente et traité par la passe de file de fin de bloc du module lors d'un bloc ultérieur (voir le cycle de vie ci-dessous). Comme indiqué plus haut, ce message est désactivé sur le mainnet.

### CLI

`tx crossvm call` prend la VM cible (`evm`, `cosmwasm` ou `svm`) et le contrat cible comme arguments positionnels, avec la charge utile en hexadécimal. La CLI ne demande pas la VM source : la chaîne déduit la lane de l'appelant à partir de l'état et ignore le champ déclaré (la CLI renseigne une valeur de substitution afin que le message passe sa propre validation) :

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Autres options : `--funds <coins>` (cibles QoreChain Native uniquement) et `--async` pour mettre l'appel en file d'attente au lieu de l'exécuter immédiatement. Signez et diffusez `tx.json` avec `tx pqc cosign` (voir [Signature post-quantique](/developer-guide/post-quantum-signing)) ; le plancher de frais est de 0.1 uqor par gas. Un appel vers la propre lane de l'appelant est refusé (depuis la v3.2.3).

:::caution Désactivé sur le mainnet
`MsgCrossVMCall` est désactivé sur le mainnet par le coupe-circuit ; la commande ne peut donc pas y aboutir aujourd'hui. (Les binaires de release antérieurs à la v3.2.3 construisaient en outre un message qui échouait à sa propre validation parce que la VM source était vide ; le binaire v3.2.3 corrige ce point.) Sur le testnet, le message est activé, mais la voie SVM est désactivée, de sorte qu'une cible SVM n'est pas atteignable ; une cible EVM l'est, ainsi qu'une cible QoreChain Native une fois qu'un contrat y a été instancié.
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

Depuis la v3.2.3, un appel en file d'attente qui échoue est annulé dans son intégralité : seul son enregistrement `Failed` subsiste, et les fonds joints à un appel QoreChain Native en échec ne sont plus transférés au contrat. Tant que le module est désactivé, ou que `MsgCrossVMCall` est désactivé par le coupe-circuit, la file n'est **pas exécutée** : les messages en file restent en attente et expirent à leur délai, sauf si l'interrupteur est levé avant.

### Appels asynchrones vers CosmWasm (v3.2.8) {#async-calls}

À partir de la version v3.2.8 (testnet uniquement jusqu'à une mise à niveau ultérieure du mainnet), un appel asynchrone vers CosmWasm est prépayé et mis en file avec des limites :

| Champ de `MsgCrossVMCall` | Signification |
| ------------------------- | ------------- |
| `async_gas_limit` (8)     | Unités de gas de contrat que vous réservez pour l'appel en file (500,000 par défaut) |
| `async_max_factor` (9)    | Le facteur de congestion le plus élevé que vous acceptez pour lui (4x par défaut) ; l'appel est refusé si le facteur en vigueur est supérieur |

- **Séquestre.** L'expéditeur prépaie unités de gas x facteur x prix du gas sur un compte de séquestre. Avec les valeurs par défaut, cela fait 500,000 x 4 x 0.1 uqor, soit environ 0.2 QOR. Ce que l'appel n'utilise pas est remboursé à son exécution.
- **Frais d'emplacement de file.** La mise en file d'un appel paie aussi de petits frais d'emplacement.
- **Au plus 100 appels en attente par expéditeur.** Tout appel supplémentaire est refusé jusqu'à ce qu'un appel se termine ou expire.
- **Les appels en échec sont facturés.** Un appel qui échoue paie quand même le travail effectué.
- **Appels lourds :** augmentez `async_gas_limit` et `async_max_factor` pour les contrats qui chargent un gros code ; un contrat de la taille d'un cw721 ne tient pas dans les valeurs par défaut lors de son premier appel dans un bloc.

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

# List pending messages (from v3.2.8 one page of at most 100; follow the next key for more)
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

**Atomicité :** Les appels synchrones (EVM vers QoreChain Native via précompilé) sont conçus pour être atomiques : si l'un des deux côtés échoue (revert), l'ensemble de la transaction est annulé. Le précompilé renforcé consigne l'appel imbriqué dans le journal, de sorte qu'un revert dans le contrat appelant annule aussi le côté QoreChain Native ; il n'est actif que sur le testnet. Les appels asynchrones ne sont **pas atomiques** d'un bloc à l'autre ; concevez vos contrats pour gérer les états `Failed` et `Timed Out` avec élégance.

**Ordonnancement :** Les messages de la file sont traités en FIFO à chaque passage de l'EndBlocker. Il n'existe aucune garantie d'ordonnancement entre différentes VM sources.

**Encodage de la charge utile :** Le format de la charge utile dépend de la VM cible :

* **Cibles EVM :** appels de fonction encodés en ABI
* **Cibles QoreChain Native :** messages execute encodés en JSON
* **Cibles SVM :** données d'instruction BPF encodées en hexadécimal

---

## Étapes suivantes

* [Précompilés EVM](/developer-guide/evm-precompiles) — État du précompilé CrossVM synchrone et des autres précompilés prévus
* [Développement EVM](/developer-guide/evm-development) — Développement Solidity sur QoreChain
* [Développement QoreChain Native](/developer-guide/cosmwasm-development) — Développement de contrats Rust/Wasm
* [Développement SVM](/developer-guide/svm-development) — Déploiement de programmes BPF
