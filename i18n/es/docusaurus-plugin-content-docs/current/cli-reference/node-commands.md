---
slug: /cli-reference/node-commands
title: Comandos del nodo
sidebar_label: Comandos del nodo
sidebar_position: 1
---

# Comandos del nodo

Referencia de los comandos `qorechaind` utilizados para inicializar, configurar y operar un nodo de QoreChain.

:::note
QoreChain opera dos redes: la mainnet **`qorechain-vladi`** (activa desde el 7 de junio de 2026; versión del nodo **v3.2.3**, aplicada en la altura 3,662,051 el 20 de octubre de 2026; la mainnet ejecuta la v3.2.3 hasta la altura 3,742,566 y la **v3.2.4** desde ese bloque, programada por la propuesta de gobernanza 13) y la testnet **`qorechain-diana`** (versión del nodo **v3.2.4**, aplicada en la altura 8,337,253 el 19 de octubre de 2026). Indica el `--chain-id` correspondiente a la red a la que quieras unirte — los ejemplos a continuación apuntan a la testnet; usa `--chain-id qorechain-vladi` para la mainnet. La versión actual de cada red figura en `latest.json`, en [download.qore.host](https://download.qore.host).

Los comandos de esta página se comprobaron con el binario de la versión v3.2.3. El binario v3.2.4 añade comandos que un binario v3.2.3 no tiene (por ejemplo `stakingtier`); se ejecutan en la testnet ahora y en la mainnet desde la altura 3,742,566, y cuando este manual menciona uno, lo indica.
:::

---

## init

Inicializa un nuevo nodo con el moniker indicado.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Tipo   | Descripción                                    |
| ------------- | ------ | ----------------------------------------------- |
| `--chain-id`  | string | Identificador de la cadena (indícalo siempre; si se omite, se crea uno aleatorio) |
| `--home`      | string | Directorio home del nodo (por defecto: `~/.qorechaind`) |
| `--overwrite` | bool   | Sobrescribir el `genesis.json` existente |
| `--recover`   | bool   | Proporcionar una frase semilla para recuperar una clave existente en lugar de crear una nueva |

Crea la estructura de directorios bajo `--home` con `config/`, `data/` y un `genesis.json` inicial. Para un nodo de red, sustituye ese `genesis.json` por el archivo de genesis de la red antes de iniciar (consulta [Conectarse a la Mainnet](/getting-started/connecting-to-mainnet)).

`init` también escribe el ID de cadena EVM de la red (`9801` para `qorechain-vladi`, `9800` para `qorechain-diana`) en el ajuste `evm-chain-id` de `app.toml`, así que indica el `--chain-id` correcto.

---

## start

Inicia el nodo y comienza a sincronizar o producir bloques.

```bash
qorechaind start [flags]
```

| Flag                   | Tipo   | Descripción                                          |
| ---------------------- | ------ | ------------------------------------------------------ |
| `--home`               | string | Directorio home del nodo                                |
| `--minimum-gas-prices` | string | Precio mínimo de gas que acepta este nodo. El mínimo de la red es `0.1uqor`; establece al menos ese valor |
| `--pruning`            | string | Estrategia de poda: `default`, `nothing`, `everything`, `custom` (con `--pruning-keep-recent` y `--pruning-interval`) |
| `--halt-height`        | uint   | Detener el nodo en esta altura de bloque                |
| `--halt-time`          | uint   | Detener el nodo en esta marca de tiempo Unix             |
| `--log_level`          | string | Verbosidad del registro: `info`, `debug`, `warn`, `error` |
| `--trace`              | bool   | Habilitar traza completa de pila en caso de errores      |

Un binario compilado a partir del árbol de código fuente público (la compilación de la comunidad) se niega a iniciarse en `qorechain-vladi` o `qorechain-diana`: no puede verificar firmas poscuánticas ni reproducir fielmente los bloques de las redes (versión del nodo v3.2.3 y posteriores). Usa el binario de la versión publicado en [download.qore.host](https://download.qore.host); consulta [Compilar desde el código fuente](/developer-guide/building-from-source).

---

## version

`qorechaind version` **no** informa del número de versión en los binarios de las versiones publicadas: imprime una línea vacía, y `version --long` no añade detalles de compilación. No cuentes con él para distinguir versiones. Para confirmar qué ejecutas:

- Compara el SHA-256 del **archivo descargado** con `binary.sha256` en el [manifiesto](https://download.qore.host/mainnet/latest.json) de la red antes de extraerlo (y conserva ese archivo, o su checksum, como registro de lo que instalaste).
- Pregunta a la cadena qué actualizaciones ha aplicado: `GET /cosmos/upgrade/v1beta1/applied_plan/<upgrade_name>` devuelve la altura en la que se aplicó una actualización, o `0` si no se ha aplicado.

```bash
# archive checksum, as published
curl -s https://download.qore.host/mainnet/latest.json | jq -r '.version, .binary.sha256'
# has v3.2.3 been applied on mainnet, and at which height?
curl -s https://api.qore.host/cosmos/upgrade/v1beta1/applied_plan/v3.2.3   # {"height":"3662051"}
```

---

## status

Consulta al nodo en ejecución su estado actual, incluyendo el estado de sincronización, la altura del último bloque y la información de consenso.

```bash
qorechaind status
```

| Flag     | Tipo   | Descripción                                     |
| -------- | ------ | ------------------------------------------------- |
| `--node` | string | Endpoint RPC (por defecto: `tcp://localhost:26657`) |

Devuelve un JSON con las secciones `node_info`, `sync_info` y `validator_info`.

---

## client configuration

No existe un subcomando `config`. Los valores por defecto del cliente (`chain-id`, `keyring-backend`, `output`, `node`) se leen de `<home>/config/client.toml`; edita ese archivo o indica el flag en cada comando (`--chain-id`, `--keyring-backend`, `--output`, `--node`).

---

## keys

Gestiona el keyring local para firmar transacciones.

### Añadir una nueva clave

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Tipo   | Descripción                                     |
| ---------------------- | ------ | -------------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `kwallet`, `pass`, `test`, `memory` |
| `--key-type`           | string | Algoritmo de clave: `secp256k1` (por defecto) o `eth_secp256k1` |
| `--coin-type`          | uint32 | Coin type HD (por defecto `118`)                    |
| `--recover`            | bool   | Recuperar la clave a partir de la frase mnemónica    |
| `--multisig`           | string | Lista de claves separadas por comas para multisig    |
| `--multisig-threshold` | uint   | Número mínimo de firmas requeridas                   |

### Listar todas las claves

```bash
qorechaind keys list --keyring-backend <backend>
```

### Mostrar detalles de una clave

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Tipo   | Descripción                          |
| ----------- | ------ | --------------------------------------- |
| `--bech`    | string | Formato de salida: `acc`, `val`, `cons` |
| `--address` | bool   | Mostrar solo la dirección                |
| `--pubkey`  | bool   | Mostrar solo la clave pública             |

### Eliminar una clave

```bash
qorechaind keys delete <name> --keyring-backend <backend>
```

### Exportar una clave (cifrada con armor)

```bash
qorechaind keys export <name>
```

### Importar una clave

```bash
qorechaind keys import <name> <keyfile>
```

---

## genesis

Gestiona el archivo de genesis.

### Añadir una cuenta de genesis

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Flag                 | Tipo   | Descripción                                |
| -------------------- | ------ | --------------------------------------------- |
| `--vesting-amount`   | string | Monto de vesting                               |
| `--vesting-start-time` | int  | Hora de inicio del vesting (marca de tiempo Unix) |
| `--vesting-end-time` | int    | Hora de finalización del vesting (marca de tiempo Unix) |

### Crear una transacción de genesis

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Tipo   | Descripción                  |
| ----------------------- | ------ | -------------------------------- |
| `--chain-id`            | string | Identificador de la cadena         |
| `--moniker`             | string | Moniker del validador               |
| `--commission-rate`     | string | Tasa de comisión inicial            |
| `--commission-max-rate` | string | Tasa de comisión máxima             |

### Recopilar transacciones de genesis

```bash
qorechaind genesis collect-gentxs
```

Otros subcomandos de `genesis`: `bulk-add-genesis-account` y `migrate`.

### Validar el archivo de genesis

```bash
qorechaind genesis validate
```

---

## Motor de consenso

Estos subcomandos interactúan con la capa del motor de consenso de QoreChain.

### Mostrar clave del validador

```bash
qorechaind comet show-validator
```

Muestra la clave pública de consenso en formato JSON. Se usa para verificar la identidad del validador.

### Mostrar ID del nodo

```bash
qorechaind comet show-node-id
```

Muestra el identificador P2P del nodo (codificado en hexadecimal). Se usa para la configuración de pares persistentes.

---

## export

Exporta el estado actual de la cadena como un archivo de genesis JSON. Útil para actualizaciones de la cadena o snapshots.

```bash
qorechaind export [flags]
```

| Flag                | Tipo   | Descripción                               |
| ------------------- | ------ | --------------------------------------------- |
| `--for-zero-height` | bool   | Preparar la exportación para reiniciar en la altura 0 |
| `--height`          | int    | Exportar el estado en una altura de bloque específica |
| `--home`            | string | Directorio home del nodo                       |
| `--output-document` | string | Escribir la exportación en este archivo en lugar de STDOUT |
| `--modules-to-export` | strings | Lista de módulos a exportar separados por comas (por defecto: todos) |
| `--jail-allowed-addrs` | strings | Direcciones de operador de los validadores encarcelados (jailed) que se van a liberar |

---

## rollback

Revierte el estado de la cadena un bloque. Útil para recuperarse de un fallo de consenso.

```bash
qorechaind rollback [flags]
```

| Flag     | Tipo   | Descripción                                              |
| -------- | ------ | ------------------------------------------------------------ |
| `--hard` | bool   | Eliminar también el último bloque del almacén de bloques      |
| `--home` | string | Directorio home del nodo                                       |

Este comando revierte tanto el estado de la aplicación como el estado de consenso. Úsalo con precaución, ya que no se puede deshacer.
