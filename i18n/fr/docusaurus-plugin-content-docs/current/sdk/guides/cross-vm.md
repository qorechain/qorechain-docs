---
slug: /sdk/guides/cross-vm
title: Guide Cross-VM
sidebar_label: Cross-VM
sidebar_position: 4
---

# Guide Cross-VM

QoreChain exécute **EVM, SVM et CosmWasm côte à côte**, et le module `x/crossvm`
permet à un seul compte natif d'invoquer un contrat sur n'importe lequel d'entre eux. Le SDK
fournit un assistant de haut niveau `createCrossVMClient` pour construire, signer et diffuser
ces appels — y compris en empaquetant plusieurs d'entre eux dans **une seule transaction atomique
à travers les trois VM** — plus des assistants de lecture typés pour suivre l'état des messages. Le routage EVM→natif
initié *depuis l'intérieur de l'EVM* s'exécute toujours sur la chaîne via le **précompilé du pont
cross-VM** dans `@qorechain/evm`.

:::caution Ce qui fonctionne aujourd'hui
Les appels cross-VM ne sont disponibles que dans la mesure où leur voie cible l'est :

- `MsgCrossVMCall` est désactivé par le disjoncteur de la chaîne sur le **mainnet**
  (`GET /cosmos/circuit/v1/disable_list` liste `/qorechain.crossvm.v1.MsgCrossVMCall`) ;
  il est activé sur le testnet.
- La voie de transaction SVM est désactivée sur l'ensemble du réseau, le téléversement et
  l'instanciation CosmWasm sont soumis à permission (et il n'y a aucun contrat sur le mainnet), et le
  précompilé de pont EVM n'est pas actif (voir
  [Précompilés EVM](/developer-guide/evm-precompiles#network-status)).
- Les assistants de lecture REST typés ci-dessous appellent des routes que la passerelle publique ne sert pas.
  Lisez plutôt les messages avec `connectQueryClients(rpc).crossvm`.
- Comme toute transaction du chemin Native, un appel cross-VM doit porter la signature
  hybride (voir [Comptes et signature PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).
:::

## Appels cross-VM unifiés

`createCrossVMClient` encapsule `MsgCrossVMCall` (URL de type
`/qorechain.crossvm.v1.MsgCrossVMCall`) de sorte que vous n'ayez jamais à construire manuellement un `{ typeUrl,
value }` ni à encoder une charge utile vous-même. L'expéditeur du client est l'adresse du
`TxClient` connecté ; `sourceVm` vaut par défaut `"evm"`.

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet", endpoints: { rpc, rest } });
const tx = await client.connectTx(signer);
const xvm = createCrossVMClient(tx);

// Call an EVM contract from a native account — the payload is ABI-encoded.
const { messageId, result } = await xvm.call({
  sourceVm: "cosmwasm",
  targetVm: "evm",
  targetContract: "0xToken",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

`VMType` est l'un de `"evm" | "cosmwasm" | "svm"` (également exporté sous forme du tableau
`VM_TYPES`).

### Encodage de la charge utile par VM

Choisissez exactement **une** forme de charge utile par appel :

| Forme | Encodage |
|---|---|
| `{ payload: Uint8Array \| Hex }` | octets bruts, transmis tels quels |
| `{ evm: { abi, functionName, args } }` | encodé en ABI avec `encodeFunctionData` de viem (sélecteur + args) |
| `{ cosmwasm: object }` | `JSON.stringify` puis octets UTF-8 (la convention execute-msg de CosmWasm) |
| `{ svm: { data: Uint8Array \| Hex } }` | octets bruts (un blob d'instruction SVM) |

Le chemin EVM importe `viem` de façon paresseuse ; le pair optionnel `viem` n'est donc nécessaire
que lorsque vous utilisez réellement une charge utile `{ evm: ... }`.

### Construction seule (hors ligne)

`buildCall` renvoie l'`EncodeObject` sans le diffuser — pratique pour
l'inspection, le regroupement manuel ou la signature ailleurs. (Les charges utiles EVM sont
encodées en ABI de façon asynchrone ; pour celles-ci, utilisez donc `call`/`callAtomic`, ou encodez-les au préalable
et passez `{ payload }`.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## Transactions atomiques tri-VM

`callAtomic` empaquette plusieurs messages `MsgCrossVMCall` dans **un seul corps de
transaction** afin qu'ils s'exécutent de façon atomique sous une seule signature — l'argument phare
tri-VM. Une signature, des appels à travers EVM + SVM + CosmWasm qui aboutissent tous ensemble
ou pas du tout :

```ts
const { messageIds, result } = await xvm.callAtomic([
  {
    targetVm: "evm",
    targetContract: "0xToken",
    evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 2n] },
  },
  { targetVm: "svm", targetContract: "Prog...", svm: { data: instructionBytes } },
  { targetVm: "cosmwasm", targetContract: "qor1c...", cosmwasm: { ping: {} } },
]);
```

## Relire un message

`getMessage` lit un message cross-VM par identifiant, en privilégiant le client de requête typé
et en se rabattant sur la méthode JSON-RPC `qor_getCrossVMMessage` (que les points d'accès
publics ne servent pas). Donnez-lui le client de requête typé, qui lit via le
RPC de consensus :

```ts
import { connectQueryClients } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);

