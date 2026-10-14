---
slug: /rollups/multi-vm
title: Multi-VM (chiamate cross-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (chiamate cross-VM)

L'RDK include helper TypeScript che codificano una chiamata da un contratto EVM al **precompile cross-VM** all'indirizzo `0x0000000000000000000000000000000000000901`, progettato per instradarla verso un contratto CosmWasm sul runtime **QoreChain Native** (Wasm), e un template di scaffold `multivm-rollup` che li collega. Gli strumenti coprono soltanto **EVM → QoreChain Native**; SVM è un runtime separato e non fa parte del precompile.

:::caution Non ancora utilizzabile sulle reti live
Il precompile cross-VM **non è attivato** su nessuna delle due reti: l'elenco dei precompile statici attivi del modulo EVM è vuoto sulla mainnet e sulla testnet, quindi una chiamata a `0x…0901` restituisce dati vuoti e non esegue nulla. Anche il caricamento di contratti CosmWasm è chiuso su entrambe le reti, e la corsia di transazioni SVM è disabilitata su tutta la rete. Finché il precompile non sarà attivato e i caricamenti CosmWasm non saranno riaperti, non c'è nulla da chiamare. Questa pagina documenta gli strumenti in modo che tu possa prepararti; non costruire flussi di produzione su di essi. Vedi [Precompile EVM: stato della rete](/developer-guide/evm-precompiles#network-status).
:::

:::note
A partire da RDK v0.4.2 l'identificatore dell'opzione VM del runtime Wasm è **`native`** (QoreChain Native); `cosmwasm` rimane un alias legacy accettato, ed entrambi vengono mappati su `cosmwasm` a livello di protocollo. La funzione ABI del precompile è `executeCrossVMCall(string,bytes)`.
:::

## L'indirizzo del precompile

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Codifica di una chiamata cross-VM

`encodeCrossVmCalldata` costruisce i calldata per `executeCrossVMCall(string contract, bytes msg)`. `msg` è il messaggio di esecuzione del contratto, come stringa JSON UTF-8 o byte grezzi.

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## Il lato Solidity

Da un contratto EVM chiami l'indirizzo del precompile con la chiamata codificata:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Poiché il precompile è inattivo, una semplice `.call` verso di esso restituisce successo con dati vuoti; se lo provi oggi, controlla la lunghezza restituita invece di affidarti al solo flag `ok`.

## Scaffold di un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Il template include un punto di partenza `contracts/CrossVmCaller.sol`; confrontalo con l'ABI qui sopra prima di affidartici. Vedi [Distribuire un rollup](/rollups/deploying-a-rollup) per tutti i template dello scaffolder.
