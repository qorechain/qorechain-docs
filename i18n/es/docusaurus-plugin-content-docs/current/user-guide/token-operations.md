---
slug: /user-guide/token-operations
title: Operaciones con Tokens
sidebar_label: Operaciones con Tokens
sidebar_position: 1
---

# Operaciones con Tokens

Esta guía cubre el token QOR, cómo enviar y recibir tokens, consultar saldos y comprender el modelo de distribución de comisiones en QoreChain.

:::note
Los comandos siguientes utilizan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 y ejecuta la versión **v3.2.5** desde el 29 de octubre de 2026 (v3.2.4 desde el 23 de octubre); la testnet ejecuta **v3.2.6** (desde el 27 de octubre de 2026) — sustituye el chain ID y los endpoints de mainnet de la página **Conectarse a la Mainnet** cuando realices transacciones en mainnet.
:::

:::caution Firma con `tx pqc cosign`
La mainnet y la testnet exigen una firma híbrida post-cuántica en cada transacción de la lane Cosmos, por lo que los comandos de esta página no se difunden tal como están escritos. Añade `--generate-only > tx.json` a un comando y luego ejecuta `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Consulta [Firma híbrida](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/overview) y el [Dashboard](/dashboard/overview) realizan esta firma por ti.
:::

## Información del Token

| Propiedad                 | Valor                         |
| ------------------------ | ----------------------------- |
| **Denominación de Visualización** | QOR                           |
| **Denominación Base**    | uqor                          |
| **Conversión**           | 1 QOR = 1,000,000 uqor (10^6) |
| **Chain ID**             | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Prefijo Bech32**        | `qor` (p. ej., `qor1abc...xyz`) |

Todos los importes on-chain se denominan en **uqor**. Al enviar transacciones, especifica siempre los importes en uqor.

## Enviar Tokens

Para transferir tokens QOR de una cuenta a otra:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Ejemplo:** Enviar 5 QOR (5,000,000 uqor) a otra dirección:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

También puedes usar un nombre de clave en lugar de una dirección sin procesar para el remitente:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

## Consultar Saldos

Comprueba el saldo de cualquier cuenta:

```bash
qorechaind query bank balances <address>
```

**Ejemplo:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**Salida de ejemplo:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

Esto indica que la cuenta tiene 15 QOR (15,000,000 uqor).

## Estructura de Comisiones

Las comisiones de transacción en QoreChain se distribuyen entre cinco destinos para alinear los incentivos de la red:

| Destino     | Cuota | Propósito                                                         |
| --------------- | ----- | --------------------------------------------------------------- |
| **Validadores**  | 37%   | Recompensa a los productores de bloques y asegura la red                 |
| **Quemado**      | 30%   | Eliminado permanentemente del suministro |
| **Tesorería**    | 20%   | Financia el desarrollo del protocolo y las subvenciones del ecosistema                 |
| **Stakers**     | 10%   | Distribuido proporcionalmente entre todos los delegadores                    |
| **Nodos Ligeros** | 3%    | Recompensas de nodos ligeros (consulta la nota siguiente)            |

El reparto se aplica a todo lo que entra en el fee collector, que contiene las comisiones de transacción y la emisión de staking acuñada en cada época. La cuota de nodos ligeros se acumula en el pool de recompensas de nodos ligeros; el registro está abierto y sujeto a licencia; el 27 de octubre de 2026 se registró un nodo ligero en cada red (consulta [Nodo Ligero](/light-node/overview#reward-program-status)). Desde la actualización v3.2.0, la cuota de los stakers se paga como una recompensa de staking normal (consulta [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).

## Canales de Quema

El módulo de quema de QoreChain define 12 fuentes de quema. El QOR quemado a través de cualquiera de ellas se elimina permanentemente de la circulación. En mainnet, hasta ahora solo los canales de comisiones de gas y de transacciones fallidas han registrado quemas; los demás están definidos pero no han registrado nada. Desde v3.2.4 (testnet desde el 19 de octubre de 2026, mainnet desde el 23 de octubre de 2026) hay una decimotercera fuente, `staking_tier_penalty`, para el módulo opcional de staking con bloqueo temporal.

| Canal              | Descripción                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `gas_fee`          | Se quema el 30% de todas las comisiones de gas                                  |
| `contract_create`  | Comisión fija de 100 QOR quemada por cada creación de contrato (inactivo: la subida de QoreChain Native está cerrada) |
| `ai_service`       | Se quema el 50% de las comisiones de servicios de IA (inactivo: las comisiones de servicios de IA no están activas) |
| `bridge_fee`       | Se quema el 100% de las comisiones del bridge (inactivo: el bridge no está activo) |
| `treasury_buyback` | Recompra y quema periódica desde la tesorería                                  |
| `failed_tx`        | 10% del gas de las transacciones fallidas; la cadena lo aplica desde v3.2.2         |
| `xqore_penalty`    | Penalizaciones de salida anticipada de xQORE canalizadas mediante quema (xQORE no está activo) |
| `auto_buyback`     | Quemas automatizadas a nivel de protocolo (inactivo)                           |
| `tge`              | Reservado; la quema del TGE ocurrió antes del génesis y este canal no registra nada |
| `rollup_create`    | Se quema el 1% del stake de creación del rollup                                |
| `milestone`        | Quemas programadas en recuentos acumulados fijos de transacciones (todavía ninguna activada) |
| `amm`              | Reservado para comisiones de protocolo del AMM (ninguna registrada)            |

El módulo de quema no tiene consulta por CLI; lee la quema acumulada por fuente desde REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

La respuesta lista `total_burned` y `burns_by_source` (en uqor). El suministro total actual se obtiene con `qorechaind query bank total-supply-of uqor`.

## Consejos

:::caution
Verifica siempre dos veces las direcciones de los destinatarios antes de enviar tokens. Las transacciones en QoreChain son irreversibles.
:::

:::tip

* Usa el flag `--dry-run` para simular una transacción sin difundirla.
* Establece `--gas` explícitamente (400,000 es suficiente para una transferencia con firma híbrida).
* El mínimo de comisión es de **0.1 uqor por unidad de gas**, por lo que un límite de gas de 400,000 requiere al menos **40,000 uqor**.

:::
