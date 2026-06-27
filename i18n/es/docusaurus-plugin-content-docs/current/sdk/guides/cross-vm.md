---
slug: /sdk/guides/cross-vm
title: Guía Cross-VM
sidebar_label: Cross-VM
sidebar_position: 4
---

# Guía Cross-VM

QoreChain ejecuta **EVM, SVM y CosmWasm en paralelo**, y el módulo `x/crossvm`
permite que una sola cuenta nativa invoque un contrato en cualquiera de ellos. El
SDK proporciona un ayudante de alto nivel `createCrossVMClient` para construir,
firmar y difundir estas llamadas, incluso empaquetando varias en **una
transacción atómica a través de las tres VM**, además de ayudantes de lectura
tipados para seguir el estado de los mensajes. El enrutamiento EVM→nativo iniciado
*desde dentro de la EVM* aún se ejecuta en la cadena a través del **precompilado
del puente cross-VM** en `@qorechain/evm`.

## Llamadas cross-VM unificadas

`createCrossVMClient` envuelve `MsgCrossVMCall` (URL de tipo
`/qorechain.crossvm.v1.MsgCrossVMCall`) para que nunca tengas que construir a mano
un `{ typeUrl, value }` ni codificar una carga útil por tu cuenta. El emisor del
cliente es la dirección del `TxClient` conectado; `sourceVm` toma por defecto el
valor `"evm"`.

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

`VMType` es uno de `"evm" | "cosmwasm" | "svm"` (también exportado como el array
`VM_TYPES`).

### Codificación de la carga útil por VM

Elige exactamente **una** forma de carga útil por llamada:

| Forma | Codificación |
|---|---|
| `{ payload: Uint8Array \| Hex }` | bytes en bruto, pasados sin cambios |
| `{ evm: { abi, functionName, args } }` | codificada en ABI con `encodeFunctionData` de viem (selector + args) |
| `{ cosmwasm: object }` | `JSON.stringify` y luego bytes UTF-8 (la convención de mensaje de ejecución de CosmWasm) |
| `{ svm: { data: Uint8Array \| Hex } }` | bytes en bruto (un blob de instrucción SVM) |

La ruta EVM importa `viem` de forma diferida, por lo que el par opcional `viem`
solo se necesita cuando realmente usas una carga útil `{ evm: ... }`.

### Solo construcción (sin conexión)

`buildCall` devuelve el `EncodeObject` sin difundirlo: práctico para inspección,
para agrupar a mano o para firmar en otro lugar. (Las cargas útiles EVM se
codifican en ABI de forma asíncrona, así que para esas usa `call`/`callAtomic`, o
precodifica y pasa `{ payload }`.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## Transacciones atómicas a través de tres VM

`callAtomic` empaqueta varios mensajes `MsgCrossVMCall` en **un único cuerpo de
transacción** para que se ejecuten de forma atómica bajo una sola firma: el
titular de las tres VM. Una firma, llamadas a través de EVM + SVM + CosmWasm que
aterrizan todas juntas o ninguna:

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

## Volver a leer un mensaje

`getMessage` lee un mensaje cross-VM por id, prefiriendo el cliente de consulta
tipado y recurriendo al método JSON-RPC `qor_getCrossVMMessage`:

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## Lectura del estado de los mensajes cross-VM

`@qorechain/sdk` exporta envoltorios REST tipados sobre `x/crossvm`:

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

Estos devuelven formas tipadas: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` y `CrossVmParamsResponse`.

También puedes leer un mensaje a través del espacio de nombres JSON-RPC `qor_`:

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## El precompilado del puente EVM

El enrutamiento EVM→nativo se ejecuta en la cadena a través del precompilado del
puente cross-VM, expuesto en `@qorechain/evm`:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

Llama al precompilado desde un contrato de Solidity (o mediante viem) en esa
dirección para enrutar un mensaje a la capa nativa, y luego sigue su estado con
los ayudantes de lectura de arriba. Consulta la [guía de EVM](/sdk/guides/evm)
para ver la lista completa de precompilados.
