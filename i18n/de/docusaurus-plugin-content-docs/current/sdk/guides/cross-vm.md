---
slug: /sdk/guides/cross-vm
title: Cross-VM-Leitfaden
sidebar_label: Cross-VM
sidebar_position: 4
---

# Cross-VM-Leitfaden

QoreChain betreibt **EVM, SVM und CosmWasm nebeneinander**, und das `x/crossvm`-Modul
ermöglicht es einem einzigen nativen Konto, einen Vertrag auf jeder davon aufzurufen. Das SDK
bietet einen High-Level-Helfer `createCrossVMClient`, um diese Aufrufe zu erstellen, zu signieren und zu senden —
einschließlich des Bündelns mehrerer Aufrufe in **eine atomare Transaktion über alle
drei VMs** — plus typisierte Lese-Helfer, um den Nachrichtenzustand zu verfolgen. EVM→native-Routing,
das *innerhalb der EVM* initiiert wird, läuft weiterhin on-chain über das **Cross-VM-Bridge-Precompile**
in `@qorechain/evm`.

## Vereinheitlichte Cross-VM-Aufrufe

`createCrossVMClient` umschließt `MsgCrossVMCall` (Type-URL
`/qorechain.crossvm.v1.MsgCrossVMCall`), sodass du niemals ein `{ typeUrl,
value }` von Hand baust oder selbst einen Payload kodierst. Der Sender des Clients ist die Adresse des verbundenen
`TxClient`; `sourceVm` ist standardmäßig `"evm"`.

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

`VMType` ist eines von `"evm" | "cosmwasm" | "svm"` (auch als das `VM_TYPES`-Array
exportiert).

### Payload-Kodierung pro VM

Wähle genau **eine** Payload-Form pro Aufruf:

| Form | Kodierung |
|---|---|
| `{ payload: Uint8Array \| Hex }` | rohe Bytes, unverändert durchgereicht |
| `{ evm: { abi, functionName, args } }` | ABI-kodiert mit viems `encodeFunctionData` (Selector + Args) |
| `{ cosmwasm: object }` | `JSON.stringify`, dann UTF-8-Bytes (die CosmWasm-Execute-Msg-Konvention) |
| `{ svm: { data: Uint8Array \| Hex } }` | rohe Bytes (ein SVM-Instruktions-Blob) |

Der EVM-Pfad importiert `viem` lazy, sodass der optionale `viem`-Peer nur benötigt wird,
wenn du tatsächlich einen `{ evm: ... }`-Payload verwendest.

### Nur erstellen (offline)

`buildCall` gibt das `EncodeObject` ohne Senden zurück — praktisch für die
Inspektion, manuelles Batching oder das Signieren an anderer Stelle. (EVM-Payloads werden
asynchron ABI-kodiert, verwende für diese also `call`/`callAtomic`, oder kodiere vorab
und übergib `{ payload }`.)

```ts
const msg = xvm.buildCall({
  targetVm: "svm",
  targetContract: "Prog...",
  svm: { data: new Uint8Array([1, 2, 3]) },
});
```

## Atomare Triple-VM-Transaktionen

`callAtomic` packt mehrere `MsgCrossVMCall`-Nachrichten in **einen Transaktions-Body**,
sodass sie atomar unter einer einzigen Signatur ausgeführt werden — die Triple-VM-Schlagzeile.
Eine Signatur, Aufrufe über EVM + SVM + CosmWasm, die alle zusammen oder gar nicht landen:

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

## Eine Nachricht zurücklesen

`getMessage` liest eine Cross-VM-Nachricht anhand der ID, wobei der typisierte Query-Client
bevorzugt wird und auf die `qor_getCrossVMMessage`-JSON-RPC-Methode zurückgegriffen wird:

```ts
import { connectQueryClients } from "@qorechain/sdk";

const queries = connectQueryClients(rpcClient);
const reader = createCrossVMClient(tx, { query: queries.crossvm });

const msg = await reader.getMessage(messageId);
```

## Cross-VM-Nachrichtenzustand lesen

`@qorechain/sdk` exportiert typisierte REST-Wrapper über `x/crossvm`:

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

Diese geben typisierte Formen zurück: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` und `CrossVmParamsResponse`.

Du kannst eine Nachricht auch über den `qor_`-JSON-RPC-Namensraum lesen:

```ts
const m = await client.qor.getCrossVMMessage(messageId);
```

## Das EVM-Bridge-Precompile

EVM→native-Routing wird on-chain über das Cross-VM-Bridge-Precompile ausgeführt,
das in `@qorechain/evm` bereitgestellt wird:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

Rufe das Precompile aus einem Solidity-Vertrag (oder über viem) unter dieser Adresse auf, um
eine Nachricht an die native Schicht zu routen, und verfolge dann ihren Zustand mit den obigen Lese-Helfern.
Siehe den [EVM-Leitfaden](/sdk/guides/evm) für die vollständige Precompile-Liste.
