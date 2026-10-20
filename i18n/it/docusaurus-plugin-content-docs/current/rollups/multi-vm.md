---
slug: /rollups/multi-vm
title: Multi-VM (chiamate cross-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (chiamate cross-VM)

L'RDK include helper TypeScript che codificano una chiamata da un contratto EVM al **precompile cross-VM** all'indirizzo `0x0000000000000000000000000000000000000901`, progettato per instradarla verso un contratto QoreChain Native sul runtime **QoreChain Native** (Wasm), e un template di scaffold `multivm-rollup` che li collega. Gli strumenti coprono soltanto **EVM → QoreChain Native**; SVM è un runtime separato e non fa parte del precompile.

:::caution Non ancora utilizzabile sulle reti live
Il precompile cross-VM **non è attivato** su nessuna delle due reti: l'elenco dei precompile statici attivi del modulo EVM è vuoto sulla mainnet e sulla testnet, `eth_getCode` per `0x…0901` restituisce `0x`, e una chiamata ad esso riesce con dati vuoti e non esegue nulla. Anche il caricamento di contratti QoreChain Native è chiuso su entrambe le reti, e la corsia di transazioni SVM è disabilitata su tutta la rete. Finché il precompile non sarà attivato e i caricamenti QoreChain Native non saranno riaperti, non c'è nulla da chiamare. Questa pagina documenta gli strumenti in modo che tu possa prepararti; non costruire flussi di produzione su di essi. Vedi [Precompile EVM: stato della rete](/developer-guide/evm-precompiles#network-status).
:::

:::note Dalla 0.6.0 l'encoder corrisponde al layout della chain
`encodeCrossVmCalldata` in `@qorechain/rdk` **0.5.0 e precedenti** (e lo starter `CrossVmCaller.sol` nel template `multivm-rollup` di quelle release) usava `executeCrossVMCall(string,bytes)`, un selettore di funzione diverso da quello che il nodo decodifica, quindi nessuna chiamata da esso codificata avrebbe potuto raggiungere il precompile nemmeno su una rete che l'avesse attivato. La **0.6.0** codifica `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selettore `0x3c11078c`), che è ciò che il nodo decodifica (selettore di 4 byte, poi gli argomenti codificati ABI; `targetVM` 1 è QoreChain Native, l'unico target supportato), e secondo le note di rilascio i calldata dell'helper passano il round-trip attraverso il decoder della chain stessa. L'ABI potrebbe ancora cambiare prima dell'attivazione.
:::

:::note
A partire da RDK v0.4.2 l'identificatore dell'opzione VM del runtime Wasm è **`native`** (QoreChain Native); `cosmwasm` rimane un alias legacy accettato, ed entrambi vengono mappati su `cosmwasm` a livello di protocollo.
:::

## L'indirizzo del precompile

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Codifica di una chiamata cross-VM

Codifica direttamente il layout del nodo. `payload` è il messaggio di esecuzione del contratto come byte JSON UTF-8 (mostrato con viem):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata` di `@qorechain/rdk` 0.6.0 costruisce per te gli stessi calldata:

```ts
import {
  CROSS_VM_PRECOMPILE,
  CROSS_VM_TARGET,
  encodeCrossVmCalldata,
  isCrossVmPrecompileActive,
} from "@qorechain/rdk";

// Ask the node first: today this answers `active: false` on both networks.
const status = await isCrossVmPrecompileActive("https://api.qore.host");
console.log(status.active, status.reason);

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ increment: {} }),
  targetVm: CROSS_VM_TARGET.NATIVE, // 1 = QoreChain Native (CosmWasm); the default
});
// An EVM transaction to CROSS_VM_PRECOMPILE with `data: calldata`.
```

`isCrossVmPrecompileActive(restBase)` legge via REST il parametro EVM `active_static_precompiles` e risponde `active: true` solo quando l'indirizzo del precompile è elencato. È l'unico controllo affidabile e deve avvenire off-chain: il precompile restituisce la risposta grezza del target, quindi una risposta vuota non permette di distinguere un precompile inattivo da una chiamata genuina a un contratto che non restituisce nulla, e un precompile non ha bytecode che sia attivo o no. Anche quando riporta `active: true`, il pacchetto documenta che dalla v3.2.3 della chain una chiamata raggiunge solo i target in allowlist per la governance (il parametro cross-VM `bridge_allowed_targets`, ogni voce `<vm>:<contract>`), e che EVM-verso-EVM viene rifiutato.

## Il lato Solidity

Da un contratto EVM chiami l'indirizzo del precompile con la chiamata codificata:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data = abi.encodeWithSignature(
        "executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_
    );
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Poiché il precompile è inattivo, una semplice `.call` verso di esso restituisce **successo con dati vuoti e non fa nulla**; il flag `ok` non indica che la chiamata abbia avuto effetto. La protezione affidabile all'interno del contratto è un target che restituisce sempre una conferma non vuota, con un `require(ret.length > 0)` dopo la chiamata, in modo che una risposta vuota sia trattata come un fallimento; il template `multivm-rollup` della 0.6.0 fa così.

## Scaffold di un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Il template della 0.6.0 include `src/crossvm-call.ts` (verifica se il precompile è attivo, poi stampa i calldata) e un `contracts/CrossVmCaller.sol` che chiama `executeCrossVMCall(uint8,string,bytes)` e richiede una risposta non vuota dal target. Non fa funzionare una chiamata finché il precompile è inattivo. Vedi [Distribuire un rollup](/rollups/deploying-a-rollup) per tutti i template dello scaffolder.
