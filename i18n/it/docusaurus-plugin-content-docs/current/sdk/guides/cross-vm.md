---
slug: /sdk/guides/cross-vm
title: Guida Cross-VM
sidebar_label: Cross-VM
sidebar_position: 4
---

# Guida Cross-VM

QoreChain esegue **EVM, SVM e CosmWasm fianco a fianco**, e il modulo `x/crossvm`
permette a un singolo account nativo di invocare un contratto su uno qualsiasi di essi. L'SDK
fornisce un helper di alto livello `createCrossVMClient` per costruire, firmare e trasmettere
queste chiamate — incluso il raggruppamento di più chiamate in **un'unica transazione atomica
su tutte e tre le VM** — più helper di lettura tipizzati per tracciare lo stato dei messaggi. Il routing EVM→nativo
avviato *dall'interno dell'EVM* viene comunque eseguito on-chain tramite il **precompilato del bridge
cross-VM** in `@qorechain/evm`.

:::caution Cosa funziona oggi
Le chiamate cross-VM sono disponibili solo quanto la loro corsia di destinazione:

- `MsgCrossVMCall` è disattivato dal circuit breaker della catena su **mainnet**
  (`GET /cosmos/circuit/v1/disable_list` elenca `/qorechain.crossvm.v1.MsgCrossVMCall`);
  è abilitato sul testnet.
- La corsia di transazioni SVM è disabilitata su tutta la rete, l'upload e
  l'istanziazione CosmWasm sono soggetti a permessi (e su mainnet non ci sono contratti), e il
  precompilato del bridge EVM non è attivo (vedi
  [Precompilati EVM](/developer-guide/evm-precompiles#network-status)).
- Gli helper di lettura REST tipizzati qui sotto chiamano route che il gateway pubblico non serve.
  Leggi invece i messaggi con `connectQueryClients(rpc).crossvm`.
- Come ogni transazione del percorso Native, una chiamata cross-VM deve portare la firma
  ibrida: connetti il client di firma con la coppia di chiavi dell'account
  (`client.connectTx(signer, { pqcKeypair })`, SDK 0.9.0) così che il client cross-VM firmi
  in modalità ibrida (vedi [Account e firma PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).
  Le release precedenti alla 0.9.0 la firmano in modo classico e le reti pubbliche la rifiutano.
:::

## Chiamate cross-VM unificate

`createCrossVMClient` incapsula `MsgCrossVMCall` (type URL
`/qorechain.crossvm.v1.MsgCrossVMCall`) così non devi mai costruire a mano un `{ typeUrl,
value }` né codificare tu stesso un payload. Il mittente del client è l'indirizzo del
`TxClient` connesso; `sourceVm` ha come valore predefinito `"evm"`.

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

`VMType` è uno tra `"evm" | "cosmwasm" | "svm"` (esportato anche come array
`VM_TYPES`).

### Codifica del payload per ciascuna VM

Scegli esattamente **una** forma di payload per chiamata:

| Forma | Codifica |
|---|---|
| `{ payload: Uint8Array \| Hex }` | byte grezzi, passati invariati |
| `{ evm: { abi, functionName, args } }` | codificato in ABI con `encodeFunctionData` di viem (selector + args) |
| `{ cosmwasm: object }` | `JSON.stringify` poi byte UTF-8 (la convenzione execute-msg di CosmWasm) |
| `{ svm: { data: Uint8Array \| Hex } }` | byte grezzi (un blob di istruzioni SVM) |

Il percorso EVM importa `viem` in modo lazy, quindi il peer opzionale `viem` serve solo
quando usi effettivamente un payload `{ evm: ... }`.

### Solo costruzione (offline)

`buildCall` restituisce l'`EncodeObject` senza trasmetterlo — utile per
l'ispezione, per il batching manuale o per firmare altrove. (I payload EVM vengono
codificati in ABI in modo asincrono, quindi per questi usa `call`/`callAtomic`, oppure codificali prima
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
transazione** così che vengano eseguiti in modo atomico con una sola firma — il punto di forza
della tripla VM. Una firma, chiamate su EVM + SVM + CosmWasm che vanno a buon fine tutte insieme
oppure per nulla:

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

`getMessage` legge un messaggio cross-VM per id, preferendo il client di query tipizzato
e ripiegando sul metodo JSON-RPC `qor_getCrossVMMessage` (che gli endpoint
pubblici non servono). Passagli il client di query tipizzato, che legge tramite l'RPC
di consenso:

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

## Lettura dello stato dei messaggi cross-VM

`@qorechain/sdk` esporta wrapper REST tipizzati sopra `x/crossvm`. Chiamano
`/qorechain/crossvm/v1/{message/{id},pending,params}`, che il gateway pubblico
**non** serve (`Not Implemented` su `api.qore.host` e `api-testnet.qore.host`),
quindi sollevano `QoreHttpError` contro gli endpoint pubblici. Sono pensati per nodi
che espongono quelle route; sulle reti pubbliche usa `connectQueryClients` qui sopra.

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

Questi restituiscono forme tipizzate: `CrossVmMessage`, `CrossVmMessageResponse`,
`PendingCrossVmMessagesResponse` e `CrossVmParamsResponse`.

Puoi anche leggere un messaggio tramite il namespace JSON-RPC `qor_`, una volta che i nodi
lo serviranno:

> **Non ancora servito:** nessuna build di nodo rilasciata serve il namespace JSON-RPC `qor_`, quindi questa chiamata restituisce `-32601` (metodo non trovato) su ogni endpoint pubblico oggi. Vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace).

```ts
const m = await client.qor.getCrossVmMessage(messageId);
```

## Il precompilato bridge EVM

Il routing EVM→nativo viene eseguito on-chain tramite il precompilato del bridge cross-VM,
esposto in `@qorechain/evm`:

```ts
import { PRECOMPILE_ADDRESSES } from "@qorechain/evm";

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
// 0x0000000000000000000000000000000000000901
```

> **Non attivo.** Il precompilato del bridge cross-VM non è attivo né su mainnet né su
> testnet e non verrà attivato nella sua forma attuale; prima viene ricostruito.
> Oggi una chiamata a `0x…0901` restituisce dati vuoti e non instrada nulla. Vedi
> [Precompilati EVM: stato della rete](/developer-guide/evm-precompiles#network-status).

Una volta attivo, un contratto Solidity (o viem) chiama il precompilato a quell'indirizzo
per instradare un messaggio al livello nativo, poi ne traccia lo stato con gli helper di lettura
qui sopra. Vedi la [guida EVM](/sdk/guides/evm) per l'elenco completo dei precompilati.
