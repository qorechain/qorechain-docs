---
slug: /api-reference/rest-grpc-endpoints
title: Endpoints REST / gRPC
sidebar_label: Endpoints REST / gRPC
sidebar_position: 1
---

# Endpoints REST / gRPC

QoreChain expone tres interfaces principales para el acceso programático:

| Interfaz | Puerto predeterminado | Protocolo | Descripción                                  |
| -------- | --------------------- | --------- | -------------------------------------------- |
| REST     | `1317`                | HTTP/1.1  | Gateway REST (servidor API de Cosmos SDK)    |
| gRPC     | `9090`                | HTTP/2    | Servicio gRPC codificado con Protobuf        |
| RPC      | `26657`               | HTTP + WS | RPC del motor de consenso de QoreChain       |

Todos los endpoints REST devuelven JSON. Los endpoints gRPC usan Protocol Buffers y pueden consumirse con cualquier cliente gRPC. La interfaz RPC ofrece consultas a nivel de consenso y difusión de transacciones.

:::note
Estas interfaces están disponibles tanto en la mainnet **`qorechain-vladi`** (en producción desde el 29 de junio de 2026) como en la testnet **`qorechain-diana`**. Las URLs base a continuación asumen un nodo ejecutándose localmente. Los endpoints públicos alojados son `https://api.qore.host` / `https://api-testnet.qore.host` (REST) y `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), y se listan en [Redes](/appendix/networks#public-endpoints). **No existe un endpoint gRPC público**: los nombres de host `grpc.qore.host` y `grpc-testnet.qore.host` no existen, así que ejecute su propio nodo si necesita gRPC.
:::

## URLs base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Qué rutas existen {#which-routes-exist}

Los módulos específicos de QoreChain se exponen por REST bajo el prefijo `/qorechain/<module>/v1/...`, y solo los módulos listados a continuación tienen rutas REST. Los demás módulos son accesibles **únicamente por gRPC** (consulte [Módulos solo gRPC](#grpc-only-modules)). Las rutas estándar de Cosmos SDK, EVM y CosmWasm se listan en [Rutas estándar](#standard-routes).

Una ruta que no existe responde con HTTP `501` y `{"code":12,"message":"Not Implemented"}`. Eso significa que la ruta no se sirve, no que la consulta haya devuelto un resultado vacío. Las rutas abreviadas sin el prefijo `/qorechain/` (por ejemplo `/bridge/v1/chains` o `/pqc/v1/params`) **no** se sirven. Un registro desconocido en una ruta que sí existe devuelve HTTP `404` con `{"code":5,"message":"... not found"}`.

Los ejemplos siguientes usan el host público de la mainnet; sustitúyalo por `https://api-testnet.qore.host` para la testnet.

## Módulo PQC {#pqc-module}

| Método | Endpoint                                 | Descripción                                                                                  |
| ------ | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Registro de la clave poscuántica de una cuenta (`found`, tipo de clave, algoritmo)           |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | La ventana de autorización de la lane EVM de la cuenta y lo que queda de ella                |

Tenga en cuenta que el segmento de la ruta es el singular `account`. No existe una ruta `/qorechain/pqc/v1/params` ni `/stats`.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0
  }
}
```

Una cuenta sin clave registrada devuelve `{"found": false, "account": null}`. Use `found` para decidir si una cuenta debe registrar una clave antes de poder enviar.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": ""
}
```

Esta ruta nunca falla para una dirección sin ventana; devuelve `found: false`. Desde v3.2.0, la lane EVM admite una transacción solo de una cuenta que tenga una clave PQC registrada **y** una ventana abierta. `live` es `true` mientras la ventana admita al menos una transacción más a la altura actual. `remaining_blocks`, `remaining_txs` y `remaining_value` muestran qué límite está más cerca de agotarse; los valores son enteros en `uqor` devueltos como cadenas. Consulte [Desarrollo EVM](/developer-guide/evm-development) para ver cómo funciona la lane EVM.

## Módulo Bridge {#bridge-module}

