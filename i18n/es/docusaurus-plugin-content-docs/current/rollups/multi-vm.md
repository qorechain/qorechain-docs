---
slug: /rollups/multi-vm
title: Multi-VM (llamadas entre VMs)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (llamadas entre VMs)

El RDK incluye utilidades TypeScript que codifican una llamada desde un contrato EVM al **precompilado cross-VM** en `0x0000000000000000000000000000000000000901`, diseñado para enrutarla a un contrato CosmWasm en el runtime **QoreChain Native** (Wasm), y una plantilla de andamiaje `multivm-rollup` que las conecta. Las herramientas cubren únicamente **EVM → QoreChain Native**; SVM es un runtime independiente y no forma parte del precompilado.

:::caution Todavía no se puede usar en las redes en producción
El precompilado cross-VM **no está activado** en ninguna de las dos redes: la lista de precompilados estáticos activos del módulo EVM está vacía en mainnet y en testnet, por lo que una llamada a `0x…0901` devuelve datos vacíos y no ejecuta nada. La subida de contratos CosmWasm también está cerrada en ambas redes, y el carril de transacciones SVM está deshabilitado en toda la red. Hasta que el precompilado se active y se reabran las subidas de CosmWasm, no hay nada a lo que llamar. Esta página documenta las herramientas para que puedas prepararte; no construyas flujos de producción sobre ellas. Consulta [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::note
A partir de RDK v0.4.2, el identificador de la opción de VM del runtime Wasm es **`native`** (QoreChain Native); `cosmwasm` sigue siendo un alias heredado aceptado, y ambos se mapean a `cosmwasm` en el protocolo. La función ABI del precompilado es `executeCrossVMCall(string,bytes)`.
:::

## La dirección del precompilado

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Codificar una llamada cross-VM

`encodeCrossVmCalldata` construye el calldata para `executeCrossVMCall(string contract, bytes msg)`. `msg` es el mensaje de ejecución del contrato, como cadena JSON UTF-8 o como bytes en bruto.

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## El lado de Solidity

Desde un contrato EVM llamas a la dirección del precompilado con la llamada codificada:

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

Como el precompilado está inactivo, un `.call` simple sobre él devuelve éxito con datos vacíos; si lo pruebas hoy, comprueba la longitud de lo devuelto en lugar de fiarte únicamente del indicador `ok`.

## Generar el andamiaje de un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

La plantilla incluye un punto de partida `contracts/CrossVmCaller.sol`; compáralo con el ABI anterior antes de apoyarte en él. Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para ver todas las plantillas del generador de andamiaje.
