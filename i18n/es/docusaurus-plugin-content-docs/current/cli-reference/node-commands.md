---
slug: /cli-reference/node-commands
title: Comandos del nodo
sidebar_label: Comandos del nodo
sidebar_position: 1
---

# Comandos del nodo

Referencia de los comandos `qorechaind` utilizados para inicializar, configurar y operar un nodo de QoreChain.

:::note
QoreChain opera dos redes: la mainnet **`qorechain-vladi`** (activa desde el 29 de junio de 2026; versión actual del nodo **v3.2.1**) y la testnet **`qorechain-diana`** (versión del nodo **v3.2.2**). Indica el `--chain-id` correspondiente a la red a la que quieras unirte — los ejemplos a continuación apuntan a la testnet; usa `--chain-id qorechain-vladi` para la mainnet. La versión actual de cada red figura en `latest.json`, en [download.qore.host](https://download.qore.host).
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
| `--pruning`            | string | Estrategia de poda: `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | Detener el nodo en esta altura de bloque                |
| `--halt-time`          | uint   | Detener el nodo en esta marca de tiempo Unix             |
| `--log_level`          | string | Verbosidad del registro: `info`, `debug`, `warn`, `error` |
| `--trace`              | bool   | Habilitar traza completa de pila en caso de errores      |

---

## version

Imprime la versión del binario `qorechaind` y la información de compilación.

```bash
qorechaind version
```

Usa `--long` para obtener detalles extendidos de compilación, incluyendo la versión de Go, el hash del commit y las etiquetas de build:

```bash
qorechaind version --long
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
