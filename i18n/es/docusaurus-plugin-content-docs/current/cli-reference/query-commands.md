---
slug: /cli-reference/query-commands
title: Comandos de consulta
sidebar_label: Comandos de consulta
sidebar_position: 3
---

# Comandos de consulta

Todos los comandos de consulta siguen el patrón:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Las consultas se ejecutan contra el nodo al que apunte `--node`. Utiliza un endpoint RPC de mainnet **`qorechain-vladi`** para datos en vivo (por ejemplo `--node https://rpc.qore.host:443`), o un endpoint de testnet **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) para pruebas. El valor por defecto `tcp://localhost:26657` apunta a un nodo que ejecutas tú mismo. Mainnet ejecuta la versión de nodo v3.2.5 desde el 29 de octubre de 2026 (aplicada en la altura 3,906,833 por la propuesta de gobernanza 14; v3.2.4 se aplicó en la altura 3,742,566 el 23 de octubre de 2026); la testnet ejecuta v3.2.6 (v3.2.4 desde el 19 de octubre de 2026, v3.2.5 desde el 26 de octubre, v3.2.6 desde el 27 de octubre). La versión v3.2.4 añade algunas rutas y comandos (marcados como **v3.2.4** más abajo): funcionan en ambas redes, y un nodo que todavía esté en una versión anterior los responde con `Not Implemented`. La versión v3.2.6 añade dos comandos (marcados como **v3.2.6**, solo en testnet hasta que mainnet la aplique). Los comandos de esta página se comprobaron con el binario de la versión v3.2.3, ejecutado contra `https://rpc.qore.host:443`; las rutas de v3.2.4 se comprobaron por REST el 23 de octubre de 2026 y los comandos de v3.2.6 contra el código fuente de v3.2.6.
:::

Los flags comunes se aplican a todos los subcomandos de `query`:

| Flag       | Tipo   | Descripción                                            |
| ---------- | ------ | ------------------------------------------------------ |
| `--node`   | string | Endpoint RPC (por defecto: `tcp://localhost:26657`)    |
| `--output` | string | Formato de salida: `json` o `text`                     |
| `--height` | int    | Consultar el estado a una altura de bloque específica  |

No todos los módulos tienen una consulta de CLI. Cuando falta un comando, usa el endpoint REST (`https://api.qore.host/...`); consulta [API REST](/api-reference/rest-grpc-endpoints).

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(No existe `query bank total`.)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

`--status` acepta el nombre completo del enum: `BOND_STATUS_BONDED`, `BOND_STATUS_UNBONDING` o `BOND_STATUS_UNBONDED` (`--status bonded` se rechaza).

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

`--proposal-status` acepta `deposit-period`, `voting-period`, `passed`, `rejected` o `failed`. Otros filtros: `--voter`, `--depositor`.

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm` acepta un nombre de algoritmo (`dilithium5`, `mlkem1024`) o un ID numérico.
- `migration` acepta un **ID de algoritmo** (por ejemplo `1`), no una dirección, e informa `No active migration` cuando no hay ninguna en curso.
- `account` informa la clave registrada. Además de la clave, `key_type` y `algorithm_name`, el registro tiene `classical_key_source` (`stored`, `auth_account` o `none`: de dónde procede la clave pública clásica). Desde v3.2.4 (mainnet desde el 23 de octubre de 2026, testnet desde el 19 de octubre de 2026) también incluye `possession_proven`, que es `true` cuando la clave se registró con una prueba de posesión verificada.
- `evm-window` muestra si la dirección tiene una ventana de autorización abierta en la vía EVM y cuántos bloques, transacciones y valor quedan (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`), además del alcance de la ventana (`native_only`, `allowed_targets`; desde la mainnet v3.2.3). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.
- `evm-delegation-consent` muestra el consentimiento de delegación EIP-7702 de la dirección (`found`, `live`, `delegate`, `granted_height`, `expiry_height`), su delegación actual y su nonce EVM. REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- `params` y `hybrid-mode` informan `hybrid_signature_mode` (`2` = obligatorio en ambas redes) y `allow_classical_fallback` (`false`).

---

## burn

