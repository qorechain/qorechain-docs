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
Estas interfaces están disponibles tanto en la mainnet **`qorechain-vladi`** (en producción desde el 7 de junio de 2026) como en la testnet **`qorechain-diana`**. En el momento de redactar esto (comprobado el 27 de octubre de 2026) la mainnet ejecuta la versión de nodo **v3.2.4** (aplicada en la altura 3.742.566 el 23 de octubre de 2026, propuesta de gobernanza 13), y la propuesta de gobernanza 14 de la mainnet está en su periodo de votación; aplicaría v3.2.5 en la altura 3.906.833. La testnet ejecuta **v3.2.6**: aplicó v3.2.5 en la altura 8.890.800 el 26 de octubre de 2026 y v3.2.6 en la altura 8.970.638 el 27 de octubre de 2026. Las rutas y los campos que añade una versión aparecen en una red solo cuando esa red ha aplicado la versión; esta página marca lo que es exclusivo de la testnet. Las URLs base a continuación asumen un nodo ejecutándose localmente. Los endpoints públicos alojados son `https://api.qore.host` / `https://api-testnet.qore.host` (REST) y `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC), y se listan en [Redes](/appendix/networks#public-endpoints). **No existe un endpoint gRPC público**: los nombres de host `grpc.qore.host` y `grpc-testnet.qore.host` no existen, así que ejecute su propio nodo si necesita gRPC.
:::

## URLs base

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Qué rutas existen {#which-routes-exist}

Los módulos específicos de QoreChain se exponen por REST bajo el prefijo `/qorechain/<module>/v1/...`, y solo los módulos listados a continuación tienen rutas REST. Los demás módulos son accesibles **únicamente por gRPC** (consulte [Módulos solo gRPC](#grpc-only-modules)). Las rutas estándar de Cosmos SDK, EVM y QoreChain Native se listan en [Rutas estándar](#standard-routes).

Una ruta que no existe responde con HTTP `501` y `{"code":12,"message":"Not Implemented"}`. Eso significa que la ruta no se sirve, no que la consulta haya devuelto un resultado vacío. Las rutas abreviadas sin el prefijo `/qorechain/` (por ejemplo `/bridge/v1/chains` o `/pqc/v1/params`) **no** se sirven. Un registro desconocido en una ruta que sí existe devuelve HTTP `404` con `{"code":5,"message":"... not found"}`.

Los ejemplos siguientes usan el host público de la mainnet; sustitúyalo por `https://api-testnet.qore.host` para la testnet. Los valores de los ejemplos se leyeron de las redes en producción entre el 20 y el 27 de octubre de 2026 y cambian con el tiempo; úselos para conocer la forma de una respuesta. La versión v3.2.4 añadió algunas rutas y campos. Se marcan más abajo como **v3.2.4**: la testnet los sirve desde el 19 de octubre de 2026 y la mainnet desde el 23 de octubre de 2026. La versión v3.2.6 añadió más, marcados como **v3.2.6 (testnet)**: responden solo en la testnet, y la mainnet los responde con `501` hasta que aplique esa versión. Un nodo que aún ejecute una versión anterior responde una ruta nueva con `501`.

## Módulo PQC {#pqc-module}

| Método | Endpoint                                 | Descripción                                                                                  |
| ------ | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| GET    | `/qorechain/pqc/v1/account/{address}`    | Registro de la clave poscuántica de una cuenta (`found`, tipo de clave, algoritmo)           |
| GET    | `/qorechain/pqc/v1/evm_window/{address}` | La ventana de autorización de la lane EVM de la cuenta y lo que queda de ella                |
| GET    | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | El consentimiento de delegación EIP-7702 de la cuenta, la delegación actual y el nonce EVM (desde v3.2.2) |
| GET    | `/qorechain/pqc/v1/protocol_features`    | **v3.2.4** (testnet desde el 19 de octubre de 2026; mainnet desde el 23 de octubre de 2026; `501` en un nodo anterior). Todas las funcionalidades del protocolo que conoce el binario, con los indicadores `enabled`, `known` y `staged` |
| GET    | `/qorechain/pqc/v1/params`               | **v3.2.6 (testnet)**. Los parámetros del módulo; `501` en la mainnet en el momento de redactar esto |

