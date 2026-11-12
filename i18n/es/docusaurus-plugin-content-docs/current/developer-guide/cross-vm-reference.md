---
slug: /developer-guide/cross-vm-reference
title: Referencia de las llamadas entre VM (v3.2.8)
sidebar_label: Referencia entre VM
sidebar_position: 9
---

# Referencia de las llamadas entre VM (v3.2.8)

Una llamada entre VM permite que el código de una máquina virtual ejecute un contrato de otra: una cuenta o un contrato QoreChain Native que llama a un contrato EVM, una cuenta que llama a un contrato QoreChain Native (CosmWasm), un contrato de Solidity que llama a un contrato QoreChain Native, etcétera. Hay dos formas de hacerla. Una llamada **síncrona** se ejecuta dentro de tu propia transacción y devuelve la respuesta de inmediato. Una llamada **asíncrona** se pone en una cola y se ejecuta en un bloque posterior.

Esta página es la referencia de campos, costes y límites de la versión v3.2.8, con un ejemplo práctico para cada dirección. Los conceptos, el ciclo de vida y el comportamiento anterior están en [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability); el recorrido con el SDK está en la [guía de Cross-VM](/sdk/guides/cross-vm).

:::note Dónde se ejecuta v3.2.8
La testnet **`qorechain-diana`** ejecuta **v3.2.8** desde el 12 de noviembre de 2026. La mainnet **`qorechain-vladi`** todavía no la ha aplicado, y en la mainnet `MsgCrossVMCall` está desactivado. Todo lo marcado como "v3.2.8" a continuación es, por ahora, comportamiento de la testnet.
:::

:::caution ¿Está disponible ahora el mensaje de llamada?
En la testnet, `MsgCrossVMCall` quedó en pausa con la actualización. La propuesta de gobernanza 37 se aprobó y levantó la pausa, así que la llamada está abierta en la testnet (comprobado el 12 de noviembre de 2026: la lista del disyuntor (circuit breaker) solo contiene `/cosmwasm.wasm.v1.MsgStoreCode`). En la mainnet sigue desactivada. Dos cosas indican si la llamada está disponible en un momento dado: los parámetros del módulo (`enabled`) y la lista del disyuntor. Comprueba ambas antes de construir nada sobre ella:

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