El módulo burn no tiene consulta de CLI. Usa REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards` informa la parte de los stakers que se depositó en el módulo de distribución sin respaldar ningún derecho (`reserved`, `released`, `snapshot_height`). Solo puede liberarse mediante una votación de gobernanza. La reserva se registró por primera vez en la actualización a v3.2.0 y se recalculó en la altura de la actualización a v3.2.3, así que lee los valores en vivo en lugar de una cifra citada en otro lugar.

`stats` desglosa la quema acumulada por origen, incluido `failed_tx`, que es distinto de cero desde la actualización a v3.2.2.

---

## mint e inflation

`qorechaind query mint params|inflation|annual-provisions` lee el módulo mint estándar, cuya tasa es `0` en ambas redes; **no** informa el calendario de emisión del protocolo. No existe el comando de CLI `query inflation`. Los ajustes de emisión propios del protocolo y su progreso se sirven por REST desde v3.2.2:

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

En mainnet estos informan `emission_mode: "fixed"`, una emisión fija de 86,000 QOR por época de 43,200 bloques y un tope acumulado de 590,000,000 QOR (propuesta de gobernanza 10, aprobada el 19 de octubre de 2026; la primera época con el nuevo monto comienza en el bloque 3,672,000). Los montos están en `uqor`. La testnet informa sus propios valores, distintos: cambió al modo de emisión adicional que añadió v3.2.4 (`target_apy`) mediante su propia gobernanza (propuesta 14, aprobada el 20 de octubre de 2026). Una red solo cambia de modo mediante su propia votación de gobernanza, así que mainnet mantiene `fixed` hasta que prospere una votación así (comprobado el 27 de octubre de 2026).

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation y qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

No hay consultas de reputación por validador ni de clasificación de pools.

`query reputation params` (REST `GET /qorechain/reputation/v1/params`) responde solo en la testnet. En mainnet la ruta responde `Not Implemented` (comprobado el 30 de octubre de 2026, después de v3.2.5), así que empieza en mainnet con una versión posterior de la cadena.

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

`reward-pool` muestra cómo se divide el saldo de recompensas del módulo en `reserved`, `outstanding`, `payable` y `distributable`, y los límites por nodo: `max_reward_per_block_per_node` y, desde v3.2.3, `max_reward_per_month_per_node` (2,000 QOR, prorrateado por tiempo de bloque y disponibilidad). Desde v3.2.4 (mainnet desde el 23 de octubre de 2026, testnet desde el 19 de octubre de 2026) también informa `monthly_cap_active`, `last_distribution_time` y `last_distribution_height`.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check` devuelve un error `NotFound` cuando el beneficiario no tiene una licencia para la función.

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config` muestra los parámetros del módulo (stake mínimo, tasa de quema en la creación, ventana de desafío, límites de DA). `anchor-sign-bytes` imprime, en hex, los bytes de firma de anclaje v2 que firma el creador de un rollup para `tx rdk submit-batch --anchor-signature`. Las mismas consultas se sirven por REST bajo `/qorechain/rdk/v1/...` desde v3.2.2 (consulta [Endpoints REST / gRPC](/api-reference/rest-grpc-endpoints#rdk-module)). `suggest-profile <use_case>` no consulta la cadena; solo imprime una referencia a un método JSON-RPC que los endpoints públicos no sirven, así que elige un perfil entre los [Perfiles predefinidos](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
qorechaind query rlconsensus applied-params   # v3.2.6 (testnet)
qorechaind query rlconsensus last-action      # v3.2.6 (testnet)
```

`agent-status` informa el modo, la época y el número de pasos del agente; `policy` informa la época de la política almacenada y el número de pesos (no los pesos). **v3.2.6 (solo testnet hasta que mainnet aplique esa versión):** `applied-params` imprime los valores que el agente mantiene como aplicados (tiempo de bloque, suelo del precio del gas, pesos de los pools) y `last-action` la acción que propuso en su último paso, que se registra en todos los modos, incluido el modo sombra, donde no se aplica nada. Todos ellos se sirven también por REST en la testnet (consulta [Módulo RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module)); contra un nodo de mainnet los dos comandos nuevos responden `Not Implemented` hasta que mainnet aplique esa versión.

