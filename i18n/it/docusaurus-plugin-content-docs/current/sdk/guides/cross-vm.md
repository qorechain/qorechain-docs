---
slug: /sdk/guides/cross-vm
title: Guida Cross-VM
sidebar_label: Cross-VM
sidebar_position: 4
---

# Guida Cross-VM

QoreChain esegue **EVM, SVM e CosmWasm affiancati**, e il modulo `x/crossvm`
permette a un singolo account nativo di invocare un contratto su uno qualsiasi di essi. L'SDK
fornisce un helper di alto livello `createCrossVMClient` per costruire, firmare e trasmettere
queste chiamate — incluso il raggruppamento di più chiamate in **un'unica transazione atomica su tutte e
tre le VM** — oltre a helper di lettura tipizzati per tracciare lo stato dei messaggi. Il routing EVM→nativo
avviato *dall'interno della EVM* viene comunque eseguito on-chain tramite il **precompile bridge
cross-VM** in `@qorechain/evm`.

## Chiamate cross-VM unificate

`createCrossVMClient` racchiude `MsgCrossVMCall` (type URL
`/qorechain.crossvm.v1.MsgCrossVMCall`) così non devi mai costruire a mano un `{ typeUrl,
value }` né codificare un payload da solo. Il sender del client è l'indirizzo del
`TxClient` connesso; `sourceVm` ha come valore predefinito `"evm"`.

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

`VMType` è uno tra `"evm" | "cosmwasm" | "svm"` (esportato anche come array `VM_TYPES`).

### Codifica del payload per ciascuna VM

Scegli esattamente **una** forma di payload per chiamata:

| Forma | Codifica |
|---|---|
| `{ payload: Uint8Array \| Hex }` | byte grezzi, passati invariati |
| `{ evm: { abi, functionName, args } }` | codificato in ABI con `encodeFunctionData` di viem (selector + args) |
| `{ cosmwasm: object }` | `JSON.stringify` poi byte UTF-8 (la convenzione execute-msg di CosmWasm) |
| `{ svm: { data: Uint8Array \| Hex } }` | byte grezzi (un blob di istruzioni SVM) |

Il percorso EVM importa `viem` in modo lazy, quindi il peer opzionale `viem` è necessario solo
quando usi effettivamente un payload `{ evm: ... }`.

### Solo costruzione (offline)

`buildCall` restituisce l'`EncodeObject` senza trasmetterlo — utile per
l'ispezione, il batching manuale, o per firmare altrove. (I payload EVM vengono
codificati in ABI in modo asincrono, quindi per quelli usa `call`/`callAtomic`, oppure pre-codifica
e passa `{ payload }`.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## Transazioni atomiche su tripla VM

`callAtomic` raggruppa più messaggi `MsgCrossVMCall` in **un unico corpo di
transazione** così vengono eseguiti atomicamente sotto un'unica firma — il fiore all'occhiello della
tripla VM. Una sola firma, chiamate su EVM + SVM + CosmWasm che vanno tutte a buon fine insieme
o non vanno a buon fine affatto:

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

## Rileggere un messaggio

`getMessage` legge un messaggio cross-VM tramite id, preferendo il query client
tipizzato e ripiegando sul metodo JSON-RPC `qor_getCrossVMMessage`:

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## Lettura dello stato dei messaggi cross-VM

`@qorechain/sdk` esporta wrapper REST tipizzati sopra `x/crossvm`:

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

Questi restituiscono forme tipizzate: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` e `CrossVmParamsResponse`.

Puoi anche leggere un messaggio tramite il namespace JSON-RPC `qor_`:

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## Il precompile bridge EVM

Il routing EVM→nativo viene eseguito on-chain tramite il precompile bridge cross-VM,
esposto in `@qorechain/evm`:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

Chiama il precompile da un contratto Solidity (o tramite viem) a quell'indirizzo per
instradare un messaggio verso il livello nativo, poi traccia il suo stato con gli helper di lettura
qui sopra. Consulta la [guida EVM](/sdk/guides/evm) per l'elenco completo dei precompile.
