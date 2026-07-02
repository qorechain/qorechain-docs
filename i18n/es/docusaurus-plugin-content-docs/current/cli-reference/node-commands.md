---
slug: /cli-reference/node-commands
title: Comandos de nodo
sidebar_label: Comandos de nodo
sidebar_position: 1
---

# Comandos de nodo

Referencia de los comandos `qorechaind` usados para inicializar, configurar y operar un nodo de QoreChain.

:::note
QoreChain ejecuta dos redes: la mainnet **`qorechain-vladi`** (en vivo desde el 7 de junio de 2026 en la versión de cadena **v3.1.82**) y la testnet **`qorechain-diana`**. Pase el `--chain-id` apropiado para la red a la que pretenda unirse — los ejemplos siguientes apuntan a la testnet; use `--chain-id qorechain-vladi` para mainnet.
:::

---

## init

Inicializa un nuevo nodo con el moniker indicado.

```bash
qorechaind init <moniker> --chain-id qorechain-diana
```

| Flag          | Tipo   | Descripción                                    |
| ------------- | ------ | ---------------------------------------------- |
| `--chain-id`  | string | Identificador de la cadena (requerido)         |
| `--home`      | string | Directorio home del nodo (por defecto: `~/.qorechaind`) |
| `--overwrite` | bool   | Sobrescribir los archivos genesis y de configuración existentes |

Crea la estructura de directorios bajo `--home` con `config/`, `data/` y un `genesis.json` inicial.

---

## start

Inicia el nodo y comienza a sincronizar o producir bloques.

```bash
qorechaind start [flags]
```

| Flag                   | Tipo   | Descripción                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `--home`               | string | Directorio home del nodo                             |
| `--minimum-gas-prices` | string | Precios mínimos de gas a aceptar (p. ej., `0.001uqor`) |
| `--pruning`            | string | Estrategia de poda: `default`, `nothing`, `everything` |
| `--halt-height`        | uint   | Detener el nodo en esta altura de bloque             |
| `--halt-time`          | uint   | Detener el nodo en esta marca de tiempo Unix         |
| `--log_level`          | string | Verbosidad del log: `info`, `debug`, `warn`, `error` |
| `--trace`              | bool   | Habilitar el seguimiento completo de la pila en errores |

---

## version

Imprime la versión del binario `qorechaind` y la información de compilación.

```bash
qorechaind version
```

Use `--long` para detalles de compilación extendidos, incluyendo la versión de Go, el hash del commit y las etiquetas de compilación:

```bash
qorechaind version --long
```

---

## status

Consulta el nodo en ejecución para conocer su estado actual, incluyendo el estado de sincronización, la última altura de bloque y la información de consenso.

```bash
qorechaind status
```

| Flag     | Tipo   | Descripción                                     |
| -------- | ------ | ----------------------------------------------- |
| `--node` | string | Endpoint RPC (por defecto: `tcp://localhost:26657`) |

Devuelve JSON con las secciones `node_info`, `sync_info` y `validator_info`.

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
| ---------------------- | ------ | ----------------------------------------------- |
| `--keyring-backend`    | string | Backend: `os`, `file`, `test`                   |
| `--algo`               | string | Algoritmo de clave: `secp256k1` (por defecto), `ed25519` |
| `--recover`            | bool   | Recuperar la clave a partir de un mnemónico     |
| `--multisig`           | string | Lista de claves separadas por comas para multisig |
| `--multisig-threshold` | uint   | Mínimo de firmas requeridas                     |

### Listar todas las claves

```bash
qorechaind keys list --keyring-backend <backend>
```

### Mostrar detalles de una clave

```bash
qorechaind keys show <name> [flags]
```

| Flag        | Tipo   | Descripción                         |
| ----------- | ------ | ----------------------------------- |
| `--bech`    | string | Formato de salida: `acc`, `val`, `cons` |
| `--address` | bool   | Mostrar solo la dirección           |
| `--pubkey`  | bool   | Mostrar solo la clave pública       |

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

Gestiona el archivo genesis.

### Añadir una cuenta genesis

```bash
qorechaind genesis add-genesis-account <address> <coins> [flags]
```

| Flag                 | Tipo   | Descripción                       |
| -------------------- | ------ | --------------------------------- |
| `--vesting-amount`   | string | Monto de vesting                  |
| `--vesting-end-time` | int    | Hora de fin del vesting (marca de tiempo Unix) |

### Crear una transacción genesis

```bash
qorechaind genesis gentx <key-name> <stake-amount> [flags]
```

| Flag                    | Tipo   | Descripción             |
| ----------------------- | ------ | ----------------------- |
| `--chain-id`            | string | Identificador de la cadena |
| `--moniker`             | string | Moniker del validador   |
| `--commission-rate`     | string | Tasa de comisión inicial |
| `--commission-max-rate` | string | Tasa de comisión máxima |

### Recopilar transacciones genesis

```bash
qorechaind genesis collect-gentxs
```

### Validar el archivo genesis

```bash
qorechaind genesis validate-genesis
```

---

## Motor de consenso

Estos subcomandos interactúan con la capa del Motor de Consenso de QoreChain.

### Mostrar la clave del validador

```bash
qorechaind comet show-validator
```

Genera la clave pública de consenso en formato JSON. Se usa para verificar la identidad del validador.

### Mostrar el ID del nodo

```bash
qorechaind comet show-node-id
```

Genera el identificador del nodo P2P (codificado en hex). Se usa para la configuración de peers persistentes.

---

## export

Exporta el estado actual de la cadena como un archivo genesis JSON. Útil para actualizaciones de cadena o snapshots.

```bash
qorechaind export [flags]
```

| Flag                | Tipo   | Descripción                               |
| ------------------- | ------ | ----------------------------------------- |
| `--for-zero-height` | bool   | Preparar la exportación para reiniciar en la altura 0 |
| `--height`          | int    | Exportar el estado en una altura de bloque específica |
| `--home`            | string | Directorio home del nodo                  |

---

## rollback

Revierte el estado de la cadena un bloque. Útil para recuperarse de un fallo de consenso.

```bash
qorechaind rollback [flags]
```

| Flag     | Tipo   | Descripción                                        |
| -------- | ------ | -------------------------------------------------- |
| `--hard` | bool   | Eliminar también el último bloque del almacén de bloques |
| `--home` | string | Directorio home del nodo                           |

Este comando revierte tanto el estado de la aplicación como el estado de consenso. Úselo con precaución, ya que no se puede deshacer.
