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

`VMType` est l'un de `"evm" | "cosmwasm" | "svm"` (également exporté sous forme du tableau `VM_TYPES`).

### Encodage de la charge utile par VM

Choisissez exactement **une** forme de charge utile par appel :

| Forme | Encodage |
|---|---|
| `{ payload: Uint8Array \| Hex }` | octets bruts, transmis tels quels |
| `{ evm: { abi, functionName, args } }` | encodé en ABI avec `encodeFunctionData` de viem (sélecteur + args) |
| `{ cosmwasm: object }` | `JSON.stringify` puis octets UTF-8 (la convention execute-msg de CosmWasm) |
| `{ svm: { data: Uint8Array \| Hex } }` | octets bruts (un blob d'instruction SVM) |

Le chemin EVM importe `viem` de manière paresseuse, de sorte que le pair optionnel `viem` n'est nécessaire
que lorsque vous utilisez réellement une charge utile `{ evm: ... }`.

### Construction seule (hors ligne)

`buildCall` retourne l'`EncodeObject` sans diffuser — pratique pour
l'inspection, le regroupement manuel ou la signature ailleurs. (Les charges utiles EVM sont
encodées en ABI de manière asynchrone, donc pour celles-ci utilisez `call`/`callAtomic`, ou pré-encodez
et passez `{ payload }`.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## Transactions atomiques tri-VM

`callAtomic` empaquette plusieurs messages `MsgCrossVMCall` dans **un seul corps
de transaction** afin qu'ils s'exécutent atomiquement sous une seule signature — l'argument phare tri-VM.
Une seule signature, des appels à travers EVM + SVM + CosmWasm qui aboutissent tous ensemble
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

`getMessage` lit un message cross-VM par id, en privilégiant le client de requête typé
et en se rabattant sur la méthode JSON-RPC `qor_getCrossVMMessage` :

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## Lire l'état des messages cross-VM

`@qorechain/sdk` exporte des wrappers REST typés au-dessus de `x/crossvm` :

```ts
import {
  createClient,
  getCrossVmMessage,
  getPendingCrossVmMessages,
  getCrossVmParams,
} from "@qorechain/sdk";

const client = createClient({
  endpoints: { rest: "https://rest.testnet.example" },
});

// A single message by id.
const msg = await getCrossVmMessage(client.rest, messageId);

// All pending messages.
const pending = await getPendingCrossVmMessages(client.rest);

// Module parameters.
const params = await getCrossVmParams(client.rest);
```

Ceux-ci retournent des formes typées : `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` et `CrossVmParamsResponse`.

Vous pouvez également lire un message via l'espace de noms JSON-RPC `qor_` :

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## Le précompilé du pont EVM

Le routage EVM→natif s'exécute sur la chaîne via le précompilé du pont cross-VM,
exposé dans `@qorechain/evm` :

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

Appelez le précompilé depuis un contrat Solidity (ou via viem) à cette adresse pour
router un message vers la couche native, puis suivez son état avec les assistants de lecture
ci-dessus. Voir le [guide EVM](/sdk/guides/evm) pour la liste complète des précompilés.
