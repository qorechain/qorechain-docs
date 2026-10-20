---
slug: /rollups/multi-vm
title: Multi-VM (llamadas entre VMs)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (llamadas entre VMs)

El RDK incluye utilidades TypeScript que codifican una llamada desde un contrato EVM al **precompilado cross-VM** en `0x0000000000000000000000000000000000000901`, diseñado para enrutarla a un contrato CosmWasm en el runtime **QoreChain Native** (Wasm), y una plantilla de andamiaje `multivm-rollup` que las conecta. Las herramientas cubren únicamente **EVM → QoreChain Native**; SVM es un runtime independiente y no forma parte del precompilado.

:::caution Todavía no se puede usar en las redes en producción
El precompilado cross-VM **no está activado** en ninguna de las dos redes: la lista de precompilados estáticos activos del módulo EVM está vacía en mainnet y en testnet, `eth_getCode` para `0x…0901` devuelve `0x`, y una llamada a él termina con éxito con datos vacíos y no ejecuta nada. La subida de contratos CosmWasm también está cerrada en ambas redes, y el carril de transacciones SVM está deshabilitado en toda la red. Hasta que el precompilado se active y se reabran las subidas de CosmWasm, no hay nada a lo que llamar. Esta página documenta las herramientas para que puedas prepararte; no construyas flujos de producción sobre ellas. Consulta [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::caution El codificador de la 0.5.0 no coincide con el formato de la cadena
`encodeCrossVmCalldata` en `@qorechain/rdk` 0.5.0 (y el punto de partida `CrossVmCaller.sol` de la plantilla `multivm-rollup`) usan la función `executeCrossVMCall(string,bytes)`. El nodo decodifica `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector de 4 bytes, seguido de los argumentos codificados con ABI; `targetVM` 1 es CosmWasm, el único destino admitido), y el ABI todavía puede cambiar antes de la activación. Por tanto, el calldata generado por la utilidad no se decodifica en el nodo ni siquiera cuando el precompilado exista. Las secciones siguientes muestran el formato del nodo.
:::

:::note
A partir de RDK v0.4.2, el identificador de la opción de VM del runtime Wasm es **`native`** (QoreChain Native); `cosmwasm` sigue siendo un alias heredado aceptado, y ambos se mapean a `cosmwasm` en el protocolo.
:::

## La dirección del precompilado

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Codificar una llamada cross-VM

Codifica directamente el formato del nodo. `payload` es el mensaje de ejecución del contrato como bytes JSON UTF-8 (se muestra con viem):

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

`encodeCrossVmCalldata({ contract, msg })` de `@qorechain/rdk` construye en su lugar la forma `(string,bytes)`, que el nodo no lee (consulta la advertencia anterior).

## El lado de Solidity

Desde un contrato EVM llamas a la dirección del precompilado con la llamada codificada:

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

Como el precompilado está inactivo, un `.call` simple sobre él devuelve **éxito con datos vacíos y no hace nada**; el indicador `ok` no te dice que la llamada haya surtido efecto. Si lo pruebas hoy, confirma el efecto en el contrato de destino.

## Generar el andamiaje de un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

La plantilla incluye un punto de partida `contracts/CrossVmCaller.sol`; compáralo con el formato del nodo anterior antes de apoyarte en él. Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para ver todas las plantillas del generador de andamiaje.
