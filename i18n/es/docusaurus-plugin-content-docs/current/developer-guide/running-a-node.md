---
slug: /developer-guide/running-a-node
title: Ejecutar un nodo
sidebar_label: Ejecutar un nodo
sidebar_position: 10
---

# Ejecutar un nodo

Esta guía cubre la ejecución de un despliegue de QoreChain **solo de nodo** —un nodo completo o RPC que sincroniza la cadena y expone endpoints para integración, **sin** tareas de validador—. Está dirigida a exchanges (CEX), backends de carteras, indexadores e integradores que necesitan acceso fiable de lectura/escritura a la red pero no firman bloques.

:::note
Para la producción de bloques, el staking, el slashing y la clasificación de pools, consulta [Ejecutar un validador](/developer-guide/running-a-validator) en su lugar. Un despliegue solo de nodo nunca posee una clave de consenso de validador y nunca aparece en el conjunto activo.
:::

:::warning
Los nodos semilla de mainnet, los peers persistentes, la URL/checksum del genesis y los endpoints RPC de snapshot/state-sync se publican con cada versión oficial de mainnet. **Obtén estos valores actuales del repositorio/release oficial de mainnet** y verifica el checksum del genesis antes de empezar. Los marcadores de posición de abajo (`<MAINNET_SEED_NODE_ID>@<host>:26656`, `<MAINNET_GENESIS_URL>`, URLs de snapshot/state-sync) deben sustituirse por los valores reales publicados.
:::

---

## Nodo frente a validador

| Aspecto              | Solo nodo (esta guía)                          | Validador                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| Clave de consenso       | Ninguna                                            | Clave de consenso ed25519 (debe protegerse)    |
| Producción de bloques    | No                                              | Sí — propone y firma bloques            |
| Staking / slashing  | No aplica                                  | Autodelegación, riesgo de slashing             |
| Propósito principal     | Servir RPC/REST/gRPC/EVM/SVM a las integraciones     | Asegurar la red, ganar recompensas           |
| Exposición pública     | Endpoints RPC/EVM normalmente expuestos             | Validador oculto tras nodos centinela       |

---

## Redes de destino

| Red  | Chain ID            | EVM chain ID         | Notas                          |
| -------- | ------------------- | -------------------- | ------------------------------ |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principal — activa desde el 7 jun 2026 |
| Testnet  | `qorechain-diana`   | `9800`               | Ensaya aquí las integraciones primero |

Sustituye el `--chain-id` apropiado para tu red de destino a lo largo de esta guía. Los ejemplos usan mainnet por defecto.

---

## Hardware recomendado

| Perfil                  | CPU      | RAM   | Disco (SSD NVMe)         | Red   |
| ------------------------ | -------- | ----- | ----------------------- | --------- |
| Nodo RPC con poda          | 4 núcleos  | 16 GB | 500 GB+                 | 100 Mbps+ |
| Nodo completo/de archivo        | 8 núcleos  | 32 GB | 2 TB+ (crece con el tiempo) | 1 Gbps    |
| Integración de exchange     | 8 núcleos  | 32 GB | 2 TB+ con margen     | 1 Gbps    |

Se recomienda encarecidamente un SSD NVMe: el estado de la cadena y los almacenes EVM/SVM hacen un uso intensivo de E/S. Los nodos de archivo (sin poda, con indexación completa de transacciones) crecen continuamente; aprovisiona disco con margen y con monitorización.

---

## Despliegue

### Docker Compose

Un despliegue solo de nodo con Docker Compose. Fija la etiqueta de imagen a la versión de cadena activa (**v3.1.77** en mainnet) y monta un volumen persistente para los datos de la cadena.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.77
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Inicializa el directorio de datos una vez (el genesis y la configuración de peers se cubren más abajo) y luego inicia:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Para una instalación bare-metal, ejecuta `qorechaind` bajo systemd:

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## Unirse a la red

### 1. Inicializar

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Descargar y verificar el genesis

```bash
curl -o ~/.qorechaind/config/genesis.json <MAINNET_GENESIS_URL>
sha256sum ~/.qorechaind/config/genesis.json
# Compare against <MAINNET_GENESIS_SHA256> from the official release
```

:::note
`<MAINNET_GENESIS_URL>` y `<MAINNET_GENESIS_SHA256>` son marcadores de posición: obtén la URL del genesis y el checksum actuales del release/repositorio oficial de mainnet y verifica el checksum antes de empezar.
:::

### 3. Configurar semillas y peers

Abre `~/.qorechaind/config/config.toml`:

```toml
seeds = "<MAINNET_SEED_NODE_ID>@<host>:26656"
persistent_peers = "<PEER_NODE_ID_1>@<host1>:26656,<PEER_NODE_ID_2>@<host2>:26656"
```

:::note
Los valores de semillas y peers son marcadores de posición. Obtén las semillas y los peers persistentes actuales de mainnet del repositorio/release oficial de mainnet.
:::

### 4. Empezar a sincronizar

```bash
qorechaind start
```

---

## Arranque rápido

Sincronizar desde el genesis puede llevar mucho tiempo. Para las integraciones, usa **state sync** o un **snapshot** para un arranque en frío rápido.

### State sync