El estado de solo lectura del módulo bridge se expone por REST bajo `/qorechain/bridge/v1/...` (sirviendo JSON real on-chain desde la versión de cadena **v3.1.77**). El `config` del bridge reporta, por ejemplo, `min_validators=10` y `attestation_threshold=7`.

| Método | Endpoint                                    | Descripción                                    |
| ------ | ------------------------------------------- | ---------------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`               | Configuración actual del módulo bridge         |
| GET    | `/qorechain/bridge/v1/chains`               | Lista todas las cadenas bridge registradas     |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | Detalles de una cadena puenteada específica    |
| GET    | `/qorechain/bridge/v1/validators`           | Lista los validadores de bridge registrados    |
| GET    | `/qorechain/bridge/v1/validators/{address}` | Detalles de un validador de bridge específico  |
| GET    | `/qorechain/bridge/v1/operations`           | Lista las operaciones de bridge                |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | Detalles de una operación de bridge específica |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

`chains/{chain_id}` devuelve una entrada como `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`.

:::caution El bridge aún no está en producción
Las 37 cadenas bridge configuradas reportan `"status": "pending"` en ambas redes, y `validators` y `operations` son listas vacías. Estas rutas muestran la configuración del módulo; no significan que hoy se puedan puentear activos. Consulte [Arquitectura del bridge](/architecture/bridge-architecture).
:::

## Módulo Multilayer {#multilayer-module}

El servicio de consultas completo del módulo multilayer se expone por REST bajo `/qorechain/multilayer/v1/...` (desde la versión de cadena **v3.1.80**), incluyendo dos **consultas de lectura de anclaje de estado**: `anchor/{layer_id}` devuelve el último anclaje de liquidación (settlement anchor) de una capa, y `anchors/{layer_id}` devuelve su historial de anclajes. Cada anclaje lleva una firma **ML-DSA-87 (Dilithium-5)** sobre sus campos canónicos, de modo que un cliente puede obtener un anclaje y verificarlo de forma independiente — la base on-chain de los [recibos de liquidación](/rollups/settlement-receipts) del Rollup Development Kit.

| Método | Endpoint                                      | Descripción                                               |
| ------ | --------------------------------------------- | --------------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`             | Parámetros actuales del módulo Multilayer                 |
| GET    | `/qorechain/multilayer/v1/layers`             | Lista todas las capas registradas                         |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`  | Detalles de una capa específica                           |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`  | Último anclaje de estado de una capa                      |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}` | Historial de anclajes de estado de una capa               |
| GET    | `/qorechain/multilayer/v1/routing-stats`      | Estadísticas de enrutamiento de transacciones entre capas |

Un `StateAnchorView` contiene `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` y `compressed_state_proof`. El mensaje canónico firmado es `layer_id || layer_height || state_root || validator_set_hash`, verificado contra la clave PQC registrada del creador de la capa. Una capa sin anclaje devuelve HTTP `404` (`no anchor for layer ...`) desde `anchor/{layer_id}` y una lista vacía (`{"anchors": []}`) desde `anchors/{layer_id}`.

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

En el momento de redactar esto, `layers` es una lista vacía en ambas redes.

## Módulo Burn {#burn-module}

El estado de solo lectura del módulo burn se expone por REST bajo `/qorechain/burn/v1/...`. Los `params` de burn incluyen, por ejemplo, `gas_burn_rate=0.30`.

| Método | Endpoint                              | Descripción                                                                  |
| ------ | ------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/qorechain/burn/v1/params`           | Parámetros actuales del módulo Burn                                          |
| GET    | `/qorechain/burn/v1/stats`            | Total acumulado quemado, desglosado por fuente                               |
| GET    | `/qorechain/burn/v1/records`          | Lista los registros de burn recientes                                        |
| GET    | `/qorechain/burn/v1/milestone`        | Progreso del hito de burn (recuento acumulado de transacciones)              |
| GET    | `/qorechain/burn/v1/stranded_rewards` | Parte de los stakers reservada por la actualización v3.2.0 y aún no liberada |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31560093291491",
    "burns_by_source": {
      "gas_fee": "31560093291491",
      "failed_tx": "0",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3506945"
  }
}
```

La respuesta real lista todas las fuentes de burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); el ejemplo está recortado. Los importes están en `uqor`.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` es lo que queda por liberar, `released` es cuánto ha movido ya la gobernanza, y `snapshot_height` es la altura de la actualización v3.2.0 que registró la reserva. Consulte [Tokenomics](/architecture/tokenomics).

