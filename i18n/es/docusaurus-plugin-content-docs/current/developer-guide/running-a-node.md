---
slug: /developer-guide/running-a-node
title: Ejecutar un nodo
sidebar_label: Ejecutar un nodo
sidebar_position: 10
---

# Ejecutar un nodo

Esta guía cubre la ejecución de un despliegue de QoreChain de **solo nodo** — un nodo completo o RPC que sincroniza la cadena y expone endpoints para integración, **sin** funciones de validador. Está dirigida a exchanges (CEX), backends de wallets, indexadores e integradores que necesitan acceso fiable de lectura/escritura a la red pero no firman bloques.

:::note
Para la producción de bloques, staking, slashing y clasificación de pools, consulta en su lugar [Ejecutar un validador](/developer-guide/running-a-validator). Un despliegue de solo nodo nunca posee una clave de consenso de validador y nunca aparece en el conjunto activo.
:::

:::warning
Los binarios, el génesis y los snapshots se publican en [download.qore.host](https://download.qore.host) con checksums SHA-256. **Verifica siempre los checksums antes de instalar o extraer**, y verifica los depósitos únicamente contra tu propio nodo sincronizado.
:::

---

## Nodo vs Validador

| Aspecto               | Solo nodo (esta guía)                              | Validador                                     |
| --------------------- | -------------------------------------------------- | --------------------------------------------- |
| Clave de consenso     | Ninguna                                            | Clave de consenso ed25519 (debe protegerse)   |
| Producción de bloques | No                                                 | Sí — propone y firma bloques                  |
| Staking / slashing    | No aplica                                          | Autodelegación, riesgo de slashing            |
| Propósito principal   | Servir RPC/REST/gRPC/EVM/SVM a las integraciones   | Asegurar la red, obtener recompensas          |
| Exposición pública    | Endpoints RPC/EVM normalmente expuestos            | Validador oculto detrás de nodos centinela    |

---

## Redes objetivo

| Red      | Chain ID            | EVM chain ID          | Notas                              |
| -------- | ------------------- | --------------------- | ---------------------------------- |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principal — activa desde el 7 de junio de 2026 |
| Testnet  | `qorechain-diana`   | `9800`                | Ensaya aquí primero tus integraciones |

Sustituye el `--chain-id` apropiado para tu red objetivo a lo largo de esta guía. Los ejemplos usan mainnet por defecto.

---

## Hardware recomendado

| Perfil                     | CPU       | RAM   | Disco (SSD NVMe)               | Red       |
| -------------------------- | --------- | ----- | ------------------------------ | --------- |
| Nodo RPC con pruning       | 4 núcleos | 16 GB | 500 GB+                        | 100 Mbps+ |
| Nodo completo/de archivo   | 8 núcleos | 32 GB | 2 TB+ (crece con el tiempo)    | 1 Gbps    |
| Integración de exchange    | 8 núcleos | 32 GB | 2 TB+ con margen               | 1 Gbps    |

Se recomienda encarecidamente SSD NVMe — el estado de la cadena y los almacenes EVM/SVM son intensivos en E/S. Los nodos de archivo (sin pruning, indexación completa de tx) crecen continuamente; aprovisiona disco con margen y monitorización.

---

## Despliegue

### Docker Compose

Un despliegue de solo nodo con Docker Compose. Fija la etiqueta de la imagen a la versión activa de la cadena (**v3.1.85** en mainnet) y monta un volumen persistente para los datos de la cadena.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain/qorechaind:v3.1.85
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

Inicializa el directorio de datos una sola vez (el génesis y la configuración de peers se cubren más abajo) y luego arranca:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Para una instalación en bare metal, ejecuta `qorechaind` bajo systemd:

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

### 2. Descargar y verificar el génesis

```bash
curl -fsSL https://download.qore.host/genesis.json -o ~/.qorechaind/config/genesis.json

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 3. Configurar los peers y el suelo de comisiones

Abre `~/.qorechaind/config/config.toml` y establece los peers centinela públicos de mainnet:

```toml
persistent_peers = "0c9b83801ad519671daf19387b6635f72cb9ddd3@44.200.237.4:26656,83cab9ae05d17073c4e45c25d2422b25fff71fe7@35.174.136.254:26656"
```

Después establece el precio mínimo de gas en `~/.qorechaind/config/app.toml` (suelo de comisiones de la red: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

### 4. Comenzar la sincronización

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Arranque rápido

Sincronizar desde el génesis puede llevar mucho tiempo. Para integraciones, usa **state sync** o un **snapshot** para un arranque en frío rápido.

### State sync

State sync obtiene un snapshot reciente del estado de la aplicación desde servidores RPC de confianza en lugar de reproducir cada bloque. Configura la sección `[statesync]` en `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://rpc.qore.host:443"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Determina una altura y un hash de confianza recientes desde el RPC público:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Restauración desde snapshot

Alternativamente, descarga el snapshot publicado de los datos de la cadena, verifica su checksum y extráelo sobre tu directorio de datos:

```bash
curl -fsSL https://download.qore.host/qore-vladi-snapshot-90833.tar.gz -o snapshot.tar.gz
sha256sum snapshot.tar.gz
# ebe469796ad96e692877846c7bfd8513d773321c77e415b1358790b7c4e53396

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Los snapshots se publican con **nombres de archivo que incluyen la altura** — consulta [download.qore.host](https://download.qore.host) para obtener el snapshot más reciente y su checksum SHA-256, y verifica siempre antes de extraer.
:::

---

## Pruning e indexación

Ajusta el pruning y la indexación de transacciones según tu integración. Los exchanges que necesitan el historial completo de transacciones deben ejecutar con pruning mínimo y un indexador de transacciones habilitado.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportamiento                                    | Caso de uso                            |
| ----------- | ------------------------------------------------- | -------------------------------------- |
| `default`   | Mantiene el estado reciente, poda el resto        | Nodo RPC, consultas de saldo/estado    |
| `nothing`   | Mantiene todo el estado histórico                 | Nodo de archivo, historial completo    |
| `custom`    | Valores de retención/intervalo definidos por el operador | Retención ajustada              |

### Indexación de transacciones (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Establece `indexer = "kv"` (o un indexador más rico) para que las transacciones se puedan consultar por hash y por evento — esencial para exchanges que concilian depósitos y retiros. Establece `indexer = "null"` solo si no necesitas consultas históricas de tx.

---

## Exponer endpoints para integración

Habilita y vincula en `app.toml` los servidores de API que necesitan los integradores:

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

Y el listener RPC en `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpoint     | Puerto  | Uso                                                        |
| ------------ | ------- | ---------------------------------------------------------- |
| RPC          | `26657` | Difusión de transacciones, consulta de bloques/estado      |
| REST         | `1317`  | Consultas HTTP del estado de la cadena                     |
| gRPC         | `9090`  | Acceso programático de alto rendimiento                    |
| EVM JSON-RPC | `8545`  | Integraciones compatibles con Ethereum (chain ID `9801`)   |
| EVM WS       | `8546`  | Suscripciones a eventos EVM                                |
| SVM RPC      | `8899`  | Integraciones compatibles con Solana                       |

:::warning
Nunca expongas RPC, EVM JSON-RPC ni gRPC directamente a la internet pública sin un proxy inverso, limitación de tasa, autenticación y un firewall. Vincula a `0.0.0.0` solo detrás de una capa de ingreso controlada.
:::

---

## Salud y monitorización de la sincronización

### Estado de sincronización

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — todavía sincronizando.
* `false` — completamente sincronizado y sirviendo el estado actual.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

El campo `network` debe reportar `qorechain-vladi` (mainnet) o `qorechain-diana` (testnet).

### Prometheus y Grafana

QoreChain expone métricas de Prometheus en el puerto **26660**:

```
http://localhost:26660/metrics
```

Recolecta estas métricas con cualquier colector compatible con Prometheus. Si ejecutas el stack de monitorización de Docker Compose, Grafana está disponible en `http://localhost:3001` — establece tus propias credenciales en el primer inicio de sesión. Vigila el retraso en la altura de bloque, el número de peers y el uso de recursos; genera alertas cuando `catching_up` permanezca en `true` o el número de peers caiga a cero.

### Comprobación del endpoint EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Buenas prácticas operativas

1. **Fija la versión de la cadena.** Ejecuta la etiqueta activa (**v3.1.85** en mainnet) y sigue los lanzamientos oficiales para las actualizaciones coordinadas.

2. **Ejecuta nodos redundantes.** Opera al menos dos nodos detrás de un balanceador de carga para que un único reinicio o resincronización no interrumpa el tráfico de integración.

3. **Verifica el génesis y los snapshots.** Valida siempre el SHA-256 del génesis y el checksum de cualquier snapshot contra el lanzamiento oficial antes de arrancar.

4. **Protege los endpoints públicos.** Coloca RPC/EVM/gRPC detrás de un proxy inverso, limitación de tasa y un firewall. Nunca expongas a internet un RPC de escritura sin autenticación.

5. **Ajusta el pruning a la necesidad.** Usa `pruning = "nothing"` junto con `tx_index = "kv"` para exchanges que concilian el historial completo de depósitos/retiros; usa `default` para consultas ligeras.

6. **Monitoriza la sincronización de forma continua.** Genera alertas por retraso en la altura de bloque, cero peers y un nodo atascado en `catching_up`.

Para acceso de lectura ultraligero sin ejecutar un nodo completo, consulta la documentación de **Light Node**.

---

## Próximos pasos

* [Conectarse a Mainnet](/getting-started/connecting-to-mainnet) — Génesis de mainnet, peers y detalles de conexión
* [Ejecutar un validador](/developer-guide/running-a-validator) — Añade funciones de producción de bloques
* [Compilar desde el código fuente](/developer-guide/building-from-source) — Compila el binario `qorechaind`
* **Light Node** — Acceso de solo lectura ultraligero (documentación próximamente)
