---
slug: /sdk/guides/cross-vm
title: Ghid Cross-VM
sidebar_label: Cross-VM
sidebar_position: 4
---

# Ghid Cross-VM

QoreChain rulează **EVM, SVM și CosmWasm una lângă alta**, iar modulul `x/crossvm`
permite unui singur cont nativ să invoce un contract pe oricare dintre ele. SDK-ul
oferă un utilitar de nivel înalt `createCrossVMClient` pentru a construi, semna și
difuza aceste apeluri — inclusiv împachetarea mai multora într-o **singură
tranzacție atomică pe toate cele trei VM-uri** — plus utilitare de citire tipizate
pentru a urmări starea mesajelor. Rutarea EVM→nativ inițiată *din interiorul
EVM-ului* rulează în continuare on-chain prin **precompile-ul bridge cross-VM** din
`@qorechain/evm`.

## Apeluri cross-VM unificate

`createCrossVMClient` încapsulează `MsgCrossVMCall` (URL de tip
`/qorechain.crossvm.v1.MsgCrossVMCall`) astfel încât să nu construiești niciodată
manual un `{ typeUrl, value }` și să nu codifici tu însuți un payload. Expeditorul
clientului este adresa `TxClient`-ului conectat; `sourceVm` are valoarea implicită
`"evm"`.

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

`VMType` este una dintre `"evm" | "cosmwasm" | "svm"` (exportată și ca tabloul
`VM_TYPES`).

### Codificarea payload-ului per VM

Alege exact **o** singură formă de payload per apel:

| Formă | Codificare |
|---|---|
| `{ payload: Uint8Array \| Hex }` | octeți bruți, transmiși nemodificați |
| `{ evm: { abi, functionName, args } }` | codificat ABI cu `encodeFunctionData` din viem (selector + args) |
| `{ cosmwasm: object }` | `JSON.stringify` apoi octeți UTF-8 (convenția execute-msg CosmWasm) |
| `{ svm: { data: Uint8Array \| Hex } }` | octeți bruți (un blob de instrucțiune SVM) |

Calea EVM importă `viem` în mod leneș (lazy), deci peer-ul opțional `viem` este
necesar doar atunci când folosești efectiv un payload `{ evm: ... }`.

### Doar construire (offline)

`buildCall` returnează `EncodeObject` fără a difuza — util pentru inspecție,
grupare manuală sau semnare în altă parte. (Payload-urile EVM sunt codificate ABI
asincron, deci pentru acestea folosește `call`/`callAtomic`, sau pre-codifică și
transmite `{ payload }`.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## Tranzacții atomice triple-VM

`callAtomic` împachetează mai multe mesaje `MsgCrossVMCall` într-un **singur corp
de tranzacție**, astfel încât să se execute atomic sub o singură semnătură —
titlul triple-VM. O singură semnătură, apeluri pe EVM + SVM + CosmWasm care toate
ajung împreună sau deloc:

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

## Citirea înapoi a unui mesaj

`getMessage` citește un mesaj cross-VM după id, preferând clientul de interogare
tipizat și revenind la metoda JSON-RPC `qor_getCrossVMMessage`:

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## Citirea stării mesajelor cross-VM

`@qorechain/sdk` exportă învelișuri REST tipizate peste `x/crossvm`:

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

Acestea returnează forme tipizate: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` și `CrossVmParamsResponse`.

De asemenea, poți citi un mesaj prin spațiul de nume JSON-RPC `qor_`:

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## Precompile-ul bridge EVM

Rutarea EVM→nativ se execută on-chain prin precompile-ul bridge cross-VM, expus în
`@qorechain/evm`:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

Apelează precompile-ul dintr-un contract Solidity (sau prin viem) la acea adresă
pentru a ruta un mesaj către stratul nativ, apoi urmărește-i starea cu utilitarele
de citire de mai sus. Vezi [ghidul EVM](/sdk/guides/evm) pentru lista completă de
precompile-uri.
