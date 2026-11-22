---
slug: /developer-guide/governance-proposals-contracts
title: "Propuestas de gobernanza para contratos: sube código Native y abre el acceso entre VM (testnet)"
sidebar_label: Propuestas de contratos
sidebar_position: 12
---

# Propuestas de gobernanza para contratos: sube código Native y abre el acceso entre VM (testnet)

En la testnet de QoreChain `qorechain-diana`, nadie sube un contrato QoreChain Native (CosmWasm) con una transacción simple, y ningún contrato EVM puede llamar a un contrato Native a través del puente hasta que la gobernanza lo haya dicho. Ambas cosas pasan por una **propuesta de gobernanza**: la propuesta guarda tu código compilado, opcionalmente crea el contrato y lo añade a la lista de permitidos entre VM, **fijado al código exacto** que subiste. Esta página muestra a un desarrollador cómo preparar, enviar, seguir y verificar una propuesta así, y luego llamar al contrato aprobado desde Solidity.

Esta página se comprobó contra la testnet en vivo el **22 de noviembre de 2026** (cadena `qorechain-diana`, cadena v3.2.9 desde el 20 de noviembre). Los ejemplos en la cadena son propuestas reales: la 40 (el contrato `qday-receipts`, código 865), la 23, la 27 y la 34 (código guardado), la 19 y la 20 (reglas de instanciación), la 32 (la lista de permitidos). Las líneas de comando de `qorechaind` se escribieron a partir de la referencia de CLI existente y del JSON de propuesta en la cadena; el binario en sí no se ejecutó para esta página, así que ejecuta `qorechaind tx gov submit-proposal --help` una vez en tu máquina por si alguna bandera difiere.

:::note Solo testnet
Estos pasos describen la testnet. La mainnet no tiene el puente entre VM abierto, y la subida de código allí también es solo por gobernanza. El QOR de prueba no tiene valor; usa solo cuentas de prueba.
:::

## Por qué pasa por gobernanza {#why}

* **La subida está cerrada a las cuentas.** `code_upload_access` es `Nobody` y `MsgStoreCode` está en la lista del disyuntor (circuit breaker). Una propuesta de gobernanza abre el disyuntor, guarda el código como la cuenta de gobernanza y lo vuelve a cerrar dentro de la misma propuesta, así que la puerta nunca queda abierta entre votaciones.
* **La instanciación está abierta.** `instantiate_default_permission` es `Everybody` desde la propuesta 19, así que una vez que la gobernanza ha guardado tu código cualquiera (tú incluido) puede crear contratos a partir de él, a menos que el código guardado lleve un permiso más estricto.
* **El puente solo llega a contratos aprobados.** El puente `0x0901` solo puede llamar a los destinos de `bridge_allowed_targets`. Cada destino está fijado a un id de código y a la longitud de su historial de código, así que el contrato no puede migrarse a otro código y conservar su aprobación.
* **Es atómica.** Los mensajes de una propuesta se ejecutan juntos. Si uno falla (por ejemplo un código que la cadena rechaza), ninguno se aplica, y el disyuntor no queda abierto.

## Qué necesitas {#needs}

