---
slug: /rollups/multi-vm
title: Multi-VM (llamadas entre VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (llamadas entre VM)

Un rollup multi-VM ejecuta una capa de ejecución EVM que puede llamar a contratos
CosmWasm a través de un **precompilado entre VM** dedicado. El RDK incluye las
herramientas de TypeScript para codificar esas llamadas y una plantilla de andamiaje
desde la que empezar.

> Estas herramientas cubren únicamente **EVM → CosmWasm**. SVM es un runtime
> independiente y no forma parte del precompilado entre VM.

## El precompilado

El precompilado entre VM se expone en una dirección fija:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## Codificar una llamada entre VM

`encodeCrossVmCalldata` construye los calldata que tu contrato EVM envía al
precompilado para invocar un contrato CosmWasm. `functionSelector` calcula el
selector de 4 bytes para una firma de función Solidity.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## El lado de Solidity

Desde un contrato EVM llamas a la dirección del precompilado con los calldata
codificados. La plantilla `multivm-rollup` incluye un fragmento
`contracts/CrossVmCaller.sol` con esta forma:

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## Generar el andamiaje de un rollup multi-VM

Una nueva plantilla, `multivm-rollup`, genera el andamiaje de un rollup EVM
conectado para llamar a CosmWasm, incluido el fragmento `CrossVmCaller.sol`:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para ver todas las
plantillas del generador de andamiaje.
