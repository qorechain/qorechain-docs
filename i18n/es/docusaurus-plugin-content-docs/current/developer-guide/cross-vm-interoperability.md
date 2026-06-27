---
slug: /developer-guide/cross-vm-interoperability
title: Interoperabilidad entre VM
sidebar_label: Interoperabilidad entre VM
sidebar_position: 5
---

# Interoperabilidad entre VM

La **arquitectura de triple VM** de QoreChain (EVM, CosmWasm, SVM) permite que los contratos inteligentes de cualquier máquina virtual se comuniquen con contratos de cualquier otra VM. El módulo `x/crossvm` proporciona rutas de mensajería tanto síncronas como asíncronas.

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
| **Síncrona**     | EVM a CosmWasm  | Misma transacción | Precompilado en `0x0000...0901` |
| **Asíncrona**    | CosmWasm a EVM  | Siguiente bloque | `MsgCrossVMCall` vía EndBlocker |
| **Asíncrona**    | SVM a cualquier VM | Siguiente bloque | `MsgCrossVMCall` vía EndBlocker |
| **Asíncrona**    | Cualquier VM a SVM | Siguiente bloque | `MsgCrossVMCall` vía EndBlocker |

---

## Ruta síncrona (EVM a CosmWasm)

La ruta síncrona usa un **precompilado** de EVM en la dirección `0x0000000000000000000000000000000000000901`. Esto permite que los contratos de Solidity llamen a contratos CosmWasm y reciban una respuesta dentro de la misma transacción.

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

El precompilado ejecuta el contrato CosmWasm de inmediato y devuelve el resultado. Coste de gas: **50.000 base + coste de ejecución**.

---

## Ruta asíncrona

Todas las demás direcciones entre VM usan la cola de mensajes asíncrona. Los mensajes se envían en un bloque y los procesa el **EndBlocker** en el siguiente bloque.

### CLI

```bash
# CosmWasm to EVM
qorechaind tx crossvm call \
  --source-vm cosmwasm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '{"method":"transfer","params":["0xRecipient",100]}' \
  --from mykey \
  -y

# SVM to CosmWasm
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm cosmwasm \
  --target-contract qor1contractaddr... \
  --payload '{"execute":{"action":{}}}' \
  --from mykey \
  -y

# EVM to SVM (async)
qorechaind tx crossvm call \
  --source-vm evm \
  --target-vm svm \
  --target-contract <program-id-base58> \
  --payload '0a0b0c...' \
  --from mykey \
  -y
```

---

## Ciclo de vida del mensaje

Cada mensaje entre VM transita por un conjunto definido de estados:

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

# List messages by sender
qorechaind query crossvm messages-by-sender <address>
```

### JSON-RPC

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

**Atomicidad:** Las llamadas síncronas (EVM a CosmWasm vía precompilado) son atómicas — si cualquiera de los lados revierte, toda la transacción revierte. Las llamadas asíncronas **no son atómicas** entre bloques; diseña tus contratos para manejar con elegancia los estados `Failed` y `Timed Out`.

**Ordenación:** Los mensajes en la cola se procesan en orden FIFO dentro de cada pasada del EndBlocker. No hay ordenación garantizada entre distintas VM de origen.

**Codificación del payload:** El formato del payload depende de la VM de destino:

* **Destinos EVM:** llamadas de función codificadas en ABI
* **Destinos CosmWasm:** mensajes execute codificados en JSON
* **Destinos SVM:** datos de instrucción BPF codificados en hexadecimal

---

## Próximos pasos

* [Precompilados de EVM](/developer-guide/evm-precompiles) — El precompilado síncrono CrossVM y otros precompilados personalizados
* [Desarrollo en EVM](/developer-guide/evm-development) — Desarrollo en Solidity sobre QoreChain
* [Desarrollo en CosmWasm](/developer-guide/cosmwasm-development) — Desarrollo de contratos en Rust/Wasm
* [Desarrollo en SVM](/developer-guide/svm-development) — Despliegue de programas BPF