| Elemento | Cómo conseguirlo |
| --- | --- |
| El binario `qorechaind` (Linux) | La versión en [download.qore.host](https://download.qore.host). Un binario del árbol de código fuente público no puede firmar la firma híbrida que exige la cadena. |
| Una cuenta de testnet con una clave post-cuántica registrada | Consulta [Firma híbrida](/cli-reference/transaction-commands#hybrid-signing). |
| QOR de prueba para el depósito y las comisiones | El faucet de la testnet. Una propuesta normal necesita 10 QOR, una urgente 50 QOR (tabla más abajo). |
| Docker, para construir el contrato igual que todos los demás | [Docker](https://docs.docker.com/get-docker/). |

## Paso 1: construye el contrato y anota su checksum {#build}

Construye con el optimizador de CosmWasm para que cualquiera pueda reconstruir tu código fuente y obtener los mismos bytes. El contrato del Taller 3 se construyó con la imagen arm64 en Apple Silicon (una máquina x86 usa la imagen `optimizer` simple; las dos dan checksums distintos, así que indica cuál usaste en el resumen de la propuesta):

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Deberías ver una línea por contrato con un checksum hexadecimal de 64 caracteres y el nombre de archivo, por ejemplo `6ebfc32f...5c43c  qday_receipts.wasm`. Ese checksum es el **SHA-256 del archivo wasm sin comprimir**, y es el `data_hash` que la cadena mostrará para tu código. Cópialo; va en el resumen de la propuesta para que los votantes puedan comprobarlo.

Antes de gastar un depósito, comprueba el código contra los límites de [Gas y límites de subida](/developer-guide/cosmwasm-development#gas-and-limits): como máximo 4,096 funciones, como máximo 32 MiB compilado, sin instrucciones de coma flotante.

## Paso 2: codifica el código para la propuesta {#encode}

La propuesta lleva el wasm dentro del JSON en base64. Comprímelo primero (la cadena acepta gzip, que es lo que usó la propuesta 40: su código empieza por `H4sI`):

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

Deberías ver un tamaño en bytes. El código de `qday-receipts` ocupa unos 99,000 caracteres como base64 de gzip. Guárdalo en un archivo, porque es demasiado largo para pegarlo en un comando.

## Paso 3: escribe la propuesta {#write}

Una propuesta es un archivo JSON con `messages`, `metadata`, `deposit`, `title`, `summary` y `expedited`. La `authority` y el `sender` de cada mensaje de abajo son la **cuenta del módulo de gobernanza**. Léela en lugar de copiarla de esta página:

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

Deberías ver la cuenta con `"name":"gov"`; su `address` empieza por `qor1`. Llámala `<GOV_ADDRESS>` más abajo. El 22 de noviembre de 2026 era `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3`.

### Propuesta A: guardar el código y crear el contrato {#proposal-a}

Esta es la forma de la propuesta 40 sin su mensaje de lista de permitidos. El orden importa: abre el disyuntor, guarda, cierra el disyuntor y después instancia.

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

Cómo rellenar los marcadores:

| Marcador | Cómo obtenerlo |
| --- | --- |
| `<NEXT_CODE_ID>` | El último id de código más uno. Lee el último con `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"`. El 22 de noviembre de 2026 el último era el 865, así que el siguiente era el 866. Si la propuesta de otra persona guarda código antes, la tuya recibe un id posterior y el mensaje de instanciación falla, lo que deshace toda la propuesta (solo se pierde la espera). |
| `<BASE64_SALT>` | Cualquier texto corto, codificado en base64: `printf 'my-contract-v1' \| base64`. Hace predecible la dirección del contrato. La propuesta 40 usó la sal `qday-receipts-w3`. |
| `msg` | El JSON que espera el `instantiate` de tu contrato. `{}` para un contrato sin campos. |
| `admin` | Una cadena vacía significa sin administrador, así que nadie puede migrar el contrato. Prefiérelo para un contrato al que llamará el puente (consulta [Pines](#pins)). |
| `instantiate_permission` | `Everybody`, o `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }` para restringir quién puede instanciar (la propuesta 34 lo hizo para un contrato de prueba). |

No tienes que instanciar dentro de la propuesta. Quita el último mensaje para guardar solo el código, e instancia más tarde con una transacción ordinaria (`tx wasm instantiate`, consulta [Ciclo de vida del contrato](/developer-guide/cosmwasm-development)). Las propuestas 23 y 27 guardaron código de esta manera.

### Propuesta B: poner el contrato en la lista de permitidos entre VM {#proposal-b}

Cuando la propuesta A se haya aprobado, busca la dirección del contrato y lee los parámetros entre VM en vivo:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

Deberías ver la dirección de tu contrato `qor1...`, un historial con **una** entrada (`INIT`, tu id de código) y el conjunto de parámetros. `MsgUpdateParams` del módulo entre VM **sustituye el conjunto completo de parámetros**, así que copia cada campo de la respuesta en vivo y cambia solo dos cosas: añade tu destino a `bridge_allowed_targets` y añade su pin a `bridge_target_pins`.

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

Los números de arriba son los valores leídos el 22 de noviembre de 2026; usa los que leas en vivo, no estos. La propuesta 40 dejó fuera `wasm_congestion_factor_micro`, un campo que la respuesta en vivo también muestra; sigue la respuesta en vivo y la plantilla de la propuesta 40 y compara el resultado con la tabla de [Referencia entre VM](/developer-guide/cross-vm-reference#params) tras la votación.

### Pines: qué significan `code_id` y `history_len` {#pins}

| Campo | Significado |
| --- | --- |
| `target` | `cosmwasm:` seguido de la dirección del contrato, escrita exactamente como en `bridge_allowed_targets`. |
| `code_id` | El código que el contrato debe ejecutar para que el puente lo llame. |
| `history_len` | Cuántas entradas tiene el historial de código del contrato cuando lo fijas. Una instancia nueva tiene 1. Un contrato migrado una vez tiene 2 (la lista de permitidos de la testnet tiene uno así). Cualquier migración posterior cambia la longitud, así que el pin ya no coincide y el puente rechaza la llamada. |

Un contrato en la lista de permitidos que tiene un administrador distinto de la gobernanza debe estar fijado con un pin, porque ese administrador podría migrarlo. El diseño seguro más simple es el que hizo la propuesta 40: sin administrador y con un pin.

### Hacer ambas cosas en una sola propuesta {#one-proposal}

La propuesta 40 lo hizo todo en una sola propuesta: guardó el código, lo instanció con una sal y fijó la dirección que produce esa sal. Eso exige conocer de antemano el siguiente id de código y la futura dirección del contrato, así que es fácil equivocarse. Dos propuestas cuestan una votación más y unas horas; prefiérelas salvo que ya hayas derivado la dirección.

## Paso 4: depósito, periodo de votación y umbrales {#params}

Lee las reglas en vivo antes de enviar:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| Regla | Propuesta normal | Propuesta urgente (`"expedited": true`) |
| --- | --- | --- |
| Depósito mínimo | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| Periodo de depósito (para alcanzar el mínimo) | 172,800 s (2 días) | 172,800 s (2 días) |
| Periodo de votación | 14,400 s (4 horas) | 3,600 s (1 hora) |
| Quórum | 33.4% del stake en bonding | 33.4% del stake en bonding |
| Umbral de sí | 50% de los votos emitidos | 66.7% de los votos emitidos |
| Umbral de veto | 33.4% | 33.4% |
| Depósito inicial mínimo | ninguno | ninguno |

Leído el 22 de noviembre de 2026. También de la misma respuesta: un voto "no con veto" por encima del umbral quema el depósito (`burn_vote_veto` es `true`), una propuesta que no alcanza el quórum no lo quema, y una propuesta urgente que no supera su recuento continúa como propuesta normal con los votos ya emitidos. Todas las propuestas de contratos que el equipo de la testnet ha enviado hasta ahora fueron urgentes; una propuesta de un desarrollador normalmente debería seguir siendo normal (el depósito de 10 QOR y la votación de cuatro horas son más fáciles de planificar).

## Paso 5: envía {#submit}

Toda transacción del carril Cosmos debe llevar la firma híbrida, así que primero construyes la transacción y después la firmas con tu clave post-cuántica. La propuesta es grande (el código va dentro), así que dale margen de gas: el mínimo de comisión es 0.1 uqor por unidad de gas, y un byte de transacción cuesta 10 de gas.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Fija `--gas` y `--fees` con una prueba en seco: ejecuta primero `tx pqc cosign` con `--dry-run` (imprime una estimación de gas y no envía nada), luego usa la estimación más un 30 % como `<GAS>` y una comisión de al menos `<GAS>` por 0,1 uqor como `<FEES>`. Una transferencia simple necesita unos 300.000 a 400.000 de gas; un despliegue o una propuesta que lleva código necesita mucho más.

`--generate-only` escribe la transacción sin firmar. `tx pqc cosign` añade ambas firmas y la difunde; contexto en [Firma híbrida](/cli-reference/transaction-commands#hybrid-signing) y en los [comandos gov](/cli-reference/transaction-commands#submit-proposal). Deberías ver un hash de transacción y el código 0. Si ves un error de falta de gas, sube `--gas` y las `--fees` correspondientes (la comisión debe ser al menos gas por 0.1 uqor).

Busca el id de tu propuesta, que también es el número de los eventos de la transacción:

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

Deberías ver tu título y un estado `PROPOSAL_STATUS_VOTING_PERIOD` (el depósito que adjuntaste alcanzó el mínimo). Con un depósito menor el estado es `PROPOSAL_STATUS_DEPOSIT_PERIOD`; cualquiera puede completarlo:

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## Paso 6: vota {#vote}

Cualquier staker puede votar con el stake que tenga. Una sola cartera de desarrollador no alcanzará el quórum del 33.4%, así que avisa de tu propuesta a los validadores y delegadores de la testnet (el resumen de la propuesta es lo que leen) y pídeles que voten. Un voto es una transacción con firma híbrida como cualquier otra:

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Las opciones son `yes`, `no`, `abstain` y `no_with_veto` (consulta [Gobernanza](/user-guide/governance)). Sigue el recuento y el reloj:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

Cuando termina la votación el estado pasa a `PROPOSAL_STATUS_PASSED` (los mensajes se han ejecutado), `PROPOSAL_STATUS_REJECTED` o `PROPOSAL_STATUS_FAILED`. **Failed** significa que la votación se aprobó pero un mensaje no pudo ejecutarse, y entonces no se aplicó ninguno de los mensajes; `failed_reason` dice por qué. La propuesta 40, por ejemplo, mostró `PASSED` una hora después de enviarse.

## Paso 7: verifica el código en la cadena {#verify}

Compara el código que guarda la cadena con el checksum que construiste. La cadena informa `data_hash` en mayúsculas; `sha256sum` imprime minúsculas.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

Deberías ver los mismos 64 caracteres en ambas líneas. Como comprobación más sólida, calcula el hash de los bytes que la cadena realmente guarda:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

Esto imprimió `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` para el código 865, el mismo checksum que la compilación con el optimizador del código fuente del Taller 3. Después comprueba el contrato y, tras la propuesta B, la lista de permitidos:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

Deberías ver `code_id` como el tuyo y `admin` vacío en la primera respuesta, y tu destino `cosmwasm:qor1...` con su pin (`code_id`, `history_len` de `"1"`) en la segunda. El 22 de noviembre de 2026 la lista tenía cuatro destinos; el cuarto era `qday-receipts` en `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8`, fijado al código 865.

## Paso 8: llámalo desde un contrato EVM {#call}

El EVM llama al puente en `0x0000000000000000000000000000000000000901` con `executeCrossVMCall(uint8,string,bytes)`: VM de destino `1` (Native), la dirección de tu contrato como cadena y el mensaje JSON como bytes. El lado Native ve la propia cuenta `qor1...` del contrato EVM que llama como remitente, y una reversión en cualquiera de los dos lados deshace ambos.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

Se aplican dos condiciones, ambas explicadas en [Referencia entre VM](/developer-guide/cross-vm-reference#evm-to-wasm): el destino debe estar en la lista de permitidos (y seguir ejecutando su código fijado), y la cuenta que envía la transacción necesita una [ventana de autorización EVM](/developer-guide/evm-window-reference) abierta cuyos `allowed_targets` listen `0x...0901`. Para un ejemplo completo y probado con una tienda en Solidity y el contrato `qday-receipts`, sigue el [Taller 3](/build-before-qday/workshop-3#part-2).

## Solución de problemas {#troubleshooting}

| Lo que ves | Causa probable y solución |
| --- | --- |
| `tx wasm store` falla o nunca entra | Es lo esperado. Las cuentas no pueden subir en la testnet; el disyuntor y `code_upload_access` lo bloquean ambos. Usa una propuesta. |
| El estado de la propuesta es `PROPOSAL_STATUS_FAILED` | La votación se aprobó pero un mensaje falló, así que no se aplicó nada. Lee `failed_reason` en `GET /cosmos/gov/v1/proposals/<id>`. Un `code_id` erróneo en el mensaje de instanciación es la causa habitual. |
| `PROPOSAL_STATUS_REJECTED` | No hubo suficientes votos a favor o no se alcanzó el quórum. Envía de nuevo con un resumen más claro, o pide a los validadores que voten. |
| El estado sigue en `PROPOSAL_STATUS_DEPOSIT_PERIOD` | El depósito total está por debajo del mínimo (10 QOR normal, 50 QOR urgente). Añade más con `tx gov deposit` en 2 días. |
| El envío falla con el código 20 en el espacio `pqc` | La transacción no llevaba firma híbrida. Usa `--generate-only` y `tx pqc cosign`. |
| El envío falla por falta de gas | La propuesta es grande. Sube `--gas` y mantén la comisión en al menos gas por 0.1 uqor. |
| El checksum difiere de `data_hash` | Construiste en otro tipo de máquina o con otra versión del optimizador. Reconstruye con la imagen nombrada en el resumen de la propuesta (las imágenes arm64 y x86 dan bytes distintos). |
| La llamada EVM se revierte con `cross-VM bridge call refused: target ... is not allowlisted` | El contrato no está en `bridge_allowed_targets`, o su código cambió desde que se fijó. Compara los parámetros en vivo con tu pin. |
| La llamada EVM se rechaza antes de llegar al puente | No hay ventana EVM abierta que liste `0x0901`. Abre una primero. |
| `MsgCrossVMCall` se rechaza | Puede que la llamada esté en pausa en la lista del disyuntor. Lee `GET /cosmos/circuit/v1/disable_list`. |
| La propuesta B falla | El conjunto de parámetros estaba incompleto o un pin es incorrecto. Comprueba que está presente cada campo de la respuesta en vivo y que `history_len` es igual al número de entradas del historial. |

## Páginas relacionadas {#related}

* [Gobernanza](/user-guide/governance) para votos, depósitos y tipos de propuesta.
* [Desarrollo en QoreChain Native](/developer-guide/cosmwasm-development) para el ciclo de vida del contrato y las consultas.
* [Comandos de transacción](/cli-reference/transaction-commands#submit-proposal) para las banderas exactas de `gov` y `pqc cosign`.
* [Referencia entre VM](/developer-guide/cross-vm-reference) para los parámetros, la cola y los ejemplos de llamada.
* [Taller 3](/build-before-qday/workshop-3) para un ejemplo entre VM resuelto.
