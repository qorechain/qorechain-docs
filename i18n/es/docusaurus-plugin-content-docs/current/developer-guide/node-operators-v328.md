---
slug: /developer-guide/node-operators-v328
title: "Operadores de nodo: lista de comprobación v3.2.8"
sidebar_label: Operadores de nodo v3.2.8
sidebar_position: 11
---

# Operadores de nodo: lista de comprobación v3.2.8

La versión **v3.2.8** se ejecuta en la testnet `qorechain-diana` desde el 12 de noviembre de 2026 (altura 9,929,500). La mainnet `qorechain-vladi` ejecuta v3.2.7 desde el 12 de noviembre de 2026 (altura 4,164,600, propuesta de gobernanza 16) y no ha aplicado v3.2.8, así que nada de esta página se aplica hoy a un nodo de mainnet.

Esta página es la lista corta de lo que un operador de nodo comprueba y cambia para v3.2.8: las bibliotecas compartidas del paquete, los ajustes del runtime de contratos, los nuevos valores por defecto de `app.toml`, una ruta REST nueva y los pasos para actualizar un nodo que todavía está en v3.2.7. Para la guía completa de nodos, consulta [Operar un Nodo](/developer-guide/running-a-node).

**Por qué importa.** v3.2.8 ejecuta los contratos inteligentes sobre una nueva biblioteca de runtime de contratos y cobra por la memoria y la carga de código que usa una llamada a un contrato. Un nodo que conserve la carpeta de bibliotecas antigua, o que se ejecute con muy poca memoria para contratos, no arrancará o se quedará atrás. El resto de la lista es un pequeño trabajo de configuración.

## 1. Copia la carpeta `lib/` completa {#lib-folder}

El paquete de la versión contiene `qorechaind` y una carpeta `lib/` con cuatro bibliotecas compartidas:

| Biblioteca | Función |
| --- | --- |
| `libqorepqc.so` | Verificación de firmas post-cuánticas |
| `libqoresvm.so` | Runtime SVM |
| `libwasmvm.x86_64.so` | Biblioteca del runtime de contratos (upstream) |
| `libwasmvmqore_v1.x86_64.so` | Nueva en v3.2.8: la biblioteca del runtime de contratos de QoreChain |

Copia la **carpeta completa**, no archivos sueltos. Una línea `COPY lib/ ...` en un Dockerfile o un `cp -r lib/* ...` en un host bare-metal sigue funcionando cuando una versión posterior añade una biblioteca; una lista de archivos con nombre no.

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

Apunta el cargador a la carpeta a la que copiaste (la entrada `LD_LIBRARY_PATH` o `ld.so.conf.d` que ya usas) y reinicia. Los comandos de arriba son un patrón; usa las rutas de tu propia instalación.

## 2. Caché de memoria de contratos: al menos 256 MiB {#memory-cache}

El runtime de contratos mantiene los contratos compilados en memoria. En `app.toml`, el ajuste `memory_cache_size` de la sección `[wasm]` debe ser de **256 MiB o más**:

```toml
[wasm]
memory_cache_size = 256
```

Un valor inferior a 256 se eleva a 256 cuando arranca el nodo, y el nodo registra una advertencia. Prevé la memoria extra en máquinas pequeñas.

## 3. El directorio de contratos es ahora `<home>/wasm` {#wasm-directory}

El código de contratos compilado vive ahora en `<home>/wasm`, donde `<home>` es el directorio con el que arrancas el nodo (`--home`). Un nodo cuyo código de contratos sigue en la ubicación antigua continúa usándola y registra una advertencia. Puedes mover la carpeta cuando te convenga; detén el nodo antes.

## 4. Nuevos valores por defecto de `app.toml` {#app-toml-defaults}

Un nodo inicializado con v3.2.8 escribe estos valores por defecto. Los archivos `app.toml` existentes **no se reescriben**, así que un nodo actualizado conserva sus valores antiguos hasta que los cambies.

