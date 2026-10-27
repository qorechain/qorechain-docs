---
slug: /getting-started/connecting-to-mainnet
title: Conexión a la Mainnet
sidebar_label: Conexión a la Mainnet
sidebar_position: 3
---

# Conexión a la Mainnet

Únete a la mainnet activa de QoreChain Vladi configurando tu nodo con el archivo genesis oficial, los peers y los ajustes de red.

:::note
Esta página cubre la mainnet **`qorechain-vladi`** (chain ID EVM **9801**, hex `0x2649`), activa desde el **7 de junio de 2026** y ejecutando la versión **v3.2.4** sobre Cosmos SDK v0.53 desde el **23 de octubre de 2026** (aplicada en la altura **3,742,566** por la propuesta de gobernanza 13). Para la testnet **`qorechain-diana`** (chain ID EVM **9800**), consulta [Conexión a la Testnet](/getting-started/connecting-to-testnet) y ensaya allí tu configuración antes de pasar a producción.
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

:::caution Mantén tu nodo actualizado — v3.2.3 y después v3.2.4
Los nodos completos deben seguir la versión activa de la red: instala siempre el binario que indica el manifiesto, no fijes uno antiguo. El manifiesto actual es **v3.2.4** con `minCompatible` **3.2.4** y `upgradeHeight` **3,742,566**: la mainnet aplicó v3.2.4 en esa altura el 23 de octubre de 2026 mediante la propuesta de gobernanza 13, y un nodo que siga en una versión anterior no puede seguir la cadena más allá de esa altura. Las actualizaciones de gobernanza anteriores en la mainnet fueron **v3.1.94** en la altura 2,122,074 (el tope de emisión), **v3.2.0** en la altura 2,981,742 (la ventana de autorización EVM y los bytes de firma híbrida v2), **v3.2.2** en la altura 3,556,788 (16 de octubre de 2026, propuesta 7) y **v3.2.3** en la altura 3,662,051 (20 de octubre de 2026, propuesta 11). v3.2.1 fue una versión local del nodo sin altura. La firma de transacciones no cambia en v3.2.4. Un nodo que se une desde cero necesita el binario v3.2.4 que indica el manifiesto; prefiere el state sync (más abajo) a reproducir desde el genesis. El snapshot de datos de la cadena publicado es anterior a todas estas alturas de actualización, así que un nodo restaurado a partir de él debe reproducirlas.

Establece `evm-chain-id = 9801` en `app.toml` (un valor distinto se registra como error) y mantén el reloj del sistema sincronizado por NTP: un nodo se detiene si su reloj se desvía más de 60 segundos. Comprueba siempre los campos `"version"` y `"minCompatible"` del manifiesto antes de confiar en `binary.url`: el manifiesto se promueve de forma deliberada (primero en testnet, en mainnet después de un período de estabilización). El formato de firma, las direcciones, los decimales, los memos y las comisiones no cambiaron en v3.2.3 ni en v3.2.4.

La testnet (`qorechain-diana`) ejecuta v3.2.6 (la v3.2.5 se aplicó allí el 26 de octubre de 2026 y la v3.2.6 el 27 de octubre de 2026). Nunca copies un binario de una red a la otra: sigue siempre el manifiesto de la red que ejecutas.
:::

Cuando se programa una actualización coordinada, el texto de la propuesta indica la altura y te dice que permanezcas en la versión anterior hasta entonces: el nodo se detiene en esa altura y lo reinicias con el nuevo binario. Lee el `status` de la propuesta (`curl -s https://api.qore.host/cosmos/gov/v1/proposals/<id>`) y los campos `version` y `upgradeHeight` del [manifiesto de mainnet](https://download.qore.host/mainnet/latest.json) antes de cambiar cualquier binario, y no instales nunca un binario de actualización antes de su altura: un nodo que lo lleve antes también se detiene. En el momento de escribir esto (27 de octubre de 2026) todavía no hay ningún plan de actualización establecido (`curl -s https://api.qore.host/cosmos/upgrade/v1beta1/current_plan` devuelve `"plan": null`), pero la propuesta de gobernanza 14 está en su periodo de votación (la votación termina el 28 de octubre de 2026 a las 00:29 UTC). Aplicaría la **v3.2.5 (build 2)** en la altura **3,906,833**, que al ritmo de bloques actual es aproximadamente el 29 de octubre de 2026. Si se aprueba, permanece en la v3.2.4 hasta esa altura, detente allí y reinicia con el binario de la v3.2.5 que indique el manifiesto de la mainnet; no lo instales antes. Lo que contiene la v3.2.5 se documenta el día en que la mainnet la aplique.

### Compilar desde el código fuente (solo desarrollo)

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Esto compila el binario de la comunidad con keepers stub y sin firmante poscuántico, que no puede reproducir el estado de consenso de las redes ni crear transacciones con firma híbrida. Para ejecutar un nodo en mainnet, instala el binario de la versión indicado arriba. Consulta [Compilación desde el código fuente](/developer-guide/building-from-source) para ver todos los requisitos previos (Go 1.26+, CGO, bibliotecas nativas).

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

Un nodo completo no elige el tiempo de bloque: lo eligen los validadores (la mainnet produce actualmente un bloque cada 3,1 segundos aproximadamente). Deja los timeouts de consenso en sus valores por defecto, a menos que operes un validador y el grupo de validadores te haya dado valores. Un ajuste útil de mempool para un nodo RPC público, en `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Arranque rápido (snapshot o state sync)

Sincronizar desde el genesis puede tardar mucho tiempo. El campo `stateSync` del manifiesto lleva un par de altura/hash de confianza actualizado cada hora; úsalo para configurar el state sync en lugar de buscar una altura manualmente:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Luego establece la sección `[statesync]` de `config.toml` con esos valores; consulta [Ejecutar un nodo](/developer-guide/running-a-node) para ver el flujo completo, incluyendo un método manual basado en RPC como alternativa si necesitas derivar tú mismo un punto de confianza.

El manifiesto también incluye un snapshot de los datos de la cadena (`snapshot.url`, `snapshot.sha256`, `snapshot.height`). Lee los valores del manifiesto en lugar de fijar un nombre de archivo o una altura, ya que un nuevo snapshot sustituye al anterior. El snapshot es grande (decenas de gigabytes) y, tal como se publicó en octubre de 2026, se tomó en la altura 1,966,629 (21 de agosto de 2026), antes de todas las alturas de actualización indicadas arriba, por lo que un nodo restaurado a partir de él debe reproducir esas actualizaciones; el state sync suele ser más rápido y lo evita:

```bash
SNAPSHOT_URL=$(jq -r .snapshot.url latest.json)
SNAPSHOT_SHA256=$(jq -r .snapshot.sha256 latest.json)

curl -fsSL "$SNAPSHOT_URL" -o snapshot.tar.gz
echo "${SNAPSHOT_SHA256}  snapshot.tar.gz" | sha256sum -c -

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
| `8899`  | HTTP      | RPC SVM — RPC compatible con Solana (solo lectura; el carril de transacciones SVM está deshabilitado) |
| `26660` | HTTP      | Endpoint de métricas de Prometheus                        |

---

## Datos de la red

| Campo                | Valor                                  |
| --------------------- | --------------------------------------- |
| Chain ID              | `qorechain-vladi`                       |
| Chain ID EVM           | `9801` (hex `0x2649`)                   |
| Versión de cadena     | v3.2.4 (aplicada en la altura 3,742,566 el 23 de octubre de 2026) |
| Activa desde          | 7 de junio de 2026                      |
| Tiempo de bloque      | unos 3,1 segundos (promedio medido)     |
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
