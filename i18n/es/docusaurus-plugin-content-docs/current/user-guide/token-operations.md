---
slug: /user-guide/token-operations
title: Operaciones con Tokens
sidebar_label: Operaciones con Tokens
sidebar_position: 1
---

# Operaciones con Tokens

Esta guía cubre el token QOR, cómo enviar y recibir tokens, consultar saldos y comprender el modelo de distribución de comisiones en QoreChain.

:::note
Los comandos siguientes utilizan la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) está activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.80** — sustituye el chain ID y los endpoints de mainnet de la página **Conectarse a la Mainnet** cuando realices transacciones en mainnet.
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
  --fees 500uqor
```

**Ejemplo:** Enviar 5 QOR (5,000,000 uqor) a otra dirección:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

También puedes usar un nombre de clave en lugar de una dirección sin procesar para el remitente:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
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
| **Quemado**      | 30%   | Eliminado permanentemente del suministro, creando presión deflacionaria |
| **Tesorería**    | 20%   | Financia el desarrollo del protocolo y las subvenciones del ecosistema                 |
| **Stakers**     | 10%   | Distribuido proporcionalmente entre todos los delegadores                    |
| **Nodos Ligeros** | 3%    | Recompensa a los operadores de nodos ligeros que sirven datos de la red            |

## Canales de Quema

QoreChain implementa un mecanismo de quema multicanal. Los tokens QOR se eliminan permanentemente de la circulación a través de 10 canales distintos:

| Canal              | Descripción                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `tx_fee`             | La porción de quema del 30% de cada comisión de transacción                       |
| `governance_penalty` | Quemado cuando las propuestas de gobernanza no alcanzan el quórum o son vetadas |
| `slashing_burn`      | Porción quemada de los stakes de validadores sancionados (slashed)                          |
| `bridge_fee`         | Comisión quemada en transferencias del bridge entre cadenas                             |
| `spam_deterrent`     | Quema adicional aplicada a transacciones marcadas como spam                |
| `epoch_excess`       | Emisiones excedentes por encima del objetivo, quemadas en los límites de época           |
| `manual_burn`        | Quemas de tokens iniciadas por la comunidad mediante propuesta de gobernanza               |
| `contract_callback`  | Comisiones quemadas en ejecuciones de callback de smart contracts                   |
| `cross_vm_fee`       | Quemado al ejecutar llamadas cross-VM (p. ej., EVM a CosmWasm)        |
| `rollup_create`      | 1% del stake mínimo quemado al desplegar un nuevo rollup          |

Puedes consultar el importe total quemado en todos los canales:

```bash
qorechaind query bank total --denom uqor
```

## Consejos

:::caution
Verifica siempre dos veces las direcciones de los destinatarios antes de enviar tokens. Las transacciones en QoreChain son irreversibles.
:::

:::tip

* Usa el flag `--dry-run` para simular una transacción sin difundirla.
* Usa `--gas auto` para que el nodo estime el gas necesario para tu transacción.
* La comisión mínima para una transferencia estándar es de **500 uqor**.

:::
