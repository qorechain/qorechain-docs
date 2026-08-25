---
slug: /getting-started/connecting-to-mainnet
title: Conexión a la Mainnet
sidebar_label: Conexión a la Mainnet
sidebar_position: 3
---

# Conexión a la Mainnet

Únete a la mainnet activa de QoreChain Vladi configurando tu nodo con el archivo genesis oficial, los peers y los ajustes de red.

:::note
Esta página cubre la mainnet **`qorechain-vladi`** (chain ID EVM **9801**, hex `0x2649`), activa desde el **7 de junio de 2026 23:59 UTC** y ejecutando la versión de cadena **v3.1.92** sobre Cosmos SDK v0.53. Para la testnet **`qorechain-diana`** (chain ID EVM **9800**), consulta [Conexión a la Testnet](/getting-started/connecting-to-testnet) y ensaya allí tu configuración antes de pasar a producción.
:::

## Endpoints públicos

Si solo necesitas **consultar la cadena o difundir transacciones**, no necesitas tu propio nodo; los endpoints públicos son:

| Servicio | URL |
|---|---|
| RPC de consenso | `https://rpc.qore.host` (WebSocket: `wss://rpc.qore.host/websocket`) |
| REST de Cosmos (LCD) | `https://api.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` (chain ID `9801`) |
| JSON-RPC SVM (solo lectura) | `https://svm.qore.host` |
| Explorador de bloques | [explore.qore.network](https://explore.qore.network) |

Para cargas de trabajo intensivas o de producción (exchanges, indexadores), ejecuta tu propio nodo tal como se describe a continuación.

---

## Instalación

Instala el binario `qorechaind` a partir del paquete prebuilt oficial o compilándolo desde el código fuente.

### Paquete de binario prebuilt (linux/amd64)

La fuente de verdad canónica para el binario actual es el **manifiesto de mainnet**, un archivo JSON actualizado en vivo en `https://download.qore.host/mainnet/latest.json`. Contiene la URL y el SHA-256 del binario actual, la URL/SHA-256/tamaño del genesis actual, las listas actuales de peers y seeds, el puerto P2P, un punto de confianza para state-sync y la versión mínima de cadena compatible. Descárgalo y usa sus valores en lugar de fijar en tus scripts de instalación una versión de binario o un checksum: quedan obsoletos en cuanto se publica una nueva versión:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib
```

El paquete contiene `qorechaind` junto con sus bibliotecas compartidas necesarias (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`).

:::caution Mantén tu nodo actualizado — se requiere v3.1.92 o superior para una sincronización nueva
Los nodos completos deben seguir la versión de cadena activa en la red: instala siempre el binario que indica el manifiesto, no fijes uno antiguo. Aparte del campo `minCompatible` del manifiesto, **se requiere v3.1.92 o superior para un nodo que se une desde cero (desde el genesis) o que se recupera de una interrupción**: las versiones anteriores no pueden completar una sincronización completa debido a un error de medición de gas ya corregido que detiene la reproducción en el primer bloque que contiene una transacción. Un nodo que ya está al día y ejecuta una versión anterior debería igualmente actualizarse en la primera oportunidad, ya que un nodo desactualizado no puede decodificar los tipos de transacción más nuevos y dejará de sincronizar en cuanto aparezca uno en un bloque.

