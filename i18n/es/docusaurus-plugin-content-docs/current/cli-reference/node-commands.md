---
slug: /cli-reference/node-commands
title: Comandos del nodo
sidebar_label: Comandos del nodo
sidebar_position: 1
---

# Comandos del nodo

Referencia de los comandos `qorechaind` utilizados para inicializar, configurar y operar un nodo de QoreChain.

:::note
QoreChain opera dos redes: la mainnet **`qorechain-vladi`** (activa desde el 7 de junio de 2026 en la versión de cadena **v3.1.95**) y la testnet **`qorechain-diana`**. Indica el `--chain-id` correspondiente a la red a la que quieras unirte — los ejemplos a continuación apuntan a la testnet; usa `--chain-id qorechain-vladi` para la mainnet.
:::

---

## init

Inicializa un nuevo nodo con el moniker indicado.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Tipo   | Descripción                                    |
| ------------- | ------ | ----------------------------------------------- |
| `--chain-id`  | string | Identificador de la cadena (obligatorio)         |
| `--home`      | string | Directorio home del nodo (por defecto: `~/.qorechaind`) |
| `--overwrite` | bool   | Sobrescribir los archivos de genesis y configuración existentes |

Crea la estructura de directorios bajo `--home` con `config/`, `data/` y un `genesis.json` inicial.

---

## start

Inicia el nodo y comienza a sincronizar o producir bloques.

```bash
qorechaind start [flags]
```

| Flag                   | Tipo   | Descripción                                          |
| ---------------------- | ------ | ------------------------------------------------------ |
| `--home`               | string | Directorio home del nodo                                |
| `--minimum-gas-prices` | string | Precios mínimos de gas a aceptar (p. ej., `0.001uqor`) |
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

## config

Lee o escribe valores en la configuración del nodo.

### Establecer un valor de configuración

```bash
qorechaind config set <key> <value>
```

### Obtener un valor de configuración

```bash
qorechaind config get <key>
```

Las claves de configuración comunes incluyen `chain-id`, `keyring-backend`, `output` y `node`.

---

## keys

Gestiona el keyring local para firmar transacciones.

### Añadir una nueva clave

```bash
qorechaind keys add <name> [flags]
```

| Flag                   | Tipo   | Descripción                                     |
| ---------------------- | ------ | -------------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `test`                       |
| `--algo`               | string | Algoritmo de clave: `secp256k1` (por defecto), `ed25519` |
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

### Validar el archivo de genesis

```bash
qorechaind genesis validate-genesis
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
