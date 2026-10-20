---
slug: /rollups/multi-vm
title: Multi-VM (chiamate cross-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (chiamate cross-VM)

L'RDK include helper TypeScript che codificano una chiamata da un contratto EVM al **precompile cross-VM** all'indirizzo `0x0000000000000000000000000000000000000901`, progettato per instradarla verso un contratto CosmWasm sul runtime **QoreChain Native** (Wasm), e un template di scaffold `multivm-rollup` che li collega. Gli strumenti coprono soltanto **EVM → QoreChain Native**; SVM è un runtime separato e non fa parte del precompile.

:::caution Non ancora utilizzabile sulle reti live
Il precompile cross-VM **non è attivato** su nessuna delle due reti: l'elenco dei precompile statici attivi del modulo EVM è vuoto sulla mainnet e sulla testnet, `eth_getCode` per `0x…0901` restituisce `0x`, e una chiamata ad esso riesce con dati vuoti e non esegue nulla. Anche il caricamento di contratti CosmWasm è chiuso su entrambe le reti, e la corsia di transazioni SVM è disabilitata su tutta la rete. Finché il precompile non sarà attivato e i caricamenti CosmWasm non saranno riaperti, non c'è nulla da chiamare. Questa pagina documenta gli strumenti in modo che tu possa prepararti; non costruire flussi di produzione su di essi. Vedi [Precompile EVM: stato della rete](/developer-guide/evm-precompiles#network-status).
:::

:::caution L'encoder della 0.5.0 non corrisponde al layout della chain
`encodeCrossVmCalldata` in `@qorechain/rdk` 0.5.0 (e lo starter `CrossVmCaller.sol` nel template `multivm-rollup`) usano la funzione `executeCrossVMCall(string,bytes)`. Il nodo decodifica `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selettore di 4 byte, poi gli argomenti codificati ABI; `targetVM` 1 è CosmWasm, l'unico target supportato), e l'ABI potrebbe ancora cambiare prima dell'attivazione. I calldata prodotti dall'helper quindi non vengono decodificati dal nodo nemmeno quando il precompile esisterà. Le sezioni seguenti mostrano il layout del nodo.
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
    1, // CosmWasm
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata({ contract, msg })` di `@qorechain/rdk` costruisce invece la forma `(string,bytes)`, che il nodo non legge (vedi l'avvertenza sopra).

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

Poiché il precompile è inattivo, una semplice `.call` verso di esso restituisce **successo con dati vuoti e non fa nulla**; il flag `ok` non indica che la chiamata abbia avuto effetto. Se lo provi oggi, verifica l'effetto sul contratto di destinazione.

## Scaffold di un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Il template include un punto di partenza `contracts/CrossVmCaller.sol`; confrontalo con il layout del nodo qui sopra prima di affidartici. Vedi [Distribuire un rollup](/rollups/deploying-a-rollup) per tutti i template dello scaffolder.
