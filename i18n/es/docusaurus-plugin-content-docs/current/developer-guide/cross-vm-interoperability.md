---
slug: /developer-guide/cross-vm-interoperability
title: Interoperabilidad entre VM
sidebar_label: Interoperabilidad entre VM
sidebar_position: 5
---

# Interoperabilidad entre VM

La **arquitectura de triple VM** de QoreChain (EVM, CosmWasm, SVM) está diseñada para que los contratos inteligentes de cualquier máquina virtual se comuniquen con contratos de cualquier otra VM. El módulo `x/crossvm` proporciona un mensaje de llamada con una ruta dentro de la misma transacción y una ruta en cola.

:::caution Qué funciona hoy
Las llamadas entre VM solo están disponibles en la medida en que lo esté su lane de destino:

* `MsgCrossVMCall` está **desactivado en mainnet** por el disyuntor (circuit breaker) (`qorechaind query circuit disabled-list`); en la testnet está habilitado.
* El **lane de SVM está deshabilitado** para transacciones en ambas redes, por lo que un tramo SVM no puede ejecutarse.
* **La carga e instanciación de CosmWasm requieren permisos** en ambas redes y la mainnet no tiene código de contrato almacenado, por lo que todavía no hay ningún contrato CosmWasm al que llamar.
* El **precompilado de EVM síncrono no está activo** (véase más abajo).

Las rutas REST del módulo (`/qorechain/crossvm/v1/...`) no las sirve la pasarela pública; lee los mensajes con la CLI o con un cliente de consultas gRPC/ABCI.
:::

:::note
Los endpoints siguientes apuntan por defecto a un nodo local. En mainnet, usa los endpoints RPC de **`qorechain-vladi`** (RPC de Cosmos **26657**, JSON-RPC de EVM **8545**); la testnet es **`qorechain-diana`**.
:::

---

## Resumen de la arquitectura

```
 EVM (Solidity)          CosmWasm (Rust/Wasm)         SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Ruta             | Dirección       | Temporización    | Mecanismo                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Síncrona**     | EVM a CosmWasm  | Misma transacción | Precompilado en `0x0000...0901` (aún no activo, véase más abajo) |
| **Mensaje, por defecto** | Cualquier VM a cualquier otra VM | Misma transacción | `MsgCrossVMCall`; la llamada se ejecuta de inmediato y un fallo revierte toda la transacción |
| **Mensaje, en cola**  | Cualquier VM a cualquier otra VM | Siguiente bloque (o posterior) | `MsgCrossVMCall` con `async` activado; el mensaje espera en la cola |

---

## Ruta síncrona (EVM a CosmWasm)

La ruta síncrona usa un **precompilado** de EVM en la dirección `0x0000000000000000000000000000000000000901`. Está diseñada para que los contratos de Solidity llamen a contratos CosmWasm y reciban una respuesta dentro de la misma transacción.

:::warning No está activo en mainnet ni en testnet
El precompilado del puente CrossVM **no está activo** en `qorechain-vladi` ni en `qorechain-diana`: una llamada a `0x…0901` tiene éxito y devuelve datos vacíos. No se activará en su forma actual; se está reconstruyendo para que un revert en el contrato que llama también deshaga el lado de CosmWasm, se rechacen las transferencias de valor, se rechace la reentrada de EVM a EVM y se aplique el disyuntor entre VM. El ejemplo siguiente muestra únicamente la forma prevista. Consulta [Precompilados de EVM: estado de la red](/developer-guide/evm-precompiles#network-status).
:::

### Ejemplo en Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICrossVM {
    function call(bytes calldata payload) external returns (bytes memory);
}

contract CrossVMCaller {
    ICrossVM constant CROSSVM = ICrossVM(0x0000000000000000000000000000000000000901);

    function callCosmWasmContract(
        string memory cosmwasmAddr,
        string memory executeMsg,
        uint256 funds
    ) external returns (bytes memory) {
        bytes memory payload = abi.encode(cosmwasmAddr, executeMsg, funds);
        return CROSSVM.call(payload);
    }
}
```

Una vez activo, el precompilado ejecuta el contrato CosmWasm de inmediato y devuelve el resultado. El nodo actual decodifica el calldata como `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`; la ABI puede cambiar con la reconstrucción. Coste de gas: **50.000 base + 4 por byte de entrada + coste de ejecución**.

---

## Ruta de mensajes (`MsgCrossVMCall`)

