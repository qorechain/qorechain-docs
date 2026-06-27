---
slug: /getting-started/connecting-to-testnet
title: Conexión a la red de pruebas
sidebar_label: Conexión a la red de pruebas
sidebar_position: 4
---

# Conexión a la red de pruebas

Únete a la red de pruebas activa QoreChain Diana configurando tu nodo con el archivo génesis, los pares y la configuración de red correctos.

:::note
Esta página cubre la red de pruebas **`qorechain-diana`** (ID de cadena EVM **9800**). La red principal (**`qorechain-vladi`**, ID de cadena EVM **9801**) está activa desde el 7 de junio de 2026 y tiene su propia página dedicada **Conexión a la red principal** con génesis, pares y detalles de conexión independientes.
:::

---

## Descargar el génesis

Reemplaza tu archivo génesis local por el génesis oficial de la red de pruebas:

```bash
curl -o ~/.qorechaind/config/genesis.json \
  https://raw.githubusercontent.com/qorechain/qorechain-core/main/config/genesis.json
```

Este archivo define el estado inicial de la red de pruebas Diana, incluido el conjunto de validadores, las asignaciones de tokens y los parámetros de los módulos.

---

## Configurar los pares

Edita la configuración de tu nodo para conectarte a los pares existentes de la red de pruebas.

Abre `~/.qorechaind/config/config.toml` y configura el campo `persistent_peers`:

```toml
persistent_peers = "node-id@seed1.qorechain.io:26656,node-id@seed2.qorechain.io:26656"
```

Consulta el [repositorio de QoreChain](https://github.com/qorechain/qorechain-core) para obtener la lista de pares más reciente.

### Ajustes recomendados

Es posible que también quieras ajustar lo siguiente en `config.toml`:

```toml
[mempool]
size = 5000

[consensus]
timeout_propose = "3s"
timeout_commit = "5s"
```

Estos valores están ajustados para los tiempos de bloque y el rendimiento de la red de pruebas Diana.

---

## Iniciar el nodo

Lanza tu nodo para empezar a sincronizar con la red:

```bash
./qorechaind start
```

El nodo se conecta a los pares y comienza a descargar bloques desde el génesis. El tiempo de sincronización inicial depende de la altura actual de la cadena y de la velocidad de tu red.

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

| Puerto    | Protocolo  | Descripción                                        |
| ------- | --------- | -------------------------------------------------- |
| `26657` | TCP       | RPC — consultar y difundir transacciones             |
| `26656` | TCP       | P2P — comunicación de red entre pares           |
| `1317`  | HTTP      | API REST — consultar el estado de la cadena vía HTTP              |
| `9090`  | gRPC      | API gRPC — acceso programático a la cadena               |
| `8545`  | HTTP      | JSON-RPC de EVM — RPC compatible con Ethereum (ID de cadena `9800`) |
| `8546`  | WebSocket | WebSocket de EVM — suscripciones a eventos EVM en tiempo real  |
| `8899`  | HTTP      | RPC de SVM — RPC compatible con Solana                    |
| `26660` | HTTP      | Endpoint de métricas de Prometheus                        |

---

## Próximos pasos

* [Configuración de la cartera](/getting-started/wallet-setup) — Configura una cartera para la red de pruebas
* [Tu primera transacción](/getting-started/first-transaction) — Envía tu primera transferencia de QOR