## Módulo Abstract Account {#abstract-account-module}

El servicio de consultas de cuenta abstracta se expone por REST bajo `/qorechain/abstractaccount/v1/...` (desde la versión de cadena **v3.1.85**), incluyendo el **esquema de permisos** usado para validar los alcances de [autenticador](/developer-guide/account-abstraction#authenticators) sin necesidad de codificarlos de forma fija (hardcoding).

| Método | Endpoint                                           | Descripción                                                               |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`             | Configuración del módulo (sonda de funcionalidad: `enabled`)              |
| GET    | `/qorechain/abstractaccount/v1/accounts`           | Lista las cuentas abstractas                                              |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}` | Estado de cuenta abstracta para una dirección (`404` si no existe)        |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`  | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs` |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Desactivado en ambas redes
`enabled` es `false` hoy en la mainnet y en la testnet, por lo que funciones de cuenta abstracta como el gasto desde wallets vinculadas no están disponibles. Use `config.enabled` como sonda de funcionalidad antes de depender de este módulo. Consulte [Abstracción de cuentas](/developer-guide/account-abstraction).
:::

## Módulo AMM {#amm-module}

| Método | Endpoint                                                            | Descripción                                                  |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| GET    | `/qorechain/amm/v1/params`                                          | Parámetros actuales del AMM (comisiones en puntos básicos, límites) |
| GET    | `/qorechain/amm/v1/pools`                                           | Lista los pools                                              |
| GET    | `/qorechain/amm/v1/pools/{pool_id}`                                 | Un pool (`404` si es desconocido)                            |
| GET    | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`                    | Saldo de tokens LP de una dirección en un pool               |
| GET    | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=`                | Busca el pool de un par de denominaciones (`404` si no hay)  |
| GET    | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`    | Cotización: salida para una entrada exacta                   |
| GET    | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Cotización: entrada necesaria para una salida exacta         |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

En el momento de redactar esto no hay pools en ninguna de las dos redes (`{"pools": []}`), y una cotización para un pool desconocido devuelve HTTP `400` con `{"code":3,"message":"pool not found"}`.

## Módulo Licence {#licence-module}

| Método | Endpoint                                             | Descripción                                                                         |
| ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| GET    | `/qorechain/license/v1/check/{grantee}/{feature_id}` | Si `grantee` posee una concesión activa para la funcionalidad (`404` si no hay)     |
| GET    | `/qorechain/license/v1/holders/{feature_id}`         | Todas las concesiones de una funcionalidad                                          |
| GET    | `/qorechain/license/v1/list/{grantee}`               | Todas las concesiones que posee una dirección                                       |

Una concesión (`LicenseView`) tiene `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended` y `metadata`. `check` también devuelve `active`. Una consulta de lista o de titulares sin coincidencias devuelve `{"licenses": []}`; `check` para una dirección sin concesión devuelve HTTP `404` con `{"code":5,"message":"no license for <grantee>/<feature_id>"}`.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## Módulo Light Node {#light-node-module}

| Método | Endpoint                                    | Descripción                                                                   |
| ------ | ------------------------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/qorechain/lightnode/v1/params`            | Parámetros de registro, heartbeat y recompensas                               |
| GET    | `/qorechain/lightnode/v1/stats`             | `total_registered`, `total_active`, `total_rewards`, `last_reward_height`     |
| GET    | `/qorechain/lightnode/v1/nodes`             | Lista los nodos ligeros registrados                                           |
| GET    | `/qorechain/lightnode/v1/node/{address}`    | Un nodo (`{"node": null, "found": false}` si no está registrado)              |
| GET    | `/qorechain/lightnode/v1/rewards/{address}` | Recompensas acumuladas por una dirección de operador (`accumulated_rewards`)  |
| GET    | `/qorechain/lightnode/v1/reward_pool`       | Contabilidad del pool de recompensas (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `initialized`) |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "<uqor>",
  "reserved": "<uqor>",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true
}
```

`reserved` es la parte del pool que se retiene y solo puede moverse mediante una votación de gobernanza, y `max_reward_per_block_per_node` (en `uqor`) es el tope por nodo y por bloque de lo que acredita la cadena. Un tope no es una cantidad prometida. `balance` y `reserved` se muestran aquí como marcadores de posición.

:::note El registro no está abierto
`stats` reporta `"total_registered": "0"` y `nodes` está vacío en ambas redes, y la cadena rechaza el registro de un nodo ligero sin una concesión de licencia `lightnode_operator`. Consulte [Nodos ligeros](/light-node/overview) para conocer el estado del programa.
:::

## Módulos solo gRPC {#grpc-only-modules}

Estos módulos tienen un servicio gRPC `Query` pero **ninguna ruta REST**. Los nombres de servicio siguen el patrón `qorechain.<module>.v1.Query`.

| Módulo        | Métodos de consulta gRPC (versión de cadena v3.2.0)        |
| ------------- | ---------------------------------------------------------- |
| `ai`          | `Config`, `Stats`                                          |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                     |
| `reputation`  | `Params`                                                   |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`      |
| `svm`         | `Slot`, `Account`, `Program`                               |
| `qca`         | `Config`                                                   |