---

## abstractaccount

El módulo de cuentas abstractas está desactivado en mainnet (`config.enabled` es `false`, por lo que estas consultas no devuelven cuentas allí) y activado en la testnet por gobernanza (`config.enabled` es `true`; comprobado el 27 de octubre de 2026).

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` y `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` generan firmas de autenticador sin conexión. La semilla del autenticador nunca es un argumento: se lee de `--seed-file <file>` (o `-` para la entrada estándar), de la variable de entorno `QORE_AUTH_SEED` o de un aviso sin eco, y `auth-keygen` la escribe en un nuevo archivo `0600` (`--out`) en lugar de imprimirla.

---

## gasabstraction

Las consultas de abstracción de gas se sirven en ambas redes desde v3.2.2:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

La lista de tokens aceptados contiene solo `uqor` nativo en ambas redes, así que las comisiones se pagan en `uqor` y no se realiza ninguna conversión; la gobernanza decide qué otros tokens se aceptan. REST: `/qorechain/gasabstraction/v1/config`, `/conversion_rate?denom=`, `/float`. Consulta [Abstracción de gas](/user-guide/gas-abstraction).

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

En el momento de escribir esto no existe ningún pool en ninguna de las dos redes. En la testnet, los tres tokens de prueba Fest están disponibles como segunda denominación de un pool (consulta [Tokens de prueba de testnet](/api-reference/rest-grpc-endpoints#fest-tokens)).

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

El módulo de niveles de staking forma parte de la versión **v3.2.4**: se ejecuta en la testnet desde el 19 de octubre de 2026 y en mainnet desde el 23 de octubre de 2026 (altura 3,742,566, propuesta de gobernanza 13). Un nodo en una versión anterior responde a estas consultas con `Not Implemented`. REST: `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. Consulta [Comandos de transacción](/cli-reference/transaction-commands#stakingtier).

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

`query upgrade applied <name>` es la forma de leer cuándo entró en vigor una actualización: en mainnet `v3.2.2` se aplicó en la altura 3,556,788, `v3.2.3` en la altura 3,662,051, `v3.2.4` en la altura 3,742,566 y `v3.2.5` en la altura 3,906,833; en la testnet `v3.2.2` en 6,905,034, `v3.2.3` en 8,003,746 y `v3.2.4` en 8,337,253, `v3.2.5` en 8,890,800 y `v3.2.6` en 8,970,638 (`0` significa no aplicada; en mainnet `v3.2.6` es `0` en el momento de escribir esto). La lista del circuit breaker de mainnet (`disabled-list`) contiene actualmente los mensajes de creación de cuentas de vesting, el almacenamiento e instanciación de QoreChain Native, la pausa y reanudación de pools AMM, la llamada cross-VM, la actualización del estado de capa multilayer, la deprecación y deshabilitación de algoritmos PQC, y los mensajes de gobernanza de consenso PRISM; la de la testnet contiene solo el mensaje `MsgStoreCode` de QoreChain Native (comprobado el 27 de octubre de 2026; la instanciación fue permitida por la gobernanza de testnet).

---

## evm, erc20, wasm

Los comandos `wasm` leen QoreChain Native, el nombre que QoreChain da a su runtime de contratos inteligentes CosmWasm; los nombres de comandos y módulos conservan la grafía `wasm`.

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

`query erc20 token-pairs` está vacío en mainnet; en la testnet lista los tres tokens de prueba Fest (fUSD, fETH, fBTC) y un token IBC. Sus denominaciones de bank son `erc20:` más la dirección de contrato EIP-55 y distinguen mayúsculas de minúsculas; consulta [Tokens de prueba Fest de testnet](/developer-guide/evm-development#fest-tokens). En la testnet, `query wasm params` muestra `code_upload_access` `Nobody` e `instantiate_default_permission` `Everybody`; en mainnet ambos son `Nobody` (consulta [Desarrollo en QoreChain Native](/developer-guide/cosmwasm-development)).

---

## Módulos sin CLI

`xqore`, `babylon` y `fairblock` no tienen comandos de transacción ni de consulta. No se pueden usar desde la CLI ni desde ninguna API pública por el momento.
