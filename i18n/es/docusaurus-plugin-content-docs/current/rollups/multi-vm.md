---
slug: /rollups/multi-vm
title: Multi-VM (llamadas entre VMs)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (llamadas entre VMs)

Un rollup multi-VM ejecuta una capa de ejecución EVM que puede invocar contratos
CosmWasm en el runtime **QoreChain Native** (Wasm) a través de un
**precompilado cross-VM** dedicado. El RDK incluye las herramientas TypeScript
para codificar esas llamadas y una plantilla de andamiaje desde la cual empezar.

> Estas herramientas cubren únicamente **EVM → QoreChain Native** (contratos
> CosmWasm). SVM es un runtime independiente y no forma parte del precompilado
> cross-VM.

:::note
A partir de RDK v0.4.2, el identificador de la opción de VM del runtime Wasm es
**`native`** (QoreChain Native); `cosmwasm` sigue siendo un alias heredado
aceptado, y ambos se mapean a `cosmwasm` en el protocolo — la cadena, el
explorador y el ABI del precompilado cross-VM (`executeCrossVMCall`) no
cambian.
:::

## El precompilado

El precompilado cross-VM se expone en una dirección fija:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## Codificar una llamada cross-VM

`encodeCrossVmCalldata` construye el calldata que tu contrato EVM envía al
precompilado para invocar un contrato CosmWasm. `functionSelector` calcula el
selector de 4 bytes para una firma de función de Solidity.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## El lado de Solidity

Desde un contrato EVM llamas a la dirección del precompilado con el calldata
codificado. La plantilla `multivm-rollup` incluye un fragmento
`contracts/CrossVmCaller.sol` similar a este:

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
preparado para llamar a CosmWasm, incluido el fragmento `CrossVmCaller.sol`:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para ver todas las
plantillas del generador de andamiaje.
