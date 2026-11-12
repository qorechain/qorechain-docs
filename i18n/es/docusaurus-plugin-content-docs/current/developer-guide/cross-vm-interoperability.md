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
* El **precompilado de EVM síncrono no está activo en la mainnet** y está **activo en la testnet** con una lista de permitidos de contratos QoreChain Native revisados (leído el 7 de noviembre de 2026; se ejecutó una llamada de solo lectura a través de él tras la actualización v3.2.7, véase más abajo). Una versión reforzada está en el binario desde v3.2.3. (El 27 de octubre de 2026 la gobernanza de la testnet activó otros tres precompilados, PQC Verify, PQC Key Status y PRISM Consensus Params, y el puente CrossVM se sumó a la lista de la testnet antes del 4 de noviembre; la mainnet no tiene ninguno activo.)

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
| **Síncrona**     | EVM a QoreChain Native  | Misma transacción | Precompilado en `0x0000...0901` (activo en la testnet, no en la mainnet; véase más abajo) |
| **Mensaje, por defecto** | Cualquier VM a cualquier otra VM | Misma transacción | `MsgCrossVMCall`; la llamada se ejecuta de inmediato y un fallo revierte toda la transacción |
| **Mensaje, en cola**  | Cualquier VM a cualquier otra VM | Siguiente bloque (o posterior) | `MsgCrossVMCall` con `async` activado; el mensaje espera en la cola |

---

## Ruta síncrona (EVM a QoreChain Native) {#synchronous-path-evm-to-qorechain-native}

La ruta síncrona usa un **precompilado** de EVM en la dirección `0x0000000000000000000000000000000000000901`. Está diseñada para que los contratos de Solidity llamen a contratos QoreChain Native y reciban una respuesta dentro de la misma transacción.