| Ajuste | Nuevo valor por defecto | Qué hace |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | Límite de gas para las transacciones simuladas en este nodo. Las wallets y los SDK simulan antes de enviar, y el límite alto permite simular llamadas grandes a contratos |
| Espacios de nombres `api` de JSON-RPC | `eth,net,web3` | El espacio de nombres `txpool` no se sirve por defecto, porque publica las transacciones pendientes del nodo. Añade `txpool` tú mismo solo si lo necesitas |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. Límite de gas de las consultas {#query-gas-limit}

Las consultas a contratos se ejecutan bajo un límite de gas local del nodo que controla la sección `[wasm]` de `app.toml`. El equipo de la cadena recomienda fijarlo en `0` (sin límite) en los validadores:

```toml
[wasm]
query_gas_limit = 0
```

Este ajuste solo cambia lo que tu propio nodo responde a las consultas de contratos; no cambia lo que debe contener ningún bloque. Es la recomendación del equipo de la cadena para los validadores; un nodo que atiende consultas públicas puede preferir un límite finito.

## 6. Ruta nueva: `GET /qorechain/svm/v1/params` {#svm-params}

v3.2.8 añade una ruta de solo lectura para los parámetros del módulo SVM. La sirven los nodos en v3.2.8 (testnet) y responde HTTP `501` en mainnet, donde la versión no está aplicada.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Respuesta de la testnet el 12 de noviembre de 2026:

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| Campo | Significado |
| --- | --- |
| `enabled` | Si el carril de transacciones SVM está abierto. `false` en la testnet desde la actualización, así que las escrituras SVM se rechazan hasta que la gobernanza lo vuelva a abrir |
| `max_program_size`, `max_account_data_size` | Límites de tamaño en bytes (10,485,760 cada uno) |
| `compute_budget_max` | El mayor presupuesto de cómputo que puede pedir una transacción (1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | Entradas del precio del almacenamiento |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | Desfase de numeración de slots, esquema de firma por defecto y el límite de profundidad de llamadas entre programas |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | Límites del QOR nativo que puede mantener una cuenta SVM, en uqor |

Lee `enabled` antes de mostrar un botón de envío SVM; consulta [Desarrollo SVM](/developer-guide/svm-development). La ruta `GET /qorechain/svm/v1/cluster_info` es una ruta aparte que devuelve la identidad del clúster.

## 7. Comprueba el manifiesto {#manifest}

El manifiesto es la fuente de verdad sobre qué binario instalar:

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

El 12 de noviembre de 2026 respondió `version` `3.2.8`, `minCompatible` `3.2.8`, `upgradeType` `height`, `upgradeHeight` `9929500` y el binario `qorechaind-v3.2.8-b3-linux-amd64.tar.gz`. Comprueba que `version` sea igual a `minCompatible` antes de fiarte de `binary.url`, y verifica el archivo contra el `sha256` del mismo fichero. El manifiesto de mainnet está en `https://download.qore.host/mainnet/latest.json` y nombra v3.2.6 hasta que se anuncie una actualización de mainnet.

## 8. Actualiza un nodo que sigue en v3.2.7 {#upgrade-from-v327}

La altura de actualización de la testnet ya ha pasado, así que un nodo que sigue en v3.2.7 se detiene en la altura 9,929,500 con `UPGRADE "v3.2.8" NEEDED`. Su estado se conserva y no necesita resincronizar.

1. Descarga el archivo indicado en el manifiesto y verifica su SHA-256.
2. Detén el nodo.
3. Sustituye `qorechaind` y copia la carpeta `lib/` completa ([paso 1](#lib-folder)).
4. Comprueba `[wasm] memory_cache_size` ([paso 2](#memory-cache)) y decide sobre `simulation_gas_limit`, los espacios de nombres de JSON-RPC y `query_gas_limit` ([pasos 4 y 5](#app-toml-defaults)).
5. Arranca el nodo y vigila el log. Es esperable una advertencia sobre el directorio de contratos o la caché de memoria si no los has cambiado.
6. Confirma que sigue la cadena:

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

Un nodo nuevo que se une a la testnet arranca directamente desde el binario v3.2.8; consulta [Conexión a la Testnet](/getting-started/connecting-to-testnet) para el state sync y los peers, y [Operar un Nodo](/developer-guide/running-a-node#upgrades) para el historial de actualizaciones.

## Límites y errores

| Lo que ves | Significado | Qué hacer |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED` y el nodo se detiene en la altura 9,929,500 | El nodo sigue con el binario v3.2.7 | Sección 8 |
| Error de arranque por una biblioteca compartida que falta | `lib/` no se copió completa, o el cargador no apunta a ella | Sección 1 |
| Advertencia de que `memory_cache_size` se elevó | El valor configurado es inferior a 256 MiB | Fija 256 o más |
| Advertencia sobre el directorio de contratos | El código de contratos sigue en la ubicación antigua | Muévelo a `<home>/wasm` cuando te convenga |
| `501` desde `/qorechain/svm/v1/params` | El nodo no está en v3.2.8 (la mainnet ejecuta v3.2.7) | Es lo esperado en mainnet |

## Páginas relacionadas

* [Operar un Nodo](/developer-guide/running-a-node), incluido [Runtime de contratos en v3.2.8](/developer-guide/running-a-node#v328-node)
* [Operar un Validador](/developer-guide/running-a-validator)
* [Conexión a la Testnet](/getting-started/connecting-to-testnet)
* [Endpoints REST y gRPC](/api-reference/rest-grpc-endpoints)