// Module parameters and the pending queue, over the same typed client:
const params = await queries.crossvm.params();
const pending = await queries.crossvm.pendingMessages();
```

## Lire l'état des messages cross-VM

`@qorechain/sdk` exporte des wrappers REST typés au-dessus de `x/crossvm`. Ils appellent
`/qorechain/crossvm/v1/{message/{id},pending,params}`, que la passerelle publique ne
sert **pas** (`Not Implemented` sur `api.qore.host` et `api-testnet.qore.host`),
de sorte qu'ils lèvent `QoreHttpError` contre les points d'accès publics. Ils sont destinés aux nœuds
qui exposent ces routes ; sur les réseaux publics, utilisez `connectQueryClients` ci-dessus.

```ts
import {
  createClient,
  getCrossVmMessage,
  getPendingCrossVmMessages,
  getCrossVmParams,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://api-testnet.qore.host" },
});

// A single message by id.
const msg = await getCrossVmMessage(client.rest, messageId);

// All pending messages.
const pending = await getPendingCrossVmMessages(client.rest);

// Module parameters.
const params = await getCrossVmParams(client.rest);
```

Ils renvoient des formes typées : `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` et `CrossVmParamsResponse`.

Vous pouvez également lire un message via l'espace de noms JSON-RPC `qor_`, une fois que les nœuds
le serviront :

> **Pas encore servi :** aucune version de nœud publiée ne sert l'espace de noms JSON-RPC `qor_`, de sorte que cet appel renvoie `-32601` (méthode introuvable) sur tous les points d'accès publics aujourd'hui. Voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace).

```ts
const m = await client.qor.getCrossVmMessage(messageId);
```

## Le précompilé du pont EVM

Le routage EVM→natif s'exécute sur la chaîne via le précompilé du pont cross-VM,
exposé dans `@qorechain/evm` :

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

> **Non actif.** Le précompilé du pont cross-VM n'est actif ni sur le mainnet ni sur le
> testnet et ne sera pas activé dans sa forme actuelle ; il est d'abord en cours de reconstruction.
> Un appel à `0x…0901` renvoie aujourd'hui des données vides et ne route rien. Voir
> [Précompilés EVM : état du réseau](/developer-guide/evm-precompiles#network-status).

Une fois actif, un contrat Solidity (ou viem) appelle le précompilé à cette adresse
pour router un message vers la couche native, puis suit son état avec les assistants de lecture
ci-dessus. Voir le [guide EVM](/sdk/guides/evm) pour la liste complète des précompilés.