Las demás llamadas entre VM usan la transacción `MsgCrossVMCall`. La cadena determina el lane de origen a partir del remitente, por lo que el mensaje solo lleva la VM de destino, el contrato de destino, el payload y fondos opcionales. Por defecto, la llamada se ejecuta de inmediato dentro de la transacción, y toda la transacción se revierte si el destino falla. Con el indicador `async`, el mensaje se pone en cola y lo gestiona la pasada de la cola de fin de bloque del módulo en un bloque posterior (véase el ciclo de vida más abajo). Como se indicó antes, este mensaje está desactivado en mainnet.

### CLI

`tx crossvm call` recibe la VM de destino (`evm`, `cosmwasm` o `svm`) y el contrato de destino como argumentos posicionales, con el payload en hexadecimal:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Otros indicadores: `--funds <coins>` (solo para destinos CosmWasm) y `--async` para poner la llamada en cola en lugar de ejecutarla ahora. Firma y difunde `tx.json` con `tx pqc cosign` (consulta [Firma poscuántica](/developer-guide/post-quantum-signing)); el mínimo de comisión es de 0.1 uqor por gas.

:::caution Desactivado en mainnet, y la forma de la CLI necesita una corrección
`MsgCrossVMCall` está desactivado en mainnet por el disyuntor. En los binarios de la versión actual, `tx crossvm call` además construye un mensaje que no supera la validación del propio mensaje (deja vacía la VM de origen), por lo que el comando se documenta aquí solo como referencia.
:::

---

## Ciclo de vida del mensaje

Cada mensaje entre VM en cola transita por un conjunto definido de estados:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| Estado        | Descripción                                               |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Mensaje aceptado en la cola                               |
| **Pending**   | A la espera de ejecución en la siguiente pasada del EndBlocker |
| **Executed**  | Contrato de destino llamado con éxito; respuesta registrada |
| **Failed**    | La ejecución del contrato de destino revirtió; error registrado |
| **Timed Out** | El mensaje superó `queue_timeout_blocks` sin ejecutarse   |

---

## Parámetros

| Parámetro              | Valor        | Descripción                                    |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | Interruptor a nivel de módulo (el propio mensaje de llamada está desactivado por separado en mainnet) |
| `max_message_size`     | 65.536 bytes | Tamaño máximo de payload por mensaje           |
| `max_queue_size`       | 1.000        | Máximo de mensajes pendientes en la cola       |
| `queue_timeout_blocks` | 100          | Bloques antes de que un mensaje no procesado caduque |

---

## Eventos

El módulo `x/crossvm` emite los siguientes eventos:

| Evento             | Atributos                                                          | Descripción                           |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Nuevo mensaje entre VM enviado        |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Mensaje ejecutado (éxito o fallo)     |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Mensaje caducado sin ejecución        |

Suscríbete a los eventos vía WebSocket:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Consultar mensajes

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List all pending messages
qorechaind query crossvm pending

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **Aún no se sirve:** ninguna compilación de nodo publicada sirve el espacio de nombres JSON-RPC `qor_`, por lo que esta llamada devuelve hoy `-32601` (método no encontrado) en todos los endpoints públicos. Consulta [el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### Formato de respuesta

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## Consideraciones de diseño

**Atomicidad:** Las llamadas síncronas (EVM a CosmWasm vía precompilado) están diseñadas para ser atómicas, de modo que si cualquiera de los lados revierte, toda la transacción revierte. El precompilado actual aún no lo garantiza, y esa es una de las razones por las que no está activo (véase más arriba). Las llamadas asíncronas **no son atómicas** entre bloques; diseña tus contratos para manejar con elegancia los estados `Failed` y `Timed Out`.

**Ordenación:** Los mensajes en la cola se procesan en orden FIFO dentro de cada pasada del EndBlocker. No hay ordenación garantizada entre distintas VM de origen.

**Codificación del payload:** El formato del payload depende de la VM de destino:

* **Destinos EVM:** llamadas de función codificadas en ABI
* **Destinos CosmWasm:** mensajes execute codificados en JSON
* **Destinos SVM:** datos de instrucción BPF codificados en hexadecimal

---

## Próximos pasos

* [Precompilados de EVM](/developer-guide/evm-precompiles) — Estado del precompilado síncrono CrossVM y de los demás precompilados previstos
* [Desarrollo en EVM](/developer-guide/evm-development) — Desarrollo en Solidity sobre QoreChain
* [Desarrollo en CosmWasm](/developer-guide/cosmwasm-development) — Desarrollo de contratos en Rust/Wasm
* [Desarrollo en SVM](/developer-guide/svm-development) — Despliegue de programas BPF
