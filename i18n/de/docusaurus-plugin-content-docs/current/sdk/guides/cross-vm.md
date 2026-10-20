---
slug: /sdk/guides/cross-vm
title: Cross-VM-Leitfaden
sidebar_label: Cross-VM
sidebar_position: 4
---

# Cross-VM-Leitfaden

QoreChain betreibt **EVM, SVM und QoreChain Native nebeneinander**, und das `x/crossvm`-Modul
ermöglicht es einem einzigen nativen Konto, einen Vertrag auf jeder davon aufzurufen. Das SDK
bietet einen High-Level-Helfer `createCrossVMClient`, um diese Aufrufe zu erstellen, zu signieren und zu senden —
einschließlich des Bündelns mehrerer Aufrufe in **eine atomare Transaktion über alle
drei VMs** — plus typisierte Lese-Helfer, um den Nachrichtenzustand zu verfolgen. EVM→native-Routing,
das *innerhalb der EVM* initiiert wird, läuft weiterhin on-chain über das **Cross-VM-Bridge-Precompile**
in `@qorechain/evm`.

:::caution Was heute funktioniert
Cross-VM-Aufrufe sind nur so verfügbar wie ihre Ziel-Lane:

- `MsgCrossVMCall` ist durch den Circuit Breaker der Chain auf dem **Mainnet** abgeschaltet
  (`GET /cosmos/circuit/v1/disable_list` listet `/qorechain.crossvm.v1.MsgCrossVMCall` auf);
  auf dem Testnet ist sie aktiviert.
- Die SVM-Transaktions-Lane ist netzwerkweit deaktiviert, QoreChain Native-Upload und
  -Instanziierung sind berechtigungsbeschränkt (und auf dem Mainnet gibt es keine Verträge),
  und das EVM-Bridge-Precompile ist nicht aktiv (siehe
  [EVM-Precompiles](/developer-guide/evm-precompiles#network-status)).
- Die unten beschriebenen typisierten REST-Lese-Helfer rufen Routen auf, die das öffentliche Gateway nicht bereitstellt.
  Lesen Sie Nachrichten stattdessen mit `connectQueryClients(rpc).crossvm`.
- Wie jede Transaktion auf dem Native-Pfad muss ein Cross-VM-Aufruf die hybride
  Signatur tragen: Verbinde den signierenden Client mit dem Schlüsselpaar des Kontos
  (`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0), damit der Cross-VM-Client
  hybrid signiert (siehe [Konten & PQC-Signierung](/sdk/concepts/accounts-pqc#hybrid-signing)).
  Releases vor 0.9.0 signieren ihn klassisch, und die öffentlichen Netzwerke lehnen ihn ab.
:::

## Vereinheitlichte Cross-VM-Aufrufe

`createCrossVMClient` umschließt `MsgCrossVMCall` (Type-URL
`/qorechain.crossvm.v1.MsgCrossVMCall`), sodass du niemals ein `{ typeUrl,
value }` von Hand baust oder selbst einen Payload kodierst. Der Sender des Clients ist die Adresse des verbundenen
`TxClient`; `sourceVm` ist standardmäßig `"evm"`.

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet", endpoints: { rpc, rest } });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid-signed (SDK 0.9.0)
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
| `{ cosmwasm: object }` | `JSON.stringify`, dann UTF-8-Bytes (die QoreChain Native-Execute-Msg-Konvention) |
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
Eine Signatur, Aufrufe über EVM + SVM + QoreChain Native, die alle zusammen oder gar nicht landen:

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
bevorzugt wird und auf die `qor_getCrossVMMessage`-JSON-RPC-Methode zurückgegriffen wird (die die öffentlichen
Endpunkte nicht bereitstellen). Übergib ihm den typisierten Query-Client, der über den
Konsens-RPC liest:

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

## Cross-VM-Nachrichtenzustand lesen

`@qorechain/sdk` exportiert typisierte REST-Wrapper über `x/crossvm`. Sie rufen
`/qorechain/crossvm/v1/{message/{id},pending,params}` auf, was das öffentliche Gateway
**nicht** bereitstellt (`Not Implemented` auf `api.qore.host` und `api-testnet.qore.host`),
sodass sie gegen die öffentlichen Endpunkte `QoreHttpError` werfen. Sie sind für Nodes
gedacht, die diese Routen bereitstellen; verwende in den öffentlichen Netzwerken oben `connectQueryClients`.

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

Diese geben typisierte Formen zurück: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` und `CrossVmParamsResponse`.

Du kannst eine Nachricht auch über den `qor_`-JSON-RPC-Namensraum lesen, sobald Nodes
ihn bereitstellen:

> **Noch nicht bereitgestellt:** Kein veröffentlichter Node-Build stellt den JSON-RPC-Namensraum `qor_` bereit, daher liefert dieser Aufruf heute auf jedem öffentlichen Endpunkt `-32601` (Methode nicht gefunden). Siehe [den Namensraum `qor_`](/api-reference/json-rpc-qor_-namespace).

```ts
const m = await client.qor.getCrossVmMessage(messageId);
```

## Das EVM-Bridge-Precompile

EVM→native-Routing wird on-chain über das Cross-VM-Bridge-Precompile ausgeführt,
das in `@qorechain/evm` bereitgestellt wird:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

> **Nicht aktiv.** Das Cross-VM-Bridge-Precompile ist weder auf dem Mainnet noch auf dem
> Testnet aktiv und wird in seiner jetzigen Form nicht aktiviert; es wird zunächst neu
> aufgebaut. Ein Aufruf an `0x…0901` liefert heute leere Daten zurück und routet nichts. Siehe
> [EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status).

Sobald es aktiv ist, ruft ein Solidity-Vertrag (oder viem) das Precompile unter dieser Adresse auf, um
eine Nachricht an die native Schicht zu routen, und verfolgt dann ihren Zustand mit den obigen Lese-Helfern.
Siehe den [EVM-Leitfaden](/sdk/guides/evm) für die vollständige Precompile-Liste.
