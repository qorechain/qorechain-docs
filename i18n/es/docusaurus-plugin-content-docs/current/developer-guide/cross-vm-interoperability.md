---
slug: /developer-guide/cross-vm-interoperability
title: Interoperabilidad entre VM
sidebar_label: Interoperabilidad entre VM
sidebar_position: 5
---

# Interoperabilidad entre VM

La **arquitectura de triple VM** de QoreChain (EVM, QoreChain Native, SVM) está diseñada para que los contratos inteligentes de cualquier máquina virtual se comuniquen con contratos de cualquier otra VM. El módulo `x/crossvm` proporciona un mensaje de llamada con una ruta dentro de la misma transacción y una ruta en cola.

:::caution Qué funciona hoy
Las llamadas entre VM solo están disponibles en la medida en que lo esté su lane de destino:

* `MsgCrossVMCall` está **desactivado en mainnet** por el disyuntor (circuit breaker) (`qorechaind query circuit disabled-list`); en la testnet está habilitado.
* El **lane de SVM está deshabilitado** para transacciones en ambas redes, por lo que un tramo SVM no puede ejecutarse.
* **La carga de QoreChain Native requiere permisos** en ambas redes y **la instanciación requiere permisos en la mainnet**, que no tiene código de contrato almacenado, por lo que todavía no hay ningún contrato QoreChain Native al que llamar en la mainnet. En la testnet, la gobernanza almacenó algunos contratos revisados que cualquier cuenta puede instanciar (véase [Desarrollo con QoreChain Native](/developer-guide/cosmwasm-development)), por lo que allí puede existir un destino QoreChain Native.
* El **precompilado de EVM síncrono no está activo** (véase más abajo). Una versión reforzada está en el binario desde v3.2.3, pero el precompilado CrossVM no está activado en ninguna de las dos redes. (El 27 de octubre de 2026 la gobernanza de la testnet activó otros tres precompilados, PQC Verify, PQC Key Status y PRISM Consensus Params; la mainnet no tiene ninguno activo. La v3.2.4 no cambia qué precompilados están activos.)

En la mainnet, las rutas REST del módulo (`/qorechain/crossvm/v1/...`) no las sirve la pasarela pública (`501`); lee los mensajes con la CLI o con un cliente de consultas gRPC/ABCI.
:::

:::note
Los endpoints siguientes apuntan por defecto a un nodo local. En mainnet, usa los endpoints RPC de **`qorechain-vladi`** (RPC de Cosmos **26657**, JSON-RPC de EVM **8545**); la testnet es **`qorechain-diana`**.
:::

---

## Resumen de la arquitectura

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Ruta             | Dirección       | Temporización    | Mecanismo                       |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Síncrona**     | EVM a QoreChain Native  | Misma transacción | Precompilado en `0x0000...0901` (aún no activo, véase más abajo) |
| **Mensaje, por defecto** | Cualquier VM a cualquier otra VM | Misma transacción | `MsgCrossVMCall`; la llamada se ejecuta de inmediato y un fallo revierte toda la transacción |
| **Mensaje, en cola**  | Cualquier VM a cualquier otra VM | Siguiente bloque (o posterior) | `MsgCrossVMCall` con `async` activado; el mensaje espera en la cola |

---

## Ruta síncrona (EVM a QoreChain Native)

La ruta síncrona usa un **precompilado** de EVM en la dirección `0x0000000000000000000000000000000000000901`. Está diseñada para que los contratos de Solidity llamen a contratos QoreChain Native y reciban una respuesta dentro de la misma transacción.