Use `grpcurl` contra su propio nodo, o los [comandos de consulta de la CLI](/cli-reference/query-commands). En particular, las consultas de `rdk` **no** están disponibles por REST en la mainnet (`/qorechain/rdk/v1/...` responde `501`), por lo que los lectores de rollups basados en REST no pueden funcionar hoy contra la mainnet.

Los módulos xQORE, inflation, BTC restaking (Babylon), FairBlock y gas abstraction no tienen ningún servicio de consulta en la versión actual de la mainnet, ni por REST ni por gRPC.

## Rutas estándar {#standard-routes}

También se sirven las rutas REST estándar de Cosmos SDK, IBC, EVM y CosmWasm. Ejemplos verificados en ambas redes:

| Endpoint                                                       | Descripción                                            |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `/cosmos/bank/v1beta1/supply`                                  | Suministro total                                       |
| `/cosmos/bank/v1beta1/balances/{address}`                      | Saldos de la cuenta                                    |
| `/cosmos/staking/v1beta1/validators`                           | Validadores                                            |
| `/cosmos/staking/v1beta1/params`                               | Parámetros de staking                                  |
| `/cosmos/distribution/v1beta1/params`                          | Parámetros de distribución                             |
| `/cosmos/gov/v1/params/voting`                                 | Parámetros de gobernanza                               |
| `/cosmos/slashing/v1beta1/params`                              | Parámetros de slashing                                 |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Actualizaciones pendientes / aplicadas                 |
| `/cosmos/base/node/v1beta1/config`                             | Precio mínimo de gas del nodo (`0.1uqor` en ambas redes) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`                | Último bloque                                          |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | Búsqueda de transacciones / consulta / por bloque      |
| `/cosmos/evm/vm/v1/params`                                     | Parámetros del módulo EVM                              |
| `/cosmos/evm/feemarket/v1/params`                              | Parámetros del mercado de comisiones de EVM            |
| `/cosmwasm/wasm/v1/codes/params`                               | Permisos de subida/instanciación de CosmWasm           |
| `/ibc/apps/transfer/v1/params`                                 | Parámetros de transferencia IBC                        |

El prefijo de CosmWasm es `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` no se sirve.

## Reflexión gRPC

Un nodo que usted mismo ejecute sirve gRPC en el puerto `9090`. Donde la reflexión del servidor esté habilitada, herramientas como `grpcurl` pueden descubrir los servicios disponibles:

```bash
grpcurl -plaintext localhost:9090 list
```

Para consultar un servicio específico:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` tiene dos métodos, `Account` y `EVMWindow`. No existe un método `Params`.

## Autenticación

Todos los endpoints REST y gRPC no requieren autenticación por defecto. Para despliegues en producción, coloque un proxy inverso (por ejemplo, Nginx o Caddy) delante del nodo para gestionar la terminación TLS y el control de acceso.
