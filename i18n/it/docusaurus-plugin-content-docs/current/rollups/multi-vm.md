---
slug: /rollups/multi-vm
title: Multi-VM (chiamate cross-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (chiamate cross-VM)

Un rollup multi-VM esegue un livello di esecuzione EVM che può chiamare contratti
CosmWasm tramite un apposito **precompile cross-VM**. L'RDK include gli strumenti
TypeScript per codificare queste chiamate e un template scaffold da cui partire.

> Questo strumento copre **solo EVM → CosmWasm**. SVM è un runtime separato e non
> fa parte del precompile cross-VM.

## Il precompile

Il precompile cross-VM è esposto a un indirizzo fisso:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## Codifica di una chiamata cross-VM

`encodeCrossVmCalldata` costruisce i calldata che il tuo contratto EVM invia al
precompile per invocare un contratto CosmWasm. `functionSelector` calcola il
selettore a 4 byte per una firma di funzione Solidity.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## Il lato Solidity

Da un contratto EVM chiami l'indirizzo del precompile con i calldata codificati.
Il template `multivm-rollup` include uno snippet `contracts/CrossVmCaller.sol`
sulla falsariga di quanto segue:

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## Scaffold di un rollup multi-VM

Un nuovo template, `multivm-rollup`, genera lo scaffold di un rollup EVM
predisposto per chiamare CosmWasm, incluso lo snippet `CrossVmCaller.sol`:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Vedi [Deploying a Rollup](/rollups/deploying-a-rollup) per tutti i template dello
scaffolder.