:::warning No está activo en mainnet ni en testnet
El precompilado del puente CrossVM **no está activo** en `qorechain-vladi` ni en `qorechain-diana`: una llamada a `0x…0901` tiene éxito y devuelve datos vacíos. El binario v3.2.3 incluye una versión reforzada (rechaza un `STATICCALL`, mide su llamada anidada con el gas del marco que llama y la registra en el diario para que un revert de EVM también deshaga el lado de QoreChain Native, solo alcanza destinos QoreChain Native de la lista de permitidos y respeta el disyuntor entre VM), pero solo se ejecuta cuando una actualización aprobada por gobernanza la añade a la lista activa. El ejemplo siguiente es el formato que decodifica el nodo, pero no puede ejecutarse hasta que el precompilado esté activo. Consulta [Precompilados de EVM: estado de la red](/developer-guide/evm-precompiles#network-status).
:::

### Ejemplo en Solidity

El nodo decodifica la entrada del precompilado como un selector de 4 bytes seguido de los argumentos codificados en ABI de `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector `0x3c11078c`). `targetVM` es `1` para un contrato QoreChain Native (QoreChain Native es el runtime CosmWasm; `0` es la EVM, que el puente reforzado rechaza como destino). `targetContract` es la dirección bech32 del contrato como cadena de texto, y `payload` es el mensaje de ejecución del contrato como bytes JSON UTF-8. El precompilado devuelve los bytes de respuesta en bruto del destino.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

Este es el formato que decodifica el nodo; es el mismo que construye el codificador de `@qorechain/rdk`, y el contrato anterior coincide con el starter de [Multi-VM](/rollups/multi-vm). No se pueden adjuntar fondos a través del precompilado (la ruta de mensajes `MsgCrossVMCall` admite `--funds`). El ejemplo no puede hacer nada hoy en ninguna de las dos redes, porque el precompilado no está activo (véase la advertencia anterior); la ABI aún puede cambiar antes de la activación.

Una vez activo, el precompilado ejecuta el contrato QoreChain Native de inmediato y devuelve el resultado. (El helper `encodeCrossVmCalldata` de `@qorechain/rdk`, disponible desde la 0.6.0 y en la actual 0.6.2, construye el calldata; véase [Multi-VM](/rollups/multi-vm).) Coste de gas: **50.000 base + 4 por byte de entrada + coste de ejecución**.

---

## Ruta de mensajes (`MsgCrossVMCall`)

Las demás llamadas entre VM usan la transacción `MsgCrossVMCall`. La cadena determina el lane de origen a partir del remitente, por lo que el mensaje solo lleva la VM de destino, el contrato de destino, el payload y fondos opcionales. Por defecto, la llamada se ejecuta de inmediato dentro de la transacción, y toda la transacción se revierte si el destino falla. Con el indicador `async`, el mensaje se pone en cola y lo gestiona la pasada de la cola de fin de bloque del módulo en un bloque posterior (véase el ciclo de vida más abajo). Como se indicó antes, este mensaje está desactivado en mainnet.

### CLI

`tx crossvm call` recibe la VM de destino (`evm`, `cosmwasm` o `svm`) y el contrato de destino como argumentos posicionales, con el payload en hexadecimal. La CLI no pregunta por la VM de origen: la cadena deduce el lane del llamante a partir del estado e ignora el campo declarado (la CLI rellena un valor provisional para que el mensaje supere su propia validación):

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Otros indicadores: `--funds <coins>` (solo para destinos QoreChain Native) y `--async` para poner la llamada en cola en lugar de ejecutarla ahora. Firma y difunde `tx.json` con `tx pqc cosign` (consulta [Firma poscuántica](/developer-guide/post-quantum-signing)); el mínimo de comisión es de 0.1 uqor por gas. Una llamada hacia el propio lane del llamante se rechaza (desde v3.2.3).

:::caution Desactivado en mainnet
`MsgCrossVMCall` está desactivado en mainnet por el disyuntor, por lo que el comando hoy no puede tener éxito allí. (Los binarios publicados antes de v3.2.3 además construían un mensaje que no superaba su propia validación porque la VM de origen estaba vacía; el binario v3.2.3 lo corrige.) En la testnet el mensaje está habilitado, pero el lane de SVM está deshabilitado, por lo que no se puede alcanzar un destino SVM; sí se puede alcanzar un destino EVM y, una vez instanciado allí un contrato, un destino QoreChain Native.
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

Desde v3.2.3, una llamada en cola que falla se revierte por completo: solo permanece su registro `Failed`, y los fondos adjuntos a una llamada QoreChain Native fallida ya no se mueven al contrato. Mientras el módulo esté desactivado, o `MsgCrossVMCall` esté desactivado por el disyuntor, la cola **no se ejecuta**: los mensajes en cola permanecen pendientes y caducan al llegar a su tiempo límite, a menos que se levante antes el interruptor.

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

**Atomicidad:** Las llamadas síncronas (EVM a QoreChain Native vía precompilado) están diseñadas para ser atómicas, de modo que si cualquiera de los lados revierte, toda la transacción revierte. El precompilado actual aún no lo garantiza, y esa es una de las razones por las que no está activo (véase más arriba). Las llamadas asíncronas **no son atómicas** entre bloques; diseña tus contratos para manejar con elegancia los estados `Failed` y `Timed Out`.

**Ordenación:** Los mensajes en la cola se procesan en orden FIFO dentro de cada pasada del EndBlocker. No hay ordenación garantizada entre distintas VM de origen.

**Codificación del payload:** El formato del payload depende de la VM de destino:

* **Destinos EVM:** llamadas de función codificadas en ABI
* **Destinos QoreChain Native:** mensajes execute codificados en JSON
* **Destinos SVM:** datos de instrucción BPF codificados en hexadecimal

---

## Próximos pasos

* [Precompilados de EVM](/developer-guide/evm-precompiles) — Estado del precompilado síncrono CrossVM y de los demás precompilados previstos
* [Desarrollo en EVM](/developer-guide/evm-development) — Desarrollo en Solidity sobre QoreChain
* [Desarrollo en QoreChain Native](/developer-guide/cosmwasm-development) — Desarrollo de contratos en Rust/Wasm
* [Desarrollo en SVM](/developer-guide/svm-development) — Despliegue de programas BPF