**Comprueba qué está sirviendo realmente el manifiesto antes de confiar en él.** El manifiesto se promueve de forma deliberada (primero en testnet, en mainnet después de un período de estabilización), por lo que puede quedar por detrás del piso de versión indicado arriba; al momento de escribir esto, el propio manifiesto de mainnet todavía apunta a un binario anterior a v3.1.92, que es exactamente la versión que esta advertencia dice que no debes usar para una sincronización nueva. Compara el campo `"version"` del manifiesto con v3.1.92 antes de confiar en su `binary.url`; si sigue estando por detrás, obtén v3.1.92 (o posterior) desde las [publicaciones de GitHub de qorechain-core](https://github.com/qorechain/qorechain-core/releases) en su lugar (verifica el checksum del tag de la misma manera), o [compílalo desde el código fuente](/developer-guide/building-from-source).
:::

### Compilar desde el código fuente

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Consulta [Compilación desde el código fuente](/developer-guide/building-from-source) para ver todos los requisitos previos (Go 1.26+, CGO, toolchain de Rust, bibliotecas nativas).

### Inicializar el nodo

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

Esto crea los directorios de configuración y de datos por defecto en `~/.qorechaind/`.

---

## Descargar el genesis

Reemplaza tu archivo genesis local por el genesis oficial de mainnet, usando la URL y el SHA-256 del manifiesto descargado anteriormente:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

El mismo archivo también lo sirve en vivo la propia cadena, por lo que puedes verificar la descarga cruzándola con él:

```bash
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Este archivo define el estado inicial de la mainnet Vladi, incluyendo el conjunto de validadores del genesis, las asignaciones de tokens (TGE en el genesis) y los parámetros de los módulos.

---

## Configurar los peers

Edita la configuración de tu nodo para conectarte a los nodos sentry públicos de mainnet. Lee las listas actuales de peers y seeds desde el manifiesto en lugar de fijar IDs de nodo y hosts: estos rotan:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Abre `~/.qorechaind/config/config.toml` y establece los campos `persistent_peers` (y `seeds`) con esos valores:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Establece también el precio mínimo de gas en `~/.qorechaind/config/app.toml` (el piso de la tarifa de red es **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### Ajustes recomendados

También puedes querer ajustar lo siguiente en `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Estos valores están ajustados para los tiempos de bloque y el throughput de la mainnet Vladi.

---

## Arranque rápido (snapshot o state sync)

Sincronizar desde el genesis puede tardar mucho tiempo. El campo `stateSync` del manifiesto lleva un par de altura/hash de confianza actualizado cada hora; úsalo para configurar el state sync en lugar de buscar una altura manualmente:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Luego establece la sección `[statesync]` de `config.toml` con esos valores; consulta [Ejecutar un nodo](/developer-guide/running-a-node) para ver el flujo completo, incluyendo un método manual basado en RPC como alternativa si necesitas derivar tú mismo un punto de confianza.

También se publica un snapshot de los datos de la cadena en [download.qore.host](https://download.qore.host). Consulta el listado actual allí para obtener el nombre de archivo del snapshot más reciente y su checksum publicado; no fijes un nombre de archivo o una altura, ya que un nuevo snapshot sustituye al anterior de forma periódica:

```bash
# Substitute the current filename and checksum from the download.qore.host listing
curl -fsSL https://download.qore.host/<current-snapshot-filename>.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz   # compare against the checksum published alongside it

tar xzf snapshot.tar.gz -C ~/.qorechaind/
```

---

## Iniciar el nodo

Lanza tu nodo para empezar a sincronizar con la red:

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

El nodo se conecta a los peers y empieza a descargar bloques (desde el genesis, o desde la altura del snapshot si restauraste uno).

---

## Comprobar el estado de sincronización

Verifica que tu nodo está poniéndose al día con el último bloque:

```bash
curl localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — El nodo todavía está sincronizando. Espera a que se ponga al día.
* `false` — El nodo está completamente sincronizado y procesando bloques nuevos.

También puedes comprobar la altura del último bloque:

```bash
curl localhost:26657/status | jq '.result.sync_info.latest_block_height'
```

Confirma que estás en la red correcta: el campo `network` debe indicar `qorechain-vladi`:

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

Estas métricas pueden ser recolectadas por cualquier colector compatible con Prometheus.

### Paneles de Grafana

Si lo ejecutas mediante Docker Compose, Grafana está disponible en:

```
http://localhost:3001
```

En el primer inicio de sesión, establece tus propias credenciales cuando se te solicite; no dejes las credenciales por defecto. Los paneles preconfigurados muestran la producción de bloques, el throughput de transacciones, las conexiones de peers y el uso de recursos.

### Comprobación de salud REST

La API REST ofrece un endpoint de estado rápido:

```
http://localhost:1317
```

---

## Referencia de puertos

| Puerto  | Protocolo | Descripción                                              |
| ------- | --------- | ------------------------------------------------------- |
| `26657` | TCP       | RPC — consultar y difundir transacciones                 |
| `26656` | TCP       | P2P — comunicación de red entre pares                    |
| `1317`  | HTTP      | API REST — consultar el estado de la cadena vía HTTP      |
| `9090`  | gRPC      | API gRPC — acceso programático a la cadena                |
| `8545`  | HTTP      | JSON-RPC EVM — RPC compatible con Ethereum (chain ID `9801`) |
| `8546`  | WebSocket | WebSocket EVM — suscripciones a eventos EVM en tiempo real |
| `8899`  | HTTP      | RPC SVM — RPC compatible con Solana                       |
| `26660` | HTTP      | Endpoint de métricas de Prometheus                        |

---

## Datos de la red

| Campo                | Valor                                  |
| --------------------- | --------------------------------------- |
| Chain ID              | `qorechain-vladi`                       |
| Chain ID EVM           | `9801` (hex `0x2649`)                   |
| Versión de cadena     | v3.1.92                                 |
| Activa desde          | 7 de junio de 2026 23:59 UTC            |
| Token                  | QOR (`uqor`, 10^6 micro-unidades = 1 QOR) |
| Precio mínimo de gas  | `0.1uqor`                               |
| Prefijo de cuenta     | `qor`                                   |
| Prefijo de validador  | `qorvaloper`                            |
| SDK                    | Cosmos SDK v0.53                        |

---

## Próximos pasos

* [Ejecutar un nodo](/developer-guide/running-a-node) — Operar un nodo completo/RPC para exchanges e integradores
* [Guía para exchanges e integradores](/developer-guide/exchange-integration) — Depósitos, retiros y monitorización
* [Ejecutar un validador](/developer-guide/running-a-validator) — Crear y operar un validador
* [Configuración de la wallet](/getting-started/wallet-setup) — Configurar una wallet para mainnet
* [Tu primera transacción](/getting-started/first-transaction) — Envía tu primera transferencia de QOR
* [Conexión a la Testnet](/getting-started/connecting-to-testnet) — Únete a la testnet Diana para pruebas gratuitas
* [Redes](/appendix/networks) — Chain IDs, puertos y la referencia completa de redes
