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
Las consultas se ejecutan contra el nodo al que apunte `--node`. Utiliza un endpoint RPC de mainnet **`qorechain-vladi`** para datos en vivo (por ejemplo `--node https://rpc.qore.host:443`), o un endpoint de testnet **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) para pruebas. El valor por defecto `tcp://localhost:26657` apunta a un nodo que ejecutas tú mismo. Mainnet ejecuta la versión de nodo v3.2.1 y la testnet v3.2.2; la testnet puede servir algunas rutas adicionales que mainnet aún no tiene, por lo que una consulta que funciona allí puede devolver `Not Implemented` en mainnet.
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
```

- `algorithm` acepta un nombre de algoritmo (`dilithium5`, `mlkem1024`) o un ID numérico.
- `migration` acepta un **ID de algoritmo** (por ejemplo `1`), no una dirección, e informa `No active migration` cuando no hay ninguna en curso.
- `evm-window` muestra si la dirección tiene una ventana de autorización abierta en la vía EVM y cuántos bloques, transacciones y valor quedan (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.

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

`stranded_rewards` informa la parte de los stakers que se depositó en el módulo de distribución sin respaldar ningún derecho, tal como se registró en la actualización a v3.2.0 (`reserved`, `released`, `snapshot_height`). Solo puede liberarse mediante una votación de gobernanza.

---

## mint e inflation

`qorechaind query mint params|inflation|annual-provisions` lee el módulo mint estándar, cuya tasa es `0` en ambas redes; **no** informa el calendario de emisión del protocolo. No existe el comando `query inflation`.

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

`reward-pool` muestra cómo se divide el saldo de recompensas del módulo en `reserved`, `outstanding`, `payable` y `distributable`.

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

`config` muestra los parámetros del módulo (stake mínimo, tasa de quema en la creación, ventana de desafío, límites de DA). `suggest-profile <use_case>` no consulta la cadena; solo imprime una referencia a un método JSON-RPC que los endpoints públicos no sirven, así que elige un perfil entre los [Perfiles predefinidos](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
```

---

## abstractaccount

El módulo de cuentas abstractas está actualmente desactivado en ambas redes (`config.enabled` es `false`), por lo que estas consultas no devuelven cuentas.

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` y `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` generan firmas de autenticador sin conexión. La semilla del autenticador nunca es un argumento: se lee de `--seed-file <file>` (o `-` para la entrada estándar), de la variable de entorno `QORE_AUTH_SEED` o de un aviso sin eco, y `auth-keygen` la escribe en un nuevo archivo `0600` (`--out`) en lugar de imprimirla.

---

## gasabstraction

Mainnet aún no sirve consultas de abstracción de gas (`qorechaind query gasabstraction ...` imprime su texto de ayuda y la ruta REST devuelve `Not Implemented`). Las comisiones se pagan solo en `uqor`; consulta [Abstracción de gas](/user-guide/gas-abstraction).

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

---

## evm, erc20, wasm

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

---

## Módulos sin CLI

`xqore`, `babylon` y `fairblock` no tienen comandos de transacción ni de consulta. No se pueden usar desde la CLI ni desde ninguna API pública por el momento.
