---
slug: /rollups/multi-vm
title: Multi-VM (llamadas entre VMs)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (llamadas entre VMs)

El RDK incluye utilidades TypeScript que codifican una llamada desde un contrato EVM al **precompilado cross-VM** en `0x0000000000000000000000000000000000000901`, diseñado para enrutarla a un contrato QoreChain Native en el runtime **QoreChain Native** (Wasm), y una plantilla de andamiaje `multivm-rollup` que las conecta. Las herramientas cubren únicamente **EVM → QoreChain Native**; SVM es un runtime independiente y no forma parte del precompilado.

:::caution Todavía no se puede usar en las redes en producción
El precompilado cross-VM **no está activado** en ninguna de las dos redes: la lista de precompilados estáticos activos del módulo EVM está vacía en mainnet y en testnet, `eth_getCode` para `0x…0901` devuelve `0x`, y una llamada a él termina con éxito con datos vacíos y no ejecuta nada. La subida de contratos QoreChain Native también está cerrada en ambas redes, y el carril de transacciones SVM está deshabilitado en toda la red. Hasta que el precompilado se active y se reabran las subidas de QoreChain Native, no hay nada a lo que llamar. Esta página documenta las herramientas para que puedas prepararte; no construyas flujos de producción sobre ellas. Consulta [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
:::

:::note El codificador coincide con el formato de la cadena desde la 0.6.0
`encodeCrossVmCalldata` en `@qorechain/rdk` **0.5.0 y anteriores** (y el punto de partida `CrossVmCaller.sol` de la plantilla `multivm-rollup` de esas versiones) usaba `executeCrossVMCall(string,bytes)`, un selector de función distinto del que decodifica el nodo, de modo que ninguna llamada codificada con él habría podido llegar al precompilado ni siquiera en una red que lo hubiera activado. La **0.6.0** codifica `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector `0x3c11078c`), que es lo que decodifica el nodo (selector de 4 bytes, seguido de los argumentos codificados con ABI; `targetVM` 1 es QoreChain Native, el único destino admitido), y según las notas de la versión el calldata de la utilidad atraviesa correctamente el propio decodificador de la cadena. El ABI todavía puede cambiar antes de la activación.
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
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata` de `@qorechain/rdk` 0.6.0 construye el mismo calldata por ti:

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

`isCrossVmPrecompileActive(restBase)` lee el parámetro EVM `active_static_precompiles` por REST y responde `active: true` solo cuando la dirección del precompilado figura en la lista. Esa es la única comprobación fiable, y tiene que hacerse fuera de la cadena: el precompilado devuelve la respuesta en bruto del destino, así que una respuesta vacía no permite distinguir un precompilado inactivo de una llamada real a un contrato que no devuelve nada, y un precompilado no tiene bytecode esté activo o no. Incluso cuando informa `active: true`, el paquete documenta que desde la cadena v3.2.3 una llamada solo llega a los destinos que la gobernanza ha incluido en la lista de permitidos (el parámetro cross-VM `bridge_allowed_targets`, cada entrada con la forma `<vm>:<contract>`), y que EVM a EVM es rechazado.

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

Como el precompilado está inactivo, un `.call` simple sobre él devuelve **éxito con datos vacíos y no hace nada**; el indicador `ok` no te dice que la llamada haya surtido efecto. La protección fiable dentro del contrato es un destino que siempre devuelva un acuse de recibo no vacío, con un `require(ret.length > 0)` después de la llamada, de modo que una respuesta vacía se trate como un fallo; la plantilla `multivm-rollup` de la 0.6.0 lo hace.

## Generar el andamiaje de un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

La plantilla de la 0.6.0 incluye `src/crossvm-call.ts` (comprueba si el precompilado está activo y luego imprime el calldata) y un `contracts/CrossVmCaller.sol` que llama a `executeCrossVMCall(uint8,string,bytes)` y exige una respuesta no vacía del destino. No hace que una llamada funcione mientras el precompilado esté inactivo. Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para ver todas las plantillas del generador de andamiaje.
