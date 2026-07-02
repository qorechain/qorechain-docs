---
slug: /getting-started/connecting-to-mainnet
title: Conexión a la red principal
sidebar_label: Conexión a la red principal
sidebar_position: 3
---

# Conexión a la red principal

Únete a la red principal activa QoreChain Vladi configurando tu nodo con el archivo génesis oficial, los pares y los ajustes de red.

:::note
Esta página cubre la red principal **`qorechain-vladi`** (ID de cadena EVM **9801**, hex `0x2649`), activa desde el **7 de junio de 2026 a las 23:59 UTC** y ejecutando la versión de cadena **v3.1.82** sobre Cosmos SDK v0.53. Para la red de pruebas **`qorechain-diana`** (ID de cadena EVM **9800**), consulta [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) y ensaya allí tu configuración antes de ponerla en producción.
:::

## Endpoints públicos

Si solo necesitas **consultar la cadena o transmitir transacciones**, no necesitas tu propio nodo — los endpoints públicos son:

| Servicio | URL |
|---|---|
| RPC de consenso | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` (ID de cadena `9801`) |
| JSON-RPC SVM (solo lectura) | `https://svm.qore.host` |
| Explorador de bloques | [explore.qore.network](https://explore.qore.network) |

Para cargas de trabajo intensivas o de producción (exchanges, indexadores), ejecuta tu propio nodo como se describe a continuación.

---

## Instalación

Instala el binario `qorechaind` desde el paquete precompilado oficial o compilándolo desde el código fuente.

### Paquete de binarios precompilados (linux/amd64)

El paquete de lanzamiento oficial contiene `qorechaind` junto con las bibliotecas compartidas que necesita (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`):

```bash
curl -fsSL https://download.qore.host/qorechaind-v3.1.82-linux-amd64.tar.gz -o qore.tgz
# Verify the checksum before installing:
sha256sum qore.tgz
# 8a88936ccc6d350d8b215488a81584163b3568430064958c50e82a394077cfe9

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

Los paquetes versionados se publican en [download.qore.host](https://download.qore.host); cada lanzamiento se distribuye con su suma de comprobación SHA-256.

### Compilar desde el código fuente

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Consulta [Compilar desde el código fuente](/developer-guide/building-from-source) para ver todos los requisitos previos (Go 1.26+, CGO, toolchain de Rust, bibliotecas nativas).

### Inicializar el nodo

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Esto crea la configuración predeterminada y los directorios de datos bajo `~/.qorechaind/`.

---

## Descargar el génesis

Reemplaza tu archivo génesis local por el génesis oficial de la red principal:

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json
```

El mismo archivo también lo sirve en vivo la propia cadena — puedes verificar la descarga contrastándola con él:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Este archivo define el estado inicial de la red principal Vladi, incluido el conjunto de validadores del génesis, las asignaciones de tokens (TGE en el génesis) y los parámetros de los módulos.

---

## Configurar los pares

Edita la configuración de tu nodo para conectarte a los nodos centinela públicos de la red principal.

Abre `~/.qorechaind/config/config.toml` y establece el campo `persistent_peers`:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Establece también el precio mínimo de gas en `~/.qorechaind/config/app.toml` (el mínimo de comisión de la red es **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### Ajustes recomendados

Es posible que también quieras ajustar lo siguiente en `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Estos valores están calibrados para los tiempos de bloque y el rendimiento de la red principal Vladi.

---

## Arranque rápido (instantánea)

Sincronizar desde el génesis puede llevar mucho tiempo. En [download.qore.host](https://download.qore.host) se publica una instantánea reciente de los datos de la cadena:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
# Verify before extracting:
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

Las instantáneas se publican con nombres de archivo que incluyen la altura del bloque — consulta [download.qore.host](https://download.qore.host) para encontrar la más reciente. Como alternativa, usa **state sync** — consulta [Ejecutar un nodo](/developer-guide/running-a-node) para ver el flujo de trabajo completo.

---

## Iniciar el nodo

Lanza tu nodo para comenzar a sincronizar con la red:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

El nodo se conecta a los pares y comienza a descargar bloques (desde el génesis, o desde la altura de la instantánea si restauraste una).

---

## Comprobar el estado de sincronización

Verifica que tu nodo se está poniendo al día con el último bloque:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — El nodo todavía está sincronizando. Espera a que se ponga al día.
* `false` — El nodo está completamente sincronizado y procesando nuevos bloques.

También puedes comprobar la altura del último bloque:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Confirma que estás en la red correcta — el campo `network` debe indicar `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Monitorización

QoreChain expone varios endpoints para monitorizar la salud y el rendimiento del nodo.

### Métricas de Prometheus

Las métricas sin procesar están disponibles en:

```
http://localhost:26660/metrics
```

Estas métricas pueden ser recolectadas por cualquier recolector compatible con Prometheus.

### Paneles de Grafana

Si lo ejecutas mediante Docker Compose, Grafana está disponible en:

```
http://localhost:3001
```

En el primer inicio de sesión, establece tus propias credenciales cuando se te solicite — no dejes las predeterminadas. Los paneles preconfigurados muestran la producción de bloques, el rendimiento de transacciones, las conexiones con pares y el uso de recursos.

### Comprobación de estado REST

La API REST proporciona un endpoint de estado rápido:

```
http://localhost:1317
```

---

## Referencia de puertos

| Puerto  | Protocolo | Descripción                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — consultar y transmitir transacciones              |
| `26656` | TCP       | P2P — comunicación de red entre pares                   |
| `1317`  | HTTP      | API REST — consultar el estado de la cadena vía HTTP    |
| `9090`  | gRPC      | API gRPC — acceso programático a la cadena              |
| `8545`  | HTTP      | JSON-RPC EVM — RPC compatible con Ethereum (ID de cadena `9801`) |
| `8546`  | WebSocket | WebSocket EVM — suscripciones a eventos EVM en tiempo real |
| `8899`  | HTTP      | RPC SVM — RPC compatible con Solana                     |
| `26660` | HTTP      | Endpoint de métricas de Prometheus                      |

---

## Datos de la red

| Campo                   | Valor                                  |
| ----------------------- | -------------------------------------- |
| ID de cadena            | `qorechain-vladi`                      |
| ID de cadena EVM        | `9801` (hex `0x2649`)                  |
| Versión de la cadena    | v3.1.82                                |
| Activa desde            | 7 de junio de 2026, 23:59 UTC          |
| Token                   | QOR (`uqor`, 10^6 microunidades = 1 QOR) |
| Precio mínimo de gas    | `0.1uqor`                              |
| Prefijo de cuentas      | `qor`                                  |
| Prefijo de validadores  | `qorvaloper`                           |
| SDK                     | Cosmos SDK v0.53                       |

---

## Próximos pasos

* [Ejecutar un nodo](/developer-guide/running-a-node) — Opera un nodo completo/RPC para exchanges e integradores
* [Guía para exchanges e integradores](/developer-guide/exchange-integration) — Depósitos, retiros y monitorización
* [Ejecutar un validador](/developer-guide/running-a-validator) — Crea y opera un validador
* [Configuración de la Billetera](/getting-started/wallet-setup) — Configura una billetera para la red principal
* [Primera transacción](/getting-started/first-transaction) — Envía tu primera transferencia de QOR
* [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) — Únete a la red de pruebas Diana para hacer pruebas gratuitas
* [Redes](/appendix/networks) — IDs de cadena, puertos y la referencia completa de redes
