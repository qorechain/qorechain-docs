---
slug: /rollups/multi-vm
title: Multi-VM (llamadas entre VMs)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (llamadas entre VMs)

El RDK incluye utilidades TypeScript que codifican una llamada desde un contrato EVM al **precompilado cross-VM** en `0x0000000000000000000000000000000000000901`, diseñado para enrutarla a un contrato QoreChain Native en el runtime **QoreChain Native** (Wasm), y una plantilla de andamiaje `multivm-rollup` que las conecta. Las herramientas cubren únicamente **EVM → QoreChain Native**; SVM es un runtime independiente y no forma parte del precompilado.

:::caution Todavía no se puede usar en las redes en producción
El precompilado cross-VM **no está activado en la mainnet**: la lista de precompilados estáticos activos del módulo EVM está vacía allí (comprobado el 4 de noviembre de 2026). En la testnet la lista contenía solo `0x…0A01`, `0x…0A02` y `0x…0C01` cuando se comprobó el 27 de octubre de 2026, y también `0x…0901` desde el 4 de noviembre; se leyó de nuevo el 7 de noviembre de 2026 y sigue listando los cuatro (véase la nota bajo [Cadena v3.2.5](#chain-v325)). El 7 de noviembre de 2026, después de que la testnet aplicara la cadena v3.2.7, se probó un `eth_call` de solo lectura a `0x…0901` en la testnet: un destino de la lista de permitidos llegó a su contrato y uno fuera de ella fue rechazado (consulta [Probado en la testnet](#tested-testnet)). En la mainnet `eth_getCode` para `0x…0901` devuelve `0x`, y una llamada a él termina con éxito con datos vacíos y no ejecuta nada (un `eth_call` a él devolvió datos vacíos el 4 de noviembre de 2026). La subida de contratos QoreChain Native también está cerrada en ambas redes, y el carril de transacciones SVM está deshabilitado en toda la red. En la mainnet, hasta que el precompilado se active y se reabran las subidas de QoreChain Native, no hay nada a lo que llamar; en la testnet el precompilado está activo con una lista de permitidos y se probó con `eth_call`. Esta página documenta las herramientas para que puedas prepararte; no construyas flujos de producción sobre ellas. Consulta [EVM Precompiles: Network status](/developer-guide/evm-precompiles#network-status).
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

`encodeCrossVmCalldata` de `@qorechain/rdk` 0.6.0 y posteriores (la actual es la 0.8.0) construye el mismo calldata por ti:

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

:::note La testnet cambió después del 30 de octubre de 2026
El 4 de noviembre de 2026 la lista de precompilados activos de la testnet (`active_static_precompiles` en los parámetros de EVM) también contenía `0x…0901`, y `GET /qorechain/crossvm/v1/params` en la testnet listaba tres destinos CosmWasm en `bridge_allowed_targets`. La mainnet no cambió ese día: lista activa vacía, lista de permitidos vacía, y una llamada a `0x…0901` mediante `eth_call` devolvió datos vacíos. La lista de la testnet se leyó de nuevo el 7 de noviembre de 2026 y sigue conteniendo `0x…0901`. Las afirmaciones de más abajo que dicen que el precompilado o la lista de permitidos están inactivos o vacíos en la testnet describen el periodo del 27 al 30 de octubre de 2026; el comportamiento actual de la testnet está en [Probado en la testnet](#tested-testnet).
:::

### Cadena v3.2.5: lista de permitidos, formato de respuesta y rechazos (ambas redes) {#chain-v325}

La cadena v3.2.5 cambia el comportamiento del puente. La mainnet la ejecuta desde el 29 de octubre de 2026 (propuesta de gobernanza 14, altura 3,906,833) y la testnet desde el 26 de octubre; la mainnet ejecuta ahora la v3.2.7 y la testnet la v3.2.8. Como el precompilado no está activo en la mainnet, el formato de respuesta descrito a continuación es el comportamiento de la versión y no se ha ejercitado allí; el formato de rechazo se vio en la testnet el 7 de noviembre de 2026 (consulta [Probado en la testnet](#tested-testnet)). Donde esta página dice que el precompilado devuelve la respuesta en bruto del destino, eso describe las versiones anteriores a la v3.2.5.

* **Una ruta de lista de permitidos.** `GET /qorechain/crossvm/v1/params` sirve los parámetros del puente, incluida la lista de permitidos de destinos. En la mainnet la lista de permitidos está vacía (comprobado el 4 de noviembre de 2026), así que todavía no se permite ningún destino; en la testnet estaba vacía el 30 de octubre (véase la nota anterior).
* **Un formato de respuesta fijo.** El precompilado devuelve `abi.encode(bytes)`, por lo que una respuesta siempre ocupa al menos 64 bytes y una respuesta vacía se distingue de una inexistente; decodifícala con `abi.decode(ret, (bytes))`.
* **Los rechazos llevan un motivo.** Cuando el puente rechaza una llamada, revierte con `Error(string)`, que un contrato puede leer y transmitir.
* **Activo en la testnet, no en la mainnet.** `0x...0901` no figura en la lista de precompilados activos de la mainnet; la lista de la testnet lo contiene (leída el 7 de noviembre de 2026), y el rechazo y el comportamiento de la lista de permitidos se probaron allí ese día. La mainnet mantiene desactivadas las llamadas entre VMs hasta una decisión de gobernanza aparte, también después de la actualización a la v3.2.7 (aplicada en la mainnet el 12 de noviembre de 2026; el mensaje de llamada entre VMs sigue en pausa por el disyuntor).

### Probado en la testnet {#tested-testnet}

La testnet ejecuta la cadena v3.2.8 desde el 12 de noviembre de 2026 (altura 9,929,500). El 7 de noviembre de 2026 se enviaron dos solicitudes `eth_call` de solo lectura a `0x…0901` con el calldata de `executeCrossVMCall(uint8,string,bytes)` (VM de destino `1`, payload `{}`):

| Destino | Resultado |
|---|---|
| Una dirección CosmWasm que no está en `bridge_allowed_targets` | Revirtió con `cross-VM bridge call refused: target cosmwasm:<address> is not allowlisted` |
| Un contrato CosmWasm de `bridge_allowed_targets` | La llamada llegó al contrato, que rechazó el payload vacío (`Error parsing into type cw20::msg::Cw20ExecuteMsg`), así que el puente la entregó; no se envió ningún mensaje que el contrato acepte |

Esto muestra la lista de permitidos y el motivo del rechazo. No muestra una llamada exitosa que cambie el estado, porque `eth_call` no cambia nada y el payload no era a propósito un mensaje válido. El precompilado toma tres argumentos; la forma de dos argumentos de la 0.5.0 y anteriores no llega a él. La mainnet no tiene este comportamiento: allí el precompilado está desactivado.

`@qorechain/rdk` 0.7.0 y posteriores incluyen utilidades para ello (comprobadas con codificaciones que produjo Solidity): `getCrossVmParams` (la lista de permitidos), `crossVmTargetReady` (precompilado activo, puente habilitado y destino en la lista de permitidos, con el motivo del bloqueo cuando no), `decodeCrossVmResult` (`abi.decode(ret, (bytes))`) y `decodeRevertReason` (`Error(string)`).

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

Como el precompilado está inactivo en la mainnet, un `.call` simple sobre él allí devuelve **éxito con datos vacíos y no hace nada**; el indicador `ok` no te dice que la llamada haya surtido efecto. La protección fiable dentro del contrato es un destino que siempre devuelva un acuse de recibo no vacío, con un `require(ret.length > 0)` después de la llamada, de modo que una respuesta vacía se trate como un fallo; la plantilla `multivm-rollup` lo hace (0.6.0 y posteriores).

## Generar el andamiaje de un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

La plantilla `multivm-rollup` incluye `src/crossvm-call.ts` (comprueba si el precompilado está activo y luego imprime el calldata) y un `contracts/CrossVmCaller.sol` que llama a `executeCrossVMCall(uint8,string,bytes)` y exige una respuesta no vacía del destino. Desde la 0.7.0 el contrato decodifica el resultado `abi.encode(bytes)`, exige el mínimo de 64 bytes que devuelve un precompilado activo y transmite el motivo de rechazo de la cadena. No hace que una llamada funcione mientras el precompilado esté inactivo. Consulta [Desplegar un Rollup](/rollups/deploying-a-rollup) para ver todas las plantillas del generador de andamiaje.
