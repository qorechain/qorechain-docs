---
slug: /getting-started/connecting-to-testnet
title: Conexión a la red de pruebas
sidebar_label: Conexión a la red de pruebas
sidebar_position: 4
---

# Conexión a la red de pruebas

Únete a la red de pruebas activa QoreChain Diana configurando tu nodo con el archivo génesis, los pares y la configuración de red correctos.

:::note
Esta página cubre la red de pruebas **`qorechain-diana`** (ID de cadena EVM **9800**). La red principal (**`qorechain-vladi`**, ID de cadena EVM **9801**) está activa desde el 7 de junio de 2026 (versión **v3.2.4** desde el 23 de octubre de 2026) y tiene su propia página dedicada **Conexión a la red principal** con génesis, pares y detalles de conexión independientes. La red de pruebas ejecuta la versión **v3.2.6** (aplicada el 27 de octubre de 2026); su manifiesto de versión está en [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json).
:::

## Endpoints públicos

Si solo necesitas **consultar la red de pruebas o difundir transacciones**, utiliza los endpoints públicos:

| Servicio | URL |
|---|---|
| RPC de consenso | `https://rpc-testnet.qore.host` (WebSocket: `wss://rpc-testnet.qore.host/websocket`) |
| Cosmos REST (LCD) | `https://api-testnet.qore.host` |
| JSON-RPC de EVM | `https://evm-testnet.qore.host` (ID de cadena `9800`) |
| WebSocket de EVM | `wss://evm-ws-testnet.qore.host` |
| JSON-RPC de SVM (solo lectura) | `https://svm-testnet.qore.host` |
| Explorador de bloques | [explore.qore.network](https://explore.qore.network) (cambia a Testnet) |

El QOR de la red de pruebas está disponible en el [faucet del panel de control](/dashboard/faucet), que también puede enviar los [tokens de prueba Fest](/dashboard/faucet#fest-tokens) exclusivos de la red de pruebas (fUSD, fETH, fBTC; sin valor).

---

## Instalación

La fuente de verdad canónica para el binario actual de la red de pruebas, el génesis, los pares y el punto de confianza del state sync es el **manifiesto de la red de pruebas**, actualizado en vivo en `https://download.qore.host/testnet/latest.json`. Tiene el mismo formato que el manifiesto de la red principal, por lo que los pasos de instalación son los mismos — descárgalo y usa sus valores en lugar de fijar una versión o un checksum en el código:

```bash
curl -s https://download.qore.host/testnet/latest.json -o latest.json
jq -r '.version, .minCompatible, .upgradeHeight' latest.json

BINARY_URL=$(jq -r .binary.url latest.json)
BINARY_SHA256=$(jq -r .binary.sha256 latest.json)

curl -fsSL "$BINARY_URL" -o qore.tgz
echo "${BINARY_SHA256}  qore.tgz" | sha256sum -c -

tar xzf qore.tgz
sudo install -m0755 qorechaind /usr/local/bin/
sudo mkdir -p /opt/qorechain/lib && sudo cp lib/*.so /opt/qorechain/lib/
export LD_LIBRARY_PATH=/opt/qorechain/lib

qorechaind init my-node --chain-id qorechain-diana
```

La red de pruebas recibe actualizaciones coordinadas mediante propuestas de gobernanza, por lo que su manifiesto incluye un `upgradeHeight` y `minCompatible` es igual a la versión actual. Un nodo que se une ahora necesita la versión indicada en el manifiesto. En el momento de escribir esto (27 de octubre de 2026) el manifiesto de la red de pruebas indica `version` 3.2.6, `minCompatible` 3.2.6 y `upgradeHeight` 8970638, y su nota dice "IBC v2 light client routes, AMM pools and RL consensus agent fixes, fest test tokens". Mantén el reloj del sistema sincronizado por NTP.

| Versión | Altura en la red de pruebas | Fecha de aplicación |
| --- | --- | --- |
| v3.2.2 | 6,905,034 | 2 de octubre de 2026 |
| v3.2.3 | 8,003,746 | 15 de octubre de 2026 |
| v3.2.4 | 8,337,253 | 19 de octubre de 2026 |
| v3.2.5 | 8,890,800 | 26 de octubre de 2026 |
| v3.2.6 | 8,970,638 | 27 de octubre de 2026 (16:58 UTC) |

La red de pruebas recibe cada versión antes que la red principal. La red principal aplicó v3.2.4 en la altura 3,742,566 el 23 de octubre de 2026; la propuesta de gobernanza 14 de la red principal aplicaría v3.2.5 en la altura 3,906,833 y estaba en su período de votación en el momento de escribir esto. Los manifiestos son independientes, así que nunca copies un binario de una red a la otra, y no esperes que la red principal acepte una función exclusiva de la red de pruebas (las novedades de v3.2.6 se enumeran en el [Historial de versiones](/appendix/version-history#testnet-v326)).

---

## Descargar el génesis

Reemplaza tu archivo génesis local por el génesis oficial de la red de pruebas, usando la URL y el SHA-256 del manifiesto obtenido arriba:

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -
```

El mismo archivo también lo sirve en vivo la propia cadena:

```bash
curl -s https://rpc-testnet.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

Este archivo define el estado inicial de la red de pruebas Diana, incluido el conjunto de validadores, las asignaciones de tokens y los parámetros de los módulos.

:::note La red de pruebas se actualiza en su lugar
Diana funciona de forma continua desde el 1 de julio de 2026 y se actualiza mediante propuestas de gobernanza, igual que la red principal. La red de pruebas es una red de staging y puede reiniciarse sin previo aviso: si tu nodo deja de sincronizar, revisa el manifiesto y los anuncios de Discord, luego vuelve a descargar el génesis y empieza desde un directorio de datos limpio. El sentry público conserva solo los bloques recientes, por lo que un nodo nuevo debería usar state sync (abajo) en lugar de reproducir desde el génesis.
:::

---

## Configurar los pares

Lee las listas actuales de pares y seeds desde el manifiesto en lugar de fijar en el código los ID de nodo y los hosts:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Abre `~/.qorechaind/config/config.toml` y asigna a los campos `persistent_peers` (y `seeds`) esos valores:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Configura también el precio mínimo de gas en `~/.qorechaind/config/app.toml` (la red de pruebas usa el mismo mínimo de **0.1uqor** que la red principal):

```toml
minimum-gas-prices = "0.1uqor"
```

### Ajustes recomendados

Un nodo completo no elige el tiempo de bloque — lo eligen los validadores (la red de pruebas produce actualmente un bloque aproximadamente cada 1,3 segundos). Deja los timeouts de consenso en sus valores predeterminados, a menos que operes un validador y el grupo de validadores te haya dado valores. Un ajuste útil de mempool para un nodo RPC público, en `config.toml`:

```toml
[mempool]
size = 5000
```

---

## Arranque rápido (state sync)

El campo `stateSync` del manifiesto contiene un par de altura/hash de confianza que se actualiza con regularidad:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

Configura la sección `[statesync]` de `config.toml` con esos valores y los `rpcServers` del manifiesto — consulta [Ejecutar un nodo](/developer-guide/running-a-node) para ver el flujo completo.

---

## Iniciar el nodo

Lanza tu nodo para empezar a sincronizar con la red:

```bash
./qorechaind start
```

El nodo se conecta a los pares y comienza a descargar bloques (desde el génesis, o desde la altura de confianza si usas state sync). El tiempo de sincronización inicial depende de la altura actual de la cadena y de la velocidad de tu red.

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

| Puerto  | Protocolo | Descripción                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — consultar y difundir transacciones           |
| `26656` | TCP       | P2P — comunicación de red entre pares              |
| `1317`  | HTTP      | API REST — consultar el estado de la cadena vía HTTP |
| `9090`  | gRPC      | API gRPC — acceso programático a la cadena         |
| `8545`  | HTTP      | JSON-RPC de EVM — RPC compatible con Ethereum (ID de cadena `9800`) |
| `8546`  | WebSocket | WebSocket de EVM — suscripciones a eventos EVM en tiempo real |
| `8899`  | HTTP      | RPC de SVM — RPC compatible con Solana (solo lectura; el carril de transacciones SVM está deshabilitado) |
| `26660` | HTTP      | Endpoint de métricas de Prometheus                 |

---

## Próximos pasos

* [Configuración de la cartera](/getting-started/wallet-setup) — Configura una cartera para la red de pruebas
* [Tu primera transacción](/getting-started/first-transaction) — Envía tu primera transferencia de QOR