La ruta de la lista se escribe `disable_list` por REST (la grafía `disabled_list` responde `501`). El equivalente de línea de comandos en un nodo es `qorechaind query circuit disabled-list`. Mientras la llamada está en pausa, una transacción que la lleve es rechazada, y las llamadas en cola siguen pendientes hasta que caducan, salvo que antes se levante la pausa. Antes de que se aprobara la propuesta 37, la lista contenía `/qorechain.crossvm.v1.MsgCrossVMCall`; en la testnet ya no lo contiene. Consulta [Probado en la testnet](#tested) para ver qué se envió.
:::

## Por qué importa {#why}

- **El coste es predecible.** Una llamada en cola hacia QoreChain Native muestra su precio por adelantado: eliges cuánto trabajo de contrato puede usar y el factor de congestión más alto que aceptas, el dinero se retiene en custodia (escrow) y lo que la llamada no usa se te devuelve.
- **Una cuenta no puede desplazar a las demás.** Un remitente puede tener como máximo 100 llamadas en cola a la vez, así que la cola compartida sigue siendo utilizable.
- **Una llamada fallida nunca es gratis.** Una llamada que falla paga igualmente el trabajo que hizo, en todas las direcciones, así que capturar un fallo y reintentar con el mismo gas no funciona.
- **El lado EVM permanece dentro de tu ventana.** Una llamada al EVM que no firmaste tú mismo, y el puente EVM en `0x0901`, solo son admitidos por una [ventana de autorización EVM](/developer-guide/evm-window-reference) abierta.

## Llamadas síncronas y asíncronas {#sync-async}

| | Síncrona (por defecto) | Asíncrona (`async = true`) |
| --- | --- | --- |
| Cuándo se ejecuta | Dentro de tu transacción | Al final de un bloque posterior, desde la cola |
| Gas | El gas propio de tu transacción | Un presupuesto prepagado fijo (véase [Coste](#cost)) |
| Respuesta | Se devuelve en la respuesta de la transacción, campo `data` | No se devuelve; lee el mensaje terminado por su id |
| Si el destino falla | Toda la transacción se deshace | Solo esa llamada se registra como `failed`; tu transacción se mantiene |
| Fondos | Se pueden adjuntar `funds` para un destino QoreChain Native | Igual; una llamada asíncrona con fondos hacia un carril que no puede llevarlos se rechaza al enviarla |
| Ideal para | Todo lo que necesite el resultado ya | Trabajo de "lanzar y olvidar", y llamadas cuyo gas quieras limitar |

Un mensaje en cola pasa por `pending` y luego por `executed`, `failed` o `timed_out`. Caduca tras `queue_timeout_blocks` (100 en la testnet). La cola se ejecuta empezando por la más antigua, y la pasada de fin de bloque ejecuta como máximo 50 llamadas por bloque.

### Quién llama a quién, síncrono o asíncrono {#who-calls-whom}

Cuál de los dos modos puede usar una llamada depende de quién la despacha.

| Quien llama | Destino | Síncrona | Asíncrona |
| --- | --- | --- | --- |
| Cuenta (firma la transacción) | EVM, QoreChain Native | Sí (por defecto) | Sí |
| Contrato QoreChain Native, que despacha `MsgCrossVMCall` como sí mismo | EVM | Sí (`async` en false, el valor por defecto) | Sí |
| Contrato QoreChain Native, que despacha `MsgCrossVMCall` como sí mismo | QoreChain Native | Rechazada (tu propio carril) | Rechazada (tu propio carril) |
| Contrato al que llamó el puente EVM en `0x0901` (por debajo del puente) | SVM | Sí | No se usa |
| Contrato al que llamó el puente EVM en `0x0901` (por debajo del puente) | EVM | No se usa | Sí |

Un contrato QoreChain Native que despacha `MsgCrossVMCall` como sí mismo puede llamar al EVM de cualquiera de las dos formas. La síncrona (`async` en false, el valor por defecto) se ejecuta con el gas de la propia transacción, la respuesta llega en `MsgCrossVMCallResponse.data` y un fallo revierte toda la transacción. La asíncrona pone la llamada en cola. Ambas se ejecutaron antes en la testnet: la síncrona en la altura 9,795,779 y la asíncrona en la altura 9,795,783.

La expresión "síncrono hacia la SVM, asíncrono hacia el EVM" se aplica solo por debajo del puente `0x0901`: para un contrato al que llamó el puente EVM, lo que ese contrato despache puede ir de forma síncrona a la SVM y de forma asíncrona al EVM. No es una regla para un contrato que actúa como sí mismo, que puede usar cualquiera de los dos modos hacia el EVM.

## Campos de MsgCrossVMCall {#fields}

URL de tipo `/qorechain.crossvm.v1.MsgCrossVMCall`.

| Campo | Número | Significado |
| ----- | ------ | ----------- |
| `sender` | 1 | Tu dirección `qor1...`. Firma el mensaje. |
| `source_vm` | 2 | Ignorado por la cadena. La cadena determina de dónde viene la llamada. Se sigue enviando para que los nodos más antiguos acepten el mensaje. |
| `target_vm` | 3 | `evm`, `cosmwasm` o `svm`. Una llamada a tu propio carril se rechaza. El carril SVM está abierto en la testnet desde la propuesta 37 y desactivado en la mainnet; véase [Carril SVM](/developer-guide/svm-lane-v328). No se ejecutó ninguna llamada a la SVM para esta página. |
| `target_contract` | 4 | Una dirección EVM (`0x` y 40 dígitos hexadecimales, que no sea una dirección de precompilado) o una dirección de contrato `qor1...`. |
| `payload` | 5 | Los datos de la llamada: codificados en ABI para el EVM, el mensaje de ejecución JSON como UTF-8 para QoreChain Native. Como máximo `max_message_size` bytes (65,536). |
| `funds` | 6 | Monedas que adjuntar (solo destinos QoreChain Native). |
| `async` | 7 | `true` pone la llamada en cola; `false` (por defecto) la ejecuta ahora. |
| `async_gas_limit` | 8 | v3.2.8, solo asíncrona hacia QoreChain Native: las unidades de gas de contrato con las que se ejecuta la llamada en cola. `0` o sin definir significa 500,000. Se permite desde 250,000 hasta lo que la cola puede ejecutar en un bloque (1,875,000 con el presupuesto por defecto). |
| `async_max_factor` | 9 | v3.2.8, solo asíncrona hacia QoreChain Native: el factor de congestión más alto que pagarás, en **millonésimas**: `1000000` es 1x y `4000000` es 4x. El rango válido es de 1,000,000 a 100,000,000 (de 1x a 100x); un múltiplo simple como `4` se rechaza con el codespace `crossvm` código 2 antes de ejecutar nada. `0` o sin definir significa cuatro veces el factor en el momento del envío (4,000,000 millonésimas cuando el factor es 1x), con el máximo de la cadena como tope. Un valor inferior al factor vigente se rechaza al enviarla. |

En la línea de comandos, los dos campos nuevos son `--async-gas-limit` (un número entero) y `--async-max-factor` (un decimal como `2.5`, que el comando convierte en millonésimas por ti). En un mensaje en bruto, en el SDK y en las formas REST o JSON, el valor siempre está en millonésimas: 2.5x es `2500000`. El SDK exporta `CROSSVM_ASYNC_FACTOR_ONE` (1,000,000) para convertir un múltiplo en millonésimas, y `validateCrossVmAsyncGas` para comprobar los dos valores antes de enviar.

## Coste, escrow y reembolsos {#cost}

Para una **llamada asíncrona hacia QoreChain Native** (v3.2.8):

1. **Escrow.** El prepago es unidades por factor por el precio del gas, y se retiene, no se gasta. Con los valores por defecto son 500,000 unidades x 4 (4,000,000 en millonésimas) x 0.1 uqor = 200,000 uqor, es decir, **0.2 QOR**. Pasa de tu saldo a la cuenta `crossvm_async_escrow`. Necesitas esa cantidad de uqor disponible: las monedas bloqueadas por vesting, las concesiones de comisiones (fee grants) y las comisiones pagadas en otros tokens no pueden financiarlo, y una llamada así se rechaza.
2. **Comisión de plaza en la cola.** Toda llamada asíncrona paga además una comisión de plaza como gas al enviarla: 500,000 de gas con la cola vacía, que sube según se llena la cola hasta 2,000,000 de gas con la cola llena. Al precio de 0.1 uqor por gas son de 0.05 QOR a 0.2 QOR.
3. **Liquidación.** Cuando la llamada termina, el gas que usó, al factor vigente entonces, se paga del escrow como comisión, y el resto se te devuelve. Una llamada que falla paga lo que usó. Una llamada que caduca, o que nunca se ejecuta, recupera todo su escrow, y su comisión de plaza es la comisión de procesamiento. El evento `crossvm_escrow_settled` lleva la comisión y el reembolso.
4. **Esperar al factor.** La llamada se ejecuta mientras el factor de congestión esté en o por debajo de tu `async_max_factor`. Si el factor es más alto, espera, y caduca si se mantiene alto. Con el valor por defecto (cuatro veces el factor en el momento del envío, 4,000,000 en millonésimas cuando el factor es 1x), el factor debe más que cuadruplicarse antes de que la llamada espere.
5. **Límites de tamaño.** El prepago no puede superar los 50,000,000 de gas. Por encima de eso la llamada se rechaza al enviarla: reintenta más tarde o reduce `async_gas_limit`.

Para una **llamada asíncrona hacia el EVM**, el presupuesto prepagado es de 1,000,000 de gas, cobrado al enviarla. Para una llamada **síncrona**, el coste es el gas de la propia transacción. Los contratos QoreChain Native pesados que cargan código grande necesitan un `async_gas_limit` y un `async_max_factor` más altos que los valores por defecto en su primera llamada dentro de un bloque.

### Las llamadas fallidas se cobran {#failed-charged}

Una llamada entre VM que falla paga igualmente el trabajo que hizo. Una llamada EVM que revierte o se queda sin gas usa del llamador el gas EVM que consumió, y una llamada QoreChain Native hecha a través del puente `0x0901` que falla usa del marco EVM llamador el gas que gastó el contrato. Un contrato que quiera sobrevivir a un destino caro que falla debe fijar un límite de gas en la subllamada en lugar de reintentar con el mismo gas restante.

## La cola de pendientes {#pending}

- **Como máximo 100 llamadas pendientes por remitente** (`max_pending_per_sender`). Una llamada asíncrona adicional se rechaza con `ErrQueueFull` (codespace `crossvm`, código 4) hasta que una de las tuyas se haya ejecutado o haya caducado. Las llamadas síncronas no se ven afectadas.
- **La cola completa admite como máximo `max_queue_size`** llamadas (1,000).
- **La lista de pendientes está paginada.** Cada página contiene como máximo 100 mensajes, y cada payload de la lista se recorta a sus primeros **1,024 bytes** (`payload_hex`). Para leer un payload completo, consulta el mensaje por su id.
- **El límite de página se ajusta.** Un `pagination.limit` de 0 o superior a 100 se ajusta silenciosamente a 100. Una petición con `limit=101` responde `200` con como máximo 100 elementos, no con un error. Para leer más, pasa el `next_key` de la respuesta y sigue hasta que quede vacío.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

Comprobado en la testnet el 12 de noviembre de 2026: la ruta de pendientes respondió `200` con `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}` (cola vacía), y la ruta del mensaje respondió `200` con `{"message":null,"found":false}` para un id que no existe. Las mismas lecturas con la CLI de nodo para Linux:

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note CLI de nodo
`qorechaind` es la CLI de nodo para Linux. No hay un binario empaquetado para macOS. Las llamadas REST funcionan desde cualquier máquina.
:::

## Parámetros del módulo {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Respondió `200` el 12 de noviembre de 2026 con estos campos:

| Campo | Valor leído | Significado |
| ----- | ----------- | ----------- |
| `enabled` | `true` | Interruptor del módulo. El mensaje de llamada tiene su propia entrada en la lista del disyuntor. |
| `max_message_size` | `65536` | Payload más grande, en bytes. |
| `max_queue_size` | `1000` | Máximo de llamadas en cola a la vez. |
| `queue_timeout_blocks` | `100` | Bloques antes de que una llamada sin ejecutar caduque. |
| `bridge_allowed_targets` | tres entradas `cosmwasm:qor1...` | Los contratos QoreChain Native a los que puede llamar el puente `0x0901`. Vacío mantiene el puente cerrado. |
| `bridge_target_pins` | una entrada por destino: `target`, `code_id`, `history_len` | El código que cada destino permitido debe seguir ejecutando para que el puente lo llame. |
| `max_pending_per_sender` | `100` | Llamadas en cola que puede tener un remitente. |
| `max_cosmos_tx_gas` | `"50000000"` | Máximo de gas que una transacción Native puede declarar. |
| `record_retention_blocks` | `"100000"` | Cuánto tiempo se conserva el registro de una llamada en cola terminada. |
| `max_block_wasm_gas` | `"3000000"` | Ejecución QoreChain Native que puede usar un bloque. |
| `max_tx_wasm_share_bps` | `5000` | Parte de ese presupuesto que puede usar una transacción. |
| `max_block_level_wasm_gas` | `"10000000"` | Presupuesto para el trabajo de contrato hecho fuera de las transacciones. |
| `queue_wasm_reserve_bps` | `2500` | Parte del presupuesto del bloque reservada para la cola. |
| `wasm_congestion_max_factor` | `20` | Lo más alto que puede llegar el factor de congestión. |
| `wasm_congestion_target_bps` | `5000` | Parte de uso por encima de la cual sube el factor. |
| `wasm_congestion_factor_micro` | `"1000000"` | El factor vigente ahora, en millonésimas (`1000000` es 1x). |
| `max_block_upload_bps` | `5000` | Parte del presupuesto que pueden usar las subidas de código. |
| `max_queue_timeouts_per_block` | `100` | Llamadas que caducan por bloque. |

Usa `wasm_congestion_factor_micro` para ver cuánto prepagará ahora una llamada en cola: unidades x factor x 0.1 uqor.

## Ejemplos por dirección {#examples}

Todos los ejemplos firman con la clave poscuántica de la cuenta, como hace toda transacción Native; véase [Firma poscuántica](/developer-guide/post-quantum-signing). Para esta página solo se enviaron los ejemplos de cuenta nativa a contrato QoreChain Native (véase [Probado en la testnet](#tested)); los ejemplos EVM no se ejecutaron y están marcados como UNTESTED (sin probar) donde aparecen.

### Cuenta nativa a contrato EVM {#native-to-evm}

**UNTESTED:** esta dirección no se ejecutó para esta página.

El destino es un contrato EVM; el payload son datos de llamada codificados en ABI. La llamada se ejecuta como tu propia dirección `0x`, así que el lado EVM te ve como `msg.sender`. Línea de comandos (CLI de nodo para Linux), construye y luego añade la firma poscuántica:

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

TypeScript con el SDK publicado (0.13.0). El ayudante codifica la llamada en ABI con viem:

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

Python, Go, Rust y Java reciben el payload como bytes en bruto para el EVM (la codificación ABI de alto nivel es solo de TypeScript). Python:

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go:

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust:

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java:

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

Si el remitente no es la cuenta que firmó la transacción, por ejemplo un beneficiario de authz, el lado EVM se ejecuta bajo la ventana del otorgante; véase [Authz y ventanas](#authz).

### Cuenta nativa a contrato QoreChain Native {#native-to-wasm}

El payload es el mensaje de ejecución JSON del contrato. Una llamada síncrona devuelve la respuesta del contrato en `data`:

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

En cola, con una asignación de gas explícita y un tope de factor (v3.2.8). El escrow es 800,000 x 2.5 x 0.1 uqor = 200,000 uqor (0.2 QOR) si el factor es 1 (el comando recibe `2.5` y envía 2,500,000 millonésimas):

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

TypeScript con el SDK 0.13.0 (síncrona, y en cola con la asignación por defecto):

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor (4,000,000 millionths)
});

// SDK 0.14.0: explicit allowance. The factor is in millionths: 6x is 6_000_000.
const tuned = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true,
  asyncGasLimit: 800_000,
  asyncMaxFactor: 6_000_000,
});
```

Python (`async_=True`), Go (`Async: true`), Rust (`.queue(true)`) y Java (`o.async = true`) ponen en cola de la misma forma:

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note Soporte del SDK para los dos campos nuevos
El SDK 0.13.0 no tiene opción para `async_gas_limit` ni `async_max_factor`, así que sus llamadas en cola usan los valores por defecto. El SDK 0.14.0 añade `asyncGasLimit` y `asyncMaxFactor` a la llamada entre VM, exporta `CROSSVM_ASYNC_FACTOR_ONE` (1,000,000) y `validateCrossVmAsyncGas`, y su ayudante `buildCall` usa `evm` como `sourceVm` por defecto para una cuenta nativa. La cadena ignora `source_vm` y registró el mensaje con `source_vm` native.
:::

### Contrato EVM a contrato QoreChain Native a través de 0x0901 {#evm-to-wasm}

**UNTESTED:** esta dirección no se ejecutó para esta página.

Un contrato de Solidity llama al precompilado del puente en `0x0000000000000000000000000000000000000901`. La llamada se ejecuta dentro de la transacción EVM, con la cuenta o el contrato que llama (como su dirección `qor1`) como remitente QoreChain Native, y un revert en cualquier punto deshace ambos lados.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

Reglas del puente:

- Solo `CALL` simple, sin valor, selector `0x3c11078c`. `STATICCALL`, `DELEGATECALL` y la VM de destino `0` o `2` revierten.
- El destino debe estar en `bridge_allowed_targets` (y, desde v3.2.8, seguir ejecutando el código al que está fijado). Lee ambos con la ruta de parámetros de arriba.
- **El llamador necesita una ventana que liste `0x0901`.** Toda cuenta que envíe una transacción al puente debe tener abierta una [ventana de autorización EVM](/developer-guide/evm-window-reference) cuyos `allowed_targets` incluyan `0x0000000000000000000000000000000000000901` (y el contrato que lo llama, si llamas a través de uno). Abre una así, con un límite que se ajuste a tu sesión:

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- Una llamada fallida revierte con un motivo `Error(string)` y se cobra por el gas que usó el contrato.

El ayudante `encodeCrossVmCalldata({ contract, msg })` de `@qorechain/rdk` construye los mismos datos de llamada en TypeScript (véase [Multi-VM](/rollups/multi-vm)). Con el SDK publicado, la dirección del precompilado es `PRECOMPILE_ADDRESSES.crossVmBridge` de `@qorechain/evm`.

### Contrato QoreChain Native a contrato EVM {#wasm-to-evm}

**UNTESTED** por el autor de la documentación. El equipo de la cadena informa de que ambos modos se ejecutaron en la testnet antes de v3.2.8.

Un contrato QoreChain Native hace la llamada despachando un `MsgCrossVMCall` como mensaje de la cadena, con él mismo como remitente. El mensaje tiene los mismos campos que arriba; la cadena trata al contrato como un llamador CosmWasm diga lo que diga `source_vm`. Con `async` en false (el valor por defecto) la llamada es síncrona: se ejecuta con el gas de la transacción, la respuesta está en `MsgCrossVMCallResponse.data` y un fallo revierte toda la transacción. Con `async` en true se pone en cola. Véase [Quién llama a quién](#who-calls-whom). El ejemplo siguiente pone la llamada en cola:

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

Cosas que debes saber antes de depender de esto:

- El EVM ve al contrato como los **últimos 20 bytes** de su dirección de 32 bytes. Asegúrate de que el contrato EVM no dependa de que `msg.sender` sea una cuenta normal.
- Desde v3.2.8, una llamada que dejaría a ese llamador con más QOR nativo del que tenía al empezar falla (y se cobra). Los contratos EVM pensados para esta dirección deben pagar un token ERC-20, o una cuenta de 20 bytes nombrada en la llamada, no QOR nativo a `msg.sender`.
- Un contrato que actúa como sí mismo no está acotado por una ventana EVM. Una llamada despachada bajo una concesión authz de una cuenta sí lo está; véase más abajo.
- Por debajo del puente `0x0901`, un `MsgCrossVMCall` solo se acepta de un contrato que actúa como sí mismo, y un `MsgExec` de authz ahí no puede llevar uno para otra cuenta.

Ambos modos se ejecutaron antes en la testnet (el síncrono en la altura 9,795,779, el asíncrono en la altura 9,795,783). El código Rust del lado del contrato que despacha este mensaje no se ejecutó para esta página.

## Authz y ventanas {#authz}

Una llamada entre VM hacia el EVM que el remitente no envió él mismo se ejecuta bajo la ventana EVM **del remitente**, exactamente como si el código del propio remitente actuara en la transacción de otra persona. En la práctica, es el uso de una concesión authz. Cuando alguien usa tu concesión de `MsgCrossVMCall` para llamar al EVM:

- La llamada solo se admite si **tu** ventana está abierta y su alcance admite el destino (`allowed_targets`, `native_only`, los precompilados que mueven valor).
- Cada llamada correcta usa una de las transacciones de la ventana, y el valor nativo que pierdas en ella se cuenta contra el valor de la ventana.
- Sin una clave poscuántica utilizable y una ventana activa, la llamada se rechaza, al enviarla en el caso de una llamada asíncrona y de nuevo cuando la cola la ejecuta.
- Un contrato o una política de grupo no tiene ventana, así que una concesión authz de uno de ellos no puede llevar una llamada al EVM.
- Las llamadas hacia QoreChain Native no están acotadas por la ventana. Una concesión authz genérica de `MsgCrossVMCall` da al beneficiario tu identidad en el carril QoreChain Native: concédela solo a partes en las que confíes con la cuenta.

La conversión de un token ERC-20 bajo una concesión authz (`MsgConvertERC20`) es admitida por la ventana del remitente de la misma manera.

## Límites y errores {#limits}

| Situación | Resultado |
| --------- | --------- |
| Payload mayor que `max_message_size` | Rechazada, código 8 (`message payload exceeds max size`) |
| Dirección de destino con una forma incorrecta para su carril | Rechazada al enviarla, código 5 (`invalid target contract address`) |
| El destino es una dirección de precompilado (`0x...0000` a `0x...ffff`) | Rechazada al enviarla, código 5 |
| VM de destino igual a tu propio carril | Rechazada |
| VM desconocida o no admitida | Código 7 (`unsupported VM type`) |
| Más de 100 llamadas en cola de un mismo remitente | `ErrQueueFull`, código 4, hasta que una termine o caduque |
| La cola contiene `max_queue_size` llamadas | `ErrQueueFull`, código 4 |
| `async_max_factor` fuera de 1,000,000 a 100,000,000 (millonésimas), por ejemplo `6` en lugar de `6000000` | Rechazada antes de ejecutar nada, codespace `crossvm` código 2 (`async_max_factor 6 is outside 1000000..100000000 (millionths)`) |
| `async_max_factor` inferior al factor vigente | Rechazada al enviarla |
| `async_gas_limit` inferior a 250,000 o superior al margen por bloque de la cola | Rechazada al enviarla |
| Prepago superior a 50,000,000 de gas | Rechazada al enviarla; reintenta más tarde o reduce el límite |
| uqor disponible inferior al escrow | Rechazada (las monedas bloqueadas por vesting, las concesiones de comisiones y las comisiones en otros tokens no pueden financiarlo) |
| Factor de congestión superior a `async_max_factor` cuando le llega el turno a la llamada | La llamada espera; caduca tras `queue_timeout_blocks` |
| La llamada caduca o nunca se ejecuta | Escrow reembolsado por completo, comisión de plaza retenida como comisión de procesamiento |
| El destino falla | Registro `failed` (asíncrona) o la transacción se deshace (síncrona); se cobra el gas usado |
| QOR nativo devuelto a un contrato que llama (remitente de 32 bytes) desde el EVM | La llamada falla y se cobra |
| Llamada a `0x0901` sin una ventana que lo liste | Rechazada |
| Destino de `0x0901` que no está en `bridge_allowed_targets`, o cuyo código cambió desde que se fijó | Revierte: `cross-VM bridge call refused: target ... is not allowlisted` para un destino que no está en la lista |
| `MsgCrossVMCall` en la lista del disyuntor | Transacción rechazada; las llamadas en cola siguen pendientes |
| Una llamada a la SVM | El carril está abierto en la testnet desde la propuesta 37 y desactivado en la mainnet; no se ejecutó ninguna llamada a la SVM para esta página (UNTESTED) |

Un error registrado en una llamada en cola fallida lleva texto simple, sin anotación de archivo fuente.

## Eventos {#events}

| Evento | Atributos | Significado |
| ------ | --------- | ----------- |
| `crossvm_request` | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Se envió una llamada |
| `crossvm_response` | `message_id`, `status`, y `error` para una llamada fallida | Una llamada en cola terminó |
| `crossvm_timeout` | `message_id` | Una llamada en cola caducó |
| `crossvm_escrow_settled` | comisión y reembolso | Se liquidó el escrow de una llamada asíncrona hacia QoreChain Native |

## Probado en la testnet {#tested}

Ejecutado en `qorechain-diana` el 12 de noviembre de 2026 (versión v3.2.8) tras aprobarse la propuesta 37, con el SDK 0.14.0 (`createCrossVMClient(...).buildCall`, firmado en modo híbrido, cuenta eth-native), contra el contrato cw20 almacenado por gobernanza e instanciado desde el código 859. El payload fue `{"transfer":{"recipient":<self>,"amount":"1"}}`.

| Paso | Resultado |
| ---- | --------- |
| Leer la lista del disyuntor | Solo `/cosmwasm.wasm.v1.MsgStoreCode`; el mensaje de llamada no está en pausa |
| Llamada síncrona de cuenta nativa a QoreChain Native | Simulada 601,178 de gas, enviada con lo simulado x 1.3, código 0, 595,049 de gas usado |
| Llamada asíncrona de cuenta nativa a QoreChain Native, `asyncGasLimit` 800000, `asyncMaxFactor` 6000000 | Simulada 751,287 de gas; código 0; 751,277 de gas usado |
| Débitos de la llamada asíncrona (eventos de la transacción) | La comisión (146,502 uqor, el límite por 0.15) y 680,417 uqor enviados a una cuenta de módulo (el escrow y el pago de la plaza en la cola tal como se observó; no se desglosan aquí) |
| Evento de la llamada asíncrona | `crossvm_request` con `source_vm` native, `target_vm` cosmwasm |
| `GET /qorechain/crossvm/v1/message/{id}` | Estado `executed`, `created_height` igual a `executed_height` (la llamada en cola se ejecutó en el mismo bloque), error vacío |
| `GET /qorechain/crossvm/v1/pending` después | Lista vacía |
| `async_max_factor` de `6` | Rechazada antes de ejecutar nada: codespace `crossvm` código 2, `async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

No ejecutado para esta página (UNTESTED): EVM a QoreChain Native a través de `0x0901`, y QoreChain Native a EVM. El equipo de la cadena informa de que las rutas síncrona y asíncrona de QoreChain Native a EVM se ejecutaron en la testnet en las alturas 9,795,779 y 9,795,783, antes de v3.2.8.

## Páginas relacionadas {#related}

- [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability) para los conceptos, el ciclo de vida y las notas sobre la lista de permitidos de la testnet.
- [Referencia de la ventana de autorización EVM](/developer-guide/evm-window-reference) para abrir y acotar la ventana que necesita el puente.
- [Precompilados de EVM](/developer-guide/evm-precompiles) para la tabla de precompilados y el estado de la red.
- [Desarrollo con QoreChain Native](/developer-guide/cosmwasm-development) y [Gas y límites de QoreChain Native](/developer-guide/cosmwasm-gas-and-limits) para el gas de los contratos y el presupuesto del bloque.
- [Firma poscuántica](/developer-guide/post-quantum-signing) para firmar las transacciones anteriores.
- [Guía de Cross-VM (SDK)](/sdk/guides/cross-vm) y [Rollups multi-VM](/rollups/multi-vm) para los ayudantes del SDK y del RDK.