Tenga en cuenta que el segmento de la ruta es el singular `account`. No existe una ruta `/qorechain/pqc/v1/stats` (use `qorechaind query pqc stats`). `/qorechain/pqc/v1/params` se sirve desde v3.2.6, por lo que por ahora solo en la testnet; en la mainnet use `qorechaind query pqc params` contra un nodo hasta que aplique esa versión.

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
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

`classical_key_source` indica de dónde procede `ecdsa_pubkey`: `stored` (la clave entregada en el registro), `auth_account` (no se almacenó nada, así que es la clave pública on-chain propia de la cuenta) o `none`. Desde v3.2.4 (en la testnet desde el 19 de octubre de 2026; en la mainnet desde el 23 de octubre de 2026) el registro también incluye `"possession_proven": false`, que pasa a `true` cuando una clave se registró con una [prueba de posesión](/developer-guide/post-quantum-signing#proof-of-possession) verificada; un nodo con una versión anterior no reporta el campo.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

Esta ruta nunca falla para una dirección sin ventana; devuelve `found: false`. Desde v3.2.0, la lane EVM admite una transacción solo de una cuenta que tenga una clave PQC registrada **y** una ventana abierta. `live` es `true` mientras la ventana admita al menos una transacción más a la altura actual. `remaining_blocks`, `remaining_txs` y `remaining_value` muestran qué límite está más cerca de agotarse; los valores son enteros en `uqor` devueltos como cadenas. Desde v3.2.3, una ventana puede llevar un alcance: `native_only` (solo transferencias simples de QOR) y `allowed_targets` (solo los destinatarios listados). Consulte [Desarrollo EVM](/developer-guide/evm-development#evm-window) para ver cómo funciona la lane EVM.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

Una delegación EIP-7702 de una cuenta solo surte efecto con el consentimiento poscuántico de la propia cuenta (`MsgAuthorizeEVMDelegation`). `found` y `live` reportan un consentimiento registrado y todavía utilizable para `delegate`; `current_delegate` es la delegación que la cuenta tiene establecida ahora y `nonce` es su nonce EVM.

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

Un `StateAnchorView` contiene `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` y `compressed_state_proof`. Desde v3.2.2 el mensaje firmado es el **mensaje de anclaje v2**: la etiqueta de dominio `qorechain-multilayer-anchor-v2`, seguida del id de la cadena, el id de la capa, la altura de la capa, la raíz de estado, el hash del conjunto de validadores, el recuento de transacciones y la prueba de estado comprimida, con cada campo de longitud variable precedido de su longitud en 8 bytes big-endian (el mensaje v1 anterior no incluía el id de la cadena ni prefijos de longitud, por lo que una firma era válida en todas las cadenas). Se verifica contra la clave PQC registrada del creador de la capa. `qorechaind query rdk anchor-sign-bytes` imprime los bytes de un lote de rollup. Una capa sin anclaje devuelve HTTP `404` (`no anchor for layer ...`) desde `anchor/{layer_id}` y una lista vacía (`{"anchors": []}`) desde `anchors/{layer_id}`.

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

En el momento de redactar esto, `layers` es una lista vacía en ambas redes. El ejemplo es la respuesta de la mainnet; en la testnet `max_sidechains` es `64` (elevado por la propuesta de gobernanza 16, aprobada el 25 de octubre de 2026, para el evento de builders).

## Módulo Burn {#burn-module}

El estado de solo lectura del módulo burn se expone por REST bajo `/qorechain/burn/v1/...`. Los `params` de burn incluyen, por ejemplo, `gas_burn_rate=0.30`.

| Método | Endpoint                              | Descripción                                                                  |
| ------ | ------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/qorechain/burn/v1/params`           | Parámetros actuales del módulo Burn                                          |
| GET    | `/qorechain/burn/v1/stats`            | Total acumulado quemado, desglosado por fuente                               |
| GET    | `/qorechain/burn/v1/records`          | Lista los registros de burn recientes                                        |
| GET    | `/qorechain/burn/v1/milestone`        | Progreso del hito de burn (recuento acumulado de transacciones)              |
| GET    | `/qorechain/burn/v1/stranded_rewards` | Parte de los stakers reservada y aún no liberada por la gobernanza           |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

La respuesta real lista todas las fuentes de burn (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty` y, desde v3.2.4, `staking_tier_penalty`, la penalización por desbloqueo anticipado de un bloqueo de nivel de staking, que se quema); el ejemplo está recortado. Los importes están en `uqor`. `failed_tx` es distinto de cero desde la actualización v3.2.2, cuando el burn de transacciones fallidas pasó a aplicarse a la comisión realmente cobrada. Desde v3.2.3 los `records` antiguos de cada burn se podan, así que `records` es una ventana reciente, no el historial completo; los totales de `stats` son acumulados.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "0", "released": "10500542706858", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` es lo que queda por liberar, `released` es cuánto ha movido ya la gobernanza, y `snapshot_height` es la altura de la actualización v3.2.0 que registró la reserva. Los valores anteriores son los leídos el 23 de octubre de 2026: la gobernanza liberó la primera cantidad (6.693.045,921330 QOR) el 19 de octubre de 2026, la actualización v3.2.3 recalculó la reserva restante a su propia altura (3.807.496,785528 QOR) y la propuesta de gobernanza 12 liberó esa cantidad (aprobada, votación terminada el 21 de octubre de 2026), de modo que la reserva está ahora vacía y `released` suma 10.500.542,706858 QOR. Lea los valores en vivo. Consulte [Tokenomics](/architecture/tokenomics).

## Módulo Abstract Account {#abstract-account-module}

El servicio de consultas de cuenta abstracta se expone por REST bajo `/qorechain/abstractaccount/v1/...` (desde la versión de cadena **v3.1.85**), incluyendo el **esquema de permisos** usado para validar los alcances de [autenticador](/developer-guide/account-abstraction#authenticators) sin necesidad de codificarlos de forma fija (hardcoding).

| Método | Endpoint                                           | Descripción                                                               |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`             | Configuración del módulo (sonda de funcionalidad: `enabled`)              |
| GET    | `/qorechain/abstractaccount/v1/accounts`           | Lista las cuentas abstractas                                              |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}` | Estado de cuenta abstracta para una dirección (`404` si no existe)        |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`  | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET    | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **v3.2.4** (testnet desde el 19 de octubre de 2026; mainnet desde el 23 de octubre de 2026; `501` en un nodo anterior). La secuencia que debe firmar a continuación una clave de autenticador vinculada (`nonce`, `linked`) |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note Desactivado en la mainnet, activado en la testnet
El ejemplo anterior es la respuesta de la mainnet: allí `enabled` es `false` (y `accounts` es una lista vacía), por lo que funciones de cuenta abstracta como el gasto desde wallets vinculadas no están disponibles en la mainnet. En la testnet `enabled` es `true` desde la propuesta de gobernanza 18 (aprobada el 27 de octubre de 2026) y `accounts` lista las cuentas creadas hasta ahora (comprobado el 27 de octubre de 2026). Use `config.enabled` como sonda de funcionalidad antes de depender de este módulo. Consulte [Abstracción de cuentas](/developer-guide/account-abstraction).
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