State sync obtiene un snapshot reciente del estado de la aplicación desde servidores RPC de confianza en lugar de reproducir cada bloque. Configura la sección `[statesync]` en `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "<STATESYNC_RPC_1>,<STATESYNC_RPC_2>"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Determina una altura y un hash de confianza recientes a partir de un endpoint RPC en buen estado:

```bash
curl -s <STATESYNC_RPC_1>/block | jq '.result.block.header.height, .result.block_id.hash'
```

:::note
`<STATESYNC_RPC_1>`, `<STATESYNC_RPC_2>`, `<TRUSTED_BLOCK_HEIGHT>` y `<TRUSTED_BLOCK_HASH>` son marcadores de posición. Usa los servidores RPC de state-sync publicados en el release oficial de mainnet, y deriva la altura/hash de confianza de un bloque reciente.
:::

### Restauración desde snapshot

Como alternativa, descarga un snapshot reciente de datos de la cadena y extráelo sobre tu directorio de datos:

```bash
curl -o snapshot.tar.lz4 <MAINNET_SNAPSHOT_URL>
lz4 -dc snapshot.tar.lz4 | tar -xf - -C ~/.qorechaind/
qorechaind start
```

:::note
`<MAINNET_SNAPSHOT_URL>` es un marcador de posición. Obtén las URLs de snapshot (y cualquier checksum complementario) del release/repositorio oficial de mainnet, y verifica el checksum antes de extraer.
:::

---

## Poda e indexación

Ajusta la poda y la indexación de transacciones para que coincidan con tu integración. Los exchanges que necesitan el historial completo de transacciones deberían ejecutarse con poda mínima y un indexador de transacciones habilitado.

### Poda (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportamiento                                | Caso de uso                          |
| ----------- | ---------------------------------------- | --------------------------------- |
| `default`   | Conserva el estado reciente, poda el resto      | Nodo RPC, consultas de saldo/estado   |
| `nothing`   | Conserva todo el estado histórico               | Nodo de archivo, historial completo        |
| `custom`    | Valores de conservación/intervalo definidos por el operador    | Retención ajustada                   |

### Indexación de transacciones (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Establece `indexer = "kv"` (o un indexador más rico) para que las transacciones puedan consultarse por hash y evento, esencial para exchanges que concilian depósitos y retiros. Establece `indexer = "null"` solo si no necesitas consultas históricas de transacciones.

---

## Exponer endpoints para integración

Habilita y vincula los servidores de API que los integradores necesitan en `app.toml`:

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,qor"
```

Y el listener de RPC en `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpoint     | Puerto   | Usar para                                                |
| ------------ | ------ | ------------------------------------------------------ |
| RPC          | `26657` | Difundir transacciones, consultar bloques/estado      |
| REST         | `1317`  | Consultas HTTP del estado de la cadena                            |
| gRPC         | `9090`  | Acceso programático de alto rendimiento                    |
| EVM JSON-RPC | `8545`  | Integraciones compatibles con Ethereum (chain ID `9801`)     |
| EVM WS       | `8546`  | Suscripciones a eventos EVM                                |
| SVM RPC      | `8899`  | Integraciones compatibles con Solana                         |

:::warning
Nunca expongas RPC, EVM JSON-RPC o gRPC directamente a la internet pública sin un proxy inverso, limitación de tasa, autenticación y un firewall. Vincula a `0.0.0.0` solo detrás de una capa de entrada controlada.
:::

---

## Monitorización de salud y sincronización

### Estado de sincronización

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — aún sincronizando.
* `false` — totalmente sincronizado y sirviendo el estado actual.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

El campo `network` debería informar de `qorechain-vladi` (mainnet) o `qorechain-diana` (testnet).

### Prometheus y Grafana

QoreChain expone métricas de Prometheus en el puerto **26660**:

```
http://localhost:26660/metrics
```

Recógelas con cualquier colector compatible con Prometheus. Si ejecutas la pila de monitorización de Docker Compose, Grafana está disponible en `http://localhost:3001`: establece tus propias credenciales en el primer inicio de sesión. Haz seguimiento del retraso de la altura de bloque, el recuento de peers y el uso de recursos; alerta cuando `catching_up` se mantenga en `true` o el recuento de peers caiga a cero.

### Comprobación del endpoint EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Buenas prácticas operativas

1. **Fija la versión de la cadena.** Ejecuta la etiqueta activa (**v3.1.77** en mainnet) y sigue los releases oficiales para actualizaciones coordinadas.

2. **Ejecuta nodos redundantes.** Opera al menos dos nodos detrás de un balanceador de carga para que un único reinicio o resincronización no interrumpa el tráfico de integración.

3. **Verifica el genesis y los snapshots.** Valida siempre el SHA-256 del genesis y cualquier checksum de snapshot frente al release oficial antes de empezar.

4. **Protege los endpoints públicos.** Pon RPC/EVM/gRPC detrás de un proxy inverso, limitación de tasa y un firewall. Nunca expongas RPC de escritura sin autenticar a internet.

5. **Ajusta la poda a la necesidad.** Usa `pruning = "nothing"` más `tx_index = "kv"` para exchanges que concilian el historial completo de depósitos/retiros; usa `default` para consultas ligeras.

6. **Monitoriza la sincronización continuamente.** Alerta sobre el retraso de la altura de bloque, cero peers y un nodo atascado en `catching_up`.

Para un acceso de lectura ultraligero sin ejecutar un nodo completo, consulta la documentación de **Nodo ligero**.

---

## Próximos pasos

* [Conectarse a mainnet](/getting-started/connecting-to-mainnet) — Genesis, peers y detalles de conexión de mainnet
* [Ejecutar un validador](/developer-guide/running-a-validator) — Añade tareas de producción de bloques
* [Compilar desde el código fuente](/developer-guide/building-from-source) — Compila el binario `qorechaind`
* **Nodo ligero** — Acceso de solo lectura ultraligero (documentación próximamente)
