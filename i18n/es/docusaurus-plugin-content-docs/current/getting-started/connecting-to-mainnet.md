---
slug: /getting-started/connecting-to-mainnet
title: Conexión a la red principal
sidebar_label: Conexión a la red principal
sidebar_position: 3
---

# Conexión a la red principal

Únete a la red principal activa QoreChain Vladi configurando tu nodo con el archivo génesis, los pares y la configuración de red correctos.

:::note
Esta página cubre la red principal **`qorechain-vladi`** (ID de cadena EVM **9801**, hex `0x2649`), activa desde el **7 de junio de 2026 a las 23:59 UTC** ejecutando la versión de cadena **v3.1.80** sobre Cosmos SDK v0.53. Para la red de pruebas **`qorechain-diana`** (ID de cadena EVM **9800**), consulta [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) y ensaya allí tu configuración antes de ponerla en producción.
:::

:::warning
Los nodos semilla de la red principal, los pares persistentes, la URL del génesis y su suma de comprobación SHA-256 se publican con cada lanzamiento oficial de la red principal. **Obtén siempre estos valores actuales del repositorio/lanzamiento oficial de la red principal** y verifica la suma de comprobación del génesis antes de empezar. Los marcadores de posición a continuación (`<MAINNET_SEED_NODE_ID>@<host>:26656`, URL del génesis, URLs de instantáneas) deben sustituirse por los valores reales publicados — no inicies un nodo de la red principal contra pares o un génesis no verificados.
:::

---

## Instalación

Instala el binario `qorechaind` ya sea compilándolo desde el código fuente o descargando la imagen oficial de Docker.

### Compilar desde el código fuente

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Consulta [Compilar desde el código fuente](/developer-guide/building-from-source) para conocer todos los requisitos previos (Go 1.26+, CGO, cadena de herramientas de Rust, bibliotecas nativas).

### Inicializar el nodo

```bash
./qorechaind init my-node --chain-id qorechain-vladi
```

Esto crea la configuración y los directorios de datos por defecto en `~/.qorechaind/`.

---

## Descargar el génesis

Reemplaza tu archivo génesis local por el génesis oficial de la red principal:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  <MAINNET_GENESIS_URL>
```

Verifica la suma de comprobación del génesis con el valor publicado en el lanzamiento oficial de la red principal antes de continuar:

```bash
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

Este archivo define el estado inicial de la red principal Vladi, incluido el conjunto de validadores génesis, las asignaciones de tokens (TGE en el génesis) y los parámetros de los módulos.

:::note
`<MAINNET_GENESIS_URL>` y `<MAINNET_GENESIS_SHA256>` son marcadores de posición. Obtén la URL actual del génesis y su suma de comprobación SHA-256 del lanzamiento/repositorio oficial de la red principal y verifica que la suma de comprobación coincida antes de iniciar tu nodo.
:::

---

## Configurar los pares

Edita la configuración de tu nodo para conectarte a los pares existentes de la red principal.

Abre `~/.qorechaind/config/config.toml` y configura los campos `seeds` y `persistent_peers`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Los valores de semilla y de pares persistentes anteriores son marcadores de posición. Obtén el id del nodo semilla actual de la red principal, el host y el puerto del repositorio/lanzamiento oficial de la red principal. No te conectes a pares no verificados.
:::

### Ajustes recomendados

Es posible que también quieras ajustar lo siguiente en `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Estos valores están ajustados para los tiempos de bloque y el rendimiento de la red principal Vladi.

---

## Iniciar el nodo

Lanza tu nodo para empezar a sincronizar con la red:

```bash
./qorechaind start
```

El nodo se conecta a los pares y comienza a descargar bloques desde el génesis. El tiempo de sincronización inicial depende de la altura actual de la cadena y de la velocidad de tu red. Para un arranque más rápido, los operadores suelen usar la sincronización de estado o una instantánea reciente — consulta [Ejecutar un nodo](/developer-guide/running-a-node) para conocer el flujo completo de sincronización de estado e instantáneas.

---

## Comprobar el estado de sincronización

Verifica que tu nodo se esté poniendo al día con el último bloque:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — El nodo todavía se está sincronizando. Espera a que se ponga al día.
* `false` — El nodo está totalmente sincronizado y procesando bloques nuevos.

También puedes comprobar la última altura de bloque:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Confirma que estás en la red correcta — el campo `network` debe reportar `qorechain-vladi`:

```bash
curl localhost:26657/status | jq '.result.node_info.network'
```

---

## Monitorización

QoreChain expone varios endpoints para monitorizar la salud y el rendimiento del nodo.

### Métricas de Prometheus

Las métricas en bruto están disponibles en:

```
http://localhost:26660/metrics
```

Estas métricas pueden ser recopiladas por cualquier colector compatible con Prometheus.

### Paneles de Grafana

Si lo ejecutas mediante Docker Compose, Grafana está disponible en:

```
http://localhost:3001
```

En el primer inicio de sesión, establece tus propias credenciales cuando se te solicite — no dejes las predeterminadas. Los paneles preconfigurados muestran la producción de bloques, el rendimiento de transacciones, las conexiones de pares y el uso de recursos.

### Comprobación de estado REST

La API REST proporciona un endpoint de estado rápido:

```
http://localhost:1317
```

---

## Referencia de puertos

| Puerto    | Protocolo  | Descripción                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — consultar y difundir transacciones                  |
| `26656` | TCP       | P2P — comunicación de red entre pares                |
| `1317`  | HTTP      | API REST — consultar el estado de la cadena vía HTTP                   |
| `9090`  | gRPC      | API gRPC — acceso programático a la cadena                    |
| `8545`  | HTTP      | JSON-RPC de EVM — RPC compatible con Ethereum (ID de cadena `9801`) |
| `8546`  | WebSocket | WebSocket de EVM — suscripciones a eventos EVM en tiempo real       |
| `8899`  | HTTP      | RPC de SVM — RPC compatible con Solana                         |
| `26660` | HTTP      | Endpoint de métricas de Prometheus                             |

---

## Datos de la red

| Campo             | Valor                                  |
| ----------------- | -------------------------------------- |
| ID de cadena          | `qorechain-vladi`                      |
| ID de cadena EVM      | `9801` (hex `0x2649`)                  |
| Versión de cadena     | v3.1.80                                |
| Activa desde        | 7 de junio de 2026 23:59 UTC                  |
| Token             | QOR (`uqor`, 10^6 microunidades = 1 QOR) |
| Prefijo de cuenta    | `qor`                                  |
| Prefijo de validador  | `qorvaloper`                           |
| SDK               | Cosmos SDK v0.53                       |

---

## Próximos pasos

* [Ejecutar un nodo](/developer-guide/running-a-node) — Opera un nodo completo/RPC para exchanges e integradores
* [Ejecutar un validador](/developer-guide/running-a-validator) — Crea y opera un validador
* [Configuración de la cartera](/getting-started/wallet-setup) — Configura una cartera para la red principal
* [Tu primera transacción](/getting-started/first-transaction) — Envía tu primera transferencia de QOR
* [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) — Únete a la red de pruebas Diana para pruebas gratuitas
* [Redes](/appendix/networks) — IDs de cadena, puertos y la referencia completa de redes