Las siete rutas del AMM responden en ambas redes (comprobado el 27 de octubre de 2026). En el momento de redactar esto no hay pools en ninguna de las dos redes (`{"pools": []}`). Respuestas ante una entrada que no coincide con nada: `pools/{pool_id}` con un id desconocido devuelve HTTP `404` (`{"code":5,"message":"pool 1 not found"}`); `pool_by_denoms` sin pool para el par devuelve `404` (`no pool for uqor/foo`); una cotización para un pool desconocido devuelve HTTP `400` con `{"code":3,"message":"pool not found"}`; `pools/{pool_id}/lp/{address}` devuelve `{"balance":"0"}` para una dirección sin posición LP (la dirección debe ser una dirección bech32 `qor1` válida; en caso contrario, `400`). Las dos rutas de cotización y `pool_by_denoms` leen su entrada de la cadena de consulta, así que necesitan parámetros: sin `amount_in` / `amount_out` responden `400` (`invalid amount_in` / `invalid amount_out`).

En la testnet, la segunda denominación que necesita un pool está disponible desde v3.2.6: tres tokens de prueba registrados por gobernanza, consulte [Tokens de prueba de la testnet (Fest)](#fest-tokens). No hay equivalente en la mainnet, cuya única denominación bancaria es `uqor`.

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
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

`expires_at: "0"` significa que la concesión no caduca. Desde v3.2.3 la gobernanza puede reemplazar a la autoridad de licencias que otorga estas licencias (`MsgUpdateAuthority`); las concesiones ya realizadas se mantienen.

## Módulo Light Node {#light-node-module}

| Método | Endpoint                                    | Descripción                                                                   |
| ------ | ------------------------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/qorechain/lightnode/v1/params`            | Parámetros de registro, heartbeat y recompensas                               |
| GET    | `/qorechain/lightnode/v1/stats`             | `total_registered`, `total_active`, `total_rewards`, `last_reward_height`     |
| GET    | `/qorechain/lightnode/v1/nodes`             | Lista los nodos ligeros registrados                                           |
| GET    | `/qorechain/lightnode/v1/node/{address}`    | Un nodo (`{"node": null, "found": false}` si no está registrado)              |
| GET    | `/qorechain/lightnode/v1/rewards/{address}` | Recompensas acumuladas por una dirección de operador (`accumulated_rewards`)  |
| GET    | `/qorechain/lightnode/v1/reward_pool`       | Contabilidad del pool de recompensas (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

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
  "balance": "5645408555",
  "reserved": "5645276228",
  "outstanding": "130077",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "2250",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000",
  "monthly_cap_active": true,
  "last_distribution_time": "1792775155",
  "last_distribution_height": "3744000"
}
```

`reserved` es la parte del pool que se retiene y solo puede moverse mediante una votación de gobernanza. Los límites por nodo están en `uqor`: `max_reward_per_block_per_node` es el tope por bloque y, desde v3.2.3, `max_reward_per_month_per_node` (`2000000000` uqor = 2.000 QOR por 30 días) es el tope mensual, prorrateado por tiempo de bloque y tiempo de actividad, de modo que ya no depende de lo rápido que lleguen los bloques. Un tope no es una cantidad prometida. El ejemplo es la respuesta real de la mainnet leída el 23 de octubre de 2026, después de que la gobernanza liberara la reserva anterior (propuesta 8, 19 de octubre de 2026). Desde v3.2.4 (en la testnet desde el 19 de octubre de 2026; en la mainnet desde el 23 de octubre de 2026) la respuesta también incluye `monthly_cap_active`, `last_distribution_time` y `last_distribution_height`, y el límite de un nodo parte de su propio registro.

:::note El registro requiere una licencia
La cadena rechaza el registro de un nodo ligero sin una concesión de licencia `lightnode_operator` activa (`holders/lightnode_operator` lista las concesiones). El 27 de octubre de 2026 `stats` reporta `"total_registered": "1"` tanto en la mainnet como en la testnet. Consulte [Nodos ligeros](/light-node/overview) para conocer el estado del programa.
:::

## Módulo RDK {#rdk-module}

El servicio de consultas del Rollup Development Kit se expone por REST bajo `/qorechain/rdk/v1/...` (desde la versión de cadena **v3.2.2**; en v3.2.0 y v3.2.1 era solo gRPC).

| Método | Endpoint                                              | Descripción                                          |
| ------ | ----------------------------------------------------- | ---------------------------------------------------- |
| GET    | `/qorechain/rdk/v1/params`                            | Parámetros del módulo                                |
| GET    | `/qorechain/rdk/v1/rollups`                           | Lista los rollups                                    |
| GET    | `/qorechain/rdk/v1/rollup/{rollup_id}`                | Un rollup (`404` si es desconocido)                  |
| GET    | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | El último lote de liquidación del rollup             |
| GET    | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | Un lote de liquidación                               |
| GET    | `/qorechain/rdk/v1/batches/{rollup_id}`               | Los lotes del rollup en orden de índice (paginado)   |
| GET    | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | Un registro de blob de disponibilidad de datos       |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

En el momento de redactar esto, `rollups` es una lista vacía en ambas redes, por lo que las rutas por rollup responden `404` (por ejemplo `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` se expresa en segundos (`604800`). Desde v3.2.4 la ventana de desafío optimista de un lote recién enviado se mide en tiempo de bloque: en la testnet desde la altura 8.337.253 (19 de octubre de 2026), en la mainnet desde la altura 3.742.566 (23 de octubre de 2026). Antes de la actualización la cadena convertía el valor en segundos a bloques con una cifra fija de 6 segundos por bloque. En la testnet la propuesta de gobernanza 17 (aprobada el 27 de octubre de 2026) fijó `default_challenge_window` en `3600` (una hora) y `max_rollups` en `200` para el evento de builders, por lo que el ejemplo anterior (mainnet) difiere de la testnet en eso; `rollups` sigue vacía en la testnet en el momento de redactar esto.

## Módulo Inflation {#inflation-module}

Los ajustes de emisión y su progreso se exponen por REST bajo `/qorechain/inflation/v1/...` (desde la versión de cadena **v3.2.2**). No están disponibles mediante un comando de la CLI.

| Método | Endpoint                              | Descripción                                                                 |
| ------ | ------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/inflation/v1/params`      | Parámetros de emisión: `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET    | `/qorechain/inflation/v1/epoch_info`  | Progreso: `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

En la mainnet, `emission_mode` es `"fixed"`, `fixed_epoch_emission` es `"86000000000"` (86.000 QOR por época), `epoch_length` es `"43200"` bloques y `max_total_emission` es `"590000000000000"` (590.000.000 QOR, el tope acumulado). Estos valores los fijó la propuesta de gobernanza 10 (aprobada el 19 de octubre de 2026); la primera época que usa la nueva cantidad fija comienza en el bloque 3.672.000, y `epoch_info` muestra la época en curso y la cantidad acuñada hasta ahora. La lista `schedule` de la respuesta pertenece al modo `schedule` original; no describe lo que acuña una época en modo fixed. Todos los importes están en `uqor`. La testnet reporta sus propios valores, distintos. Desde v3.2.4 existe un tercer modo, `target_apy`, con un campo `target_apy_bps` (en la testnet desde el 19 de octubre de 2026; en la mainnet desde el 23 de octubre de 2026). Una red solo pasa a él mediante su propia votación de gobernanza, así que la mainnet se mantiene en `fixed` hasta que se apruebe una votación así (comprobado el 27 de octubre de 2026: sigue en `fixed`). La testnet pasó a `target_apy` mediante su propia gobernanza (propuesta 14, aprobada el 20 de octubre de 2026) y en el momento de redactar esto reporta `"emission_mode": "target_apy"`, con `epoch_info` mostrando que el tope acumulado ya se alcanzó (`remaining_emission` `0`).

## Módulo Gas Abstraction {#gas-abstraction-module}

| Método | Endpoint                                              | Descripción                                                                 |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/qorechain/gasabstraction/v1/config`                 | Tokens de comisión aceptados, prima, tope de conversión por bloque          |
| GET    | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | Cuánto vale en `uqor` una unidad de un token de comisión, y si es `usable`  |
| GET    | `/qorechain/gasabstraction/v1/float`                  | La dirección, los saldos y el uso en este bloque del float de conversión    |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

La lista de aceptados contiene solo `uqor` nativo en ambas redes, así que las comisiones se pagan en `uqor` y no se realiza ninguna conversión. La gobernanza añade un token (con un pool, una liquidez mínima y una desviación máxima entre el precio medio ponderado en el tiempo y el precio spot); una comisión pagada en ese token se convierte mediante un float de QOR y se repone a través de un pool AMM. `conversion_rate` sin `?denom=` responde `500` (`denom is required`).

## Módulo RL Consensus (v3.2.6, testnet) {#rlconsensus-module}

:::note Solo testnet por ahora
La pasarela REST del módulo `rlconsensus` llegó con **v3.2.6**, que la testnet `qorechain-diana` aplicó en la altura 8.970.638 el 27 de octubre de 2026. En la mainnet todas las rutas siguientes responden HTTP `501` (`{"code":12,"message":"Not Implemented"}`) en el momento de redactar esto (comprobado el 27 de octubre de 2026); allí el módulo solo es accesible por gRPC. Las siete rutas responden en la testnet y ninguna necesita parámetros.
:::

| Método | Endpoint                                  | Descripción                                                              |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/qorechain/rlconsensus/v1/agent`         | Estado del agente: `mode`, `current_epoch`, `total_steps`, `last_observation_at`, `last_action_at`, `circuit_breaker_active`, `blocks_since_revert` |
| GET    | `/qorechain/rlconsensus/v1/params`        | Parámetros del módulo: intervalo de observación, modo del agente, límites de paso, ventana y umbral del interruptor de seguridad, pesos de la recompensa, tiempo de bloque por defecto, precio del gas y tamaño del conjunto de validadores |
| GET    | `/qorechain/rlconsensus/v1/observation`   | El último vector de observación (`height` y 25 `values`)                 |
| GET    | `/qorechain/rlconsensus/v1/reward`        | La última señal de recompensa y sus componentes                          |
| GET    | `/qorechain/rlconsensus/v1/policy`        | La red de política almacenada: `epoch`, `updated_at`, `weight_count` (los pesos en sí no se devuelven) |
| GET    | `/qorechain/rlconsensus/v1/applied_params` | Los valores que el agente mantiene como aplicados: `block_time_ms`, `gas_limit`, `gas_price_floor`, `pool_weight_rpos`, `pool_weight_dpos` |
| GET    | `/qorechain/rlconsensus/v1/last_action`   | La acción que el agente propuso en su último paso: `height`, `mode`, cinco `values` y `applied` |

```bash
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/agent
curl -s https://api-testnet.qore.host/qorechain/rlconsensus/v1/last_action
```

```json
{ "mode": "shadow", "current_epoch": "1", "total_steps": "209", "last_observation_at": "8975660",
  "last_action_at": "8975660", "circuit_breaker_active": false, "blocks_since_revert": "0" }
```

```json
{ "height": "8975660", "mode": "shadow", "values": ["-0.334711810000000000", "-0.500000000000000000",
  "0.000000000000000000", "0.000000000000000000", "0.000000000000000000"], "applied": false }
```

El agente da un paso cada `observation_interval` bloques (10). En modo `shadow` calcula una acción y la registra sin aplicar nada, por lo que `applied` es `false` y `applied_params` se queda en sus valores por defecto (`block_time_ms` `5000`, `gas_price_floor` `100`, pesos de pool `0.40` y `0.35`). En la testnet el agente se inició en modo shadow con una política almacenada mediante la propuesta de gobernanza 29 (aprobada el 27 de octubre de 2026); `circuit_breaker_active` es `false`. Los importes y los valores son cadenas. Los valores aplicados son informativos en esta versión: el único lector en la cadena es el [precompile `rlConsensusParams`](/developer-guide/evm-precompiles#network-status) de solo lectura. Los métodos gRPC equivalentes son `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy`, `AppliedParams` y `LastAction` (servicio `qorechain.rlconsensus.v1.Query`), y los comandos de la CLI están en [Comandos de consulta](/cli-reference/query-commands#rlconsensus).

## Módulo Staking Tiers (v3.2.4) {#stakingtier-module}

:::note Disponible desde v3.2.4
El módulo de niveles de staking forma parte de **v3.2.4**. La testnet sirve estas rutas desde el 19 de octubre de 2026 y la mainnet desde el 23 de octubre de 2026 (propuesta de gobernanza 13, altura 3.742.566). Un nodo con una versión anterior las responde con `501`.
:::

| Método | Endpoint                                  | Descripción                                                        |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/qorechain/stakingtier/v1/params`        | Niveles de bloqueo, el importe mínimo de bloqueo, la penalización por desbloqueo anticipado |
| GET    | `/qorechain/stakingtier/v1/locks/{holder}` | Los bloqueos de un titular, lo que acumula cada uno actualmente y lo que se puede reclamar |
| GET    | `/qorechain/stakingtier/v1/pool`          | El pool de bonus: saldo, pendiente, excedente y la última liquidación |

`params` lista las tres duraciones de bloqueo (3, 6 y 12 meses) con sus parámetros y `min_lock_amount` (`"10000000"` uqor, 10 QOR). Los bloqueos se crean con `tx stakingtier lock` (consulte [Comandos de transacción](/cli-reference/transaction-commands#stakingtier)).

## Módulos solo gRPC {#grpc-only-modules}

En la mainnet (versión de nodo v3.2.4, comprobado el 27 de octubre de 2026) estos módulos tienen un servicio gRPC `Query` pero **ninguna ruta REST**. Los nombres de servicio siguen el patrón `qorechain.<module>.v1.Query`.

| Módulo        | Métodos de consulta gRPC (mainnet, versión de cadena v3.2.4) |
| ------------- | ---------------------------------------------------------- |
| `ai`          | `Config`, `Stats`                                          |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                     |
| `reputation`  | `Params`                                                   |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                               |
| `qca`         | `Config`                                                   |

Las consultas de `rlconsensus` se sirven por REST en la testnet desde v3.2.6 (con dos métodos más, `AppliedParams` y `LastAction`); consulte [Módulo RL Consensus](#rlconsensus-module). La mainnet las responde con `501` hasta que aplique esa versión. Use `grpcurl` contra su propio nodo, o los [comandos de consulta de la CLI](/cli-reference/query-commands). Las consultas de `rdk` también están disponibles por REST (consulte [Módulo RDK](#rdk-module)); antes de v3.2.2 eran solo gRPC.

Los módulos xQORE, BTC restaking (Babylon) y FairBlock no tienen ningún servicio de consulta en la versión actual, ni por REST ni por gRPC. Los módulos inflation y gas abstraction, que no tenían ninguno antes de v3.2.2, se sirven por REST (consulte [Módulo Inflation](#inflation-module) y [Módulo Gas Abstraction](#gas-abstraction-module)).

## Rutas estándar {#standard-routes}

También se sirven las rutas REST estándar de Cosmos SDK, IBC, EVM y QoreChain Native. Ejemplos verificados en ambas redes:

| Endpoint                                                       | Descripción                                            |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `/cosmos/bank/v1beta1/supply`                                  | Suministro total                                       |
| `/cosmos/bank/v1beta1/balances/{address}`                      | Saldos de la cuenta                                    |
| `/cosmos/staking/v1beta1/validators`                           | Validadores                                            |
| `/cosmos/staking/v1beta1/params`                               | Parámetros de staking                                  |
| `/cosmos/distribution/v1beta1/params`                          | Parámetros de distribución                             |
| `/cosmos/gov/v1/params/voting`                                 | Parámetros de gobernanza                               |
| `/cosmos/slashing/v1beta1/params`                              | Parámetros de slashing                                 |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Actualizaciones pendientes / aplicadas (`applied_plan/v3.2.3` devuelve `{"height":"3662051"}` en la mainnet) |
| `/cosmos/circuit/v1/disable_list`                              | Tipos de mensaje desactivados en toda la red           |
| `/cosmos/base/node/v1beta1/config`                             | Precio mínimo de gas del nodo (`0.1uqor` en ambas redes) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`                | Último bloque                                          |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | Búsqueda de transacciones / consulta / por bloque      |
| `/cosmos/evm/vm/v1/params`                                     | Parámetros del módulo EVM                              |
| `/cosmos/evm/feemarket/v1/params`                              | Parámetros del mercado de comisiones de EVM            |
| `/cosmwasm/wasm/v1/codes/params`                               | Permisos de subida/instanciación de QoreChain Native           |
| `/ibc/apps/transfer/v1/params`                                 | Parámetros de transferencia IBC                        |
| `/ibc/core/client/v2/counterparty_info/{client_id}`            | **v3.2.6 (testnet)**. La contraparte IBC v2 registrada para un cliente (`404` si no hay; `501` en la mainnet) |
| `/ibc/core/client/v2/config/{client_id}`                       | **v3.2.6 (testnet)**. La configuración del cliente IBC v2 (`allowed_relayers`; `501` en la mainnet) |
| `/cosmos/evm/erc20/v1/token_pairs`, `/token_pairs/{token}`     | Pares de tokens ERC20 (testnet: los tres tokens de prueba Fest y un token IBC; mainnet: ninguno) |

El prefijo de QoreChain Native es `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` no se sirve.

### Rutas de cliente IBC v2 (v3.2.6, testnet) {#ibc-v2-routes}

El servicio de consultas de clientes IBC v2 se servía antes por gRPC, pero sus rutas REST faltaban; v3.2.6 las monta. Un relayer lee de aquí la contraparte de un cliente. Ambas rutas toman el ID del cliente en la ruta (por ejemplo `07-<type>-0`); sin él responden `501` en ambas redes. Comprobado el 27 de octubre de 2026:

| Ruta | Testnet (v3.2.6) | Mainnet (v3.2.4) |
| --- | --- | --- |
| `/ibc/core/client/v2/counterparty_info/{client_id}` | `200` con la contraparte, o `404` (`client 07-<type>-0 counterparty not found`) para un cliente que no tiene ninguna registrada; un ID en blanco responde `400` | `501` |
| `/ibc/core/client/v2/config/{client_id}` | `200`, `{"config":{"allowed_relayers":[]}}` (una lista vacía significa cualquier relayer) | `501` |
| `/ibc/core/channel/v2/clients/{client_id}/next_sequence_send`, `/packet_commitments` y las demás rutas de canal IBC v2 | responden (`404` cuando no hay nada registrado para el cliente, `200` con una lista vacía para los compromisos) | responden, mismas formas |

Las rutas IBC v1 (`/ibc/core/client/v1/...`, `/ibc/core/channel/v1/...`) responden en ambas redes. En el momento de redactar esto la testnet tiene un cliente IBC y un canal de transferencia abierto (`channel-0`, con un token denominado en IBC), y la mainnet no tiene ningún cliente IBC, canal ni token denominado en IBC. En la testnet el módulo de límites de tasa responde en `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` (una lista vacía: no hay ningún límite establecido) y la lista de checksums de 08-wasm en `/ibc/lightclients/wasm/v1/checksums` (vacía); la mainnet responde ambas con `501`.

### Tokens de prueba de la testnet (Fest) {#fest-tokens}

:::note Solo testnet, sin valor
Los tres tokens siguientes existen solo en la testnet `qorechain-diana`. Son tokens de prueba para builders: no tienen valor, y la mainnet no tiene ningún par de tokens ERC20 (comprobado el 27 de octubre de 2026: `token_pairs` está vacío y el suministro bancario contiene solo `uqor`). La gobernanza los registró como pares de tokens ERC20 el 27 de octubre de 2026 (propuesta 26).
:::

En la testnet, un token ERC20 registrado existe también como moneda bancaria, de modo que puede mantenerse, enviarse y usarse como segunda denominación de un [pool AMM](#amm-module). La denominación bancaria es `erc20:` seguido de la dirección del contrato en **forma de checksum EIP-55 con mayúsculas y minúsculas**, y la cadena de la denominación **distingue mayúsculas de minúsculas**: la grafía toda en minúsculas es una cadena distinta y no se encuentra.

| Token | Dirección del contrato | Denominación bancaria | Decimales |
| --- | --- | --- | --- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6 |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8 |

```bash
# the three tokens and their display names / decimals
curl -s https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata
# one denom: the case matters (this returns the metadata, the lowercase spelling returns 404)
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata/erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
# the ERC20 token pairs, and the supply of one denom
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/bank/v1beta1/supply/by_denom?denom=erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

`denoms_metadata` lista cada token con `symbol` `fUSD` / `fETH` / `fBTC`, `display` `FestUSD` / `FestETH` / `FestBTC` y los decimales como exponente de la unidad de visualización. Una consulta de saldo (`/cosmos/bank/v1beta1/balances/{address}`) muestra la parte convertida del saldo de un titular bajo la denominación `erc20:...`; los tokens que aún se mantienen en el lado EVM aparecen en el propio `balanceOf` del contrato ERC20. La conversión entre las dos formas se hace con `MsgConvertERC20` (EVM a bank) y `MsgConvertCoin` (bank a EVM); el remitente de `MsgConvertERC20` debe escribirse como una dirección bech32 `qor1`. Consulte [Desarrollo EVM](/developer-guide/evm-development#fest-tokens).

## Reflexión gRPC

Un nodo que usted mismo ejecute sirve gRPC en el puerto `9090`. Donde la reflexión del servidor esté habilitada, herramientas como `grpcurl` pueden descubrir los servicios disponibles:

```bash
grpcurl -plaintext localhost:9090 list
```

Para consultar un servicio específico:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` tiene tres métodos en un nodo v3.2.3, `Account`, `EVMWindow` y `EVMDelegationConsent`, y un cuarto desde v3.2.4 (la testnet desde el 19 de octubre de 2026, la mainnet desde el 23 de octubre de 2026), `ProtocolFeatures`. Se añade un método `Params` en v3.2.6 (solo la testnet por ahora); un nodo de la mainnet no tiene método `Params`.

## Autenticación

Todos los endpoints REST y gRPC no requieren autenticación por defecto. Para despliegues en producción, coloque un proxy inverso (por ejemplo, Nginx o Caddy) delante del nodo para gestionar la terminación TLS y el control de acceso.