:::warning No activo en la mainnet; activo en la testnet con una lista de permitidos
El precompilado del puente CrossVM **no está activo** en `qorechain-vladi`: una llamada a `0x…0901` allí tiene éxito y devuelve datos vacíos. En `qorechain-diana` la lista `active_static_precompiles` incluye `0x…0901` (leída el 7 de noviembre de 2026); el 7 de noviembre de 2026, tras la actualización v3.2.7, se ejecutó un `eth_call` de solo lectura a través de él (resultados más abajo). El binario v3.2.3 incluye una versión reforzada (rechaza un `STATICCALL`, mide su llamada anidada con el gas del marco que llama y la registra en el diario para que un revert de EVM también deshaga el lado de QoreChain Native, solo alcanza destinos QoreChain Native de la lista de permitidos y respeta el disyuntor entre VM), pero solo se ejecuta donde una propuesta aprobada por gobernanza la ha añadido a la lista activa (hasta ahora la testnet, no la mainnet). En la mainnet el precompilado y las llamadas cross-VM siguen desactivados, incluso después de la actualización v3.2.7 del 12 de noviembre de 2026, hasta una decisión de gobernanza independiente. El ejemplo siguiente es el formato que decodifica el nodo; no puede ejecutarse en la mainnet hasta que el precompilado esté activo. En la testnet se puede llamar, dentro de la lista de permitidos (sección siguiente). Consulta [Precompilados de EVM: estado de la red](/developer-guide/evm-precompiles#network-status).
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

Este es el formato que decodifica el nodo; es el mismo que construye el codificador de `@qorechain/rdk`, y el contrato anterior coincide con el starter de [Multi-VM](/rollups/multi-vm). No se pueden adjuntar fondos a través del precompilado (la ruta de mensajes `MsgCrossVMCall` admite `--funds`). El ejemplo no puede hacer nada hoy en la mainnet, porque el precompilado no está activo allí. En la testnet funciona dentro de la lista de permitidos que se describe a continuación; el contrato de ejemplo en sí no se desplegó para esta página, la llamada siguiente se hizo directamente con `eth_call`.

Donde el precompilado está activo, ejecuta el contrato QoreChain Native de inmediato y devuelve el resultado. (El helper `encodeCrossVmCalldata` de `@qorechain/rdk`, disponible desde la 0.6.0 y en la actual 0.8.0, construye el calldata; véase [Multi-VM](/rollups/multi-vm).) Coste de gas: **50.000 base + 4 por byte de entrada + coste de ejecución**.

### Comportamiento en la testnet (lista de permitidos, comprobado el 7 de noviembre de 2026) {#testnet-allowlist}

En `qorechain-diana` (versión de nodo v3.2.8 desde el 12 de noviembre de 2026) el precompilado solo alcanza contratos QoreChain Native de la lista de permitidos del puente. `GET /qorechain/crossvm/v1/params` los lista en `bridge_allowed_targets` (tres entradas el 7 de noviembre de 2026, escritas `cosmwasm:qor1...`), junto a `enabled` `true`, `max_message_size` 65536, `max_queue_size` 1000 y `queue_timeout_blocks` 100. El 7 de noviembre de 2026 se ejecutaron dos solicitudes `eth_call` de solo lectura a `0x…0901` con `executeCrossVMCall(1, target, 0x7b7d)`:

* **Destino fuera de la lista de permitidos:** revierte con `cross-VM bridge call refused: target cosmwasm:qor1... is not allowlisted`.
* **Destino de la lista de permitidos:** la llamada alcanza el contrato (el nodo informa del error propio del contrato por el mensaje `{}` vacío: `Error parsing into type cw20::msg::Cw20ExecuteMsg`). Eso demuestra que la ruta funciona; para esta página no se envió ninguna transacción cross-VM que cambie el estado a través del precompilado.

En la mainnet el precompilado (`0x…0901`) y las llamadas cross-VM siguen **desactivados** (disyuntor) incluso después de la actualización v3.2.7 del 12 de noviembre de 2026, hasta una decisión de gobernanza independiente.

### Qué cambia v3.2.7 para las llamadas cross-VM {#v327}

Esto se aplica en la testnet desde el 6 de noviembre de 2026 y en la mainnet desde el 12 de noviembre de 2026 (la llamada cross-VM en sí sigue desactivada en la mainnet, así que allí solo importa si se activa):

* Una llamada que falla en la VM de destino ahora falla de forma limpia: es el fallo de esa llamada y la cola continúa con el mensaje siguiente.
* Los destinos mal formados se rechazan al enviar con el código 5 en el codespace `crossvm`.
* Una llamada cross-VM ya no puede tener como destino la dirección de un precompilado de EVM.

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

### Llamadas asíncronas a CosmWasm (v3.2.8) {#async-calls}

Desde la versión v3.2.8 (solo testnet hasta una actualización posterior de mainnet) una llamada asíncrona a CosmWasm se paga por adelantado y se encola con límites:

| Campo de `MsgCrossVMCall` | Significado |
| ---------------------- | ------- |
| `async_gas_limit` (8)  | Unidades de gas de contrato que reservas para la llamada en cola (500,000 por defecto) |
| `async_max_factor` (9) | El factor de congestión más alto que aceptas para ella (4x por defecto); la llamada se rechaza si el factor en vigor es mayor |

- **Depósito en garantía.** El remitente paga por adelantado unidades de gas x factor x precio del gas en una cuenta de escrow. Con los valores por defecto son 500,000 x 4 x 0.1 uqor, unos 0.2 QOR. Lo que la llamada no usa se reembolsa cuando se ejecuta.
- **Tarifa de espacio en la cola.** Encolar una llamada también paga una pequeña tarifa de espacio.
- **Como máximo 100 llamadas pendientes por remitente.** Una llamada adicional se rechaza hasta que una termine o caduque.
- **Las llamadas fallidas se cobran.** Una llamada que falla paga igualmente el trabajo realizado.
- **Llamadas pesadas:** aumenta `async_gas_limit` y `async_max_factor` para contratos que cargan código grande; un contrato del tamaño de cw721 no cabe en los valores por defecto en su primera llamada en un bloque.
- **Desde código.** El SDK 0.14.0 admite ambos campos en cada lenguaje (TypeScript: `asyncGasLimit` y `asyncMaxFactor`, con `validateCrossVmAsyncGas` para comprobarlos; `asyncMaxFactor` está en millonésimas, así que 1,000,000 es 1x). También devuelve todas las páginas de la consulta paginada de pendientes. Esto no se ha ejecutado en la testnet.

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

# List pending messages (from v3.2.8 one page of at most 100; follow the next key for more)
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

**Atomicidad:** Las llamadas síncronas (EVM a QoreChain Native vía precompilado) están diseñadas para ser atómicas, de modo que si cualquiera de los lados revierte, toda la transacción revierte. El precompilado reforzado registra la llamada anidada en el diario, de modo que una reversión en el contrato que llama también deshace el lado de QoreChain Native; está activo solo en la testnet. Las llamadas asíncronas **no son atómicas** entre bloques; diseña tus contratos para manejar con elegancia los estados `Failed` y `Timed Out`.

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
